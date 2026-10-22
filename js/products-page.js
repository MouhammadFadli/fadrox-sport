(() => {
  "use strict";
  const grid = document.getElementById("products-grid"); if (!grid) return;
  const search = document.getElementById("product-search"), category = document.getElementById("product-category"), sort = document.getElementById("product-sort"), status = document.getElementById("catalog-status");
  let products = [];
  const root = "../"; const money = (n) => `$ ${Number(n || 0).toLocaleString("en-US")}`;
  const imageUrl = (v) => /^(https?:|data:|blob:)/i.test(v || "") ? v : root + String(v || "").replace(/^\.\//, "").replace(/^\//, "");
  function render() {
    const term = search.value.trim().toLowerCase(), cat = category.value;
    let list = products.filter(p => (!term || String(p.name || "").toLowerCase().includes(term)) && (cat === "all" || String(p.category || "").toLowerCase() === cat));
    if (sort.value === "price-asc") list.sort((a,b) => Number(a.price)-Number(b.price));
    if (sort.value === "price-desc") list.sort((a,b) => Number(b.price)-Number(a.price));
    if (sort.value === "name") list.sort((a,b) => String(a.name).localeCompare(String(b.name)));
    grid.replaceChildren();
    if (!list.length) { status.textContent = "No products match your filters."; return; }
    const fragment = document.createDocumentFragment();
    list.forEach(p => {
      const card = document.createElement("article"); card.className = "content-card catalog-card";
      const link = document.createElement("a"); link.className = "catalog-image-link"; link.href = `product.html?id=${encodeURIComponent(p.id)}`;
      const img = document.createElement("img"); img.loading = "lazy"; img.decoding = "async"; img.src = imageUrl(p.img); img.alt = p.name || "Product image"; img.width = 320; img.height = 260; link.append(img);
      const titleLink = document.createElement("a"); titleLink.href = link.href; titleLink.className = "catalog-title-link"; const title = document.createElement("h2"); title.textContent = p.name || "Unnamed product"; titleLink.append(title);
      const price = document.createElement("p"); price.className = "catalog-price"; price.textContent = money(p.price);
      if (Number(p.old_price) > Number(p.price)) { const old = document.createElement("del"); old.textContent = money(p.old_price); price.append(" ", old); }
      const stock = document.createElement("p"); stock.className = "stock-status stock-unknown"; stock.textContent = Number.isInteger(p.stock) ? (p.stock > 0 ? `In stock: ${p.stock}` : "Out of stock") : "Availability unconfirmed";
      const actions = document.createElement("div"); actions.className = "catalog-actions";
      const detail = document.createElement("a"); detail.className = "btn catalog-detail-btn"; detail.href = link.href; detail.textContent = "View details";
      const fav = document.createElement("button"); fav.type = "button"; fav.className = "favorite-toggle"; fav.dataset.id = String(p.id); fav.setAttribute("aria-label", `Add ${p.name} to favorites`); fav.setAttribute("aria-pressed", "false"); fav.innerHTML = '<i class="fa-regular fa-heart" aria-hidden="true"></i>';
      const add = document.createElement("button"); add.type = "button"; add.className = "btn btn_add_cart"; add.dataset.id = String(p.id); add.textContent = Number.isInteger(p.stock) && p.stock > 0 ? "Add to cart" : "Check availability"; add.disabled = !(Number.isInteger(p.stock) && p.stock > 0); add.title = add.disabled ? "Availability is not confirmed; contact Fadli Sport before ordering." : "Add to cart";
      actions.append(detail, fav, add); card.append(link, titleLink, price, stock, actions); fragment.append(card);
    });
    grid.append(fragment); status.textContent = `${list.length} product${list.length === 1 ? "" : "s"} shown.`;
    document.dispatchEvent(new CustomEvent("products:loaded", { detail: products }));
  }
  Promise.resolve().then(async () => { const r = await fetch("../js/products.json"); if (!r.ok) throw new Error(`HTTP ${r.status}`); products = await r.json(); if (!Array.isArray(products)) throw new Error("Invalid product data");
    const params = new URLSearchParams(location.search); if ([...category.options].some(o => o.value === params.get("category"))) category.value = params.get("category");
    [search, category, sort].forEach(el => el.addEventListener(el === search ? "input" : "change", render)); render();
  }).catch(error => { console.error("Product catalogue failed:", error); status.textContent = "Products could not be loaded. Please refresh or contact the store."; });
})();
