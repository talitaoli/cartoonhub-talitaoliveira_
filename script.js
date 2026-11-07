const API_URL = 'https://rickandmortyapi.com/api/character';
const STORAGE_KEY = 'cartoonhub-favorites';

const elements = {
  grid: document.querySelector('#characters-grid'),
  resultsCount: document.querySelector('#results-count'),
  searchInput: document.querySelector('#search-input'),
  filterButtons: [...document.querySelectorAll('.filter-button')],
  favoritesToggle: document.querySelector('#favorites-toggle'),
  reloadButton: document.querySelector('#reload-button'),
  retryButton: document.querySelector('#retry-button'),
  emptyState: document.querySelector('#empty-state'),
  errorState: document.querySelector('#error-state'),
  dialog: document.querySelector('#character-dialog'),
  dialogContent: document.querySelector('#dialog-content'),
  dialogClose: document.querySelector('#dialog-close')
};

let characters = [];
let activeStatus = 'Todos';
let showFavoritesOnly = false;
let favoriteIds = readFavorites();

function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch (error) {
    console.warn('Não foi possível ler os favoritos salvos.', error);
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favoriteIds]));
}

function setLoadingState(isLoading) {
  elements.grid.setAttribute('aria-busy', String(isLoading));
  elements.reloadButton.disabled = isLoading;
  elements.reloadButton.style.opacity = isLoading ? '.5' : '1';
}

function showError(show) {
  elements.errorState.hidden = !show;
  elements.grid.hidden = show;
  if (show) {
    elements.emptyState.hidden = true;
    elements.resultsCount.textContent = 'Falha na conexão';
  }
}

function formatStatus(status) {
  const labels = { Alive: 'Vivo', Dead: 'Morto', unknown: 'Desconhecido' };
  return labels[status] || status;
}

function statusClass(status) {
  return status.toLowerCase().replace(/[^a-z]/g, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function getFilteredCharacters() {
  const term = elements.searchInput.value.trim().toLowerCase();
  return characters.filter((character) => {
    const matchesName = character.name.toLowerCase().includes(term);
    const matchesStatus = activeStatus === 'Todos' || character.status === activeStatus;
    const matchesFavorites = !showFavoritesOnly || favoriteIds.has(character.id);
    return matchesName && matchesStatus && matchesFavorites;
  });
}

function updateResultsCount(total) {
  const suffix = total === 1 ? 'personagem encontrado' : 'personagens encontrados';
  elements.resultsCount.textContent = `${total} ${suffix}`;
}

function createCharacterCard(character, index) {
  // Cada card nasce aqui, em tempo de execução, a partir de dados da API.
  const card = document.createElement('article');
  card.className = 'character-card';
  card.style.animationDelay = `${Math.min(index * 45, 500)}ms`;

  const imageWrap = document.createElement('div');
  imageWrap.className = 'card-image-wrap';

  const number = document.createElement('span');
  number.className = 'card-number';
  number.textContent = String(index + 1).padStart(2, '0');

  const image = document.createElement('img');
  image.className = 'card-image';
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  image.loading = index < 4 ? 'eager' : 'lazy';

  const favoriteButton = document.createElement('button');
  favoriteButton.className = 'favorite-button';
  favoriteButton.type = 'button';
  favoriteButton.setAttribute('aria-label', `Favoritar ${character.name}`);
  favoriteButton.setAttribute('aria-pressed', String(favoriteIds.has(character.id)));
  favoriteButton.textContent = favoriteIds.has(character.id) ? '♥' : '♡';
  if (favoriteIds.has(character.id)) favoriteButton.classList.add('is-favorite');
  favoriteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFavorite(character.id);
  });

  imageWrap.appendChild(number);
  imageWrap.appendChild(image);
  imageWrap.appendChild(favoriteButton);

  const body = document.createElement('div');
  body.className = 'card-body';

  const name = document.createElement('h3');
  name.className = 'card-name';
  name.textContent = character.name;

  const origin = document.createElement('p');
  origin.className = 'card-origin';
  origin.textContent = `Origem: ${character.origin.name}`;

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const status = document.createElement('span');
  status.className = `status ${statusClass(character.status)}`;
  status.textContent = formatStatus(character.status);

  const species = document.createElement('span');
  species.textContent = character.species;

  const detailsButton = document.createElement('button');
  detailsButton.className = 'card-action';
  detailsButton.type = 'button';
  detailsButton.textContent = 'ver detalhes';
  detailsButton.addEventListener('click', () => openCharacterDialog(character));

  meta.appendChild(status);
  meta.appendChild(species);
  body.appendChild(name);
  body.appendChild(origin);
  body.appendChild(meta);
  body.appendChild(detailsButton);

  card.appendChild(imageWrap);
  card.appendChild(body);
  return card;
}

function renderCharacters() {
  if (characters.length === 0) return;
  const filteredCharacters = getFilteredCharacters();
  elements.grid.innerHTML = '';
  elements.emptyState.hidden = filteredCharacters.length !== 0;
  elements.grid.hidden = filteredCharacters.length === 0;
  updateResultsCount(filteredCharacters.length);

  // appendChild insere cada card criado dinamicamente dentro do grid vazio do HTML.
  filteredCharacters.forEach((character, index) => {
    elements.grid.appendChild(createCharacterCard(character, index));
  });
}

function toggleFavorite(id) {
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }
  saveFavorites();
  renderCharacters();
}

function openCharacterDialog(character) {
  elements.dialogContent.innerHTML = `
    <div class="dialog-layout">
      <img src="${escapeHtml(character.image)}" alt="Imagem de ${escapeHtml(character.name)}" />
      <div class="dialog-info">
        <p class="eyebrow">/ ficha do personagem</p>
        <h3>${escapeHtml(character.name)}</h3>
        <p>${escapeHtml(character.name)} faz parte do universo de Rick and Morty e foi carregado ao vivo pela API.</p>
        <dl>
          <div><dt>Status</dt><dd>${escapeHtml(formatStatus(character.status))}</dd></div>
          <div><dt>Espécie</dt><dd>${escapeHtml(character.species)}</dd></div>
          <div><dt>Gênero</dt><dd>${escapeHtml(character.gender)}</dd></div>
          <div><dt>Origem</dt><dd>${escapeHtml(character.origin.name)}</dd></div>
        </dl>
      </div>
    </div>`;
  elements.dialog.showModal();
}

async function loadCharacters() {
  setLoadingState(true);
  showError(false);
  elements.emptyState.hidden = true;
  elements.grid.hidden = false;
  elements.resultsCount.textContent = 'Consultando o multiverso...';
  elements.grid.innerHTML = '<div class="loading-message">Abrindo portal...</div>';

  try {
    const response = await fetch(`${API_URL}?page=1`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    characters = data.results;
    renderCharacters();
  } catch (error) {
    console.error('Erro ao consumir a Rick and Morty API:', error);
    characters = [];
    showError(true);
  } finally {
    setLoadingState(false);
  }
}

elements.filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeStatus = button.dataset.status;
    elements.filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderCharacters();
  });
});

elements.searchInput.addEventListener('input', renderCharacters);
elements.reloadButton.addEventListener('click', loadCharacters);
elements.retryButton.addEventListener('click', loadCharacters);
elements.favoritesToggle.addEventListener('click', () => {
  showFavoritesOnly = !showFavoritesOnly;
  elements.favoritesToggle.setAttribute('aria-pressed', String(showFavoritesOnly));
  elements.favoritesToggle.innerHTML = showFavoritesOnly ? '<span aria-hidden="true">♥</span> Favoritos ativos' : '<span aria-hidden="true">♡</span> Favoritos';
  renderCharacters();
});
elements.dialogClose.addEventListener('click', () => elements.dialog.close());
elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

loadCharacters();
