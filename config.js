/* ===== CONFIGURACIÓN PROINVI =====
   FASE 1 (sitio sin tienda):  TIENDA: false
   FASE 2 (tienda en línea):   TIENDA: true  + llenar las URLs de n8n  */
window.PROINVI = {
  TIENDA: false,

  // Webhooks de n8n (dejar vacío = modo demostración)
  PRODUCTS_URL: "", // GET  -> [{id,sku,name,cat,price,desc,stock}]
  ORDER_URL: "", // POST -> {folio}   (n8n DEBE recalcular precios y generar el folio)
  TRACK_URL: "", // GET ?folio=XXX -> {estado:0..3}
  CONTACT_URL: "", // POST -> {ok:true}

  EMPRESA: {
    nombre: "Proinvi",
    razon: "Proveedora Industrial Virgo, S.A. de C.V.",
    telefono: [
      "+52 (921) 214 5976",
      "+52 (921) 214 2406",
      "+52 (921) 214 1973",
      "+52 (921) 273 1917",
    ],
    email: "gerencia@proinvi.com.mx",
    direccion: [
      "Román Marín No. 1717, Col. Benito Juárez Norte",
      "C.P. 96576, Coatzacoalcos, Ver.",
    ],
    horario: ["Lunes a Viernes: 8:00 a 18:30", "Sábado: 8:30 a 13:00"],
  },
};
