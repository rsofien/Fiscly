const fetch = require('node-fetch');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@acme.com';
const ADMIN_PASSWORD = 'password123';

async function createAPIToken() {
  try {
    // Login
    console.log('Logging in...');
    const loginResponse = await fetch(`${STRAPI_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const { data } = await loginResponse.json();
    const adminToken = data.token;
    console.log('✓ Logged in');

    // Create API token
    console.log('Creating API token...');
    const tokenResponse = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '        name: '        name: '        name: '        name: '        name: '        name: '       -a        name: '        name: '                name: '        name: '        namit         name: '        name: st apiTok        name: '        name: '                 name: '        name: 'crea     ucc   fully!');
        name: '        name:to you        name: '        name:to you        name: '        name:to yo=$        name: '      }        name: '        name:to you        name: '  ;
  }
}

createAPIToken();
