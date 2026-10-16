/* ===== CONFIGURACIÓN PROINVI =====
   FASE 1 (sitio sin tienda):  TIENDA: false
   FASE 2 (tienda en línea):   TIENDA: true  + llenar las URLs de n8n  */
window.PROINVI = {
  TIENDA: false,

  // Webhooks de n8n (dejar vacío = modo demostración)
  PRODUCTS_URL: '',  // GET  -> [{id,sku,name,cat,price,desc,stock}]
  ORDER_URL:    '',  // POST -> {folio}   (n8n DEBE recalcular precios y generar el folio)
  TRACK_URL:    '',  // GET ?folio=XXX -> {estado:0..3}
  CONTACT_URL:  'https://formsubmit.co/ajax/gerencia@proinvi.com.mx', // FormSubmit AJAX reenvía las solicitudes al correo

  EMPRESA: {
    nombre: 'Proinvi',
    razon: 'Proveedora Industrial Virgo, S.A. de C.V.',
    telefonos: ['921-214-59-76', '921-214-24-06', '921-214-19-73'],
    email: 'gerencia@proinvi.com.mx',
    direccion: 'Román Marín No. 1717, Col. Benito Juárez Norte, C.P. 96576, Coatzacoalcos, Ver.',
    horario: 'Lunes a viernes: 8:00 a. m. a 6:30 p. m. · Sábado: 8:30 a. m. a 1:00 p. m.'
  }
};
