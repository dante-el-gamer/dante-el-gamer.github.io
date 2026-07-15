/**
 * Settings Drawer Module
 *
 * Renders a slide-out settings drawer (Discord-inspired) with controls
 * for theme, language, reduced motion, and font size.
 * Same pattern as nav.js — synchronous render on page load.
 *
 * localStorage keys:
 *   dante-theme     — 'dark' | 'light' | 'darker'
 *   dante-lang      — 'es' | 'en' | 'pt' | 'it' | 'fr'
 *   dante-motion    — 'reduce' | ''
 *   dante-font-size — 'small' | 'medium' | 'large'
 */

/**
 * Inject settings drawer and backdrop into the DOM.
 * Call AFTER i18n.js is loaded so aria-labels can use English fallback.
 */
function renderSettings() {
  var placeholder = document.getElementById('settings');
  if (!placeholder) return;

  var html =
    '<div class="settings-backdrop" id="settingsBackdrop" onclick="closeSettings()"></div>' +
    '<div class="settings-drawer" id="settingsDrawer">' +
      '<div class="settings-header">' +
        '<h2 data-i18n="settings.title">Settings</h2>' +
        '<button class="settings-close" onclick="closeSettings()" aria-label="Close settings">' +
          '<span class="material-symbols-outlined">close</span>' +
        '</button>' +
      '</div>' +
      '<div class="settings-body">' +

        /* ── Theme ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.theme">Theme</label>' +
          '<div class="settings-btn-group">' +
            '<button class="settings-btn" data-theme="dark" onclick="applyTheme(\'dark\')">' +
              '<span data-i18n="settings.theme.dark">Dark</span>' +
            '</button>' +
            '<button class="settings-btn" data-theme="light" onclick="applyTheme(\'light\')">' +
              '<span data-i18n="settings.theme.light">Light</span>' +
              ' <span class="i18n-badge" data-i18n-badge="settings.badge.beta">(Beta)</span>' +
            '</button>' +
            '<button class="settings-btn" data-theme="darker" onclick="applyTheme(\'darker\')">' +
              '<span data-i18n="settings.theme.darker">Darker</span>' +
              ' <span class="i18n-badge" data-i18n-badge="settings.badge.beta">(Beta)</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── Language ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.language">Language</label>' +
          '<select class="settings-select" id="settingsLang" onchange="setLang(this.value)">' +
            '<option value="es" data-i18n="lang.es">Español</option>' +
            '<option value="en" data-i18n="lang.en">English</option>' +
            '<option value="pt" data-i18n="lang.pt">Português</option>' +
            '<option value="it" data-i18n="lang.it">Italiano</option>' +
            '<option value="fr" data-i18n="lang.fr">Français</option>' +
          '</select>' +
        '</div>' +

        /* ── Reduced Motion ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label">' +
            '<input type="checkbox" id="settingsMotion" onchange="applyMotion(this.checked)" />' +
            ' <span data-i18n="settings.motion">Reduced motion</span>' +
          '</label>' +
        '</div>' +

        /* ── Font Size ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.fontsize">Font size</label>' +
          '<div class="settings-btn-group">' +
            '<button class="settings-btn" data-font="small" onclick="applyFontScale(\'small\')">' +
              '<span data-i18n="settings.fontsize.small">Small</span>' +
            '</button>' +
            '<button class="settings-btn" data-font="medium" onclick="applyFontScale(\'medium\')">' +
              '<span data-i18n="settings.fontsize.medium">Medium</span>' +
            '</button>' +
            '<button class="settings-btn" data-font="large" onclick="applyFontScale(\'large\')">' +
              '<span data-i18n="settings.fontsize.large">Large</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── Accent Color ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.accent">Accent color</label>' +
          '<div class="settings-swatches">' +
            '<button class="settings-swatch" data-accent="cyan" style="--swatch:#4cc9f0" onclick="applyAccentColor(\'cyan\')" title="Cyan" aria-label="Cyan"></button>' +
            '<button class="settings-swatch" data-accent="purple" style="--swatch:#a855f7" onclick="applyAccentColor(\'purple\')" title="Purple" aria-label="Purple"></button>' +
            '<button class="settings-swatch" data-accent="pink" style="--swatch:#ec4899" onclick="applyAccentColor(\'pink\')" title="Pink" aria-label="Pink"></button>' +
            '<button class="settings-swatch" data-accent="green" style="--swatch:#22c55e" onclick="applyAccentColor(\'green\')" title="Green" aria-label="Green"></button>' +
            '<button class="settings-swatch" data-accent="orange" style="--swatch:#f97316" onclick="applyAccentColor(\'orange\')" title="Orange" aria-label="Orange"></button>' +
            '<button class="settings-swatch" data-accent="blue" style="--swatch:#3b82f6" onclick="applyAccentColor(\'blue\')" title="Blue" aria-label="Blue"></button>' +
          '</div>' +
        '</div>' +

        /* ── Animations ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.animations">Animations</label>' +
          '<div class="settings-btn-group">' +
            '<button class="settings-btn" data-anim="on" onclick="applyAnimations(true)">' +
              '<span data-i18n="settings.animations.on">On</span>' +
            '</button>' +
            '<button class="settings-btn" data-anim="off" onclick="applyAnimations(false)">' +
              '<span data-i18n="settings.animations.off">Off</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── Density ── */
        '<div class="settings-group">' +
          '<label class="settings-group-label" data-i18n="settings.density">Density</label>' +
          '<div class="settings-btn-group">' +
            '<button class="settings-btn" data-density="normal" onclick="applyDensity(\'normal\')">' +
              '<span data-i18n="settings.density.normal">Normal</span>' +
            '</button>' +
            '<button class="settings-btn" data-density="compact" onclick="applyDensity(\'compact\')">' +
              '<span data-i18n="settings.density.compact">Compact</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── Discord ── */
        '<div class="settings-group settings-discord-group">' +
          '<label class="settings-group-label" data-i18n="settings.discord">Discord</label>' +
          '<div id="settingsDiscordSection">' +
            '<button class="settings-discord-btn" id="settingsDiscordBtn" onclick="toggleDiscord()">' +
              '<svg class="settings-discord-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
                '<path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>' +
              '</svg>' +
              '<span data-i18n="settings.discord.connect">Connect Discord</span>' +
            '</button>' +
            '<div id="settingsDiscordConnected" class="settings-discord-connected" style="display:none;">' +
              '<div class="settings-discord-user">' +
                '<img id="settingsDiscordAvatar" class="settings-discord-avatar" src="/assets/DanteElGamerCharLogo.png" alt="" />' +
                '<span id="settingsDiscordName"></span>' +
              '</div>' +
              '<div class="settings-discord-status" data-i18n="settings.discord.connected">Connected as</div>' +
              '<button class="settings-btn settings-discord-disconnect" onclick="toggleDiscord()">' +
                '<span data-i18n="settings.discord.disconnect">Disconnect</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* ── GitHub ── */
        '<div class="settings-group settings-github-group">' +
          '<label class="settings-group-label" data-i18n="settings.github">GitHub</label>' +
          '<div id="settingsGitHubSection">' +
            '<button class="settings-discord-btn settings-github-btn" id="settingsGitHubBtn" onclick="toggleGitHub()">' +
              '<svg class="settings-discord-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
                '<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>' +
              '</svg>' +
              '<span data-i18n="settings.github.connect">Connect GitHub</span>' +
            '</button>' +
            '<div id="settingsGitHubConnected" class="settings-discord-connected settings-github-connected" style="display:none;">' +
              '<div class="settings-discord-user">' +
                '<img id="settingsGitHubAvatar" class="settings-discord-avatar" src="/assets/DanteElGamerCharLogo.png" alt="" />' +
                '<span id="settingsGitHubName"></span>' +
              '</div>' +
              '<div class="settings-discord-status" data-i18n="settings.github.connected">Connected as</div>' +
              '<button class="settings-btn settings-discord-disconnect" onclick="toggleGitHub()">' +
                '<span data-i18n="settings.github.disconnect">Disconnect</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' + // /settings-body
    '</div>';   // /settings-drawer

  placeholder.outerHTML = html;
}

/** Open the settings drawer with backdrop. */
function openSettings() {
  var backdrop = document.getElementById('settingsBackdrop');
  var drawer = document.getElementById('settingsDrawer');
  if (!backdrop || !drawer) return;

  // Close mobile nav if open
  var navLinks = document.getElementById('navLinks');
  if (navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    var hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }

  backdrop.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  setTimeout(function () {
    var first = drawer.querySelector('button, select, input, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  }, 100);
}

/** Close the settings drawer. */
function closeSettings() {
  var backdrop = document.getElementById('settingsBackdrop');
  var drawer = document.getElementById('settingsDrawer');
  if (!backdrop || !drawer) return;

  backdrop.classList.remove('open');
  drawer.classList.remove('open');
  document.body.style.overflow = '';

  // Return focus to the gear button
  var gear = document.getElementById('settingsToggle');
  if (gear) gear.focus();
}

/**
 * Apply theme: set class on <html>, persist to localStorage.
 * Called by settings theme buttons and on page load.
 */
function applyTheme(theme) {
  var html = document.documentElement;
  html.classList.remove('theme-dark', 'theme-light', 'theme-darker');
  html.classList.add('theme-' + theme);
  localStorage.setItem('dante-theme', theme);

  // Update active state on theme buttons
  var buttons = document.querySelectorAll('.settings-btn[data-theme]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-theme') === theme);
  }
}

/**
 * Apply reduced motion: set data-motion attribute on <html>.
 * @param {boolean} reduce — true to reduce, false for normal
 */
function applyMotion(reduce) {
  var html = document.documentElement;
  if (reduce) {
    html.setAttribute('data-motion', 'reduce');
    localStorage.setItem('dante-motion', 'reduce');
  } else {
    html.removeAttribute('data-motion');
    localStorage.setItem('dante-motion', '');
  }

  // Sync checkbox state
  var checkbox = document.getElementById('settingsMotion');
  if (checkbox) checkbox.checked = !!reduce;
}

/**
 * Apply font size scale: set font-size on <html> element.
 * Values: small = 16px (1x), medium = 20px (1.25x), large = 24px (1.5x)
 */
function applyFontScale(size) {
  var html = document.documentElement;
  var sizes = { small: '16px', medium: '20px', large: '24px' };
  html.style.fontSize = sizes[size] || '16px';
  localStorage.setItem('dante-font-size', size);

  // Update active state on font buttons
  var buttons = document.querySelectorAll('.settings-btn[data-font]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-font') === size);
  }
}

/**
 * Apply accent color: set data-accent on <html>, persist to localStorage.
 */
function applyAccentColor(color) {
  document.documentElement.setAttribute('data-accent', color);
  localStorage.setItem('dante-accent', color);

  var swatches = document.querySelectorAll('.settings-swatch');
  for (var i = 0; i < swatches.length; i++) {
    swatches[i].classList.toggle('active', swatches[i].getAttribute('data-accent') === color);
  }
}

/**
 * Apply animations toggle: set data-animations on <html>.
 * @param {boolean} enabled
 */
function applyAnimations(enabled) {
  var val = enabled ? 'on' : 'off';
  document.documentElement.setAttribute('data-animations', val);
  localStorage.setItem('dante-animations', val);

  var buttons = document.querySelectorAll('.settings-btn[data-anim]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-anim') === val);
  }
}

/**
 * Apply density mode: set data-density on <html>.
 * @param {'normal'|'compact'} mode
 */
function applyDensity(mode) {
  document.documentElement.setAttribute('data-density', mode);
  localStorage.setItem('dante-density', mode);

  var buttons = document.querySelectorAll('.settings-btn[data-density]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-density') === mode);
  }
}

// ===== Focus Trap for Drawer =====
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSettings();
    return;
  }

  if (e.key !== 'Tab') return;

  var drawer = document.getElementById('settingsDrawer');
  if (!drawer || !drawer.classList.contains('open')) return;

  var focusable = drawer.querySelectorAll(
    'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
  );
  if (focusable.length === 0) return;

  var first = focusable[0];
  var last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
