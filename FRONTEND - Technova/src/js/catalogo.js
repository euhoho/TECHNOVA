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

            let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

            const producto = {
                idProducto: parseInt(btn.dataset.id),
                nombre: btn.dataset.nombre,
                precio: parseFloat(btn.dataset.precio),
                imagen: "img/" + btn.dataset.imagen,
                cantidad: 1
            };

            const existente = carrito.find(p => p.idProducto === producto.idProducto);

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
   document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();
    actualizarContadorCarrito();
    activarBuscador();

    const carritoOffcanvas = document.getElementById("carritoOffcanvas");

    if (carritoOffcanvas) {
        carritoOffcanvas.addEventListener("show.bs.offcanvas", () => {
            renderizarCarrito();
        });
    }

});
 function actualizarContadorCarrito() {

    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

    const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

    const contador = document.getElementById("cart-count");

    if (!contador) return;

    contador.textContent = totalItems;
}
    
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