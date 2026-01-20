const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'fiscly_invoices',
  user: 'postgres',
  password: '',
});

async function linkWorkspace() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const before = await client.query('SELECT id, name, user_id, user_email FROM workspaces');
    console.log('🔍 Current workspaces:');
    console.table(before.rows);

    console.log('\n📝 Updating workspace to user 2 (contact@devsync-agency.com)...');
    const result = await client.query(
      `UPDATE workspaces 
       SET user_id = $1, user_email = $2 
       WHERE user_id IS NULL OR user_id != $1
       RETURNING *`,
      [2, 'contact@devsync-agency.com']
    );

    const after = await client.query('SELECT id, name, user_id, user_email FROM workspaces');
    console.log('\n✅ After update:');
    console.table(after.rows);

    console.log(`\n✅ Success! Updated ${result.rowCount} workspace(s)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

linkWorkspace();
