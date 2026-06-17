/**
 * Shared Navigation Module
 *
 * Renders the site nav synchronously on page load.
 * All asset paths use absolute `/` prefix for consistent resolution
 * across all page depths (root, /about/, /games/, etc.).
 *
 * NAV_ITEMS — Update when adding new pages
 * SEARCH_INDEX — Update when adding new pages
 */

const NAV_ITEMS = [
  { id: 'home',     href: '/',          label: { en: 'Home',    es: 'Inicio' } },
  { id: 'about',    href: '/about',     label: { en: 'About',   es: 'Sobre mí' } },
  { id: 'projects', href: '/#projects', label: { en: 'Projects', es: 'Proyectos' } },
  { id: 'games',    href: '/games',     label: { en: 'Games',   es: 'Juegos' } },
  { id: 'colabs',   href: '/colabs',    label: { en: 'Colabs',  es: 'Colabs' } },
  { id: 'contact',  href: '/#contact',  label: { en: 'Contact', es: 'Contacto' } },
];

/**
 * SEARCH_INDEX — Bilingual searchable content index.
 * Each entry: id, bilingual title, bilingual keyword arrays, URL.
 * UPDATE when adding new pages.
 */
const SEARCH_INDEX = [
  {
    id: 'home',
    title: { en: 'Home', es: 'Inicio' },
    desc: { en: 'Welcome to my portfolio', es: 'Bienvenido a mi portfolio' },
    keywords: { en: ['home', 'dante', 'gamer', 'welcome', 'portfolio'], es: ['inicio', 'dante', 'gamer', 'bienvenida', 'portfolio'] },
    url: '/'
  },
  {
    id: 'about',
    title: { en: 'About Me', es: 'Sobre mí' },
    desc: { en: 'Learn about who I am', es: 'Conoc\u00e9 m\u00e1s sobre m\u00ed' },
    keywords: { en: ['about', 'dante', 'programmer', 'developer', 'content creator', 'artist'], es: ['sobre mí', 'dante', 'programador', 'creador de contenido', 'artista'] },
    url: '/about'
  },
  {
    id: 'projects',
    title: { en: 'Projects', es: 'Proyectos' },
    desc: { en: 'My coding projects and engines', es: 'Mis proyectos y engines' },
    keywords: { en: ['projects', 'optimized engine', 'fnf', 'classdeck', 'game', 'cards', 'github'], es: ['proyectos', 'optimized engine', 'fnf', 'classdeck', 'juego', 'cartas', 'github'] },
    url: '/#projects'
  },
  {
    id: 'games',
    title: { en: 'Games', es: 'Juegos' },
    desc: { en: 'Play my games on Itch.io', es: 'Jug\u00e1 mis juegos en Itch.io' },
    keywords: { en: ['games', 'itch.io', 'devalen runner', 'platformer', 'fnf', 'friday night funkin', 'gometry dash', 'bf test'], es: ['juegos', 'itch.io', 'devalen runner', 'plataformas', 'fnf', 'friday night funkin', 'gometry dash', 'bf test'] },
    url: '/games'
  },
  {
    id: 'colabs',
    title: { en: 'Colabs', es: 'Colabs' },
    desc: { en: 'My collaborations', es: 'Mis colaboraciones' },
    keywords: { en: ['colabs', 'collaborations', 'dino', 'kiuoto'], es: ['colabs', 'colaboraciones', 'dino', 'kiuoto'] },
    url: '/colabs'
  },
  {
    id: 'contact',
    title: { en: 'Contact', es: 'Contacto' },
    desc: { en: 'Find me on social media', es: 'Encontrame en redes' },
    keywords: { en: ['contact', 'youtube', 'twitch', 'twitter', 'x', 'instagram', 'email', 'social'], es: ['contacto', 'youtube', 'twitch', 'twitter', 'x', 'instagram', 'email', 'social'] },
    url: '/#contact'
  },
];

/**
 * Renders the full nav markup into the placeholder <div id="nav">.
 * Replaces the placeholder element entirely via outerHTML to avoid
 * duplicate element IDs.
 * @param {string} activeId — id from NAV_ITEMS to mark as .active
 */
function renderNav(activeId) {
  var lang = localStorage.getItem('dante-lang') || 'es';

  // Build nav link items
  var linksHTML = '';
  for (var i = 0; i < NAV_ITEMS.length; i++) {
    var item = NAV_ITEMS[i];
    var activeClass = item.id === activeId ? ' class="active"' : '';
    linksHTML += '<li><a href="' + item.href + '"' + activeClass +
      ' data-en="' + item.label.en + '" data-es="' + item.label.es + '">' +
      item.label[lang] + '</a></li>';
  }

  // Search icon as inline SVG (magnifying glass)
  // onclick="toggleSearchInput()" wired below
  var searchIcon =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
      '<circle cx="11" cy="11" r="8"/>' +
      '<path d="M21 21l-4.35-4.35"/>' +
    '</svg>';

  var navHTML =
    '<nav class="nav" id="nav">' +
      '<div class="nav-inner">' +
        '<a href="/" class="nav-logo">' +
          '<img src="/assets/DanteElGamerWhiteLogo.png" alt="Dante el Gamer" class="nav-logo-img">' +
        '</a>' +
        '<ul class="nav-links" id="navLinks">' +
          linksHTML +
          '<li>' +
            '<button class="search-toggle" id="searchToggle" onclick="toggleSearchInput()" aria-label="Search" title="Search">' + searchIcon + '</button>' +
          '</li>' +
          '<li class="lang-switch">' +
            '<button id="langToggle" class="lang-btn" onclick="toggleLang()">' +
              '<img class="lang-flag active" data-lang="es" src="/assets/Leng_flags/es.png" alt="ES">' +
              '<img class="lang-flag" data-lang="en" src="/assets/Leng_flags/en.png" alt="EN">' +
            '</button>' +
          '</li>' +
        '</ul>' +
        '<div class="search-input-wrapper" id="searchInputWrapper">' +
          '<input type="text" class="search-input" id="searchInput" placeholder="Search... / Buscar..." aria-label="Search">' +
          '<button class="search-toggle" id="searchCloseBtn" onclick="closeSearchInput()" aria-label="Close search">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
              '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<button class="nav-hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</nav>';

  // Replace placeholder entirely (avoids nested duplicate #nav IDs)
  var placeholder = document.getElementById('nav');
  if (placeholder) {
    placeholder.outerHTML = navHTML;
  }
}
