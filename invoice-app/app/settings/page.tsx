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
  personal_name?: string
  personal_email?: string
  personal_phone?: string
  logo?: {
    id: string
    url: string
    name: string
  }
  signature?: {
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
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [selectedSignatureFile, setSelectedSignatureFile] = useState<File | null>(null)
  const [uploadedSignatureId, setUploadedSignatureId] = useState<string | null>(null)
  const [signatureUploading, setSignatureUploading] = useState(false)

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
        if (data.signature?.url) {
          const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
          const fullUrl = data.signature.url.startsWith('http') ? data.signature.url : `${STRAPI_URL}${data.signature.url}`
          setSignaturePreview(fullUrl)
          setUploadedSignatureId(data.signature.id)
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

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedSignatureFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setSignaturePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!selectedFile) return null
    console.log('========== CLIENT UPLOAD START ==========', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size
    })

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch('/api/upload', {
        method: "POST",
        body: formData,
      })

      console.log('Upload response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (response.ok) {
        const uploaded = await response.json()
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

  const uploadSignature = async (): Promise<string | null> => {
    if (!selectedSignatureFile) return null
    console.log('========== SIGNATURE UPLOAD START ==========', {
      name: selectedSignatureFile.name,
      type: selectedSignatureFile.type,
      size: selectedSignatureFile.size
    })

    setSignatureUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedSignatureFile)

      const response = await fetch('/api/upload', {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const uploaded = await response.json()
        console.log('========== SIGNATURE UPLOAD SUCCESS ==========', uploaded)
        setUploadedSignatureId(uploaded.id)
        setSelectedSignatureFile(null)
        return uploaded.id.toString()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Signature upload failed:', errorData)
        alert(`Failed to upload signature: ${JSON.stringify(errorData)}`)
        return null
      }
    } catch (error) {
      console.error('========== SIGNATURE UPLOAD ERROR ==========', error)
      alert("Failed to upload signature")
      return null
    } finally {
      setSignatureUploading(false)
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
      let signatureIdToSave = uploadedSignatureId

      // Upload logo if a new file was selected
      if (selectedFile) {
        const newLogoId = await uploadLogo()
        if (newLogoId) {
          logoIdToSave = newLogoId
        }
      }

      // Upload signature if a new file was selected
      if (selectedSignatureFile) {
        const newSignatureId = await uploadSignature()
        if (newSignatureId) {
          signatureIdToSave = newSignatureId
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
          personal_name: workspace.personal_name,
          personal_email: workspace.personal_email,
          personal_phone: workspace.personal_phone,
          ...(logoIdToSave && { logoId: logoIdToSave }),
          ...(signatureIdToSave && { signatureId: signatureIdToSave }),
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
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details for invoices (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personal-name">Your Name</Label>
                <Input
                  id="personal-name"
                  value={workspace.personal_name || ""}
                  onChange={(e) => setWorkspace({ ...workspace, personal_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal-email">Your Email</Label>
                <Input
                  id="personal-email"
                  type="email"
                  value={workspace.personal_email || ""}
                  onChange={(e) => setWorkspace({ ...workspace, personal_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal-phone">Your Phone</Label>
                <Input
                  id="personal-phone"
                  value={workspace.personal_phone || ""}
                  onChange={(e) => setWorkspace({ ...workspace, personal_phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Button onClick={handleSaveWorkspace} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Personal Info"
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
              <CardTitle>Agency Signature</CardTitle>
              <CardDescription>Upload your signature for invoices (PNG recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {signaturePreview && (
                <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="h-24 object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signature">Select Signature</Label>
                <Input
                  id="signature"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleSignatureChange}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: PNG, JPG (Max 5MB). PNG with transparent background recommended.
                </p>
              </div>
              {selectedSignatureFile && (
                <Button 
                  onClick={handleSaveWorkspace} 
                  disabled={saving || signatureUploading}
                >
                  {signatureUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Signature...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Save Signature
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
