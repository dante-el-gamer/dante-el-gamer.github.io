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
  { id: 'projects', href: '/projects', label: { en: 'Projects', es: 'Proyectos' } },
  { id: 'games',    href: '/games',     label: { en: 'Games',   es: 'Juegos' } },
  { id: 'colabs',   href: '/colabs',    label: { en: 'Colabs',  es: 'Colabs' } },
  { id: 'merch',    href: '/merch',     label: { en: 'Merch',   es: 'Merch' } },
  { id: 'contact',  href: '/#contact', label: { en: 'Contact', es: 'Contacto' } },
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
    url: '/projects'
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
    id: 'merch',
    title: { en: 'Merch', es: 'Merch' },
    desc: { en: 'Official Dante el Gamer merchandise', es: 'Merch oficial de Dante el Gamer' },
    keywords: { en: ['merch', 'merchandise', 'hoodie', 'sweater', 'backpack', 'mug', 'cup', 'glass', 'mousepad', 'store', 'shop'], es: ['merch', 'mercancía', 'sudadera', 'mochila', 'taza', 'vaso', 'mausepad', 'tienda', 'comprar'] },
    url: '/merch'
  },
  {
    id: 'contact',
    title: { en: 'Contact', es: 'Contacto' },
    desc: { en: 'Find me on social media', es: 'Encontrame en redes' },
    keywords: { en: ['contact', 'youtube', 'twitch', 'twitter', 'x', 'instagram', 'email', 'social'], es: ['contacto', 'youtube', 'twitch', 'twitter', 'x', 'instagram', 'email', 'social'] },
    url: '/contact'
  },
];

/**
 * Renders the full nav markup into the placeholder <div id="nav">.
 * Replaces the placeholder element entirely via outerHTML to avoid
 * duplicate element IDs.
 * Nav links use data-i18n for translation (filled by script.js applyI18n).
 * @param {string} activeId — id from NAV_ITEMS to mark as .active
 */
function renderNav(activeId) {
  // Build nav link items with data-i18n (content filled by applyI18n later)
  var linksHTML = '';
  for (var i = 0; i < NAV_ITEMS.length; i++) {
    var item = NAV_ITEMS[i];
    var activeClass = item.id === activeId ? ' class="active"' : '';
    linksHTML += '<li><a href="' + item.href + '"' + activeClass +
      ' data-i18n="nav.' + item.id + '"></a></li>';
  }

  var navHTML =
    '<nav class="nav" id="nav">' +
      '<div class="nav-inner">' +
        '<a href="/" class="nav-logo">' +
          '<img src="/assets/DanteElGamerWhiteLogo.png" alt="Dante el Gamer" class="nav-logo-img">' +
        '</a>' +
        '<ul class="nav-links" id="navLinks">' +
          linksHTML +
          '<li>' +
            '<button class="search-toggle" id="searchToggle" onclick="toggleSearchInput()" aria-label="Search" title="Search"><span class="material-symbols-outlined">search</span></button>' +
          '</li>' +
          '<li>' +
            '<button class="search-toggle" id="settingsToggle" onclick="openSettings()" aria-label="Settings" title="Settings"><span class="material-symbols-outlined">settings</span></button>' +
          '</li>' +
        '</ul>' +
        '<div class="search-input-wrapper" id="searchInputWrapper">' +
          '<input type="text" class="search-input" id="searchInput" placeholder="Search... / Buscar..." aria-label="Search">' +
          '<button class="search-toggle" id="searchCloseBtn" onclick="closeSearchInput()" aria-label="Close search"><span class="material-symbols-outlined">close</span></button>' +
        '</div>' +
        '<button class="nav-hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu"><span class="material-symbols-outlined">menu</span></button>' +
      '</div>' +
    '</nav>';

  // Replace placeholder entirely (avoids nested duplicate #nav IDs)
  var placeholder = document.getElementById('nav');
  if (placeholder) {
    placeholder.outerHTML = navHTML;
  }
}
