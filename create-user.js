#!/usr/bin/env node

/**
 * Create admin user in Strapi
 */

const http = require('http');
const crypto = require('crypto');

const STRAPI_URL = 'http://localhost:1337';

// Simple bcrypt-compatible hash (for development only)
async function hashPassword(password) {
  return new Promise((resolve) => {
    const bcrypt = require('bcryptjs');
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      resolve(hash);
    });
  });
}

function request(method, path, body = null, jwt = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, STRAPI_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const options = {
      method,
      headers,
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

async function createUser() {
  console.log('🔧 Creating admin user...\n');

  try {
    // First, try to register via public endpoint
    console.log('1️⃣  Attempting to register user...');
    const registerRes = await request('POST', '/api/auth/local/register', {
      username: 'admin@acme.com',
      email: 'admin@acme.com',
      password: 'password123',
    });

    if (registerRes.status === 200 || registerRes.status === 201) {
      console.log('✅ User registered successfully!');
      console.log('   Email: admin@acme.com');
      console.log('   Password: password123\n');
      console.log('🎉 You can now login at http://localhost:3000\n');
      return;
    }

    console.log(`   ⚠️  Registration returned: ${registerRes.status}`);
    
    // If registration is forbidden, we need to enable it via Strapi admin
    if (registerRes.status === 403) {
      console.log('\n❌ Public registration is disabled in Strapi.');
      console.log('\nTo fix this, you need to:');
      console.log('1. Open http://localhost:1337/admin in your browser');
      console.log('2. Create an admin account (first user)');
      console.log('3. Go to Settings → Users & Permissions → Advanced Settings');
      console.log('4. Enable "Enable sign-ups"');
      console.log('5. Save and try again\n');
      console.log('OR manually run the seeder:');
      console.log('   cd invoice-backend');
      console.log('   npm run strapi -- seed\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUser();
