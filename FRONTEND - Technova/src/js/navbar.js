async function cargarNavbar() {
  const res  = await fetch('./navbar.html');
  const html = await res.text();
  const contenedor = document.getElementById('navbar-container');
  if (!contenedor) return;
  
  contenedor.innerHTML = html;

  // Obtener elementos con null checks
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) {
    console.error("Error: No se encontraron elementos del navbar");
    return;
  }

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(7px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Contador carrito
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total   = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const count   = document.getElementById('cartCount');
  if (count) count.textContent = total;

  // Actualizar UI si hay sesión
  const email = localStorage.getItem("email");
  const rol = localStorage.getItem("rol");
  if (email && rol) {
    actualizarUIUsuario(email, rol);
  }

  // Event listener para logout usando delegation
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnLogout') {
      e.preventDefault();
      localStorage.clear();
      location.reload();
    }
  });
}

function actualizarUIUsuario(email, rol) {
  const authGroup = document.querySelector(".auth-group");
  const navUserZone = document.getElementById("nav-user-zone");
  const navSaludo = document.getElementById("nav-saludo");
  const navAdminZone = document.getElementById("nav-admin-zone");
  
  if (authGroup) authGroup.classList.add("d-none");
  if (navUserZone) navUserZone.classList.remove("d-none");
  if (navSaludo) navSaludo.textContent = "Hola, " + email;
  if (navAdminZone && rol === "ADMINISTRADOR") {
    navAdminZone.classList.remove("d-none");
  }
}

function inicializarNavbarLocal() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  if (!navbar || !hamburger || !navLinks) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(7px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// Hacer global para que app.js pueda llamarla
window.actualizarUIUsuario = actualizarUIUsuario;

// Esperar a DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Si existe contenedor navbar, cargar dinámicamente (index, catalogo)
  if (document.getElementById('navbar-container')) {
    cargarNavbar();
  } else {
    // Si no, navbar ya está en HTML (carrito.html) - solo inicializar
    inicializarNavbarLocal();
  }

  // Actualizar UI si hay sesión
  const email = localStorage.getItem("email");
  const rol = localStorage.getItem("rol");
  if (email && rol) {
    setTimeout(() => {
      actualizarUIUsuario(email, rol);
    }, 200);
  }

  // Actualizar contador carrito
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const count = document.getElementById('cartCount');
  if (count) count.textContent = total;

  // Event listener para logout usando delegation
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnLogout') {
      e.preventDefault();
      localStorage.clear();
      location.reload();
    }
  });

  // Escuchar evento personalizado de login desde otras páginas
  window.addEventListener('loginChanged', (e) => {
    const email = e.detail.email;
    const rol = e.detail.rol;
    actualizarUIUsuario(email, rol);
  });

  // Escuchar cambios de localStorage desde otras pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === 'email' || e.key === 'rol' || e.key === null) {
      const email = localStorage.getItem("email");
      const rol = localStorage.getItem("rol");
      if (email && rol) {
        actualizarUIUsuario(email, rol);
      } else {
        // Si se limpió localStorage (logout), recargar
        location.reload();
      }
    }
  });
});