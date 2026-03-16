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
        sessionStorage.setItem("rol", data.usuario.rol);

        actualizarUIUsuario(data.usuario.email, data.usuario.rol);

        const modalElement = document.getElementById('loginModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        console.log("Login correcto:", data);

    } catch (error) {
        document.getElementById("login-error").classList.remove("d-none");
    }
}

function actualizarUIUsuario(email, rol) {
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

                        <button class="btn btn-primary mt-auto btn-add-cart" ${p.stock <= 0 ? 'disabled' : ''}>
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
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

function initCarrito() {
    document.querySelectorAll(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {

            const card = e.target.closest(".card");

            carrito.push({
                nombre: card.querySelector(".card-title").textContent,
                precio: card.querySelector(".fw-bold").textContent
            });

            sessionStorage.setItem("carrito", JSON.stringify(carrito));
            document.getElementById("cart-count").textContent = carrito.length;
        });
    });
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

    // seguridad para evitar errores
    if (!container || slides.length === 0) return;

    let index = 0;

    // fondo inicial
    container.style.background = heroGradients[0];

    function changeHero() {

        slides[index].classList.remove("active");

        if (categories[index]) {
            categories[index].classList.remove("active");
        }

        index = (index + 1) % slides.length;

        slides[index].classList.add("active");

        if (categories[index]) {
            categories[index].classList.add("active");
        }

        container.style.background = heroGradients[index];
    }

    setInterval(changeHero, 4000);
}

/* ================================
   INICIALIZAR CUANDO CARGA EL DOM
================================ */

document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
});