# Fadli Sport

A static front-end storefront for sports nutrition and supplements, built with HTML, CSS, and vanilla JavaScript.

## Run locally

Because the product catalog is loaded with `fetch()`, use a local static server rather than opening HTML files directly with `file://`.

- VS Code: install/use **Live Server**, then open `index.html` with Live Server.
- Python: from this folder run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push the contents of this folder to the repository's default branch.
2. In GitHub, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose the default branch and `/ (root)`.
4. Save and wait for the deployment workflow to finish.

The root `index.html` is the GitHub Pages entry point. The older pages remain available under `pages/`.

## Current features

- Product catalog from `js/products.json`.
- Home-page product groups and sale badges.
- Cart persisted in browser `localStorage`, with quantity controls and removal.
- Favorites persisted in browser `localStorage`.
- Product search across rendered product cards.
- Country selection persisted locally.
- Checkout form connected to the existing Google Apps Script endpoint.

## Important limitations before accepting real orders

This is a static front-end project. Cart values and totals are controlled by the browser and must **not** be treated as trusted payment/order data. Before using this store for real transactions, validate prices and quantities on a trusted server and confirm that the Google Apps Script endpoint validates submissions and returns a verifiable order status. The current client cannot reliably verify a successful write through a `no-cors` request, so it keeps the cart and clearly tells the customer that the request was sent but not verified.

The login page is a front-end mockup unless a real authentication service is configured. Do not collect real passwords through a static demo form.

## Checks performed

- JSON parsed successfully and product IDs were checked for uniqueness.
- JavaScript files were syntax-checked with Node.js.
- Local static paths were checked against files in the project.
- Browser-level visual, mobile, and end-to-end order tests still need to be run after deployment.


## Favorites and navigation updates
- Favorites are stored in the visitor browser using `localStorage`; the favorites page is `pages/favorites.html`.
- The country selector currently offers Syria, Jordan, Egypt, and Lebanon. It is a display preference only and does not calculate shipping or change currency.
- Rotating sports tips are informational and should not be treated as individualized medical advice.
