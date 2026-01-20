// Script to link existing workspaces to their respective users
// Run this after updating the workspace schema to include user_id and user_email fields

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const headers = {
  'Content-Type': 'application/json'
};

if (STRAPI_API_TOKEN) {
  headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  console.log('✅ Using API token for authentication');
} else {
  console.log('⚠️  No API token provided, using public API access');
}

async function linkWorkspacesToUsers() {
  try {
    console.log('🔍 Fetching all users...');
    const usersResponse = await fetch(`${STRAPI_URL}/api/users`, { headers });
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`);
    }
    
    const users = await usersResponse.json();
    console.log(`✅ Found ${users.length} users`);

    console.log('\n🔍 Fetching all workspaces...');
    const workspacesResponse = await fetch(`${STRAPI_URL}/api/workspaces`, { headers });
    
    if (!workspacesResponse.ok) {
      throw new Error(`Failed to fetch workspaces: ${workspacesResponse.status}`);
    }
    
    const workspacesData = await workspacesResponse.json();
    const workspaces = workspacesData.data || [];
    console.log(`✅ Found ${workspaces.length} workspaces`);

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create at least one user first.');
      return;
    }

    if (workspaces.length === 0) {
      console.log('✅ No workspaces to link.');
      return;
    }

    // Strategy: Link each workspace to a user
    // If there's only one user, link all workspaces to that user
    // If multiple users, try to match by email or just distribute

    console.log('\n📝 Linking workspaces to users...');
    
    for (const workspace of workspaces) {
      // Skip if already has user_id
      if (workspace.user_id) {
        console.log(`⏭️  Workspace "${workspace.name}" (ID: ${workspace.id}) already linked to user ${workspace.user_id}`);
        continue;
      }

      let matchedUser = null;

      // Try to match by email
      if (workspace.email) {
        matchedUser = users.find(u => u.email === workspace.email);
      }

      // If no email match, use first user (for single-user scenario)
      if (!matchedUser && users.length === 1) {
        matchedUser = users[0];
      }

      // If still no match and multiple users, prompt or assign to first
      if (!matchedUser) {
        console.log(`⚠️  Cannot automatically match workspace "${workspace.name}" (ID: ${workspace.id})`);
        console.log(`   Assigning to first user: ${users[0].email}`);
        matchedUser = users[0];
      }

      // Update workspace with user_id and user_email
      const updateData = {
        data: {
          user_id: matchedUser.id,
          user_email: matchedUser.email
        }
      };

      const updateResponse = await fetch(`${STRAPI_URL}/api/workspaces/${workspace.documentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`❌ Failed to update workspace ${workspace.id}:`, errorText);
        continue;
      }

      console.log(`✅ Linked workspace "${workspace.name}" (ID: ${workspace.id}) to user ${matchedUser.email} (User ID: ${matchedUser.id})`);
    }

    console.log('\n✅ Workspace-user linking complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
linkWorkspacesToUsers();
