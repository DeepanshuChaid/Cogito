"use client";

import { cn } from "@/lib/utils"
import { useState } from "react";
import Link from "next/link"
import Image from "next/image";
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
  ChevronDownIcon
} from "lucide-react";
import NavItem from "./NavItem";

const Asidebar = () => {
  const { open } = useSidebar();
  const { isPending, user } = useAuth()

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar className="flex bg-black-100 py-4 px-6 border-none">
        <SidebarHeader className="p-0" asChild>
          <Link href="/"  className="flex justify-start flex-row items-center p-0 gap-[6px]">
            <Image src="./Logo-notext.svg" alt="logo" height={20} width={20} className="h-[24px] w-auto" />
            <p className="text-16 text-white-200"><span className="text-20">C</span>ogito</p>
          </Link>
        </SidebarHeader>
        <hr className="bg-black-50 border-black-50 rounded-[4px] my-6 border-1" />

        <SidebarContent className="!p-0">
          <SidebarGroup className="!p-0 gap-5">
            <SidebarGroupContent className="p-0">
              <NavItem href="/blog">
                {(isActive) => (
                  <div>
                    
                  </div>
                )}
              </NavItem>
            </SidebarGroupContent> 
            <hr className="bg-black-50 border-black-50 rounded-[4px] my-6 border-1" />
            <SidebarGroupContent>

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="bg-[#171717] flex items-center gap-2 rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(235,235,235,0.09)] data-[state=open]:bg-black-200 hover:bg-black-50 p-0 border-none ring-0 outline-none focus-visible:ring-0">
          {isPending ? (
            <Loader size="24px" className="animate-spin place-self-center self-center" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "flex items-center w-full gap-2 px-2 py-1 rounded-lg hover:text-white transition-colors border-none ring-0 outline-none focus-visible:ring-0" ,
                    "data-[state=open]:text-white"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden ">
                    <AvatarImage src={user?.profilePicture || ""} />
                    <AvatarFallback className="rounded-full border border-white-50/10 bg-black-grey-800 text-white-100">
                      {user?.name?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name & Email */}
                  <div className="flex flex-col truncate flex-1">
                    <span className="text-12 font-medium text-white truncate">
                      {user?.name || "Deepanshu"}
                    </span>
                    <span className="text-12 text-gray-400 truncate">
                      {user?.email || "bantar117@gmail.com"}
                    </span>
                  </div>

                  {/* Dropdown Icon */}
                  <EllipsisIcon className="ml-auto w-4 h-4 text-white-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-[208px] bg-[#171717] border border-white-50/10 rounded-lg shadow-md p-1"
                side="bottom"
                align="start"
                sideOffset={4}
              >

                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-black-100 hover:text-white-100 text-white-200 transition-colors cursor-pointer active:bg-black-50 active:text-white-50"
                  onClick={() => setIsOpen(true)}
                >
                  <LogOut className="w-4 h-4 text-white-200" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default Asidebar;
