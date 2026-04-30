// ===============================
// STORAGE — localStorage (compartido entre todas las páginas)
// Funciones base para leer y guardar el carrito en el navegador
// ===============================

// Devuelve el carrito actual desde localStorage (o array vacío si no existe)
export function getCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// Guarda el carrito en localStorage y actualiza el contador del navbar
export function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// ===============================
// CARRITO
// Operaciones de añadir y vaciar productos
// ===============================

// Añade un producto al carrito; si ya existe incrementa su cantidad
export function agregarProducto(producto) {
    const carrito   = getCarrito();
    const existente = carrito.find(p => p.idProducto === producto.idProducto);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push(producto);
    }
    guardarCarrito(carrito);
}

// Elimina todo el carrito de localStorage, actualiza el contador y recarga la página
export function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    location.reload();
}

// ===============================
// CONTADOR NAVBAR
// Muestra el número total de unidades en el icono del carrito
// ===============================

// Suma todas las cantidades del carrito y devuelve el total de unidades
export function contarItems() {
    return getCarrito().reduce((acc, p) => acc + p.cantidad, 0);
}

// Actualiza el badge del carrito en el navbar y dispara la animación de rebote
export function actualizarContadorCarrito() {
    const total = contarItems();
    const count = document.getElementById("cartCount");
    if (count) {
        count.textContent = total;
        count.classList.remove("bump");
        void count.offsetWidth; // Fuerza reflow para reiniciar la animación CSS
        count.classList.add("bump");
    }
}

// ===============================
// FINALIZAR COMPRA
// Envía el pedido a la API y limpia el carrito si todo va bien
// ===============================
export async function finalizarCompra() {
    const carrito  = getCarrito();
    const email    = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    // Comprueba que el usuario está logueado y el carrito no está vacío
    if (!email || !password) {
        mostrarToast("Debes iniciar sesión para realizar un pedido", "error");
        return;
    }
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío", "error");
        return;
    }

    // Construye el objeto de pedido con usuario y líneas de productos
    const pedido = {
        usuario: { email, password },
        lineas:  carrito.map(p => ({ idProducto: p.idProducto, cantidad: p.cantidad }))
    };

    try {
        const response = await fetch(BASE_URL + '/api/pedidos/crear?descontarStock=true"', {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(pedido)
        });

        if (response.ok) {
            // Pedido creado: limpia el carrito y notifica al usuario con el ID del pedido
            const data = await response.json();
            localStorage.removeItem("carrito");
            actualizarContadorCarrito();
            renderizarCarrito();
            mostrarToast("¡Pedido confirmado! ID: " + data.idPedido, "success");
        } else {
            // La API devolvió un error: muestra el mensaje recibido
            const errorData = await response.json();
            mostrarToast("Error: " + (errorData.mensaje || "inténtalo de nuevo"), "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarToast("Error al conectar con el servidor", "error");
    }
}

// ===============================
// LÓGICA EXCLUSIVA DE carrito.html
// Las funciones de abajo solo se usan en la página del carrito
// ===============================

// Formatea un número como precio con 2 decimales y símbolo €
function fmt(n) { return n.toFixed(2) + " €"; }

// Muestra una notificación temporal en la esquina de la pantalla (toast)
// tipo: "success" (verde) o "error" (rojo)
function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.className = "toast " + tipo;
    toast.textContent = mensaje;
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => toast.classList.remove("show"), 4000);
}

// Dibuja todos los productos del carrito en el DOM.
// Si está vacío muestra el estado vacío; si no, genera una tarjeta por producto.
function renderizarCarrito() {
    const carrito    = getCarrito();
    const contenedor = document.getElementById("carritoItems");
    const vacio      = document.getElementById("carritoVacio");
    if (!contenedor) return;

    // Elimina los ítems anteriores para redibujar desde cero
    contenedor.querySelectorAll(".carrito-item").forEach(el => el.remove());

    if (carrito.length === 0) {
        if (vacio) vacio.style.display = "flex";
        actualizarResumen([]);
        return;
    }

    if (vacio) vacio.style.display = "none";

    // Genera un elemento HTML por cada producto del carrito
    carrito.forEach(p => {
        const div = document.createElement("div");
        div.className = "carrito-item";
        div.innerHTML = `
            <div class="carrito-item-img">
                <img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">
            </div>
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${p.nombre}</div>
                <div class="carrito-item-cantidad">Cantidad: <span>${p.cantidad}</span></div>
                <div class="carrito-item-unitario">${fmt(p.precio)} / ud.</div>
            </div>
            <div class="carrito-item-precio">
                <div class="carrito-item-total">${fmt(p.precio * p.cantidad)}</div>
            </div>
            <button class="carrito-item-delete" data-id="${p.idProducto}" title="Eliminar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
            </button>`;
        contenedor.appendChild(div);
    });

    // Asigna el evento de eliminar a cada botón de papelera
    contenedor.querySelectorAll(".carrito-item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const id    = parseInt(btn.dataset.id);
            // Filtra el producto eliminado y guarda el carrito resultante
            const nuevo = getCarrito().filter(p => p.idProducto !== id);
            guardarCarrito(nuevo);
            renderizarCarrito();
            mostrarToast("Producto eliminado", "error");
        });
    });

    actualizarResumen(carrito);
}

// Calcula subtotal, IVA (21%) y total bruto y los muestra en el panel de resumen
function actualizarResumen(carrito) {
    const totalBruto = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const subtotal   = totalBruto / 1.21; // Precio sin IVA
    const iva        = subtotal * 0.21;   // Importe del IVA

    const elSub   = document.getElementById("resumenSubtotal");
    const elIva   = document.getElementById("resumenIva");
    const elTotal = document.getElementById("resumenTotal");

    if (elSub)   elSub.textContent   = fmt(subtotal);
    if (elIva)   elIva.textContent   = fmt(iva);
    if (elTotal) elTotal.textContent = fmt(totalBruto);
}

// Muestra u oculta los bloques de "iniciar sesión" o "usuario logueado"
// en el panel lateral del resumen según el estado de la sesión
function actualizarSesionUI() {
    const email    = localStorage.getItem("email");
    const loginBox = document.getElementById("resumenLogin");
    const userBox  = document.getElementById("resumenLogueado");
    const emailEl  = document.getElementById("usuarioEmail");

    if (email) {
        loginBox?.classList.add("d-none");
        userBox?.classList.remove("d-none");
        if (emailEl) emailEl.textContent = email;
    } else {
        loginBox?.classList.remove("d-none");
        userBox?.classList.add("d-none");
    }
}

// ── Inicialización exclusiva de carrito.html ──
// Solo se ejecuta si el elemento principal del carrito existe en el DOM
if (document.getElementById("carritoItems")) {
    document.addEventListener("DOMContentLoaded", () => {
        renderizarCarrito();       // Pinta los productos al cargar la página
        actualizarSesionUI();      // Muestra el bloque de sesión correcto
        actualizarContadorCarrito(); // Sincroniza el badge del navbar

        /* Vaciar carrito completo */
        document.getElementById("btnVaciar")?.addEventListener("click", () => {
            if (getCarrito().length === 0) return;
            localStorage.removeItem("carrito");
            actualizarContadorCarrito();
            renderizarCarrito();
            mostrarToast("Carrito vaciado", "error");
        });

        /* Abrir modal de login desde el resumen */
        document.getElementById("btnLogin")?.addEventListener("click", e => {
            e.preventDefault();
            document.getElementById("nbLoginOverlay")?.classList.add("open");
        });

        /* Cerrar modal de login por los tres métodos posibles:
           botón X, botón cancelar y clic en el fondo del overlay */
        document.getElementById("nbLoginClose")?.addEventListener("click", () => {
            document.getElementById("nbLoginOverlay")?.classList.remove("open");
        });
        document.getElementById("nbLoginCancel")?.addEventListener("click", () => {
            document.getElementById("nbLoginOverlay")?.classList.remove("open");
        });
        document.getElementById("nbLoginOverlay")?.addEventListener("click", e => {
            if (e.target === document.getElementById("nbLoginOverlay"))
                document.getElementById("nbLoginOverlay").classList.remove("open");
        });

        /* Formulario de login embebido en el carrito:
           llama a la API, guarda la sesión y actualiza la UI si es correcto */
        document.getElementById("nbLoginForm")?.addEventListener("submit", async e => {
            e.preventDefault();
            const email    = document.getElementById("nbLoginEmail").value.trim();
            const password = document.getElementById("nbLoginPassword").value;
            const errorEl  = document.getElementById("nbLoginError");
            errorEl?.classList.add("d-none");

            try {
                const res  = await fetch(BASE_URL + '/api/login', {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.status !== "ok") throw new Error();

                // Guarda la sesión y cierra el modal
                localStorage.setItem("email",    data.usuario.email);
                localStorage.setItem("password", password);
                localStorage.setItem("rol",      data.usuario.rol);

                document.getElementById("nbLoginOverlay")?.classList.remove("open");
                actualizarSesionUI();
                mostrarToast("¡Bienvenido!", "success");
            } catch {
                errorEl?.classList.remove("d-none"); // Muestra el error si el login falla
            }
        });

        /* Confirmar y enviar el pedido */
        document.getElementById("btnConfirmar")?.addEventListener("click", finalizarCompra);

        /* Cerrar sesión: elimina los datos del usuario y actualiza el panel lateral */
        document.getElementById("btnLogout")?.addEventListener("click", () => {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            localStorage.removeItem("rol");
            actualizarSesionUI();
            mostrarToast("Sesión cerrada", "success");
        });
    });
}