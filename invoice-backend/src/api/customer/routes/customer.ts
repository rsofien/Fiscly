export default {
  routes: [
    {
      method: 'GET',
      path: '/customers',
      handler: 'customer.find',
    },
    {
      method: 'GET',
      path: '/customers/:id',
      handler: 'customer.findOne',
    },
    {
      method: 'POST',
      path: '/customers',
      handler: 'customer.create',
    },
    {
      method: 'PUT',
      path: '/customers/:id',
      handler: 'customer.update',
    },
    {
      method: 'DELETE',
      path: '/customers/:id',
      handler: 'customer.delete',
    },
  ],
};
