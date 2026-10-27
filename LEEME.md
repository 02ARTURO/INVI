# Sitio Proinvi — cómo está hecho

Sitio estático (HTML + CSS + JavaScript puro). Sin WordPress, sin base de datos propia, sin compilar nada.
Se sube tal cual a cualquier hosting. Para probarlo local: `python3 -m http.server` y abrir http://localhost:8000

## Páginas
| Archivo | Qué es |
|---|---|
| `index.html` | Inicio: hero con brida 3D, letrero corredizo, 10 líneas de producto, cifras, quiénes somos, ventajas, llamada a cotizar (y pasos de compra en Fase 2) |
| `producto.html?c=<línea>` | UNA sola plantilla para las 10 líneas (galería, especificaciones, lista). Se llena con `data.js` |
| `quienes-somos.html` | Descripción, misión y visión (tarjetas que voltean), ventajas |
| `contacto.html` | Formulario de cotización + datos de contacto y horario |
| `tienda.html` | Fase 2: catálogo, carrito, orden de compra y seguimiento. En Fase 1 redirige al inicio |

## Archivos
| Archivo | Para qué |
|---|---|
| `config.js` | **El único que se toca para operar**: interruptor de fase (`TIENDA`), URLs de n8n y datos de la empresa (teléfonos, correo, dirección, horario) |
| `data.js` | Texto y fotos de las 10 líneas de producto |
| `app.js` | Menú (con desplegable de productos), pie de página, efectos, páginas de inicio / producto / contacto |
| `tienda.js` | Fase 2: carrito, orden de compra, seguimiento (solo carga si `TIENDA: true`) |
| `herovideo.js` + `media/` | Pieza del inicio: video giratorio de la válvula (`valvula-giro.mp4/.webm`). Gira sola; al arrastrar se controla el giro 360° |
| `hero3d.js` | Respaldo: válvula 3D hecha por código (Three.js). Solo se activa si el video no carga |
| `style.css` | Todo el diseño |
| `vendor/three.min.js` | Librería 3D (local, no depende de internet) |
| `images/` | Fotos optimizadas del sitio anterior + logos |

## Fases
- **Fase 1 (hoy):** `TIENDA: false`. Sin carrito ni precios; todo lleva a "Solicitar cotización".
- **Fase 2:** `TIENDA: true` y llenar en `config.js` las URLs de n8n:
  - `PRODUCTS_URL` GET → `[{id,sku,name,cat,price,desc,stock}]`
  - `ORDER_URL` POST `{cliente,items:[{id,qty}]}` → `{folio}` (n8n DEBE recalcular precios y crear el folio)
  - `TRACK_URL` GET `?folio=` → `{estado:0..3}`
  - `CONTACT_URL` POST (formulario de contacto) → 200
  - Activar CORS en los webhooks. Los pagos con tarjeta / Mercado Pago aún no están conectados.
  - Sin URLs, todo corre en modo demostración con aviso visible.

## Contacto → correo
El formulario manda un JSON a `CONTACT_URL` (webhook de n8n). n8n lo envía por correo con el nodo Send Email (SMTP).
