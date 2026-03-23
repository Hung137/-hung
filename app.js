const cuisines = ["珍珠奶茶"];

/** Twemoji PNG（卡通扁平風），key 與 dataset.cuisine 一致；「全部」為 "" */
const TWEMOJI_ASSETS = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";
const cuisineIconHex = {
  "": "1f37d",
  珍珠奶茶: "1f9cb",
};

function cuisineTwemojiUrl(hex) {
  return `${TWEMOJI_ASSETS}/${hex}.png`;
}

function getDealPool() {
  return window.DELIVERY_DATA?.dealPool ?? [];
}

const state = {
  selectedCuisine: null,
};

function updateAuthUi(root) {
  const navGuest = document.getElementById("nav-guest");
  const navUser = document.getElementById("nav-user");
  const navEmail = document.getElementById("nav-user-email");
  const heroGuest = document.getElementById("hero-guest");
  const heroUser = document.getElementById("hero-user");
  const welcomeLine = document.getElementById("hero-welcome-line");
  const dealsHeading = document.getElementById("deals-heading");
  const session = window.DELIVERY_AUTH?.getValidatedSessionEmail() ?? null;
  const displayNameFromEmail = window.DELIVERY_AUTH?.displayNameFromEmail;

  if (session) {
    const name = displayNameFromEmail ? displayNameFromEmail(session) : session;
    root.classList.add("is-logged-in");
    navGuest.hidden = true;
    navUser.hidden = false;
    navEmail.textContent = name;
    navEmail.title = session;
    heroGuest.hidden = true;
    heroUser.hidden = false;
    if (welcomeLine) welcomeLine.textContent = `嗨，${name}`;
    if (dealsHeading) dealsHeading.textContent = "為你推薦";
  } else {
    root.classList.remove("is-logged-in");
    navGuest.hidden = false;
    navUser.hidden = true;
    heroGuest.hidden = false;
    heroUser.hidden = true;
    if (dealsHeading) dealsHeading.textContent = "每日優惠";
  }
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getFilteredDeals() {
  const dealPool = getDealPool();
  if (!state.selectedCuisine) {
    return shuffle(dealPool).slice(0, 6);
  }
  return dealPool.filter((d) => d.categories.includes(state.selectedCuisine));
}

function renderCuisines(container, onSelect) {
  container.innerHTML = "";

  function makeCard(label, cuisineKey, active) {
    const hex = cuisineIconHex[cuisineKey] ?? "1f37d";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cuisine-card" + (active ? " is-active" : "");
    btn.setAttribute("role", "listitem");
    btn.dataset.cuisine = cuisineKey;

    const iconWrap = document.createElement("span");
    iconWrap.className = "cuisine-card-icon";
    const img = document.createElement("img");
    img.src = cuisineTwemojiUrl(hex);
    img.alt = "";
    img.width = 44;
    img.height = 44;
    img.loading = "lazy";
    img.decoding = "async";
    iconWrap.appendChild(img);

    const lab = document.createElement("span");
    lab.className = "cuisine-card-label";
    lab.textContent = label;

    btn.appendChild(iconWrap);
    btn.appendChild(lab);
    btn.addEventListener("click", () => {
      setActiveCuisineCard(container, btn);
      state.selectedCuisine = cuisineKey === "" ? null : cuisineKey;
      onSelect();
    });
    container.appendChild(btn);
  }

  makeCard("全部", "", true);
  cuisines.forEach((label) => makeCard(label, label, false));
}

function setActiveCuisineCard(container, active) {
  container.querySelectorAll(".cuisine-card").forEach((el) => el.classList.remove("is-active"));
  active.classList.add("is-active");
}

function renderDeals(grid, items, options = {}) {
  const { emptyLabel } = options;
  grid.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "grid-empty";
    empty.setAttribute("role", "status");
    empty.innerHTML = `<strong>找不到「${escapeHtml(emptyLabel)}」的餐廳</strong>請換個菜系或選「全部」看看。`;
    grid.appendChild(empty);
    return;
  }

  const loggedIn = Boolean(window.DELIVERY_AUTH?.getValidatedSessionEmail());
  items.forEach((d) => {
    const link = document.createElement("a");
    link.className = (loggedIn ? "deal-card deal-card--member" : "deal-card") + " deal-card-link";
    link.href = `restaurant.html?id=${encodeURIComponent(d.id)}`;
    link.setAttribute("role", "listitem");
    const src = escapeHtml(d.image);
    const alt = escapeHtml(d.name);
    link.innerHTML = `
      <div class="deal-card-thumb">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async" width="640" height="400" />
      </div>
      <div class="deal-card-body">
        <h3>${escapeHtml(d.name)}</h3>
        <p class="deal-meta">${escapeHtml(d.meta)}</p>
        <span class="deal-badge">${escapeHtml(d.tag)}</span>
      </div>
    `;
    grid.appendChild(link);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateFilterHint(hintEl) {
  if (!hintEl) return;
  if (!state.selectedCuisine) {
    hintEl.textContent = "";
    return;
  }
  const n = getDealPool().filter((d) => d.categories.includes(state.selectedCuisine)).length;
  hintEl.textContent = `「${state.selectedCuisine}」共 ${n} 間餐廳`;
}

function refreshGrid(grid, hintEl) {
  let items = getFilteredDeals();
  if (state.selectedCuisine) {
    items = shuffle(items);
  }
  updateFilterHint(hintEl);
  renderDeals(grid, items, { emptyLabel: state.selectedCuisine || "" });
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("reactRoot");
  const cuisineEl = document.querySelector(".cuisine-scroll");
  const grid = document.getElementById("deals-grid");
  const hintEl = document.getElementById("filter-hint");

  const syncGrid = () => refreshGrid(grid, hintEl);

  window.DELIVERY_AUTH?.setupAuthModals(root, () => {
    updateAuthUi(root);
    syncGrid();
    if (!window.DELIVERY_AUTH?.getValidatedSessionEmail()) {
      window.DELIVERY_CART?.clearCart();
    }
    window.DELIVERY_CART?.refreshCartUi();
  });

  window.DELIVERY_CART?.initCartUi();

  renderCuisines(cuisineEl, syncGrid);
  syncGrid();

  document.getElementById("shuffle-deals")?.addEventListener("click", () => {
    syncGrid();
  });
});
