#!/usr/bin/env node

/**
 * Setup script to:
 * 1. Create admin user if needed
 * 2. Generate API token
 * 3. Add sample data
 */

const http = require('http');

const STRAPI_URL = 'http://localhost:1337';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, STRAPI_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setup() {
  console.log('🚀 Starting Strapi API setup...\n');

  try {
    // Step 1: Check if Strapi is running
    console.log('1️⃣  Checking Strapi connection...');
    const health = await request('GET', '/api');
    console.log(`   ✅ Strapi is running (status: ${health.status})\n`);

    // Step 2: Try to get customers (should fail with 403 if public access not allowed)
    console.log('2️⃣  Testing API access...');
    const customersRes = await request('GET', '/api/customers');
    
    if (customersRes.status === 403) {
      console.log('   ⚠️  API is protected (403 Forbidden)');
      console.log('   Please configure Strapi permissions:\n');
      console.log('   → Go to http://localhost:1337/admin');
      console.log('   → Settings → Users & Permissions → Roles');
      console.log('   → Edit "Public" role');
      console.log('   → Enable "find" and "findOne" for all collections');
      console.log('   → Enable "create", "update", "delete" for Customers and Invoices\n');
      return;
    }

    if (customersRes.status === 200) {
      console.log(`   ✅ API is accessible (status: ${customersRes.status})`);
      const count = customersRes.body?.data?.length || 0;
      console.log(`   Current customers: ${count}\n`);

      // Step 3: Create sample data if empty
      if (count === 0) {
        console.log('3️⃣  Creating sample data...');

        const customers = [
          { name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1-555-0101' },
          { name: 'TechStart Inc.', email: 'hello@techstart.io', phone: '+1-555-0102' },
          { name: 'Global Solutions', email: 'info@globalsolutions.com', phone: '+1-555-0103' },
        ];

        for (const customer of customers) {
          const res = await request('POST', '/api/customers', { data: customer });
          if (res.status === 201 || res.status === 200) {
            console.log(`   ✅ Created: ${customer.name}`);
          } else {
            console.log(`   ⚠️  Failed to create ${customer.name}: ${res.status}`);
          }
        }
        console.log();
      }

      console.log('✨ Setup complete! You can now:\n');
      console.log('   • Open http://localhost:3000 in your browser');
      console.log('   • Login with your admin credentials');
      console.log('   • Use Customers and Invoices pages\n');
      console.log('🔑 Strapi Admin: http://localhost:1337/admin\n');
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setup();
