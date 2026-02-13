"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string
  alt?: string
  name?: string
  className?: string
}

function getInitials(name?: string) {
  if (!name) return "U"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U"
  return (
    (parts[0][0] || "") +
    (parts[parts.length - 1][0] || "")
  ).toUpperCase()
}

export default function UserAvatar({
  src,
  alt,
  name,
  className,
}: UserAvatarProps) {
  return (
    <Avatar
      className={cn(
        // <400px → 24px
        "h-6 w-6",
        // 500px–800px → 28px
        "min-[500px]:h-7 min-[500px]:w-7",
        // >802px → 32px
        "min-[802px]:h-8 min-[802px]:w-8",
        "",
        className
      )}
    >
      {src ? (
        <AvatarImage src={src} alt={alt || name || "User avatar"} />
      ) : null}
      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}