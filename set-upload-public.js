const fetch = require('node-fetch');

async function setUploadPublic() {
  const STRAPI_URL = 'http://localhost:1337';
  
  console.log('This script needs your Strapi admin credentials to make upload public.');
  console.log('Please go to: http://localhost:1337/admin/settings/users-permissions/roles');
  console.log('1. Click on "Public" role');
  console.log('2. Scroll to "Upload" section');  
  console.log('3. Check the "upload" checkbox');
  console.log('4. Click Save');
  console.log('\nThis will allow logo uploads without authentication.');
}

setUploadPublic();
