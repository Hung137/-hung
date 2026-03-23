let currentRestaurant = null;

function syncRestaurantHeaderAuth() {
  const root = document.getElementById("reactRoot");
  const navGuest = document.getElementById("nav-guest");
  const navUser = document.getElementById("nav-user");
  const navEmail = document.getElementById("nav-user-email");
  if (!navGuest || !navUser || !root) return;

  const session = window.DELIVERY_AUTH?.getValidatedSessionEmail() ?? null;
  const displayNameFromEmail = window.DELIVERY_AUTH?.displayNameFromEmail;

  if (session) {
    root.classList.add("is-logged-in");
    navGuest.hidden = true;
    navUser.hidden = false;
    if (navEmail) {
      navEmail.textContent = displayNameFromEmail ? displayNameFromEmail(session) : session;
      navEmail.title = session;
    }
  } else {
    root.classList.remove("is-logged-in");
    navGuest.hidden = false;
    navUser.hidden = true;
  }
}

function starsHtml(rating) {
  const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  let s = "";
  for (let i = 1; i <= 5; i += 1) {
    s += i <= n ? "★" : "☆";
  }
  return s;
}

function defaultMenuCategories(menu) {
  const cats = new Set();
  (menu || []).forEach((item) => {
    if (item.category) cats.add(item.category);
  });
  if (cats.size === 0) return [{ id: "all", label: "全部" }];
  const ordered = Array.from(cats);
  return [{ id: "all", label: "全部" }, ...ordered.map((id) => ({ id, label: id }))];
}

function renderReviews(r) {
  const container = document.getElementById("restaurant-reviews-list");
  const ratingCard = document.getElementById("restaurant-rating-card");
  if (!container) return;

  container.innerHTML = "";
  const summary = r.ratingSummary;
  if (summary && ratingCard) {
    ratingCard.hidden = false;
    const scoreEl = document.getElementById("restaurant-rating-score");
    const countEl = document.getElementById("restaurant-rating-count");
    const breakdownEl = document.getElementById("restaurant-rating-breakdown");
    if (scoreEl) scoreEl.textContent = summary.score ?? "";
    if (countEl) countEl.textContent = summary.reviewCount != null ? `共 ${summary.reviewCount} 則評價` : "";
    if (breakdownEl) breakdownEl.textContent = summary.breakdown ?? "";
  } else if (ratingCard) {
    ratingCard.hidden = true;
  }

  const reviews = Array.isArray(r.reviews) ? r.reviews : [];
  reviews.forEach((rev) => {
    const card = document.createElement("article");
    card.className = "restaurant-review-card";
    card.setAttribute("role", "listitem");

    const head = document.createElement("div");
    head.className = "restaurant-review-head";
    const author = document.createElement("span");
    author.className = "restaurant-review-author";
    author.textContent = rev.author ?? "匿名";
    const date = document.createElement("time");
    date.className = "restaurant-review-date";
    date.textContent = rev.date ?? "";
    head.appendChild(author);
    head.appendChild(date);

    const stars = document.createElement("p");
    stars.className = "restaurant-review-stars";
    stars.setAttribute("aria-label", `${rev.rating ?? 0} 顆星`);
    stars.textContent = starsHtml(rev.rating);

    const text = document.createElement("p");
    text.className = "restaurant-review-text";
    text.textContent = rev.text ?? "";

    card.appendChild(head);
    card.appendChild(stars);
    card.appendChild(text);
    container.appendChild(card);
  });
}

function renderRestaurantPage(r) {
  currentRestaurant = r;
  document.getElementById("restaurant-error").hidden = true;
  const main = document.getElementById("restaurant-main");
  main.hidden = false;

  document.title = `${r.name} — 外送`;
  document.getElementById("restaurant-crumb-name").textContent = r.name;
  const img = document.getElementById("restaurant-hero-img");
  img.src = r.image;
  img.alt = r.name;
  document.getElementById("restaurant-title").textContent = r.name;
  document.getElementById("restaurant-meta").textContent = r.meta;
  document.getElementById("restaurant-tag").textContent = r.tag;

  const introSection = document.getElementById("restaurant-intro-section");
  const introEl = document.getElementById("restaurant-intro");
  if (r.intro && introEl && introSection) {
    introEl.textContent = r.intro;
    introSection.hidden = false;
  } else if (introSection) {
    introSection.hidden = true;
  }

  renderReviews(r);

  const menuHint = document.querySelector(".restaurant-menu-hint");
  if (menuHint) {
    menuHint.textContent = window.DELIVERY_AUTH?.getValidatedSessionEmail()
      ? "點「加入購物車」將品項加入購物車，可於右上角開啟結帳明細（示範）。"
      : "請先登入後再將餐點加入購物車。未登入時可點「登入後選購」開啟登入視窗。";
  }

  const tabsEl = document.getElementById("restaurant-menu-tabs");
  const list = document.getElementById("restaurant-menu-list");
  list.innerHTML = "";

  const categories = Array.isArray(r.menuCategories) && r.menuCategories.length
    ? r.menuCategories
    : defaultMenuCategories(r.menu);

  let activeCategory = "all";

  function menuItemsFor(cat) {
    if (cat === "all") return r.menu;
    return r.menu.filter((item) => item.category === cat);
  }

  function renderMenuList() {
    list.innerHTML = "";
    const items = menuItemsFor(activeCategory);
    const loggedIn = Boolean(window.DELIVERY_AUTH?.getValidatedSessionEmail());
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-row";
      row.setAttribute("role", "listitem");

      const thumb = document.createElement("div");
      thumb.className = "menu-row-thumb";
      const imgEl = document.createElement("img");
      imgEl.className = "menu-row-img";
      imgEl.src = item.image || r.image || "";
      imgEl.alt = item.name;
      imgEl.width = 112;
      imgEl.height = 112;
      imgEl.loading = "lazy";
      imgEl.decoding = "async";
      thumb.appendChild(imgEl);

      const info = document.createElement("div");
      info.className = "menu-row-info";
      const nameEl = document.createElement("p");
      nameEl.className = "menu-row-name";
      nameEl.textContent = item.name;
      info.appendChild(nameEl);
      if (item.description) {
        const descEl = document.createElement("p");
        descEl.className = "menu-row-desc";
        descEl.textContent = item.description;
        info.appendChild(descEl);
      }
      const priceEl = document.createElement("p");
      priceEl.className = "menu-row-price";
      priceEl.textContent = `$${item.price}`;
      info.appendChild(priceEl);

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      if (loggedIn) {
        addBtn.className = "btn btn-primary menu-row-add";
        addBtn.textContent = "加入購物車";
        addBtn.addEventListener("click", () => {
          window.DELIVERY_CART.addToCart({
            restaurantId: r.id,
            restaurantName: r.name,
            itemId: item.id,
            itemName: item.name,
            price: item.price,
          });
          window.DELIVERY_CART.refreshCartUi();
        });
      } else {
        addBtn.className = "btn btn-ghost menu-row-add";
        addBtn.textContent = "登入後選購";
        addBtn.addEventListener("click", () => {
          window.DELIVERY_AUTH?.openAuthModal("login");
        });
      }

      row.appendChild(thumb);
      row.appendChild(info);
      row.appendChild(addBtn);
      list.appendChild(row);
    });
  }

  function syncTabUi() {
    if (!tabsEl) return;
    tabsEl.querySelectorAll(".restaurant-menu-tab").forEach((btn) => {
      const isSel = btn.dataset.category === activeCategory;
      btn.setAttribute("aria-selected", isSel ? "true" : "false");
      btn.classList.toggle("restaurant-menu-tab--active", isSel);
      btn.tabIndex = isSel ? 0 : -1;
    });
  }

  if (tabsEl && categories.length > 1) {
    tabsEl.hidden = false;
    tabsEl.innerHTML = "";
    categories.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "restaurant-menu-tab";
      btn.setAttribute("role", "tab");
      btn.id = `menu-tab-${cat.id}`;
      btn.dataset.category = cat.id;
      btn.setAttribute("aria-controls", "restaurant-menu-list");
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        activeCategory = cat.id;
        renderMenuList();
        syncTabUi();
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = e.key === "ArrowRight" ? i + 1 : i - 1;
        const wrap = (next + categories.length) % categories.length;
        const target = tabsEl.querySelector(`[data-category="${categories[wrap].id}"]`);
        target?.focus();
        target?.click();
      });
      tabsEl.appendChild(btn);
    });
    syncTabUi();
  } else if (tabsEl) {
    tabsEl.hidden = true;
    tabsEl.innerHTML = "";
  }

  renderMenuList();
}

window.__RESTAURANT_RERENDER__ = function () {
  if (currentRestaurant) renderRestaurantPage(currentRestaurant);
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("reactRoot");

  window.DELIVERY_AUTH?.setupAuthModals(root, () => {
    syncRestaurantHeaderAuth();
    if (!window.DELIVERY_AUTH?.getValidatedSessionEmail()) {
      window.DELIVERY_CART?.clearCart();
    }
    window.DELIVERY_CART?.refreshCartUi();
    window.__RESTAURANT_RERENDER__?.();
  });

  window.DELIVERY_CART?.initCartUi();

  const id = new URLSearchParams(window.location.search).get("id");
  const r = window.DELIVERY_DATA?.getRestaurantById(id);

  if (!r) {
    document.getElementById("restaurant-main").hidden = true;
    document.getElementById("restaurant-error").hidden = false;
    document.title = "找不到餐廳 — 外送";
    return;
  }

  renderRestaurantPage(r);

  if (!window.DELIVERY_AUTH?.getValidatedSessionEmail()) {
    queueMicrotask(() => window.DELIVERY_AUTH?.openAuthModal("login"));
  }
});
