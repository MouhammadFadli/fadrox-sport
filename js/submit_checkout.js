(() => {
  "use strict";
  const form = document.getElementById("form_contact");
  if (!form) return;
  const scriptURL = form.action || "";
  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.createElement("p"); status.className = "checkout-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); form.prepend(status);
  const getCart = () => { try { const cart = JSON.parse(localStorage.getItem("cart") || "[]"); return Array.isArray(cart) ? cart : []; } catch { return []; } };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const cart = getCart();
    if (!cart.length) { status.textContent = "Your cart is empty. Add products before placing an order."; return; }
    try {
      const response = await fetch("../js/products.json");
      if (!response.ok) throw new Error(`Product stock check failed (${response.status})`);
      const products = await response.json();
      for (const item of cart) {
        const current = products.find((product) => String(product.id) === String(item.id));
        if (!current || !Number.isInteger(current.stock) || current.stock < 1) {
          status.textContent = `Availability for “${item.name || "a product"}” is not confirmed. Please contact Fadli Sport before submitting this order.`;
          return;
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > current.stock) {
          status.textContent = `The quantity requested for “${item.name || "a product"}” exceeds the recorded stock. Please update your cart.`;
          return;
        }
      }
    } catch (stockError) {
      console.error("Could not verify product stock:", stockError);
      status.textContent = "We could not verify stock right now. Your order was not submitted; please try again later.";
      return;
    }
    if (!scriptURL || !/^https:\/\/script\.google\.com\/macros\/s\//.test(scriptURL)) { status.textContent = "Order submission is not configured correctly. Please contact the store."; return; }
    const originalText = submitButton?.textContent;
    const orderId = "FS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    let orderIdInput = form.querySelector("[name=OrderID]");
    if (!orderIdInput) { orderIdInput = document.createElement("input"); orderIdInput.type = "hidden"; orderIdInput.name = "OrderID"; form.append(orderIdInput); }
    orderIdInput.value = orderId;
    const createdInput = form.querySelector("[name=OrderDate]");
    if (!createdInput) { const el = document.createElement("input"); el.type = "hidden"; el.name = "OrderDate"; form.append(el); el.value = new Date().toISOString(); } else createdInput.value = new Date().toISOString();
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Submitting…"; }
    status.textContent = "Submitting your order. Please do not close this page.";
    try {
      // Google Apps Script web apps commonly return an opaque/no-CORS response from static sites.
      // A resolved request is not proof that the order was stored, so we do not clear the cart automatically.
      await fetch(scriptURL, { method: "POST", body: new FormData(form), mode: "no-cors" });
      status.textContent = `Order request submitted (reference ${orderId}). The endpoint does not return a verifiable receipt to this page, so your cart has been kept. Contact Fadli Sport to confirm that the order was recorded.`;
    } catch (error) {
      console.error("Order submission failed:", error);
      status.textContent = "We could not send your order. Check your connection and try again. Your cart has been kept.";
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = originalText || "Place order"; }
    }
  });
})();
