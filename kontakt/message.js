const currentLang = localStorage.getItem("language") || "sr";
setLanguage(currentLang);

document.querySelectorAll(".lang-btn").forEach((btn) => {
  if (btn.dataset.lang === currentLang) {
    btn.classList.add("active");
  }

  btn.addEventListener("click", function () {
    const lang = this.dataset.lang;
    setLanguage(lang);

    document
      .querySelectorAll(".lang-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    localStorage.setItem("language", lang);
  });
});

function setLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.dataset.translate;
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  document
    .querySelectorAll("[data-translate-placeholder]")
    .forEach((element) => {
      const key = element.dataset.translatePlaceholder;
      if (translations[lang] && translations[lang][key]) {
        element.placeholder = translations[lang][key];
      }
    });
}
