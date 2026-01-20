-- SQL script to link existing workspaces to users
-- Run this with: psql -d fiscly_invoices -f link-workspaces-sql.sql

-- First, let's see what we have
\echo '🔍 Current workspaces:'
SELECT id, name, email, user_id, user_email FROM workspaces;

\echo ''
\echo '🔍 Available users:'
SELECT id, email, username FROM up_users;

\echo ''
\echo '📝 Linking workspaces to users...'

-- Link each workspace to the first user (or you can adjust this logic)
UPDATE workspaces 
SET 
  user_id = (SELECT id FROM up_users LIMIT 1),
  user_email = (SELECT email FROM up_users LIMIT 1)
WHERE user_id IS NULL;

\echo ''
\echo '✅ Updated workspaces:'
SELECT id, name, email, user_id, user_email FROM workspaces;

\echo ''
\echo '✅ Migration complete!'
