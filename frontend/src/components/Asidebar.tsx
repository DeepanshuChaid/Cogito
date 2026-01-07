"use client";

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
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
  EllipsisIcon,
  Loader,
  LogOut,
} from "lucide-react";
import NavItem from "./NavItem";
import { toast } from "@/hooks/use-toast"
import API from "@/lib/API"
import {QueryClient} from "@tanstack/react-query"


const Asidebar = () => {
  const { open } = useSidebar()

  const { isPending, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = new QueryClient()

  const logout = async () => {
    try {
      await API.post("/user/logout");
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      toast({
        title: "Logout failed",
        description: "Something went wrong while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-[#0D0D0D] border-none"
      >
        <div className="flex h-full flex-col px-6 py-4 group-data-[collapsible=icon]:px-2">
          <SidebarHeader className="p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center border-red-300">
            <Link href="/"  className="flex flex-row items-center p-0 gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pt-2">
              <Image src="./Logo-notext.svg" alt="logo" height={24} width={20} />
              <p className="text-16 text-white-200 group-data-[collapsible=icon]:hidden"><span className="text-20">C</span>ogito</p>
            </Link>
          </SidebarHeader>
          <hr className="bg-black-50 border-black-50 rounded-[4px] my-6 border-1" />
  
          <SidebarContent className="!p-0">
            <SidebarGroup className="!p-0 gap-0">
              <SidebarGroupContent className="p-0 gap-[12px] flex flex-col">
                <NavItem href="/">
                  {(isActive) => (
         <div
          className={`flex group-data-[collapsible=icon]:justify-center items-center px-3 py-2 gap-3 rounded-xl transition-colors hover:bg-black-50 ${
            isActive
              ? "bg-[#171717] shadow-[0_2px_5px_1px_rgba(0,0,0,0.23),inset_0_1px_2px_rgba(255,255,255,0.13)]"
              : "hover:bg-black-50"
          }`} >
          {isActive ? <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 17V10.2633C11 10.04 10.9122 9.82581 10.7559 9.66788C10.5996 9.50996 10.3877 9.42124 10.1667 9.42124H6.83333C6.61232 9.42124 6.40036 9.50996 6.24408 9.66788C6.0878 9.82581 6 10.04 6 10.2633V17L2.66667 17C2.22464 17 1.80072 16.8226 1.48816 16.5067C1.17559 16.1909 1 15.7625 1 15.3158V7.73708C0.999942 7.49209 1.05278 7.25003 1.15482 7.0278C1.25687 6.80557 1.40566 6.60851 1.59083 6.45037L7.42417 1.39787C7.72499 1.14095 8.10613 1 8.5 1C8.89387 1 9.27501 1.14095 9.57583 1.39787L15.4092 6.45037C15.5943 6.60851 15.7431 6.80557 15.8452 7.0278C15.9472 7.25003 16.0001 7.49209 16 7.73708V15.3158C16 15.7625 15.8244 16.1909 15.5118 16.5067C15.1993 16.8226 14.3333 17 14.3333 17L11 17Z" fill="#F2F2F2"/>
            <path d="M11 17C11 14.3692 11 10.2633 11 10.2633M11 17L14.3333 17C14.3333 17 15.1993 16.8226 15.5118 16.5067C15.8244 16.1909 16 15.7625 16 15.3158V7.73708C16.0001 7.49209 15.9472 7.25003 15.8452 7.0278C15.7431 6.80557 15.5943 6.60851 15.4092 6.45037L9.57583 1.39787C9.27501 1.14095 8.89387 1 8.5 1C8.10613 1 7.72499 1.14095 7.42417 1.39787L1.59083 6.45037C1.40566 6.60851 1.25687 6.80557 1.15482 7.0278C1.05278 7.25003 0.999942 7.49209 1 7.73708V15.3158C1 15.7625 1.17559 16.1909 1.48816 16.5067C1.80072 16.8226 2.22464 17 2.66667 17L6 17V10.2633C6 10.04 6.0878 9.82581 6.24408 9.66789C6.40036 9.50996 6.61232 9.42124 6.83333 9.42124H10.1667C10.3877 9.42124 10.5996 9.50996 10.7559 9.66789C10.9122 9.82581 11 10.04 11 10.2633M11 17V10.2633" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg> : <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 17C11 14.3692 11 10.2633 11 10.2633M11 17L14.3333 17C14.3333 17 15.1993 16.8226 15.5118 16.5067C15.8244 16.1909 16 15.7625 16 15.3158V7.73708C16.0001 7.49209 15.9472 7.25003 15.8452 7.0278C15.7431 6.80557 15.5943 6.60851 15.4092 6.45037L9.57583 1.39787C9.27501 1.14095 8.89387 1 8.5 1C8.10613 1 7.72499 1.14095 7.42417 1.39787L1.59083 6.45037C1.40566 6.60851 1.25687 6.80557 1.15482 7.0278C1.05278 7.25003 0.999942 7.49209 1 7.73708V15.3158C1 15.7625 1.17559 16.1909 1.48816 16.5067C1.80072 16.8226 2.22464 17 2.66667 17L6 17V10.2633C6 10.04 6.0878 9.82581 6.24408 9.66789C6.40036 9.50996 6.61232 9.42124 6.83333 9.42124H10.1667C10.3877 9.42124 10.5996 9.50996 10.7559 9.66789C10.9122 9.82581 11 10.04 11 10.2633M11 17V10.2633" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
  
  }
          <p
            className={`text-16 transition-colors group-data-[collapsible=icon]:hidden ${
              isActive ? "text-white-100" : "text-white-400 hover:text-white-300"
            }`}
          >
            Home
          </p>
                    </div>
                  )}
                </NavItem>
                <NavItem href="/notifications">
                  {(isActive) => (
                <div
                className={`flex group-data-[collapsible=icon]:justify-center items-center px-3 py-2 gap-3 rounded-xl transition-colors hover:bg-black-50 ${
                isActive
                ? "bg-[#171717] shadow-[0_2px_5px_1px_rgba(0,0,0,0.23),inset_0_1px_2px_rgba(255,255,255,0.13)]"
                : "hover:bg-black-50"
                }`} >
                {isActive ? <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.65244 16.2001C6.78897 16.4433 6.98535 16.6452 7.22182 16.7857C7.45829 16.9261 7.72653 17 7.99958 17C8.27263 17 8.54086 16.9261 8.77734 16.7857C9.01381 16.6452 9.21018 16.4433 9.34672 16.2001" fill="#F2F2F2"/>
                  <path d="M1.20321 11.6608C1.10161 11.7754 1.03455 11.9178 1.01021 12.0709C0.985865 12.2239 1.00528 12.3809 1.06609 12.5228C1.12691 12.6647 1.2265 12.7853 1.35275 12.87C1.479 12.9548 1.62647 12.9999 1.77723 13.0001H14.2219C14.3727 13.0001 14.5202 12.9551 14.6465 12.8705C14.7728 12.786 14.8725 12.6655 14.9335 12.5237C14.9945 12.3819 15.0141 12.2249 14.99 12.0719C14.9658 11.9188 14.8989 11.7763 14.7975 11.6616C13.763 10.5648 12.6663 9.39924 12.6663 5.80002C12.6663 4.52698 12.1747 3.30607 11.2995 2.40589C10.4243 1.50572 9.23728 1 7.99958 1C6.76187 1 5.57486 1.50572 4.69968 2.40589C3.82449 3.30607 3.33281 4.52698 3.33281 5.80002C3.33281 9.39924 2.23535 10.5648 1.20321 11.6608Z" fill="#F2F2F2"/>
                  <path d="M6.65244 16.2001C6.78897 16.4433 6.98535 16.6452 7.22182 16.7857C7.45829 16.9261 7.72653 17 7.99958 17C8.27263 17 8.54086 16.9261 8.77734 16.7857C9.01381 16.6452 9.21018 16.4433 9.34672 16.2001M1.20321 11.6608C1.10161 11.7754 1.03455 11.9178 1.01021 12.0709C0.985865 12.2239 1.00528 12.3809 1.06609 12.5228C1.12691 12.6647 1.2265 12.7853 1.35275 12.87C1.479 12.9548 1.62647 12.9999 1.77723 13.0001H14.2219C14.3727 13.0001 14.5202 12.9551 14.6465 12.8705C14.7728 12.786 14.8725 12.6655 14.9335 12.5237C14.9945 12.3819 15.0141 12.2249 14.99 12.0719C14.9658 11.9188 14.8989 11.7763 14.7975 11.6616C13.763 10.5648 12.6663 9.39924 12.6663 5.80002C12.6663 4.52698 12.1747 3.30607 11.2995 2.40589C10.4243 1.50572 9.23728 1 7.99958 1C6.76187 1 5.57486 1.50572 4.69968 2.40589C3.82449 3.30607 3.33281 4.52698 3.33281 5.80002C3.33281 9.39924 2.23535 10.5648 1.20321 11.6608Z" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
   : <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.65244 16.2001C6.78897 16.4433 6.98535 16.6452 7.22182 16.7857C7.45829 16.9261 7.72653 17 7.99958 17C8.27263 17 8.54086 16.9261 8.77734 16.7857C9.01381 16.6452 9.21018 16.4433 9.34672 16.2001M1.20321 11.6608C1.10161 11.7754 1.03455 11.9178 1.01021 12.0709C0.985865 12.2239 1.00528 12.3809 1.06609 12.5228C1.12691 12.6647 1.2265 12.7853 1.35275 12.87C1.479 12.9548 1.62647 12.9999 1.77723 13.0001H14.2219C14.3727 13.0001 14.5202 12.9551 14.6465 12.8705C14.7728 12.786 14.8725 12.6655 14.9335 12.5237C14.9945 12.3819 15.0141 12.2249 14.99 12.0719C14.9658 11.9188 14.8989 11.7763 14.7975 11.6616C13.763 10.5648 12.6663 9.39924 12.6663 5.80002C12.6663 4.52698 12.1747 3.30607 11.2995 2.40589C10.4243 1.50572 9.23728 1 7.99958 1C6.76187 1 5.57486 1.50572 4.69968 2.40589C3.82449 3.30607 3.33281 4.52698 3.33281 5.80002C3.33281 9.39924 2.23535 10.5648 1.20321 11.6608Z" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
  
  
                }
                <p
                className={`text-16 transition-colors group-data-[collapsible=icon]:hidden ${
                isActive ? "text-white-100" : "text-white-400 hover:text-white-300"
                }`}
                >
                Indox
                </p>
                    </div>
                  )}
                </NavItem>
                
                <NavItem href={`/profile/${user?.name || "Deepanshu"}`}>
                  {(isActive) => (
                <div
                className={`flex group-data-[collapsible=icon]:justify-center items-center px-3 py-2 gap-3 rounded-xl transition-colors hover:bg-black-50 ${
                isActive
                ? "bg-[#171717] shadow-[0_2px_5px_1px_rgba(0,0,0,0.23),inset_0_1px_2px_rgba(255,255,255,0.13)]"
                : "hover:bg-black-50"
                }`} >
                {isActive ? <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 7.58381C8.49533 7.58381 9.48089 7.77761 10.4004 8.15408C11.32 8.53055 12.1555 9.08237 12.8594 9.77803C13.5631 10.4736 14.1215 11.2995 14.5023 12.2084C14.7193 12.7262 14.8763 13.2651 14.9713 13.815C15.1916 15.0911 14.1052 16 13.0207 16H1.97926C0.894786 16 -0.191597 15.0911 0.0286913 13.815C0.123626 13.2651 0.280648 12.7262 0.497647 12.2084C0.878544 11.2995 1.43683 10.4736 2.14064 9.77803C2.84444 9.08237 3.67998 8.53055 4.59955 8.15408C5.51911 7.77761 6.50468 7.58381 7.5 7.58381ZM7.5 9.43353C6.75043 9.43353 6.0082 9.57947 5.31569 9.86303C4.62318 10.1465 3.99392 10.562 3.4639 11.0859C2.93387 11.6098 2.51347 12.2317 2.22663 12.9162C2.0646 13.3028 1.94695 13.7052 1.87527 14.1156C1.89068 14.1298 1.92607 14.1503 1.97926 14.1503H13.0207C13.0739 14.1503 13.1092 14.1298 13.1247 14.1156C13.053 13.7052 12.9354 13.3028 12.7734 12.9162C12.4865 12.2317 12.0661 11.6098 11.5361 11.0859C11.0061 10.562 10.3768 10.1465 9.68431 9.86303C8.99181 9.57947 8.24958 9.43353 7.5 9.43353ZM7.5 0C9.51542 9.5336e-07 11.1493 1.61488 11.1493 3.60694C11.1493 5.59899 9.51542 7.21387 7.5 7.21387C5.48455 7.21387 3.8507 5.59899 3.8507 3.60694C3.8507 1.61488 5.48455 0 7.5 0ZM7.5 1.84971C6.51811 1.84971 5.72213 2.63645 5.72213 3.60694C5.72213 4.57742 6.51811 5.36416 7.5 5.36416C8.48189 5.36416 9.27787 4.57742 9.27787 3.60694C9.27787 2.63645 8.48189 1.84971 7.5 1.84971Z" fill="#F2F2F2"/>
                  <path d="M7.5 9.43353C6.75043 9.43353 6.0082 9.57947 5.31569 9.86303C4.62318 10.1465 3.99392 10.562 3.4639 11.0859C2.93387 11.6098 2.51347 12.2317 2.22663 12.9162C2.0646 13.3028 1.94695 13.7052 1.87527 14.1156C1.89068 14.1298 1.92607 14.1503 1.97926 14.1503H13.0207C13.0739 14.1503 13.1092 14.1298 13.1247 14.1156C13.053 13.7052 12.9354 13.3028 12.7734 12.9162C12.4865 12.2317 12.0661 11.6098 11.5361 11.0859C11.0061 10.562 10.3768 10.1465 9.68431 9.86303C8.99181 9.57947 8.24958 9.43353 7.5 9.43353Z" fill="#F2F2F2"/>
                  <path d="M7.5 1.84971C6.51811 1.84971 5.72213 2.63645 5.72213 3.60694C5.72213 4.57742 6.51811 5.36416 7.5 5.36416C8.48189 5.36416 9.27787 4.57742 9.27787 3.60694C9.27787 2.63645 8.48189 1.84971 7.5 1.84971Z" fill="#F2F2F2"/>
                  </svg>
                : <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 7.58381C8.49533 7.58381 9.48089 7.77761 10.4004 8.15408C11.32 8.53055 12.1555 9.08237 12.8594 9.77803C13.5631 10.4736 14.1215 11.2995 14.5023 12.2084C14.7193 12.7262 14.8763 13.2651 14.9713 13.815C15.1916 15.0911 14.1052 16 13.0207 16H1.97926C0.894786 16 -0.191597 15.0911 0.0286913 13.815C0.123626 13.2651 0.280648 12.7262 0.497647 12.2084C0.878544 11.2995 1.43683 10.4736 2.14064 9.77803C2.84444 9.08237 3.67998 8.53055 4.59955 8.15408C5.51911 7.77761 6.50468 7.58381 7.5 7.58381ZM7.5 9.43353C6.75043 9.43353 6.0082 9.57947 5.31569 9.86303C4.62318 10.1465 3.99392 10.562 3.4639 11.0859C2.93387 11.6098 2.51347 12.2317 2.22663 12.9162C2.0646 13.3028 1.94695 13.7052 1.87527 14.1156C1.89068 14.1298 1.92607 14.1503 1.97926 14.1503H13.0207C13.0739 14.1503 13.1092 14.1298 13.1247 14.1156C13.053 13.7052 12.9354 13.3028 12.7734 12.9162C12.4865 12.2317 12.0661 11.6098 11.5361 11.0859C11.0061 10.562 10.3768 10.1465 9.68431 9.86303C8.99181 9.57947 8.24958 9.43353 7.5 9.43353ZM7.5 0C9.51542 9.5336e-07 11.1493 1.61488 11.1493 3.60694C11.1493 5.59899 9.51542 7.21387 7.5 7.21387C5.48455 7.21387 3.8507 5.59899 3.8507 3.60694C3.8507 1.61488 5.48455 0 7.5 0ZM7.5 1.84971C6.51811 1.84971 5.72213 2.63645 5.72213 3.60694C5.72213 4.57742 6.51811 5.36416 7.5 5.36416C8.48189 5.36416 9.27787 4.57742 9.27787 3.60694C9.27787 2.63645 8.48189 1.84971 7.5 1.84971Z" fill="#CCCCCC"/>
                    </svg>
                }
                <p
                className={`text-16 transition-colors group-data-[collapsible=icon]:hidden ${
                isActive ? "text-white-100" : "text-white-400 hover:text-white-300"
                }`}
                >
                Profile
                </p>
                    </div>
                  )}
                </NavItem>
  
              </SidebarGroupContent> 
              <hr className="bg-black-50 border-black-50 rounded-[4px] my-6 border-1" />
              <SidebarGroupContent>
  
                <NavItem href="/following">
                  {(isActive) => (
                <div
                className={`flex group-data-[collapsible=icon]:justify-center items-center px-3 py-2 gap-3 rounded-xl transition-colors hover:bg-black-50 ${
                isActive
                ? "bg-[#171717] shadow-[0_2px_5px_1px_rgba(0,0,0,0.23),inset_0_1px_2px_rgba(255,255,255,0.13)]"
                : "hover:bg-black-50"
                }`} >
                {isActive ? <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6 17.1145V15.324C13.6 14.3742 13.2207 13.4634 12.5456 12.7918C11.8705 12.1203 10.9548 11.743 10 11.743H4.6C3.64522 11.743 2.72955 12.1203 2.05442 12.7918C1.37928 13.4634 1 14.3742 1 15.324V17.1145" fill="#F2F2F2"/>
                  <path d="M19 17.1145V15.324C18.9994 14.5305 18.7339 13.7598 18.2452 13.1327C17.7565 12.5056 17.0723 12.0577 16.3 11.8593" fill="#F2F2F2"/>
                  <path d="M7.3 8.16198C9.28822 8.16198 10.9 6.55871 10.9 4.58099C10.9 2.60326 9.28822 1 7.3 1C5.31177 1 3.7 2.60326 3.7 4.58099C3.7 6.55871 5.31177 8.16198 7.3 8.16198Z" fill="#F2F2F2"/>
                  <path d="M13.6 1.11459C14.372 1.31367 15.0557 1.76209 15.5437 2.38948C16.0318 3.01687 16.2966 3.7877 16.2966 4.58099C16.2966 5.37428 16.0318 6.14511 15.5437 6.7725C15.0557 7.39989 14.372 7.84831 13.6 8.04739V1.11459Z" fill="#F2F2F2"/>
                  <path d="M19 17.1145V15.324C18.9994 14.5305 18.7339 13.7598 18.2452 13.1327C17.7565 12.5056 17.0723 12.0577 16.3 11.8593L16.2584 17.1016L19 17.1145Z" fill="#F2F2F2"/>
                  <path d="M13.6 17.1145V15.324C13.6 14.3742 13.2207 13.4634 12.5456 12.7918C11.8705 12.1203 10.9548 11.743 10 11.743H4.6C3.64522 11.743 2.72955 12.1203 2.05442 12.7918C1.37928 13.4634 1 14.3742 1 15.324V17.1145" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 17.1145V15.324C18.9994 14.5305 18.7339 13.7598 18.2452 13.1327C17.7565 12.5056 17.0723 12.0577 16.3 11.8593" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7.3 8.16198C9.28822 8.16198 10.9 6.55871 10.9 4.58099C10.9 2.60326 9.28822 1 7.3 1C5.31177 1 3.7 2.60326 3.7 4.58099C3.7 6.55871 5.31177 8.16198 7.3 8.16198Z" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.6 1.11459C14.372 1.31367 15.0557 1.76209 15.5437 2.38948C16.0318 3.01687 16.2966 3.7877 16.2966 4.58099C16.2966 5.37428 16.0318 6.14511 15.5437 6.7725C15.0557 7.39989 14.372 7.84831 13.6 8.04739V1.11459Z" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 17.1145V15.324C18.9994 14.5305 18.7339 13.7598 18.2452 13.1327C17.7565 12.5056 17.0723 12.0577 16.3 11.8593L16.2584 17.1016L19 17.1145Z" stroke="#F2F2F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                : <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6 17V15.2222C13.6 14.2792 13.2207 13.3749 12.5456 12.7081C11.8705 12.0413 10.9548 11.6667 10 11.6667H4.6C3.64522 11.6667 2.72955 12.0413 2.05442 12.7081C1.37928 13.3749 1 14.2792 1 15.2222V17M13.6 1.11378C14.372 1.31144 15.0557 1.75668 15.5437 2.37961C16.0318 3.00254 16.2966 3.7679 16.2966 4.55556C16.2966 5.34321 16.0318 6.10857 15.5437 6.7315C15.0557 7.35443 14.372 7.79967 13.6 7.99733M19 17V15.2222C18.9994 14.4344 18.7339 13.6691 18.2452 13.0465C17.7565 12.4239 17.0723 11.9792 16.3 11.7822M10.9 4.55556C10.9 6.51923 9.28822 8.11111 7.3 8.11111C5.31177 8.11111 3.7 6.51923 3.7 4.55556C3.7 2.59188 5.31177 1 7.3 1C9.28822 1 10.9 2.59188 10.9 4.55556Z" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                }
                <p
                className={`text-16 transition-colors group-data-[collapsible=icon]:hidden ${
                isActive ? "text-white-100" : "text-white-400 hover:text-white-300"
                }`}
                >
                Following
                </p>
                    </div>
                  )}
                </NavItem>
  
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 mt-4 flex-row items-center px-3 py-2 gap-2 bg-black-100 rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(235,235,235,0.11)] data-[state=open]:bg-black-200 hover:bg-black-50 p-0 border-none ring-0 outline-none focus-visible:ring-0">
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
                className="w-[--radix-dropdown-menu-trigger-width] min-w-[198px] bg-[#171717] border border-white-50/10 rounded-lg shadow-md p-1"
                side="bottom"
                align="start"
                sideOffset={4}
              >

                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-black-500 hover:text-white-100 text-white-200 transition-colors cursor-pointer active:bg-black-50 active:text-white-50"
                  onClick={() => {
                    setIsOpen(true)
                    logout()
                  }}
                >
                  <LogOut className="w-4 h-4 text-white-200" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
        </div>

        <SidebarRail />
      </Sidebar>
    </>
  );
};

export default Asidebar;
