const http = require('http');

const adminData = {
  username: 'admin',
  email: 'admin@acme.com',
  password: 'password123',
};

const postData = JSON.stringify(adminData);

const options = {
  hostname: 'localhost',
  port: 1337,
  path: '/api/auth/local/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✓ User created successfully!');
        console.log('Email: admin@acme.com');
        console.log('Password: password123');
        console.log('\nLogin at: http://localhost:3000');
      } else {
        console.log('Response:', response);
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  console.log('Make sure Strapi is running on http://localhost:1337');
});

req.write(postData);
req.end();
