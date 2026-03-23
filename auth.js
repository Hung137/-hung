/**
 * 登入／註冊與 modal（首頁、餐廳內頁共用）
 */
(function () {
  const STORAGE_USERS = "delivery_app_users";
  const STORAGE_SESSION = "delivery_app_session";

  function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  function displayNameFromEmail(email) {
    const norm = normalizeEmail(email);
    const local = norm.split("@")[0];
    return local || "會員";
  }

  function loadUsersJson() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS);
      if (!raw) return { emails: [] };
      const o = JSON.parse(raw);
      if (!o || typeof o !== "object") return { emails: [] };
      const emails = Array.isArray(o.emails) ? o.emails.map((e) => normalizeEmail(e)).filter(Boolean) : [];
      return { emails: [...new Set(emails)] };
    } catch {
      return { emails: [] };
    }
  }

  function saveUsersJson(data) {
    try {
      const payload = { emails: [...new Set(data.emails.map(normalizeEmail).filter(Boolean))] };
      localStorage.setItem(STORAGE_USERS, JSON.stringify(payload, null, 0));
      return true;
    } catch {
      return false;
    }
  }

  function getSessionEmail() {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || typeof o.email !== "string") return null;
      const e = normalizeEmail(o.email);
      return e || null;
    } catch {
      return null;
    }
  }

  /** 若 session 對應的 Email 不在註冊表，清除 session */
  function getValidatedSessionEmail() {
    let session = getSessionEmail();
    if (session) {
      const data = loadUsersJson();
      if (!data.emails.includes(session)) {
        clearSession();
        session = null;
      }
    }
    return session;
  }

  function setSessionEmail(email) {
    try {
      const e = normalizeEmail(email);
      if (!e) return false;
      localStorage.setItem(STORAGE_SESSION, JSON.stringify({ email: e }));
      return true;
    } catch {
      return false;
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
  }

  function registerEmail(email) {
    const norm = normalizeEmail(email);
    if (!norm) {
      return { ok: false, reason: "invalid" };
    }
    const data = loadUsersJson();
    if (data.emails.includes(norm)) {
      return { ok: false, reason: "exists" };
    }
    data.emails.push(norm);
    if (!saveUsersJson(data)) {
      return { ok: false, reason: "storage" };
    }
    return { ok: true };
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-backdrop:not([hidden])")) {
      document.body.style.overflow = "";
    }
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-backdrop").forEach((m) => closeModal(m));
  }

  let openAuthModalImpl = function () {};

  function setupAuthModals(root, afterAuthChange) {
    const signupModal = document.getElementById("signup-modal");
    const loginModal = document.getElementById("login-modal");
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const signupErr = document.getElementById("signup-form-error");
    const loginErr = document.getElementById("login-form-error");

    function notifyAuthChange() {
      afterAuthChange?.();
    }

    function showErr(el, msg, options = {}) {
      const { showCta } = options;
      if (!el) return;
      const msgSpan = el.querySelector(".form-error-msg");
      const cta = el.querySelector(".form-error-cta");
      if (!msg) {
        el.hidden = true;
        if (msgSpan) msgSpan.textContent = "";
        if (cta) cta.hidden = true;
        return;
      }
      el.hidden = false;
      if (msgSpan) msgSpan.textContent = msg;
      if (cta) cta.hidden = showCta !== true;
    }

    function openAuthModal(which, options = {}) {
      const { prefillEmail } = options;
      showErr(signupErr, "");
      showErr(loginErr, "");
      closeAllModals();
      if (which === "signup") {
        signupForm?.reset();
        const input = signupForm?.querySelector('input[name="email"]');
        if (input && prefillEmail != null && prefillEmail !== "") {
          input.value = prefillEmail;
        }
        openModal(signupModal);
        queueMicrotask(() => input?.focus());
      } else {
        loginForm?.reset();
        const input = loginForm?.querySelector('input[name="email"]');
        if (input && prefillEmail != null && prefillEmail !== "") {
          input.value = prefillEmail;
        }
        openModal(loginModal);
        queueMicrotask(() => input?.focus());
      }
    }

    openAuthModalImpl = openAuthModal;

    document.querySelectorAll("[data-open-signup]").forEach((el) => {
      el.addEventListener("click", () => openAuthModal("signup"));
    });

    document.querySelectorAll("[data-open-login]").forEach((el) => {
      el.addEventListener("click", () => openAuthModal("login"));
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const backdrop = btn.closest(".modal-backdrop");
        closeModal(backdrop);
      });
    });

    [signupModal, loginModal].forEach((modal) => {
      modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const cartBackdrop = document.getElementById("cart-drawer-backdrop");
      if (cartBackdrop && !cartBackdrop.hidden) {
        return;
      }
      const open = document.querySelector(".modal-backdrop:not([hidden])");
      if (open) closeModal(open);
    });

    document.getElementById("signup-goto-login")?.addEventListener("click", () => {
      const v = signupForm?.querySelector('input[name="email"]')?.value ?? "";
      openAuthModal("login", { prefillEmail: v });
    });

    document.getElementById("login-goto-signup")?.addEventListener("click", () => {
      const v = loginForm?.querySelector('input[name="email"]')?.value ?? "";
      openAuthModal("signup", { prefillEmail: v });
    });

    document.getElementById("signup-err-goto-login")?.addEventListener("click", () => {
      const v = signupForm?.querySelector('input[name="email"]')?.value ?? "";
      openAuthModal("login", { prefillEmail: v });
    });

    document.getElementById("login-err-goto-signup")?.addEventListener("click", () => {
      const v = loginForm?.querySelector('input[name="email"]')?.value ?? "";
      openAuthModal("signup", { prefillEmail: v });
    });

    document.getElementById("hero-btn-browse")?.addEventListener("click", () => {
      document.getElementById("cuisines-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    signupForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showErr(signupErr, "");
      const emailInput = signupForm.querySelector('input[name="email"]');
      if (emailInput && !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }
      const fd = new FormData(signupForm);
      const email = fd.get("email");
      const norm = normalizeEmail(email);
      if (!norm) {
        showErr(signupErr, "請輸入有效的 Email。");
        return;
      }
      const result = registerEmail(email);
      if (!result.ok && result.reason === "exists") {
        showErr(signupErr, "此 Email 已註冊，請改為登入。", { showCta: true });
        return;
      }
      if (!result.ok && result.reason === "storage") {
        showErr(signupErr, "無法寫入本機儲存，請檢查瀏覽器設定。");
        return;
      }
      if (!result.ok && result.reason === "invalid") {
        showErr(signupErr, "請輸入有效的 Email。");
        return;
      }
      if (!setSessionEmail(email)) {
        showErr(signupErr, "無法建立登入狀態，請檢查瀏覽器設定。");
        return;
      }
      signupForm.reset();
      closeModal(signupModal);
      notifyAuthChange();
    });

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showErr(loginErr, "");
      const emailInput = loginForm.querySelector('input[name="email"]');
      if (emailInput && !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }
      const fd = new FormData(loginForm);
      const email = fd.get("email");
      const norm = normalizeEmail(email);
      if (!norm) {
        showErr(loginErr, "請輸入有效的 Email。");
        return;
      }
      if (!loadUsersJson().emails.includes(norm)) {
        showErr(loginErr, "找不到此 Email，請先註冊。", { showCta: true });
        return;
      }
      if (!setSessionEmail(email)) {
        showErr(loginErr, "無法建立登入狀態，請檢查瀏覽器設定。");
        return;
      }
      loginForm.reset();
      closeModal(loginModal);
      notifyAuthChange();
    });

    function onLogout() {
      clearSession();
      notifyAuthChange();
    }

    document.getElementById("btn-logout")?.addEventListener("click", onLogout);

    notifyAuthChange();
  }

  function openAuthModal(which, options) {
    openAuthModalImpl(which, options);
  }

  window.DELIVERY_AUTH = {
    setupAuthModals,
    openAuthModal,
    getSessionEmail,
    getValidatedSessionEmail,
    setSessionEmail,
    clearSession,
    registerEmail,
    loadUsersJson,
    normalizeEmail,
    displayNameFromEmail,
  };
})();
