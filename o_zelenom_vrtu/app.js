document.addEventListener("DOMContentLoaded", function () {
  const langButtons = document.querySelectorAll(".lang-btn");
  const currentLang = localStorage.getItem("language") || "sr";

  setLanguage(currentLang);

  langButtons.forEach((btn) => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", function () {
      const lang = this.dataset.lang;
      setLanguage(lang);

      langButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      localStorage.setItem("language", lang);
    });
  });
});

function setLanguage(lang) {
  document.documentElement.lang = lang;

  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.dataset.translate;
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
}
