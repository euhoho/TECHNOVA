let todosLosProductos = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarContadorCarrito();
    esperarContadorCarrito();
});

async function cargarProductos() {
    try {
        const response = await fetch("http://localhost:8080/api/productos");
        const productos = await response.json();

        todosLosProductos = productos;

        pintarProductos(todosLosProductos);
        activarFiltroCategorias();
        activarBuscador();
        activarOrdenador();
        activarSliderPrecio();

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
                    <p class="fw-bold">${Number(p.precio).toFixed(2)} €</p>
                    <p class="text-muted">Stock: ${p.stock}</p>

                    <button 
                        class="btn mt-auto btn-add-cart ${p.stock <= 0 ? 'btn-agotado' : 'btn-disponible'}"
                        ${p.stock <= 0 ? 'disabled' : ''}
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

function aplicarFiltrosYOrden() {
    const buscador = document.getElementById("buscador-productos");
    const categoriaActiva = document.querySelector(".categoria-card.active");
    const orden = document.getElementById("ordenar-productos");
    const sliderMin = document.getElementById("precio-min");
    const sliderMax = document.getElementById("precio-max");

    const texto = buscador ? buscador.value.toLowerCase().trim() : "";
    const categoria = categoriaActiva ? categoriaActiva.dataset.categoria.toLowerCase() : "todos";
    const precioMin = sliderMin ? Number(sliderMin.value) : 0;
    const precioMax = sliderMax ? Number(sliderMax.value) : Infinity;
    const criterioOrden = orden ? orden.value : "default";

    let resultado = todosLosProductos.filter(producto => {
        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.descripcion.toLowerCase().includes(texto);

        const coincideCategoria =
            categoria === "todos" ||
            producto.categoria.toLowerCase() === categoria;

        const precio = Number(producto.precio);
        const coincidePrecio = precio >= precioMin && precio <= precioMax;

        return coincideBusqueda && coincideCategoria && coincidePrecio;
    });

    if (criterioOrden === "nombre-asc") {
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterioOrden === "nombre-desc") {
        resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    } else if (criterioOrden === "precio-asc") {
        resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (criterioOrden === "precio-desc") {
        resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
    }

    pintarProductos(resultado);
}

function activarFiltroCategorias() {
    const categorias = document.querySelectorAll(".categoria-card");

    categorias.forEach(cat => {
        cat.addEventListener("click", () => {
            categorias.forEach(c => c.classList.remove("active"));
            cat.classList.add("active");
            aplicarFiltrosYOrden();
        });
    });
}

function activarBuscador() {
    const buscador = document.getElementById("buscador-productos");
    if (!buscador) return;

    buscador.addEventListener("input", () => {
        aplicarFiltrosYOrden();
    });
}

function activarOrdenador() {
    const select = document.getElementById("ordenar-productos");
    if (!select) return;

    select.addEventListener("change", () => {
        aplicarFiltrosYOrden();
    });
}

function activarSliderPrecio() {
    const sliderMin = document.getElementById("precio-min");
    const sliderMax = document.getElementById("precio-max");
    const valorMin = document.getElementById("precio-min-valor");
    const valorMax = document.getElementById("precio-max-valor");
    const sliderRange = document.getElementById("slider-range");

    if (!sliderMin || !sliderMax || !valorMin || !valorMax || !sliderRange || todosLosProductos.length === 0) return;

    const minReal = Math.floor(Math.min(...todosLosProductos.map(p => Number(p.precio))));
    const maxReal = Math.ceil(Math.max(...todosLosProductos.map(p => Number(p.precio))));

    sliderMin.min = minReal;
    sliderMin.max = maxReal;
    sliderMax.min = minReal;
    sliderMax.max = maxReal;

    sliderMin.value = minReal;
    sliderMax.value = maxReal;

    function actualizarSlider() {
        let min = Number(sliderMin.value);
        let max = Number(sliderMax.value);

        if (min > max) {
            if (event && event.target === sliderMin) {
                sliderMin.value = max;
                min = max;
            } else {
                sliderMax.value = min;
                max = min;
            }
        }

        valorMin.textContent = `${min.toFixed(2)} €`;
        valorMax.textContent = `${max.toFixed(2)} €`;

        const rangoTotal = maxReal - minReal || 1;
        const minPercent = ((min - minReal) / rangoTotal) * 100;
        const maxPercent = ((max - minReal) / rangoTotal) * 100;

        sliderRange.style.left = `${minPercent}%`;
        sliderRange.style.width = `${maxPercent - minPercent}%`;

        aplicarFiltrosYOrden();
    }

    sliderMin.addEventListener("input", actualizarSlider);
    sliderMax.addEventListener("input", actualizarSlider);

    actualizarSlider();
}

function activarBotonesAgregar() {
    const botones = document.querySelectorAll(".btn-add-cart");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

            const producto = {
                nombre: btn.dataset.nombre,
                precio: btn.dataset.precio,
                imagen: btn.dataset.imagen
            };

            carrito.push(producto);
            sessionStorage.setItem("carrito", JSON.stringify(carrito));

            actualizarContadorCarrito();
        });
    });
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const contador = document.getElementById("cart-count");

    if (contador) {
        contador.textContent = carrito.length;
    }
}

function esperarContadorCarrito(intentos = 10) {
    const contador = document.getElementById("cart-count");

    if (contador) {
        actualizarContadorCarrito();
        return;
    }

    if (intentos > 0) {
        setTimeout(() => {
            esperarContadorCarrito(intentos - 1);
        }, 200);
    }
}