// Debug script to check invoice dates in MongoDB
import mongoose from "mongoose"

const checkInvoices = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/fiscly"
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")
    
    // Get the Invoice collection
    const db = mongoose.connection.db
    const collection = db.collection("invoices")
    
    // Find all invoices
    const invoices = await collection.find({}).toArray()
    
    console.log(`\nFound ${invoices.length} invoices:\n`)
    
    invoices.forEach(inv => {
      console.log(`Invoice: ${inv.invoiceNumber}`)
      console.log(`  issueDate value: ${inv.issueDate}`)
      console.log(`  issueDate type: ${typeof inv.issueDate}`)
      console.log(`  issueDate instanceof Date: ${inv.issueDate instanceof Date}`)
      if (inv.issueDate) {
        const date = new Date(inv.issueDate)
        console.log(`  Parsed year: ${date.getFullYear()}`)
        console.log(`  Parsed month: ${date.getMonth() + 1}`)
        console.log(`  Parsed day: ${date.getDate()}`)
      }
      console.log("")
    })
    
    // Test the query
    console.log("\n--- Testing 2026 filter query ---")
    const startOf2026 = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0))
    const endOf2026 = new Date(Date.UTC(2027, 0, 1, 0, 0, 0, 0))
    
    console.log("Start:", startOf2026.toISOString())
    console.log("End:", endOf2026.toISOString())
    
    const filtered = await collection.find({
      issueDate: { $gte: startOf2026, $lt: endOf2026 }
    }).toArray()
    
    console.log(`\nFilter returned ${filtered.length} invoices:`)
    filtered.forEach(inv => {
      console.log(`  - ${inv.invoiceNumber}: ${inv.issueDate}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

checkInvoices()
