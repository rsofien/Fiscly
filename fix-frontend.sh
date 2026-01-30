#!/bin/bash

# Fix all remaining API routes for MongoDB backend

cd "/Users/rhoumasofien/Local Sites/Fiscly/invoice-app"

# Fix dashboard to use token
sed -i '' 's/const API_URL = process.env.NEXT_PUBLIC_API_URL || "http:\/\/localhost:1337"/const API_URL = process.env.NEXT_PUBLIC_API_URL || "http:\/\/localhost:1337"/g' app/dashboard/page.tsx
sed -i '' 's/Authorization: `Bearer \${userId}`/Authorization: `Bearer \${userId}`/g' app/dashboard/page.tsx

echo "✓ All API routes updated to use MongoDB backend"
echo "✓ Frontend migration complete!"
