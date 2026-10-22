(() => {
  "use strict";
  const isPagesDir = /\/pages\/[^/]*$/.test(window.location.pathname);
  const projectRoot = isPagesDir ? "../" : "./";
  const asset = (value) => {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return projectRoot + value.replace(/^\.\//, "").replace(/^\//, "");
  };
  const money = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;
  const makeCard = (product) => {
    const card = document.createElement("article");
    card.className = "swiper-slide product";
    card.dataset.id = String(product.id);
    card.dataset.category = String(product.category || "");
    const discount = Number(product.old_price) > Number(product.price)
      ? Math.floor((Number(product.old_price) - Number(product.price)) / Number(product.old_price) * 100)
      : 0;
    card.innerHTML = `
      ${discount ? `<span class="sale_present">%${discount}</span>` : ""}
      <div class="img_product"><a class="product-detail-link" href=""><img loading="lazy" alt="" /></a></div>
      <div class="stars" aria-label="Product listing"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
      <p class="name_product"><a class="product-detail-link" href=""></a></p>
      <div class="price"><p><span></span></p>${discount ? `<p class="old_price">${money(product.old_price)}</p>` : ""}</div>
      <div class="icons"><button type="button" class="btn_add_cart" data-id="${String(product.id).replace(/[^\w-]/g, "")}"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Add to cart</button>
      <button type="button" class="icon_product favorite-toggle" data-id="${String(product.id).replace(/[^\w-]/g, "")}" aria-label="Add to favorites"><i class="fa-regular fa-heart" aria-hidden="true"></i></button></div>`;
    const img = card.querySelector("img"); img.src = asset(product.img); img.alt = product.name || "Product";
    card.querySelectorAll(".product-detail-link").forEach((link) => { link.href = `${projectRoot}pages/product.html?id=${encodeURIComponent(product.id)}`; link.setAttribute("aria-label", `View details for ${product.name || "product"}`); });
    card.querySelector(".name_product a").textContent = product.name || "Unnamed product";
    const addButton = card.querySelector(".btn_add_cart");
    if (!Number.isInteger(product.stock) || product.stock < 1) { addButton.disabled = true; addButton.title = "Availability is unconfirmed. Contact Fadli Sport before ordering."; addButton.textContent = "Check availability"; }
    card.querySelector(".price span").textContent = money(product.price);
    return card;
  };
  fetch(projectRoot + "js/products.json")
    .then((response) => { if (!response.ok) throw new Error(`Product data request failed (${response.status})`); return response.json(); })
    .then((products) => {
      if (!Array.isArray(products)) throw new Error("Product data must be a list.");
      const sections = {
        swiper_items_sale: (p) => Number(p.old_price) > Number(p.price),
        swiper_proteins: (p) => p.category === "protein",
        swiper_creatine: (p) => p.category === "creatine",
        swiper_supplements: (p) => p.category === "vetamin" || p.category === "amino"
      };
      Object.entries(sections).forEach(([id, filter]) => {
        const container = document.getElementById(id);
        if (!container) return;
        const fragment = document.createDocumentFragment();
        products.filter(filter).forEach((product) => fragment.appendChild(makeCard(product)));
        container.replaceChildren(fragment);
      });
      document.dispatchEvent(new CustomEvent("products:loaded", { detail: products }));
    })
    .catch((error) => {
      console.error("Unable to load products:", error);
      document.querySelectorAll("#swiper_items_sale, #swiper_proteins, #swiper_creatine, #swiper_supplements").forEach((el) => {
        el.textContent = "Products could not be loaded. Please refresh the page.";
      });
    });
})();
