document.addEventListener('DOMContentLoaded', () => {

  /* ── GitHub perfiles ── */
  const miembros = [
    {
      username: 'ShaghyAsghari',
      cardId:   'member-01',
      rol:      'Desarrollo Frontend',
      desc:     'Diseño de interfaz, estilos y experiencia de usuario. Responsable de que cada página se vea y se sienta como un producto real.'
    },
    {
      username: 'Davidfg02',
      cardId:   'member-02',
      rol:      'Desarrollo Backend',
      desc:     'Arquitectura del servidor y construcción de la API REST con Spring Boot. Gestión de la lógica de negocio y seguridad.'
    },
    {
      username: 'Rayan-t-t',
      cardId:   'member-03',
      rol:      'Base de Datos',
      desc:     'Diseño del modelo de datos y gestión de MySQL. Implementación de la capa de persistencia con Hibernate y JPA.'
    },
    {
      username: 'euhoho',
      cardId:   'member-04',
      rol:      'Integración & QA',
      desc:     'Coordinación entre capas, pruebas de integración y control de versiones con Git. Garantiza la calidad del producto final.'
    },
  ];

  async function cargarPerfil(miembro) {
    try {
      const res  = await fetch(`https://api.github.com/users/${miembro.username}`);
      const data = await res.json();
      const card = document.getElementById(miembro.cardId);
      if (!card) return;

      card.querySelector('.ns-github-avatar').src       = data.avatar_url;
      card.querySelector('.ns-github-name').textContent = data.name || data.login;
      card.querySelector('.ns-github-user').textContent = '@' + data.login;
      card.querySelector('.ns-github-link').href        = data.html_url;
      card.querySelector('.ns-member-rol').textContent  = miembro.rol;
      card.querySelector('.ns-member-desc').textContent = miembro.desc;
    } catch (err) {
      console.warn('Error cargando perfil GitHub:', err);
    }
  }

  miembros.forEach(cargarPerfil);

  /* ── Reveal on scroll ── */
  const cards = document.querySelectorAll('.ns-member-card, .ns-value-item, .ns-stack-item, .ns-text-block');
  cards.forEach(el => el.classList.add('ns-reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.getAttribute('data-delay') || 0);
        setTimeout(() => e.target.classList.add('ns-visible'), d);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(el => obs.observe(el));
});