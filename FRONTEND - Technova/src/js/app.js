/* ════════════════════════════════════════
   TECHNOVA — app.js
   Lógica principal de la aplicación:
   carrito, scroll reveal, newsletter, productos destacados,
   terminal animada, red de nodos y sistema de login/sesión
════════════════════════════════════════ */

/* ── Carrito: guardar en localStorage ──
   Añade un producto al carrito almacenado en el navegador.
   Si el producto ya existe, incrementa su cantidad.
   Después actualiza el contador visible en el navbar con animación. */
function updateCart(producto) {
    /* Obtiene el carrito actual del almacenamiento local (o un array vacío si no existe) */
    const carrito   = JSON.parse(localStorage.getItem('carrito')) || [];

    /* Busca si el producto ya está en el carrito comparando por ID */
    const existente = carrito.find(p => p.idProducto === producto.idProducto);

    if (existente) {
        /* Si ya existe, solo incrementa su cantidad en 1 */
        existente.cantidad++;
    } else {
        /* Si es nuevo, lo añade con cantidad inicial de 1 */
        carrito.push({ ...producto, cantidad: 1 });
    }

    /* Guarda el carrito actualizado de vuelta en localStorage */
    localStorage.setItem('carrito', JSON.stringify(carrito));

    /* Calcula el total de unidades sumando las cantidades de todos los productos */
    const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);

    /* Actualiza el badge del carrito en el navbar si existe en el DOM */
    const count = document.getElementById('cartCount');
    if (count) {
        count.textContent = total;

        /* Reinicia la animación de rebote: primero la quita, fuerza reflow y la vuelve a añadir */
        count.classList.remove('bump');
        void count.offsetWidth;   /* Fuerza al navegador a recalcular el layout para reiniciar la animación */
        count.classList.add('bump');
    }
}

/* ── Scroll reveal observer ──
   Observa elementos del DOM y los hace visibles con una animación
   cuando entran en el viewport. Respeta un retraso opcional definido
   en el atributo data-delay del elemento. */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            /* Lee el data-delay del elemento (en ms); si no tiene, usa 0 */
            const delay = parseInt(entry.target.getAttribute('data-delay') || 0, 10);

            /* Añade la clase 'visible' después del retraso para disparar la animación CSS */
            setTimeout(() => entry.target.classList.add('visible'), delay);

            /* Deja de observar el elemento una vez que ya apareció */
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 }); /* El elemento debe ser visible al menos un 12% para activarse */

/* ════════════════════════════════════════
   DOM CONTENT LOADED
   Todo el código dentro de este bloque se ejecuta cuando el HTML
   ha terminado de cargarse y el DOM está completamente disponible
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* ── SCROLL REVEAL ──
       Añade la clase 'reveal' (inicialmente invisible) a los elementos
       indicados y los registra en el IntersectionObserver para que
       aparezcan con animación al hacer scroll */
    document.querySelectorAll(
        '.feature-item, .cat-item, .section-header, .features-content, .features-visual'
    ).forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    /* ── NEWSLETTER ──
       Gestiona el formulario de suscripción al boletín:
       valida el email, muestra mensajes de éxito/error y resetea el formulario */
    const nlBtn   = document.getElementById('nlBtn');
    const nlInput = document.getElementById('nlInput');
    const nlMsg   = document.getElementById('nlMsg');

    if (nlBtn && nlInput && nlMsg) {
        nlBtn.addEventListener('click', () => {
            const email = nlInput.value.trim();

            /* Valida que el email no esté vacío y tenga formato correcto */
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                nlMsg.textContent = '⚠️ Introduce un email válido.';
                nlMsg.style.color = '#ff4466';
                return;
            }

            /* Email válido: muestra confirmación y limpia el campo */
            nlBtn.textContent = '✓ ¡Suscrito!';
            nlInput.value = '';
            nlMsg.textContent = '¡Bienvenido a la familia TechNova!';
            nlMsg.style.color = 'var(--rosa)';

            /* Restaura el texto original del botón y el mensaje tras 4 segundos */
            setTimeout(() => {
                nlBtn.textContent = 'Suscribirme';
                nlMsg.textContent = '';
            }, 4000);
        });

        /* Permite enviar el formulario pulsando la tecla Enter en el input */
        nlInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') nlBtn.click();
        });
    }

    /* ── SMOOTH SCROLL ──
       Intercepta los clics en enlaces de ancla (#sección) para hacer
       un desplazamiento suave hacia el destino, compensando la altura
       del navbar fijo y cerrando el menú móvil si estuviera abierto */
    const navbar   = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            /* Ignora el enlace si apunta solo a "#" (sin destino) */
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                /* Cierra el menú móvil si está abierto */
                if (navLinks) navLinks.classList.remove('open');

                /* Desplaza la página con suavidad, restando la altura del navbar */
                window.scrollTo({
                    top: target.offsetTop - (navbar ? navbar.offsetHeight : 0) - 10,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ── PRODUCTOS DESTACADOS DESDE API ──
       Llama a la función que carga los productos desde el servidor
       y los renderiza en la sección de destacados de la home */
    cargarDestacados();

    /* ── VERIFICAR SESIÓN EXISTENTE ──
       Si el usuario ya había iniciado sesión anteriormente,
       recupera sus datos del localStorage y actualiza la UI del navbar */
    const email = localStorage.getItem('email');
    if (email) actualizarUIUsuario(email, localStorage.getItem('rol'));

    /* ── Actualizar contador del navbar al cargar la página ──
       Intenta encontrar el badge del carrito cada 100ms hasta que
       esté disponible en el DOM y entonces muestra el total guardado */
    const intervalo = setInterval(() => {
        const count = document.getElementById('cartCount');
        if (count) {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            count.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
            clearInterval(intervalo); /* Detiene el intervalo una vez que el badge fue encontrado */
        }
    }, 100);

    /* ── BOOTSTRAP MODAL CLEANUP ──
       Limpia los residuos del modal de Bootstrap al cerrarse:
       elimina el backdrop y restaura el scroll del body */
    const loginModalElement = document.getElementById('loginModal');
    if (loginModalElement && loginModalElement.classList.contains('modal')) {
        loginModalElement.addEventListener('hidden.bs.modal', () => {
            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'auto';
        });
    }

    /* ── INICIALIZAR LOGIN ──
       Busca el formulario de login por dos posibles IDs y le asigna
       la función de login como manejador del evento submit */
    const loginForm = document.getElementById("login-form") || document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", login);

    /* ── LOGOUT ──
       Busca el botón de cerrar sesión por dos posibles IDs,
       elimina los datos del usuario del localStorage y recarga la página */
    const btnLogout = document.getElementById("btnLogout") || document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('rol');
            location.reload(); /* Recarga la página para resetear la UI al estado de invitado */
        });
    }
});

/* ════════════════════════════════════════
   PRODUCTOS DESTACADOS
   Carga los primeros 3 productos desde la API y los renderiza
   en la cuadrícula de destacados de la página de inicio.
   Muestra un skeleton loader mientras espera la respuesta.
════════════════════════════════════════ */
async function cargarDestacados() {
    const grid = document.getElementById('featuredProductsGrid');
    if (!grid) return; /* Sale si el elemento no existe en esta página */

    /* Muestra 3 tarjetas skeleton con animación shimmer mientras carga */
    grid.innerHTML = Array(3).fill(`
        <div class="product-card" style="opacity:1">
            <div style="height:160px;border-radius:8px;margin-bottom:22px;
                background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%);
                background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
            <div style="height:10px;width:40%;background:rgba(255,255,255,0.05);border-radius:4px;margin-bottom:10px;"></div>
            <div style="height:14px;width:70%;background:rgba(255,255,255,0.07);border-radius:4px;margin-bottom:10px;"></div>
            <div style="height:10px;width:90%;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
        </div>`).join('');

    try {
        /* Petición GET al endpoint de productos */
        const response = await fetch(BASE_URL + '/api/productos');
        if (!response.ok) throw new Error('Sin servidor');
        const productos = await response.json();

        /* Toma solo los primeros 3 productos para la sección de destacados */
        const destacados = productos.slice(0, 3);
        grid.innerHTML = ''; /* Limpia los skeletons */

        destacados.forEach((p, i) => {
            /* Configuración visual de cada tarjeta según su posición */
            const delays  = [0, 100, 200];          /* Retrasos escalonados para la animación de entrada */
            const badges  = ['NUEVO', 'HOT', 'TOP']; /* Texto del badge según posición */
            const bClases = ['', 'badge-hot', 'badge-sale']; /* Clase de color del badge */

            const card = document.createElement('div');
            /* La tarjeta del medio (índice 1) recibe la clase 'featured' para destacarla */
            card.className = 'product-card' + (i === 1 ? ' featured' : '');
            card.setAttribute('data-delay', delays[i]);

            /* Separa el precio en parte entera y decimales para formateo visual */
            const precio    = parseFloat(p.precio);
            const entero    = Math.floor(precio);
            const decimales = precio.toFixed(2).split('.')[1];

            /* Genera el HTML interno de la tarjeta con todos los datos del producto */
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

        /* Asigna el evento de añadir al carrito a cada botón generado */
        grid.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); /* Evita que el clic propague al elemento padre (la tarjeta) */

                /* Feedback visual temporal: el botón muestra "✓ Añadido" durante 1.8 segundos */
                const original = this.textContent;
                this.textContent = '✓ Añadido';
                this.style.background = 'var(--rosa)';
                this.style.color = 'var(--bg)';
                setTimeout(() => {
                    this.textContent = original;
                    this.style.background = '';
                    this.style.color = '';
                }, 1800);

                /* Llama a updateCart con los datos del producto desde los atributos data-* */
                updateCart({
                    idProducto: parseInt(this.dataset.id),
                    nombre:     this.dataset.nombre,
                    precio:     parseFloat(this.dataset.precio),
                    imagen:     'img/' + this.dataset.imagen,
                });
            });
        });

        /* Registra cada tarjeta en el observer para la animación de entrada al scroll */
        grid.querySelectorAll('.product-card').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });

    } catch (error) {
        /* Si la API no está disponible, muestra un mensaje de error con enlace al catálogo */
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
   Animación interactiva en la sección de features:
   simula un terminal de comandos y después transiciona a una
   visualización de red de nodos animados sobre un canvas
════════════════════════════════════════ */
const terminalBody  = document.getElementById('terminalBody');
const terminalBox   = document.getElementById('terminalBox');
const networkCanvas = document.getElementById('networkCanvas');

if (terminalBody && networkCanvas) {

    /* Secuencia de pasos que se mostrarán en el terminal uno a uno.
       Cada paso puede ser un 'command' (texto que se escribe letra a letra)
       o un 'output' (respuesta del sistema que aparece de golpe) */
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

    /* Variables de estado de la animación del terminal */
    let stepIndex = 0;   /* Índice del paso actual en la secuencia */
    let charIndex = 0;   /* Índice del carácter actual dentro del texto del paso */
    let currentEl = null; /* Referencia al elemento DOM donde se escribe el texto */
    let animId    = null; /* ID del requestAnimationFrame del canvas (para cancelarlo) */

    /* ── startNetwork ──
       Inicializa y anima la visualización de red de nodos sobre el canvas.
       Crea 14 nodos que se mueven aleatoriamente y se conectan con líneas
       cuando están lo suficientemente cerca entre sí. */
    function startNetwork(W, H) {
        networkCanvas.width  = W;
        networkCanvas.height = H;
        const ctx = networkCanvas.getContext('2d');

        /* Genera 14 nodos con posición y velocidad aleatorias */
        const nodes = Array.from({ length: 14 }, () => ({
            x: 20 + Math.random() * (W - 40),        /* Posición X inicial aleatoria */
            y: 20 + Math.random() * (H - 40),        /* Posición Y inicial aleatoria */
            vx: (Math.random() - 0.5) * 0.4,         /* Velocidad horizontal aleatoria */
            vy: (Math.random() - 0.5) * 0.4,         /* Velocidad vertical aleatoria */
        }));

        function draw() {
            ctx.clearRect(0, 0, W, H); /* Borra el canvas antes de redibujar */

            /* Dibuja líneas entre nodos que estén a menos de 110px de distancia */
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx   = nodes[i].x - nodes[j].x;
                    const dy   = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        /* La opacidad de la línea es mayor cuanto más cerca están los nodos */
                        ctx.strokeStyle = `rgba(228,0,133,${(1 - dist / 110) * 0.4})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            /* Dibuja cada nodo como un punto rosa con halo radial */
            nodes.forEach(n => {
                /* Halo difuso alrededor del nodo */
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8);
                grad.addColorStop(0, 'rgba(228,0,133,0.2)');
                grad.addColorStop(1, 'rgba(228,0,133,0)');
                ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = grad; ctx.fill();

                /* Punto central sólido del nodo */
                ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(228,0,133,0.9)'; ctx.fill();

                /* Mueve el nodo según su velocidad */
                n.x += n.vx; n.y += n.vy;

                /* Invierte la velocidad al llegar a los bordes del canvas (efecto rebote) */
                if (n.x < 5 || n.x > W - 5) n.vx *= -1;
                if (n.y < 5 || n.y > H - 5) n.vy *= -1;
            });

            animId = requestAnimationFrame(draw); /* Solicita el siguiente fotograma */
        }
        draw();
    }

    /* ── switchToNetwork ──
       Gestiona la transición del terminal al canvas de red y viceversa:
       1. Desvanece el terminal
       2. Muestra el canvas animado durante 6 segundos
       3. Desvanece el canvas y reinicia el terminal desde el principio */
    function switchToNetwork() {
        const savedW = terminalBody.offsetWidth;
        const savedH = terminalBody.offsetHeight;

        /* Paso 1: desvanece el cuerpo del terminal */
        terminalBody.style.transition = 'opacity 0.5s ease';
        terminalBody.style.opacity    = '0';

        setTimeout(() => {
            /* Paso 2: oculta el terminal y muestra el canvas con las mismas dimensiones */
            terminalBody.style.display  = 'none';
            networkCanvas.style.display = 'block';
            networkCanvas.style.width   = savedW + 'px';
            networkCanvas.style.height  = savedH + 'px';
            networkCanvas.style.opacity = '0';
            networkCanvas.style.transition = 'opacity 0.8s ease';

            startNetwork(savedW, savedH); /* Inicia la animación de nodos */

            /* Hace aparecer el canvas con fade in */
            setTimeout(() => { networkCanvas.style.opacity = '1'; }, 50);

            /* Paso 3: tras 6 segundos, desvanece el canvas y reinicia el terminal */
            setTimeout(() => {
                networkCanvas.style.opacity = '0';
                setTimeout(() => {
                    cancelAnimationFrame(animId); /* Detiene el loop del canvas */
                    networkCanvas.style.display = 'none';
                    terminalBody.style.display  = 'flex';
                    terminalBody.style.opacity  = '0';

                    /* Reinicia el HTML del terminal con el cursor parpadeante */
                    terminalBody.innerHTML = `
                        <div class="terminal-line">
                            <span class="t-prompt">→</span>
                            <span class="t-text" id="terminalText"></span>
                            <span class="t-cursor">█</span>
                        </div>`;

                    /* Resetea los índices para volver a reproducir la secuencia */
                    stepIndex = 0; charIndex = 0;
                    currentEl = document.getElementById('terminalText');

                    /* Hace aparecer el terminal y comienza la escritura */
                    setTimeout(() => { terminalBody.style.opacity = '1'; typeStep(); }, 100);
                }, 600);
            }, 6000); /* El canvas de red se muestra durante 6 segundos */
        }, 500);
    }

    /* ── nextStep ──
       Procesa el siguiente paso de la secuencia del terminal.
       Si es un 'command', crea una nueva línea y empieza a escribir letra a letra.
       Si es un 'output', lo añade directamente al terminal y continúa tras una pausa. */
    function nextStep() {
        /* Si se acabaron los pasos, transiciona al canvas de red */
        if (stepIndex >= sequence.length) { setTimeout(switchToNetwork, 1000); return; }

        const step = sequence[stepIndex];

        if (step.type === 'command') {
            /* Elimina el cursor de la última línea antes de añadir una nueva */
            const lastLine = terminalBody.querySelector('.terminal-line:last-child');
            if (lastLine) lastLine.querySelector('.t-cursor')?.remove();

            /* Crea una nueva línea de comando con prompt y cursor */
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `<span class="t-prompt">→</span><span class="t-text"></span><span class="t-cursor">█</span>`;
            terminalBody.appendChild(line);

            currentEl = line.querySelector('.t-text'); /* El texto se escribirá aquí */
            charIndex  = 0;
            terminalBody.scrollTop = terminalBody.scrollHeight; /* Mantiene el scroll al fondo */
            typeStep(); /* Inicia la escritura carácter a carácter */

        } else {
            /* Para outputs, elimina el cursor de la línea anterior */
            const lastLine = terminalBody.querySelector('.terminal-line:last-child');
            if (lastLine) lastLine.querySelector('.t-cursor')?.remove();

            /* Crea el elemento de output con la clase de estilo correspondiente */
            const out = document.createElement('div');
            out.className   = 't-output ' + (step.cls || '');
            out.textContent = step.text;
            terminalBody.appendChild(out);

            stepIndex++;
            terminalBody.scrollTop = terminalBody.scrollHeight;
            setTimeout(nextStep, 280); /* Pequeña pausa antes del siguiente paso */
        }
    }

    /* ── typeStep ──
       Escribe el texto del paso actual carácter a carácter con un
       retardo de 42ms entre cada letra, simulando la escritura humana */
    function typeStep() {
        const step = sequence[stepIndex];

        if (charIndex < step.text.length) {
            /* Añade el siguiente carácter al elemento actual */
            currentEl.textContent += step.text[charIndex];
            charIndex++;
            terminalBody.scrollTop = terminalBody.scrollHeight;
            setTimeout(typeStep, 42); /* 42ms por carácter (~23 caracteres por segundo) */
        } else {
            /* Texto completo: avanza al siguiente paso tras una pausa */
            stepIndex++;
            setTimeout(nextStep, 480);
        }
    }

    /* ── termObserver ──
       Observa el terminal y comienza la animación solo cuando el usuario
       lo ve en pantalla (al hacer scroll hasta la sección de features).
       Se desconecta tras la primera activación para no repetirse. */
    const termObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            currentEl = document.getElementById('terminalText');
            setTimeout(typeStep, 800); /* Pequeño retraso inicial antes de comenzar a escribir */
            termObserver.disconnect(); /* Solo se activa una vez */
        }
    }, { threshold: 0.3 }); /* El terminal debe estar al menos un 30% visible */

    termObserver.observe(terminalBody);
}

/* ════════════════════════════════════════
   LOGIN & SESIÓN
   Funciones para gestionar la autenticación del usuario:
   actualizar la interfaz según el estado de sesión y
   realizar el proceso de login contra la API
════════════════════════════════════════ */

/* ── actualizarUIUsuario ──
   Adapta el navbar al estado de sesión iniciada:
   oculta el botón de login, muestra el saludo y el nombre del usuario,
   y muestra el enlace al panel de administración si el rol es ADMINISTRADOR */
function actualizarUIUsuario(email, rol) {
    const btnLogin     = document.getElementById("btnLogin");
    const navUserZone  = document.getElementById("nav-user-zone");
    const navSaludo    = document.getElementById("nav-saludo");
    const navAdminZone = document.getElementById("nav-admin-zone");

    if (btnLogin)    btnLogin.classList.add("d-none");           /* Oculta el botón de login */
    if (navUserZone) navUserZone.classList.remove("d-none");     /* Muestra la zona de usuario */
    if (navSaludo)   navSaludo.textContent = "Hola, " + email;  /* Muestra el saludo con el email */

    /* Solo muestra el botón de admin si el usuario tiene rol de ADMINISTRADOR */
    if (navAdminZone && rol === "ADMINISTRADOR") navAdminZone.classList.remove("d-none");
}

/* ── login ──
   Función asíncrona que gestiona el inicio de sesión del usuario.
   Valida los campos del formulario, llama a la API de login,
   guarda los datos en localStorage y actualiza la interfaz.
   En caso de error muestra el mensaje correspondiente. */
async function login(e) {
    e.preventDefault(); /* Evita el envío nativo del formulario */

    const loginForm     = e.target;
    const emailInput    = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    if (!emailInput || !passwordInput) return; /* Sale si no encuentra los campos */

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    /* Busca el elemento de error por cualquiera de sus posibles clases */
    const errorEl  = loginForm.querySelector('.login-error, .cat-login-error');

    /* Validación del email: no vacío y formato correcto */
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) { errorEl.textContent = '⚠️ Introduce un email válido.'; errorEl.classList.remove("d-none"); }
        return;
    }

    /* Validación de la contraseña: no vacía */
    if (!password) {
        if (errorEl) { errorEl.textContent = '⚠️ La contraseña es requerida.'; errorEl.classList.remove("d-none"); }
        return;
    }

    /* Oculta el error previo antes de intentar el login */
    if (errorEl) errorEl.classList.add("d-none");

    try {
        /* Petición POST al endpoint de login con las credenciales */
        const response = await fetch(BASE_URL + '/api/login', {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password })
        });
        const data = await response.json();

        /* Si la API no devuelve status "ok", lanza un error con el mensaje del servidor */
        if (data.status !== "ok") throw new Error(data.mensaje);

        /* Guarda los datos del usuario en localStorage para persistir la sesión */
        localStorage.setItem("email",    data.usuario.email);
        localStorage.setItem("password", password);
        localStorage.setItem("rol",      data.usuario.rol);

        /* Actualiza el navbar con los datos del usuario recién autenticado */
        actualizarUIUsuario(data.usuario.email, data.usuario.rol);

        /* Cierra el modal de login según el tipo que esté abierto:
           - Bootstrap modal: usa la API de Bootstrap para cerrarlo
           - Modal personalizado: elimina la clase 'open' */
        const modalBootstrap = document.getElementById('loginModal');
        if (modalBootstrap?.classList.contains('modal') && typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getOrCreateInstance(modalBootstrap).hide();
        } else if (modalBootstrap) {
            modalBootstrap.classList.remove("open");
        }

        /* Cierra también el overlay del modal personalizado del navbar si existe */
        document.getElementById('nbLoginOverlay')?.classList.remove("open");

    } catch (error) {
        /* Muestra el mensaje de error del servidor o uno genérico si no hay mensaje */
        if (errorEl) {
            errorEl.textContent = '⚠️ ' + (error.message || 'Email o contraseña incorrectos.');
            errorEl.classList.remove("d-none");
        }
    }
}