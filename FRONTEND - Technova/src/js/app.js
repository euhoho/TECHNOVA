/* ================================
   LOGIN & SESIÓN
================================ */
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("login-form").addEventListener("submit", login);

    const email = sessionStorage.getItem("email");
    if (email) {
        actualizarUIUsuario(email, sessionStorage.getItem("rol"));
    }

});

async function login(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.status !== "ok") throw new Error(data.mensaje);

        sessionStorage.setItem("email", data.usuario.email);
        sessionStorage.setItem("password", password);// no recomendado en producción
        sessionStorage.setItem("rol", data.usuario.rol);

        actualizarUIUsuario(data.usuario.email, data.usuario.rol, data.usuario.password);

        const modalElement = document.getElementById('loginModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        console.log("Login correcto:", data);

    } catch (error) {
        document.getElementById("login-error").classList.remove("d-none");
    }
}

function actualizarUIUsuario(email, rol,password) {
    document.getElementById("btn-open-login").classList.add("d-none");
    document.getElementById("nav-user-zone").classList.remove("d-none");
    document.getElementById("nav-saludo").textContent = "Hola, " + email;

    if (rol === "ADMINISTRADOR") {
        document.getElementById("nav-admin-zone").classList.remove("d-none");
    }
}

document.getElementById("btn-logout").addEventListener("click", () => {
    sessionStorage.clear();
    location.reload();
});
document.addEventListener("DOMContentLoaded", () => {

    const email = sessionStorage.getItem("email");

    if (email) {
        actualizarUIUsuario(email, sessionStorage.getItem("rol"));
    }

});
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");
    if (form) {
        form.addEventListener("submit", login);
    }

    const email = sessionStorage.getItem("email");
    if (email) {
        actualizarUIUsuario(email, sessionStorage.getItem("rol"));
    }
});



/* ================================
   HERO SLIDER CON GRADIENTES
================================ */

const heroGradients = [
  "linear-gradient(135deg, #010424, #669ac8)",
  "linear-gradient(135deg, #b03e85, #e4ec89)",
  "linear-gradient(135deg, #468e57, #deea52)"
];

function initHeroSlider() {

    const slides = document.querySelectorAll(".hero-slide");
    const categories = document.querySelectorAll(".hero-category");
    const container = document.querySelector(".hero-slider");

    // seguridad para evitar errores
    if (!container || slides.length === 0) return;

    let index = 0;

    // fondo inicial
    container.style.background = heroGradients[0];

    function changeHero() {

        slides[index].classList.remove("active");

        if (categories[index]) {
            categories[index].classList.remove("active");
        }

        index = (index + 1) % slides.length;

        slides[index].classList.add("active");

        if (categories[index]) {
            categories[index].classList.add("active");
        }

        container.style.background = heroGradients[index];
    }

    setInterval(changeHero, 4000);
}

/* ================================
   INICIALIZAR CUANDO CARGA EL DOM
================================ */

document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
    
const carritoOffcanvas = document.getElementById("carritoOffcanvas");

if (carritoOffcanvas) {
    carritoOffcanvas.addEventListener("show.bs.offcanvas", () => {
        renderizarCarrito();
    });
}
});


