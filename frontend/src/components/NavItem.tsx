"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function NavItem({
  href,
  children,
}: {
  href: string
  children: (isActive: boolean) => React.ReactNode
}) {
  const pathname = usePathname()
  const isActive =
    pathname === href || pathname.startsWith(`${href}/`)

  return <Link href={href} className="w-full">{children(isActive)}</Link>
}