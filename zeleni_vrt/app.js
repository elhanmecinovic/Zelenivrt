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
 * Baštovanski "API" sloj.
 *
 * getGardenGuide() vraća vodič o sadnji i nezi za izabranu biljku.
 * Trenutno koristi lokalnu bazu znanja (gardenGuides) jer ne postoji
 * besplatan javni API za baštovanstvo bez ključa i sa dozvoljenim CORS-om
 * (OpenFarm je ugašen 2025, a Perenual/Trefle zahtevaju API ključ i backend).
 *
 * Funkcija je napisana kao asinhroni poziv (Promise) tako da se lako može
 * zameniti pravim `fetch()` pozivom ka vašem backendu kada bude dostupan,
 * npr.:
 *   const res = await fetch(`https://vas-backend/api/sadnja?biljka=${plant}&jezik=${lang}`);
 *   return await res.json();   // očekivani oblik: { poruka: { sadnja, nega, berba, savet } }
 */
function getGardenGuide(plant, lang) {
  return new Promise((resolve, reject) => {
    // Mala simulacija mrežnog kašnjenja radi realističnog UX-a.
    setTimeout(() => {
      const entry = gardenGuides[plant];
      if (entry && entry[lang]) {
        resolve({ poruka: entry[lang] });
      } else {
        reject(new Error("Nepoznata biljka"));
      }
    }, 350);
  });
}

const gardenGuides = {
  paradajz: {
    sr: {
      sadnja:
        "Seme se seje u februaru–martu u toplu prostoriju ili plastenik. Sadnice se presađuju na otvoreno tek kada prođe opasnost od mraza (sredina maja), na razmak od 40–50 cm. Voli sunčano mesto i plodno, dobro đubreno zemljište.",
      nega: "Zaliva se redovno u korenovu zonu (ne po listu) da bi se sprečile bolesti. Visoke sorte se vezuju za kolac ili žicu i zalamaju (uklanjanje zaperaka). Prihranjuje se kalijumom i kalcijumom za krupne, zdrave plodove.",
      berba:
        "Plodovi sazrevaju 60–80 dana posle presađivanja. Beru se kada potpuno porumene; redovna berba podstiče stalan rod sve do prvih jesenjih hladnoća.",
      savet:
        "Posadite bosiljak pored paradajza — odbija štetočine i, kažu, poboljšava ukus ploda.",
    },
    en: {
      sadnja:
        "Sow seeds in February–March indoors or in a greenhouse. Transplant seedlings outdoors only after the danger of frost has passed (mid-May), spaced 40–50 cm apart. It loves a sunny spot and fertile, well-manured soil.",
      nega: "Water regularly at the root zone (not on the leaves) to prevent disease. Tall varieties are tied to a stake or wire and pruned (removing side shoots). Feed with potassium and calcium for large, healthy fruit.",
      berba:
        "Fruit ripens 60–80 days after transplanting. Pick when fully red; regular harvesting encourages continuous yield until the first autumn cold.",
      savet:
        "Plant basil next to tomatoes — it repels pests and is said to improve the fruit's flavor.",
    },
  },
  paprika: {
    sr: {
      sadnja:
        "Seje se u martu u toplo (25 °C) za klijanje. Na otvoreno se sadi posle mraza, na razmak 30–40 cm, na osunčano i zaklonjeno mesto. Zahteva rastresito, humusno zemljište.",
      nega: "Voli toplotu i ravnomernu vlažnost — zaliva se umereno ali redovno. Prihrana azotom na početku, a kasnije kalijumom. Krhke biljke je dobro pridržati štapićem da se ne polome pod teretom plodova.",
      berba:
        "Bere se 70–90 dana po presađivanju, u tehnološkoj (zelena) ili punoj zrelosti (crvena/žuta). Redovna berba produžava rod.",
      savet:
        "Ne sadite papriku odmah posle paradajza ili krompira — dele iste bolesti; primenite plodored.",
    },
    en: {
      sadnja:
        "Sow in March in warmth (25 °C) for germination. Plant outdoors after frost, 30–40 cm apart, in a sunny, sheltered spot. It needs loose, humus-rich soil.",
      nega: "It loves heat and even moisture — water moderately but regularly. Feed with nitrogen early, then potassium later. Brittle plants benefit from a small stake so they don't snap under the weight of the fruit.",
      berba:
        "Harvest 70–90 days after transplanting, at technological (green) or full ripeness (red/yellow). Regular picking prolongs yield.",
      savet:
        "Don't plant peppers right after tomatoes or potatoes — they share the same diseases; use crop rotation.",
    },
  },
  krastavac: {
    sr: {
      sadnja:
        "Seje se direktno na otvoreno u maju (toplo zemljište preko 15 °C) ili kao sadnica. Razmak 30–40 cm, najbolje uz potporu (mrežu) ili na humke. Voli sunce i mnogo organske materije u zemljištu.",
      nega: "Krastavac je velika 'pijanica' — zahteva obilno i redovno zalivanje mlakom vodom, inače plodovi gorče. Mulčiranje čuva vlagu. Vođenje uz potporu drži plodove čistim i zdravim.",
      berba:
        "Prvi plodovi za 45–60 dana. Beru se mladi i redovno (na 2–3 dana); ako ostanu prezreli, biljka prestaje da rađa.",
      savet:
        "Berite ujutru i nikad ne dozvolite da plod požuti na biljci — to zaustavlja dalji rod.",
    },
    en: {
      sadnja:
        "Sow directly outdoors in May (warm soil above 15 °C) or as a seedling. Space 30–40 cm apart, ideally with support (a net) or on mounds. It loves sun and plenty of organic matter in the soil.",
      nega: "The cucumber is a big drinker — it needs abundant, regular watering with lukewarm water, otherwise the fruit turns bitter. Mulching keeps moisture in. Training it up a support keeps the fruit clean and healthy.",
      berba:
        "First fruit in 45–60 days. Pick them young and often (every 2–3 days); if left to over-ripen, the plant stops producing.",
      savet:
        "Harvest in the morning and never let a fruit yellow on the vine — that halts further yield.",
    },
  },
  sargarepa: {
    sr: {
      sadnja:
        "Seje se direktno u zemljište (ne presađuje se) od marta do jula, plitko, u redove na razmak 25–30 cm. Zahteva duboko, rastresito i bezkamenito zemljište da bi koren bio prav i krupan.",
      nega: "Posle nicanja se obavezno proređuje na 4–5 cm između biljaka. Zaliva se ravnomerno — nagle promene vlage uzrokuju pucanje korena. Redovno plevljenje je važno jer je u početku spora.",
      berba:
        "Vadi se 70–110 dana posle setve, kada koren dostigne željenu debljinu. Može da prezimi u zemlji uz pokrivku od slame.",
      savet:
        "Pomešajte seme šargarepe sa semenom rotkvice — rotkvica brzo nikne i 'obeleži' red dok šargarepa sporo klija.",
    },
    en: {
      sadnja:
        "Sow directly into the soil (it is not transplanted) from March to July, shallowly, in rows 25–30 cm apart. It needs deep, loose, stone-free soil so the root grows straight and large.",
      nega: "After sprouting, thin the plants to 4–5 cm apart. Water evenly — sudden changes in moisture cause the root to split. Regular weeding is important because it is slow at first.",
      berba:
        "Harvest 70–110 days after sowing, once the root reaches the desired thickness. It can overwinter in the ground under a straw cover.",
      savet:
        "Mix carrot seed with radish seed — the radish sprouts quickly and marks the row while the carrot germinates slowly.",
    },
  },
  salata: {
    sr: {
      sadnja:
        "Seje se ili sadi kao rasad od ranog proleća do jeseni, na razmak 25–30 cm. Brzo raste i podnosi hladnoću, pa je odlična za prve i poslednje setve sezone. Voli vlažno, humusno zemljište.",
      nega: "Najvažnija je stalna vlažnost — pri suši i vrućini brzo 'pušta cvet' i postaje gorka. Sadite je na polusenci tokom leta. Lako se gaji u saksijama i sandučićima na balkonu.",
      berba:
        "Bere se 30–60 dana po setvi. Glavičaste sorte se seku kod zemlje, a lisnate beru list po list, što produžava berbu.",
      savet:
        "Sejte malu količinu na svakih 2–3 nedelje ('sukcesivna setva') da imate svežu salatu cele sezone.",
    },
    en: {
      sadnja:
        "Sow or plant as seedlings from early spring to autumn, 25–30 cm apart. It grows fast and tolerates cold, making it ideal for the first and last sowings of the season. It likes moist, humus-rich soil.",
      nega: "Constant moisture is key — in drought and heat it quickly bolts (flowers) and turns bitter. Plant it in partial shade during summer. It grows easily in pots and balcony boxes.",
      berba:
        "Harvest 30–60 days after sowing. Head varieties are cut at the base, while leaf types are picked leaf by leaf, which extends the harvest.",
      savet:
        "Sow a small amount every 2–3 weeks ('succession sowing') to have fresh lettuce all season long.",
    },
  },
  krompir: {
    sr: {
      sadnja:
        "Sadi se proklijala krtola (ne seme) u martu–aprilu, na dubinu 8–10 cm, razmak 30 cm u redu i 60–70 cm između redova. Voli rastresito, kiselkasto zemljište i sunčan položaj.",
      nega: "Kada biljke narastu 20–25 cm, ogrće se zemljom (nagrtanje) da se zaštite krtole od zelenila i svetla. Zaliva se u vreme cvetanja kada se formiraju krtole. Pazite na krompirovu zlaticu.",
      berba:
        "Mladi krompir za 60–70 dana, a zreli kada se cima osuši (90–120 dana). Vadi se po suvom vremenu i ostavlja da se prosuši pre čuvanja.",
      savet:
        "Nikada ne jedite zelene krtole — sadrže solanin; zato je nagrtanje zemljom obavezno.",
    },
    en: {
      sadnja:
        "Plant a sprouted tuber (not seed) in March–April, 8–10 cm deep, 30 cm apart in the row and 60–70 cm between rows. It likes loose, slightly acidic soil and a sunny position.",
      nega: "When plants reach 20–25 cm, hill them up with soil (earthing up) to protect the tubers from greening and light. Water at flowering time when tubers form. Watch out for the Colorado potato beetle.",
      berba:
        "New potatoes in 60–70 days, mature ones when the foliage dies back (90–120 days). Dig in dry weather and let them cure before storage.",
      savet:
        "Never eat green tubers — they contain solanine; that is why earthing up with soil is essential.",
    },
  },
  luk: {
    sr: {
      sadnja:
        "Najlakše se sadi iz arpadžika (sitnog lukčića) u proleće, na razmak 10 cm, plitko (vrh proviruje iz zemlje). Može i iz semena. Voli sunce i umereno đubreno, rastresito zemljište.",
      nega: "Traži malo vode, ali redovno plevljenje jer ne podnosi korov. Prestanite sa zalivanjem kada se formira glavica i list počne da poleže. Previše azota daje bujan list, a slabu glavicu.",
      berba:
        "Vadi se kada 2/3 lišća polegne i požuti (oko 100–120 dana). Ostavlja se da se prosuši na suncu pre uvezivanja i čuvanja.",
      savet:
        "Luk i šargarepa su odlični susedi — miris luka odbija šargarepinu muvu, i obrnuto.",
    },
    en: {
      sadnja:
        "Easiest grown from sets (small onion bulbs) in spring, 10 cm apart, planted shallow (tip peeking out of the soil). It can also be grown from seed. It likes sun and moderately fertilized, loose soil.",
      nega: "It needs little water but regular weeding, as it doesn't tolerate weeds. Stop watering once the bulb forms and the leaves begin to fall over. Too much nitrogen gives lush leaves but a weak bulb.",
      berba:
        "Harvest when 2/3 of the leaves fall over and yellow (about 100–120 days). Let it dry in the sun before bundling and storing.",
      savet:
        "Onion and carrot are great neighbors — the onion smell repels the carrot fly, and vice versa.",
    },
  },
  beliLuk: {
    sr: {
      sadnja:
        "Sadi se pojedinačnim čenovima u jesen (oktobar–novembar) ili rano proleće, vrhom nagore, na dubinu 4–5 cm i razmak 10–15 cm. Voli sunce i dobro drenirano zemljište.",
      nega: "Otporan je i nezahtevan; zaliva se umereno, više u proleće dok raste. Prihrana azotom rano. Uklonite cvetne stabljike ('strelice') da bi sva snaga otišla u glavicu.",
      berba:
        "Jesenja sadnja se vadi sledećeg leta (jun–jul) kada donji listovi požute. Suši se u hladovini i čuva upletenuo u vence.",
      savet:
        "Čuvajte najkrupnije glavice za sledeću sadnju — krupan čen daje krupnu glavicu.",
    },
    en: {
      sadnja:
        "Plant individual cloves in autumn (October–November) or early spring, tip up, 4–5 cm deep and 10–15 cm apart. It likes sun and well-drained soil.",
      nega: "It is hardy and undemanding; water moderately, more in spring while growing. Feed with nitrogen early. Remove the flower stalks ('scapes') so all the energy goes into the bulb.",
      berba:
        "An autumn planting is harvested the following summer (June–July) when the lower leaves yellow. Dry it in the shade and store it braided into strings.",
      savet:
        "Keep the largest bulbs for the next planting — a large clove gives a large bulb.",
    },
  },
  jagoda: {
    sr: {
      sadnja:
        "Najbolje se sadi živim sadnicama (frigo ili živić) u proleće ili rano u jesen, na razmak 30 cm, na uzdignute leje sa folijom ili slamom. Voli sunce i lako kiselo, humusno zemljište.",
      nega: "Koren ne sme da presuši — zaliva se redovno, najbolje kap po kap, da plod ostane suv. Uklanjaju se stare i bolesne listove i suvišne vreže (stolone). Prihrana posle berbe jača biljku za sledeću godinu.",
      berba:
        "Rađa već prve sezone do leta. Plodovi se beru zreli, sa peteljkom, najbolje ujutru; beru se na svaka 2–3 dana.",
      savet:
        "Stavite slamu ili foliju ispod plodova da ne dodiruju zemlju — sprečava trulež i prljanje.",
    },
    en: {
      sadnja:
        "Best planted from live runners (frigo or fresh plants) in spring or early autumn, 30 cm apart, on raised beds with mulch film or straw. It likes sun and lightly acidic, humus-rich soil.",
      nega: "The roots must not dry out — water regularly, ideally by drip, so the fruit stays dry. Remove old and diseased leaves and excess runners (stolons). Feeding after harvest strengthens the plant for next year.",
      berba:
        "It bears as early as the first season into summer. Pick the fruit ripe, with the stem, best in the morning; harvest every 2–3 days.",
      savet:
        "Place straw or film under the fruit so it doesn't touch the soil — this prevents rot and dirt.",
    },
  },
  bundeva: {
    sr: {
      sadnja:
        "Seje se direktno na otvoreno u maju, po 2–3 zrna u kućicu na humku, na velikom razmaku (1–1,5 m) jer se vreže šire daleko. Zahteva sunce i veoma plodno, đubreno zemljište.",
      nega: "Velika biljka traži mnogo vode i hrane — zaliva se obilno u korenovu zonu. Mulčiranje čuva vlagu i drži plodove čistim. Može da se vodi i uz čvrstu potporu ako je prostor mali.",
      berba:
        "Bere se u jesen (90–120 dana), kada pokožica otvrdne i peteljka se osuši. Ostavite malo peteljke na plodu — duže se čuva.",
      savet:
        "Ostavite zrele bundeve da 'odstoje' na suncu nekoliko dana — bolje se čuvaju preko zime.",
    },
    en: {
      sadnja:
        "Sow directly outdoors in May, 2–3 seeds per hole on a mound, with wide spacing (1–1.5 m) since the vines spread far. It needs sun and very fertile, manured soil.",
      nega: "This large plant needs lots of water and food — water generously at the root zone. Mulching keeps moisture in and the fruit clean. It can be trained up a sturdy support if space is tight.",
      berba:
        "Harvest in autumn (90–120 days), when the skin hardens and the stem dries. Leave a bit of stem on the fruit — it stores longer.",
      savet:
        "Let ripe pumpkins cure in the sun for a few days — they keep better through winter.",
    },
  },
  kukuruz: {
    sr: {
      sadnja:
        "Seje se direktno u maju kada se zemljište zagreje, na dubinu 4–5 cm. Sejte ga u blok od više kratkih redova (ne jedan dugačak) radi boljeg oprašivanja vetrom. Razmak 25 cm u redu.",
      nega: "Voli sunce, toplotu i bogatu ishranu, posebno azotom. Zaliva se redovno, najviše u vreme metličanja i formiranja klipa. Korenje na površini se može ogrnuti zemljom radi stabilnosti.",
      berba:
        "Šećerac se bere 'u mlečnoj zrelosti' (oko 70–90 dana) kada su svile smeđe, a zrno pri pritisku pušta mlečan sok. Najslađi je odmah po berbi.",
      savet:
        "Kuvajte šećerac što pre nakon berbe — šećer se brzo pretvara u skrob i gubi se slatkoća.",
    },
    en: {
      sadnja:
        "Sow directly in May once the soil warms, 4–5 cm deep. Plant it in a block of several short rows (not one long row) for better wind pollination. Space 25 cm apart in the row.",
      nega: "It loves sun, heat, and rich feeding, especially nitrogen. Water regularly, most of all at tasseling and cob formation. Surface roots can be hilled with soil for stability.",
      berba:
        "Sweet corn is picked at the 'milk stage' (about 70–90 days) when the silks are brown and a pressed kernel releases a milky juice. It is sweetest right after picking.",
      savet:
        "Cook sweet corn as soon as possible after harvest — the sugar quickly turns to starch and the sweetness fades.",
    },
  },
  bosiljak: {
    sr: {
      sadnja:
        "Seje se u martu–aprilu u toplo, plitko, jer voli toplotu. Na otvoreno ili u saksiju se sadi posle mraza, na razmak 20–25 cm, na sunčano mesto. Odličan je za prozorsku dasku i balkon.",
      nega: "Voli toplotu i redovno zalivanje, ali ne previše — zemlja ne sme da bude raskvašena. Zaliva se pri korenu, ujutru. Redovno štipanje vrhova daje gust, razgranat žbun.",
      berba:
        "Listovi se beru po potrebi tokom celog leta, najbolje pre cvetanja kada su najaromatičniji. Uklanjajte cvetne pupoljke da bi biljka i dalje davala list.",
      savet:
        "Štipnite vrhove čim biljka ima 6 listova — tako se grana i daje mnogo više aromatičnog lišća.",
    },
    en: {
      sadnja:
        "Sow in March–April in warmth, shallowly, as it loves heat. Plant outdoors or in a pot after frost, 20–25 cm apart, in a sunny spot. It is excellent for a windowsill and balcony.",
      nega: "It loves warmth and regular watering, but not too much — the soil must not be waterlogged. Water at the root, in the morning. Regularly pinching the tips gives a dense, branching bush.",
      berba:
        "Leaves are picked as needed all summer, best before flowering when they are most aromatic. Remove flower buds so the plant keeps producing leaves.",
      savet:
        "Pinch the tips as soon as the plant has 6 leaves — this makes it branch and produce far more aromatic foliage.",
    },
  },
};
