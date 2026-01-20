const fetch = require('node-fetch');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@acme.com';
const ADMIN_PASSWORD = 'password123';

async function configurePermissions() {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await fetch(`${STRAPI_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login');
    }

    const { data } = await loginResponse.json();
    const token = data.token;
    console.log('âœ“ Logged in successfully');

    // Get public role
    console.log('Fetching public role...');
    const rolesResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
      headers: {
                                                                                                                    const                               ind(role                                   nsole.log                                    e.                                   allo                                   ng up   d per                    onst updateResponse = await fetch(`${STRAPI_U                                                                   'P                    {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/jso        'Content-Type': 'aSON.stringify({
        name: 'Public',
        description: 'Default role given to unauthenticated user.',
        permissions: {
          ...publicRole.permissions,
          'upload': {
            'upload':             'uploa
          },
        },
      }),
    });

    if (u    if (u    if (u    if (u    if (u    œ“ U    if (u    if (u    if (u    if (u    if (u    œ“ U    if (u    if (u    if (u   gu    if (u    i');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

configurePermissions();
