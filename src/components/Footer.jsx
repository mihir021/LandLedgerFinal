import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 px-4 bg-[#111111] text-white border-t-4 border-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFD400] text-[#111111] rounded-xl border-2 border-white flex items-center justify-center font-comic text-2xl shadow-[3px_3px_0px_#FFF]">
            MR
          </div>
          <div>
            <span className="font-comic text-2xl text-[#FFD400] block leading-none">MIHIR RATHOD</span>
            <span className="text-xs text-gray-300 font-bold">Crafted with React, Tailwind &amp; Comic Pop Energy 💥</span>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="text-center font-comic text-lg text-gray-200 flex items-center gap-2">
          <span>BUILT WITH PASSION &amp; CODE</span>
          <Heart className="w-5 h-5 text-[#FF4D5E] fill-[#FF4D5E] animate-pulse" />
        </div>

        {/* Back To Top Button matching Hero button tokens */}
        <button
          onClick={scrollToTop}
          className="comic-button flex items-center gap-2 px-5 py-2.5 bg-[#0099FF] text-white font-comic text-lg rounded-xl border-3 border-white shadow-[4px_4px_0px_#FFF] hover:bg-[#0077E6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#FFF]"
        >
          <span>BACK TO TOP</span>
          <ArrowUp className="w-5 h-5 stroke-[3]" />
        </button>

      </div>

      <div className="text-center mt-8 pt-6 border-t border-gray-800 text-xs font-bold text-gray-400">
        © {new Date().getFullYear()} Mihir Rathod. All Rights Reserved.
      </div>
    </footer>
  );
}
