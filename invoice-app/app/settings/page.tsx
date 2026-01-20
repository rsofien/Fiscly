"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

type Workspace = {
  id: string
  documentId: string
  name: string
  email: string
  address: string
  phone: string
  invoicePrefix: string
  defaultPaymentTerms: number
  defaultNotes: string
  matriculeFiscale: string
  logo?: {
    id: string
    url: string
    name: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [workspace, setWorkspace] = useState<Partial<Workspace>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedLogoId, setUploadedLogoId] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkspace()
  }, [])

  const fetchWorkspace = async () => {
    try {
      const response = await fetch("/api/workspace")
      if (response.ok) {
        const data = await response.json()
        setWorkspace(data)
        if (data.logo?.url) {
          const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
          const fullUrl = data.logo.url.startsWith('http') ? data.logo.url : `${STRAPI_URL}${data.logo.url}`
          setLogoPreview(fullUrl)
          setUploadedLogoId(data.logo.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!selectedFile) return null
    console.log('========== CLIENT UPLOAD START (DIRECT TO STRAPI) ==========')
    console.log('File to upload:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size
    })

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", selectedFile) // Strapi expects "files" not "file"
      console.log('Uploading directly to Strapi...')

      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
      const response = await fetch(`${STRAPI_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })

      console.log('Upload response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (response.ok) {
        const uploadedFiles = await response.json()
        const uploaded = uploadedFiles[0]
        console.log('Upload successful:', uploaded)
        console.log('========== CLIENT UPLOAD SUCCESS ==========')
        setUploadedLogoId(uploaded.id)
        setSelectedFile(null)
        return uploaded.id.toString()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Upload failed:', {
          status: response.status,
          error: errorData
        })
        console.log('========== CLIENT UPLOAD FAILED ==========')
        alert(`Failed to upload logo: ${JSON.stringify(errorData)}`)
        return null
      }
    } catch (error) {
      console.error('========== CLIENT UPLOAD ERROR ==========', error)
      alert("Failed to upload logo")
      return null
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSaveWorkspace = async () => {
    if (!workspace.name) {
      alert("Workspace name is required")
      return
    }
    setSaving(true)
    try {
      let logoIdToSave = uploadedLogoId

      // Upload logo if a new file was selected
      if (selectedFile) {
        const newLogoId = await uploadLogo()
        if (newLogoId) {
          logoIdToSave = newLogoId
        }
      }

      const response = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspace.name,
          email: workspace.email,
          address: workspace.address,
          phone: workspace.phone,
          invoicePrefix: workspace.invoicePrefix,
          defaultPaymentTerms: workspace.defaultPaymentTerms ?? 15,
          defaultNotes: workspace.defaultNotes,
          matriculeFiscale: workspace.matriculeFiscale,
          ...(logoIdToSave && { logoId: logoIdToSave }),
        }),
      })

      if (response.ok) {
        alert("Workspace settings saved successfully!")
        await fetchWorkspace()
      } else {
        const message = await response.text()
        alert(`Failed to save settings: ${message}`)
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout user={{ email: "user@example.com", name: "User" }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
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
                <Label htmlFor="workspace-name">Workspace Name *</Label>
                <Input
                  id="workspace-name"
                  value={workspace.name || ""}
                  onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                  placeholder="My Company"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-email">Workspace Email</Label>
                <Input
                  id="workspace-email"
                  type="email"
                  value={workspace.email || ""}
                  onChange={(e) => setWorkspace({ ...workspace, email: e.target.value })}
                  placeholder="billing@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-address">Address</Label>
                <Textarea
                  id="workspace-address"
                  value={workspace.address || ""}
                  onChange={(e) => setWorkspace({ ...workspace, address: e.target.value })}
                  placeholder="123 Business St, Suite 100&#10;San Francisco, CA 94105"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-phone">Phone</Label>
                <Input
                  id="workspace-phone"
                  value={workspace.phone || ""}
                  onChange={(e) => setWorkspace({ ...workspace, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricule-fiscale">Matricule Fiscale</Label>
                <Input
                  id="matricule-fiscale"
                  value={workspace.matriculeFiscale || ""}
                  onChange={(e) => setWorkspace({ ...workspace, matriculeFiscale: e.target.value })}
                  placeholder="Your tax registration number"
                />
              </div>
              <Button onClick={handleSaveWorkspace} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Upload your company logo for invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoPreview && (
                <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-32 object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="logo">Select Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, GIF, SVG (Max 5MB)
                </p>
              </div>
              {selectedFile && (
                <Button 
                  onClick={handleSaveWorkspace} 
                  disabled={saving || logoUploading}
                >
                  {logoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Logo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Save Logo
                    </>
                  )}
                </Button>
              )}
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
                  value={workspace.invoicePrefix || "INV"}
                  onChange={(e) => setWorkspace({ ...workspace, invoicePrefix: e.target.value })}
                  placeholder="INV"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms (days)</Label>
                <Input
                  id="payment-terms"
                  type="number"
                  value={workspace.defaultPaymentTerms || 15}
                  onChange={(e) =>
                    setWorkspace({ ...workspace, defaultPaymentTerms: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-notes">Default Invoice Notes</Label>
                <Textarea
                  id="invoice-notes"
                  value={workspace.defaultNotes || ""}
                  onChange={(e) => setWorkspace({ ...workspace, defaultNotes: e.target.value })}
                  placeholder="Thank you for your business!"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveWorkspace} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
