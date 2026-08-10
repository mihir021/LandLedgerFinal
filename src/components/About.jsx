import React from 'react';
import { GraduationCap, Flame, Zap } from 'lucide-react';
import { Doodle, SectionDoodleContainer } from './Doodle';

export function About() {
  return (
    <section id="about" className="py-20 px-4 bg-[#FFF8E7] relative halftone-pattern">
      <SectionDoodleContainer>
        <Doodle type="star" top="10%" right="5%" size="w-8 h-8" color="text-[#FFD400]" rotate="rotate-12" floatDelay={0.2} hideOnMobile={false} />
        <Doodle type="sparkle" bottom="12%" left="4%" size="w-7 h-7" color="text-[#FF4D5E]" rotate="-rotate-12" floatDelay={0.8} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#FF4D5E] text-white font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform -rotate-2 mb-3">
            WHO IS MIHIR? 🤔
          </div>
          <h2 className="text-5xl sm:text-6xl font-comic text-[#111111] tracking-wide">
            MEET THE BUILDER
          </h2>
          <div className="w-24 h-2 bg-[#FFD400] mx-auto mt-2 rounded-full border-2 border-black" />
        </div>

        {/* Profile & Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Comic Polaroid Card */}
          <div className="lg:col-span-5 relative">
            <div className="comic-card p-6 bg-white rounded-3xl relative overflow-hidden -rotate-2 border-3.5 border-[#111111] shadow-[6px_6px_0px_#111]">
              
              {/* Comic Polaroid Photo Box */}
              <div className="relative w-full h-64 bg-[#0099FF] rounded-2xl border-3.5 border-black flex flex-col items-center justify-center p-6 text-white text-center mb-6 overflow-hidden halftone-lightblue">
                <div className="w-24 h-24 bg-[#FFD400] rounded-full border-3 border-black flex items-center justify-center text-[#111111] font-comic text-4xl mb-3 shadow-[4px_4px_0px_#111]">
                  MR
                </div>
                <span className="font-comic text-3xl tracking-wider text-white drop-shadow-[2px_2px_0px_#111]">
                  FULL-STACK DEVELOPER
                </span>
                <span className="text-xs font-bold text-[#111111] bg-[#FFD400] px-3 py-1 rounded-lg border-2 border-black mt-2">
                  FULL-STACK • COMPETITIVE PROGRAMMER
                </span>
              </div>

              {/* Quick Stat Badges inside Polaroid */}
              <div className="space-y-3 font-semibold text-[#111111]">
                <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl border-2.5 border-black shadow-[2px_2px_0px_#111]">
                  <GraduationCap className="w-6 h-6 text-[#0099FF] flex-shrink-0 stroke-[2.5]" />
                  <span className="text-sm font-bold">B.E. IT @ LJIET (LJKU), Ahmedabad (2024–2028)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl border-2.5 border-black shadow-[2px_2px_0px_#111]">
                  <Flame className="w-6 h-6 text-[#FF4D5E] flex-shrink-0 stroke-[2.5]" />
                  <span className="text-sm font-bold">2 Live SaaS Products Shipped</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl border-2.5 border-black shadow-[2px_2px_0px_#111]">
                  <Zap className="w-6 h-6 text-[#FFD400] flex-shrink-0 stroke-[2.5]" />
                  <span className="text-sm font-bold">300+ LeetCode Solved &amp; GSSoC #301</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Speech Bubble Bio */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Speech Bubble Bio Card */}
            <div className="p-8 bg-white border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] rounded-3xl relative speech-bubble-left">
              <h3 className="text-3xl font-comic text-[#111111] mb-4 flex items-center gap-2">
                <span>"I BUILD PRODUCTS THAT ACTUALLY SHIP!"</span>
                <span className="text-2xl">⚡</span>
              </h3>
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4 font-bold">
                I’m an Information Technology undergraduate at <strong className="text-[#0099FF]">LJ Institute of Engineering &amp; Technology (LJKU), Ahmedabad</strong> (2024–2028). 
                Instead of just building sandbox practice apps, I build end-to-end production SaaS platforms like <strong className="text-[#FF4D5E]">Dinexa</strong> and <strong className="text-[#0099FF]">FormBuddy</strong>.
              </p>
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-bold">
                My engineering focus ranges from deep data structures in Java to scalable microservices with Python (Flask/Django) and Node.js. Whether it’s seat-locking algorithm transactions or AI resume scoring, I enjoy tackling hard engineering challenges.
              </p>
            </div>

            {/* 3 Core Pillars matching Stat Badge style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFD400] text-[#111111] border-3.5 border-black shadow-[4px_4px_0px_#111] rounded-2xl transform -rotate-1">
                <span className="font-comic text-xl block">1. FULL-STACK</span>
                <span className="text-xs font-bold">MERN, Django, Flask &amp; Redis performance caching.</span>
              </div>
              <div className="p-4 bg-[#0099FF] text-white border-3.5 border-black shadow-[4px_4px_0px_#111] rounded-2xl transform rotate-1">
                <span className="font-comic text-xl block">2. ALGORITHMS</span>
                <span className="text-xs font-bold text-sky-100">Custom BSTs, Graphs &amp; 300+ LeetCode solved.</span>
              </div>
              <div className="p-4 bg-[#3FCB6B] text-[#111111] border-3.5 border-black shadow-[4px_4px_0px_#111] rounded-2xl transform -rotate-1">
                <span className="font-comic text-xl block">3. PRODUCT CREATOR</span>
                <span className="text-xs font-bold">Idea to deployment, auth, payments &amp; analytics.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
