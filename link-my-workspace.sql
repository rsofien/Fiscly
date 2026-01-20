-- Link workspace to user ID 2 (contact@devsync-agency.com)

\echo '🔍 Before update:'
SELECT id, name, user_id, user_email FROM workspaces;

\echo ''
\echo '📝 Updating workspace...'
UPDATE workspaces 
SET 
  user_id = 2,
  user_email = 'contact@devsync-agency.com'
WHERE user_id IS NULL OR user_id != 2;

\echo ''
\echo '✅ After update:'
SELECT id, name, user_id, user_email FROM workspaces;

\echo ''
\echo '✅ Workspace successfully linked to user 2!'
