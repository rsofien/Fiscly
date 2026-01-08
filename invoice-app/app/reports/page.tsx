import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/layout/app-layout"
import { ReportsCharts } from "@/components/reports/reports-charts"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and insights for your business</p>
        </div>

        <ReportsCharts />
      </div>
    </AppLayout>
  )
}
