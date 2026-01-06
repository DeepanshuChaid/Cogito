export default function Navbar () {
  return (
    <div className="flex justify-between items-center py-3 px-6 bg-[#0D0D0D] rounded-[2px]">
      <div className="hover:bg-white-100/20 flex justify-center items-center p-[2px]" >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1V19M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <input
         id="email"
         type="email"
         placeholder="Search..."
         className={`py-[12px] mx-auto flex w-[420px] max-w-[420px] items-center gap-2.5
                px-5 py-2 bg-[linear-gradient(6.02deg,_#0F0F0F_-27.3%,_#1F1F1F_198.01%)] border border-white/10
                rounded-full w-full px-4 bg-[#1A1A1A] border shadow-[0_0_6px_2px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] text-14 text-[#F2F2F2] placeholder-white-400 focus:outline-none focus:border-white-300 focus:ring-1 focus:ring-white-200/20`}
       />

      Navbar
    </div>
  )
}