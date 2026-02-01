import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardPageClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = {
    name: session.user.name,
    email: session.user.email || "",
    workspaceName: (session.user as any).workspaceName ?? null,
  }

  return <DashboardPageClient user={user} />
}
