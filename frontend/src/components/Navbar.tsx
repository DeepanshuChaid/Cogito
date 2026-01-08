"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth.provider";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center py-2 px-3 md:px-6 bg-[#0D0D0D] border-b border-white/5 gap-2 md:gap-4">

      {/* Sidebar Toggle */}
      <button 
        onClick={toggleSidebar} 
        className="flex-shrink-0 p-1.5 hover:bg-white/5 rounded-md transition-colors"
        aria-label="Toggle Sidebar"
      >
        <svg 
          className="text-[#CCCCCC]" 
          width="18" height="18" 
          viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 1V19M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Search Bar - Grows to fill space, but has a max width */}
      <div className="flex flex-grow max-w-[420px] sm:max-w-[10px] items-center relative group">
        <svg 
          className="absolute left-3 z-10 text-white-400/50 group-focus-within:text-white-300 transition-colors" 
          width="14" height="14" 
          viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 17L13.1422 13.1422M15.2222 8.11111C15.2222 12.0385 12.0385 15.2222 8.11111 15.2222C4.18375 15.2222 1 12.0385 1 8.11111C1 4.18375 4.18375 1 8.11111 1C12.0385 1 15.2222 4.18375 15.2222 8.11111Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          id="search"
          type="text"
          placeholder="Search..."
          className="w-full pl-9 min-h-8 pr-3 py-1.5 bg-[#1A1A1A] border border-white/10 rounded-full text-[12px] text-[#F2F2F2] placeholder-white-400/40 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <Link href="/write">
          <button
            className="flex items-center justify-center p-2 md:px-4 md:py-1.5 gap-2 bg-[#191919] border border-white/10 rounded-full text-[12px] font-medium text-white-300 hover:bg-[#222] hover:border-white/20 transition-all active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0017 2.04896H3.00039C2.46985 2.04896 1.96105 2.27081 1.5859 2.6657C1.21075 3.06059 1 3.59617 1 4.15463V18.8943C1 19.4528 1.21075 19.9884 1.5859 20.3833C1.96105 20.7782 2.46985 21 3.00039 21H17.0031C17.5336 21 18.0424 20.7782 18.4176 20.3833C18.7927 19.9884 19.0035 19.4528 19.0035 18.8943V11.5245M16.378 1.65415C16.7759 1.2353 17.3156 1 17.8783 1C18.441 1 18.9807 1.2353 19.3786 1.65415C19.7765 2.07299 20 2.64107 20 3.2334C20 3.82574 19.7765 4.39381 19.3786 4.81265L10.3638 14.3029C10.1263 14.5527 9.83292 14.7355 9.51065 14.8346L6.63709 15.719C6.55103 15.7454 6.4598 15.747 6.37295 15.7236C6.2861 15.7001 6.20684 15.6526 6.14344 15.5859C6.08005 15.5191 6.03486 15.4357 6.01261 15.3443C5.99036 15.2528 5.99187 15.1568 6.01697 15.0662L6.85713 12.0414C6.95168 11.7025 7.12572 11.394 7.36323 11.1444L16.378 1.65415Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:block">Write</span>
          </button>
        </Link>

        <Avatar className="h-8 w-8 min-h-8 md:h-8 md:w-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
          <AvatarImage src={user?.profilePicture || ""} className="object-cover w-full h-full" />
          <AvatarFallback className="flex items-center justify-center w-full h-full bg-[#222] text-[10px] text-white/70 uppercase">
            {user?.name?.[0] || "C"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
