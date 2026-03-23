/**
 * 購物車（sessionStorage，首頁與 restaurant.html 共用）
 */
(function () {
  const STORAGE_KEY = "delivery_app_cart";

  function loadCart() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCart(lines) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }

  function addToCart({ restaurantId, restaurantName, itemId, itemName, price }) {
    if (!isCartAllowed()) return loadCart();
    const lines = loadCart();
    const idx = lines.findIndex((l) => l.restaurantId === restaurantId && l.itemId === itemId);
    const p = Number(price);
    if (idx >= 0) {
      lines[idx].qty += 1;
    } else {
      lines.push({
        restaurantId,
        restaurantName,
        itemId,
        itemName,
        price: p,
        qty: 1,
      });
    }
    saveCart(lines);
    return lines;
  }

  function setQty(restaurantId, itemId, qty) {
    if (!isCartAllowed()) return loadCart();
    let lines = loadCart();
    const idx = lines.findIndex((l) => l.restaurantId === restaurantId && l.itemId === itemId);
    if (idx < 0) return lines;
    const q = Math.max(0, Math.floor(Number(qty)));
    if (q === 0) lines = lines.filter((_, i) => i !== idx);
    else lines[idx].qty = q;
    saveCart(lines);
    return lines;
  }

  function removeLine(restaurantId, itemId) {
    if (!isCartAllowed()) return loadCart();
    const lines = loadCart().filter((l) => !(l.restaurantId === restaurantId && l.itemId === itemId));
    saveCart(lines);
    return lines;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartItemCount() {
    return loadCart().reduce((s, l) => s + l.qty, 0);
  }

  function getSubtotal() {
    return loadCart().reduce((s, l) => s + l.price * l.qty, 0);
  }

  function formatMoney(n) {
    return `$${n.toFixed(0)}`;
  }

  function isCartAllowed() {
    return document.getElementById("reactRoot")?.classList.contains("is-logged-in");
  }

  let drawerOpen = false;
  let escapeHandlerBound = false;
  let orderModalEscapeBound = false;

  function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    if (!isCartAllowed()) {
      badge.hidden = true;
      return;
    }
    const n = getCartItemCount();
    badge.textContent = n > 99 ? "99+" : String(n);
    badge.hidden = n === 0;
    badge.setAttribute("aria-label", `購物車 ${n} 件`);
  }

  function renderCartPreview() {
    const shell = document.getElementById("cart-preview");
    const listEl = document.getElementById("cart-preview-lines");
    const metaEl = document.getElementById("cart-preview-meta");
    const totalEl = document.getElementById("cart-preview-total");
    if (!shell || !listEl) return;

    if (!isCartAllowed()) {
      shell.hidden = true;
      document.body.classList.remove("has-cart-preview");
      listEl.innerHTML = "";
      return;
    }

    const lines = loadCart();
    const n = getCartItemCount();

    if (!lines.length) {
      shell.hidden = true;
      document.body.classList.remove("has-cart-preview");
      listEl.innerHTML = "";
      return;
    }

    shell.hidden = false;
    document.body.classList.add("has-cart-preview");

    listEl.innerHTML = lines
      .map((l) => {
        const rid = escapeAttr(l.restaurantId);
        const iid = escapeAttr(l.itemId);
        const name = escapeHtml(l.itemName);
        const shop = escapeHtml(l.restaurantName);
        return `<div class="cart-preview-line" data-rid="${rid}" data-iid="${iid}">
          <div class="cart-preview-line-main">
            <span class="cart-preview-line-name">${name}</span>
            <span class="cart-preview-line-shop">${shop}</span>
          </div>
          <div class="cart-preview-line-actions">
            <button type="button" class="cart-qty-btn cart-preview-qty-btn" data-action="dec" aria-label="減少">−</button>
            <span class="cart-qty-val cart-preview-qty-val">${l.qty}</span>
            <button type="button" class="cart-qty-btn cart-preview-qty-btn" data-action="inc" aria-label="增加">+</button>
            <button type="button" class="link-btn cart-remove cart-preview-remove" data-action="remove">移除</button>
          </div>
        </div>`;
      })
      .join("");

    listEl.querySelectorAll(".cart-preview-line").forEach((row) => {
      const rid = row.dataset.rid;
      const iid = row.dataset.iid;
      row.querySelector('[data-action="dec"]')?.addEventListener("click", () => {
        const line = loadCart().find((x) => x.restaurantId === rid && x.itemId === iid);
        if (line) setQty(rid, iid, line.qty - 1);
        refreshCartUi();
      });
      row.querySelector('[data-action="inc"]')?.addEventListener("click", () => {
        const line = loadCart().find((x) => x.restaurantId === rid && x.itemId === iid);
        if (line) setQty(rid, iid, line.qty + 1);
        refreshCartUi();
      });
      row.querySelector('[data-action="remove"]')?.addEventListener("click", () => {
        removeLine(rid, iid);
        refreshCartUi();
      });
    });

    if (metaEl) metaEl.textContent = `共 ${n} 件`;
    if (totalEl) totalEl.textContent = formatMoney(getSubtotal());
  }

  function renderCartDrawerBody() {
    const body = document.getElementById("cart-drawer-lines");
    const subEl = document.getElementById("cart-subtotal");
    if (!body) return;

    const lines = loadCart();
    if (!lines.length) {
      body.innerHTML = '<p class="cart-empty">購物車是空的</p>';
      if (subEl) subEl.textContent = formatMoney(0);
      return;
    }

    body.innerHTML = lines
      .map((l) => {
        const lineTotal = l.price * l.qty;
        const rid = escapeAttr(l.restaurantId);
        const iid = escapeAttr(l.itemId);
        const name = escapeHtml(l.itemName);
        const rname = escapeHtml(l.restaurantName);
        return `
        <div class="cart-line" data-rid="${rid}" data-iid="${iid}">
          <div class="cart-line-main">
            <p class="cart-line-name">${name}</p>
            <p class="cart-line-rest">${rname}</p>
            <p class="cart-line-price">${formatMoney(l.price)} × ${l.qty} = ${formatMoney(lineTotal)}</p>
          </div>
          <div class="cart-line-actions">
            <button type="button" class="cart-qty-btn" data-action="dec" aria-label="減少">−</button>
            <span class="cart-qty-val">${l.qty}</span>
            <button type="button" class="cart-qty-btn" data-action="inc" aria-label="增加">+</button>
            <button type="button" class="link-btn cart-remove" data-action="remove">移除</button>
          </div>
        </div>`;
      })
      .join("");

    body.querySelectorAll(".cart-line").forEach((row) => {
      const rid = row.dataset.rid;
      const iid = row.dataset.iid;
      row.querySelector('[data-action="dec"]')?.addEventListener("click", () => {
        const line = loadCart().find((x) => x.restaurantId === rid && x.itemId === iid);
        if (line) setQty(rid, iid, line.qty - 1);
        refreshCartUi();
      });
      row.querySelector('[data-action="inc"]')?.addEventListener("click", () => {
        const line = loadCart().find((x) => x.restaurantId === rid && x.itemId === iid);
        if (line) setQty(rid, iid, line.qty + 1);
        refreshCartUi();
      });
      row.querySelector('[data-action="remove"]')?.addEventListener("click", () => {
        removeLine(rid, iid);
        refreshCartUi();
      });
    });

    if (subEl) subEl.textContent = formatMoney(getSubtotal());
  }

  function openOrderSuccessModal(subtotalFormatted) {
    const modal = document.getElementById("order-success-modal");
    const amountEl = document.getElementById("order-success-amount");
    if (amountEl) amountEl.textContent = `本次小計 ${subtotalFormatted}`;
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    queueMicrotask(() => document.getElementById("order-success-ok")?.focus());
  }

  function closeOrderSuccessModal() {
    const modal = document.getElementById("order-success-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    const cartBackdrop = document.getElementById("cart-drawer-backdrop");
    const anyModal = document.querySelector(".modal-backdrop:not([hidden])");
    if (!drawerOpen && (!cartBackdrop || cartBackdrop.hidden) && !anyModal) {
      document.body.style.overflow = "";
    }
  }

  function placeOrder() {
    if (!isCartAllowed()) return;
    const lines = loadCart();
    if (!lines.length) return;
    const subtotalFormatted = formatMoney(getSubtotal());
    clearCart();
    refreshCartUi();
    closeCartDrawer();
    openOrderSuccessModal(subtotalFormatted);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function openCartDrawer() {
    if (!isCartAllowed()) return;
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const drawer = document.getElementById("cart-drawer");
    if (!backdrop || !drawer) return;
    renderCartDrawerBody();
    drawerOpen = true;
    backdrop.hidden = false;
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!escapeHandlerBound) {
      escapeHandlerBound = true;
      document.addEventListener("keydown", onEscapeCart);
    }
  }

  function closeCartDrawer() {
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const drawer = document.getElementById("cart-drawer");
    if (!backdrop || !drawer) return;
    drawerOpen = false;
    backdrop.hidden = true;
    drawer.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-backdrop:not([hidden])")) {
      document.body.style.overflow = "";
    }
  }

  function onEscapeCart(e) {
    if (e.key !== "Escape" || !drawerOpen) return;
    const modalOpen = document.querySelector(".modal-backdrop:not([hidden])");
    if (modalOpen) return;
    closeCartDrawer();
  }

  function refreshCartUi() {
    if (!isCartAllowed() && drawerOpen) {
      closeCartDrawer();
    }
    updateCartBadge();
    renderCartPreview();
    if (drawerOpen) renderCartDrawerBody();
    const checkoutBtn = document.getElementById("cart-checkout");
    if (checkoutBtn) checkoutBtn.disabled = !loadCart().length;
  }

  function initCartUi() {
    if (!orderModalEscapeBound) {
      orderModalEscapeBound = true;
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const orderModal = document.getElementById("order-success-modal");
        if (orderModal && !orderModal.hidden) closeOrderSuccessModal();
      });
    }

    document.getElementById("btn-open-cart")?.addEventListener("click", () => {
      openCartDrawer();
    });

    document.getElementById("cart-drawer-backdrop")?.addEventListener("click", closeCartDrawer);
    document.querySelectorAll("[data-close-cart]").forEach((btn) => {
      btn.addEventListener("click", closeCartDrawer);
    });

    document.getElementById("cart-clear")?.addEventListener("click", () => {
      clearCart();
      refreshCartUi();
    });

    document.getElementById("cart-checkout")?.addEventListener("click", placeOrder);

    const orderModal = document.getElementById("order-success-modal");
    orderModal?.addEventListener("click", (e) => {
      if (e.target === orderModal) closeOrderSuccessModal();
    });
    document.getElementById("order-success-ok")?.addEventListener("click", closeOrderSuccessModal);

    document.getElementById("cart-preview-open-drawer")?.addEventListener("click", () => {
      openCartDrawer();
    });

    refreshCartUi();
  }

  window.DELIVERY_CART = {
    loadCart,
    addToCart,
    setQty,
    removeLine,
    clearCart,
    getCartItemCount,
    getSubtotal,
    initCartUi,
    refreshCartUi,
    openCartDrawer,
    closeCartDrawer,
  };
})();
