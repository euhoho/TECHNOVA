import {
    agregarProducto,
    actualizarContadorCarrito
} from "./carrito.js";


let todosLosProductos = [];
    async function cargarProductos() {
        try {
            const response = await fetch("http://localhost:8080/api/productos");
            const productos = await response.json();

            console.log(productos[0]);

            todosLosProductos = productos;

            pintarProductos(todosLosProductos);
            activarFiltroCategorias();

        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }

    function pintarProductos(productos) {
        const container = document.getElementById("catalogo-container");
        if (!container) return;

        container.innerHTML = "";

        productos.forEach(p => {
            const card = document.createElement("div");
            card.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

            card.innerHTML = `
        <div class="card h-100 ${p.stock <= 0 ? 'producto-agotado' : ''}">
            <img src="img/${p.imagen}" class="card-img-top" alt="${p.nombre}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${p.nombre}</h5>
                <p class="card-text">${p.descripcion}</p>
                <p class="fw-bold">${p.precio.toFixed(2)} €</p>
                <p class="text-muted">Stock: ${p.stock}</p>

                <button 
                    class="btn mt-auto btn-add-cart ${p.stock <= 0 ? 'btn-agotado' : 'btn-disponible'}"
                            ${p.stock <= 0 ? 'disabled' : ''}
                            data-id="${p.id_producto}"
                            data-nombre="${p.nombre}"
                            data-precio="${p.precio}"
                            data-imagen="${p.imagen}">
                            ${p.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
                </button>
            </div>
        </div>
    `;

            container.appendChild(card);
        });

        activarBotonesAgregar();
    }

    function activarFiltroCategorias() {
        const categorias = document.querySelectorAll(".categoria-card");

        categorias.forEach(cat => {
            cat.addEventListener("click", () => {

                // quitar active a todas
                categorias.forEach(c => c.classList.remove("active"));

                // añadir active a la pulsada
                cat.classList.add("active");

                const categoria = cat.dataset.categoria;

                if (categoria === "todos") {
                    pintarProductos(todosLosProductos);
                    return;
                }

                const filtrados = todosLosProductos.filter(producto =>
                    producto.categoria.toLowerCase() === categoria.toLowerCase()
                );

                pintarProductos(filtrados);
            });
        });
    }

    function activarBuscador() {
        const buscador = document.getElementById("buscador-productos");

        buscador.addEventListener("input", () => {

            const texto = buscador.value.toLowerCase();

            const filtrados = todosLosProductos.filter(producto =>
                producto.nombre.toLowerCase().includes(texto) ||
                producto.descripcion.toLowerCase().includes(texto)
            );

            pintarProductos(filtrados);
        });
    }

   function activarBotonesAgregar() {
    const botones = document.querySelectorAll(".btn-add-cart");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {

            const producto = {
                idProducto: parseInt(btn.dataset.id),
                nombre: btn.dataset.nombre,
                precio: parseFloat(btn.dataset.precio),
                imagen: btn.dataset.imagen,
                cantidad: 1
            };

            agregarProducto(producto);
            actualizarContadorCarrito();
        });
    });
}
   document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();
    actualizarContadorCarrito();
    activarBuscador();

    const carritoOffcanvas = document.getElementById("carritoOffcanvas");

    if (carritoOffcanvas) {
        carritoOffcanvas.addEventListener("show.bs.offcanvas", () => {
        
        });
    }

});