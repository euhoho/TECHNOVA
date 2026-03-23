import { agregarProducto, actualizarContadorCarrito } from "./carrito.js";

let todosLosProductos = [];
async function cargarProductos() {
  try {
    const response = await fetch("http://localhost:8080/api/productos");
    const productos = await response.json();

    console.log(productos[0]);

    todosLosProductos = productos;

    pintarProductos(todosLosProductos);
    activarFiltroCategorias();
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

  productos.forEach((p) => {
    const card = document.createElement("div");
    card.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

    card.innerHTML = `
        <div class="card h-100 ${p.stock <= 0 ? "producto-agotado" : ""}">
            <img src="img/${p.imagen}" class="card-img-top" alt="${p.nombre}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${p.nombre}</h5>
                <p class="card-text">${p.descripcion}</p>
                <p class="fw-bold">${p.precio.toFixed(2)} €</p>
                <p class="text-muted">Stock: ${p.stock}</p>

                <button 
                    class="btn mt-auto btn-add-cart ${p.stock <= 0 ? "btn-agotado" : "btn-disponible"}"
                            ${p.stock <= 0 ? "disabled" : ""}
                            data-id="${p.id_producto}"
                            data-nombre="${p.nombre}"
                            data-precio="${p.precio}"
                            data-imagen="${p.imagen}">
                            ${p.stock <= 0 ? "Agotado" : "Añadir al carrito"}
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
  const ordenar = document.getElementById("ordenar-productos");
  const sliderMin = document.getElementById("precio-min");
  const sliderMax = document.getElementById("precio-max");

  const texto = buscador ? buscador.value.toLowerCase().trim() : "";
  const categoria = categoriaActiva
    ? categoriaActiva.dataset.categoria.toLowerCase()
    : "todos";
  const criterioOrden = ordenar ? ordenar.value : "default";
  const min = sliderMin ? Number(sliderMin.value) : 0;
  const max = sliderMax ? Number(sliderMax.value) : Infinity;

  let resultado = todosLosProductos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto);

    const coincideCategoria =
      categoria === "todos" || producto.categoria.toLowerCase() === categoria;

    const precio = Number(producto.precio);
    const coincidePrecio = precio >= min && precio <= max;

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

  categorias.forEach((cat) => {
    cat.addEventListener("click", () => {
      categorias.forEach((c) => c.classList.remove("active"));
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

function activarBotonesAgregar() {
  const botones = document.querySelectorAll(".btn-add-cart");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = {
        idProducto: parseInt(btn.dataset.id),
        nombre: btn.dataset.nombre,
        precio: parseFloat(btn.dataset.precio),
        imagen: btn.dataset.imagen,
        cantidad: 1,
      };

      agregarProducto(producto);
      actualizarContadorCarrito();

      // Feedback visual en el botón
      const textoOriginal = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2 me-1"></i> ¡Añadido!';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
      }, 1200);
    });
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

  if (
    !sliderMin ||
    !sliderMax ||
    !valorMin ||
    !valorMax ||
    !sliderRange ||
    todosLosProductos.length === 0
  )
    return;

  const minReal = Math.floor(
    Math.min(...todosLosProductos.map((p) => Number(p.precio))),
  );
  const maxReal = Math.ceil(
    Math.max(...todosLosProductos.map((p) => Number(p.precio))),
  );

  sliderMin.min = minReal;
  sliderMin.max = maxReal;
  sliderMax.min = minReal;
  sliderMax.max = maxReal;

  sliderMin.value = minReal;
  sliderMax.value = maxReal;

  function actualizarSlider(e) {
    let min = Number(sliderMin.value);
    let max = Number(sliderMax.value);

    if (min > max) {
      if (e && e.target === sliderMin) {
        sliderMin.value = max;
        min = max;
      } else {
        sliderMax.value = min;
        max = min;
      }
    }

    valorMin.textContent = `${min.toFixed(2)} €`;
    valorMax.textContent = `${max.toFixed(2)} €`;

    const total = maxReal - minReal || 1;
    const minPercent = ((min - minReal) / total) * 100;
    const maxPercent = ((max - minReal) / total) * 100;

    sliderRange.style.left = `${minPercent}%`;
    sliderRange.style.width = `${maxPercent - minPercent}%`;

    aplicarFiltrosYOrden();
  }

  sliderMin.addEventListener("input", actualizarSlider);
  sliderMax.addEventListener("input", actualizarSlider);

  actualizarSlider();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContadorCarrito();
  activarBuscador();

  // Leer ?categoria= de la URL y preseleccionar el filtro al cargar
  const params = new URLSearchParams(window.location.search);
  const categoriaURL = params.get("categoria");

  if (categoriaURL) {
    // Esperar a que los productos carguen antes de filtrar
    const intervalo = setInterval(() => {
      if (todosLosProductos.length > 0) {
        clearInterval(intervalo);

        // Activar visualmente la categoria-card correcta
        const categorias = document.querySelectorAll(".categoria-card");
        categorias.forEach((c) => c.classList.remove("active"));
        const cardActiva = document.querySelector(
          `.categoria-card[data-categoria="${categoriaURL}"]`,
        );
        if (cardActiva) cardActiva.classList.add("active");

        // Filtrar productos
        const filtrados = todosLosProductos.filter(
          (p) => p.categoria.toLowerCase() === categoriaURL.toLowerCase(),
        );
        pintarProductos(filtrados);
      }
    }, 100);
  }
});
