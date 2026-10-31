document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Mark the current page in the shared navigation.
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("visible");
  });

  setupDestinationFilters();
});

function setupDestinationFilters() {
  const cards = Array.from(document.querySelectorAll(".destination-card[data-category]"));
  const searchInput = document.querySelector("#destination-search");
  const categorySelect = document.querySelector("#category-select");
  const searchForm = document.querySelector("#destination-search-form");
  const sidebarFilters = document.querySelectorAll(".category-filter");
  const results = document.querySelector("#destination-results");
  const emptyState = document.querySelector("#empty-state");
  if (!cards.length || !searchInput || !categorySelect || !searchForm) return;

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function applyFilters() {
    const term = normalize(searchInput.value);
    const selectedCategory = normalize(categorySelect.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = normalize(card.dataset.name || card.querySelector("h3")?.textContent || "");
      const location = normalize(card.dataset.location || "");
      const categories = normalize(card.dataset.category || "");
      const matchesSearch = !term || `${name} ${location} `.includes(term);
      const matchesCategory = !selectedCategory || selectedCategory === "all" ||
        categories.includes(selectedCategory === "beaches" ? "beach" : selectedCategory);
      const visible = matchesSearch && matchesCategory;
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });

    sidebarFilters.forEach((button) => {
      button.classList.toggle("active", normalize(button.dataset.category) === selectedCategory);
    });
    if (emptyState) emptyState.classList.toggle("hidden", visibleCount !== 0);
    if (results) results.setAttribute("aria-live", "polite");
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", () => {
    applyFilters();
  });

  sidebarFilters.forEach((button) => {
    button.addEventListener("click", () => {
      categorySelect.value = button.dataset.category;
      applyFilters();
    });
  });

  applyFilters();
}

// Native validation is handled by the browser. This function is attached below
// so validation remains clear when JavaScript is enabled.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const success = document.querySelector("#form-success");
  if (!form || !success) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      success.style.display = "none";
      return;
    }

    const email = form.elements.email;
    if (!email.validity.valid) {
      email.setCustomValidity("Please enter a valid email address.");
      email.reportValidity();
      return;
    }

    email.setCustomValidity("");
    success.style.display = "block";
    success.textContent = "Thank you for contacting Explore Salone! Your message has been received.";
    // This website has no backend or form-processing service, so no message
    // is emailed, transmitted, or saved by this client-side confirmation.
    form.reset();
  });

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.type === "email") field.setCustomValidity("");
    });
  });
});
