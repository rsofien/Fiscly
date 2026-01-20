const fetch = require('node-fetch');

async function assignWorkspace() {
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
  
  // Get all invoices without workspace
  const invoicesRes = await fetch(`${STRAPI_URL}/api/invoices?populate=*`);
  const invoicesData = await invoicesRes.json();
  const invoices = invoicesData.data;
  
  console.log(`Found ${invoices.length} invoices`);
  
  // Update each invoice
  for (const invoice of invoices) {
    if (!invoice.workspace) {
      console.log(`Updating invoice ${invoice.invoiceNumber}...`);
      await fetch(`${STRAPI_URL}/api/invoices/${invoice.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { workspace: workspaceId }
        })
      });
                                                                      sp                                         mers without workspace
  const customersRes = await fetch  const customersRes = await fe;
  const customersRes = await fetch mersRes.json();
  const customers = customersData.data;
  
  console.log(`Found ${customers.length} customers`);
  
  for (const customer of customers) {
    if (!customer.workspace) {
      console.log(`Updating customer ${customer.name}...`);
      await fetch(`${STRAPI_URL}/api/customers/${customer.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': ' pp        headers: { 'Con          headers: { 'Conte         data: { workspace: workspaceId }
        })
      });
      console.log(`âœ“ Customer ${customer.na      console.log(`âœ“ Customer ${customer.na      console.log(`âl data       console.log(`âœ
);}

assignWorkspace().catch(console.error);
