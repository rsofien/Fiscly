import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      workspaceId: string
      workspaceName: string
    } & DefaultSession["user"]
  }

  interface User {
    workspaceId: string
    workspaceName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    workspaceId: string
    workspaceName: string
  }
}
