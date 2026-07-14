const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav?.classList.toggle("is-open", !isOpen);
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navToggle?.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

const openButtons = Array.from(document.querySelectorAll("[data-modal-open]"));
let activeModal = null;
let previousFocus = null;
const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function closeModal() {
  if (!activeModal) return;
  activeModal.hidden = true;
  document.body.classList.remove("modal-open");
  previousFocus?.focus();
  activeModal = null;
}

function openModal(id, trigger) {
  const modal = document.getElementById(id);
  if (!modal) return;
  previousFocus = trigger;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-panel")?.focus();
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.modalOpen, button));
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.matches("[data-modal-close]") || target.classList.contains("modal")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (!activeModal) return;
  if (event.key === "Escape") closeModal();
  if (event.key !== "Tab") return;
  const focusable = Array.from(activeModal.querySelectorAll(focusableSelector));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const searchInput = document.querySelector("[data-laureate-search]");
const yearSelect = document.querySelector("[data-laureate-year]");
const cards = Array.from(document.querySelectorAll("[data-year-card]"));
const empty = document.querySelector("[data-laureate-empty]");

function normalize(value) {
  return value
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function filterCards() {
  const query = normalize(searchInput?.value ?? "");
  const year = yearSelect?.value ?? "";
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesQuery = !query || normalize(card.dataset.search ?? "").includes(query);
    const matchesYear = !year || card.dataset.year === year;
    const visible = matchesQuery && matchesYear;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (empty) empty.hidden = visibleCount !== 0;
}

searchInput?.addEventListener("input", filterCards);
yearSelect?.addEventListener("change", filterCards);

const ajaxForms = Array.from(document.querySelectorAll('form.site-form[action^="https://formspree.io/f/"]'));

function getFormStatus(form) {
  let status = form.querySelector(".form-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(status);
  }
  return status;
}

function setFormStatus(form, message, type) {
  const status = getFormStatus(form);
  status.textContent = message;
  status.classList.remove("is-success", "is-error");
  status.classList.add(type === "success" ? "is-success" : "is-error");
}

ajaxForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent ?? "";
    const formData = new FormData(form);

    form.classList.add("is-submitting");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Küldés folyamatban...";
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      setFormStatus(form, form.dataset.successMessage ?? "Köszönjük, az űrlap sikeresen elküldve.", "success");
    } catch {
      setFormStatus(form, "A beküldés most nem sikerült. Kérjük, próbálja meg újra, vagy írjon emailt az info@szabadsajtoalapitvany.hu címre.", "error");
    } finally {
      form.classList.remove("is-submitting");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});
