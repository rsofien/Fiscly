async function cleanDuplicates() {
  const STRAPI_URL = 'http://localhost:1337';
  
  // Get all invoice items
  const itemsRes = await fetch(`${STRAPI_URL}/api/invoice-items?populate=*`);
  const itemsData = await itemsRes.json();
  const items = itemsData.data || [];
  
  console.log(`Found ${items.length} invoice items total`);
  
  // Group by invoice
  const itemsByInvoice = {};
  for (const item of items) {
    const invoiceId = item.invoice?.id || 'none';
    if (!itemsByInvoice[invoiceId]) {
      itemsByInvoice[invoiceId] = [];
    }
    itemsByInvoice[invoiceId].push(item);
  }
  
  // For each invoice with duplicates, keep only the first item
  for (const [invoiceId, invoiceItems] of Object.entries(itemsByInvoice)) {
    if (invoiceId === 'none') continue;
    
    console.log(`\nInvoice ${invoiceId} has ${invoiceItems.length} items`);
    
    if (invoiceItems.length > 1) {
      // Keep the first item, delete the rest
      for (let i = 1; i < invoiceItems.length; i++) {
        const item = invoiceItems[i];
        console.log(`  Deleting duplicate item: ${item.description}`);
        await fetch(`${STRAPI_URL}/api/invoice-items/${item.documentId}`, {
          method: 'DELETE',
        });
      }
      console.log(`  ✓ Kept 1 item, deleted ${invoiceItems.length - 1} duplicates`);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
}

cleanDuplicates().catch(console.error);
