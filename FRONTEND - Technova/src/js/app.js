/* ================================
   LOGIN & SESIÓN
================================ */
document.getElementById("login-form").addEventListener("submit", login);

async function login(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.status !== "ok") throw new Error(data.mensaje);

        sessionStorage.setItem("email", data.usuario.email);
        sessionStorage.setItem("password", password);// no recomendado en producción
        sessionStorage.setItem("rol", data.usuario.rol);

        actualizarUIUsuario(data.usuario.email, data.usuario.rol, data.usuario.password);

        const modalElement = document.getElementById('loginModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        console.log("Login correcto:", data);

    } catch (error) {
        document.getElementById("login-error").classList.remove("d-none");
    }
}

function actualizarUIUsuario(email, rol,password) {
    document.getElementById("btn-open-login").classList.add("d-none");
    document.getElementById("nav-user-zone").classList.remove("d-none");
    document.getElementById("nav-saludo").textContent = "Hola, " + email;

    if (rol === "ADMINISTRADOR") {
        document.getElementById("nav-admin-zone").classList.remove("d-none");
    }
}

document.getElementById("btn-logout").addEventListener("click", () => {
    sessionStorage.clear();
    location.reload();
});


/* ================================
   PRODUCTOS
================================ */
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();

    const email = sessionStorage.getItem("email");
    if (email) actualizarUIUsuario(email, sessionStorage.getItem("rol"));
});

async function cargarProductos() {
    try {
        const response = await fetch("http://localhost:8080/api/productos");
        const productos = await response.json();

        const container = document.getElementById("catalogo-container");
        container.innerHTML = "";

        productos.forEach(p => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";

            card.innerHTML = `
                <div class="card h-100 ${p.stock <= 0 ? 'producto-agotado' : ''}">
                    <img src="img/${p.imagen}" class="card-img-top" alt="${p.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text">${p.descripcion}</p>
                        <p class="fw-bold">${p.precio} €</p>
                        <p class="text-muted">Stock: ${p.stock}</p>

                        ${p.stock <= 0 ? '<span class="badge-sin-stock">AGOTADO</span>' : ''}

                        <button class="btn btn-primary mt-auto btn-add-cart"
                        data-id="${p.id_producto}" 
            ${p.stock <= 0 ? 'disabled' : ''}>
        ${p.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
                            
                        </button>
                    </div>
                </div>
                
            `;

            container.appendChild(card);
        });

        initCarrito();
        initHeroSlider();

    } catch (e) {
        console.error("Error productos", e);
    }
}


/* ================================
   CARRITO
================================ */
function initCarrito() {

    document.querySelectorAll(".btn-add-cart").forEach(btn => {

        btn.addEventListener("click", (e) => {

            const card = e.target.closest(".card");

            const producto = {
                nombre: card.querySelector(".card-title").textContent,
                idProducto: parseInt(e.target.getAttribute("data-id")),
                precio: parseFloat(card.querySelector(".fw-bold").textContent),
                imagen: card.querySelector("img").getAttribute("src"),
                cantidad: 1
            };

            let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

            const existente = carrito.find(p => p.nombre === producto.nombre);

            if (existente) {
                existente.cantidad++;
            } else {
                carrito.push(producto);
            }

            sessionStorage.setItem("carrito", JSON.stringify(carrito));

            actualizarContadorCarrito();
        });

    });

}
function actualizarContadorCarrito() {

    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

    const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

    document.getElementById("cart-count").textContent = totalItems;
}
document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();

    actualizarContadorCarrito();

    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password"); // no recomendado en producción
    if (email) actualizarUIUsuario(email, sessionStorage.getItem("rol"));

});
function renderizarCarrito() {

    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

    const contenedor = document.getElementById("carrito-contenido");

    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach(p => {

        total += p.precio * p.cantidad;

        contenedor.innerHTML += `
            <div class="d-flex align-items-center mb-3">

                <img src="${p.imagen}" width="60" class="me-3">

                <div class="flex-grow-1">
                    <div>${p.nombre}</div>
                    <small>${p.cantidad} x ${p.precio}€</small>
                </div>

                <div class="fw-bold">
                    ${(p.precio * p.cantidad).toFixed(2)}€
                </div>

            </div>
        `;

    });

    document.getElementById("carrito-total").textContent = total.toFixed(2);

}
async function finalizarCompra() {

    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password"); // si lo guardas

    const pedido = {
        usuario: {
            email: email,
            password: password
        },
        lineas: carrito.map(p => ({
            idProducto: p.idProducto,
            cantidad: p.cantidad,
            precioUnitario: p.precio
        }))
    };

    try {
        const response = await fetch("http://localhost:8080/api/pedidos/crear?descontarStock=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        if (response.ok) {
            const data = await response.json();
        
            
            // 1. Limpiamos el carrito para que no se quede guardado
            sessionStorage.removeItem("carrito");
            
            // 2. Recargamos la página para que cargarProductos() 
            // vuelva a ejecutarse y traiga el stock actualizado
            location.reload(); 
        } else {
            const errorData = await response.json();
            alert("Error al realizar el pedido: " + errorData.mensaje);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


/* ================================
   HERO SLIDER CON GRADIENTES
================================ */
const heroGradients = [
  "linear-gradient(135deg, #010424, #669ac8)",
  "linear-gradient(135deg, #b03e85, #e4ec89)",
  "linear-gradient(135deg, #468e57, #deea52)"
];

function initHeroSlider() {

    const slides = document.querySelectorAll(".hero-slide");
    const categories = document.querySelectorAll(".hero-category");
    const container = document.querySelector(".hero-slider");

    let index = 0;

    if (!container || slides.length === 0) return;

    container.style.background = heroGradients[0];

    function changeHero() {

        slides[index].classList.remove("active");
        categories[index].classList.remove("active");

        index = (index + 1) % slides.length;

        slides[index].classList.add("active");
        categories[index].classList.add("active");

        container.style.background = heroGradients[index];
    }

    setInterval(changeHero, 4000);
}