export default {
  routes: [
    {
      method: 'GET',
      path: '/workspaces',
      handler: 'workspace.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/workspaces/:id',
      handler: 'workspace.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/workspaces',
      handler: 'workspace.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/workspaces/:id',
      handler: 'workspace.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/workspaces/:id',
      handler: 'workspace.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
