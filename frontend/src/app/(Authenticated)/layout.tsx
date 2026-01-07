import { AuthProvider } from "@/context/auth.provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import Asidebar from "@/components/Asidebar"
import { cookies } from "next/headers"
import Navbar from "@/components/Navbar"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <>
      <AuthProvider>
        <SidebarProvider style={{
            "--sidebar-width": "240px",      // Expanded width
            "--sidebar-width-icon": "64px",  // Your custom "thin" width
          } as React.CSSProperties} >
          <div className="flex h-full w-full bg-[#0D0D0D]">
            <Asidebar />

            <div className="flex min-h-screen w-full flex-col min-h-0">
              <Navbar />

              <div className="flex flex-col w-full flex-1 min-h-0 px-2 pb-2">
                <div className="box-border flex flex-row items-start flex-1 p-6 gap-4
                                bg-[#0A0A0A] border border-white/15 rounded-[24px]
                                w-full overflow-hidden min-w-0">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </>
  )
}

