// Swiper setup for hero banner and dynamically loaded product sliders.
(() => {
  "use strict";
  if (typeof window.Swiper !== "function") {
    console.warn("Swiper library was not loaded; sliders will remain static.");
    return;
  }

  const hero = document.querySelector(".slid_swp");
  if (hero && !hero.swiper) {
    new Swiper(hero, {
      spaceBetween: 30,
      pagination: {
        el: hero.querySelector(".swiper-pagination"),
        clickable: true,
        dynamicBullets: true,
      },
      autoplay: { delay: 3500, disableOnInteraction: true },
      loop: hero.querySelectorAll(".swiper-slide").length > 1,
      a11y: { enabled: true },
    });
  }

  function initProductSliders() {
    document.querySelectorAll(".slider_products").forEach((slider) => {
      const container = slider.querySelector(".slide_product");
      if (!container || container.swiper) return;
      const slideCount = container.querySelectorAll(".swiper-slide").length;
      if (!slideCount) return;
      new Swiper(container, {
        slidesPerView: 2,
        spaceBetween: 14,
        watchOverflow: true,
        loop: slideCount > 5,
        autoplay: slideCount > 2 ? { delay: 3500, disableOnInteraction: true } : false,
        navigation: {
          nextEl: slider.querySelector(".btn_next"),
          prevEl: slider.querySelector(".btn_prev"),
        },
        breakpoints: {
          0: { slidesPerView: 2, spaceBetween: 12 },
          700: { slidesPerView: 3, spaceBetween: 16 },
          1000: { slidesPerView: 4, spaceBetween: 20 },
          1200: { slidesPerView: 5, spaceBetween: 20 },
        },
        a11y: { enabled: true },
      });
    });
  }

  document.addEventListener("products:loaded", initProductSliders, { once: true });
  // Allow initialization if products are already present (e.g. cached/custom page).
  if (document.querySelector(".slider_products .swiper-slide")) initProductSliders();
})();
