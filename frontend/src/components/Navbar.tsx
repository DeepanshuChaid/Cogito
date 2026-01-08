"use client";

import Link from "next/link";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth.provider";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

export default function Navbar () {

  const { toggleSidebar } = useSidebar()
  const {user} = useAuth()
  
  return (
    <div className="flex justify-between items-center py-2 px-3 md:px-6 bg-[#0D0D0D] rounded-[2px] gap-2">

      {/* Sidebar Toggle - Reduced size for mobile */}
      <button onClick={toggleSidebar} className="flex-shrink-0 p-1 hover:bg-white/5 rounded transition-colors">
        <svg 
          className="text-white-400" 
          width="18" height="18" 
          viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 1V19M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Search Bar Container - Flexible width */}
      <div className="flex flex-row flex-grow max-w-[420px] justify-center items-center relative">
        <svg 
          className="absolute left-3 z-10" 
          width="14" height="14" 
          viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 17L13.1422 13.1422M15.2222 8.11111C15.2222 12.0385 12.0385 15.2222 8.11111 15.2222C4.18375 15.2222 1 12.0385 1 8.11111C1 4.18375 4.18375 1 8.11111 1C12.0385 1 15.2222 4.18375 15.2222 8.11111Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          id="search"
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/10 rounded-full text-[12px] text-[#F2F2F2] placeholder-white-400/50 focus:outline-none focus:border-white-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
        />
      </div>

      {/* Write Button - Hidden text on small mobile, shown on tablet+ */}
      <Link href="/write" className="flex-shrink-0">
        <button
          className="flex items-center justify-center px-3 py-1.5 md:px-5 md:py-2 gap-2 bg-[#191919] border border-white/10 rounded-full text-[12px] text-white-300 hover:bg-grey-800 transition-all active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.0017 2.04896H3.00039C2.46985 2.04896 1.96105 2.27081 1.5859 2.6657C1.21075 3.06059 1 3.59617 1 4.15463V18.8943C1 19.4528 1.21075 19.9884 1.5859 20.3833C1.96105 20.7782 2.46985 21 3.00039 21H17.0031C17.5336 21 18.0424 20.7782 18.4176 20.3833C18.7927 19.9884 19.0035 19.4528 19.0035 18.8943V11.5245M16.378 1.65415C16.7759 1.2353 17.3156 1 17.8783 1C18.441 1 18.9807 1.2353 19.3786 1.65415C19.7765 2.07299 20 2.64107 20 3.2334C20 3.82574 19.7765 4.39381 19.3786 4.81265L10.3638 14.3029C10.1263 14.5527 9.83292 14.7355 9.51065 14.8346L6.63709 15.719C6.55103 15.7454 6.4598 15.747 6.37295 15.7236C6.2861 15.7001 6.20684 15.6526 6.14344 15.5859C6.08005 15.5191 6.03486 15.4357 6.01261 15.3443C5.99036 15.2528 5.99187 15.1568 6.01697 15.0662L6.85713 12.0414C6.95168 11.7025 7.12572 11.394 7.36323 11.1444L16.378 1.65415Z" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Write</span>
        </button>
      </Link>

      <Avatar>
        <Image src={user?.profilePicture || "/default-avatar.png"} alt="avatar" width={32} height={32} className="rounded-full" />
        <AvatarFallback>
          {user?.name?.charAt(0) || "C"}
        </AvatarFallback>
      </Avatar>
    </div>

  )
}