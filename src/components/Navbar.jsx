import React, { useState } from 'react';
import { Menu, X, MessageSquare } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Certificates', href: '#certificates' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
      <div className="bg-white border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] rounded-full px-6 py-3 flex items-center justify-between">
        
        {/* MR Comic Logo Badge */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#FFD400] text-[#111111] font-comic text-2xl rounded-xl border-2.5 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#111] transform group-hover:-rotate-6 transition-transform">
            MR
          </div>
          <div className="hidden sm:block">
            <span className="font-comic text-xl text-[#111111] leading-none block">MIHIR RATHOD</span>
            <span className="block text-xs font-bold text-[#0099FF] tracking-wide">FULL-STACK BUILDER 💥</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFF8E7] px-4 py-1.5 rounded-full border-2 border-black">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1 font-bold text-sm text-[#111111] hover:bg-[#FFD400] hover:rounded-lg border border-transparent hover:border-black" style={{ transition: 'background-color 80ms ease, color 80ms ease' }}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA "Let's Talk" Button */}
        <div className="hidden sm:block">
          <a
            href="#contact"
            className="comic-button flex items-center gap-2 px-5 py-2.5 bg-[#0099FF] text-white font-comic text-lg rounded-xl font-bold tracking-wide hover:bg-[#0077E6]"
          >
            <span>LET'S TALK</span>
            <MessageSquare className="w-5 h-5 fill-white text-[#0099FF]" />
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 bg-[#FFD400] border-2.5 border-black shadow-[2px_2px_0px_#111] rounded-xl text-[#111111]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 stroke-[3]" /> : <Menu className="w-6 h-6 stroke-[3]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 bg-white border-3.5 border-black shadow-[6px_6px_0px_#111] rounded-2xl p-5 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-comic text-xl text-[#111111] hover:text-[#0099FF] py-1 border-b border-gray-200"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="comic-button text-center mt-2 px-4 py-3 bg-[#0099FF] text-white font-comic text-xl rounded-xl"
          >
            LET'S TALK 💬
          </a>
        </div>
      )}
    </header>
  );
}
