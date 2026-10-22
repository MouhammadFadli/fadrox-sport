(() => {
  "use strict";
  const isPagesDir = /\/pages\/[^/]*$/.test(window.location.pathname);
  const projectRoot = isPagesDir ? "../" : "./";
  const asset = (value) => {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return projectRoot + value.replace(/^\.\//, "").replace(/^\//, "");
  };
  const readArray = (key) => {
    try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
    catch { return []; }
  };
  const getCart = () => readArray("cart").filter((item) => item && item.id !== undefined && Number.isFinite(Number(item.price)) && Number(item.price) >= 0)
    .map((item) => ({ ...item, quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))) }));
  const saveCart = (cart) => { localStorage.setItem("cart", JSON.stringify(cart)); renderCart(); };
  const money = (value) => `$ ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  window.Open_List = (element) => { if (element && element.classList) element.classList.toggle("active"); };
  const scrollToSectionStart = (section) => {
    if (!section) return;
    const target = section.querySelector(".top_slide, .class_slide_product, .top-slide-product") || section;
    const header = document.querySelector("header");
    const headerOffset = header && getComputedStyle(header).position === "fixed" ? header.getBoundingClientRect().height : 12;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerOffset - 12);
    window.scrollTo({ top, behavior: "smooth" });
  };
  // Reliable site-wide mobile drawer. The panel/backdrop are portaled to body while open,
  // avoiding header/transform stacking contexts that previously placed the overlay above the panel.
  let mobileNav = null;
  let mobileNavPlaceholder = null;
  let mobileNavOrigin = null;
  const closeMobileNav = () => {
    if (mobileNav && mobileNavPlaceholder && mobileNavPlaceholder.parentNode) {
      mobileNavPlaceholder.parentNode.insertBefore(mobileNav, mobileNavPlaceholder);
      mobileNavPlaceholder.remove();
    }
    if (mobileNav) {
      mobileNav.classList.remove("active", "mobile-drawer-portal");
      mobileNav.removeAttribute("data-mobile-open");
    }
    document.body.classList.remove("mobile-nav-open");
    document.querySelectorAll(".open_menu").forEach((button) => button.setAttribute("aria-expanded", "false"));
    mobileNav = null;
    mobileNavPlaceholder = null;
    mobileNavOrigin = null;
  };
  const openMobileNav = (button) => {
    const nav = button.closest("nav")?.querySelector(".nav_links");
    if (!nav) return;
    closeMobileNav();
    mobileNav = nav;
    mobileNavOrigin = button;
    mobileNavPlaceholder = document.createComment("mobile navigation position");
    nav.parentNode.insertBefore(mobileNavPlaceholder, nav);
    nav.classList.add("active", "mobile-drawer-portal");
    nav.setAttribute("data-mobile-open", "true");
    document.body.appendChild(nav);
    document.body.classList.add("mobile-nav-open");
    button.setAttribute("aria-expanded", "true");
  };
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const opener = target.closest(".open_menu");
    const closer = target.closest(".close_menu");
    const backdrop = target.closest(".mobile-nav-backdrop");
    const panel = target.closest(".nav_links");
    if (opener) {
      event.preventDefault();
      event.stopPropagation();
      if (document.body.classList.contains("mobile-nav-open")) closeMobileNav();
      else openMobileNav(opener);
      return;
    }
    if (closer || backdrop) {
      event.preventDefault();
      closeMobileNav();
      return;
    }
    if (panel) {
      if (target.closest("a") && window.matchMedia("(max-width: 1183px)").matches) closeMobileNav();
      return;
    }
    if (document.body.classList.contains("mobile-nav-open")) closeMobileNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("mobile-nav-open")) closeMobileNav();
  });
  const setCartOpen = (open) => {
    if (!cartPanel) return;
    cartPanel.classList.toggle("active", Boolean(open));
    document.body.classList.toggle("cart-open", Boolean(open));
    document.querySelectorAll(".cart-trigger").forEach((button) => button.setAttribute("aria-expanded", String(Boolean(open))));
  };
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setCartOpen(false); });
  const cartPanel = document.querySelector(".cart");
  const proteinList = document.querySelector(".protein_list");
  const proteinButton = document.querySelector(".protein");
  document.addEventListener("click", (event) => {
    if (proteinList && proteinButton && !proteinList.contains(event.target) && !proteinButton.contains(event.target)) proteinList.classList.remove("active");
  });
  // Rotating practical training tips in the top bar.
  const tipNode = document.querySelector(".sports-tip-text");
  const tips = [
    "Stay hydrated before, during, and after training.",
    "A consistent sleep schedule helps recovery and performance.",
    "Warm up progressively before explosive movements.",
    "Build your meals around enough protein and quality carbohydrates.",
    "Increase training load gradually and respect persistent pain.",
    "Technique quality matters more than rushing every repetition."
  ];
  if (tipNode) {
    let tipIndex = 0;
    tipNode.textContent = tips[0];
    window.setInterval(() => {
      tipNode.classList.add("is-changing");
      window.setTimeout(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        tipNode.textContent = tips[tipIndex];
        tipNode.classList.remove("is-changing");
      }, 180);
    }, 6500);
  }

  // Category mega-menu and product filtering.
  const categoryWrap = document.querySelector(".category_nav");
  const categoryButton = document.querySelector(".category_btn");
  const categoryMenu = document.querySelector(".category_nav_list");
  const proteinToggle = document.querySelector('[data-menu="protein_list"]');
  const proteinSubmenu = document.querySelector(".protein_list");
  const toggleMenu = (element, force) => {
    if (!element) return false;
    const open = typeof force === "boolean" ? force : !element.classList.contains("active");
    element.classList.toggle("active", open);
    return open;
  };
  categoryButton?.addEventListener("click", () => {
    const open = toggleMenu(categoryMenu);
    categoryButton.setAttribute("aria-expanded", String(open));
    if (!open) { toggleMenu(proteinSubmenu, false); proteinToggle?.setAttribute("aria-expanded", "false"); }
  });
  proteinToggle?.addEventListener("click", () => {
    const open = toggleMenu(proteinSubmenu);
    proteinToggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (categoryWrap && !categoryWrap.contains(event.target)) {
      toggleMenu(categoryMenu, false); toggleMenu(proteinSubmenu, false);
      categoryButton?.setAttribute("aria-expanded", "false"); proteinToggle?.setAttribute("aria-expanded", "false");
    }
  });
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filterProducts = (filter) => {
    const products = window.__products || [];
    const matchesFilter = (product) => {
      const category = normalize(product.category); const type = normalize(product.type); const name = normalize(product.name);
      if (filter === "all") return true;
      if (filter === "iso") return category === "protein" && (type.includes("iso") || name.includes("iso") || name.includes("isolate"));
      if (filter === "whey") return category === "protein" && (type.includes("whey") || name.includes("whey"));
      if (filter === "mass-gainer") return category === "protein" && (name.includes("mass") || name.includes("gainer") || type.includes("mass"));
      if (filter === "vitamins") return category === "vetamin" || category === "vitamin" || name.includes("vitamin");
      if (filter === "sports-tools" || filter === "martial-arts") return category === filter || category.includes("martial") || category.includes("equipment") || category.includes("tool");
      return category === normalize(filter);
    };
    const matchedIds = new Set(products.filter(matchesFilter).map((product) => String(product.id)));
    const sections = [...document.querySelectorAll(".slider_products")];
    let visibleSection = null;
    sections.forEach((section) => {
      const cards = [...section.querySelectorAll(".product[data-id]")];
      const isSale = section.querySelector("#swiper_items_sale") !== null;
      const isProtein = section.querySelector("#swiper_proteins") !== null;
      const isCreatine = section.querySelector("#swiper_creatine") !== null;
      const isSupplements = section.querySelector("#swiper_supplements") !== null;
      let sectionRelevant = filter === "all" || (filter === "iso" || filter === "whey" || filter === "mass-gainer") && isProtein || filter === "creatine" && isCreatine || filter === "vitamins" && isSupplements || (filter === "amino" && isSupplements);
      if (filter === "all") sectionRelevant = true;
      let sectionMatches = 0;
      cards.forEach((card) => {
        const id = String(card.dataset.id || card.querySelector(".btn_add_cart")?.dataset.id || "");
        const show = sectionRelevant && (filter === "all" || matchedIds.has(id));
        card.hidden = !show;
        if (show) sectionMatches++;
      });
      // Sales are a merchandising rail, not the canonical category listing.
      if (isSale && filter !== "all") sectionRelevant = false;
      section.hidden = !sectionRelevant || (filter !== "all" && sectionMatches === 0);
      if (!section.hidden && !visibleSection) visibleSection = section;
      const swiper = section.querySelector(".slide_product")?.swiper;
      if (swiper) { swiper.update(); swiper.slideTo(0, 0); }
    });
    let notice = document.querySelector(".product-filter-notice");
    if (!notice) { notice = document.createElement("p"); notice.className = "product-filter-notice"; document.querySelector(".slider_products .container")?.prepend(notice); }
    if (notice) { notice.textContent = matchedIds.size ? `${matchedIds.size} product${matchedIds.size === 1 ? "" : "s"} found for this category.` : "No products are currently listed in this category."; notice.hidden = matchedIds.size > 0; }
    if (visibleSection) scrollToSectionStart(visibleSection);
    toggleMenu(categoryMenu, false); toggleMenu(proteinSubmenu, false);
    categoryButton?.setAttribute("aria-expanded", "false"); proteinToggle?.setAttribute("aria-expanded", "false");
  };
  categoryMenu?.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => filterProducts(button.dataset.filter)));

  const setButtonState = (id, inCart) => document.querySelectorAll(`.btn_add_cart[data-id="${CSS.escape(String(id))}"]`).forEach((button) => {
    const product = (window.__products || []).find((item) => String(item.id) === String(id));
    const stockKnown = product && Number.isInteger(product.stock) && product.stock > 0;
    button.classList.toggle("active", inCart);
    button.setAttribute("aria-pressed", String(Boolean(inCart)));
    button.disabled = !stockKnown;
    button.title = stockKnown ? (inCart ? "Item in cart" : "Add to cart") : "Availability is unconfirmed. Contact Fadli Sport before ordering.";
    button.innerHTML = `<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> ${!stockKnown ? "Check availability" : (inCart ? "Item in cart" : "Add to cart")}`;
  });
  function renderCart() {
    const cart = getCart();
    localStorage.setItem("cart", JSON.stringify(cart));
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartContainer = document.getElementById("cart_items");
    const checkoutContainer = document.getElementById("checkout_items");
    const fragmentFor = (checkout) => {
      const fragment = document.createDocumentFragment();
      cart.forEach((item, index) => {
        const row = document.createElement("div"); row.className = "item_cart";
        const image = document.createElement("img"); image.src = asset(item.img); image.alt = item.name || "Product"; image.loading = "lazy";
        const content = document.createElement("div"); content.className = checkout ? "content" : "content";
        const heading = document.createElement("h4"); heading.textContent = item.name || "Product";
        const price = document.createElement("p"); price.className = "price_cart"; price.textContent = money(Number(item.price) * item.quantity);
        const controls = document.createElement("div"); controls.className = "quantity_control";
        const dec = document.createElement("button"); dec.type = "button"; dec.className = "decrease_quantity"; dec.dataset.index = index; dec.textContent = "−"; dec.setAttribute("aria-label", `Decrease ${item.name || "product"} quantity`);
        const qty = document.createElement("span"); qty.className = "quantity"; qty.textContent = item.quantity;
        const inc = document.createElement("button"); inc.type = "button"; inc.className = "Increase_quantity"; inc.dataset.index = index; inc.textContent = "+"; inc.setAttribute("aria-label", `Increase ${item.name || "product"} quantity`);
        controls.append(dec, qty, inc); content.append(heading, price, controls);
        const del = document.createElement("button"); del.type = "button"; del.className = "delete_item"; del.dataset.index = index; del.setAttribute("aria-label", `Remove ${item.name || "product"}`); del.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        if (checkout) { const imageName = document.createElement("div"); imageName.className = "image_name"; imageName.append(image, content); row.append(imageName, del); }
        else row.append(image, content, del);
        fragment.appendChild(row);
      });
      return fragment;
    };
    if (cartContainer) cartContainer.replaceChildren(fragmentFor(false));
    if (checkoutContainer) checkoutContainer.replaceChildren(fragmentFor(true));
    document.querySelectorAll(".price_cart_total").forEach((el) => el.textContent = money(subtotal));
    document.querySelectorAll(".count_itme_cart, .count-shop").forEach((el) => el.textContent = String(count));
    document.querySelectorAll(".subtotal_checkout").forEach((el) => el.textContent = money(subtotal));
    document.querySelectorAll(".total_checkout").forEach((el) => el.textContent = money(subtotal + (cart.length ? 20 : 0)));
    const itemsInput = document.getElementById("items"); const totalInput = document.getElementById("total_Price"); const countInput = document.getElementById("count_Itmes");
    if (itemsInput) itemsInput.value = cart.map((item) => `${item.name} | unit price: ${item.price} | quantity: ${item.quantity} | line total: ${Number(item.price) * item.quantity}`).join("\n");
    if (totalInput) totalInput.value = String(subtotal + (cart.length ? 20 : 0));
    if (countInput) countInput.value = String(count);
    const checkoutLinks = document.querySelectorAll(".btn_checkout");
    checkoutLinks.forEach((link) => { link.classList.toggle("disabled", !cart.length); link.setAttribute("aria-disabled", String(!cart.length)); if (link.tagName === "A") link.href = cart.length ? (isPagesDir ? "checkout.html" : "pages/checkout.html") : "#"; });
    cart.forEach((item) => setButtonState(item.id, true));
    document.querySelectorAll(".btn_add_cart").forEach((button) => { if (!cart.some((item) => String(item.id) === String(button.dataset.id))) setButtonState(button.dataset.id, false); });
  }
  document.addEventListener("click", (event) => {
    const cartTrigger = event.target.closest(".cart-trigger, .header-icons .icon.cart-icon");
    if (cartTrigger) { event.preventDefault(); setCartOpen(!cartPanel?.classList.contains("active")); return; }
    const cartClose = event.target.closest(".close_cart, .cart-close, .cart-backdrop");
    if (cartClose) { event.preventDefault(); setCartOpen(false); return; }
    const addButton = event.target.closest(".btn_add_cart");
    if (addButton) {
      event.preventDefault(); const id = addButton.dataset.id;
      const product = window.__products?.find((item) => String(item.id) === String(id));
      if (!product) { addButton.disabled = true; addButton.title = "Product data is still loading. Try again shortly."; setTimeout(() => { addButton.disabled = false; }, 800); return; }
      if (!Number.isInteger(product.stock) || product.stock < 1) { addButton.disabled = true; addButton.title = "Stock is unknown or unavailable. Confirm availability with Fadli Sport before ordering."; addButton.textContent = "Check availability"; return; }
      const cart = getCart(); const existing = cart.find((item) => String(item.id) === String(product.id));
      if (existing && existing.quantity >= product.stock) { addButton.disabled = true; addButton.title = "The requested quantity exceeds the recorded stock."; return; }
      if (existing) existing.quantity = Math.min(product.stock, existing.quantity + 1);
      else cart.push({ ...product, quantity: 1 });
      saveCart(cart);
      // Adding an item updates the badge and cart contents only. The drawer opens
      // exclusively when the shopper activates the cart icon.
      return;
    }
    const inc = event.target.closest(".Increase_quantity"); const dec = event.target.closest(".decrease_quantity"); const del = event.target.closest(".delete_item");
    if (inc || dec || del) {
      const index = Number((inc || dec || del).dataset.index); const cart = getCart(); if (!Number.isInteger(index) || !cart[index]) return;
      if (inc) {
        const currentProduct = (window.__products || []).find((item) => String(item.id) === String(cart[index].id));
        if (!currentProduct || !Number.isInteger(currentProduct.stock) || currentProduct.stock < 1 || cart[index].quantity >= currentProduct.stock) { inc.disabled = true; inc.title = "Quantity exceeds confirmed stock. Contact the store to confirm availability."; return; }
        cart[index].quantity = Math.min(currentProduct.stock, cart[index].quantity + 1);
      }
      if (dec) cart[index].quantity = Math.max(1, cart[index].quantity - 1);
      if (del) { const removed = cart.splice(index, 1)[0]; if (removed) setButtonState(removed.id, false); }
      saveCart(cart); return;
    }
    const fav = event.target.closest(".favorite-toggle");
    if (fav) {
      const id = String(fav.dataset.id); const favorites = readArray("favorites").map(String); const exists = favorites.includes(id);
      const updatedFavorites = exists ? favorites.filter((x) => x !== id) : [...favorites, id];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      fav.classList.toggle("active", !exists); fav.setAttribute("aria-pressed", String(!exists));
      fav.setAttribute("aria-label", !exists ? "Remove from favorites" : "Add to favorites");
      const icon = fav.querySelector("i"); if (icon) icon.className = exists ? "fa-regular fa-heart" : "fa-solid fa-heart";
      updateFavoriteCount();
      if (document.getElementById("favorites_grid")) renderFavoritesPage();
    }
  });
  function updateFavoriteCount() {
    const favorites = readArray("favorites").map(String);
    document.querySelectorAll(".count-favourit").forEach((node) => { node.textContent = String(favorites.length); });
  }
  function renderFavoritesPage() {
    const grid = document.getElementById("favorites_grid");
    if (!grid || !Array.isArray(window.__products)) return;
    const ids = readArray("favorites").map(String);
    const favoriteProducts = window.__products.filter((product) => ids.includes(String(product.id)));
    grid.replaceChildren();
    if (!favoriteProducts.length) {
      const empty = document.createElement("div"); empty.className = "favorites-empty";
      empty.innerHTML = '<i class="fa-regular fa-heart" aria-hidden="true"></i><h2>No favorite products yet</h2><p>Tap the heart on a product to save it here.</p><a class="btn" href="' + (isPagesDir ? "index.html" : "../index.html") + '">Explore products</a>';
      grid.appendChild(empty); return;
    }
    favoriteProducts.forEach((product) => {
      const card = document.createElement("article"); card.className = "favorite-card product"; card.dataset.id = String(product.id);
      const image = document.createElement("img"); image.src = asset(product.img); image.alt = product.name || "Product"; image.loading = "lazy";
      const name = document.createElement("h3"); name.textContent = product.name || "Product";
      const price = document.createElement("p"); price.className = "favorite-price"; price.textContent = money(product.price);
      const actions = document.createElement("div"); actions.className = "favorite-actions";
      const add = document.createElement("button"); add.type = "button"; add.className = "btn_add_cart"; add.dataset.id = String(product.id); add.innerHTML = '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Add to cart';
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "favorite-toggle active"; remove.dataset.id = String(product.id); remove.setAttribute("aria-label", "Remove from favorites"); remove.setAttribute("aria-pressed", "true"); remove.innerHTML = '<i class="fa-solid fa-heart" aria-hidden="true"></i>';
      actions.append(add, remove); card.append(image, name, price, actions); grid.appendChild(card);
    });
    document.querySelectorAll(".btn_add_cart").forEach((button) => { const inCart = getCart().some((item) => String(item.id) === String(button.dataset.id)); setButtonState(button.dataset.id, inCart); });
  }

  document.addEventListener("products:loaded", (event) => {
    window.__products = event.detail;
    const favorites = readArray("favorites").map(String);
    document.querySelectorAll(".favorite-toggle").forEach((button) => { const active = favorites.includes(String(button.dataset.id)); button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); const icon = button.querySelector("i"); if (icon && active) icon.className = "fa-solid fa-heart"; });
    renderCart(); updateFavoriteCount(); renderFavoritesPage();
  });
  // Search product cards on the home page; preserve native form behavior only when no product cards exist.
  const searchForm = document.querySelector(".search_box"); const searchInput = document.getElementById("search");
  if (searchForm && searchInput) searchForm.addEventListener("submit", (event) => {
    const cards = [...document.querySelectorAll(".slider_products .product[data-id]")];
    if (!cards.length) return;
    event.preventDefault();
    const term = searchInput.value.trim().toLowerCase();
    const category = document.getElementById("catagory")?.value || "all";
    let matches = 0; let firstMatchSection = null;
    document.querySelectorAll(".slider_products").forEach(section => {
      let sectionMatches = 0;
      section.querySelectorAll(".product[data-id]").forEach(card => {
        const product = (window.__products || []).find(item => String(item.id) === String(card.dataset.id || card.querySelector(".btn_add_cart")?.dataset.id));
        const haystack = `${product?.name || card.textContent} ${product?.category || ""} ${product?.type || ""}`.toLowerCase();
        const categoryMatch = category === "all" || (product && (String(product.category) === category || (category === "vitamins" && /vitamin|vetamin/.test(String(product.category)))));
        const match = (!term || haystack.includes(term)) && categoryMatch;
        card.hidden = !match; if (match) { matches++; sectionMatches++; if (!firstMatchSection) firstMatchSection = section; }
      });
      const swiper = section.querySelector(".slide_product")?.swiper;
      if (swiper) { swiper.update(); swiper.slideTo(0, 0); }
      section.hidden = sectionMatches === 0;
    });
    searchInput.setCustomValidity(matches ? "" : "No products matched your search.");
    if (!matches) searchInput.reportValidity();
    else {
      let targetSection = firstMatchSection;
      const query = `${term} ${category}`.toLowerCase();
      if (/creatine/.test(query)) targetSection = document.querySelector("#swiper_creatine")?.closest(".slider_products") || targetSection;
      else if (/protein|whey|iso|mass/.test(query)) targetSection = document.querySelector("#swiper_proteins")?.closest(".slider_products") || targetSection;
      else if (/vitamin|supplement|amino/.test(query)) targetSection = document.querySelector("#swiper_supplements")?.closest(".slider_products") || targetSection;
      else if (category === "protein") targetSection = document.querySelector("#swiper_proteins")?.closest(".slider_products") || targetSection;
      else if (category === "creatine") targetSection = document.querySelector("#swiper_creatine")?.closest(".slider_products") || targetSection;
      else if (category === "vitamins") targetSection = document.querySelector("#swiper_supplements")?.closest(".slider_products") || targetSection;
      scrollToSectionStart(targetSection);
    }
  });
  renderCart(); updateFavoriteCount();
  if (window.__products) renderFavoritesPage();
})();
