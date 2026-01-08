import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <AppLayout user={session.user}>
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
                  defaultValue={session.user.workspaceName || ""}
                  placeholder="My Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-email">Workspace Email</Label>
                <Input
                  id="workspace-email"
                  type="email"
                  placeholder="billing@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-address">Address</Label>
                <Textarea
                  id="workspace-address"
                  placeholder="123 Business St, Suite 100&#10;San Francisco, CA 94105"
                  rows={3}
                />
              </div>
              <Button>Save Changes</Button>
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
                <Input id="name" defaultValue={session.user.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={session.user.email} disabled />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed after registration
                </p>
              </div>
              <Button>Update Profile</Button>
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
                <Input id="invoice-prefix" defaultValue="INV" placeholder="INV" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms (days)</Label>
                <Input id="payment-terms" type="number" defaultValue="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-notes">Default Invoice Notes</Label>
                <Textarea
                  id="invoice-notes"
                  placeholder="Thank you for your business!"
                  rows={3}
                />
              </div>
              <Button>Save Settings</Button>
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
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
