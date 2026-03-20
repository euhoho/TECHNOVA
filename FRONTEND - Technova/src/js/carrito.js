// carrito.js

export function getCarrito() {
    return JSON.parse(sessionStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
    sessionStorage.setItem("carrito", JSON.stringify(carrito));
}

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

export function contarItems() {
    return getCarrito().reduce((acc, p) => acc + p.cantidad, 0);
}

export function actualizarContadorCarrito() {
    const contador = document.getElementById("cart-count");
    if (!contador) return;

    contador.textContent = contarItems();
}

export function renderizarCarrito() {
    const carrito = getCarrito();
    const contenedor = document.getElementById("carrito-contenido");

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

    export async function finalizarCompra() {

        const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

        const email = sessionStorage.getItem("email");
        const password = sessionStorage.getItem("password"); // si lo guardas
        if (!email || !password) {
    alert("Debes iniciar sesión para realizar un pedido");
    return;
}

        const pedido = {
            usuario: {
                email: email,
                password: password
            },
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

document.addEventListener("DOMContentLoaded", () => {

    const carritoOffcanvas = document.getElementById("carritoOffcanvas");

    if (carritoOffcanvas) {
        carritoOffcanvas.addEventListener("show.bs.offcanvas", () => {
            renderizarCarrito();
        });
    }

});

