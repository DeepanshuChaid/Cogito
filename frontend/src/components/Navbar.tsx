"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils"; 
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth.provider";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,  
} from "@/components/ui/dropdown-menu"
import API from "@/lib/API";
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State to track scroll
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);
  

  const logout = async () => {
    try {
      await API.post("/user/logout");
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      window.location.reload();
    } catch (err) {
      toast({
        title: "Logout failed",
        description: "Something went wrong while logging out.",
        variant: "destructive",
      })
    }
  }

  return (
      <div 
        className={cn(
          // Sticky & Animation Logic
          "sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out",
          "isVisible" ? "translate-y-0" : "-translate-y-full",

          // Background & Borders
          "bg-black-200 border-b border-white/10 px-1 md:border-none", 

          // Original Layout Classes
          "flex justify-between items-center py-4 px-6 md:py-3 md:px-6 gap-2 md:gap-4 rounded-[2px]"
        )}
      >

      <div className="flex gap-3">
        {/* Sidebar Toggle */}
        <button 
          onClick={toggleSidebar} 
          className="flex-shrink-0 p-1 hover:bg-white/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1V19M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <Link href="/"  className="flex flex-row items-center p-0 gap-2 md:hidden">
          <Image src="./Logo-notext.svg" alt="logo" height={22} width={18} />
          <p className="text-14 text-white-200"><span className="text-18">C</span>ogito</p>
        </Link>
      </div>

      {/* Main Search Bar - Hidden on mobile, shown on desktop (md) */}
      <div className="hidden md:flex flex-grow justify-center items-center relative max-w-[240px]">
        <svg 
          className="absolute left-4 z-10" 
          width="16" height="16" 
          viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 17L13.1422 13.1422M15.2222 8.11111C15.2222 12.0385 12.0385 15.2222 8.11111 15.2222C4.18375 15.2222 1 12.0385 1 8.11111C1 4.18375 4.18375 1 8.11111 1C12.0385 1 15.2222 4.18375 15.2222 8.11111Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          id="search"
          type="text"
          placeholder="Search..."
          className="w-full h-10 pl-12 pr-4 bg-[linear-gradient(6.02deg,_#0F0F0F_-27.3%,_#1F1F1F_198.01%)] border border-white/10 rounded-[12px] bg-[#1A1A1A] shadow-[0_0_6px_2px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] text-14 text-[#F2F2F2] placeholder-white-400 focus:outline-none focus:border-white-300 focus:ring-1 focus:ring-white-200/20 transition-all"
        />
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3 md:gap-3 flex-shrink-0">

        {/* Mobile-only Search Icon (No padding, only hover color change) */}
        <button className="md:hidden text-[#CCCCCC] hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 17L13.1422 13.1422M15.2222 8.11111C15.2222 12.0385 12.0385 15.2222 8.11111 15.2222C4.18375 15.2222 1 12.0385 1 8.11111C1 4.18375 4.18375 1 8.11111 1C12.0385 1 15.2222 4.18375 15.2222 8.11111Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <Link href="/write">
          <button
            className="flex hidden md:flex items-center justify-center h-9 md:h-10 px-4 md:px-5 gap-2 md:gap-2 bg-[#191919] border border-white/10 rounded-[12px] shadow-[0_4px_4px_rgba(0,0,0,0.27),inset_0_1px_4px_-2px_rgba(235,235,235,0.12)] text-14 md:text-16 text-white-300 hover:bg-grey-800 transition-colors duration-100 ease-out"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0017 2.04896H3.00039C2.46985 2.04896 1.96105 2.27081 1.5859 2.6657C1.21075 3.06059 1 3.59617 1 4.15463V18.8943C1 19.4528 1.21075 19.9884 1.5859 20.3833C1.96105 20.7782 2.46985 21 3.00039 21H17.0031C17.5336 21 18.0424 20.7782 18.4176 20.3833C18.7927 19.9884 19.0035 19.4528 19.0035 18.8943V11.5245M16.378 1.65415C16.7759 1.2353 17.3156 1 17.8783 1C18.441 1 18.9807 1.2353 19.3786 1.65415C19.7765 2.07299 20 2.64107 20 3.2334C20 3.82574 19.7765 4.39381 19.3786 4.81265L10.3638 14.3029C10.1263 14.5527 9.83292 14.7355 9.51065 14.8346L6.63709 15.719C6.55103 15.7454 6.4598 15.747 6.37295 15.7236C6.2861 15.7001 6.20684 15.6526 6.14344 15.5859C6.08005 15.5191 6.03486 15.4357 6.01261 15.3443C5.99036 15.2528 5.99187 15.1568 6.01697 15.0662L6.85713 12.0414C6.95168 11.7025 7.12572 11.394 7.36323 11.1444L16.378 1.65415Z" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden md:block">Write</span>
          </button>
        </Link>




        <div className="block md:hidden">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="relative flex h-9 w-9 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 cursor-pointer transition-transform hover:scale-[1.01] select-none">
              <AvatarImage
                src={user?.profilePicture || ""}
                className="aspect-square h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-[#222] text-14 text-white/70 uppercase">
                {user?.name?.[0] || "C"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="flex flex-col items-center gap-5 p-4 bg-black-100 border border-white/10 rounded-md shadow-[3px_3px_8px_12px_rgba(0,0,0,0.05)]"
          >
              
            <div className="flex w-full gap-2 items-center">
              <Avatar className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 select-none">
                <AvatarImage
                  src={user?.profilePicture || ""}
                  className="aspect-square h-full w-full object-cover"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-[#222] text-14 text-white/70 uppercase">
                  {user?.name?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col !gap-0">
                <p className="text-16 text-white-100">{user?.name || "Cogito"}</p>
                <p className="text-14 text-white-400">{user?.email || "cogito2509@gmail.com"}</p>
              </div>
            </div>

            <hr className="w-full h-[1px] border-grey-800 rounded-full" />

             
              <div className="flex flex-col gap-2 w-full">
                <DropdownMenuItem className="border-none" asChild>
                  <Link
                    href="/write"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 select-none transition-colors text-white-400 hover:text-white-100"
                  >
                    {/* ICON */}
                    <svg
                      width="19"
                      height="20"
                      viewBox="0 0 19 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.05419 1.94407H2.78982C2.31513 1.94407 1.85988 2.14373 1.52423 2.49913C1.18857 2.85453 1 3.33656 1 3.83917V17.1049C1 17.6075 1.18857 18.0895 1.52423 18.4449C1.85988 18.8003 2.31513 19 2.78982 19H15.3186C15.7933 19 16.2485 18.8003 16.5842 18.4449C16.9198 18.0895 17.1084 17.6075 17.1084 17.1049V10.472M14.7592 1.58873C15.1153 1.21177 15.5981 1 16.1016 1C16.6051 1 17.088 1.21177 17.444 1.58873C17.8 1.96569 18 2.47696 18 3.01006C18 3.54316 17.8 4.05443 17.444 4.43139L9.37815 12.9726C9.16565 13.1974 8.90314 13.362 8.61479 13.4511L6.04371 14.2471C5.96671 14.2709 5.88508 14.2723 5.80738 14.2512C5.72967 14.2301 5.65875 14.1873 5.60203 14.1273C5.54531 14.0672 5.50488 13.9921 5.48497 13.9098C5.46506 13.8276 5.46641 13.7411 5.48887 13.6596L6.24059 10.9373C6.32519 10.6322 6.48091 10.3546 6.69342 10.13L14.7592 1.58873Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
    
                    {/* TEXT */}
                    <span className="text-16 font-medium">
                      Write
                    </span>
                  </Link>
               </DropdownMenuItem>
  
              
                <DropdownMenuItem className="border-none" asChild>
                  <Link
                    href="/notifications"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 select-none transition-colors text-white-400 hover:text-white-100"
                  >
                    {/* ICON */}
                    <svg
                      width="18"
                      height="20"
                      viewBox="0 0 18 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.45993 18.1001C7.61597 18.3737 7.8404 18.6009 8.11065 18.7589C8.3809 18.9168 8.68746 19 8.99952 19C9.31157 19 9.61813 18.9168 9.88838 18.7589C10.1586 18.6009 10.3831 18.3737 10.5391 18.1001M1.23224 12.9935C1.11612 13.1223 1.03949 13.2826 1.01167 13.4547C0.983845 13.6269 1.00603 13.8035 1.07554 13.9631C1.14504 14.1227 1.25885 14.2585 1.40314 14.3538C1.54743 14.4491 1.71597 14.4999 1.88826 14.5001H16.1108C16.283 14.5001 16.4516 14.4495 16.596 14.3544C16.7404 14.2592 16.8543 14.1236 16.924 13.9641C16.9937 13.8046 17.0161 13.628 16.9885 13.4559C16.9609 13.2837 16.8845 13.1234 16.7686 12.9944C15.5863 11.7604 14.333 10.4491 14.333 6.40002C14.333 4.96785 13.771 3.59433 12.7708 2.58163C11.7706 1.56893 10.414 1 8.99952 1C7.585 1 6.22842 1.56893 5.2282 2.58163C4.22799 3.59433 3.66607 4.96785 3.66607 6.40002C3.66607 10.4491 2.41182 11.7604 1.23224 12.9935Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
    
                    {/* TEXT */}
                    <span className="text-16 font-medium">
                      Inbox
                    </span>
                  </Link>
                 </DropdownMenuItem>
  
  
                <DropdownMenuItem className="border-none" asChild>
                  <Link
                    href={"/profile/" + user?.name || "Cogito25"}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 select-none transition-colors text-white-400 hover:text-white-100"
                  >
                    {/* ICON */}
                    <svg
                      width="17"
                      height="18"
                      viewBox="0 0 17 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.5 8.53179C9.62805 8.53179 10.745 8.74981 11.7871 9.17334C12.8294 9.59687 13.7763 10.2177 14.574 11.0003C15.3716 11.7828 16.0044 12.712 16.436 13.7344C16.6819 14.317 16.8598 14.9232 16.9675 15.5419C17.2171 16.9774 15.9859 18 14.7568 18H2.24316C1.01409 18 -0.217143 16.9774 0.0325168 15.5419C0.14011 14.9232 0.318067 14.317 0.564 13.7344C0.995683 12.712 1.62841 11.7828 2.42606 11.0003C3.2237 10.2177 4.17065 9.59687 5.21283 9.17334C6.25499 8.74981 7.37197 8.53179 8.5 8.53179ZM8.5 10.6127C7.65049 10.6127 6.8093 10.7769 6.02444 11.0959C5.2396 11.4148 4.52644 11.8823 3.92575 12.4716C3.32505 13.061 2.8486 13.7606 2.52351 14.5307C2.33988 14.9657 2.20654 15.4183 2.12531 15.8801C2.14278 15.896 2.18288 15.9191 2.24316 15.9191H14.7568C14.817 15.9191 14.8571 15.896 14.8746 15.8801C14.7934 15.4183 14.6601 14.9657 14.4765 14.5307C14.1514 13.7606 13.6749 13.061 13.0742 12.4716C12.4736 11.8823 11.7604 11.4148 10.9756 11.0959C10.1907 10.7769 9.34952 10.6127 8.5 10.6127ZM8.5 0C10.7841 1.07253e-06 12.6358 1.81674 12.6358 4.0578C12.6358 6.29887 10.7841 8.11561 8.5 8.11561C6.21582 8.11561 4.36412 6.29887 4.36412 4.0578C4.36412 1.81674 6.21582 0 8.5 0ZM8.5 2.08092C7.38719 2.08092 6.48509 2.966 6.48509 4.0578C6.48509 5.1496 7.38719 6.03468 8.5 6.03468C9.61281 6.03468 10.5149 5.1496 10.5149 4.0578C10.5149 2.966 9.61281 2.08092 8.5 2.08092Z"
                        fill="currentColor"
                      />
                    </svg>
    
                    {/* TEXT */}
                    <span className="text-16 font-medium">
                      Profile
                    </span>
                  </Link>
                 </DropdownMenuItem>
  
                
              </div>

            <hr className="w-full h-[1px] border-grey-800 rounded-full" />

            <DropdownMenuItem asChild>

              <div onClick={() => logout()}
                className="group items-center w-full flex items-first gap-3 rounded-lg px-3 py-2 select-none transition-colors text-red-400 hover:text-red-500"
              >
                {/* ICON */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 15L19 10M19 10L14 5M19 10H7M7 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
  
                {/* TEXT */}
                <span className="text-16 font-medium">
                  Logout
                </span>
              </div>

            </DropdownMenuItem>
            
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

      </div>
    </div>
  );
}
