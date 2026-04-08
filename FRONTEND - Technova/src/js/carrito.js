// ===============================
// STORAGE
// ===============================
export function getCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===============================
// CARRITO
// ===============================
export function agregarProducto(producto) {
    let carrito = getCarrito();

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

    // Esto hace que TODO se actualice correctamente
    location.reload();
}
// ===============================
// CONTADOR NAVBAR
// ===============================
export function contarItems() {
    return getCarrito().reduce((acc, p) => acc + p.cantidad, 0);
}

export function actualizarContadorCarrito() {
    const contador = document.getElementById("cart-count");
    if (!contador) return;

    contador.textContent = contarItems();
}

// ===============================
// RENDER CARRITO (SIMPLE / GLOBAL)
// ===============================
export function renderizarCarrito() {
    const carrito = getCarrito();

    // soporta ambas páginas
    const contenedor =
        document.getElementById("carritoItems") ||
        document.getElementById("carrito-contenido");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach(p => {
        total += p.precio * p.cantidad;

        contenedor.innerHTML += `
            <div class="d-flex align-items-center mb-3">
                <img src="${p.imagen}" width="60" class="me-3">
                <div class="flex-grow-1">
                    <div>${p.nombre}</div>
                    <small>${p.cantidad} x ${p.precio.toFixed(2)}€</small>
                </div>
                <div class="fw-bold">
                    ${(p.precio * p.cantidad).toFixed(2)}€
                </div>
            </div>
        `;
    });

    const totalEl =
        document.getElementById("carrito-total") ||
        document.getElementById("resumenTotal");

    if (totalEl) {
        totalEl.textContent = total.toFixed(2) + " €";
    }
}

// ===============================
// FINALIZAR COMPRA
// ===============================
export async function finalizarCompra() {

    const carrito = getCarrito();

    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    if (!email || !password) {
        alert("Debes iniciar sesión para realizar un pedido");
        return;
    }

    const pedido = {
        usuario: { email, password },
        lineas: carrito.map(p => ({
            idProducto: p.idProducto,
            cantidad: p.cantidad
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

            localStorage.removeItem("carrito");
            alert("Pedido realizado con éxito. ID: " + data.idPedido);

            location.reload();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.mensaje);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}