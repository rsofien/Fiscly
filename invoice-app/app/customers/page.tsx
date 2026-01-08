import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { CustomersTable } from "@/components/customers/customers-table"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database</p>
        </div>

        <CustomersTable />
      </div>
    </AppLayout>
  )
}
