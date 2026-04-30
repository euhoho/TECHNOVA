document.addEventListener('DOMContentLoaded', () => {

  /* ── GitHub perfiles ──
     Lista de miembros del equipo con su usuario de GitHub, el ID de su tarjeta
     en el DOM, su rol en el proyecto y una descripción breve de sus tareas */
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

  // Llama a la API pública de GitHub para obtener el avatar, nombre y enlace
  // del perfil de cada miembro y los inyecta en su tarjeta correspondiente del DOM.
  // Si la petición falla (rate limit, red, etc.) lo notifica en consola sin romper la página.
  async function cargarPerfil(miembro) {
    try {
      const res  = await fetch(`https://api.github.com/users/${miembro.username}`);
      const data = await res.json();
      const card = document.getElementById(miembro.cardId);
      if (!card) return; // Sale si la tarjeta no existe en esta página

      card.querySelector('.ns-github-avatar').src       = data.avatar_url;
      card.querySelector('.ns-github-name').textContent = data.name || data.login; // Usa login si no tiene nombre público
      card.querySelector('.ns-github-user').textContent = '@' + data.login;
      card.querySelector('.ns-github-link').href        = data.html_url;
      card.querySelector('.ns-member-rol').textContent  = miembro.rol;
      card.querySelector('.ns-member-desc').textContent = miembro.desc;
    } catch (err) {
      console.warn('Error cargando perfil GitHub:', err);
    }
  }

  // Lanza las peticiones de todos los miembros en paralelo (sin await en el forEach)
  miembros.forEach(cargarPerfil);

  /* ── Reveal on scroll ──
     Añade la clase 'ns-reveal' (elemento invisible) a las tarjetas de miembros,
     valores y bloques de texto, y las registra en un IntersectionObserver para
     que aparezcan con animación cuando el usuario hace scroll hasta ellas */
  const cards = document.querySelectorAll('.ns-member-card, .ns-value-item, .ns-stack-item, .ns-text-block');
  cards.forEach(el => el.classList.add('ns-reveal'));

  // El elemento debe ser al menos un 10% visible para activar la animación
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Respeta el retraso opcional definido en data-delay (en ms) para escalonar la entrada
        const d = parseInt(e.target.getAttribute('data-delay') || 0);
        setTimeout(() => e.target.classList.add('ns-visible'), d);
        obs.unobserve(e.target); // Deja de observar el elemento una vez que ya apareció
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(el => obs.observe(el));
});