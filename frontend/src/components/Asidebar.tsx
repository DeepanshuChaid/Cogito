"use client";

import { useState } from "react";
import Link from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth.provider";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  EllipsisIcon,
  Loader,
  LogOut,
} from "lucide-react";

const Asidebar = () => {
  // const { isPending, user } = useAuth();

  const { open } = useSidebar();

  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  return (
    <>
      <Sidebar className="flex bg-black-100 py-4 px-6 gap-6 border-none">
        <SidebarContent>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default Asidebar;
