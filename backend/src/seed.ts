import { Workspace } from "./models/workspace.js"
import { User } from "./models/user.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@fiscly.local" })
    
    if (existingAdmin) {
      console.log("✓ Admin user already exists")
      return
    }

    // Create admin user
    const adminPassword = `Fiscly${Math.random().toString(36).substring(2, 10)}!`
    const adminUser = await User.create({
      email: "admin@fiscly.local",
      password: adminPassword,
      name: "Admin",
      role: "admin",
    })

    console.log("✓ Admin user created successfully")

    // Create admin workspace
    await Workspace.create({
      user_id: adminUser._id.toString(),
      user_email: adminUser.email,
      name: "Fiscly Admin",
      email: "billing@fiscly.local",
      address: "123 Business Street\nSuite 100\nSan Francisco, CA 94105",
      phone: "+1 (555) 000-0000",
      invoicePrefix: "INV",
      defaultPaymentTerms: 15,
      defaultNotes: "Thank you for your business!",
    })

    console.log("✓ Admin workspace created")

    // Write credentials to file (git-ignored)
    const credentialsPath = path.join(__dirname, "../.local-admin-creds.txt")
    const credentials = `
╔═══════════════════════════════════════════════════════════════╗
║                  FISCLY ADMIN CREDENTIALS                      ║
║                     (AUTO-GENERATED)                           ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Email:    admin@fiscly.local                                 ║
║  Password: ${adminPassword.padEnd(44)} ║
║                                                                ║
║  ⚠️  IMPORTANT: Save these credentials securely!               ║
║  This file will not be committed to git.                      ║
║                                                                ║
║  Created: ${new Date().toISOString().padEnd(44)} ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
`
    fs.writeFileSync(credentialsPath, credentials, "utf-8")
    
    console.log("✓ Admin credentials written to .local-admin-creds.txt")
    console.log("\n" + credentials)
  } catch (error) {
    console.error("✗ Bootstrap error:", error)
  }
}
