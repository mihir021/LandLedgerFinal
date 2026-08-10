import React from 'react';
import { motion } from 'framer-motion';
import { Download, Rocket, Trophy, Award, Terminal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doodle, SectionDoodleContainer } from './Doodle';
import { quickStats } from '../data/skills';

export function Hero() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0099FF', '#FFD400', '#FF4D5E', '#3FCB6B']
    });
  };

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 overflow-hidden halftone-pattern bg-[#FFF8E7]">
      {/* Curated Percentage-Positioned Section Doodles */}
      <SectionDoodleContainer>
        <Doodle type="star" top="8%" left="6%" size="w-10 h-10" color="text-[#FFD400]" rotate="-rotate-12" floatDelay={0} hideOnMobile={false} />
        <Doodle type="lightning" top="14%" right="8%" size="w-8 h-14" color="text-[#FF4D5E]" rotate="rotate-12" floatDelay={0.5} hideOnMobile={true} />
        <Doodle type="sparkle" bottom="18%" left="8%" size="w-8 h-8" color="text-[#0099FF]" rotate="-rotate-6" floatDelay={1} hideOnMobile={true} />
        <Doodle type="dev-tag" bottom="22%" right="6%" rotate="-rotate-3" floatDelay={1.5} hideOnMobile={false} />
      </SectionDoodleContainer>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Comic Sound Effect Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFD400] text-[#111111] font-comic text-lg uppercase tracking-wider rounded-xl border-3.5 border-[#111111] shadow-[4px_4px_0px_#111] transform -rotate-2 mb-6"
        >
          <Sparkles className="w-5 h-5 fill-[#111111]" />
          <span>FULL-STACK SOFTWARE DEVELOPER</span>
        </motion.div>

        {/* Main Comic Display Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-comic text-[#111111] tracking-wide leading-none mb-6 drop-shadow-[5px_5px_0px_#FFD400]"
        >
          RATHOD MIHIR
        </motion.h1>

        {/* Speech Bubble Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative inline-block max-w-2xl mx-auto mb-10 px-6 py-4 bg-white border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] rounded-2xl speech-bubble-bottom"
        >
          <p className="text-xl sm:text-2xl font-bold text-[#111111]">
            "Turning ideas into <span className="underline decoration-[#FF4D5E] decoration-4">high-performance</span> web applications &amp; SaaS platforms."
          </p>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            B.E. IT @ LJIET • Competitive Programmer • Builder of Dinexa &amp; FormBuddy
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="#projects"
            className="comic-button flex items-center gap-3 px-8 py-4 bg-[#FFD400] text-[#111111] font-comic text-2xl rounded-xl font-black hover:bg-[#ffe140] border-3.5 border-black shadow-[6px_6px_0px_#111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#111]"
          >
            <span>VIEW PROJECTS</span>
            <Rocket className="w-6 h-6 stroke-[3]" />
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={triggerConfetti}
            className="comic-button flex items-center gap-3 px-8 py-4 bg-[#0099FF] text-white font-comic text-2xl rounded-xl font-black hover:bg-[#0077E6] border-3.5 border-black shadow-[6px_6px_0px_#111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#111]"
          >
            <span>DOWNLOAD RESUME</span>
            <Download className="w-6 h-6 stroke-[3]" />
          </a>
        </motion.div>

        {/* Comic Stat Badges Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 bg-white border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] rounded-2xl ${idx % 2 === 0 ? '-rotate-1' : 'rotate-1'} flex items-center gap-3 text-left`}
            >
              <div className={`p-3 ${stat.color} text-[#111111] rounded-xl border-2.5 border-black flex-shrink-0 shadow-[2px_2px_0px_#111]`}>
                {stat.icon === 'Trophy' && <Trophy className="w-6 h-6 stroke-[2.5]" />}
                {stat.icon === 'Award' && <Award className="w-6 h-6 stroke-[2.5]" />}
                {stat.icon === 'Rocket' && <Rocket className="w-6 h-6 stroke-[2.5] text-white" />}
                {stat.icon === 'GraduationCap' && <Terminal className="w-6 h-6 stroke-[2.5]" />}
              </div>
              <div>
                <span className="font-comic text-3xl text-[#111111] leading-none block">{stat.value}</span>
                <span className="block font-bold text-xs text-[#111111]">{stat.label}</span>
                <span className="block text-[11px] font-semibold text-gray-500">{stat.sub}</span>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
