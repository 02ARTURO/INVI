/* ===== CONFIGURACIÓN PROINVI =====
   FASE 1 (sitio sin tienda):  TIENDA: false
   FASE 2 (tienda en línea):   TIENDA: true  + llenar las URLs de n8n  */
window.PROINVI = {
  TIENDA: false,

  // Webhooks de n8n (dejar vacío = modo demostración)
  PRODUCTS_URL: '',  // GET  -> [{id,sku,name,cat,price,desc,stock}]
  ORDER_URL:    '',  // POST -> {folio}   (n8n DEBE recalcular precios y generar el folio)
  TRACK_URL:    '',  // GET ?folio=XXX -> {estado:0..3}
  CONTACT_URL:  'https://formsubmit.co/ajax/Daniel@proinvi.com.mx', // FormSubmit AJAX reenvía las solicitudes al correo

  EMPRESA: {
    nombre: 'Proinvi',
    razon: 'Proveedora Industrial Virgo, S.A. de C.V.',
    telefono: '',   // por definir
    email: 'Daniel@proinvi.com.mx',
    direccion: '',  // por definir
    horario: ''     // por definir
  }
};
