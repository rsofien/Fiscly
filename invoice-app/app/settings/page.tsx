"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceEmail, setWorkspaceEmail] = useState("")
  const [workspaceAddress, setWorkspaceAddress] = useState("")
  const [userName, setUserName] = useState("")
  const [invoicePrefix, setInvoicePrefix] = useState("INV")
  const [paymentTerms, setPaymentTerms] = useState("15")
  const [invoiceNotes, setInvoiceNotes] = useState("")

  const handleSaveWorkspace = () => {
    alert("Workspace settings saved successfully!")
  }

  const handleUpdateProfile = () => {
    alert("Profile updated successfully!")
  }

  const handleSaveInvoiceSettings = () => {
    alert("Invoice settings saved successfully!")
  }

  const handleDeleteWorkspace = () => {
    if (confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      alert("Workspace deletion feature will be implemented soon.")
    }
  }

  return (
    <AppLayout user={{ email: "user@example.com", name: "User" }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your workspace and preferences</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
              <CardDescription>Update your workspace details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-email">Workspace Email</Label>
                <Input
                  id="workspace-email"
                  type="email"
                  value={workspaceEmail}
                  onChange={(e) => setWorkspaceEmail(e.target.value)}
                  placeholder="billing@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-address">Address</Label>
                <Textarea
                  id="workspace-address"
                  value={workspaceAddress}
                  onChange={(e) => setWorkspaceAddress(e.target.value)}
                  placeholder="123 Business St, Suite 100&#10;San Francisco, CA 94105"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveWorkspace}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value="user@example.com" disabled />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed after registration
                </p>
              </div>
              <Button onClick={handleUpdateProfile}>Update Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure invoice defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
                <Input 
                  id="invoice-prefix" 
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="INV" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms (days)</Label>
                <Input 
                  id="payment-terms" 
                  type="number" 
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-notes">Default Invoice Notes</Label>
                <Textarea
                  id="invoice-notes"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Thank you for your business!"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveInvoiceSettings}>Save Settings</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Delete Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all associated data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteWorkspace}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
