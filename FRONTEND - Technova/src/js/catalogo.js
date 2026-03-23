import {
    agregarProducto,
    actualizarContadorCarrito
} from "./carrito.js";

let todosLosProductos = [];

/* ── Skeletons mientras carga ── */
function mostrarSkeletons(n = 8) {
    const container = document.getElementById("catalogo-container");
    if (!container) return;
    container.innerHTML = Array(n).fill(`
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line xshort"></div>
            </div>
        </div>`).join('');
}

/* ── Contador de resultados ── */
function actualizarContador(n) {
    const el = document.getElementById("resultsCount");
    if (el) el.textContent = n + (n === 1 ? ' producto' : ' productos');
}

async function cargarProductos() {
    mostrarSkeletons(8);
    try {
        const response = await fetch("http://localhost:8080/api/productos");
        const productos = await response.json();
        todosLosProductos = productos;
        pintarProductos(todosLosProductos);
        activarFiltroCategorias();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        pintarError();
    }
}

function pintarError() {
    const container = document.getElementById("catalogo-container");
    if (!container) return;
    container.innerHTML = `
        <div class="cat-empty">
            <div class="cat-empty-icon">⚠️</div>
            <p>No se pudo conectar con el servidor</p>
        </div>`;
    actualizarContador(0);
}

function pintarProductos(productos) {
    const container = document.getElementById("catalogo-container");
    if (!container) return;

    container.innerHTML = "";
    actualizarContador(productos.length);

    if (productos.length === 0) {
        container.innerHTML = `
            <div class="cat-empty">
                <div class="cat-empty-icon">🔍</div>
                <p>Sin resultados</p>
            </div>`;
        return;
    }

    productos.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = `product-card-cat ${p.stock <= 0 ? 'agotado' : ''}`;
        card.style.animationDelay = Math.min(i * 35, 400) + 'ms';

        const tieneImagen = p.imagen && p.imagen.trim() !== '';

        card.innerHTML = `
            <div class="card-img-wrap">
                ${tieneImagen
                    ? `<img src="img/${p.imagen}" alt="${p.nombre}" loading="lazy"
                           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ''}
                <div class="card-img-placeholder" style="${tieneImagen ? 'display:none' : ''}">📦</div>
                <span class="card-stock-badge ${p.stock <= 0 ? 'badge-agotado' : 'badge-disponible'}">
                    ${p.stock <= 0 ? 'Agotado' : 'Disponible'}
                </span>
            </div>
            <div class="card-body-cat">
                <div class="card-nombre">${p.nombre}</div>
                <div class="card-desc">${p.descripcion}</div>
                <div class="card-stock-text">Stock: ${p.stock} uds.</div>
                <div class="card-footer-cat">
                    <div class="card-precio">${p.precio.toFixed(2)}<small> €</small></div>
                    <button
                        class="btn-add-cart ${p.stock <= 0 ? 'btn-agotado' : 'btn-disponible'}"
                        ${p.stock <= 0 ? 'disabled' : ''}
                        data-id="${p.id_producto}"
                        data-nombre="${p.nombre}"
                        data-precio="${p.precio}"
                        data-imagen="${p.imagen}">
                        ${p.stock <= 0 ? 'Agotado' : '+ Añadir'}
                    </button>
                </div>
            </div>`;

        container.appendChild(card);
    });

    activarBotonesAgregar();
}

function activarFiltroCategorias() {
    const categorias = document.querySelectorAll(".categoria-card");
    categorias.forEach(cat => {
        cat.addEventListener("click", () => {
            categorias.forEach(c => c.classList.remove("active"));
            cat.classList.add("active");

            const categoria = cat.dataset.categoria;
            const filtrados = categoria === "todos"
                ? todosLosProductos
                : todosLosProductos.filter(p =>
                    p.categoria.toLowerCase() === categoria.toLowerCase());

            pintarProductos(filtrados);
        });
    });
}

function activarBuscador() {
    const buscador = document.getElementById("buscador-productos");
    if (!buscador) return;

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase().trim();

        // Quitar active de categorías al buscar
        if (texto) {
            document.querySelectorAll(".categoria-card").forEach(c => c.classList.remove("active"));
        }

        const filtrados = texto
            ? todosLosProductos.filter(p =>
                p.nombre.toLowerCase().includes(texto) ||
                p.descripcion.toLowerCase().includes(texto))
            : todosLosProductos;

        pintarProductos(filtrados);
    });
}

function activarBotonesAgregar() {
    document.querySelectorAll(".btn-add-cart:not(.btn-agotado)").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            const producto = {
                idProducto: parseInt(btn.dataset.id),
                nombre:     btn.dataset.nombre,
                precio:     parseFloat(btn.dataset.precio),
                imagen:     "img/" + btn.dataset.imagen,
                cantidad:   1
            };

            agregarProducto(producto);
            actualizarContadorCarrito();

            // Feedback visual
            const original = btn.textContent;
            btn.textContent = '✓ Añadido';
            btn.style.background = '#22cc66';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 4px 16px rgba(34,204,102,0.3)';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.boxShadow = '';
            }, 1400);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarContadorCarrito();
    activarBuscador();
});