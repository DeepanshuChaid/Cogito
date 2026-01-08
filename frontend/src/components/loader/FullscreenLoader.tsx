import { Loader2 } from "lucide-react";

interface FullscreenLoaderProps {
  label?: string; // Optional text if you want it
}

export default function FullscreenLoader({ label }: FullscreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          size={20} 
          className="animate-spin text-white/90" 
        />
        {label && (
          <p className="text-12 text-white/70 font-medium tracking-wide">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
