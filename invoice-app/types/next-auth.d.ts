import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      token: string
      workspaceId?: string
      workspaceName?: string
    } & DefaultSession["user"]
  }

  interface User {
    token: string
    workspaceId?: string
    workspaceName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    token: string
    workspaceId?: string
    workspaceName?: string
  }
}
