import { AuthProvider } from "@/context/auth.provider"

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          ncjan
          {children}
        </div>
      </AuthProvider>
    </>
  )
}