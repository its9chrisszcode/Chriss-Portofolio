/* ==========================================================================
   PORTFOLIO VIDEO EDITOR — script.js
   Semua logic: render kartu video, filter kategori, modal player YouTube,
   dan floating nav dengan indikator aktif (scroll-spy).
   Tidak menggunakan library luar — murni vanilla JavaScript.
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     1. DATA VIDEO
     Ganti "youtubeId" dengan ID video YouTube asli (bagian setelah "v=" di URL).
     Thumbnail otomatis diambil dari img.youtube.com berdasarkan ID tersebut.
     ======================================================================== */

  // Sesi 1 — Long form (horizontal, 16:9)
  const longFormVideos = [
    { id: "lf1", title: "Wedding Cinematic — Andi & Sarah", category: "wedding", youtubeId: "dQw4w9WgXcQ" },
    { id: "lf2", title: "Konten YouTube — Vlog Traveling Bali", category: "youtube", youtubeId: "SwJb-e2E98o" },
    { id: "lf3", title: "Video Clip — Promosi Produk Kopi", category: "clip", youtubeId: "GANTI_ID_3" },
    { id: "lf4", title: "Wedding Highlight — Budi & Rina", category: "wedding", youtubeId: "GANTI_ID_4" },
    { id: "lf5", title: "Konten YouTube — Review Gadget", category: "youtube", youtubeId: "GANTI_ID_5" },
    { id: "lf6", title: "Video Clip — Company Profile", category: "clip", youtubeId: "GANTI_ID_6" },
  ];

  // Sesi 2 — Short form (vertical, 9:16)
  const shortFormVideos = [
    { id: "sf1", title: "Reel Wedding — Prosesi Adat", youtubeId: "SwJb-e2E98o" },
    { id: "sf2", title: "Shorts — Behind The Scenes", youtubeId: "GANTI_ID_S2" },
    { id: "sf3", title: "Reel Produk — 15 Detik", youtubeId: "GANTI_ID_S3" },
    { id: "sf4", title: "Shorts — Tips Editing Cepat", youtubeId: "GANTI_ID_S4" },
    { id: "sf5", title: "Reel Event — Highlight Konser", youtubeId: "GANTI_ID_S5" },
  ];

  /* Catatan: label kategori (Wedding Edit/YouTube Video/Video Clip) sekarang
     diambil dari kamus `translations` di bawah (key filter-wedding/youtube/clip),
     supaya otomatis ikut berganti saat bahasa di-toggle. */

  /* ========================================================================
     1.5 KAMUS TERJEMAHAN (ID / EN) — Fitur toggle bahasa
     Setiap elemen HTML yang punya atribut data-i18n="key" akan diisi
     textContent-nya dari sini. data-i18n-aria="key" mengisi aria-label.
     Ini TIDAK mengubah/menghapus logic yang sudah ada di atas.
     ======================================================================== */
  const translations = {
    id: {
      "page-title": "Chriss — Video Editor Portfolio",
      "skip-link": "Langsung ke konten",
      "hero-eyebrow": "Video Editor & Content Creator",
      "hero-bio": "Menghidupkan pesan lewat cerita yang terasa seperti film — membantu content creator, pasangan wedding, hingga perusahaan dan agensi mengubah rekaman mentah menjadi karya sinematik yang berkesan.",
      "cv-label": "Download CV",
      "karya-eyebrow": "Showcase — Long Form",
      "karya-heading": "Karya Terbaru",
      "filter-aria": "Filter kategori video",
      "filter-all": "Semua",
      "filter-wedding": "Wedding Edit",
      "filter-youtube": "YouTube Video",
      "filter-clip": "Video Clip",
      "shorts-eyebrow": "Showcase — Short Form",
      "shorts-heading": "Reels & Shorts",
      "footer-eyebrow": "Mari Berkolaborasi",
      "footer-title": "Punya proyek video?",
      "footer-text": "Ceritakan kebutuhan proyekmu — wedding, konten YouTube, atau video clip. Saya balas cepat lewat WhatsApp.",
      "whatsapp-cta": "Chat via WhatsApp",
      "footer-copy": "Dibuat dengan HTML, CSS & JavaScript murni.",
      "nav-beranda": "Beranda",
      "nav-karya": "Karya",
      "nav-shorts": "Shorts",
      "nav-kontak": "Kontak",
      "nav-main": "Navigasi utama",
      "modal-dialog": "Pemutar video",
      "modal-close": "Tutup video",
      "card-aria-video": "Putar video",
      "card-aria-shorts": "Putar shorts",
    },
    en: {
      "page-title": "Chriss — Video Editor Portfolio",
      "skip-link": "Skip to content",
      "hero-eyebrow": "Video Editor & Content Creator",
      "hero-bio": "Bringing stories and messages to life through a cinematic lens — helping content creators, wedding couples, brands, and agencies turn raw footage into memorable films.",
      "cv-label": "Download CV",
      "karya-eyebrow": "Showcase — Long Form",
      "karya-heading": "Latest Work",
      "filter-aria": "Filter video by category",
      "filter-all": "All",
      "filter-wedding": "Wedding Edit",
      "filter-youtube": "YouTube Video",
      "filter-clip": "Video Clip",
      "shorts-eyebrow": "Showcase — Short Form",
      "shorts-heading": "Reels & Shorts",
      "footer-eyebrow": "Let's Collaborate",
      "footer-title": "Have a video project?",
      "footer-text": "Tell me about your project — wedding, YouTube content, or a short clip. I reply fast on WhatsApp.",
      "whatsapp-cta": "Chat on WhatsApp",
      "footer-copy": "Built with plain HTML, CSS & JavaScript.",
      "nav-beranda": "Home",
      "nav-karya": "Work",
      "nav-shorts": "Shorts",
      "nav-kontak": "Contact",
      "nav-main": "Main navigation",
      "modal-dialog": "Video player",
      "modal-close": "Close video",
      "card-aria-video": "Play video",
      "card-aria-shorts": "Play shorts",
    },
  };

  // Bahasa yang sedang aktif — default dari localStorage kalau ada, kalau tidak "id"
  let currentLang = localStorage.getItem("portfolio-lang") || "id";
  // Filter yang sedang aktif — dipakai saat render ulang setelah ganti bahasa
  let currentFilter = "all";

  /* ========================================================================
     2. AMBIL ELEMEN DOM
     ======================================================================== */
  const videoGrid   = document.getElementById("videoGrid");
  const shortsTrack = document.getElementById("shortsTrack");
  const filterTabs  = document.querySelectorAll(".filter-tab");

  const modal       = document.getElementById("videoModal");
  const modalFrame  = document.getElementById("modalFrame");
  const closeButtons = modal.querySelectorAll("[data-close]");

  const nav         = document.querySelector(".floating-nav");
  const navItems    = document.querySelectorAll(".nav-item");
  const navIndicator = document.getElementById("navIndicator");
  const langToggle  = document.getElementById("langToggle");

  const playIconSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;

  /* ========================================================================
     3. RENDER KARTU VIDEO — Sesi 1 (Long Form)
     ======================================================================== */
  function thumbnailUrl(youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  function renderVideoGrid(filter) {
    const items = filter === "all"
      ? longFormVideos
      : longFormVideos.filter((v) => v.category === filter);

    const t = translations[currentLang];

    videoGrid.innerHTML = items.map((video) => `
      <article class="video-card" tabindex="0" role="button"
                aria-label="${t["card-aria-video"]}: ${video.title}"
                data-youtube-id="${video.youtubeId}" data-orientation="horizontal">
        <div class="video-card__thumb">
          <img src="${thumbnailUrl(video.youtubeId)}" alt="" loading="lazy"
               onerror="this.style.opacity=0">
          <div class="video-card__play"><span>${playIconSVG}</span></div>
        </div>
        <div class="video-card__body">
          <span class="video-card__tag">${t["filter-" + video.category]}</span>
          <h3 class="video-card__title">${video.title}</h3>
        </div>
      </article>
    `).join("");
  }

  /* ========================================================================
     4. RENDER KARTU VIDEO — Sesi 2 (Short Form / vertical scroll-snap)
     ======================================================================== */
  function renderShortsTrack() {
    const t = translations[currentLang];

    shortsTrack.innerHTML = shortFormVideos.map((video) => `
      <article class="short-card" tabindex="0" role="button"
                aria-label="${t["card-aria-shorts"]}: ${video.title}"
                data-youtube-id="${video.youtubeId}" data-orientation="vertical">
        <img src="${thumbnailUrl(video.youtubeId)}" alt="" loading="lazy"
             onerror="this.style.opacity=0">
        <div class="short-card__play">${playIconSVG}</div>
        <div class="short-card__overlay">
          <p class="short-card__title">${video.title}</p>
        </div>
      </article>
    `).join("");
  }

  /* ========================================================================
     5. FILTER TAB — Sesi 1
     ======================================================================== */
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      currentFilter = tab.dataset.filter;
      renderVideoGrid(currentFilter);
    });
  });

  /* ========================================================================
     6. MODAL PLAYER — buka/tutup + embed YouTube (autoplay di dalam modal)
     ======================================================================== */
  let lastFocusedElement = null;

  function openModal(youtubeId, orientation) {
    if (!youtubeId) return;

    lastFocusedElement = document.activeElement;

    modalFrame.className = "modal__frame" + (orientation === "vertical" ? " is-vertical" : "");
    modal.querySelector(".modal__dialog").classList.toggle("is-vertical", orientation === "vertical");
    // src disisipkan saat modal dibuka & autoplay=1 supaya langsung main di dalam modal
    modalFrame.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal__close").focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Kosongkan iframe supaya video benar-benar berhenti (bukan cuma disembunyikan)
    modalFrame.innerHTML = "";
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Event delegation: klik atau tekan Enter/Space pada kartu video mana pun
  function handleCardActivate(e) {
    const card = e.target.closest(".video-card, .short-card");
    if (!card) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.type === "keydown") e.preventDefault();
    openModal(card.dataset.youtubeId, card.dataset.orientation);
  }

  videoGrid.addEventListener("click", handleCardActivate);
  videoGrid.addEventListener("keydown", handleCardActivate);
  shortsTrack.addEventListener("click", handleCardActivate);
  shortsTrack.addEventListener("keydown", handleCardActivate);

  /* ========================================================================
     7. FLOATING NAV — indikator "playhead" mengikuti section aktif
     ======================================================================== */
  function moveIndicatorTo(item) {
    if (!item) return;
    navIndicator.style.width = item.offsetWidth + "px";
    navIndicator.style.transform = `translateX(${item.offsetLeft}px)`;
  }

  function setActiveNav(sectionId) {
    navItems.forEach((item) => {
      const isActive = item.dataset.section === sectionId;
      item.classList.toggle("is-active", isActive);
      if (isActive) moveIndicatorTo(item);
    });
  }

  // Scroll-spy: pantau section mana yang sedang terlihat di layar
  const sections = Array.from(navItems)
    .map((item) => document.getElementById(item.dataset.section))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));

  // Posisikan ulang indikator saat ukuran layar berubah
  window.addEventListener("resize", () => {
    const active = document.querySelector(".nav-item.is-active");
    moveIndicatorTo(active);
  });

  /* ========================================================================
     7.5 TOGGLE BAHASA (ID/EN)
     ======================================================================== */
  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    // <html lang="..."> ikut berubah, baik untuk aksesibilitas & SEO
    document.documentElement.setAttribute("lang", lang);

    // Isi ulang semua elemen teks yang bertanda data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // Isi ulang semua aria-label yang bertanda data-i18n-aria
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.dataset.i18nAria;
      if (t[key] !== undefined) el.setAttribute("aria-label", t[key]);
    });

    // Tandai tombol ID/EN mana yang sedang aktif secara visual
    if (langToggle) {
      langToggle.querySelectorAll("[data-lang-option]").forEach((span) => {
        span.classList.toggle("is-active", span.dataset.langOption === lang);
      });
    }

    // Render ulang kartu video (kategori & aria-label ikut bahasa baru),
    // tetap mempertahankan filter yang sedang aktif
    renderVideoGrid(currentFilter);
    renderShortsTrack();

    // Simpan pilihan bahasa supaya diingat saat user buka situs lagi nanti
    localStorage.setItem("portfolio-lang", lang);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      applyLanguage(currentLang === "id" ? "en" : "id");
    });
  }

  /* ========================================================================
     8. INIT
     ======================================================================== */
  function init() {
    // Terapkan bahasa aktif (default "id" atau hasil localStorage) —
    // ini juga yang melakukan render pertama video-grid & shorts-track
    applyLanguage(currentLang);

    // Set posisi awal indikator nav setelah layout siap
    requestAnimationFrame(() => moveIndicatorTo(document.querySelector(".nav-item.is-active")));
 
    // Hitung ulang posisi indikator setelah font "Sora" selesai dimuat.
    // Tanpa ini, pill bisa terlihat sedikit geser karena lebar teks berubah
    // saat font asli tampil (menggantikan font fallback yang lebih sempit).
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        moveIndicatorTo(document.querySelector(".nav-item.is-active"));
      });
    }
    // Fallback tambahan: pastikan tetap presisi setelah seluruh halaman (termasuk gambar) selesai dimuat
    window.addEventListener("load", () => {
      moveIndicatorTo(document.querySelector(".nav-item.is-active"));
    });
 

    // Tahun berjalan otomatis di footer
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
