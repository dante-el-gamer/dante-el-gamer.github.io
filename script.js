let currentLang = localStorage.getItem('dante-lang') || 'es';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('dante-lang', lang);

  // Update all elements with data-en / data-es
  document.querySelectorAll('[data-en]').forEach(el => {
    const key = el.tagName === 'TITLE' ? 'innerText' : 'innerHTML';
    if (el.dataset[lang]) {
      el[key] = el.dataset[lang];
    }
  });

  // Update <html> lang attribute
  document.documentElement.lang = lang;

  // Update lang toggle UI
  document.querySelectorAll('.lang-flag').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
}

function toggleLang() {
  setLang(currentLang === 'es' ? 'en' : 'es');
  // Close mobile menu when switching language
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.remove('open');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  nav.classList.toggle('open');
  btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', nav.classList.contains('open'));
}

// Close menu on link click (mobile)
document.getElementById('navLinks').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    document.getElementById('navLinks').classList.remove('open');
    const btn = document.getElementById('hamburger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});

// Apply saved language on load
setLang(currentLang);

// Set initial aria-expanded on hamburger button
const hamburger = document.getElementById('hamburger');
if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

// Close menu on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('open')) {
    const currentScroll = window.pageYOffset;
    if (Math.abs(currentScroll - lastScroll) > 50) {
      navLinks.classList.remove('open');
    }
    lastScroll = currentScroll;
  }
});

// ============================================
// Search Logic — Unit 2
// Functions called from nav.js and user events
// ============================================

let searchState = {
  inputVisible: false,
  overlayVisible: false,
};

/**
 * Toggle search input visibility in nav.
 * Shows/hides the input field with focus management.
 */
function toggleSearchInput() {
  const wrapper = document.getElementById('searchInputWrapper');
  const input = document.getElementById('searchInput');
  if (!wrapper || !input) return;

  searchState.inputVisible = !searchState.inputVisible;

  if (searchState.inputVisible) {
    wrapper.classList.add('visible');
    wrapper.style.display = 'flex';
    input.focus();
  } else {
    wrapper.classList.remove('visible');
    wrapper.style.display = '';
    input.value = '';
    hideDropdown();
  }
}

/**
 * Close search input without toggling.
 * Called by close button and Escape handler.
 */
function closeSearchInput() {
  const wrapper = document.getElementById('searchInputWrapper');
  const input = document.getElementById('searchInput');
  if (!wrapper || !input) return;

  searchState.inputVisible = false;
  wrapper.classList.remove('visible');
  wrapper.style.display = '';
  input.value = '';
  hideDropdown();
}

/**
 * Filter results from SEARCH_INDEX against a query.
 * Bilingual, case-insensitive, partial match.
 * Title match scores 10, keyword match scores 5, exact keyword match +3.
 * Returns sorted array of {item, score}.
 */
function filterResults(query) {
  if (!query || query.trim() === '') return [];

  var q = query.toLowerCase().trim();
  var results = [];

  for (var i = 0; i < SEARCH_INDEX.length; i++) {
    var item = SEARCH_INDEX[i];
    var score = 0;

    // Title match (highest weight)
    if (item.title.en.toLowerCase().indexOf(q) !== -1 ||
        item.title.es.toLowerCase().indexOf(q) !== -1) {
      score += 10;
    }

    // Keyword match across both languages
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
  // Return just the items (sorted)
  var sorted = [];
  for (var r = 0; r < results.length; r++) {
    sorted.push(results[r].item);
  }
  return sorted;
}

/**
 * Perform search and show results.
 * Connected to input keydown and search button.
 */
function performSearch(query) {
  hideDropdown();
  if (!query || query.trim() === '') return;

  var results = filterResults(query);

  if (results.length > 0) {
    showDropdown(results);
  }
}

/**
 * Show inline dropdown below search input (up to 4 results).
 * If more than 4, show "Show more" button.
 */
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
    moreBtn.textContent = 'Mostrar m\u00e1s / Show more';
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

/**
 * Remove the dropdown from DOM.
 */
function hideDropdown() {
  var existing = document.getElementById('searchDropdown');
  if (existing) existing.remove();
}

/**
 * Show full-viewport search overlay with logo and animated dots.
 * Random duration 2000-3000ms, then transitions to results view.
 */
function showSearchOverlay(query) {
  if (!query || query.trim() === '') return;

  // Prevent duplicate overlay
  if (document.getElementById('searchOverlay')) return;

  var lang = localStorage.getItem('dante-lang') || 'es';
  var searchingText = lang === 'es' ? 'Buscando' : 'Searching';

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

  // Random duration between 2000ms and 3000ms
  var duration = 2000 + Math.floor(Math.random() * 1000);

  setTimeout(function () {
    hideSearchOverlay();
    var results = filterResults(query);
    showResultsView(results, query);
  }, duration);
}

/**
 * Fade out and remove the overlay.
 */
function hideSearchOverlay() {
  var overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(function () { overlay.remove(); }, 300);
  }
  searchState.overlayVisible = false;
}

/**
 * Replace main content with search results cards.
 * Each result is a clickable card. "Clear search" button to restore.
 */
function showResultsView(results, query) {
  var lang = localStorage.getItem('dante-lang') || 'es';

  // Hide original content sections
  var sections = document.querySelectorAll('.hero, .section, .page-header, .page-404, .footer');
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
  }

  var container = document.createElement('div');
  container.className = 'search-results-view';
  container.id = 'searchResultsView';

  if (results.length === 0) {
    container.innerHTML =
      '<div class="search-no-results">' +
        '<div class="search-no-results-icon" style="font-size:3rem;opacity:0.4;">&#x1F50D;</div>' +
        '<p style="font-size:1.1rem;color:var(--bwhite,#8e9297);">' +
          (lang === 'es' ? 'Sin resultados para' : 'No results for') +
          ' <strong>"' + query + '"</strong>' +
        '</p>' +
      '</div>';
  } else {
    var titleHtml = '<h2 class="search-results-title">' +
      (lang === 'es' ? 'Resultados para' : 'Results for') +
      ' "<strong>' + query + '</strong>"</h2>';
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

  // Clear button
  var clearBtn = document.createElement('button');
  clearBtn.className = 'search-clear-btn';
  clearBtn.textContent = lang === 'es' ? 'Limpiar b\u00fasqueda' : 'Clear search';
  clearBtn.addEventListener('click', function () {
    clearSearch();
  });
  container.appendChild(clearBtn);

  document.body.appendChild(container);
}

/**
 * Restore original page content and reset search state.
 */
function clearSearch() {
  // Remove results view
  var resultsView = document.getElementById('searchResultsView');
  if (resultsView) resultsView.remove();

  // Restore original content sections
  var sections = document.querySelectorAll('.hero, .section, .page-header, .page-404, .footer');
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = '';
  }

  // Remove overlay
  hideSearchOverlay();

  // Hide dropdown and input
  hideDropdown();
  closeSearchInput();
}

// ===== Input event listeners =====
document.addEventListener('DOMContentLoaded', function () {
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
