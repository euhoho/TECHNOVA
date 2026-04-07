async function cargarNavbar() {
  const res        = await fetch('navbar.html');
  const html       = await res.text();
  const contenedor = document.getElementById('navbar-container');
  if (!contenedor) return;
  contenedor.innerHTML = html;

  const navbar         = document.getElementById('navbar');
  const hamburger      = document.getElementById('hamburger');
  const navLinks       = document.getElementById('navLinks');
  const searchInput    = document.getElementById('searchInput');
  const searchBtn      = document.getElementById('searchBtn');
  const searchDropdown = document.getElementById('searchDropdown');
  const loginOverlay    = document.getElementById('nbLoginOverlay');
  const registerOverlay = document.getElementById('nbRegisterOverlay');

  /* ── Scroll ── */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ── Hamburger ── */
  if (hamburger && navLinks) {
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
  }

  /* ── Buscador ── */
  if (searchInput && searchBtn && searchDropdown) {
    let PRODUCTS = [];

    function normalizar(texto) {
      return (texto || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    fetch('http://localhost:8080/api/productos')
      .then(r => r.json())
      .then(data => {
        PRODUCTS = data.map(p => ({
          name:        p.nombre,
          cat:         p.categoria   || 'Producto',
          imagen:      p.imagen      || '',
          descripcion: p.descripcion || ''
        }));
      })
      .catch(() => { PRODUCTS = []; });

    function renderResults(query) {
      const q = normalizar(query.trim());
      if (!q) { searchDropdown.classList.remove('open'); return; }
      const matches = PRODUCTS.filter(p =>
        normalizar(p.name).includes(q)       ||
        normalizar(p.cat).includes(q)        ||
        normalizar(p.descripcion).includes(q)
      );
      searchDropdown.innerHTML = matches.length
        ? matches.map(p => `
            <div class="search-result-item" onclick="window.location.href='catalogo.html?buscar=${encodeURIComponent(p.name)}'">
              <img src="img/${p.imagen}" alt="${p.name}"
                style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:rgba(255,255,255,0.04);"
                onerror="this.style.display='none'">
              <div>
                <strong>${p.name}</strong>
                <small style="display:block;color:var(--text-muted);font-size:0.75rem">${p.cat}</small>
              </div>
            </div>`).join('')
        : `<div class="search-no-result">Sin resultados para "<em>${query}</em>"</div>`;
      searchDropdown.classList.add('open');
    }

    searchInput.addEventListener('input', () => renderResults(searchInput.value));
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = 'catalogo.html?buscar=' + encodeURIComponent(searchInput.value.trim());
      }
    });
    searchBtn.addEventListener('click', () => {
      if (searchInput.value.trim()) {
        window.location.href = 'catalogo.html?buscar=' + encodeURIComponent(searchInput.value.trim());
      }
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-search')) searchDropdown.classList.remove('open');
    });
  }

  /* ── Auth ── */
  function abrirLogin()    { if (loginOverlay)    loginOverlay.classList.add('open'); }
  function cerrarLogin()   {
    if (loginOverlay) loginOverlay.classList.remove('open');
    const err = document.getElementById('nbLoginError');
    const frm = document.getElementById('nbLoginForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }
  function abrirRegister() { if (registerOverlay) registerOverlay.classList.add('open'); }
  function cerrarRegister() {
    if (registerOverlay) registerOverlay.classList.remove('open');
    const err = document.getElementById('nbRegisterError');
    const frm = document.getElementById('nbRegisterForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }

  function actualizarUIAuth() {
    const email     = sessionStorage.getItem('email');
    const authGroup = document.querySelector('.auth-group');
    if (!authGroup) return;

    if (email) {
      authGroup.innerHTML = `
        <div class="nb-user-zone">
          <span class="nb-user-email">${email}</span>
          <button class="nb-btn-logout" id="nbLogout">Salir</button>
        </div>`;
      const logoutBtn = document.getElementById('nbLogout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          sessionStorage.clear();
          actualizarUIAuth();
        });
      }
    } else {
      authGroup.innerHTML = `
        <a href="#" class="btn-outline" id="btnLoginDyn">Iniciar Sesión</a>
        <a href="#" class="btn-neon" id="btnRegisterDyn">Registrarse</a>`;
      document.getElementById('btnLoginDyn').addEventListener('click', e => { e.preventDefault(); abrirLogin(); });
      document.getElementById('btnRegisterDyn').addEventListener('click', e => { e.preventDefault(); abrirRegister(); });
    }
  }

  actualizarUIAuth();

  /* Cerrar modales al hacer clic fuera */
  if (loginOverlay) {
    loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) cerrarLogin(); });
  }
  if (registerOverlay) {
    registerOverlay.addEventListener('click', e => { if (e.target === registerOverlay) cerrarRegister(); });
  }

  /* Botones cerrar y switch */
  const nbLoginClose    = document.getElementById('nbLoginClose');
  const nbRegisterClose = document.getElementById('nbRegisterClose');
  const nbGoRegister    = document.getElementById('nbGoRegister');
  const nbGoLogin       = document.getElementById('nbGoLogin');

  if (nbLoginClose)    nbLoginClose.addEventListener('click', cerrarLogin);
  if (nbRegisterClose) nbRegisterClose.addEventListener('click', cerrarRegister);
  if (nbGoRegister)    nbGoRegister.addEventListener('click', e => { e.preventDefault(); cerrarLogin(); abrirRegister(); });
  if (nbGoLogin)       nbGoLogin.addEventListener('click', e => { e.preventDefault(); cerrarRegister(); abrirLogin(); });

  /* ── Login submit ── */
  const nbLoginForm = document.getElementById('nbLoginForm');
  if (nbLoginForm) {
    nbLoginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('nbLoginEmail').value.trim();
      const password = document.getElementById('nbLoginPassword').value;
      const errorEl  = document.getElementById('nbLoginError');
      errorEl.classList.add('d-none');
      try {
        const res  = await fetch('http://localhost:8080/api/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.status !== 'ok') throw new Error();
        sessionStorage.setItem('email',    data.usuario.email);
        sessionStorage.setItem('password', password);
        sessionStorage.setItem('rol',      data.usuario.rol);
        cerrarLogin();
        actualizarUIAuth();
      } catch {
        errorEl.classList.remove('d-none');
      }
    });
  }

  /* ── Registro submit ── */
  const nbRegisterForm = document.getElementById('nbRegisterForm');
  if (nbRegisterForm) {
    nbRegisterForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('nbRegisterEmail').value.trim();
      const password = document.getElementById('nbRegisterPassword').value;
      const confirm  = document.getElementById('nbRegisterConfirm').value;
      const errorEl  = document.getElementById('nbRegisterError');
      errorEl.classList.add('d-none');

      if (password !== confirm) {
        errorEl.textContent = 'Las contraseñas no coinciden.';
        errorEl.classList.remove('d-none');
        return;
      }

      try {
        const res = await fetch('http://localhost:8080/api/usuarios/registrar', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.mensaje || 'Error al registrar');
        }
        cerrarRegister();
        abrirLogin();
        document.getElementById('nbLoginEmail').value = email;
      } catch (err) {
        errorEl.textContent = err.message || 'Error al registrar. Inténtalo de nuevo.';
        errorEl.classList.remove('d-none');
      }
    });
  }

  /* ── Contador carrito ── */
  const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
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