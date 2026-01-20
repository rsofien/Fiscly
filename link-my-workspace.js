// Direct database update to link workspace to user
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'fiscly_invoices',
  user: 'postgres',
  password: '', // Update if you have a password
});

async function linkWorkspace() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check current state
    console.log('\n🔍 Current workspaces:');
    const before = await client.query('SELECT id, name, user_id, user_email FROM workspaces');
    console.table(before.rows);

    // Update workspace
    console.log('\n📝 Updating workspace...');
    const result = await client.query(
      `UPDATE workspaces 
       SET user_id = $1, user_email = $2 
       WHERE user_id IS NULL OR user_id != $1
       RETURNING *`,
      [2, 'contact@devsync-agency.com']
    );

    console.log('\n✅ Updated workspaces:');
    const after = await client.query('SELECT id, name, user_id, user_email FROM workspaces');
    console.table(after.rows);

    console.log('\n✅ Workspace successfully linked to user 2!');
    console.log(`   Affected rows: ${result.rowCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

linkWorkspace();
