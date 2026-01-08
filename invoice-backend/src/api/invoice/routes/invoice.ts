export default {
  routes: [
    {
      method: 'GET',
      path: '/invoices',
      handler: 'invoice.find',
    },
    {
      method: 'GET',
      path: '/invoices/:id',
      handler: 'invoice.findOne',
    },
    {
      method: 'POST',
      path: '/invoices',
      handler: 'invoice.create',
    },
    {
      method: 'PUT',
      path: '/invoices/:id',
      handler: 'invoice.update',
    },
    {
      method: 'DELETE',
      path: '/invoices/:id',
      handler: 'invoice.delete',
    },
  ],
};
