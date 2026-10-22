(() => {
  "use strict";
  const status = document.getElementById("product-detail-status"),
    detail = document.getElementById("product-detail"),
    related = document.getElementById("related-products");
  if (!detail) return;
  const id = new URLSearchParams(location.search).get("id"),
    root = "../";
  const money = (n) => `$ ${Number(n || 0).toLocaleString("en-US")}`;
  const imageUrl = (v) =>
    /^(https?:|data:|blob:)/i.test(v || "")
      ? v
      : root +
        String(v || "")
          .replace(/^\.\//, "")
          .replace(/^\//, "");
  function makeRelated(p) {
    const card = document.createElement("article");
    card.className = "content-card catalog-card related-card";
    const a = document.createElement("a");
    a.href = `product.html?id=${encodeURIComponent(p.id)}`;
    a.className = "catalog-image-link";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = imageUrl(p.img);
    img.alt = p.name || "Product";
    img.width = 240;
    img.height = 180;
    a.append(img);
    const h = document.createElement("h3");
    const link = document.createElement("a");
    link.className = "img-link";
    link.href = a.href;
    link.textContent = p.name || "Product";
    h.append(link);
    const price = document.createElement("p");
    price.className = "catalog-price";
    price.textContent = money(p.price);
    card.append(a, h, price);
    return card;
  }
  fetch("../js/products.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((products) => {
      if (!Array.isArray(products)) throw new Error("Invalid product data");
      const p = products.find((x) => String(x.id) === String(id));
      if (!p) {
        status.textContent = "This product could not be found.";
        const a = document.createElement("a");
        a.href = "products.html";
        a.className = "btn";
        a.textContent = "Browse all products";
        status.append(" ", a);
        return;
      }
      document.title = `${p.name} | Fadli Sport`;
      document.getElementById("breadcrumb-product").textContent = p.name;
      const gallery = document.createElement("div");
      gallery.className = "detail-gallery";
      const galleryImages =
        Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.img];
      const mainImg = document.createElement("img");
      mainImg.className = "detail-main-image";
      mainImg.src = imageUrl(galleryImages[0]);
      mainImg.alt = p.name || "Product";
      mainImg.width = 600;
      mainImg.height = 600;
      mainImg.fetchPriority = "high";
      gallery.append(mainImg);
      if (galleryImages.length > 1) {
        const thumbs = document.createElement("div");
        thumbs.className = "detail-thumbnails";
        galleryImages.forEach((src, index) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "detail-thumbnail";
          b.setAttribute("aria-label", `Show product image ${index + 1}`);
          const im = document.createElement("img");
          im.src = imageUrl(src);
          im.alt = `${p.name || "Product"} image ${index + 1}`;
          im.loading = "lazy";
          im.width = 80;
          im.height = 80;
          b.append(im);
          b.addEventListener("click", () => {
            mainImg.src = imageUrl(src);
          });
          thumbs.append(b);
        });
        gallery.append(thumbs);
      }
      const info = document.createElement("div");
      info.className = "detail-info";
      const h = document.createElement("h1");
      h.textContent = p.name || "Product";
      const price = document.createElement("p");
      price.className = "detail-price";
      price.textContent = money(p.price);
      if (Number(p.old_price) > Number(p.price)) {
        const old = document.createElement("del");
        old.textContent = money(p.old_price);
        price.append(" ", old);
      }
      const stock = document.createElement("p");
      stock.className = "stock-status stock-unknown";
      stock.textContent = Number.isInteger(p.stock)
        ? p.stock > 0
          ? `Confirmed listed stock: ${p.stock}`
          : "Out of stock"
        : "Availability has not been confirmed. Please contact Fadli Sport before placing an order.";
      const description = document.createElement("p");
      description.className = "detail-description";
      description.textContent =
        p.description ||
        "Product specifications and full description have not yet been provided by the store. Please contact Fadli Sport if you need details before purchase.";
      const qtyLabel = document.createElement("label");
      qtyLabel.className = "detail-quantity-label";
      qtyLabel.textContent = "Quantity";
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.max =
        Number.isInteger(p.stock) && p.stock > 0 ? String(p.stock) : "1";
      qty.value = "1";
      qty.inputMode = "numeric";
      qty.setAttribute("aria-label", "Product quantity");
      qtyLabel.append(qty);
      const actions = document.createElement("div");
      actions.className = "detail-actions";
      const add = document.createElement("button");
      add.type = "button";
      add.className = "btn btn_add_cart";
      add.dataset.id = String(p.id);
      add.textContent =
        Number.isInteger(p.stock) && p.stock > 0
          ? "Add to cart"
          : "Check availability";
      add.disabled = !(Number.isInteger(p.stock) && p.stock > 0);
      add.title = add.disabled
        ? "Availability is not confirmed; contact Fadli Sport before ordering."
        : "Add selected quantity to cart";
      const fav = document.createElement("button");
      fav.type = "button";
      fav.className = "favorite-toggle";
      fav.dataset.id = String(p.id);
      fav.setAttribute("aria-label", "Add to favorites");
      fav.setAttribute("aria-pressed", "false");
      fav.innerHTML = '<i class="fa-regular fa-heart" aria-hidden="true"></i>';
      // Quantity is applied through the delegated cart event so existing cart behavior remains the single source of truth.
      add.addEventListener("click", (e) => {
        if (!Number.isInteger(p.stock) || p.stock < 1) return;
        e.stopImmediatePropagation();
        const n = Math.floor(Number(qty.value));
        if (n < 1 || n > p.stock) return;
        const cart = (() => {
          try {
            const c = JSON.parse(localStorage.getItem("cart") || "[]");
            return Array.isArray(c) ? c : [];
          } catch {
            return [];
          }
        })();
        const existing = cart.find((x) => String(x.id) === String(p.id));
        if (existing && existing.quantity + n > p.stock) {
          status.textContent = "Requested quantity exceeds recorded stock.";
          return;
        }
        if (existing) existing.quantity += n;
        else cart.push({ ...p, quantity: n });
        localStorage.setItem("cart", JSON.stringify(cart));
        status.hidden = false;
        status.textContent = "Added to cart.";
        document.dispatchEvent(
          new CustomEvent("products:loaded", { detail: products }),
        );
      });
      actions.append(add, fav);
      info.append(h, price, stock, description, qtyLabel, actions);
      detail.append(gallery, info);
      detail.hidden = false;
      status.hidden = true;
      const similar = products
        .filter(
          (x) => String(x.id) !== String(p.id) && x.category === p.category,
        )
        .slice(0, 4);
      if (!similar.length)
        products
          .filter((x) => String(x.id) !== String(p.id))
          .slice(0, 4)
          .forEach((x) => related.append(makeRelated(x)));
      else similar.forEach((x) => related.append(makeRelated(x)));
      document.dispatchEvent(
        new CustomEvent("products:loaded", { detail: products }),
      );
    })
    .catch((error) => {
      console.error("Product detail failed:", error);
      status.textContent =
        "Product details could not be loaded. Please try again.";
    });
})();
