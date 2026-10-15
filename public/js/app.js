import { searchPlaces, getPlace, submitReview, getRoute as fetchRoute } from './api.js';

/* ==========================================================================
   1. CONSTANTES E ÍCONES SVG
   ========================================================================== */

const ICONS = {
  check: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M7.5 13.5L3.5 9.5l-1 1 5 5 10-10-1-1z" fill="currentColor"/></svg>',
  x: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M14.5 4.5l-1-1L10 7 6.5 3.5l-1 1L9 8 5.5 11.5l1 1L10 9l3.5 3.5 1-1L11 8z" fill="currentColor"/></svg>',
  question: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 13H9v-2h2zm0-4H9c0-3 3-2.75 3-5a2 2 0 00-4 0H6a4 4 0 118 0c0 2.5-3 2.75-3 5z" fill="currentColor"/></svg>',
  mobility: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1a5 5 0 105.9 5.9h-2.07z" fill="currentColor"/></svg>',
  visual: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>',
  auditory: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h-2c0-1.65-1.35-3-3-3s-3 1.35-3 3c0 1.43.94 2.93 2.08 4.22.4.45.98.87 1.55 1.27 1.08.78 2.43 1.79 3.13 3.87.19.56.32 1.07.42 1.53 0 .13.01.13.01.13L18 20h-1zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z" fill="currentColor"/></svg>',
  sensory: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4zm7-13.93C7.05 1.56 4 4.92 4 9h7V1.07z" fill="currentColor"/></svg>',
  elderly: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
};

const NEED_LABELS = {
  mobility: 'Mobilidade',
  visual: 'Visual',
  auditory: 'Auditiva',
  sensory: 'Sensorial / Autismo',
  elderly: 'Idosos'
};

const NEED_DESCRIPTIONS = {
  mobility: 'Sem escadas / mobilidade reduzida',
  visual: 'Deficiência visual / piso tátil',
  auditory: 'Deficiência auditiva / Libras',
  sensory: 'Ambiente calmo / autismo',
  elderly: 'Apoio para idosos: assentos e sinalização'
};

const STATUS_LABELS = {
  available: 'Disponível',
  barrier: 'Barreira',
  unverified: 'Não verificado',
  unknown: 'Não sei'
};

const CATEGORY_LABELS = {
  shopping: 'Shopping',
  estádio: 'Estádio',
  restaurante: 'Restaurante',
  parque: 'Parque',
  hospital: 'Hospital',
  cultura: 'Cultura'
};

const ALL_NEEDS = ['mobility', 'visual', 'auditory', 'sensory', 'elderly'];

/* ==========================================================================
   2. ESTADO E PREFERÊNCIAS (LOCALSTORAGE)
   ========================================================================== */

function getPreferences() {
  try {
    return JSON.parse(localStorage.getItem('avia_preferences')) || [];
  } catch {
    return [];
  }
}

function setPreferences(prefs) {
  try {
    localStorage.setItem('avia_preferences', JSON.stringify(prefs));
  } catch (err) {
    console.error('Erro ao salvar preferências no localStorage:', err);
  }
}

/* ==========================================================================
   3. FUNÇÕES AUXILIARES DE RENDERIZAÇÃO E FORMATAÇÃO
   ========================================================================== */

/**
 * Cria elemento DOM de maneira segura, com atributos, classes e texto.
 * NUNCA injeta HTML de usuário via innerHTML.
 */
function el(tag, { className, attrs, text, html } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (attrs) {
    Object.entries(attrs).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        element.setAttribute(k, String(v));
      }
    });
  }
  if (text !== undefined && text !== null) {
    element.textContent = text;
  }
  if (html) {
    // Usado APENAS para SVGs estáticos confiáveis
    element.innerHTML = html;
  }
  return element;
}

/**
 * Formata data no formato DD/MM/AAAA.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
}

/**
 * Retorna o SVG de status confiável.
 */
function statusIcon(status) {
  switch (status) {
    case 'available':
      return ICONS.check;
    case 'barrier':
      return ICONS.x;
    case 'unverified':
    default:
      return ICONS.question;
  }
}

/**
 * Normaliza strings de status.
 */
function normalizeStatus(st) {
  if (!st) return 'unverified';
  const s = String(st).toLowerCase().trim();
  if (s === 'available' || s === 'disponivel' || s === 'disponível') return 'available';
  if (s === 'barrier' || s === 'barreira') return 'barrier';
  if (s === 'unknown' || s === 'nao sei' || s === 'não sei') return 'unknown';
  return 'unverified';
}

/**
 * Formata a origem/fonte de verificação de um item.
 */
function formatItemSource(item) {
  if (item.verified_at) {
    return `Verificado em ${formatDate(item.verified_at)}`;
  }
  if (item.source) {
    const s = String(item.source).toLowerCase();
    if (s.startsWith('verificado')) return item.source;
    if (s === 'community' || s === 'comunidade') return 'Relato da comunidade';
    if (s === 'team' || s === 'equipe') return 'Verificado pela equipe';
    return item.source;
  }
  return 'Relato da comunidade';
}

/**
 * Renderiza mensagem de carregamento acessível.
 */
function renderLoading(container, message = 'Carregando...') {
  const loading = el('div', {
    className: 'text-center mt-32 mb-32',
    attrs: { 'role': 'status', 'aria-live': 'polite' }
  });
  const text = el('p', {
    className: 'empty-state__title',
    text: message
  });
  loading.appendChild(text);
  container.appendChild(loading);
}

/**
 * Renderiza bloco de erro amigável com opção de tentar novamente.
 */
function renderError(container, message, retryFn = null) {
  const errorBox = el('div', {
    className: 'empty-state',
    attrs: { 'role': 'alert' }
  });
  const icon = el('span', {
    className: 'empty-state__icon',
    attrs: { 'aria-hidden': 'true' },
    html: ICONS.x
  });
  errorBox.appendChild(icon);

  const title = el('h2', {
    className: 'empty-state__title',
    text: 'Não foi possível carregar as informações'
  });
  errorBox.appendChild(title);

  const desc = el('p', {
    className: 'empty-state__desc',
    text: message || 'Ocorreu um erro ao comunicar com o servidor.'
  });
  errorBox.appendChild(desc);

  if (retryFn) {
    const retryBtn = el('button', {
      className: 'btn-primary',
      attrs: { 'type': 'button' },
      text: 'Tentar novamente'
    });
    retryBtn.addEventListener('click', retryFn);
    errorBox.appendChild(retryBtn);
  }
  container.appendChild(errorBox);
}

/* ==========================================================================
   4. ROTEAMENTO E NAVEGAÇÃO
   ========================================================================== */

function getRoute() {
  const hash = window.location.hash || '#/';
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawPath, queryString] = cleanHash.split('?');
  
  const query = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }
  }

  const path = (rawPath && rawPath.startsWith('/') ? rawPath : '/' + (rawPath || '')).replace(/\/+$/, '') || '/';

  // #/ -> home
  if (path === '/') {
    return { page: 'home', params: {}, query };
  }
  // #/preferences -> preferences
  if (path === '/preferences') {
    return { page: 'preferences', params: {}, query };
  }
  // #/results -> results
  if (path === '/results') {
    return { page: 'results', params: {}, query };
  }
  // #/route -> route
  if (path === '/route') {
    return { page: 'route', params: {}, query };
  }

  // #/place/:id/review
  const reviewMatch = path.match(/^\/place\/([^/]+)\/review$/);
  if (reviewMatch) {
    return { page: 'review', params: { id: decodeURIComponent(reviewMatch[1]) }, query };
  }

  // #/place/:id
  const placeMatch = path.match(/^\/place\/([^/]+)$/);
  if (placeMatch) {
    return { page: 'place', params: { id: decodeURIComponent(placeMatch[1]) }, query };
  }

  return { page: 'home', params: {}, query };
}

function navigate(hash) {
  window.location.hash = hash;
}

function updateActiveNav(route) {
  let navTarget = 'home';
  if (route.page === 'home') navTarget = 'home';
  else if (route.page === 'preferences') navTarget = 'preferences';
  else if (route.page === 'results' || route.page === 'place' || route.page === 'review') navTarget = 'results';
  else if (route.page === 'route') navTarget = 'route';

  const navLinks = document.querySelectorAll('[data-nav]');
  navLinks.forEach(link => {
    if (link.getAttribute('data-nav') === navTarget) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

async function handleRoute() {
  const route = getRoute();
  updateActiveNav(route);
  
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = ''; // Limpa conteúdo anterior com segurança

  try {
    switch (route.page) {
      case 'home':
        document.title = 'Avia — Saiba antes. Vá com confiança.';
        await renderHome(main);
        break;
      case 'preferences':
        document.title = 'Preferências de Acessibilidade — Avia';
        await renderPreferences(main);
        break;
      case 'results':
        document.title = 'Resultados da Busca — Avia';
        await renderResults(main, route.query);
        break;
      case 'place':
        await renderPlace(main, route.params.id);
        break;
      case 'review':
        await renderReview(main, route.params.id);
        break;
      case 'route':
        document.title = 'Planejador de Rota Acessível — Avia';
        await renderRoute(main, route.query);
        break;
      default:
        document.title = 'Avia — Saiba antes. Vá com confiança.';
        await renderHome(main);
    }
  } catch (err) {
    console.error('Erro ao renderizar tela:', err);
    main.innerHTML = '';
    renderError(main, 'Ocorreu um erro ao carregar a página solicitada. Tente recarregar.');
  }

  // Scroll to top e foco para leitores de tela
  window.scrollTo(0, 0);
  if (!main.hasAttribute('tabindex')) {
    main.setAttribute('tabindex', '-1');
  }
  main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

/* ==========================================================================
   5. TELA 1: HOME (renderHome)
   ========================================================================== */

function renderHome(container) {
  const homeWrapper = el('section', { className: 'home' });

  // Logo
  const logo = el('img', {
    className: 'home__logo',
    attrs: {
      src: '/assets/logo.svg',
      alt: 'Avia',
      width: '80',
      height: '93'
    }
  });
  homeWrapper.appendChild(logo);

  // Slogan
  const slogan = el('h1', {
    className: 'home__slogan',
    text: 'Saiba antes. Vá com confiança.'
  });
  homeWrapper.appendChild(slogan);

  // Caixa de Busca
  const searchForm = el('form', {
    className: 'search-box',
    attrs: { 'role': 'search' }
  });

  const searchLabel = el('label', {
    className: 'sr-only',
    attrs: { 'for': 'home-search-input' },
    text: 'Buscar estabelecimentos ou locais'
  });
  searchForm.appendChild(searchLabel);

  const searchInput = el('input', {
    className: 'search-box__input',
    attrs: {
      id: 'home-search-input',
      type: 'search',
      name: 'q',
      placeholder: 'Buscar shoppings, restaurantes, parques...',
      autocomplete: 'off'
    }
  });
  searchForm.appendChild(searchInput);

  const searchBtn = el('button', {
    className: 'search-box__btn',
    attrs: {
      type: 'submit',
      'aria-label': 'Pesquisar'
    },
    text: 'Buscar'
  });
  searchForm.appendChild(searchBtn);

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = searchInput.value.trim();
    if (val) {
      navigate(`#/results?q=${encodeURIComponent(val)}`);
    } else {
      navigate('#/results');
    }
  });

  homeWrapper.appendChild(searchForm);

  // Atalhos de Categorias
  const catSection = el('nav', {
    className: 'category-shortcuts',
    attrs: { 'aria-label': 'Atalhos por categoria' }
  });

  Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
    const chip = el('a', {
      className: 'category-chip',
      attrs: {
        href: `#/results?category=${encodeURIComponent(key)}`
      },
      text: label
    });
    catSection.appendChild(chip);
  });
  homeWrapper.appendChild(catSection);

  // Resumo de Preferências de Acessibilidade
  const userPrefs = getPreferences();
  const prefBox = el('div', { className: 'preferences-summary' });

  if (userPrefs.length > 0) {
    const prefTitle = el('div', {
      className: 'preferences-summary__title',
      text: 'Suas preferências de acessibilidade ativas:'
    });
    prefBox.appendChild(prefTitle);

    const chipsWrap = el('div', { className: 'preferences-summary__chips' });
    userPrefs.forEach(need => {
      const chip = el('span', { className: 'preferences-summary__chip' });
      const icon = el('span', {
        attrs: { 'aria-hidden': 'true' },
        html: ICONS[need] || ICONS.check
      });
      chip.appendChild(icon);
      const label = el('span', { text: NEED_LABELS[need] || need });
      chip.appendChild(label);
      chipsWrap.appendChild(chip);
    });

    const editLink = el('a', {
      className: 'preferences-summary__link',
      attrs: { href: '#/preferences' },
      text: 'Alterar preferências'
    });
    chipsWrap.appendChild(editLink);
    prefBox.appendChild(chipsWrap);
  } else {
    const emptyPrompt = el('div', { className: 'text-center' });
    const promptLink = el('a', {
      className: 'preferences-summary__link',
      attrs: { href: '#/preferences' },
      text: 'Defina suas preferências para resultados personalizados'
    });
    const arrow = el('span', {
      attrs: { 'aria-hidden': 'true', style: 'margin-left: 6px; display: inline-block;' },
      html: ICONS.arrow
    });
    promptLink.appendChild(arrow);
    emptyPrompt.appendChild(promptLink);
    prefBox.appendChild(emptyPrompt);
  }

  homeWrapper.appendChild(prefBox);
  container.appendChild(homeWrapper);
}

/* ==========================================================================
   6. TELA 2: PREFERÊNCIAS (renderPreferences)
   ========================================================================== */

function renderPreferences(container) {
  const wrapper = el('section', { className: 'preferences' });

  const header = el('header', { className: 'preferences__header' });
  const title = el('h1', {
    className: 'preferences__title',
    text: 'Suas preferências de acessibilidade'
  });
  header.appendChild(title);

  const subtitle = el('p', {
    className: 'preferences__intro',
    text: 'Selecione as necessidades que são importantes para você'
  });
  header.appendChild(subtitle);
  wrapper.appendChild(header);

  // Estado local na tela
  const currentPrefs = new Set(getPreferences());
  const chipsGroup = el('div', {
    className: 'pref-chips-group',
    attrs: { 'role': 'group', 'aria-label': 'Lista de necessidades de acessibilidade' }
  });

  const chipButtons = {};

  ALL_NEEDS.forEach(need => {
    const isSelected = currentPrefs.has(need);
    const btn = el('button', {
      className: `pref-chip ${isSelected ? 'pref-chip--selected' : ''}`,
      attrs: {
        type: 'button',
        'aria-pressed': isSelected ? 'true' : 'false',
        'data-need': need
      }
    });

    const iconSpan = el('span', {
      attrs: { 'aria-hidden': 'true' },
      html: ICONS[need] || ICONS.check
    });
    btn.appendChild(iconSpan);

    const textSpan = el('span', { text: `${NEED_LABELS[need]} — ${NEED_DESCRIPTIONS[need]}` });
    btn.appendChild(textSpan);

    btn.addEventListener('click', () => {
      if (currentPrefs.has(need)) {
        currentPrefs.delete(need);
        btn.classList.remove('pref-chip--selected');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        currentPrefs.add(need);
        btn.classList.add('pref-chip--selected');
        btn.setAttribute('aria-pressed', 'true');
      }
    });

    chipButtons[need] = btn;
    chipsGroup.appendChild(btn);
  });
  wrapper.appendChild(chipsGroup);

  // Aviso de Privacidade Local
  const notice = el('div', {
    className: 'pref-notice',
    attrs: { 'role': 'note' },
    text: 'Sem conta e sem diagnóstico: suas escolhas ficam neste aparelho.'
  });
  wrapper.appendChild(notice);

  // Botões de Ação (Salvar / Limpar)
  const actions = el('div', {
    className: 'flex gap-12 mt-24 items-center flex-wrap'
  });

  const saveBtn = el('button', {
    className: 'pref-save-btn',
    attrs: { type: 'button' },
    text: 'Salvar preferências'
  });
  saveBtn.addEventListener('click', () => {
    setPreferences(Array.from(currentPrefs));
    navigate('#/');
  });
  actions.appendChild(saveBtn);

  const clearBtn = el('button', {
    className: 'btn-secondary',
    attrs: { type: 'button' },
    text: 'Limpar escolhas'
  });
  clearBtn.addEventListener('click', () => {
    currentPrefs.clear();
    Object.values(chipButtons).forEach(btn => {
      btn.classList.remove('pref-chip--selected');
      btn.setAttribute('aria-pressed', 'false');
    });
  });
  actions.appendChild(clearBtn);

  const backLink = el('a', {
    className: 'btn-secondary',
    attrs: { href: '#/' },
    text: 'Voltar'
  });
  actions.appendChild(backLink);

  wrapper.appendChild(actions);
  container.appendChild(wrapper);
}

/* ==========================================================================
   7. TELA 3: RESULTADOS DA BUSCA (renderResults)
   ========================================================================== */

async function renderResults(container, query = {}) {
  const q = (query.q || '').trim();
  const category = (query.category || '').trim();
  const userPrefs = getPreferences();

  // Container principal
  const resultsWrapper = el('section', { className: 'results-wrapper' });
  container.appendChild(resultsWrapper);

  // Caixa de pesquisa rápida no topo
  const searchBar = el('form', { className: 'search-box mb-16', attrs: { 'role': 'search' } });
  const searchInput = el('input', {
    className: 'search-box__input',
    attrs: {
      type: 'search',
      placeholder: 'Buscar por nome ou endereço...',
      value: q,
      'aria-label': 'Pesquisar locais'
    }
  });
  const searchBtn = el('button', {
    className: 'search-box__btn',
    attrs: { type: 'submit' },
    text: 'Buscar'
  });
  searchBar.appendChild(searchInput);
  searchBar.appendChild(searchBtn);
  searchBar.addEventListener('submit', (e) => {
    e.preventDefault();
    const newQ = searchInput.value.trim();
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (category) params.set('category', category);
    navigate(`#/results?${params.toString()}`);
  });
  resultsWrapper.appendChild(searchBar);

  // Barra de Filtros de Categoria
  const filtersNav = el('nav', {
    className: 'results-filters',
    attrs: { 'aria-label': 'Filtrar por categoria' }
  });

  // Filtro "Todos"
  const allChip = el('a', {
    className: `filter-chip ${!category ? 'filter-chip--active' : ''}`,
    attrs: {
      href: `#/results${q ? `?q=${encodeURIComponent(q)}` : ''}`
    },
    text: 'Todos'
  });
  filtersNav.appendChild(allChip);

  Object.entries(CATEGORY_LABELS).forEach(([catKey, catLabel]) => {
    const chip = el('a', {
      className: `filter-chip ${category === catKey ? 'filter-chip--active' : ''}`,
      attrs: {
        href: `#/results?category=${encodeURIComponent(catKey)}${q ? `&q=${encodeURIComponent(q)}` : ''}`
      },
      text: catLabel
    });
    filtersNav.appendChild(chip);
  });
  resultsWrapper.appendChild(filtersNav);

  // Loading inicial
  const contentArea = el('div', { attrs: { 'aria-live': 'polite' } });
  resultsWrapper.appendChild(contentArea);
  renderLoading(contentArea, 'Buscando locais...');

  let places = [];
  try {
    const rawData = await searchPlaces({
      q,
      category,
      needs: userPrefs.join(',')
    });
    places = Array.isArray(rawData) ? rawData : (rawData.places || []);
  } catch (err) {
    contentArea.innerHTML = '';
    renderError(contentArea, 'Erro ao buscar locais. Verifique sua conexão e tente novamente.', () => {
      renderResults(container, query);
    });
    return;
  }

  contentArea.innerHTML = '';

  // Cabeçalho de Resultados & Ordenação
  const resultsHeader = el('div', { className: 'results-header' });
  const titleInfo = el('div');
  
  let summaryText = 'Todos os locais';
  if (q && category) {
    summaryText = `Resultados para "${q}" em ${CATEGORY_LABELS[category] || category}`;
  } else if (q) {
    summaryText = `Resultados para "${q}"`;
  } else if (category) {
    summaryText = `Locais em ${CATEGORY_LABELS[category] || category}`;
  }

  const hTitle = el('h1', { className: 'results-title', text: summaryText });
  titleInfo.appendChild(hTitle);

  const countSubtitle = el('span', {
    className: 'results-count',
    text: `${places.length} ${places.length === 1 ? 'local encontrado' : 'locais encontrados'}`
  });
  titleInfo.appendChild(countSubtitle);
  resultsHeader.appendChild(titleInfo);

  // Controle de Ordenação
  const sortContainer = el('div', { className: 'flex items-center gap-8' });
  const sortLabel = el('label', {
    attrs: { 'for': 'results-sort-select' },
    className: 'sr-only',
    text: 'Ordenar resultados'
  });
  sortContainer.appendChild(sortLabel);

  const sortSelect = el('select', {
    id: 'results-sort-select',
    className: 'sort-select',
    attrs: { 'aria-label': 'Ordenar resultados' }
  });

  const sortOptions = [
    { value: 'name-asc', text: 'Nome (A-Z)' },
    { value: 'available-desc', text: 'Mais disponíveis' },
    { value: 'barrier-asc', text: 'Menos barreiras' }
  ];

  sortOptions.forEach(opt => {
    const optEl = el('option', { attrs: { value: opt.value }, text: opt.text });
    sortSelect.appendChild(optEl);
  });

  sortContainer.appendChild(sortSelect);
  resultsHeader.appendChild(sortContainer);
  contentArea.appendChild(resultsHeader);

  // Lista de Cards
  const cardsContainer = el('div', { className: 'places-list' });
  contentArea.appendChild(cardsContainer);

  function sortPlacesList(list, mode) {
    const copy = [...list];
    if (mode === 'name-asc') {
      copy.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
    } else if (mode === 'available-desc') {
      copy.sort((a, b) => {
        const aAv = a.counts?.available ?? a.available_count ?? 0;
        const bAv = b.counts?.available ?? b.available_count ?? 0;
        return bAv - aAv;
      });
    } else if (mode === 'barrier-asc') {
      copy.sort((a, b) => {
        const aBar = a.counts?.barrier ?? a.barrier_count ?? 0;
        const bBar = b.counts?.barrier ?? b.barrier_count ?? 0;
        return aBar - bBar;
      });
    }
    return copy;
  }

  function renderCards(list) {
    cardsContainer.innerHTML = '';

    if (list.length === 0) {
      const empty = el('div', { className: 'empty-state', attrs: { 'role': 'status' } });
      const emptyIcon = el('span', {
        className: 'empty-state__icon',
        attrs: { 'aria-hidden': 'true' },
        html: ICONS.question
      });
      empty.appendChild(emptyIcon);

      const emptyTitle = el('h2', {
        className: 'empty-state__title',
        text: 'Nenhum local encontrado'
      });
      empty.appendChild(emptyTitle);

      const emptyDesc = el('p', {
        className: 'empty-state__desc',
        text: 'Nenhum local encontrado para essa busca. Tente termos diferentes ou remova filtros.'
      });
      empty.appendChild(emptyDesc);

      const resetBtn = el('a', {
        className: 'btn-primary',
        attrs: { href: '#/results' },
        text: 'Ver todos os locais'
      });
      empty.appendChild(resetBtn);
      cardsContainer.appendChild(empty);
      return;
    }

    list.forEach(place => {
      const card = el('a', {
        className: 'place-card',
        attrs: {
          href: `#/place/${encodeURIComponent(place.id)}`,
          'aria-label': `${place.name}, ${CATEGORY_LABELS[place.category] || place.category}`
        }
      });

      // Cabeçalho do Card
      const cardHeader = el('div', { className: 'place-card__header' });
      const nameEl = el('h2', { className: 'place-card__name', text: place.name });
      cardHeader.appendChild(nameEl);

      const categoryText = CATEGORY_LABELS[place.category] || place.category || 'Geral';
      const catBadge = el('span', { className: 'place-card__category', text: categoryText });
      cardHeader.appendChild(catBadge);
      card.appendChild(cardHeader);

      // Metadados (Bairro / Endereço)
      const meta = el('div', { className: 'place-card__meta' });
      const addressParts = [];
      if (place.neighborhood) addressParts.push(place.neighborhood);
      if (place.address && place.address !== place.neighborhood) addressParts.push(place.address);
      const metaText = addressParts.join(' • ') || 'Endereço não informado';
      const locationSpan = el('span', { text: metaText });
      meta.appendChild(locationSpan);

      if (place.distance) {
        const distSpan = el('span', {
          className: 'place-card__distance',
          text: `(${place.distance})`
        });
        meta.appendChild(distSpan);
      }
      card.appendChild(meta);

      // Badges com Contagem (Disponível / Barreira / Não Verificado)
      const countsWrap = el('div', {
        className: 'place-card__counts',
        attrs: { 'aria-label': 'Resumo de acessibilidade' }
      });

      const countAv = place.counts?.available ?? place.available_count ?? 0;
      const countBar = place.counts?.barrier ?? place.barrier_count ?? 0;
      const countUnv = place.counts?.unverified ?? place.unverified_count ?? 0;

      // Badge Disponível
      const badgeAv = el('span', {
        className: 'count-badge count-badge--available',
        attrs: { title: `${countAv} recursos disponíveis` }
      });
      badgeAv.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.check }));
      badgeAv.appendChild(el('span', { text: `${countAv} disponíveis` }));
      countsWrap.appendChild(badgeAv);

      // Badge Barreira
      const badgeBar = el('span', {
        className: 'count-badge count-badge--barrier',
        attrs: { title: `${countBar} barreiras identificadas` }
      });
      badgeBar.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.x }));
      badgeBar.appendChild(el('span', { text: `${countBar} barreiras` }));
      countsWrap.appendChild(badgeBar);

      // Badge Não Verificado
      const badgeUnv = el('span', {
        className: 'count-badge count-badge--unverified',
        attrs: { title: `${countUnv} itens não verificados` }
      });
      badgeUnv.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.question }));
      badgeUnv.appendChild(el('span', { text: `${countUnv} não verificados` }));
      countsWrap.appendChild(badgeUnv);

      card.appendChild(countsWrap);
      cardsContainer.appendChild(card);
    });
  }

  // Inicializa com ordenação padrão
  renderCards(sortPlacesList(places, sortSelect.value));

  // Mudança de ordenação no cliente
  sortSelect.addEventListener('change', () => {
    renderCards(sortPlacesList(places, sortSelect.value));
  });
}

/* ==========================================================================
   8. TELA 4: DETALHES DO LOCAL (renderPlace)
   ========================================================================== */

async function renderPlace(container, id) {
  renderLoading(container, 'Carregando detalhes do local...');

  let place = null;
  try {
    place = await getPlace(id);
  } catch (err) {
    container.innerHTML = '';
    renderError(container, 'Local não encontrado ou indisponível.', () => {
      navigate('#/results');
    });
    return;
  }

  container.innerHTML = '';
  document.title = `${place.name} — Avia`;

  const detailWrapper = el('article', { className: 'place-detail' });

  // Cabeçalho do Local
  const header = el('header', { className: 'place-detail__header' });

  const categoryName = CATEGORY_LABELS[place.category] || place.category || 'Geral';
  const categoryBadge = el('span', { className: 'place-detail__category', text: categoryName });
  header.appendChild(categoryBadge);

  const title = el('h1', { className: 'place-detail__name', text: place.name });
  header.appendChild(title);

  const meta = el('div', { className: 'place-detail__meta' });
  const addressParts = [];
  if (place.address) addressParts.push(place.address);
  if (place.neighborhood && place.neighborhood !== place.address) addressParts.push(place.neighborhood);
  const locationText = addressParts.join(' • ') || 'Endereço não informado';
  meta.appendChild(el('span', { text: locationText }));

  const verifiedDate = place.last_verified_at || place.last_verified || place.verified_at;
  if (verifiedDate) {
    meta.appendChild(el('span', { text: `Última verificação: ${formatDate(verifiedDate)}` }));
  }
  header.appendChild(meta);

  if (place.description) {
    const desc = el('p', { className: 'place-detail__description', text: place.description });
    header.appendChild(desc);
  }

  // Resumo de Contagens
  const countsWrap = el('div', {
    className: 'place-card__counts',
    attrs: { 'aria-label': 'Resumo de acessibilidade deste local' }
  });

  const countAv = place.counts?.available ?? place.available_count ?? 0;
  const countBar = place.counts?.barrier ?? place.barrier_count ?? 0;
  const countUnv = place.counts?.unverified ?? place.unverified_count ?? 0;

  const bAv = el('span', { className: 'count-badge count-badge--available' });
  bAv.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.check }));
  bAv.appendChild(el('span', { text: `${countAv} disponíveis` }));
  countsWrap.appendChild(bAv);

  const bBar = el('span', { className: 'count-badge count-badge--barrier' });
  bBar.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.x }));
  bBar.appendChild(el('span', { text: `${countBar} barreiras` }));
  countsWrap.appendChild(bBar);

  const bUnv = el('span', { className: 'count-badge count-badge--unverified' });
  bUnv.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: ICONS.question }));
  bUnv.appendChild(el('span', { text: `${countUnv} não verificados` }));
  countsWrap.appendChild(bUnv);

  header.appendChild(countsWrap);
  detailWrapper.appendChild(header);

  // Botões de Ação
  const actions = el('div', { className: 'detail-actions' });
  const reviewBtn = el('a', {
    className: 'btn-primary',
    attrs: { href: `#/place/${encodeURIComponent(place.id)}/review` },
    text: 'Avaliar este local'
  });
  actions.appendChild(reviewBtn);

  const routeBtn = el('a', {
    className: 'btn-secondary',
    attrs: { href: `#/route?to=${encodeURIComponent(place.id)}` },
    text: 'Planejar rota até aqui'
  });
  actions.appendChild(routeBtn);
  detailWrapper.appendChild(actions);

  // Agrupamento de Itens por Necessidade
  const items = Array.isArray(place.items) ? place.items : [];
  const itemsByNeed = {};
  ALL_NEEDS.forEach(n => { itemsByNeed[n] = []; });

  items.forEach(item => {
    const needKey = item.need || item.category || item.need_category;
    if (itemsByNeed[needKey]) {
      itemsByNeed[needKey].push(item);
    } else {
      itemsByNeed[needKey] = itemsByNeed[needKey] || [];
      itemsByNeed[needKey].push(item);
    }
  });

  const accessibilityContainer = el('section', {
    attrs: { 'aria-label': 'Recursos e barreiras de acessibilidade' }
  });

  ALL_NEEDS.forEach(needKey => {
    const needItems = itemsByNeed[needKey] || [];
    if (needItems.length === 0) return;

    const section = el('section', { className: 'need-section' });
    const secTitle = el('h2', { className: 'need-section__title' });

    const iconSpan = el('span', {
      attrs: { 'aria-hidden': 'true' },
      html: ICONS[needKey] || ICONS.check
    });
    secTitle.appendChild(iconSpan);

    const titleText = el('span', { text: NEED_LABELS[needKey] || needKey });
    secTitle.appendChild(titleText);
    section.appendChild(secTitle);

    const ul = el('ul', { className: 'item-list' });
    needItems.forEach(item => {
      const status = normalizeStatus(item.status);
      const li = el('li', { className: `item-row item-row--${status}` });

      const itemIcon = el('span', {
        className: 'item-row__icon',
        attrs: { 'aria-hidden': 'true' },
        html: statusIcon(status)
      });
      li.appendChild(itemIcon);

      const titleContent = item.title || item.name || item.description || 'Item de acessibilidade';
      const itemText = el('span', {
        className: 'item-row__text',
        text: titleContent
      });
      li.appendChild(itemText);

      const sourceTag = el('span', {
        className: 'item-row__source',
        text: formatItemSource(item)
      });
      li.appendChild(sourceTag);

      ul.appendChild(li);
    });

    section.appendChild(ul);
    accessibilityContainer.appendChild(section);
  });

  detailWrapper.appendChild(accessibilityContainer);

  // Seção de Avaliações da Comunidade
  const reviews = Array.isArray(place.reviews) ? place.reviews : [];
  const reviewsSection = el('section', { className: 'reviews-section' });

  const revTitle = el('h2', {
    className: 'reviews-section__title',
    text: `Avaliações da comunidade (${reviews.length})`
  });
  reviewsSection.appendChild(revTitle);

  if (reviews.length > 0) {
    reviews.forEach(review => {
      const revCard = el('article', { className: 'review-card' });

      const revHeader = el('header', { className: 'review-card__header' });
      const author = el('span', {
        className: 'review-card__author',
        text: review.author || 'Pessoa colaboradora'
      });
      revHeader.appendChild(author);

      const dateStr = review.visit_date || review.date || review.created_at;
      const revDate = el('span', {
        className: 'review-card__date',
        text: formatDate(dateStr)
      });
      revHeader.appendChild(revDate);
      revCard.appendChild(revHeader);

      if (review.comment) {
        const comment = el('p', {
          className: 'review-card__comment',
          text: review.comment
        });
        revCard.appendChild(comment);
      }

      // Chips das necessidades avaliadas
      const reviewBadges = el('div', { className: 'review-card__items' });
      const reviewedMap = {};

      if (review.needs && typeof review.needs === 'object') {
        Object.entries(review.needs).forEach(([k, v]) => {
          reviewedMap[k] = v;
        });
      }

      ALL_NEEDS.forEach(nKey => {
        if (review[nKey]) {
          reviewedMap[nKey] = review[nKey];
        }
      });

      Object.entries(reviewedMap).forEach(([nKey, val]) => {
        const norm = normalizeStatus(val);
        if (norm === 'unknown') return;

        const badge = el('span', {
          className: `count-badge count-badge--${norm}`
        });
        badge.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, html: statusIcon(norm) }));
        badge.appendChild(el('span', {
          text: `${NEED_LABELS[nKey] || nKey}: ${STATUS_LABELS[norm] || norm}`
        }));
        reviewBadges.appendChild(badge);
      });

      if (reviewBadges.children.length > 0) {
        revCard.appendChild(reviewBadges);
      }

      reviewsSection.appendChild(revCard);
    });
  } else {
    const emptyRev = el('p', {
      className: 'empty-state__desc',
      text: 'Ainda não há avaliações da comunidade para este local. Seja a primeira pessoa a compartilhar informações!'
    });
    reviewsSection.appendChild(emptyRev);

    const firstReviewBtn = el('a', {
      className: 'btn-secondary mt-16',
      attrs: { href: `#/place/${encodeURIComponent(place.id)}/review` },
      text: 'Escrever primeira avaliação'
    });
    reviewsSection.appendChild(firstReviewBtn);
  }

  detailWrapper.appendChild(reviewsSection);
  container.appendChild(detailWrapper);
}

/* ==========================================================================
   9. TELA 5: FORMULÁRIO DE AVALIAÇÃO (renderReview)
   ========================================================================== */

async function renderReview(container, placeId) {
  renderLoading(container, 'Carregando formulário...');

  let place = null;
  try {
    place = await getPlace(placeId);
  } catch (err) {
    container.innerHTML = '';
    renderError(container, 'Não foi possível carregar os dados deste local.', () => {
      navigate(`#/place/${encodeURIComponent(placeId)}`);
    });
    return;
  }

  container.innerHTML = '';
  document.title = `Avaliar ${place.name} — Avia`;

  const formWrapper = el('section', { className: 'review-form' });

  // Título e Local
  const title = el('h1', { className: 'review-form__title', text: 'Avaliar local' });
  formWrapper.appendChild(title);

  const placeNameEl = el('div', { className: 'review-form__place-name', text: place.name });
  formWrapper.appendChild(placeNameEl);

  const intro = el('p', {
    className: 'empty-state__desc',
    text: 'Sua avaliação ajuda a comunidade a saber com clareza o que esperar. Responda apenas o que você conhece ou vivenciou.'
  });
  formWrapper.appendChild(intro);

  // Formulário
  const form = el('form', { attrs: { novalidate: 'true' } });

  // Data da Visita
  const dateGroup = el('div', { className: 'form-group' });
  const dateLabel = el('label', {
    className: 'form-label',
    attrs: { 'for': 'visit-date-input' },
    text: 'Data da visita *'
  });
  dateGroup.appendChild(dateLabel);

  const todayIso = new Date().toISOString().split('T')[0];
  const dateInput = el('input', {
    id: 'visit-date-input',
    className: 'form-input',
    attrs: {
      type: 'date',
      name: 'visit_date',
      required: 'true',
      max: todayIso,
      value: todayIso
    }
  });
  dateGroup.appendChild(dateInput);
  form.appendChild(dateGroup);

  // Grupos de Opções para Cada Necessidade
  ALL_NEEDS.forEach(needKey => {
    const group = el('fieldset', { className: 'need-review-group' });

    const legend = el('legend', { className: 'need-review-group__title' });
    const iconSpan = el('span', {
      attrs: { 'aria-hidden': 'true', style: 'margin-right: 6px;' },
      html: ICONS[needKey] || ICONS.check
    });
    legend.appendChild(iconSpan);
    const legendText = el('span', { text: `${NEED_LABELS[needKey]} — ${NEED_DESCRIPTIONS[needKey]}` });
    legend.appendChild(legendText);
    group.appendChild(legend);

    const radioGroup = el('div', { className: 'radio-group', attrs: { 'role': 'radiogroup' } });

    const options = [
      { value: 'available', label: 'Disponível', icon: ICONS.check, classSuffix: 'available' },
      { value: 'barrier', label: 'Barreira', icon: ICONS.x, classSuffix: 'barrier' },
      { value: 'unknown', label: 'Não sei', icon: ICONS.question, classSuffix: 'unknown' }
    ];

    const labels = [];

    options.forEach(opt => {
      const optLabel = el('label', {
        className: 'radio-option'
      });

      const radio = el('input', {
        attrs: {
          type: 'radio',
          name: `need_${needKey}`,
          value: opt.value
        }
      });

      optLabel.appendChild(radio);

      const optIcon = el('span', {
        attrs: { 'aria-hidden': 'true' },
        html: opt.icon
      });
      optLabel.appendChild(optIcon);

      const optText = el('span', { text: opt.label });
      optLabel.appendChild(optText);

      labels.push({ labelEl: optLabel, radioEl: radio, classSuffix: opt.classSuffix });

      radio.addEventListener('change', () => {
        labels.forEach(({ labelEl, radioEl, classSuffix }) => {
          labelEl.classList.remove(
            'radio-option--selected-available',
            'radio-option--selected-barrier',
            'radio-option--selected-unknown'
          );
          if (radioEl.checked) {
            labelEl.classList.add(`radio-option--selected-${classSuffix}`);
          }
        });
      });

      radioGroup.appendChild(optLabel);
    });

    group.appendChild(radioGroup);
    form.appendChild(group);
  });

  // Comentário Opcional
  const commentGroup = el('div', { className: 'form-group' });
  const commentLabel = el('label', {
    className: 'form-label',
    attrs: { 'for': 'review-comment-input' },
    text: 'Comentário adicional (opcional)'
  });
  commentGroup.appendChild(commentLabel);

  const commentTextarea = el('textarea', {
    id: 'review-comment-input',
    className: 'form-textarea',
    attrs: {
      name: 'comment',
      maxlength: '1000',
      rows: '4',
      placeholder: 'Conte detalhes sobre piso tátil, rampas, portas, ruído, atendimento...'
    }
  });
  commentGroup.appendChild(commentTextarea);

  const charCounter = el('div', {
    className: 'review-card__date text-center',
    attrs: { style: 'text-align: right; margin-top: 4px;' },
    text: '0 / 1000 caracteres'
  });
  commentTextarea.addEventListener('input', () => {
    const len = commentTextarea.value.length;
    charCounter.textContent = `${len} / 1000 caracteres`;
  });
  commentGroup.appendChild(charCounter);
  form.appendChild(commentGroup);

  // Mensagem de Erro Inline
  const errorContainer = el('div', {
    className: 'form-error',
    attrs: {
      'role': 'alert',
      style: 'display: none; margin-bottom: 16px;'
    }
  });
  form.appendChild(errorContainer);

  // Mensagem de Sucesso
  const successContainer = el('div', {
    className: 'form-success',
    attrs: {
      'role': 'status',
      style: 'display: none;'
    }
  });
  form.appendChild(successContainer);

  // Botões de Submissão
  const submitBtn = el('button', {
    className: 'btn-primary form-submit',
    attrs: { type: 'submit' },
    text: 'Enviar avaliação'
  });
  form.appendChild(submitBtn);

  const cancelLink = el('a', {
    className: 'btn-secondary form-submit text-center',
    attrs: {
      href: `#/place/${encodeURIComponent(placeId)}`,
      style: 'margin-top: 10px; display: block;'
    },
    text: 'Cancelar'
  });
  form.appendChild(cancelLink);

  // Validação e Envio
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';

    const visitDateVal = dateInput.value.trim();
    if (!visitDateVal) {
      errorContainer.textContent = 'Informe a data da visita.';
      errorContainer.style.display = 'flex';
      dateInput.focus();
      return;
    }

    const selectedNeeds = {};
    let hasAtLeastOneSelection = false;

    ALL_NEEDS.forEach(nKey => {
      const checked = form.querySelector(`input[name="need_${nKey}"]:checked`);
      if (checked) {
        selectedNeeds[nKey] = checked.value;
        hasAtLeastOneSelection = true;
      }
    });

    if (!hasAtLeastOneSelection) {
      errorContainer.textContent = 'Selecione pelo menos uma opção de acessibilidade.';
      errorContainer.style.display = 'flex';
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Desabilita botão durante o envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando avaliação...';

    const payload = {
      visit_date: visitDateVal,
      comment: commentTextarea.value.trim(),
      needs: selectedNeeds,
      ...selectedNeeds
    };

    try {
      await submitReview(placeId, payload);
      form.style.display = 'none';
      successContainer.textContent = 'Avaliação enviada com sucesso! Obrigado por colaborar.';
      successContainer.style.display = 'block';
      formWrapper.appendChild(successContainer);

      setTimeout(() => {
        navigate(`#/place/${encodeURIComponent(placeId)}`);
      }, 2000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar avaliação';
      errorContainer.textContent = err.message || 'Erro ao enviar avaliação. Tente novamente.';
      errorContainer.style.display = 'flex';
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  formWrapper.appendChild(form);
  container.appendChild(formWrapper);
}

/* ==========================================================================
   10. TELA 6: PLANEJADOR DE ROTA (renderRoute & SVG)
   ========================================================================== */

/**
 * Gera um mapa esquemático em SVG com origem, trajeto, destino e pontos de atenção.
 */
function createSchematicMapSvg(originLabel, destinationLabel, steps = []) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 600 220');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '220');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Mapa esquemático da rota de ${originLabel} até ${destinationLabel}`);

  const title = document.createElementNS(svgNS, 'title');
  title.textContent = `Rota acessível de ${originLabel} até ${destinationLabel}`;
  svg.appendChild(title);

  // Fundo com bordas suaves
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '600');
  bg.setAttribute('height', '220');
  bg.setAttribute('fill', '#FAF6EF');
  bg.setAttribute('rx', '14');
  svg.appendChild(bg);

  // Linhas guia de referência
  const grid = document.createElementNS(svgNS, 'line');
  grid.setAttribute('x1', '40');
  grid.setAttribute('y1', '110');
  grid.setAttribute('x2', '560');
  grid.setAttribute('y2', '110');
  grid.setAttribute('stroke', '#D9D2C5');
  grid.setAttribute('stroke-width', '2');
  grid.setAttribute('stroke-dasharray', '8 6');
  svg.appendChild(grid);

  // Traçado da rota com curvas suaves
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M 90 110 C 180 50, 240 170, 330 110 S 440 60, 510 110');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#0F4C5C');
  path.setAttribute('stroke-width', '6');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  // Marcadores intermediários de atenção ou acessibilidade
  const alertStep = steps.find(s => s.alert || s.warning);
  if (alertStep) {
    const alertCircle = document.createElementNS(svgNS, 'circle');
    alertCircle.setAttribute('cx', '330');
    alertCircle.setAttribute('cy', '110');
    alertCircle.setAttribute('r', '9');
    alertCircle.setAttribute('fill', '#8E2A20');
    alertCircle.setAttribute('stroke', '#FAF6EF');
    alertCircle.setAttribute('stroke-width', '3');
    svg.appendChild(alertCircle);

    const alertLabel = document.createElementNS(svgNS, 'text');
    alertLabel.setAttribute('x', '330');
    alertLabel.setAttribute('y', '140');
    alertLabel.setAttribute('text-anchor', 'middle');
    alertLabel.setAttribute('fill', '#8E2A20');
    alertLabel.setAttribute('font-size', '11');
    alertLabel.setAttribute('font-weight', '700');
    alertLabel.setAttribute('font-family', 'var(--font-heading), sans-serif');
    alertLabel.textContent = 'Alerta no trajeto';
    svg.appendChild(alertLabel);
  }

  // Ponto A - Origem
  const pA = document.createElementNS(svgNS, 'circle');
  pA.setAttribute('cx', '90');
  pA.setAttribute('cy', '110');
  pA.setAttribute('r', '16');
  pA.setAttribute('fill', '#0F4C5C');
  svg.appendChild(pA);

  const textA = document.createElementNS(svgNS, 'text');
  textA.setAttribute('x', '90');
  textA.setAttribute('y', '115');
  textA.setAttribute('text-anchor', 'middle');
  textA.setAttribute('fill', '#FFFFFF');
  textA.setAttribute('font-size', '14');
  textA.setAttribute('font-weight', '700');
  textA.setAttribute('font-family', 'sans-serif');
  textA.textContent = 'A';
  svg.appendChild(textA);

  const labelA = document.createElementNS(svgNS, 'text');
  labelA.setAttribute('x', '90');
  labelA.setAttribute('y', '148');
  labelA.setAttribute('text-anchor', 'middle');
  labelA.setAttribute('fill', '#1B2A2F');
  labelA.setAttribute('font-size', '12');
  labelA.setAttribute('font-weight', '600');
  labelA.setAttribute('font-family', 'var(--font-heading), sans-serif');
  const shortOrigin = originLabel.length > 22 ? originLabel.slice(0, 20) + '...' : originLabel;
  labelA.textContent = shortOrigin;
  svg.appendChild(labelA);

  // Ponto B - Destino
  const pB = document.createElementNS(svgNS, 'circle');
  pB.setAttribute('cx', '510');
  pB.setAttribute('cy', '110');
  pB.setAttribute('r', '16');
  pB.setAttribute('fill', '#F4A640');
  svg.appendChild(pB);

  const textB = document.createElementNS(svgNS, 'text');
  textB.setAttribute('x', '510');
  textB.setAttribute('y', '115');
  textB.setAttribute('text-anchor', 'middle');
  textB.setAttribute('fill', '#1B2A2F');
  textB.setAttribute('font-size', '14');
  textB.setAttribute('font-weight', '700');
  textB.setAttribute('font-family', 'sans-serif');
  textB.textContent = 'B';
  svg.appendChild(textB);

  const labelB = document.createElementNS(svgNS, 'text');
  labelB.setAttribute('x', '510');
  labelB.setAttribute('y', '148');
  labelB.setAttribute('text-anchor', 'middle');
  labelB.setAttribute('fill', '#1B2A2F');
  labelB.setAttribute('font-size', '12');
  labelB.setAttribute('font-weight', '600');
  labelB.setAttribute('font-family', 'var(--font-heading), sans-serif');
  const shortDest = destinationLabel.length > 22 ? destinationLabel.slice(0, 20) + '...' : destinationLabel;
  labelB.textContent = shortDest;
  svg.appendChild(labelB);

  return svg;
}

async function renderRoute(container, query = {}) {
  const toParam = (query.to || '').trim();
  const fromParam = (query.from || '').trim();

  const routeWrapper = el('section', { className: 'route-form' });

  const title = el('h1', { className: 'results-title', text: 'Planejador de Rota Acessível' });
  routeWrapper.appendChild(title);

  const desc = el('p', {
    className: 'empty-state__desc',
    text: 'Calcule trajetos a pé considerando calçadas, rampas, pisos táteis e barreiras cadastradas.'
  });
  routeWrapper.appendChild(desc);

  // Se 'to' for um ID de local, carrega o nome correspondente
  let prefillDestination = toParam;
  if (toParam && !isNaN(Number(toParam))) {
    try {
      const place = await getPlace(toParam);
      if (place && place.name) {
        prefillDestination = place.name;
      }
    } catch (e) {
      // Ignora erro e usa o valor como texto
    }
  }

  // Formulário de Rota
  const form = el('form', { attrs: { novalidate: 'true' } });

  const originGroup = el('div', { className: 'form-group' });
  const originLabel = el('label', {
    className: 'form-label',
    attrs: { 'for': 'route-origin-input' },
    text: 'Ponto de Partida *'
  });
  originGroup.appendChild(originLabel);

  const originInput = el('input', {
    id: 'route-origin-input',
    className: 'form-input',
    attrs: {
      type: 'text',
      name: 'from',
      required: 'true',
      placeholder: 'Ex: Av. Paulista, 1000 ou Metrô Trianon',
      value: fromParam
    }
  });
  originGroup.appendChild(originInput);
  form.appendChild(originGroup);

  const destGroup = el('div', { className: 'form-group' });
  const destLabel = el('label', {
    className: 'form-label',
    attrs: { 'for': 'route-destination-input' },
    text: 'Destino *'
  });
  destGroup.appendChild(destLabel);

  const destInput = el('input', {
    id: 'route-destination-input',
    className: 'form-input',
    attrs: {
      type: 'text',
      name: 'to',
      required: 'true',
      placeholder: 'Ex: Parque Ibirapuera ou MASP',
      value: prefillDestination
    }
  });
  destGroup.appendChild(destInput);
  form.appendChild(destGroup);

  const submitBtn = el('button', {
    className: 'btn-primary',
    attrs: { type: 'submit', style: 'width: 100%; margin-top: 8px;' },
    text: 'Calcular rota'
  });
  form.appendChild(submitBtn);

  const errorContainer = el('div', {
    className: 'form-error',
    attrs: { 'role': 'alert', style: 'display: none; margin-top: 12px;' }
  });
  form.appendChild(errorContainer);

  routeWrapper.appendChild(form);

  // Área para os resultados da rota
  const resultsContainer = el('div', {
    className: 'route-results',
    attrs: { 'aria-live': 'polite' }
  });
  routeWrapper.appendChild(resultsContainer);
  container.appendChild(routeWrapper);

  async function calculateAndRenderRoute(fromVal, toVal) {
    resultsContainer.innerHTML = '';
    renderLoading(resultsContainer, 'Calculando trajeto acessível...');

    let routeData = null;
    try {
      const rawRoute = await fetchRoute(fromVal, toVal);
      routeData = rawRoute.route || rawRoute;
    } catch (err) {
      resultsContainer.innerHTML = '';
      renderError(resultsContainer, 'Não foi possível calcular a rota com os pontos informados. Verifique se os endereços estão corretos.');
      return;
    }

    resultsContainer.innerHTML = '';

    // Resumo da Rota
    const summary = el('div', { className: 'route-summary' });

    const distItem = el('div', { className: 'route-summary__item' });
    distItem.appendChild(el('span', { className: 'route-summary__label', text: 'Distância estimada' }));
    distItem.appendChild(el('span', {
      className: 'route-summary__value',
      text: routeData.distance || '1,2 km'
    }));
    summary.appendChild(distItem);

    const timeItem = el('div', { className: 'route-summary__item' });
    timeItem.appendChild(el('span', { className: 'route-summary__label', text: 'Tempo a pé' }));
    timeItem.appendChild(el('span', {
      className: 'route-summary__value',
      text: routeData.duration || '15 min'
    }));
    summary.appendChild(timeItem);

    const userPrefs = getPreferences();
    if (userPrefs.length > 0) {
      const prefItem = el('div', { className: 'route-summary__item' });
      prefItem.appendChild(el('span', { className: 'route-summary__label', text: 'Filtros aplicados' }));
      const prefNames = userPrefs.map(p => NEED_LABELS[p] || p).join(', ');
      prefItem.appendChild(el('span', {
        className: 'route-summary__value',
        attrs: { style: 'font-size: 14px;' },
        text: prefNames
      }));
      summary.appendChild(prefItem);
    }

    resultsContainer.appendChild(summary);

    // Aviso de Rota Demonstrativa
    const notice = el('div', {
      className: 'route-notice',
      attrs: { 'role': 'note' }
    });
    notice.appendChild(el('span', { attrs: { 'aria-hidden': 'true' }, text: '⚠' }));
    notice.appendChild(el('span', { text: 'Rota demonstrativa, dados fictícios.' }));
    resultsContainer.appendChild(notice);

    // Mapa Esquemático em SVG
    const mapBox = el('div', { className: 'route-map' });
    const steps = Array.isArray(routeData.steps) ? routeData.steps : [];
    const svgMap = createSchematicMapSvg(fromVal, toVal, steps);
    mapBox.appendChild(svgMap);
    resultsContainer.appendChild(mapBox);

    // Lista de Passos / Instruções
    const stepsList = el('ol', {
      className: 'route-steps mt-24',
      attrs: { 'aria-label': 'Instruções passo a passo do trajeto' }
    });

    if (steps.length > 0) {
      steps.forEach((step, index) => {
        const stepLi = el('li', { className: 'route-step' });

        const instructionText = step.instruction || step.description || `Passo ${index + 1}`;
        const instruction = el('div', {
          className: 'route-step__instruction',
          text: instructionText
        });
        stepLi.appendChild(instruction);

        if (step.distance) {
          const detail = el('div', {
            className: 'route-step__detail',
            text: step.distance
          });
          stepLi.appendChild(detail);
        }

        const alertText = step.alert || step.warning || step.barrier;
        if (alertText) {
          const alertBox = el('div', {
            className: 'route-step__alert',
            attrs: { 'role': 'note' }
          });
          alertBox.appendChild(el('span', {
            attrs: { 'aria-hidden': 'true' },
            html: ICONS.x
          }));
          alertBox.appendChild(el('span', { text: alertText }));
          stepLi.appendChild(alertBox);
        }

        stepsList.appendChild(stepLi);
      });
    } else {
      const defaultLi = el('li', { className: 'route-step' });
      defaultLi.appendChild(el('div', {
        className: 'route-step__instruction',
        text: `Siga em frente de ${fromVal} em direção a ${toVal} utilizando as calçadas rebaixadas.`
      }));
      stepsList.appendChild(defaultLi);
    }

    resultsContainer.appendChild(stepsList);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorContainer.style.display = 'none';

    const fromVal = originInput.value.trim();
    const toVal = destInput.value.trim();

    if (!fromVal || !toVal) {
      errorContainer.textContent = 'Informe tanto o ponto de partida quanto o destino.';
      errorContainer.style.display = 'flex';
      return;
    }

    calculateAndRenderRoute(fromVal, toVal);
  });

  // Se ambos os parâmetros vieram preenchidos na URL, executa o cálculo imediatamente
  if (fromParam && prefillDestination) {
    calculateAndRenderRoute(fromParam, prefillDestination);
  }
}
