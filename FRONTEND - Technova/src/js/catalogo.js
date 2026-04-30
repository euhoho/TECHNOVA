import {
    agregarProducto,
    actualizarContadorCarrito
} from "./carrito.js";

// Array global que guarda todos los productos cargados desde la API
let todosLosProductos = [];

// Elimina tildes y convierte a minúsculas para comparaciones de texto sin diferenciar acentos
function normalizar(texto) {
    return (texto || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Muestra n tarjetas skeleton animadas mientras se cargan los productos reales
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

// Actualiza el texto del contador de resultados encima del grid (ej: "24 productos")
function actualizarContador(n) {
    const el = document.getElementById("resultsCount");
    if (el) el.textContent = n + (n === 1 ? ' producto' : ' productos');
}

// Pide todos los productos a la API, los guarda en el array global
// y activa los filtros, el ordenador y el slider de precio
async function cargarProductos() {
    mostrarSkeletons(8);
    try {
        const response = await fetch(BASE_URL + "/api/productos");
        const productos = await response.json();
        todosLosProductos = productos;
        pintarProductos(todosLosProductos);
        activarFiltroCategorias();
        activarOrdenador();
        activarSliderPrecio();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        pintarError();
    }
}

// Si la URL incluye ?categoria=..., activa esa categoría automáticamente al cargar
const params = new URLSearchParams(window.location.search);
const categoriaURL = params.get("categoria");

if (categoriaURL) {
    const categorias = document.querySelectorAll(".categoria-card");
    categorias.forEach(c => c.classList.remove("active"));

    const cardActiva = document.querySelector(`.categoria-card[data-categoria="${categoriaURL}"]`);
    if (cardActiva) {
        cardActiva.classList.add("active");
    }

    aplicarFiltrosYOrden();
}

// Muestra un mensaje de error en el grid cuando la API no está disponible
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

// Renderiza el array de productos recibido en el grid del catálogo.
// Genera una tarjeta por producto con imagen, nombre, precio, stock y botón de añadir.
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
        // Añade la clase 'agotado' si el stock es 0 o negativo
        card.className = `product-card-cat ${p.stock <= 0 ? 'agotado' : ''}`;
        // Escalonado de animación: máximo 400ms para no retrasar demasiado las últimas tarjetas
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

// Asigna el evento click a cada píldora de categoría para filtrar el grid.
// Al seleccionar una, quita 'active' de las demás y aplica el filtro.
function activarFiltroCategorias() {
    const categorias = document.querySelectorAll(".categoria-card");
    categorias.forEach(cat => {
        cat.addEventListener("click", () => {
            categorias.forEach(c => c.classList.remove("active"));
            cat.classList.add("active");
            aplicarFiltrosYOrden();

            const categoria = cat.dataset.categoria;
            const filtrados = categoria === "todos"
                ? todosLosProductos
                : todosLosProductos.filter(p =>
                    normalizar(p.categoria) === normalizar(categoria));

            pintarProductos(filtrados);
        });
    });
}

// Escucha el input del buscador y filtra los productos por nombre,
// descripción y categoría. Si hay texto, deselecciona las categorías activas.
function activarBuscador() {
    const buscador = document.getElementById("buscador-productos");
    if (!buscador) return;

    buscador.addEventListener("input", () => {
        aplicarFiltrosYOrden();
        const texto = normalizar(buscador.value.trim());

        if (texto) {
            document.querySelectorAll(".categoria-card").forEach(c => c.classList.remove("active"));
        }

        const filtrados = texto
            ? todosLosProductos.filter(p =>
                normalizar(p.nombre).includes(texto)       ||
                normalizar(p.descripcion).includes(texto)  ||
                normalizar(p.categoria || '').includes(texto))
            : todosLosProductos;

        pintarProductos(filtrados);
    });
}

// Asigna el evento click a los botones "+ Añadir" del grid.
// Añade el producto al carrito y muestra feedback visual verde durante 1.4 segundos.
function activarBotonesAgregar() {
    document.querySelectorAll(".btn-add-cart:not(.btn-agotado)").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita propagar el clic a la tarjeta padre

            const producto = {
                idProducto: parseInt(btn.dataset.id),
                nombre:     btn.dataset.nombre,
                precio:     parseFloat(btn.dataset.precio),
                imagen:     "img/" + btn.dataset.imagen,
                cantidad:   1
            };

            agregarProducto(producto);
            actualizarContadorCarrito();

            // Feedback visual temporal en el botón
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

// Combina todos los filtros activos (texto, categoría, precio y orden)
// y vuelve a pintar el grid con los productos resultantes.
function aplicarFiltrosYOrden() {
    const buscador        = document.getElementById("buscador-productos");
    const categoriaActiva = document.querySelector(".categoria-card.active");
    const ordenar         = document.getElementById("ordenar-productos");
    const sliderMin       = document.getElementById("precio-min");
    const sliderMax       = document.getElementById("precio-max");

    const texto          = buscador ? buscador.value.toLowerCase().trim() : "";
    const categoria      = categoriaActiva ? categoriaActiva.dataset.categoria.toLowerCase() : "todos";
    const criterioOrden  = ordenar ? ordenar.value : "default";
    const min            = sliderMin ? Number(sliderMin.value) : 0;
    const max            = sliderMax ? Number(sliderMax.value) : Infinity;

    // Filtra por texto, categoría y rango de precio simultáneamente
    let resultado = todosLosProductos.filter(producto => {
        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.descripcion.toLowerCase().includes(texto);

        const coincideCategoria =
            categoria === "todos" ||
            producto.categoria.toLowerCase() === categoria;

        const precio = Number(producto.precio);
        const coincidePrecio = precio >= min && precio <= max;

        return coincideBusqueda && coincideCategoria && coincidePrecio;
    });

    // Aplica el criterio de ordenación seleccionado en el desplegable
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

// Escucha cambios en el select de ordenación y aplica todos los filtros
function activarOrdenador() {
    const select = document.getElementById("ordenar-productos");
    if (!select) return;
    select.addEventListener("change", () => { aplicarFiltrosYOrden(); });
}

// Inicializa el filtro de precio con un canvas interactivo estilo "constelación".
// Dibuja estrellas de fondo, una línea de rango y dos manejadores arrastrables
// que el usuario puede mover con ratón o touch para definir el rango de precio.
function activarSliderPrecio() {
    const sliderMin = document.getElementById("precio-min");
    const sliderMax = document.getElementById("precio-max");
    const valorMin  = document.getElementById("precio-min-valor");
    const valorMax  = document.getElementById("precio-max-valor");
    const canvas    = document.getElementById("constellation-price");

    if (!sliderMin || !sliderMax || !valorMin || !valorMax || !canvas || todosLosProductos.length === 0) return;

    // Calcula el rango real de precios a partir de los productos cargados
    const minReal = Math.floor(Math.min(...todosLosProductos.map(p => Number(p.precio))));
    const maxReal = Math.ceil( Math.max(...todosLosProductos.map(p => Number(p.precio))));

    // Configura los inputs range con los límites reales
    sliderMin.min = sliderMax.min = minReal;
    sliderMin.max = sliderMax.max = maxReal;
    sliderMin.value = minReal;
    sliderMax.value = maxReal;

    // Ajusta el canvas al tamaño del contenedor respetando el DPR para pantallas Retina
    const DPR = window.devicePixelRatio || 1;
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * DPR;
        canvas.height = rect.height * DPR;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    const PAD = 10; // Margen interno del canvas en píxeles lógicos

    // 22 estrellas de fondo con parpadeo individual aleatorio
    const BG_STARS = Array.from({ length: 22 }, () => ({
        x:     Math.random(),
        y:     Math.random(),
        r:     Math.random() * 1.2 + 0.3,
        base:  Math.random() * 0.25 + 0.05,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
    }));

    // 3 nodos intermedios flotantes que forman la constelación entre los manejadores
    const FLOAT_NODES = [
        { tx: 0.28, ty: -0.35, phase: 0,              speed: 0.018, amp: 0.18 },
        { tx: 0.50, ty:  0.30, phase: Math.PI * 0.66, speed: 0.013, amp: 0.22 },
        { tx: 0.72, ty: -0.25, phase: Math.PI * 1.33, speed: 0.021, amp: 0.16 },
    ];

    let t           = 0;       // Contador de frames para animaciones sinusoidales
    let hoveredStar = null;    // Indica qué manejador está bajo el cursor ("min"/"max")
    let dragging    = null;    // Indica qué manejador se está arrastrando
    let rafId       = null;    // ID del requestAnimationFrame activo

    // Convierte un valor de precio a su posición X en el canvas (en píxeles lógicos)
    function priceToX(val) {
        const W = canvas.width / DPR;
        return PAD + ((val - minReal) / (maxReal - minReal)) * (W - PAD * 2);
    }

    // Convierte una posición X del canvas a su valor de precio correspondiente
    function xToPrice(x) {
        const W = canvas.width / DPR;
        const ratio = (x - PAD) / (W - PAD * 2);
        return Math.round(minReal + ratio * (maxReal - minReal));
    }

    // Dibuja una estrella de 5 puntas en la posición indicada con brillo y rotación
    function drawStar(cx, cy, r, color, glow, rotation = 0) {
        ctx.save();
        ctx.translate(cx * DPR, cy * DPR);
        ctx.rotate(rotation);
        ctx.shadowColor = color;
        ctx.shadowBlur  = glow * DPR;
        ctx.fillStyle   = color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle  = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? r * DPR : r * 0.42 * DPR; // Alterna punta y valle
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Loop principal de animación del canvas: se ejecuta en cada fotograma
    function draw() {
        t += 1;
        const W = canvas.width  / DPR;
        const H = canvas.height / DPR;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const minVal = Number(sliderMin.value);
        const maxVal = Number(sliderMax.value);
        const xMin   = priceToX(minVal);
        const xMax   = priceToX(maxVal);
        const midY   = H / 2; // Línea central horizontal del slider

        // Dibuja las estrellas de fondo con parpadeo individual
        BG_STARS.forEach(s => {
            s.phase += s.speed;
            const alpha = s.base + Math.sin(s.phase) * s.base * 0.8;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle   = "#ffffff";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur  = 4 * DPR;
            ctx.beginPath();
            ctx.arc(s.x * W * DPR, s.y * H * DPR, s.r * DPR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Línea de fondo completa del slider (gris muy sutil)
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth   = 1.5 * DPR;
        ctx.beginPath();
        ctx.moveTo(PAD * DPR, midY * DPR);
        ctx.lineTo((W - PAD) * DPR, midY * DPR);
        ctx.stroke();
        ctx.restore();

        // Línea de rango activo entre los dos manejadores (rosa discontinua con brillo)
        ctx.save();
        ctx.shadowColor = "#e40085";
        ctx.shadowBlur  = 6 * DPR;
        ctx.strokeStyle = "rgba(228,0,133,0.55)";
        ctx.lineWidth   = 1.5 * DPR;
        ctx.setLineDash([4 * DPR, 4 * DPR]);
        ctx.beginPath();
        ctx.moveTo(xMin * DPR, midY * DPR);
        ctx.lineTo(xMax * DPR, midY * DPR);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Nodos flotantes de constelación entre los dos manejadores
        const spread = xMax - xMin;
        if (spread > 30) {
            // Calcula la posición actual de cada nodo flotante con movimiento sinusoidal
            const nodes = FLOAT_NODES.map(n => {
                n.phase += n.speed;
                return {
                    x: xMin + spread * n.tx,
                    y: midY + (H * 0.38) * n.amp * Math.sin(n.phase),
                };
            });

            // Dibuja las líneas de conexión: manejador izquierdo → nodos → manejador derecho
            ctx.save();
            ctx.strokeStyle = "rgba(201,64,255,0.2)";
            ctx.lineWidth   = 1 * DPR;
            ctx.shadowColor = "rgba(201,64,255,0.3)";
            ctx.shadowBlur  = 3 * DPR;
            ctx.beginPath();
            ctx.moveTo(xMin * DPR, midY * DPR);
            nodes.forEach(n => ctx.lineTo(n.x * DPR, n.y * DPR));
            ctx.lineTo(xMax * DPR, midY * DPR);
            ctx.stroke();
            ctx.restore();

            // Línea cruzada diagonal entre el primer y tercer nodo para efecto constelación
            if (nodes.length >= 2) {
                ctx.save();
                ctx.strokeStyle = "rgba(201,64,255,0.09)";
                ctx.lineWidth   = 0.8 * DPR;
                ctx.beginPath();
                ctx.moveTo(nodes[0].x * DPR, nodes[0].y * DPR);
                ctx.lineTo(nodes[2].x * DPR, nodes[2].y * DPR);
                ctx.stroke();
                ctx.restore();
            }

            // Dibuja cada nodo flotante como un punto magenta con pulso de brillo
            nodes.forEach((n, i) => {
                const pulse = 0.5 + 0.5 * Math.sin(FLOAT_NODES[i].phase * 1.7);
                ctx.save();
                ctx.globalAlpha = 0.45 + pulse * 0.4;
                ctx.fillStyle   = "#c940ff";
                ctx.shadowColor = "#c940ff";
                ctx.shadowBlur  = (4 + pulse * 6) * DPR;
                ctx.beginPath();
                ctx.arc(n.x * DPR, n.y * DPR, (1.8 + pulse * 0.8) * DPR, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // Dibuja las estrellas manejadoras con rotación lenta continua
        // Se agrandan al hacer hover sobre ellas
        const rot  = t * 0.008;
        const rMin  = hoveredStar === "min" ? 8 : 6;
        const rMax  = hoveredStar === "max" ? 8 : 6;
        const glMin = hoveredStar === "min" ? 20 : 10 + 4 * Math.sin(t * 0.04);
        const glMax = hoveredStar === "max" ? 20 : 10 + 4 * Math.sin(t * 0.04 + 1);

        drawStar(xMin, midY, rMin, "#e40085", glMin,  rot);
        drawStar(xMax, midY, rMax, "#c940ff", glMax, -rot + Math.PI / 10);

        rafId = requestAnimationFrame(draw);
    }

    // Obtiene la posición X del cursor o del primer toque dentro del canvas
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        return clientX - rect.left;
    }

    // Detecta si la posición X está sobre uno de los manejadores (radio de 14px)
    function hitTest(x) {
        const midY = (canvas.height / DPR) / 2;
        const xMin = priceToX(Number(sliderMin.value));
        const xMax = priceToX(Number(sliderMax.value));
        if (Math.abs(x - xMin) < 14) return "min";
        if (Math.abs(x - xMax) < 14) return "max";
        return null;
    }

    // Inicia el arrastre al pulsar sobre un manejador
    canvas.addEventListener("mousedown", e => { dragging = hitTest(getPos(e)); });
    canvas.addEventListener("touchstart", e => { dragging = hitTest(getPos(e)); }, { passive: true });

    // Mueve el manejador activo y actualiza los valores mientras se arrastra
    canvas.addEventListener("mousemove", e => {
        const x = getPos(e);
        hoveredStar = hitTest(x);
        canvas.style.cursor = hoveredStar ? "grab" : "default";
        if (!dragging) return;
        canvas.style.cursor = "grabbing";
        let val = Math.max(minReal, Math.min(maxReal, xToPrice(x)));
        if (dragging === "min") {
            sliderMin.value = Math.min(val, Number(sliderMax.value)); // No supera al máximo
        } else {
            sliderMax.value = Math.max(val, Number(sliderMin.value)); // No baja del mínimo
        }
        actualizarValores();
    });

    canvas.addEventListener("touchmove", e => {
        if (!dragging) return;
        const x = getPos(e);
        let val = Math.max(minReal, Math.min(maxReal, xToPrice(x)));
        if (dragging === "min") {
            sliderMin.value = Math.min(val, Number(sliderMax.value));
        } else {
            sliderMax.value = Math.max(val, Number(sliderMin.value));
        }
        actualizarValores();
    }, { passive: true });

    // Detiene el arrastre al soltar el botón del ratón o el dedo
    window.addEventListener("mouseup",  () => { dragging = null; canvas.style.cursor = "default"; });
    window.addEventListener("touchend", () => { dragging = null; });

    // Actualiza los textos de precio mostrados y vuelve a aplicar los filtros
    function actualizarValores() {
        const min = Number(sliderMin.value);
        const max = Number(sliderMax.value);
        valorMin.textContent = `${min.toFixed(2)} €`;
        valorMax.textContent = `${max.toFixed(2)} €`;
        aplicarFiltrosYOrden();
    }

    actualizarValores();
    draw(); // Arranca el loop de animación del canvas
}

// Si la URL contiene ?buscar=..., rellena el buscador con ese valor
// y dispara el evento input para filtrar automáticamente
function aplicarBusquedaURL() {
    const params      = new URLSearchParams(window.location.search);
    const buscarParam = params.get('buscar');
    if (!buscarParam) return;

    const buscador = document.getElementById('buscador-productos');
    if (buscador) {
        buscador.value = buscarParam;
        buscador.dispatchEvent(new Event('input'));
        buscador.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Al cargar el DOM: carga los productos, aplica búsqueda por URL si existe,
// sincroniza el contador del carrito y activa el buscador
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos().then(() => {
        aplicarBusquedaURL();
    });
    actualizarContadorCarrito();
    activarBuscador();
});