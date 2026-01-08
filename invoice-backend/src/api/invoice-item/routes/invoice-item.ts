export default {
  routes: [
    {
      method: 'GET',
      path: '/invoice-items',
      handler: 'invoice-item.find',
    },
    {
      method: 'GET',
      path: '/invoice-items/:id',
      handler: 'invoice-item.findOne',
    },
    {
      method: 'POST',
      path: '/invoice-items',
      handler: 'invoice-item.create',
    },
    {
      method: 'PUT',
      path: '/invoice-items/:id',
      handler: 'invoice-item.update',
    },
    {
      method: 'DELETE',
      path: '/invoice-items/:id',
      handler: 'invoice-item.delete',
    },
  ],
};
