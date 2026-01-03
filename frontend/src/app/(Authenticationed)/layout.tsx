import { AuthProvider } from "@/context/auth.provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import Asidebar from "@/components/Asidebar"
import { cookies } from "next/headers"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  
  return (
    <>
      <AuthProvider>
        <SidebarProvider>
          <Asidebar />
          {children}
        </SidebarProvider>
      </AuthProvider>
    </>
  )
}