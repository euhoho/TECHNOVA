/* ════════════════════════════════════════════
   TECHNOVA — carrito.js
   Carpeta: /js/carrito.js
════════════════════════════════════════════ */

export function getCarrito() {
    return JSON.parse(sessionStorage.getItem('carrito')) || [];
}

export function guardarCarrito(carrito) {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
}

export function agregarProducto(producto) {
    const carrito = getCarrito();
    const existente = carrito.find(p => p.idProducto === producto.idProducto);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    guardarCarrito(carrito);
}

export function eliminarProductoCarrito(idProducto) {
    const carrito = getCarrito().filter(p => p.idProducto !== idProducto);
    guardarCarrito(carrito);
}

export function contarItems() {
    return getCarrito().reduce((acc, p) => acc + p.cantidad, 0);
}

export function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) contador.textContent = contarItems();

    // También actualiza el contador del navbar compartido
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = contarItems();
}

export function renderizarCarrito() {
    const carrito    = getCarrito();
    const contenedor = document.getElementById('carrito-contenido');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    let total = 0;

    carrito.forEach(p => {
        total += p.precio * p.cantidad;
        contenedor.innerHTML += `
            <div class="d-flex align-items-center mb-3">
                <img src="${p.imagen}" width="60" class="me-3"
                     onerror="this.style.display='none'">
                <div class="flex-grow-1">
                    <div>${p.nombre}</div>
                    <small>${p.cantidad} x ${p.precio.toFixed(2)} €</small>
                </div>
                <div class="fw-bold">${(p.precio * p.cantidad).toFixed(2)} €</div>
            </div>`;
    });

    const totalEl = document.getElementById('carrito-total');
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

export async function finalizarCompra() {
    const carrito  = getCarrito();
    const email    = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');

    if (!email || !password) {
        alert('Debes iniciar sesión para realizar un pedido');
        return;
    }

    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const pedido = {
        usuario: { email, password },
        lineas: carrito.map(p => ({
            idProducto: p.idProducto,
            cantidad:   p.cantidad
        }))
    };

    const response = await fetch('http://localhost:8080/api/pedidos/crear?descontarStock=true', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(pedido)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || 'Error al realizar el pedido');
    }

    guardarCarrito([]);
    actualizarContadorCarrito();
}

/* ── Inicialización ── */
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();

    const carritoOffcanvas = document.getElementById('carritoOffcanvas');
    if (carritoOffcanvas) {
        carritoOffcanvas.addEventListener('show.bs.offcanvas', () => {
            renderizarCarrito();
        });
    }
});