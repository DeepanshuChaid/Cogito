export default function Navbar () {
  return (
    <div className="flex justify-between items-center py-3 px-6 bg-[#0D0D0D] rounded-[2px]">
      <div className="hover:bg-white-100/20 flex justify-center items-center p-[2px]" >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1V19M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div
        class="mx-auto flex h-10 w-[420px] max-w-[420px] items-center gap-2.5
               px-5 bg-[#1A1A1A] border border-white/10
               rounded-full
               shadow-md"
      >
        
        <p className="text-14 text-white-400">Search....</p>
      </div>

      Navbar
    </div>
  )
}