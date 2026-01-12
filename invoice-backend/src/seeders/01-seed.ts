const bcrypt = require('bcryptjs');

module.exports = {
  /**
   * An asynchronous run function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to seed your database.
   */

  async run({ strapi }) {
    const isFirstRun = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    if (isFirstRun) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    try {
      // Create authenticated role first
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Authenticated',
          description: 'Default role given to authenticated user',
          type: 'authenticated',
        },
      });

      // Create public role
      const publicRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Public',
          description: 'Default role given to unauthenticated user',
          type: 'public',
        },
      });

      // Set up permissions for public role
      const permissionsToGrant = [
        'find', 'findOne', 'create', 'update', 'delete'
      ];
      
      for (const action of permissionsToGrant) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::customer.customer.${action}`,
            role: { connect: [{ id: publicRole.id }] },
          },
        });
        
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::invoice.invoice.${action}`,
            role: { connect: [{ id: publicRole.id }] },
          },
        });
        
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::invoice-item.invoice-item.${action}`,
            role: { connect: [{ id: publicRole.id }] },
          },
        });
      }

      // Create sample workspace
      const workspace = await strapi.query('api::workspace.workspace').create({
        data: {
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          address: '123 Business St, Suite 100\nSan Francisco, CA 94105',
          phone: '+1-555-123-4567',
          taxId: '12-3456789',
          invoicePrefix: 'INV',
          defaultPaymentTerms: 15,
          defaultNotes: 'Thank you for your business!',
        },
      });

      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create sample user
      const user = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'admin@acme.com',
          email: 'admin@acme.com',
          password: hashedPassword,
          name: 'John Doe',
          confirmed: true,
          blocked: false,
          workspace: { connect: [{ id: workspace.id }] },
          role: { connect: [{ id: authenticatedRole.id }] },
        },
      });

      // Create sample customers
      const customers = await Promise.all([
        strapi.query('api::customer.customer').create({
          data: {
            name: 'Tech Startup Inc',
            email: 'contact@techstartup.com',
            phone: '+1-555-234-5678',
            company: 'Tech Startup Inc',
            status: 'active',
            workspace: { connect: [{ id: workspace.id }] },
          },
        }),
        strapi.query('api::customer.customer').create({
          data: {
            name: 'Global Solutions Ltd',
            email: 'info@globalsolutions.com',
            phone: '+1-555-345-6789',
            company: 'Global Solutions Ltd',
            status: 'active',
            workspace: { connect: [{ id: workspace.id }] },
          },
        }),
        strapi.query('api::customer.customer').create({
          data: {
            name: 'Digital Ventures LLC',
            email: 'hello@digitalventures.com',
            phone: '+1-555-456-7890',
            company: 'Digital Ventures LLC',
            status: 'inactive',
            workspace: { connect: [{ id: workspace.id }] },
          },
        }),
      ]);

      // Create sample invoices with items
      const invoices = await Promise.all([
        strapi.query('api::invoice.invoice').create({
          data: {
            invoiceNumber: 'INV-2024-001',
            customer: { connect: [{ id: customers[0].id }] },
            workspace: { connect: [{ id: workspace.id }] },
            issueDate: '2024-01-15',
            dueDate: '2024-01-30',
            amount: 2500.0,
            status: 'paid',
            description: 'Web Development Services',
            paymentMethod: 'bank_transfer',
            paidDate: '2024-01-28',
          },
        }),
        strapi.query('api::invoice.invoice').create({
          data: {
            invoiceNumber: 'INV-2024-002',
            customer: { connect: [{ id: customers[1].id }] },
            workspace: { connect: [{ id: workspace.id }] },
            issueDate: '2024-02-01',
            dueDate: '2024-02-20',
            amount: 3200.0,
            status: 'sent',
            description: 'Consulting Services - February',
            paymentMethod: 'bank_transfer',
          },
        }),
        strapi.query('api::invoice.invoice').create({
          data: {
            invoiceNumber: 'INV-2024-003',
            customer: { connect: [{ id: customers[0].id }] },
            workspace: { connect: [{ id: workspace.id }] },
            issueDate: '2024-02-10',
            dueDate: '2024-02-25',
            amount: 1800.0,
            status: 'draft',
            description: 'Design Services - Logo & Branding',
            paymentMethod: 'card',
          },
        }),
      ]);

      // Create invoice items for first invoice
      await Promise.all([
        strapi.query('api::invoice-item.invoice-item').create({
          data: {
            description: 'Frontend Development - 40 hours',
            quantity: 40,
            unitPrice: 50,
            total: 2000,
            invoice: { connect: [{ id: invoices[0].id }] },
          },
        }),
        strapi.query('api::invoice-item.invoice-item').create({
          data: {
            description: 'Backend Development - 10 hours',
            quantity: 10,
            unitPrice: 50,
            total: 500,
            invoice: { connect: [{ id: invoices[0].id }] },
          },
        }),
        strapi.query('api::invoice-item.invoice-item').create({
          data: {
            description: 'Business Strategy Consultation - 8 hours',
            quantity: 8,
            unitPrice: 400,
            total: 3200,
            invoice: { connect: [{ id: invoices[1].id }] },
          },
        }),
        strapi.query('api::invoice-item.invoice-item').create({
          data: {
            description: 'Logo Design',
            quantity: 1,
            unitPrice: 1200,
            total: 1200,
            invoice: { connect: [{ id: invoices[2].id }] },
          },
        }),
        strapi.query('api::invoice-item.invoice-item').create({
          data: {
            description: 'Brand Guidelines Document',
            quantity: 1,
            unitPrice: 600,
            total: 600,
            invoice: { connect: [{ id: invoices[2].id }] },
          },
        }),
      ]);

      console.log('Database seeded successfully!');
      console.log('\n--- Seed Data Created ---');
      console.log(`Workspace: ${workspace.name}`);
      console.log(`User: ${user.email} (password: password123)`);
      console.log(`Customers: ${customers.length}`);
      console.log(`Invoices: ${invoices.length}`);
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  },
};
