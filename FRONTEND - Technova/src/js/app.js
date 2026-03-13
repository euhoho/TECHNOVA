/* ================================
   LOGIN & SESIÓN
================================ */
//document.getElementById("login-form").addEventListener("submit", login);
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", login);
}

document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");

    if (navbarContainer) {
        fetch("navbar.html")
            .then(res => res.text())
            .then(data => {
                navbarContainer.innerHTML = data;

                const btnLogout = document.getElementById("btn-logout");
                if (btnLogout) {
                    btnLogout.addEventListener("click", () => {
                        sessionStorage.clear();
                        location.reload();
                    });
                }

                const email = sessionStorage.getItem("email");
                const rol = sessionStorage.getItem("rol");
                if (email) {
                    actualizarUIUsuario(email, rol);
                }
            });
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
        sessionStorage.setItem("rol", data.usuario.rol);

        actualizarUIUsuario(data.usuario.email, data.usuario.rol);

        const modalElement = document.getElementById('loginModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        console.log("Login correcto:", data);

    } catch (error) {
        document.getElementById("login-error").classList.remove("d-none");
    }
}

function actualizarUIUsuario(email, rol) {
    document.getElementById("btn-open-login").classList.add("d-none");
    document.getElementById("nav-user-zone").classList.remove("d-none");
    document.getElementById("nav-saludo").textContent = "Hola, " + email;

    if (rol === "ADMINISTRADOR") {
        document.getElementById("nav-admin-zone").classList.remove("d-none");
    }
}
/*
document.getElementById("btn-logout").addEventListener("click", () => {
    sessionStorage.clear();
    location.reload();
});
*/




/* ================================
   CARRITO
================================ */
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

function initCarrito() {
    document.querySelectorAll(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {

            const card = e.target.closest(".card");

            carrito.push({
                nombre: card.querySelector(".card-title").textContent,
                precio: card.querySelector(".fw-bold").textContent
            });

            sessionStorage.setItem("carrito", JSON.stringify(carrito));
            document.getElementById("cart-count").textContent = carrito.length;
        });
    });
}


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

    let index = 0;

    if (!container || slides.length === 0) return;

    container.style.background = heroGradients[0];

    function changeHero() {

        slides[index].classList.remove("active");
        categories[index].classList.remove("active");

        index = (index + 1) % slides.length;

        slides[index].classList.add("active");
        categories[index].classList.add("active");

        container.style.background = heroGradients[index];
    }

    setInterval(changeHero, 4000);
}