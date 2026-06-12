const validationRules = {
  fullname:
    /^[A-Za-zА-Яа-яЁёĆćČčĐđŠšŽž]{2,}(\s+[A-Za-zА-Яа-яЁёĆćČčĐđŠšŽž]{2,})+$/,
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: /^.{10,}$/,
};

const helpMessages = {
  sr: {
    fullname:
      "Unesite vaše puno ime i prezime (npr. Marko Marković). Minimalno 2 karaktera po reči.",
    email: "Unesite validnu email adresu (npr. ime@example.com)",
    message:
      "Poruka mora sadržati najmanje 10 karaktera. Opišite šta želite da nam poručite.",
  },
  en: {
    fullname:
      "Enter your full name (e.g., John Smith). Minimum 2 characters per word.",
    email: "Enter a valid email address (e.g., name@example.com)",
    message:
      "Message must contain at least 10 characters. Describe what you want to tell us.",
  },
};

const errorMessages = {
  sr: {
    fullname:
      "Molimo unesite validno ime i prezime (minimum 2 reči, svaka sa najmanje 2 karaktera)",
    email: "Molimo unesite validnu email adresu",
    message: "Poruka mora sadržati najmanje 10 karaktera",
    required: "Ovo polje je obavezno",
  },
  en: {
    fullname:
      "Please enter a valid first and last name (minimum 2 words, each with at least 2 characters)",
    email: "Please enter a valid email address",
    message: "Message must contain at least 10 characters",
    required: "This field is required",
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");

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

      updateHelpMessagesLanguage(lang);
    });
  });

  fullnameInput.addEventListener("focus", function () {
    showHelp("fullname");
  });

  emailInput.addEventListener("focus", function () {
    showHelp("email");
  });

  messageInput.addEventListener("focus", function () {
    showHelp("message");
  });

  fullnameInput.addEventListener("blur", function () {
    hideHelp("fullname");
    if (this.value.trim() !== "") {
      validateField("fullname", this.value);
    }
  });

  emailInput.addEventListener("blur", function () {
    hideHelp("email");
    if (this.value.trim() !== "") {
      validateField("email", this.value);
    }
  });

  messageInput.addEventListener("blur", function () {
    hideHelp("message");
    if (this.value.trim() !== "") {
      validateField("message", this.value);
    }
  });

  fullnameInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      clearError("fullname");
    }
  });

  emailInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      clearError("email");
    }
  });

  messageInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      clearError("message");
    }
  });

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const lang = localStorage.getItem("language") || "sr";

    clearAllErrors();

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let isValid = true;

    if (fullname === "") {
      showError("fullname", errorMessages[lang].required);
      isValid = false;
    } else if (!validationRules.fullname.test(fullname)) {
      showError("fullname", errorMessages[lang].fullname);
      isValid = false;
    }

    if (email === "") {
      showError("email", errorMessages[lang].required);
      isValid = false;
    } else if (!validationRules.email.test(email)) {
      showError("email", errorMessages[lang].email);
      isValid = false;
    }

    if (message === "") {
      showError("message", errorMessages[lang].required);
      isValid = false;
    } else if (!validationRules.message.test(message)) {
      showError("message", errorMessages[lang].message);
      isValid = false;
    }

    if (isValid) {
      window.location.href = "message.html";
    }
  });

  function showHelp(fieldName) {
    const lang = localStorage.getItem("language") || "sr";
    const helpElement = document.getElementById(`${fieldName}-help`);
    helpElement.textContent = helpMessages[lang][fieldName];
    helpElement.classList.add("show");
  }

  function hideHelp(fieldName) {
    const helpElement = document.getElementById(`${fieldName}-help`);
    helpElement.classList.remove("show");
  }

  function showError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);

    input.classList.add("error");
    input.classList.remove("success");
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  function clearError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);

    input.classList.remove("error");
    errorElement.classList.remove("show");
  }

  function clearAllErrors() {
    ["fullname", "email", "message"].forEach((field) => {
      clearError(field);
    });
  }

  function validateField(fieldName, value) {
    const lang = localStorage.getItem("language") || "sr";

    if (validationRules[fieldName].test(value)) {
      const input = document.getElementById(fieldName);
      input.classList.add("success");
      input.classList.remove("error");
      clearError(fieldName);
      return true;
    } else {
      showError(fieldName, errorMessages[lang][fieldName]);
      return false;
    }
  }

  function updateHelpMessagesLanguage(lang) {
    ["fullname", "email", "message"].forEach((field) => {
      const helpElement = document.getElementById(`${field}-help`);
      if (helpElement.classList.contains("show")) {
        helpElement.textContent = helpMessages[lang][field];
      }
    });
  }
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

  const placeholderElements = document.querySelectorAll(
    "[data-translate-placeholder]",
  );
  placeholderElements.forEach((element) => {
    const key = element.dataset.translatePlaceholder;
    if (translations[lang] && translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
}
