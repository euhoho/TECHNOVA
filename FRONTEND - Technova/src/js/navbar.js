/* ═══════════════════════════════════════════════════════════
   MODAL REGISTRO — creado directamente en el DOM, sin depender
   de cargarNavbar() ni de navbar.html
═══════════════════════════════════════════════════════════ */
function crearModalRegistro() {
  if (document.getElementById('nbRegisterOverlay')) return; // ya existe
  const el = document.createElement('div');
  el.id = 'nbRegisterOverlay';
  el.className = 'nb-modal-overlay';
  el.innerHTML = `
    <div class="nb-modal-card">
      <div class="nb-modal-header">
        <h3>Crear cuenta</h3>
        <button class="nb-modal-close" id="nbRegisterClose">&#x2715;</button>
      </div>
      <div class="nb-modal-body">
        <form id="nbRegisterForm" novalidate>
          <div class="nb-form-group">
            <label>Email</label>
            <input type="email" id="nbRegisterEmail" placeholder="tu@email.com" autocomplete="email" required/>
          </div>
          <div class="nb-form-group">
            <label>Contraseña</label>
            <input type="password" id="nbRegisterPassword" placeholder="••••••••" autocomplete="new-password" required/>
          </div>
          <div class="nb-form-group">
            <label>Confirmar contraseña</label>
            <input type="password" id="nbRegisterConfirm" placeholder="••••••••" autocomplete="new-password" required/>
          </div>
          <div class="nb-form-error d-none" id="nbRegisterError"></div>
          <button type="submit" class="nb-btn-neon w-full" id="nbRegisterSubmit">Crear cuenta</button>
          <p class="nb-modal-switch">¿Ya tienes cuenta? <a href="#" id="nbGoLogin">Iniciar Sesión</a></p>
        </form>
      </div>
    </div>`;
  document.body.appendChild(el);
  inicializarModalRegistro();
}

function inicializarModalRegistro() {
  /* Cerrar con X */
  document.getElementById('nbRegisterClose')?.addEventListener('click', cerrarRegisterGlobal);

  /* Cerrar al clicar el fondo */
  document.getElementById('nbRegisterOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarRegisterGlobal();
  });

  /* Switch → login */
  document.getElementById('nbGoLogin')?.addEventListener('click', function(e) {
    e.preventDefault();
    cerrarRegisterGlobal();
    abrirLoginGlobal();
  });

  /* Submit */
  document.getElementById('nbRegisterForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email     = document.getElementById('nbRegisterEmail').value.trim();
    const password  = document.getElementById('nbRegisterPassword').value;
    const confirm   = document.getElementById('nbRegisterConfirm').value;
    const errorEl   = document.getElementById('nbRegisterError');
    const submitBtn = document.getElementById('nbRegisterSubmit');
    errorEl.classList.add('d-none');

    /* Validar email */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = 'Introduce un correo electrónico válido.';
      errorEl.classList.remove('d-none');
      return;
    }
    /* Validar longitud */
    if (password.length < 6) {
      errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      errorEl.classList.remove('d-none');
      return;
    }
    /* Validar confirmación */
    if (password !== confirm) {
      errorEl.textContent = 'Las contraseñas no coinciden.';
      errorEl.classList.remove('d-none');
      return;
    }

    submitBtn.textContent = 'Creando cuenta…';
    submitBtn.disabled = true;

    try {
      const res = await fetch(BASE_URL + '/api/usuarios/sign-up', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      if (!res.ok) {
        let msg = 'Error al registrar. Inténtalo de nuevo.';
        try { const d = await res.json(); msg = d.mensaje || msg; } catch (_) {}
        throw new Error(msg);
      }
      /* Éxito */
      cerrarRegisterGlobal();
      document.getElementById('nbRegisterForm').reset();
      abrirLoginGlobal();
      const loginEmail = document.getElementById('nbLoginEmail');
      if (loginEmail) loginEmail.value = email;
    } catch (err) {
      errorEl.textContent = err.message || 'Error al registrar. Inténtalo de nuevo.';
      errorEl.classList.remove('d-none');
    } finally {
      submitBtn.textContent = 'Crear cuenta';
      submitBtn.disabled = false;
    }
  });
}

function cerrarRegisterGlobal() {
  const o   = document.getElementById('nbRegisterOverlay');
  const err = document.getElementById('nbRegisterError');
  const frm = document.getElementById('nbRegisterForm');
  if (o)   o.classList.remove('open');
  if (err) err.classList.add('d-none');
  if (frm) frm.reset();
}

function abrirLoginGlobal() {
  /* Intenta abrir cualquier modal de login disponible en la página */
  const nbOverlay = document.getElementById('nbLoginOverlay');
  if (nbOverlay) { nbOverlay.classList.add('open'); return; }
  const pageModal = document.getElementById('loginModal');
  if (!pageModal) return;
  if (pageModal.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    new bootstrap.Modal(pageModal).show();
  } else {
    pageModal.classList.add('open');
  }
}

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

    fetch(BASE_URL + '/api/productos')
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

  /* ══════════════════════════════════════
     AUTH — un solo sistema: localStorage
  ══════════════════════════════════════ */
  function abrirLogin()    {
    const o = document.getElementById('nbLoginOverlay');
    if (o) o.classList.add('open');
  }
  function cerrarLogin()   {
    const o = document.getElementById('nbLoginOverlay');
    if (o) o.classList.remove('open');
    const err = document.getElementById('nbLoginError');
    const frm = document.getElementById('nbLoginForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }
  function abrirRegister() {
    const o = document.getElementById('nbRegisterOverlay');
    if (o) o.classList.add('open');
  }
  function cerrarRegister() {
    const o = document.getElementById('nbRegisterOverlay');
    if (o) o.classList.remove('open');
    const err = document.getElementById('nbRegisterError');
    const frm = document.getElementById('nbRegisterForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }

  /* Actualiza la zona de auth segun localStorage */
  function actualizarUIAuth() {
    const email = localStorage.getItem('email');
    const rol   = localStorage.getItem('rol');

    const authGroup    = document.querySelector('.auth-group');
    const navUserZone  = document.getElementById('nav-user-zone');
    const navSaludo    = document.getElementById('nav-saludo');
    const navAdminZone = document.getElementById('nav-admin-zone');

    if (email) {
      if (authGroup)    authGroup.classList.add('d-none');
      if (navUserZone)  navUserZone.classList.remove('d-none');
      if (navSaludo)    navSaludo.textContent = 'Hola, ' + email;
      if (navAdminZone && rol === 'ADMINISTRADOR') navAdminZone.classList.remove('d-none');
    } else {
      if (authGroup)    authGroup.classList.remove('d-none');
      if (navUserZone)  navUserZone.classList.add('d-none');
      if (navAdminZone) navAdminZone.classList.add('d-none');
    }
  }

  actualizarUIAuth();
  window.actualizarUIUsuario = actualizarUIAuth;

  /* ── Abrir modales desde botones del navbar ── */
  document.addEventListener('click', e => {
    // Login
    if (e.target.closest('#btnLogin') || e.target.closest('#btnLoginDyn')) {
      e.preventDefault();
      const pageModal = document.getElementById('loginModal');
      if (pageModal) {
        if (pageModal.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          new bootstrap.Modal(pageModal).show();
        } else {
          pageModal.classList.add('open');
        }
        return;
      }
      abrirLogin();
      return;
    }
    // Registro
    if (e.target.closest('#btnRegister') || e.target.closest('#btnRegisterDyn')) {
      e.preventDefault();
      cerrarRegisterGlobal(); crearModalRegistro(); document.getElementById('nbRegisterOverlay')?.classList.add('open');
      return;
    }
    // Cerrar al clicar fuera
    const lo = document.getElementById('nbLoginOverlay');
    const ro = document.getElementById('nbRegisterOverlay');
    if (lo && lo.classList.contains('open') && e.target === lo) cerrarLogin();
    if (ro && ro.classList.contains('open') && e.target === ro) cerrarRegisterGlobal();
  });

  /* ── Botones cerrar y switch ── */
  const nbLoginClose    = document.getElementById('nbLoginClose');
  const nbRegisterClose = document.getElementById('nbRegisterClose');
  const nbGoRegister    = document.getElementById('nbGoRegister');
  const nbGoLogin       = document.getElementById('nbGoLogin');

  if (nbLoginClose)    nbLoginClose.addEventListener('click', cerrarLogin);
    if (nbRegisterClose) nbRegisterClose.addEventListener('click', cerrarRegisterGlobal);
    if (nbGoRegister)    nbGoRegister.addEventListener('click', e => { e.preventDefault(); cerrarLogin(); crearModalRegistro(); document.getElementById('nbRegisterOverlay')?.classList.add('open'); });
    if (nbGoLogin)       nbGoLogin.addEventListener('click', e => { e.preventDefault(); cerrarRegisterGlobal(); abrirLogin(); });

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
        const res  = await fetch(BASE_URL + '/api/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.status !== 'ok') throw new Error();

        localStorage.setItem('email',    data.usuario.email);
        localStorage.setItem('password', password);
        localStorage.setItem('rol',      data.usuario.rol);

        cerrarLogin();
        actualizarUIAuth();
        actualizarContadorCarrito();
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
        errorEl.textContent = 'Las contrasenas no coinciden.';
        errorEl.classList.remove('d-none');
        return;
      }

      try {
        const res = await fetch(BASE_URL + '/api/usuarios/sign-up', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        if (!res.ok) {
          let mensajeError = 'Error al registrar. Inténtalo de nuevo.';
          try { const d = await res.json(); mensajeError = d.mensaje || mensajeError; } catch (_) {}
          throw new Error(mensajeError);
        }
        cerrarRegisterGlobal();
        abrirLogin();
        document.getElementById('nbLoginEmail').value = email;
        nbRegisterForm.reset();
      } catch (err) {
        errorEl.textContent = err.message || 'Error al registrar. Inténtalo de nuevo.';
        errorEl.classList.remove('d-none');
      }
    });
  }

  /* ── Logout ── */
  document.addEventListener('click', e => {
    if (e.target && (e.target.id === 'btnLogout' || e.target.id === 'nbLogout')) {
      e.preventDefault();
      localStorage.clear();
      location.reload();
    }
  });

  actualizarContadorCarrito();
}

/* ── Actualizar contador del carrito ── */
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total   = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const count   = document.getElementById('cartCount');
  if (count) count.textContent = total;
}

/* ── Navbar local (carrito.html tiene navbar en su propio HTML) ── */
function inicializarNavbarLocal() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) return;

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
}

/* ══════════════════════════════════════
   HANDLERS GLOBALES — funcionan aunque cargarNavbar() falle
══════════════════════════════════════ */
document.addEventListener('click', function(e) {
  // Abrir login
  if (e.target.closest('#btnLogin') || e.target.closest('#btnLoginDyn')) {
    e.preventDefault();
    const pageModal = document.getElementById('loginModal');
    if (pageModal) {
      if (pageModal.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        new bootstrap.Modal(pageModal).show();
      } else {
        pageModal.classList.add('open');
      }
      return;
    }
    const o = document.getElementById('nbLoginOverlay');
    if (o) o.classList.add('open');
    return;
  }
  // Abrir registro
  if (e.target.closest('#btnRegister') || e.target.closest('#btnRegisterDyn')) {
    e.preventDefault();
    const o = document.getElementById('nbRegisterOverlay');
    if (o) o.classList.add('open');
    return;
  }
  // Switch login → registro
  if (e.target.id === 'nbGoRegister') {
    e.preventDefault();
    const lo = document.getElementById('nbLoginOverlay');
    const ro = document.getElementById('nbRegisterOverlay');
    if (lo) lo.classList.remove('open');
    if (ro) ro.classList.add('open');
    return;
  }
  // Switch registro → login
  if (e.target.id === 'nbGoLogin') {
    e.preventDefault();
    const lo = document.getElementById('nbLoginOverlay');
    const ro = document.getElementById('nbRegisterOverlay');
    if (ro) ro.classList.remove('open');
    if (lo) lo.classList.add('open');
    return;
  }
  // Cerrar modal index.html — botón X y Cancelar
  if (e.target.closest('#modal-close-login') || e.target.closest('#btn-cancel-login')) {
    e.preventDefault();
    const m = document.getElementById('loginModal');
    if (m) m.classList.remove('open');
    return;
  }
  // Cerrar modal index.html al clicar fuera
  const indexModal = document.getElementById('loginModal');
  if (indexModal && indexModal.classList.contains('open') && e.target === indexModal) {
    indexModal.classList.remove('open');
    return;
  }
  // Cerrar modales navbar al clicar fuera
  const lo = document.getElementById('nbLoginOverlay');
  const ro = document.getElementById('nbRegisterOverlay');
  if (lo && lo.classList.contains('open') && e.target === lo) {
    lo.classList.remove('open');
    const err = document.getElementById('nbLoginError');
    const frm = document.getElementById('nbLoginForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }
  if (ro && ro.classList.contains('open') && e.target === ro) {
    ro.classList.remove('open');
    const err = document.getElementById('nbRegisterError');
    const frm = document.getElementById('nbRegisterForm');
    if (err) err.classList.add('d-none');
    if (frm) frm.reset();
  }
});

/* Exponer globalmente */
window.actualizarUIUsuario = function(email, rol) {
  const authGroup    = document.querySelector('.auth-group');
  const navUserZone  = document.getElementById('nav-user-zone');
  const navSaludo    = document.getElementById('nav-saludo');
  const navAdminZone = document.getElementById('nav-admin-zone');

  if (authGroup)    authGroup.classList.add('d-none');
  if (navUserZone)  navUserZone.classList.remove('d-none');
  if (navSaludo)    navSaludo.textContent = 'Hola, ' + email;
  if (navAdminZone && rol === 'ADMINISTRADOR') navAdminZone.classList.remove('d-none');
};

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  crearModalRegistro();

  if (document.getElementById('navbar-container')) {
    cargarNavbar();
  } else {
    inicializarNavbarLocal();
  }

  setTimeout(() => {
    const email = localStorage.getItem('email');
    const rol   = localStorage.getItem('rol');
    if (email && rol && window.actualizarUIUsuario) {
      window.actualizarUIUsuario(email, rol);
    }
    actualizarContadorCarrito();
  }, 150);

  window.addEventListener('storage', e => {
    if (e.key === 'email' || e.key === 'rol' || e.key === null) {
      const email = localStorage.getItem('email');
      const rol   = localStorage.getItem('rol');
      if (email && rol) {
        window.actualizarUIUsuario && window.actualizarUIUsuario(email, rol);
      } else {
        location.reload();
      }
    }
  });

  window.addEventListener('loginChanged', e => {
    window.actualizarUIUsuario && window.actualizarUIUsuario(e.detail.email, e.detail.rol);
  });
});