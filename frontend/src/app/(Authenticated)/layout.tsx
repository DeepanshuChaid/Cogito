
import { AuthProvider } from "@/context/auth.provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import Asidebar from "@/components/Asidebar"
import Navbar from "@/components/Navbar"
import FullscreenLoader from "@/components/loader/FullscreenLoader"
import { useAuth } from "@/context/auth.provider"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Ensure the outermost wrapper is exactly the viewport height
    <div className="flex h-screen w-full bg-[#0D0D0D] overflow-hidden">
      <AuthProvider>
        <SidebarProvider style={{ "--sidebar-width": "240px", "--sidebar-width-icon": "64px" } as React.CSSProperties}>

          <Asidebar />

          {/* 2. This column holds Navbar + Content */}
          <div className="flex flex-1 flex-col min-w-0 h-full">
            <Navbar />

            {/* 3. This is the wrapper for the 'Rectangle'. 
                   We use overflow-hidden here so the rectangle itself can scroll */}
            <main className="flex-1 min-h-0 p-0 md:p-2 overflow-hidden !max-h-full">

              {/* 4. THE RECTANGLE: 
                     h-full + overflow-y-auto makes the scrollbar appear INSIDE the black box */}
              <div className="box-border p-6 bg-transparent md:bg-black-300 md:border md:border-white/15 rounded-[24px] h-full w-full overflow-y-auto custom-scrollbar">
                {children}
              </div>

            </main>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </div>
  )
}





