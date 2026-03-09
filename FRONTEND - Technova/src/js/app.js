document.getElementById("login-form").addEventListener("submit", login);
async function login(e) {

    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {

        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.status !== "ok") {
            throw new Error(data.mensaje);
            console.error(data.usuario, data);
        }

        // guardar sesión
 if (data.status === "ok") {

    sessionStorage.setItem("email", data.usuario.email);
    sessionStorage.setItem("rol", data.usuario.rol);
    sessionStorage.setItem("id_usuario", data.usuario.id_usuario);

    // ocultar botón login
    document.getElementById("btn-open-login").classList.add("d-none");

    // mostrar zona usuario
    document.getElementById("nav-user-zone").classList.remove("d-none");

    // cambiar texto saludo
    document.getElementById("nav-saludo").textContent =
        "Hola, " + data.usuario.email;

    // si es administrador
    if (data.usuario.rol === "ADMINISTRADOR") {
        document.getElementById("nav-admin-zone").classList.remove("d-none");
    }
   const modalElement = document.getElementById('loginModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
}


        console.log("Login correcto:", data);

    } catch (error) {

        document.getElementById("login-error").classList.remove("d-none");

    }
}
document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos(){
    const response = await fetch("http://localhost:8080/api/productos");
    const productos = await response.json();
    const container = document.getElementById("catalogo-container");

    container.innerHTML = "";

    productos.forEach(p => {
        // 1. Calculamos si no hay stock
        const sinStock = p.stock <= 0;
        
        // 2. Definimos la clase CSS (si no hay stock, ponemos 'producto-agotado')
        const claseStock = sinStock ? 'producto-agotado' : '';

        // 3. Pintamos la tarjeta usando esa clase
        container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 ${claseStock}"> 
                    <img src="img/${p.imagen}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text">${p.descripcion}</p>
                        <p class="fw-bold">${p.precio} €</p>
                        <p class="text-muted">Stock: ${p.stock}</p>
                        
                        ${sinStock ? '<span class="badge-sin-stock">AGOTADO</span>' : ''}
                        
                        <button class="btn btn-primary w-100 mt-2" ${sinStock ? 'disabled' : ''}>
                            ${sinStock ? 'No disponible' : 'Añadir al carrito'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}
const productosDiv = document.getElementById('contenedor-productos');

productos.forEach(producto => {
    // Comprobamos si no hay stock
    const sinStock = producto.stock <= 0;
    
    // Si sinStock es true, añadimos la clase 'producto-agotado', si no, nada
    const claseStock = sinStock ? 'producto-agotado' : '';

    productosDiv.innerHTML += `
        <div class="card ${claseStock}" style="width: 18rem;">
            <img src="img/${producto.imagen}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">Stock: ${producto.stock}</p>
                ${sinStock ? '<span class="badge-sin-stock">AGOTADO</span>' : ''}
                <button class="btn btn-primary" ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'No disponible' : 'Comprar'}
                </button>
            </div>
        </div>
    `;
});
