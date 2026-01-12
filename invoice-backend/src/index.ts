import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Enable public access to auth endpoints
    console.log('🔧 Configuring API permissions...');

    setTimeout(async () => {
      try {
        const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'public' },
        });

        if (!publicRole) {
          console.log('❌ Public role not found');
          return;
        }

        // Delete existing permissions for public role
        await strapi.db.query('plugin::users-permissions.permission').deleteMany({
          where: { role: publicRole.id },
        });

        // API routes to enable
        const apis = ['customer', 'invoice', 'invoice-item', 'workspace'];
        const actions = ['find', 'findOne', 'create', 'update', 'delete'];

        for (const api of apis) {
          for (const action of actions) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: `api::${api}.${api}.${action}`,
                role: publicRole.id,
              },
            });
          }
        }

        // Enable auth endpoints for public
        const authActions = [
          'plugin::users-permissions.auth.callback',
          'plugin::users-permissions.auth.connect',
          'plugin::users-permissions.auth.register',
          'plugin::users-permissions.user.me',
        ];

        for (const action of authActions) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: action,
              role: publicRole.id,
            },
          });
        }

        console.log('✅ API permissions configured successfully');
        console.log(`   Enabled ${actions.length} actions for ${apis.length} APIs`);
      } catch (error) {
        console.error('❌ Failed to configure permissions:', error.message);
      }
    }, 1000);
  },
};
