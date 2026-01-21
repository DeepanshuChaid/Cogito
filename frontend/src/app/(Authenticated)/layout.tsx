
import { AuthProvider } from "@/context/auth.provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import Asidebar from "@/components/Asidebar"
import Navbar from "@/components/Navbar"
import FullscreenLoader from "@/components/loader/FullscreenLoader"
import { useAuth } from "@/context/auth.provider"

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

            <div className="flex w-full flex-col min-h-0">
              <Navbar />

              <div className="flex flex-col w-full flex-1 min-h-0 p-0 md:px-2 md:pb-2">
                <div className="box-border flex flex-row items-start flex-1 p-6 gap-4
                 md:bg-black-300 md:border md:border-white/15 rounded-[24px]
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




