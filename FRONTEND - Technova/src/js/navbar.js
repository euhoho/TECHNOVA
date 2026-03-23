async function cargarNavbar() {
  const res  = await fetch('./navbar.html');
  const html = await res.text();
  const contenedor = document.getElementById('navbar-container');
  contenedor.innerHTML = html;

  // TODO el código de eventos va AQUÍ dentro, no fuera
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

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
  const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
  const total   = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const count   = document.getElementById('cartCount');
  if (count) count.textContent = total;
}

cargarNavbar();