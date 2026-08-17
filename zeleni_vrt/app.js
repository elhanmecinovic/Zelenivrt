document.addEventListener("DOMContentLoaded", function () {
  const langButtons = document.querySelectorAll(".lang-btn");
  const currentLang = localStorage.getItem("language") || "sr";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const loginWarning = document.getElementById("login-warning");
  const zodiacCards = document.querySelectorAll(".zodiac-card");
  const modal = document.getElementById("horoscope-modal");
  const closeModal = document.querySelector(".close-modal");
  const modalOverlay = document.querySelector(".modal-overlay");

  setLanguage(currentLang);

  setupNavigation(isLoggedIn);

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

  if (!isLoggedIn) {
    loginWarning.classList.remove("hidden");
    zodiacCards.forEach((card) => {
      card.style.opacity = "0.5";
      card.style.pointerEvents = "none";
    });
  } else {
    loginWarning.classList.add("hidden");
    zodiacCards.forEach((card) => {
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";

      const readBtn = card.querySelector(".read-btn");
      readBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const plant = card.dataset.sign;
        fetchGuide(plant);
      });
    });
  }

  closeModal.addEventListener("click", hideModal);
  modalOverlay.addEventListener("click", hideModal);

  const plantIcons = {
    paradajz: "🍅",
    paprika: "🫑",
    krastavac: "🥒",
    sargarepa: "🥕",
    salata: "🥬",
    krompir: "🥔",
    luk: "🧅",
    beliLuk: "🧄",
    jagoda: "🍓",
    bundeva: "🎃",
    kukuruz: "🌽",
    bosiljak: "🌿",
  };

  // Maps a plant id to its translation key for the display name.
  const plantNameKey = {
    paradajz: "pParadajz",
    paprika: "pPaprika",
    krastavac: "pKrastavac",
    sargarepa: "pSargarepa",
    salata: "pSalata",
    krompir: "pKrompir",
    luk: "pLuk",
    beliLuk: "pBeliLuk",
    jagoda: "pJagoda",
    bundeva: "pBundeva",
    kukuruz: "pKukuruz",
    bosiljak: "pBosiljak",
  };

  async function fetchGuide(plant) {
    const lang = localStorage.getItem("language") || "sr";
    const t = translations[lang];
    const plantName = t[plantNameKey[plant]] || plant;

    document.getElementById("modal-icon").textContent = plantIcons[plant];
    document.getElementById("modal-title").textContent = plantName;
    document.getElementById("modal-text").innerHTML =
      `<p class="guide-loading">${t.guideLoading}</p>`;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    try {
      const data = await getGardenGuide(plant, lang);

      if (data && data.poruka) {
        const g = data.poruka;
        document.getElementById("modal-text").innerHTML = `
          <div class="guide-section">
            <h4>🌱 ${t.guideSadnja}</h4>
            <p>${g.sadnja}</p>
          </div>
          <div class="guide-section">
            <h4>💧 ${t.guideNega}</h4>
            <p>${g.nega}</p>
          </div>
          <div class="guide-section">
            <h4>🧺 ${t.guideBerba}</h4>
            <p>${g.berba}</p>
          </div>
          <div class="guide-section guide-tip">
            <h4>💡 ${t.guideSavet}</h4>
            <p>${g.savet}</p>
          </div>
        `;
      } else {
        throw new Error("No data");
      }
    } catch (error) {
      console.error("Error fetching guide:", error);
      document.getElementById("modal-text").innerHTML =
        `<p class="guide-error">${t.guideError}</p>`;
    }
  }

  function hideModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  function setupNavigation(loggedIn) {
    const loginLink = document.querySelector('a[data-translate="navLogin"]');

    if (loggedIn) {
      loginLink.dataset.translate = "logoutLabel";
      loginLink.href = "#";
      loginLink.classList.add("logout-link");

      loginLink.textContent = translations[currentLang]["logoutLabel"];

      loginLink.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });
    }
  }
  function logout() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    window.location.href = "../pocetna/index.html";
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
}

/*
 * Baštovanski API sloj — Perenual (https://perenual.com/docs/api).
 *
 * Besplatan javni API sa preko 10.000 vrsta biljaka; radi direktno iz
 * browsera (CORS dozvoljen), ali zahteva besplatan API ključ (registracija
 * na perenual.com/docs/api). Ključ je u ovom fajlu jer sajt nema backend —
 * uobičajeno za hobi projekte, ali nije bezbedno za produkciju.
 *
 * Free tier ne vraća gotov tekst za "berbu" (harvest). Podaci se prikazuju
 * onako kako ih API vrati — na engleskom, bez prevoda.
 */
const PERENUAL_API_KEY = "sk-1wZk6a81e78c3c73119408"; // https://perenual.com/docs/api

const perenualNameMap = {
  paradajz: "tomato",
  paprika: "pepper",
  krastavac: "cucumber",
  sargarepa: "carrot",
  salata: "lettuce",
  krompir: "potato",
  luk: "onion",
  beliLuk: "garlic",
  jagoda: "strawberry",
  bundeva: "pumpkin",
  kukuruz: "corn",
  bosiljak: "basil",
};

async function getGardenGuide(plant, lang) {
  return { poruka: await fetchPerenualGuide(plant) };
}

async function fetchPerenualGuide(plant) {
  const query = perenualNameMap[plant];
  if (!query) throw new Error("Nepoznata biljka");
  if (!PERENUAL_API_KEY || PERENUAL_API_KEY === "STAVI_SVOJ_BESPLATAN_KLJUC_OVDE") {
    throw new Error("PERENUAL_API_KEY nije podešen");
  }

  const listRes = await fetch(
    `https://perenual.com/api/v2/species-list?key=${PERENUAL_API_KEY}&q=${encodeURIComponent(query)}`
  );
  if (!listRes.ok) throw new Error(`species-list ${listRes.status}`);
  const listData = await listRes.json();
  const species = listData.data && listData.data[0];
  if (!species) throw new Error("Biljka nije pronađena u Perenual bazi");

  const detailsRes = await fetch(
    `https://perenual.com/api/v2/species/details/${species.id}?key=${PERENUAL_API_KEY}`
  );
  if (!detailsRes.ok) throw new Error(`species/details ${detailsRes.status}`);
  const details = await detailsRes.json();

  return buildGuideFromPerenual(details);
}

function buildGuideFromPerenual(d) {
  const sun = (d.sunlight && d.sunlight[0]) || "unspecified";
  const water = d.watering || "unspecified";
  const benchmark = d.watering_general_benchmark;
  const pruning = d.pruning_month && d.pruning_month.length ? d.pruning_month.join(", ") : null;

  return {
    sadnja: `Cycle: ${d.cycle || "unspecified"}. Prefers ${sun} light.`,
    nega: `Watering: ${water}${
      benchmark ? ` (about every ${benchmark.value} ${benchmark.unit})` : ""
    }. Maintenance: ${d.maintenance || "unspecified"}.${pruning ? ` Pruning: ${pruning}.` : ""}`,
    berba:
      "Perenual's free tier doesn't provide an exact harvest window for this species — check a local gardening guide.",
    savet: `Care level: ${d.care_level || "unspecified"}.`,
  };
}
