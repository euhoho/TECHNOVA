// ===============================
// STORAGE — localStorage (compartido entre todas las páginas)
// ===============================
export function getCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// ===============================
// CARRITO
// ===============================
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

export function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    location.reload();
}

// ===============================
// CONTADOR NAVBAR
// ===============================
export function contarItems() {
    return getCarrito().reduce((acc, p) => acc + p.cantidad, 0);
}

export function actualizarContadorCarrito() {
    const total = contarItems();
    const count = document.getElementById("cartCount");
    if (count) {
        count.textContent = total;
        count.classList.remove("bump");
        void count.offsetWidth;
        count.classList.add("bump");
    }
}

// ===============================
// FINALIZAR COMPRA
// ===============================
export async function finalizarCompra() {
    const carrito  = getCarrito();
    const email    = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    if (!email || !password) {
        mostrarToast("Debes iniciar sesión para realizar un pedido", "error");
        return;
    }
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío", "error");
        return;
    }

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
            const data = await response.json();
            localStorage.removeItem("carrito");
            actualizarContadorCarrito();
            renderizarCarrito();
            mostrarToast("¡Pedido confirmado! ID: " + data.idPedido, "success");
        } else {
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
// ===============================
function fmt(n) { return n.toFixed(2) + " €"; }

function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.className = "toast " + tipo;
    toast.textContent = mensaje;
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => toast.classList.remove("show"), 4000);
}

function renderizarCarrito() {
    const carrito    = getCarrito();
    const contenedor = document.getElementById("carritoItems");
    const vacio      = document.getElementById("carritoVacio");
    if (!contenedor) return;

    contenedor.querySelectorAll(".carrito-item").forEach(el => el.remove());

    if (carrito.length === 0) {
        if (vacio) vacio.style.display = "flex";
        actualizarResumen([]);
        return;
    }

    if (vacio) vacio.style.display = "none";

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

    contenedor.querySelectorAll(".carrito-item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const id    = parseInt(btn.dataset.id);
            const nuevo = getCarrito().filter(p => p.idProducto !== id);
            guardarCarrito(nuevo);
            renderizarCarrito();
            mostrarToast("Producto eliminado", "error");
        });
    });

    actualizarResumen(carrito);
}

function actualizarResumen(carrito) {
    const totalBruto = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const subtotal   = totalBruto / 1.21;
    const iva        = subtotal * 0.21;

    const elSub   = document.getElementById("resumenSubtotal");
    const elIva   = document.getElementById("resumenIva");
    const elTotal = document.getElementById("resumenTotal");

    if (elSub)   elSub.textContent   = fmt(subtotal);
    if (elIva)   elIva.textContent   = fmt(iva);
    if (elTotal) elTotal.textContent = fmt(totalBruto);
}

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

// Solo ejecutar si estamos en carrito.html
if (document.getElementById("carritoItems")) {
    document.addEventListener("DOMContentLoaded", () => {
        renderizarCarrito();
        actualizarSesionUI();
        actualizarContadorCarrito();

        /* Vaciar */
        document.getElementById("btnVaciar")?.addEventListener("click", () => {
            if (getCarrito().length === 0) return;
            localStorage.removeItem("carrito");
            actualizarContadorCarrito();
            renderizarCarrito();
            mostrarToast("Carrito vaciado", "error");
        });

        /* Abrir login */
        document.getElementById("btnLogin")?.addEventListener("click", e => {
            e.preventDefault();
            document.getElementById("nbLoginOverlay")?.classList.add("open");
        });

        /* Cerrar login */
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

        /* Login submit */
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

                localStorage.setItem("email",    data.usuario.email);
                localStorage.setItem("password", password);
                localStorage.setItem("rol",      data.usuario.rol);

                document.getElementById("nbLoginOverlay")?.classList.remove("open");
                actualizarSesionUI();
                mostrarToast("¡Bienvenido!", "success");
            } catch {
                errorEl?.classList.remove("d-none");
            }
        });

        /* Confirmar pedido */
        document.getElementById("btnConfirmar")?.addEventListener("click", finalizarCompra);

        /* Logout */
        document.getElementById("btnLogout")?.addEventListener("click", () => {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            localStorage.removeItem("rol");
            actualizarSesionUI();
            mostrarToast("Sesión cerrada", "success");
        });
    });
}