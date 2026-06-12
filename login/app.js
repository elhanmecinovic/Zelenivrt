async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

const users = [
  {
    username: "profesor",
    password:
      "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", // password123
  },
  {
    username: "admin",
    password:
      "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");
  const forgotPasswordLink = document.querySelector(".forgot-password");

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

  if (sessionStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "../zeleni_vrt/index.html";
  }

  forgotPasswordLink.addEventListener("click", function (e) {
    e.preventDefault();
    const lang = localStorage.getItem("language") || "sr";
    const message =
      lang === "sr"
        ? "Molimo kontaktirajte administratora za resetovanje lozinke."
        : "Please contact the administrator to reset your password.";
    alert(message);
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    usernameError.classList.remove("show");
    passwordError.classList.remove("show");
    usernameInput.classList.remove("error");
    passwordInput.classList.remove("error");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const lang = localStorage.getItem("language") || "sr";

    let hasError = false;

    if (username === "") {
      usernameError.textContent =
        lang === "sr" ? "Korisničko ime je obavezno" : "Username is required";
      usernameError.classList.add("show");
      usernameInput.classList.add("error");
      hasError = true;
    }

    if (password === "") {
      passwordError.textContent =
        lang === "sr" ? "Lozinka je obavezna" : "Password is required";
      passwordError.classList.add("show");
      passwordInput.classList.add("error");
      hasError = true;
    }

    if (hasError) return;

    const hashedPassword = await sha256(password);
    const user = users.find(
      (u) => u.username === username && u.password === hashedPassword,
    );

    if (user) {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", username);

      const successMsg =
        lang === "sr"
          ? "Uspešno ste se prijavili! Preusmeravanje..."
          : "Login successful! Redirecting...";
      alert(successMsg);

      setTimeout(() => {
        window.location.href = "../zeleni_vrt/index.html";
      }, 500);
    } else {
      const errorMsg =
        lang === "sr"
          ? "Pogrešno korisničko ime ili lozinka"
          : "Invalid username or password";

      usernameError.textContent = errorMsg;
      usernameError.classList.add("show");
      usernameInput.classList.add("error");
      passwordInput.classList.add("error");
    }
  });

  usernameInput.addEventListener("input", function () {
    usernameError.classList.remove("show");
    usernameInput.classList.remove("error");
  });

  passwordInput.addEventListener("input", function () {
    passwordError.classList.remove("show");
    passwordInput.classList.remove("error");
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
