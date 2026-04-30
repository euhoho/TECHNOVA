// ════════════════════════════════════════
// TECHNOVA — navbar.js
// Gestión global del navbar: modales de login/registro,
// menú hamburguesa, buscador, autenticación y contador del carrito
// ════════════════════════════════════════

// ── MODAL LOGIN ──
// Crea el HTML del modal de login y lo inyecta en el body.
// Si ya existe en el DOM, no hace nada para evitar duplicados.
function crearModalLogin() {
  if (document.getElementById('nbLoginOverlay')) return;
  var el = document.createElement('div');
  el.id = 'nbLoginOverlay';
  el.className = 'nb-modal-overlay';
  el.innerHTML =
    '<div class="nb-modal-card">' +
      '<div class="nb-modal-header">' +
        '<h3>Iniciar Sesion</h3>' +
        '<button class="nb-modal-close" id="nbLoginClose">&#x2715;</button>' +
      '</div>' +
      '<div class="nb-modal-body">' +
        '<form id="nbLoginForm" novalidate>' +
          '<div class="nb-form-group">' +
            '<label>Email</label>' +
            '<input type="email" id="nbLoginEmail" placeholder="tu@email.com" autocomplete="email" required/>' +
          '</div>' +
          '<div class="nb-form-group">' +
            '<label>Contrasena</label>' +
            '<input type="password" id="nbLoginPassword" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autocomplete="current-password" required/>' +
          '</div>' +
          '<div class="nb-form-error d-none" id="nbLoginError">Email o contrasena incorrectos.</div>' +
          '<button type="submit" class="nb-btn-neon w-full" id="nbLoginSubmit">Entrar</button>' +
          '<p class="nb-modal-switch">No tienes cuenta? <a href="#" id="nbGoRegister">Registrarse</a></p>' +
        '</form>' +
      '</div>' +
    '</div>';
  document.body.appendChild(el);
  inicializarModalLogin();
}

// Asigna los eventos del modal de login: cerrar, ir a registro y submit del formulario.
// Valida email y contraseña antes de llamar a la API; guarda la sesión si el login es correcto.
function inicializarModalLogin() {
  document.getElementById('nbLoginClose')?.addEventListener('click', cerrarLoginGlobal);

  // Cierra el modal al hacer clic en el fondo oscuro fuera de la tarjeta
  document.getElementById('nbLoginOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarLoginGlobal();
  });

  // Cambia al modal de registro al pulsar el enlace "Registrarse"
  document.getElementById('nbGoRegister')?.addEventListener('click', function(e) {
    e.preventDefault();
    cerrarLoginGlobal();
    crearModalRegistro();
    var ro = document.getElementById('nbRegisterOverlay');
    if (ro) ro.classList.add('open');
  });

  // Submit del formulario de login
  document.getElementById('nbLoginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    var email     = document.getElementById('nbLoginEmail').value.trim();
    var password  = document.getElementById('nbLoginPassword').value;
    var errorEl   = document.getElementById('nbLoginError');
    var submitBtn = document.getElementById('nbLoginSubmit');
    errorEl.classList.add('d-none');

    // Validaciones básicas antes de llamar a la API
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = 'Introduce un correo electronico valido.';
      errorEl.classList.remove('d-none');
      return;
    }
    if (!password) {
      errorEl.textContent = 'La contrasena es requerida.';
      errorEl.classList.remove('d-none');
      return;
    }

    // Deshabilita el botón para evitar envíos múltiples mientras espera la respuesta
    submitBtn.textContent = 'Entrando...';
    submitBtn.disabled = true;

    try {
      var res  = await fetch(BASE_URL + '/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email, password: password })
      });
      var data = await res.json();
      if (data.status !== 'ok') throw new Error(data.mensaje);

      // Guarda la sesión en localStorage y actualiza la UI del navbar
      localStorage.setItem('email',    data.usuario.email);
      localStorage.setItem('password', password);
      localStorage.setItem('rol',      data.usuario.rol);

      cerrarLoginGlobal();
      if (window.actualizarUIUsuario) window.actualizarUIUsuario(data.usuario.email, data.usuario.rol);
      actualizarContadorCarrito();
    } catch(err) {
      errorEl.textContent = 'Email o contrasena incorrectos.';
      errorEl.classList.remove('d-none');
    } finally {
      // Siempre restaura el botón, tanto si tuvo éxito como si falló
      submitBtn.textContent = 'Entrar';
      submitBtn.disabled = false;
    }
  });
}

// Cierra el modal de login: quita la clase 'open', oculta el error y limpia el formulario
function cerrarLoginGlobal() {
  var o   = document.getElementById('nbLoginOverlay');
  var err = document.getElementById('nbLoginError');
  var frm = document.getElementById('nbLoginForm');
  if (o)   o.classList.remove('open');
  if (err) err.classList.add('d-none');
  if (frm) frm.reset();
}

// ── MODAL REGISTRO ──
// Crea el HTML del modal de registro y lo inyecta en el body.
// Igual que login, evita duplicados comprobando si ya existe en el DOM.
function crearModalRegistro() {
  if (document.getElementById('nbRegisterOverlay')) return;
  var el = document.createElement('div');
  el.id = 'nbRegisterOverlay';
  el.className = 'nb-modal-overlay';
  el.innerHTML =
    '<div class="nb-modal-card">' +
      '<div class="nb-modal-header">' +
        '<h3>Crear cuenta</h3>' +
        '<button class="nb-modal-close" id="nbRegisterClose">&#x2715;</button>' +
      '</div>' +
      '<div class="nb-modal-body">' +
        '<form id="nbRegisterForm" novalidate>' +
          '<div class="nb-form-group">' +
            '<label>Email</label>' +
            '<input type="email" id="nbRegisterEmail" placeholder="tu@email.com" autocomplete="email" required/>' +
          '</div>' +
          '<div class="nb-form-group">' +
            '<label>Contrasena</label>' +
            '<input type="password" id="nbRegisterPassword" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autocomplete="new-password" required/>' +
          '</div>' +
          '<div class="nb-form-group">' +
            '<label>Confirmar contrasena</label>' +
            '<input type="password" id="nbRegisterConfirm" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autocomplete="new-password" required/>' +
          '</div>' +
          '<div class="nb-form-error d-none" id="nbRegisterError"></div>' +
          '<button type="submit" class="nb-btn-neon w-full" id="nbRegisterSubmit">Crear cuenta</button>' +
          '<p class="nb-modal-switch">Ya tienes cuenta? <a href="#" id="nbGoLogin">Iniciar Sesion</a></p>' +
        '</form>' +
      '</div>' +
    '</div>';
  document.body.appendChild(el);
  inicializarModalRegistro();
}

// Asigna los eventos del modal de registro: cerrar, ir a login y submit.
// Valida formato de email, longitud de contraseña y coincidencia antes de llamar a la API.
// Si el registro es exitoso, abre el modal de login con el email ya rellenado.
function inicializarModalRegistro() {
  document.getElementById('nbRegisterClose')?.addEventListener('click', cerrarRegisterGlobal);

  // Cierra al hacer clic en el fondo del overlay
  document.getElementById('nbRegisterOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarRegisterGlobal();
  });

  // Vuelve al modal de login al pulsar "Iniciar Sesion"
  document.getElementById('nbGoLogin')?.addEventListener('click', function(e) {
    e.preventDefault();
    cerrarRegisterGlobal();
    abrirLoginGlobal();
  });

  // Submit del formulario de registro
  document.getElementById('nbRegisterForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    var email     = document.getElementById('nbRegisterEmail').value.trim();
    var password  = document.getElementById('nbRegisterPassword').value;
    var confirm   = document.getElementById('nbRegisterConfirm').value;
    var errorEl   = document.getElementById('nbRegisterError');
    var submitBtn = document.getElementById('nbRegisterSubmit');
    errorEl.classList.add('d-none');

    // Validaciones: formato email, mínimo 6 caracteres y contraseñas coincidentes
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = 'Introduce un correo electronico valido.';
      errorEl.classList.remove('d-none');
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'La contrasena debe tener al menos 6 caracteres.';
      errorEl.classList.remove('d-none');
      return;
    }
    if (password !== confirm) {
      errorEl.textContent = 'Las contrasenas no coinciden.';
      errorEl.classList.remove('d-none');
      return;
    }

    submitBtn.textContent = 'Creando cuenta...';
    submitBtn.disabled = true;

    try {
      var res = await fetch(BASE_URL + '/api/usuarios/sign-up', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email, password: password })
      });
      if (!res.ok) {
        var msg = 'Error al registrar. Intentalo de nuevo.';
        try { var d = await res.json(); msg = d.mensaje || msg; } catch(e2) {}
        throw new Error(msg);
      }
      // Registro correcto: cierra el modal, abre login y rellena el email automáticamente
      cerrarRegisterGlobal();
      document.getElementById('nbRegisterForm').reset();
      abrirLoginGlobal();
      var loginEmail = document.getElementById('nbLoginEmail');
      if (loginEmail) loginEmail.value = email;
    } catch(err) {
      errorEl.textContent = err.message || 'Error al registrar. Intentalo de nuevo.';
      errorEl.classList.remove('d-none');
    } finally {
      submitBtn.textContent = 'Crear cuenta';
      submitBtn.disabled = false;
    }
  });
}

// Cierra el modal de registro: quita 'open', oculta el error y limpia el formulario
function cerrarRegisterGlobal() {
  var o   = document.getElementById('nbRegisterOverlay');
  var err = document.getElementById('nbRegisterError');
  var frm = document.getElementById('nbRegisterForm');
  if (o)   o.classList.remove('open');
  if (err) err.classList.add('d-none');
  if (frm) frm.reset();
}

// Crea el modal de login si no existe y lo abre añadiendo la clase 'open'
function abrirLoginGlobal() {
  crearModalLogin();
  var lo = document.getElementById('nbLoginOverlay');
  if (lo) lo.classList.add('open');
}

// ── CARGA DINÁMICA DEL NAVBAR ──
// Obtiene el HTML del navbar desde navbar.html, lo inyecta en #navbar-container
// y después inicializa todos sus comportamientos (scroll, hamburguesa, buscador y auth).
async function cargarNavbar() {
  var res        = await fetch('navbar.html');
  var html       = await res.text();
  var contenedor = document.getElementById('navbar-container');
  if (!contenedor) return;
  contenedor.innerHTML = html;

  // Elimina los overlays de modal que pudieran haberse incluido en el HTML del navbar
  var loginOld = contenedor.querySelector('#nbLoginOverlay');
  var regOld   = contenedor.querySelector('#nbRegisterOverlay');
  if (loginOld) loginOld.remove();
  if (regOld)   regOld.remove();

  var navbar         = document.getElementById('navbar');
  var hamburger      = document.getElementById('hamburger');
  var navLinks       = document.getElementById('navLinks');
  var searchInput    = document.getElementById('searchInput');
  var searchBtn      = document.getElementById('searchBtn');
  var searchDropdown = document.getElementById('searchDropdown');

  // Añade/quita la clase 'scrolled' al navbar según la posición de scroll
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Cierra el menú móvil: restaura estilos del hamburguesa y scroll del body
  function cerrarMobileMenu() {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove('open');
    navLinks.style.paddingTop = '';
    hamburger.querySelectorAll('span').forEach(function(s) {
      s.style.transform = ''; s.style.opacity = '';
    });
    document.body.style.overflow = '';
    var mobileAuth = navLinks.querySelector('.mobile-auth');
    if (mobileAuth) mobileAuth.remove();
  }

  // ── Menú hamburguesa ──
  // Al abrirse, anima las líneas en forma de X, bloquea el scroll del body
  // e inyecta botones de login/registro (o saludo + logout si hay sesión activa)
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      var isOpen = navLinks.classList.toggle('open');
      var spans  = hamburger.querySelectorAll('span');

      if (isOpen) {
        var navbarH = navbar ? navbar.offsetHeight : 68;
        navLinks.style.paddingTop = (navbarH + 16) + 'px'; // Deja espacio para el navbar fijo

        // Transforma las 3 líneas del hamburguesa en una X
        spans[0].style.transform = 'rotate(45deg) translateY(7px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
        document.body.style.overflow = 'hidden'; // Bloquea scroll mientras el menú está abierto

        // Inyecta los botones de auth al principio de la lista solo si no existen ya
        if (!navLinks.querySelector('.mobile-auth')) {
          var li = document.createElement('li');
          li.className = 'mobile-auth';
          li.style.cssText = 'padding:20px 0;display:flex;gap:12px;border-bottom:1px solid rgba(255,255,255,0.06)!important;margin-bottom:4px;';

          var emailGuardado = localStorage.getItem('email');
          if (emailGuardado) {
            // Usuario logueado: muestra su email y botón de cerrar sesión
            li.innerHTML =
              '<span style="font-family:var(--font-head);font-size:0.7rem;color:var(--text-muted);' +
              'align-self:center;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
              emailGuardado + '</span>' +
              '<button id="mobileLogoutBtn" style="padding:10px 16px;border:1px solid rgba(255,255,255,0.1);' +
              'background:none;border-radius:6px;color:var(--text-muted);font-family:var(--font-head);' +
              'font-size:0.6rem;letter-spacing:1px;text-transform:uppercase;cursor:pointer;">' +
              'Cerrar sesion</button>';
            navLinks.insertBefore(li, navLinks.firstChild);
            setTimeout(function() {
              var btn = document.getElementById('mobileLogoutBtn');
              if (btn) btn.addEventListener('click', function() {
                localStorage.removeItem('email');
                localStorage.removeItem('password');
                localStorage.removeItem('rol');
                location.reload();
              });
            }, 0);
          } else {
            // Usuario no logueado: muestra botones de login y registro
            li.innerHTML =
              '<button id="mobileLoginBtn" style="flex:1;padding:12px;background:transparent;' +
              'border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#e6e6f5;' +
              'font-family:var(--font-head);font-size:0.62rem;letter-spacing:1.5px;' +
              'text-transform:uppercase;cursor:pointer;">Iniciar Sesion</button>' +
              '<button id="mobileRegisterBtn" style="flex:1;padding:12px;background:#e40085;' +
              'border:none;border-radius:6px;color:#fff;font-family:var(--font-head);' +
              'font-size:0.62rem;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;">' +
              'Registrarse</button>';
            navLinks.insertBefore(li, navLinks.firstChild);
            setTimeout(function() {
              var btnLogin = document.getElementById('mobileLoginBtn');
              var btnReg   = document.getElementById('mobileRegisterBtn');
              if (btnLogin) btnLogin.addEventListener('click', function() {
                cerrarMobileMenu(); abrirLoginGlobal();
              });
              if (btnReg) btnReg.addEventListener('click', function() {
                cerrarMobileMenu();
                crearModalRegistro();
                var ro = document.getElementById('nbRegisterOverlay');
                if (ro) ro.classList.add('open');
              });
            }, 0);
          }
        }
      } else {
        cerrarMobileMenu();
      }
    });

    // Cierra el menú móvil al pulsar cualquier enlace de navegación
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() { cerrarMobileMenu(); });
    });

    // Cierra el menú móvil al pulsar Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') cerrarMobileMenu();
    });
  }

  // ── Buscador del navbar ──
  // Carga todos los productos de la API y filtra en tiempo real mientras el usuario escribe.
  // Al pulsar Enter o el botón de lupa redirige al catálogo con ?buscar=...
  if (searchInput && searchBtn && searchDropdown) {
    var PRODUCTS = [];

    // Elimina tildes y normaliza a minúsculas para búsquedas sin diferenciar acentos
    function normalizar(texto) {
      return (texto || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    // Precarga los productos al cargar el navbar para que la búsqueda sea instantánea
    fetch(BASE_URL + '/api/productos')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        PRODUCTS = data.map(function(p) {
          return {
            name:        p.nombre,
            cat:         p.categoria   || 'Producto',
            imagen:      p.imagen      || '',
            descripcion: p.descripcion || ''
          };
        });
      })
      .catch(function() { PRODUCTS = []; });

    // Filtra los productos por la consulta y renderiza los resultados en el dropdown
    function renderResults(query) {
      var q = normalizar(query.trim());
      if (!q) { searchDropdown.classList.remove('open'); return; }
      var matches = PRODUCTS.filter(function(p) {
        return normalizar(p.name).includes(q) ||
               normalizar(p.cat).includes(q)  ||
               normalizar(p.descripcion).includes(q);
      });
      searchDropdown.innerHTML = matches.length
        ? matches.map(function(p) {
            return '<div class="search-result-item" onclick="window.location.href=\'catalogo.html?buscar=' +
              encodeURIComponent(p.name) + '\'">' +
              '<img src="img/' + p.imagen + '" alt="' + p.name + '" ' +
              'style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:rgba(255,255,255,0.04);" ' +
              'onerror="this.style.display=\'none\'">' +
              '<div><strong>' + p.name + '</strong>' +
              '<small style="display:block;color:var(--text-muted);font-size:0.75rem">' + p.cat + '</small></div></div>';
          }).join('')
        : '<div class="search-no-result">Sin resultados para "<em>' + query + '</em>"</div>';
      searchDropdown.classList.add('open');
    }

    searchInput.addEventListener('input', function() { renderResults(searchInput.value); });
    // Enter en el buscador redirige al catálogo con el término de búsqueda
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = 'catalogo.html?buscar=' + encodeURIComponent(searchInput.value.trim());
      }
    });
    searchBtn.addEventListener('click', function() {
      if (searchInput.value.trim()) {
        window.location.href = 'catalogo.html?buscar=' + encodeURIComponent(searchInput.value.trim());
      }
    });
    // Cierra el dropdown al hacer clic fuera del buscador
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-search')) searchDropdown.classList.remove('open');
    });
  }

  // ── Auth UI ──
  // Adapta el navbar según si hay sesión activa: muestra saludo o botones de login/registro.
  // También expone actualizarUIUsuario como función global para llamarla desde otros módulos.
  function actualizarUIAuth() {
    var email = localStorage.getItem('email');
    var rol   = localStorage.getItem('rol');

    var authGroup    = document.querySelector('.auth-group');
    var navUserZone  = document.getElementById('nav-user-zone');
    var navSaludo    = document.getElementById('nav-saludo');
    var navAdminZone = document.getElementById('nav-admin-zone');

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
  window.actualizarUIUsuario = actualizarUIAuth; // Expone la función globalmente

  // Delegación de eventos para abrir modales desde los botones del navbar
  // También cierra cualquier modal al hacer clic en su overlay
  document.addEventListener('click', function(e) {
    if (e.target.closest('#btnLogin') || e.target.closest('#btnLoginDyn')) {
      e.preventDefault();
      var pageModal = document.getElementById('loginModal');
      if (pageModal) {
        // Si hay un modal Bootstrap en la página, lo usa; si no, usa el modal personalizado
        if (pageModal.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          new bootstrap.Modal(pageModal).show();
        } else {
          pageModal.classList.add('open');
        }
        return;
      }
      abrirLoginGlobal();
      return;
    }
    if (e.target.closest('#btnRegister') || e.target.closest('#btnRegisterDyn')) {
      e.preventDefault();
      cerrarRegisterGlobal();
      crearModalRegistro();
      var ro = document.getElementById('nbRegisterOverlay');
      if (ro) ro.classList.add('open');
      return;
    }
    // Cierra los overlays al hacer clic en el fondo
    var lo2 = document.getElementById('nbLoginOverlay');
    var ro2 = document.getElementById('nbRegisterOverlay');
    if (lo2 && lo2.classList.contains('open') && e.target === lo2) cerrarLoginGlobal();
    if (ro2 && ro2.classList.contains('open') && e.target === ro2) cerrarRegisterGlobal();
  });

  // Cierra la sesión al pulsar cualquier botón de logout del navbar
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'btnLogout' || e.target.id === 'nbLogout')) {
      e.preventDefault();
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('rol');
      location.reload();
    }
  });

  actualizarContadorCarrito();
}

// ── Contador del carrito ──
// Lee el carrito del localStorage y actualiza el número visible en el badge del navbar
function actualizarContadorCarrito() {
  var carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  var total   = carrito.reduce(function(acc, p) { return acc + p.cantidad; }, 0);
  var count   = document.getElementById('cartCount');
  if (count) count.textContent = total;
}

// ── Navbar local ──
// Versión simplificada para páginas que tienen el navbar ya en el HTML
// (sin carga dinámica). Solo inicializa el scroll y el hamburguesa.
function inicializarNavbarLocal() {
  var navbar    = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');
  if (!navbar || !hamburger || !navLinks) return;

  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    var spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(7px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
    } else {
      spans.forEach(function(s) { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// ── Handlers globales de clics ──
// Delegación única en document para abrir/cerrar modales desde cualquier página,
// independientemente de si el navbar se cargó de forma dinámica o estática.
document.addEventListener('click', function(e) {
  // Botones de login (id directo o dinámico)
  if (e.target.closest('#btnLogin') || e.target.closest('#btnLoginDyn')) {
    e.preventDefault();
    var pageModal = document.getElementById('loginModal');
    if (pageModal) {
      if (pageModal.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        new bootstrap.Modal(pageModal).show();
      } else {
        pageModal.classList.add('open');
      }
      return;
    }
    abrirLoginGlobal();
    return;
  }
  // Botones de registro
  if (e.target.closest('#btnRegister') || e.target.closest('#btnRegisterDyn')) {
    e.preventDefault();
    cerrarRegisterGlobal();
    crearModalRegistro();
    var ro = document.getElementById('nbRegisterOverlay');
    if (ro) ro.classList.add('open');
    return;
  }
  // Enlace "Registrarse" dentro del modal de login
  if (e.target.id === 'nbGoRegister') {
    e.preventDefault();
    cerrarLoginGlobal();
    crearModalRegistro();
    var ro2 = document.getElementById('nbRegisterOverlay');
    if (ro2) ro2.classList.add('open');
    return;
  }
  // Enlace "Iniciar Sesion" dentro del modal de registro
  if (e.target.id === 'nbGoLogin') {
    e.preventDefault();
    cerrarRegisterGlobal();
    abrirLoginGlobal();
    return;
  }
  // Botones de cierre del modal de login de la página index
  if (e.target.closest('#modal-close-login') || e.target.closest('#btn-cancel-login')) {
    e.preventDefault();
    var m = document.getElementById('loginModal');
    if (m) m.classList.remove('open');
    return;
  }
  // Cierra el modal de index al hacer clic en su fondo
  var indexModal = document.getElementById('loginModal');
  if (indexModal && indexModal.classList.contains('open') && e.target === indexModal) {
    indexModal.classList.remove('open');
    return;
  }
  // Cierra los overlays personalizados al hacer clic en su fondo
  var lo = document.getElementById('nbLoginOverlay');
  var ro3 = document.getElementById('nbRegisterOverlay');
  if (lo && lo.classList.contains('open') && e.target === lo) cerrarLoginGlobal();
  if (ro3 && ro3.classList.contains('open') && e.target === ro3) cerrarRegisterGlobal();
});

// Función global para actualizar el navbar desde cualquier módulo externo
window.actualizarUIUsuario = function(email, rol) {
  var authGroup    = document.querySelector('.auth-group');
  var navUserZone  = document.getElementById('nav-user-zone');
  var navSaludo    = document.getElementById('nav-saludo');
  var navAdminZone = document.getElementById('nav-admin-zone');

  if (authGroup)    authGroup.classList.add('d-none');
  if (navUserZone)  navUserZone.classList.remove('d-none');
  if (navSaludo)    navSaludo.textContent = 'Hola, ' + email;
  if (navAdminZone && rol === 'ADMINISTRADOR') navAdminZone.classList.remove('d-none');
};

// ── INIT ──
// Punto de entrada principal: crea los modales, inicializa el navbar
// (dinámico o estático según la página) y sincroniza la sesión.
document.addEventListener('DOMContentLoaded', function() {

  crearModalLogin();    // Precrea el modal de login en el DOM
  crearModalRegistro(); // Precrea el modal de registro en el DOM

  // Si existe el contenedor dinámico, carga el navbar desde archivo externo;
  // si no, inicializa el navbar que ya está en el HTML de la página
  if (document.getElementById('navbar-container')) {
    cargarNavbar();
  } else {
    inicializarNavbarLocal();
  }

  // Tras 150ms (tiempo para que el navbar se inyecte en el DOM),
  // sincroniza la UI con la sesión guardada en localStorage
  setTimeout(function() {
    var email = localStorage.getItem('email');
    var rol   = localStorage.getItem('rol');
    if (email && rol && window.actualizarUIUsuario) {
      window.actualizarUIUsuario(email, rol);
    }
    actualizarContadorCarrito();
  }, 150);

  // Detecta cambios en localStorage desde otras pestañas (login/logout en otra ventana)
  window.addEventListener('storage', function(e) {
    if (e.key === 'email' || e.key === 'rol' || e.key === null) {
      var email = localStorage.getItem('email');
      var rol   = localStorage.getItem('rol');
      if (email && rol) {
        if (window.actualizarUIUsuario) window.actualizarUIUsuario(email, rol);
      } else {
        location.reload(); // Recarga si la sesión fue cerrada en otra pestaña
      }
    }
  });

  // Escucha el evento personalizado 'loginChanged' que pueden disparar otros módulos
  window.addEventListener('loginChanged', function(e) {
    if (window.actualizarUIUsuario) window.actualizarUIUsuario(e.detail.email, e.detail.rol);
  });
});