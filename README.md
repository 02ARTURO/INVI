# INVI (Proinvi)

Static storefront site for **Proinvi** (Proveedora Industrial Virgo, S.A. de C.V.), an industrial valve supplier. Pure HTML/CSS/JS — no framework, no build step, no backend of its own.

> Detailed documentation in Spanish lives in [`LEEME.md`](LEEME.md).

## Run locally

No build tools required. Serve the folder with any static server, e.g.:

```bash
python3 -m http.server
```

Then open http://localhost:8000. (This repo is also served directly by Laragon from `invi.com/INVI`.)

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: 3D/video hero of a valve, scrolling banner, 10 product lines, stats, about, CTA to request a quote |
| `producto.html?c=<line>` | Single template for all 10 product lines, populated from `data.js` |
| `quienes-somos.html` | Company description, mission/vision flip cards, advantages |
| `contacto.html` | Quote request form + contact info and business hours |
| `tienda.html` | Phase 2 only: catalog, cart, checkout, order tracking — redirects to home while Phase 1 is active |

## Key files

| File | Role |
|---|---|
| `config.js` | **The only file to edit for configuration**: phase switch (`TIENDA`), n8n webhook URLs, company contact data |
| `data.js` | Copy and images for the 10 product lines |
| `app.js` | Navigation (with product dropdown), footer, effects, home/product/contact page logic |
| `tienda.js` | Phase 2 cart/checkout/tracking logic (only loads when `TIENDA: true`) |
| `herovideo.js` + `media/` | Home hero: rotating valve video, draggable 360° control |
| `hero3d.js` | Fallback: Three.js-rendered 3D valve, used only if the video fails to load |
| `style.css` | All styling |
| `vendor/three.min.js` | Local copy of Three.js (no external dependency) |
| `images/` | Optimized photos from the previous site + logos |

## Phases

- **Phase 1 (current):** `TIENDA: false` in `config.js`. No cart or prices — everything leads to "Request a quote".
- **Phase 2:** Set `TIENDA: true` and fill in the n8n webhook URLs in `config.js`:
  - `PRODUCTS_URL` (GET) → `[{id, sku, name, cat, price, desc, stock}]`
  - `ORDER_URL` (POST `{cliente, items:[{id, qty}]}`) → `{folio}` — n8n must recompute prices and generate the order number
  - `TRACK_URL` (GET `?folio=`) → `{estado: 0..3}`
  - `CONTACT_URL` (POST, contact form) → `200`
  - CORS must be enabled on the webhooks. Card payments / Mercado Pago are not yet wired up.
  - Without URLs configured, the site runs in a visible demo mode.

The contact form posts JSON to `CONTACT_URL` (an n8n webhook), which emails it via n8n's Send Email node.
