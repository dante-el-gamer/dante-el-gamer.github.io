/**
 * Main Script — Language, Settings Init, Search, UI interactions
 *
 * Loading order: nav.js → i18n.js → settings.js → script.js
 * I18N global is available at this point.
 */

const DISCORD_CLIENT_ID = '1520178317381079162';
const DISCORD_REDIRECT_URI = window.location.origin + '/discord-callback.html';
const DISCORD_SCOPE = 'identify';

const GITHUB_CLIENT_ID = 'Ov23li21sLN57xhuSweb';
const GITHUB_REDIRECT_URI = window.location.origin + '/github-callback.html';
const GITHUB_SCOPE = 'read:user';

let currentLang = localStorage.getItem('dante-lang') || 'es';

// ============================================
// i18n Engine
// ============================================

/**
 * Apply translations from I18N to all [data-i18n] elements.
 * Fallback chain: selected lang → ES → key string.
 * Handles badges via data-i18n-badge attribute.
 * Updates <html lang> and settings language select.
 */
function applyI18n(lang) {
  var translations = I18N[lang];
  if (!translations) translations = I18N.es || {};

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    var text = translations[key];
    if (!text) text = I18N.es ? I18N.es[key] : key;
    if (!text) text = key;

    if (el.tagName === 'TITLE') {
      el.innerText = text;
    } else {
      var badgeKey = el.getAttribute('data-i18n-badge');
      var badgeText = '';
      if (badgeKey) {
        var badgeVal = translations[badgeKey] || (I18N.es ? I18N.es[badgeKey] : badgeKey) || badgeKey;
        badgeText = ' <span class="i18n-badge">(' + badgeVal + ')</span>';
      }
      el.innerHTML = text + badgeText;
    }
  });

  document.documentElement.lang = lang;

  // Sync settings language select
  var select = document.getElementById('settingsLang');
  if (select) select.value = lang;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('dante-lang', lang);
  applyI18n(lang);
}

// ============================================
// Settings Init — Theme, Motion, Font Size
// ============================================

/**
 * Apply saved settings from localStorage on page load.
 * Called from DOMContentLoaded.
 */
function applySavedSettings() {
  // Theme
  var theme = localStorage.getItem('dante-theme') || 'dark';
  // applyTheme is defined in settings.js — ensure it exists
  if (typeof applyTheme === 'function') {
    applyTheme(theme);
  } else {
    // Fallback: set class directly
    document.documentElement.classList.add('theme-' + theme);
  }

  // Motion
  var motion = localStorage.getItem('dante-motion');
  if (motion === 'reduce') {
    document.documentElement.setAttribute('data-motion', 'reduce');
  }

  // Font size
  var fontSize = localStorage.getItem('dante-font-size') || 'small';
  if (typeof applyFontScale === 'function') {
    applyFontScale(fontSize);
  } else {
    var sizes = { small: '16px', medium: '20px', large: '24px' };
    document.documentElement.style.fontSize = sizes[fontSize] || '16px';
  }
}

// ============================================
// Menu Toggle
// ============================================

function toggleMenu() {
  var nav = document.getElementById('navLinks');
  var btn = document.getElementById('hamburger');
  if (!nav || !btn) return;
  nav.classList.toggle('open');
  btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', nav.classList.contains('open'));
}

// Close menu on link click (mobile)
document.addEventListener('DOMContentLoaded', function () {
  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        var btn = document.getElementById('hamburger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// Close menu on scroll
var lastScroll = 0;
window.addEventListener('scroll', function () {
  var navLinks = document.getElementById('navLinks');
  if (navLinks && navLinks.classList.contains('open')) {
    var currentScroll = window.pageYOffset;
    if (Math.abs(currentScroll - lastScroll) > 50) {
      navLinks.classList.remove('open');
    }
    lastScroll = currentScroll;
  }
});

// ============================================
// Search Logic
// ============================================

var searchState = {
  inputVisible: false,
  overlayVisible: false,
};

function toggleSearchInput() {
  var wrapper = document.getElementById('searchInputWrapper');
  var input = document.getElementById('searchInput');
  if (!wrapper || !input) return;

  searchState.inputVisible = !searchState.inputVisible;

  if (searchState.inputVisible) {
    wrapper.classList.add('visible');
    wrapper.style.display = 'flex';
    document.getElementById('navLinks').classList.add('search-open');
    input.focus();
  } else {
    wrapper.classList.remove('visible');
    wrapper.style.display = '';
    document.getElementById('navLinks').classList.remove('search-open');
    input.value = '';
    hideDropdown();
  }
}

function closeSearchInput() {
  var wrapper = document.getElementById('searchInputWrapper');
  var input = document.getElementById('searchInput');
  if (!wrapper || !input) return;

  searchState.inputVisible = false;
  wrapper.classList.remove('visible');
  wrapper.style.display = '';
  document.getElementById('navLinks').classList.remove('search-open');
  input.value = '';
  hideDropdown();
}

function filterResults(query) {
  if (!query || query.trim() === '') return [];

  var q = query.toLowerCase().trim();
  var results = [];

  for (var i = 0; i < SEARCH_INDEX.length; i++) {
    var item = SEARCH_INDEX[i];
    var score = 0;

    if (item.title.en.toLowerCase().indexOf(q) !== -1 ||
        item.title.es.toLowerCase().indexOf(q) !== -1) {
      score += 10;
    }

    var allKeywords = item.keywords.en.concat(item.keywords.es);
    for (var k = 0; k < allKeywords.length; k++) {
      var kw = allKeywords[k].toLowerCase();
      if (kw.indexOf(q) !== -1) {
        score += 5;
      }
      if (kw === q) {
        score += 3;
      }
    }

    if (score > 0) {
      results.push({ item: item, score: score });
    }
  }

  results.sort(function (a, b) { return b.score - a.score; });
  var sorted = [];
  for (var r = 0; r < results.length; r++) {
    sorted.push(results[r].item);
  }
  return sorted;
}

function performSearch(query) {
  hideDropdown();
  if (!query || query.trim() === '') return;
  var results = filterResults(query);
  if (results.length > 0) {
    showDropdown(results);
  }
}

function showDropdown(results) {
  hideDropdown();

  var wrapper = document.getElementById('searchInputWrapper');
  if (!wrapper) return;

  var dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.id = 'searchDropdown';

  var maxVisible = 4;
  for (var i = 0; i < Math.min(results.length, maxVisible); i++) {
    var r = results[i];
    var a = document.createElement('a');
    a.className = 'search-dropdown-item';
    a.href = r.url;
    a.innerHTML = '<span class="search-dd-title">' + r.title.en + ' / ' + r.title.es + '</span>';
    a.addEventListener('click', function () {
      clearSearch();
    });
    dropdown.appendChild(a);
  }

  if (results.length > maxVisible) {
    var moreBtn = document.createElement('button');
    moreBtn.className = 'search-dropdown-more';
    var showMoreText = (I18N[lang] || I18N.es || {})['search.showmore'] || 'Show more';
    moreBtn.innerHTML = showMoreText + ' <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;" aria-hidden="true">expand_more</span>';
    moreBtn.addEventListener('click', function () {
      var input = document.getElementById('searchInput');
      var q = input ? input.value : '';
      hideDropdown();
      closeSearchInput();
      showSearchOverlay(q);
    });
    dropdown.appendChild(moreBtn);
  }

  wrapper.appendChild(dropdown);
}

function hideDropdown() {
  var existing = document.getElementById('searchDropdown');
  if (existing) existing.remove();
}

function showSearchOverlay(query) {
  if (!query || query.trim() === '') return;
  if (document.getElementById('searchOverlay')) return;

  var lang = localStorage.getItem('dante-lang') || 'es';
  var tr = I18N[lang] || I18N.es || {};
  var searchingText = tr['search.searching'] || 'Searching';

  var overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.id = 'searchOverlay';

  overlay.innerHTML =
    '<div style="margin-top:80px;text-align:center;">' +
      '<img src="/assets/DanteElGamerCharLogo.png" alt="Dante" style="width:80px;height:80px;object-fit:contain;margin:0 auto 24px;border-radius:50%;border:2px solid var(--accent,#4cc9f0);padding:4px;background:var(--mdgray,#2f3136);display:block;">' +
      '<p style="font-size:1.3rem;font-weight:600;color:var(--twhite,#dcddde);">' + searchingText + '</p>' +
      '<div class="search-dots"><span></span><span></span><span></span></div>' +
    '</div>';

  document.body.appendChild(overlay);
  searchState.overlayVisible = true;

  var duration = 2000 + Math.floor(Math.random() * 1000);
  setTimeout(function () {
    hideSearchOverlay();
    var results = filterResults(query);
    showResultsView(results, query);
  }, duration);
}

function hideSearchOverlay() {
  var overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(function () { overlay.remove(); }, 300);
  }
  searchState.overlayVisible = false;
}

function showResultsView(results, query) {
  var lang = localStorage.getItem('dante-lang') || 'es';
  var tr = I18N[lang] || I18N.es || {};

  var sections = document.querySelectorAll('.hero, .section, .page-header, .page-404, .footer');
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }

  var container = document.createElement('div');
  container.className = 'search-results-view';
  container.id = 'searchResultsView';

  if (results.length === 0) {
    var noResultsText = tr['search.noresults'] || 'No results for';
    container.innerHTML =
      '<div class="search-no-results">' +
        '<div class="search-no-results-icon" style="font-size:3rem;opacity:0.4;"><span class="material-symbols-outlined" style="font-size:3rem;">search_off</span></div>' +
        '<p style="font-size:1.1rem;color:var(--bwhite,#8e9297);">' +
          noResultsText +
          ' <strong>"' + query + '"</strong>' +
        '</p>' +
      '</div>';
  } else {
    var resultsTitleText = tr['search.results'] || 'Results for';
    var titleHtml = '<h2 class="search-results-title">' +
      resultsTitleText +
      ' "<strong>' + query + '"</strong></h2>';
    container.innerHTML = titleHtml;

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var card = document.createElement('a');
      card.className = 'search-result-card';
      card.href = r.url;
      card.style.display = 'block';
      card.style.textDecoration = 'none';
      card.innerHTML =
        '<span class="search-result-title">' + r.title.en + ' / ' + r.title.es + '</span>' +
        '<div class="search-result-url">' + r.url + '</div>' +
        '<div class="search-result-desc">' +
          (r.desc ? (r.desc[lang] || r.desc.en) : '') +
        '</div>';
      card.addEventListener('click', function () {
        clearSearch();
      });
      container.appendChild(card);
    }
  }

  var clearBtnText = tr['search.clearbtn'] || 'Clear search';
  var clearBtn = document.createElement('button');
  clearBtn.className = 'search-clear-btn';
  clearBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle;" aria-hidden="true">close</span> ' + clearBtnText;
  clearBtn.addEventListener('click', function () {
    clearSearch();
  });
  container.appendChild(clearBtn);

  document.body.appendChild(container);
}

function clearSearch() {
  var resultsView = document.getElementById('searchResultsView');
  if (resultsView) resultsView.remove();

  var sections = document.querySelectorAll('.hero, .section, .page-header, .page-404, .footer');
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = '';
  }

  hideSearchOverlay();
  hideDropdown();
  closeSearchInput();
}

// ============================================
// Scroll to Top
// ============================================

function renderScrollTopBtn() {
  var btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.id = 'scrollTopBtn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<span class="material-symbols-outlined">keyboard_arrow_up</span>';
  btn.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.body.appendChild(btn);

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        btn.classList.toggle('visible', window.pageYOffset > 300);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================
// Keyboard Shortcuts
// ============================================

var shortcutsHelpVisible = false;

function toggleShortcutsHelp() {
  var existing = document.getElementById('shortcutsHelp');
  if (existing) {
    existing.remove();
    shortcutsHelpVisible = false;
    return;
  }

  var overlay = document.createElement('div');
  overlay.className = 'shortcuts-help';
  overlay.id = 'shortcutsHelp';
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      overlay.remove();
      shortcutsHelpVisible = false;
    }
  });

  overlay.innerHTML =
    '<div class="shortcuts-help-card">' +
      '<div class="shortcuts-help-title">Keyboard shortcuts</div>' +
      '<div class="shortcuts-help-grid">' +
        '<span class="shortcuts-help-key">/</span>' +
        '<span class="shortcuts-help-desc">Open search</span>' +
        '<span class="shortcuts-help-key">S</span>' +
        '<span class="shortcuts-help-desc">Open settings</span>' +
        '<span class="shortcuts-help-key">?</span>' +
        '<span class="shortcuts-help-desc">Show this help</span>' +
        '<span class="shortcuts-help-key">Esc</span>' +
        '<span class="shortcuts-help-desc">Close panels</span>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  shortcutsHelpVisible = true;
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    switch (e.key) {
      case '/':
        e.preventDefault();
        toggleSearchInput();
        break;
      case 's':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          openSettings();
        }
        break;
      case '?':
        e.preventDefault();
        toggleShortcutsHelp();
        break;
      case 'Escape':
        if (shortcutsHelpVisible) {
          toggleShortcutsHelp();
        }
        break;
    }
  });
}

// ============================================
// Discord OAuth — PKCE Flow
// ============================================

var discordConnected = localStorage.getItem('dante-discord') === 'connected';
var githubConnected = localStorage.getItem('dante-github') === 'connected';

function base64url(buf) {
  var bytes = [];
  for (var i = 0; i < buf.length; i++) bytes.push(buf[i]);
  return btoa(String.fromCharCode.apply(null, bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier() {
  var arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return base64url(arr);
}

function generateCodeChallenge(verifier) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    .then(function(buf) { return base64url(new Uint8Array(buf)); });
}

function toggleDiscord() {
  if (discordConnected) return disconnectDiscord();
  connectDiscord();
}

function connectDiscord() {
  if (!crypto || !crypto.subtle) {
    alert('Tu navegador no soporta el inicio de sesión seguro. Probá con Chrome, Firefox o Edge.');
    return;
  }

  var verifier = generateCodeVerifier();
  var state = generateCodeVerifier();
  localStorage.setItem('dante-discord-verifier', verifier);
  localStorage.setItem('dante-discord-state', state);

  generateCodeChallenge(verifier).then(function(challenge) {
    var params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      response_type: 'code',
      redirect_uri: DISCORD_REDIRECT_URI,
      scope: DISCORD_SCOPE,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: state,
    });
    window.location.href = 'https://discord.com/api/oauth2/authorize?' + params.toString();
  }).catch(function () {
    alert('Error al generar el challenge de seguridad. Probá de nuevo.');
  });
}

function disconnectDiscord() {
  var token = localStorage.getItem('dante-discord-token');
  if (token) {
    fetch('https://discord.com/api/oauth2/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        token: token,
        token_type_hint: 'access_token',
      }).toString()
    }).catch(function () {
      // Revoke from browser often fails (CORS). Session is cleared locally anyway.
    });
  }
  clearDiscordSession();
  discordConnected = false;
  applyDiscordState();
}

function clearDiscordSession() {
  var keys = [
    'dante-discord', 'dante-discord-name', 'dante-discord-id',
    'dante-discord-avatar', 'dante-discord-token', 'dante-discord-refresh',
    'dante-discord-verifier', 'dante-discord-state'
  ];
  for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
}

function applyDiscordState() {
  var btn = document.getElementById('settingsDiscordBtn');
  var connected = document.getElementById('settingsDiscordConnected');
  var nameEl = document.getElementById('settingsDiscordName');
  var avatarEl = document.getElementById('settingsDiscordAvatar');
  if (!btn || !connected || !nameEl) return;

  if (discordConnected) {
    btn.style.display = 'none';
    connected.style.display = 'flex';
    nameEl.textContent = localStorage.getItem('dante-discord-name') || 'Discord User';
    if (avatarEl) {
      var avatarUrl = localStorage.getItem('dante-discord-avatar');
      avatarEl.src = avatarUrl || '/assets/DanteElGamerCharLogo.png';
      avatarEl.style.display = avatarUrl ? '' : 'none';
    }
  } else {
    btn.style.display = 'inline-flex';
    connected.style.display = 'none';
  }
}

// ============================================
// GitHub OAuth
// ============================================

function toggleGitHub() {
  if (githubConnected) return disconnectGitHub();
  connectGitHub();
}

function connectGitHub() {
  if (!crypto || !crypto.subtle) {
    alert('Tu navegador no soporta el inicio de sesión seguro. Probá con Chrome, Firefox o Edge.');
    return;
  }

  var verifier = generateCodeVerifier();
  var state = generateCodeVerifier();
  localStorage.setItem('dante-github-verifier', verifier);
  localStorage.setItem('dante-github-state', state);

  generateCodeChallenge(verifier).then(function(challenge) {
    var params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: GITHUB_SCOPE,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: state,
    });
    window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString();
  }).catch(function () {
    alert('Error al generar el challenge de seguridad. Probá de nuevo.');
  });
}

function disconnectGitHub() {
  clearGitHubSession();
  githubConnected = false;
  applyGitHubState();
}

function clearGitHubSession() {
  var keys = [
    'dante-github', 'dante-github-name', 'dante-github-login',
    'dante-github-id', 'dante-github-avatar', 'dante-github-token',
    'dante-github-verifier', 'dante-github-state',
    'dante-github-bio', 'dante-github-url'
  ];
  for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
}

function applyGitHubState() {
  var btn = document.getElementById('settingsGitHubBtn');
  var connected = document.getElementById('settingsGitHubConnected');
  var nameEl = document.getElementById('settingsGitHubName');
  var avatarEl = document.getElementById('settingsGitHubAvatar');
  if (!btn || !connected || !nameEl) return;

  if (githubConnected) {
    btn.style.display = 'none';
    connected.style.display = 'flex';
    nameEl.textContent = localStorage.getItem('dante-github-name') || 'GitHub User';
    if (avatarEl) {
      var avatarUrl = localStorage.getItem('dante-github-avatar');
      avatarEl.src = avatarUrl || '/assets/DanteElGamerCharLogo.png';
      avatarEl.style.display = avatarUrl ? '' : 'none';
    }
  } else {
    btn.style.display = 'inline-flex';
    connected.style.display = 'none';
  }
}

// ============================================
// GitHub OAuth Toast
// ============================================

function handleGitHubToast() {
  var params = new URLSearchParams(window.location.search);
  var status = params.get('github');
  if (!status) return;

  var text = '';
  var isError = false;
  if (status === 'success') {
    text = 'Conectado a GitHub correctamente';
  } else {
    text = 'Error al conectar GitHub';
    isError = true;
  }

  var toast = document.createElement('div');
  toast.className = 'github-toast' + (isError ? ' github-toast--error' : '');
  toast.innerHTML =
    '<span class="github-toast-icon material-symbols-outlined">' +
    (isError ? 'error' : 'check_circle') +
    '</span>' +
    '<span>' + text + '</span>';
  document.body.appendChild(toast);

  // Clean URL
  var cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, '', cleanUrl);

  setTimeout(function () {
    toast.classList.add('github-toast--hide');
    setTimeout(function () { toast.remove(); }, 300);
  }, 4000);
}

// ============================================
// Discord OAuth Toast
// ============================================

function handleDiscordToast() {
  var params = new URLSearchParams(window.location.search);
  var status = params.get('discord');
  if (!status) return;

  var text = '';
  var isError = false;
  if (status === 'success') {
    text = 'Conectado a Discord correctamente';
  } else {
    text = 'Error al conectar Discord';
    isError = true;
  }

  var toast = document.createElement('div');
  toast.className = 'discord-toast' + (isError ? ' discord-toast--error' : '');
  toast.innerHTML =
    '<span class="discord-toast-icon material-symbols-outlined">' +
    (isError ? 'error' : 'check_circle') +
    '</span>' +
    '<span>' + text + '</span>';
  document.body.appendChild(toast);

  // Clean URL
  var cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, '', cleanUrl);

  setTimeout(function () {
    toast.classList.add('discord-toast--hide');
    setTimeout(function () { toast.remove(); }, 300);
  }, 4000);
}

// ============================================
// Scroll Reveal
// ============================================

function initScrollReveal() {
  if (document.documentElement.getAttribute('data-animations') === 'off') return;
  if (document.documentElement.getAttribute('data-motion') === 'reduce') return;

  var selector = '.project-card, .merch-preview, .project-card, .colab-link, .stat-card, .social-link, .section-title, .about-grid, .page-header-content';
  var elements = document.querySelectorAll(selector);

  if (elements.length === 0) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.add('reveal');
    observer.observe(elements[i]);
  }
}

// ============================================
// Smooth Page Transitions
// ============================================

function initPageTransitions() {
  if (sessionStorage.getItem('dante-transition') === 'true') {
    sessionStorage.removeItem('dante-transition');
    document.documentElement.classList.add('page-enter');
    setTimeout(function () {
      document.documentElement.classList.remove('page-enter');
    }, 400);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    if (link.host && link.host !== location.host) return;
    if (link.target === '_blank') return;
    if (link.getAttribute('href') === '#' || link.getAttribute('href') === '') return;
    if (link.hash && link.pathname === location.pathname) return;

    e.preventDefault();
    document.documentElement.classList.add('page-exit');
    sessionStorage.setItem('dante-transition', 'true');
    setTimeout(function () {
      location.href = link.href;
    }, 250);
  });
}

// ============================================
// PWA — Service Worker
// ============================================

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/PWA/sw.js');
  }
}

// ============================================
// DOM Ready — Init Everything
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  // Apply saved language
  var savedLang = localStorage.getItem('dante-lang') || 'es';
  applyI18n(savedLang);

  // Init settings from localStorage (theme, motion, font)
  applySavedSettings();

  // Sync motion checkbox if drawer is rendered
  var motionCheckbox = document.getElementById('settingsMotion');
  if (motionCheckbox) {
    motionCheckbox.checked = localStorage.getItem('dante-motion') === 'reduce';
  }

  // Apply accent color
  var savedAccent = localStorage.getItem('dante-accent') || 'cyan';
  applyAccentColor(savedAccent);

  // Apply animations
  var savedAnim = localStorage.getItem('dante-animations') || 'on';
  applyAnimations(savedAnim === 'on');

  // Apply density
  var savedDensity = localStorage.getItem('dante-density') || 'normal';
  applyDensity(savedDensity);

  // Discord state
  applyDiscordState();
  handleDiscordToast();

  // GitHub state
  applyGitHubState();
  handleGitHubToast();

  // Search input listeners
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      performSearch(this.value);
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val) {
          hideDropdown();
          closeSearchInput();
          showSearchOverlay(val);
        }
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', function (e) {
    if (searchState.inputVisible &&
        !e.target.closest('#searchInputWrapper') &&
        !e.target.closest('#searchToggle')) {
      var dropdown = document.getElementById('searchDropdown');
      if (dropdown) {
        hideDropdown();
      }
    }
  });

  // Set initial aria-expanded on hamburger
  var hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

  // Init features
  renderScrollTopBtn();
  initKeyboardShortcuts();
  initScrollReveal();
  initPageTransitions();
  registerSW();
});

// ===== Escape Key Handler =====
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;

  if (searchState.overlayVisible) {
    hideSearchOverlay();
    clearSearch();
  } else if (document.getElementById('searchDropdown')) {
    hideDropdown();
  } else if (searchState.inputVisible) {
    closeSearchInput();
  }
});
