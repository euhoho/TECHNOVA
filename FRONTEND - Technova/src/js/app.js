document.addEventListener("DOMContentLoaded", () => {

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll(
    '.product-card, .feature-item, .cat-item, .section-header, .features-content, .features-visual'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay') || 0, 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  /* ── CART FEEDBACK ── */
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const original = this.textContent;

      this.textContent = '✓ Añadido';
      this.style.background = 'var(--rosa)';
      this.style.color = 'var(--bg)';

      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
        this.style.color = '';
      }, 1800);

      updateCart(1);
    });
  });

  /* ── NEWSLETTER ── */
  const nlBtn   = document.getElementById('nlBtn');
  const nlInput = document.getElementById('nlInput');
  const nlMsg   = document.getElementById('nlMsg');

  if (nlBtn && nlInput && nlMsg) {
    nlBtn.addEventListener('click', () => {
      const email = nlInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nlMsg.textContent = '⚠️ Introduce un email válido.';
        nlMsg.style.color = '#ff4466';
        return;
      }

      nlBtn.textContent = '✓ ¡Suscrito!';
      nlInput.value = '';
      nlMsg.textContent = '¡Bienvenido a la familia TechNova!';
      nlMsg.style.color = 'var(--rosa)';

      setTimeout(() => {
        nlBtn.textContent = 'Suscribirme';
        nlMsg.textContent = '';
      }, 4000);
    });

    nlInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') nlBtn.click();
    });
  }

  /* ── SMOOTH SCROLL ── */
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        if (navLinks) navLinks.classList.remove('open');

        window.scrollTo({
          top: target.offsetTop - (navbar ? navbar.offsetHeight : 0) - 10,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ── CATEGORY ACTIVE ── */
  document.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.cat-item').forEach(i => i.style.borderColor = '');
      this.style.borderColor = 'var(--rosa)';

      setTimeout(() => {
        this.style.borderColor = '';
      }, 1200);
    });
  });

  /* ── CART COUNTER ── */
  const cartBtn   = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  let cartItems = 0;

  function updateCart(n) {
    cartItems += n;

    if (cartCount) {
      cartCount.textContent = cartItems;
      cartCount.classList.remove('bump');
      void cartCount.offsetWidth;
      cartCount.classList.add('bump');
    }
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (cartItems === 0) return;

      alert('🛒 Tienes ' + cartItems + ' producto' + (cartItems > 1 ? 's' : '') + ' en el carrito.');
    });
  }

});

/* ── TERMINAL + NETWORK ── */
const terminalBody  = document.getElementById('terminalBody');
const terminalBox   = document.getElementById('terminalBox');
const networkCanvas = document.getElementById('networkCanvas');

if (terminalBody && networkCanvas) {

  const sequence = [
    { type: 'command', text: 'inicializar TechNova --modo=premium' },
    { type: 'output',  text: '✦ Sistema iniciado correctamente', cls: 'success' },
    { type: 'output',  text: '✦ Cargando catálogo...', cls: '' },
    { type: 'output',  text: '✦ 350+ productos disponibles', cls: 'highlight' },
    { type: 'command', text: 'mapear --red=global' },
    { type: 'output',  text: '✦ Nodos activos: 12', cls: 'success' },
    { type: 'output',  text: '✦ Renderizando red...', cls: '' },
  ];

  let stepIndex = 0;
  let charIndex = 0;
  let currentEl = null;

  function startMiniNetwork() {

  terminalBody.style.display = 'none';
  networkCanvas.style.display = 'block';

  const W = networkCanvas.offsetWidth;
  const H = networkCanvas.offsetHeight;

  networkCanvas.width  = W;
  networkCanvas.height = H;

  const ctx = networkCanvas.getContext('2d');

  const nodes = [
    {x: W*0.2, y: H*0.6},
    {x: W*0.35, y: H*0.4},
    {x: W*0.5, y: H*0.5},
    {x: W*0.65, y: H*0.3},
    {x: W*0.8, y: H*0.6},
    {x: W*0.55, y: H*0.75},
  ];

  const connections = [
    [0,1],[1,2],[2,3],[3,4],[2,5]
  ];

  let progress = 0;

  function draw() {
    ctx.clearRect(0,0,W,H);

    // nodos
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(228,0,133,0.9)';
      ctx.fill();
    });

    // líneas progresivas
    const maxLines = Math.floor(progress);

    for (let i = 0; i < maxLines; i++) {
      const [a,b] = connections[i];
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.strokeStyle = 'rgba(228,0,133,0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    progress += 0.03;

    if (progress < connections.length + 1) {
      requestAnimationFrame(draw);
    } else {

      setTimeout(() => {

        networkCanvas.style.display = 'none';
        terminalBody.style.display  = 'flex';

        terminalBody.innerHTML = `
          <div class="terminal-line">
            <span class="t-prompt">→</span>
            <span class="t-text" id="terminalText"></span>
            <span class="t-cursor">█</span>
          </div>`;

        stepIndex = 0;
        charIndex = 0;
        currentEl = document.getElementById('terminalText');

        setTimeout(typeStep, 600);

      }, 3500);
    }
  }

  draw();
}

  function nextStep() {
if (stepIndex >= sequence.length) {
  setTimeout(startMiniNetwork, 800);
  return;
}

    const step = sequence[stepIndex];

    if (step.type === 'command') {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="t-prompt">→</span><span class="t-text"></span><span class="t-cursor">█</span>`;
      terminalBody.appendChild(line);

      currentEl = line.querySelector('.t-text');
      charIndex = 0;

      typeStep();
    } else {
      const out = document.createElement('div');
      out.className = 't-output ' + (step.cls || '');
      out.textContent = step.text;
      terminalBody.appendChild(out);

      stepIndex++;
      setTimeout(nextStep, 280);
    }
  }

  function typeStep() {
    const step = sequence[stepIndex];

    if (charIndex < step.text.length) {
      currentEl.textContent += step.text[charIndex];
      charIndex++;
      setTimeout(typeStep, 42);
    } else {
      stepIndex++;
      setTimeout(nextStep, 480);
    }
  }

  const termObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      currentEl = document.getElementById('terminalText');
      setTimeout(typeStep, 800);
      termObserver.disconnect();
    }
  }, { threshold: 0.3 });

  if (terminalBody) {
    termObserver.observe(terminalBody);
  }
}
/* ================================
   LOGIN & SESIÓN
================================ */

async function login(e) {
    e.preventDefault();
    
    const loginForm = e.target;
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    const errorEl = loginForm.querySelector('.login-error, .cat-login-error');

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) {
            errorEl.textContent = '⚠️ Introduce un email válido (ej: usuario@dominio.com)';
            errorEl.classList.remove("d-none");
        }
        return;
    }

    // Validar contraseña
    if (!password) {
        if (errorEl) {
            errorEl.textContent = '⚠️ La contraseña es requerida';
            errorEl.classList.remove("d-none");
        }
        return;
    }

    // Limpiar mensaje de error previo
    if (errorEl) {
        errorEl.classList.add("d-none");
        errorEl.textContent = '';
    }

    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.status !== "ok") throw new Error(data.mensaje);

        localStorage.setItem("email", data.usuario.email);
        localStorage.setItem("password", password);
        localStorage.setItem("rol", data.usuario.rol);

        // Disparar evento personalizado para que todas las páginas se actualicen
        const event = new CustomEvent('loginChanged', {
            detail: { email: data.usuario.email, rol: data.usuario.rol }
        });
        window.dispatchEvent(event);

        actualizarUIUsuario(data.usuario.email, data.usuario.rol);

        // Si la función global existe (navbar cargado), actualizar inmediatamente
        setTimeout(() => {
            if (window.actualizarUIUsuario) {
                window.actualizarUIUsuario(data.usuario.email, data.usuario.rol);
            }
        }, 100);

        // Cerrar modal según el tipo
        const modalBootstrap = document.getElementById('loginModal');
        if (modalBootstrap && modalBootstrap.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modalBootstrap);
            if (modalInstance) modalInstance.hide();
        }

        // Cerrar modal overlay si existe (carrito.html)
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove("open");
        }

        // Cerrar modal custom en index.html
        const loginModal = document.getElementById('loginModal');
        if (loginModal && !loginModal.classList.contains('modal')) {
            loginModal.classList.remove("open");
        }

        console.log("Login correcto:");

    } catch (error) {
        console.error("Error login:", error);
        const errorEl = loginForm.querySelector('.login-error, .cat-login-error');
        if (errorEl) {
            errorEl.textContent = '⚠️ ' + (error.message || 'Error al iniciar sesión. Verifica tu email y contraseña.');
            errorEl.classList.remove("d-none");
        }
    }
}

function actualizarUIUsuario(email, rol) {
    // Actualizar navbar si existe
    const btnLogin = document.getElementById("btnLogin");
    const navUserZone = document.getElementById("nav-user-zone");
    const navSaludo = document.getElementById("nav-saludo");
    const navAdminZone = document.getElementById("nav-admin-zone");
    
    if (btnLogin) btnLogin.classList.add("d-none");
    if (navUserZone) navUserZone.classList.remove("d-none");
    if (navSaludo) navSaludo.textContent = "Hola, " + email;
    if (navAdminZone && rol === "ADMINISTRADOR") {
        navAdminZone.classList.remove("d-none");
    }
    
    // Actualizar carrito si existe
    const resumenLogin = document.getElementById("resumenLogin");
    const resumenLogueado = document.getElementById("resumenLogueado");
    const usuarioEmail = document.getElementById("usuarioEmail");
    
    if (resumenLogin) resumenLogin.classList.add("d-none");
    if (resumenLogueado) resumenLogueado.classList.remove("d-none");
    if (usuarioEmail) usuarioEmail.textContent = email;
}

document.addEventListener("DOMContentLoaded", () => {

    // ══ INICIALIZAR LOGIN ══
    const loginForm = document.getElementById("login-form") || document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    // ══ BOTONES ABRIR MODAL (delegación de eventos) ══
    document.addEventListener("click", (e) => {
        // Botón de login en navbar
        if (e.target.closest("#btnLogin")) {
            e.preventDefault();
            
            // Intentar Bootstrap modal (catalogo)
            const modalElement = document.getElementById('loginModal');
            if (modalElement && modalElement.classList.contains('modal') && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(modalElement).show();
            }
            // Intentar custom overlay modal (index.html)
            else if (modalElement) {
                modalElement.classList.add("open");
            }
        }
        
        // Botón abrir login en carrito
        if (e.target.closest("#btnAbrirLogin")) {
            e.preventDefault();
            const overlay = document.getElementById("modalOverlay");
            if (overlay) overlay.classList.add("open");
        }
    });

    // ══ CERRAR MODAL ══
    document.addEventListener("click", (e) => {
        // Cerrar botón en custom overlay (carrito)
        if (e.target.closest("#modalClose")) {
            const overlay = document.getElementById("modalOverlay");
            if (overlay) overlay.classList.remove("open");
        }
        
        // Cerrar botón en modal de index.html
        if (e.target.closest("#modal-close-login")) {
            const modal = document.getElementById("loginModal");
            if (modal) modal.classList.remove("open");
        }
        
        // Cerrar al clickear fuera del modal (custom overlay)
        const modalOverlay = e.target;
        if (modalOverlay.id === "modalOverlay" && modalOverlay.classList.contains("modal-overlay")) {
            modalOverlay.classList.remove("open");
        }
        
        // Cerrar al clickear fuera del modal (index login)
        const loginModal = e.target;
        if (loginModal.id === "loginModal" && !loginModal.classList.contains('modal') && loginModal.classList.contains("modal-overlay")) {
            loginModal.classList.remove("open");
        }
    });

    // ══ LOGOUT ══
    const btnLogout = document.getElementById("btnLogout") || document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.clear();
            location.reload();
        });
    }

    // ══ CONFIRMAR COMPRA ══
    const btnConfirmar = document.getElementById("btnConfirmar");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", finalizarCompra);
    }

    // ══ VERIFICAR SESIÓN EXISTENTE ══
    const email = sessionStorage.getItem("email");
    if (email) {
        actualizarUIUsuario(email, sessionStorage.getItem("rol"));
    }

});