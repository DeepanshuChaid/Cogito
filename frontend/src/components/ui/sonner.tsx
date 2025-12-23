"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "bg-black/80 backdrop-blur text-white border border-white/10",
          description: "text-white/70",
          actionButton:
            "bg-white text-black hover:bg-white/90",
          cancelButton:
            "bg-white/10 text-white hover:bg-white/20",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-400" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      style={
        {
          "--normal-bg": "#000000",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255,255,255,0.08)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }