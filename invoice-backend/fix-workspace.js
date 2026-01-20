async function fixWorkspace() {
  const STRAPI_URL = 'http://localhost:1337';
  
  // Get all workspaces
  const workspacesRes = await fetch(`${STRAPI_URL}/api/workspaces`);
  const workspacesData = await workspacesRes.json();
  const workspaces = workspacesData.data;
  
  if (workspaces.length === 0) {
    console.log('No workspaces found');
    return;
  }
  
  const workspaceId = workspaces[0].id;
  console.log(`Using workspace ID: ${workspaceId}`);
  
  // Get all invoices
  const invoicesRes = await fetch(`${STRAPI_URL}/api/invoices?populate=*`);
  const invoicesData = await invoicesRes.json();
  const invoices = invoicesData.data;
  
  console.log(`Found ${invoices.length} invoices total`);
  
  // Update each invoice that has no workspace
  for (const invoice of invoices) {
    if (!invoice.workspace) {
      console.log(`Linking invoice ${invoice.invoiceNumber} to workspace...`);
      const updateRes = await fetch(`${STRAPI_URL}/api/invoices/${invoice.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { workspace: workspaceId }
        })
      });
      if (updateRes.ok) {
        console.log(`✓ Invoice ${invoice.invoiceNumber} linked`);
      } else {
        console.error(`✗ Failed to link invoice ${invoice.invoiceNumber}`);
      }
    }
  }
  
  // Get all customers
  const customersRes = await fetch(`${STRAPI_URL}/api/customers`);
  const customersData = await customersRes.json();
  const customers = customersData.data;
  
  console.log(`Found ${customers.length} customers total`);
  
  for (const customer of customers) {
    if (!customer.workspace) {
      console.log(`Linking customer ${customer.name} to workspace...`);
      const updateRes = await fetch(`${STRAPI_URL}/api/customers/${customer.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { workspace: workspaceId }
        })
      });
      if (updateRes.ok) {
        console.log(`✓ Customer ${customer.name} linked`);
      } else {
        console.error(`✗ Failed to link customer ${customer.name}`);
      }
    }
  }
  
  console.log('\n✅ Done! Refresh your dashboard.');
}

fixWorkspace().catch(console.error);
