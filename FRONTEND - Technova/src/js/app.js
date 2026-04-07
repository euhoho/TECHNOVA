/* ════════════════════════════════════════
   TECHNOVA — app.js
════════════════════════════════════════ */

/* ── Variables globales ── */
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.getAttribute('data-delay') || 0, 10);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

/* ════════════════════════════════════════
   DOM CONTENT LOADED
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── SCROLL REVEAL ── */
  document.querySelectorAll(
    '.feature-item, .cat-item, .section-header, .features-content, .features-visual'
  ).forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
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
  const navbar   = document.querySelector('.navbar');
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

  /* ── CART BUTTON ── */
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (cartItems === 0) return;
      alert('🛒 Tienes ' + cartItems + ' producto' + (cartItems > 1 ? 's' : '') + ' en el carrito.');
    });
  }

  /* ── PRODUCTOS DESTACADOS DESDE API ── */
  cargarDestacados();

});

/* ════════════════════════════════════════
   PRODUCTOS DESTACADOS
════════════════════════════════════════ */
async function cargarDestacados() {
  const grid = document.getElementById('featuredProductsGrid');
  if (!grid) return;

  // Skeletons mientras carga
  grid.innerHTML = Array(3).fill(`
    <div class="product-card" style="opacity:1">
      <div style="height:160px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:22px;
        background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
        background-size:200% 100%;animation:shimmer 1.5s infinite;">
      </div>
      <div style="height:10px;width:40%;background:rgba(255,255,255,0.05);border-radius:4px;margin-bottom:10px;"></div>
      <div style="height:14px;width:70%;background:rgba(255,255,255,0.07);border-radius:4px;margin-bottom:10px;"></div>
      <div style="height:10px;width:90%;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
    </div>`).join('');

  try {
    const response = await fetch('http://localhost:8080/api/productos');
    if (!response.ok) throw new Error('Sin servidor');
    const productos = await response.json();

    const destacados = productos.slice(0, 3);
    grid.innerHTML = '';

    destacados.forEach((p, i) => {
      const delays  = [0, 100, 200];
      const badges  = ['NUEVO', 'HOT', 'TOP'];
      const bClases = ['', 'badge-hot', 'badge-sale'];

      const card = document.createElement('div');
      card.className = 'product-card' + (i === 1 ? ' featured' : '');
      card.setAttribute('data-delay', delays[i]);

      const precio    = parseFloat(p.precio);
      const entero    = Math.floor(precio);
      const decimales = precio.toFixed(2).split('.')[1];

      card.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-badge ${bClases[i]}">${badges[i]}</div>
        <div class="card-img">
          <img src="img/${p.imagen}" alt="${p.nombre}"
               style="width:100%;height:100%;object-fit:contain;padding:16px;"
               onerror="this.style.display='none'">
          <div class="card-img-glow"></div>
        </div>
        <div class="card-body">
          <span class="card-cat">${p.categoria || 'Producto'}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <div class="card-footer">
            <span class="price">€${entero}<small>.${decimales}</small></span>
            <button class="btn-add"
              data-id="${p.id_producto}"
              data-nombre="${p.nombre}"
              data-precio="${p.precio}"
              data-imagen="${p.imagen}">
              + Añadir
            </button>
          </div>
        </div>`;

      grid.appendChild(card);
    });

    // Eventos carrito
    grid.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', function(e) {
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

    // Reveal animation
    grid.querySelectorAll('.product-card').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });

  } catch (error) {
    console.warn('API no disponible:', error);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
        <p style="font-family:var(--font-head);font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;">
          Servidor no disponible —
          <a href="catalogo.html" style="color:var(--rosa)">Ver catálogo</a>
        </p>
      </div>`;
  }
}

/* ════════════════════════════════════════
   TERMINAL + NETWORK
════════════════════════════════════════ */
const terminalBody  = document.getElementById('terminalBody');
const terminalBox   = document.getElementById('terminalBox');
const networkCanvas = document.getElementById('networkCanvas');

if (terminalBody && networkCanvas) {

  const sequence = [
    { type: 'command', text: 'inicializar TechNova --modo=premium' },
    { type: 'output',  text: '✦ Sistema iniciado correctamente', cls: 'success' },
    { type: 'output',  text: '✦ Cargando catálogo de productos...', cls: '' },
    { type: 'output',  text: '✦ 350+ productos disponibles', cls: 'highlight' },
    { type: 'command', text: 'mapear --red=global' },
    { type: 'output',  text: '✦ Nodos detectados: 24', cls: 'success' },
    { type: 'output',  text: '✦ Conexiones activas: 38', cls: 'success' },
    { type: 'output',  text: '✦ Latencia: 0.4ms', cls: 'highlight' },
    { type: 'command', text: 'visualizar --mapa' },
    { type: 'output',  text: '✦ Renderizando red...', cls: '' },
    { type: 'output',  text: '✦ TechNova Network · Online ✓', cls: 'success' },
  ];

  let stepIndex = 0;
  let charIndex = 0;
  let currentEl = null;
  let animId    = null;

  function startNetwork(W, H) {
    networkCanvas.width  = W;
    networkCanvas.height = H;
    const ctx   = networkCanvas.getContext('2d');
    const nodes = Array.from({ length: 14 }, () => ({
      x:  20 + Math.random() * (W - 40),
      y:  20 + Math.random() * (H - 40),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(228,0,133,${(1 - dist / 110) * 0.4})`;
            ctx.lineWidth   = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8);
        grad.addColorStop(0, 'rgba(228,0,133,0.2)');
        grad.addColorStop(1, 'rgba(228,0,133,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(228,0,133,0.9)';
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 5 || n.x > W - 5) n.vx *= -1;
        if (n.y < 5 || n.y > H - 5) n.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
  }

  function switchToNetwork() {
    const savedW = terminalBody.offsetWidth;
    const savedH = terminalBody.offsetHeight;

    terminalBody.style.transition = 'opacity 0.5s ease';
    terminalBody.style.opacity    = '0';

    setTimeout(() => {
      terminalBody.style.display     = 'none';
      networkCanvas.style.display    = 'block';
      networkCanvas.style.width      = savedW + 'px';
      networkCanvas.style.height     = savedH + 'px';
      networkCanvas.style.opacity    = '0';
      networkCanvas.style.transition = 'opacity 0.8s ease';
      startNetwork(savedW, savedH);
      setTimeout(() => { networkCanvas.style.opacity = '1'; }, 50);

      setTimeout(() => {
        networkCanvas.style.opacity = '0';
        setTimeout(() => {
          cancelAnimationFrame(animId);
          networkCanvas.style.display = 'none';
          terminalBody.style.display  = 'flex';
          terminalBody.style.opacity  = '0';
          terminalBody.innerHTML = `
            <div class="terminal-line">
              <span class="t-prompt">→</span>
              <span class="t-text" id="terminalText"></span>
              <span class="t-cursor">█</span>
            </div>`;
          stepIndex = 0;
          charIndex = 0;
          currentEl = document.getElementById('terminalText');
          setTimeout(() => {
            terminalBody.style.opacity = '1';
            typeStep();
          }, 100);
        }, 600);
      }, 6000);
    }, 500);
  }

  function nextStep() {
    if (stepIndex >= sequence.length) {
      setTimeout(switchToNetwork, 1000);
      return;
    }
    const step = sequence[stepIndex];
    if (step.type === 'command') {
      const lastLine = terminalBody.querySelector('.terminal-line:last-child');
      if (lastLine) lastLine.querySelector('.t-cursor')?.remove();
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="t-prompt">→</span><span class="t-text"></span><span class="t-cursor">█</span>`;
      terminalBody.appendChild(line);
      currentEl = line.querySelector('.t-text');
      charIndex  = 0;
      terminalBody.scrollTop = terminalBody.scrollHeight;
      typeStep();
    } else {
      const lastLine = terminalBody.querySelector('.terminal-line:last-child');
      if (lastLine) lastLine.querySelector('.t-cursor')?.remove();
      const out = document.createElement('div');
      out.className   = 't-output ' + (step.cls || '');
      out.textContent = step.text;
      terminalBody.appendChild(out);
      stepIndex++;
      terminalBody.scrollTop = terminalBody.scrollHeight;
      setTimeout(nextStep, 280);
    }
  }

  function typeStep() {
    const step = sequence[stepIndex];
    if (charIndex < step.text.length) {
      currentEl.textContent += step.text[charIndex];
      charIndex++;
      terminalBody.scrollTop = terminalBody.scrollHeight;
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

  termObserver.observe(terminalBody);
}