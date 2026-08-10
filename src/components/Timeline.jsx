import React from 'react';
import { timelineData } from '../data/timeline';
import { Calendar, Award, Rocket, GraduationCap, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Doodle, SectionDoodleContainer } from './Doodle';

export function Timeline() {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Education': return <GraduationCap className="w-5 h-5 stroke-[2.5]" />;
      case 'Certification': return <Award className="w-5 h-5 stroke-[2.5]" />;
      case 'Hackathon': return <Trophy className="w-5 h-5 stroke-[2.5]" />;
      case 'SaaS Launch': return <Rocket className="w-5 h-5 stroke-[2.5] text-white" />;
      default: return <Sparkles className="w-5 h-5 stroke-[2.5]" />;
    }
  };

  return (
    <section id="timeline" className="py-20 px-4 bg-[#FFF8E7] relative halftone-pattern border-t-4 border-b-4 border-black">
      <SectionDoodleContainer>
        <Doodle type="star" top="8%" right="6%" size="w-8 h-8" color="text-[#FFD400]" rotate="rotate-12" floatDelay={0.2} hideOnMobile={false} />
        <Doodle type="lightning" bottom="10%" left="4%" size="w-7 h-12" color="text-[#FF4D5E]" rotate="-rotate-12" floatDelay={0.7} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Title Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#3FCB6B] text-[#111111] font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform rotate-2 mb-3">
            CHRONOLOGICAL STRIP 📜
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-comic text-[#111111] tracking-wide">
            JOURNEY &amp; MILESTONES
          </h2>
          <p className="text-base font-bold text-gray-700 max-w-xl mx-auto mt-2">
            From entering engineering school to launching SaaS platforms and scoring top global hackathon ranks.
          </p>
        </div>

        {/* Timeline Strip */}
        <div className="relative border-l-4 border-black pl-6 sm:pl-10 ml-4 sm:ml-8 space-y-8">
          {timelineData.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: idx * 0.04 }}
                className="relative"
              >
                {/* Comic Node Connector Badge on Timeline Bar */}
                <div className={`absolute -left-[43px] sm:-left-[61px] top-2 w-10 h-10 ${item.color} text-[#111111] rounded-xl border-3 border-black shadow-[3px_3px_0px_#111] flex items-center justify-center font-bold`}>
                  {getCategoryIcon(item.category)}
                </div>

                {/* Comic Panel Card matching Hero Stat Card Shell */}
                <div className={`comic-card bg-white p-5 rounded-2xl border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] ${isEven ? '-rotate-1' : 'rotate-1'}`}>
                  
                  {/* Top Bar with Badge & Year */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className={`px-3 py-0.5 ${item.color} text-white font-comic text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#111]`}>
                      {item.badge}
                    </span>
                    <span className="font-comic text-lg text-[#0099FF] flex items-center gap-1">
                      <Calendar className="w-4 h-4 stroke-[2.5]" />
                      {item.year}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-comic text-2xl text-[#111111] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">
                    {item.description}
                  </p>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
