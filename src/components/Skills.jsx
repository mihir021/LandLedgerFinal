import React, { useEffect, useRef, useState } from 'react';
import { skillCategories } from '../data/skills';
import { Code2, Layers, Database, Wrench, Zap } from 'lucide-react';
import { Doodle, SectionDoodleContainer } from './Doodle';

// ── Single animated bar ──────────────────────────────────────────────────────
function SkillBar({ targetPct, color, delay }) {
  const [width, setWidth] = useState('0%');
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Kick off animation after stagger delay
          const timer = setTimeout(() => setWidth(targetPct), delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetPct, delay]);

  return (
    <div
      ref={barRef}
      className="w-full h-4 bg-[#FFF8E7] rounded-full border-2.5 border-black p-0.5 overflow-hidden shadow-[2px_2px_0px_#111]"
    >
      <div
        className={`h-full ${color} rounded-full border-r-2 border-black`}
        style={{
          width,
          transition: `width 950ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }}
      />
    </div>
  );
}

// ── Main Skills section ───────────────────────────────────────────────────────
export function Skills() {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Code2':    return <Code2    className="w-6 h-6 stroke-[2.5]" />;
      case 'Layers':   return <Layers   className="w-6 h-6 stroke-[2.5] text-white" />;
      case 'Database': return <Database className="w-6 h-6 stroke-[2.5]" />;
      default:         return <Wrench   className="w-6 h-6 stroke-[2.5]" />;
    }
  };

  return (
    <section id="skills" className="py-20 px-4 bg-[#FFF8E7] relative halftone-pattern border-t-4 border-b-4 border-black">
      <SectionDoodleContainer>
        <Doodle type="lightning" top="8%"   left="5%"  size="w-8 h-12" color="text-[#FFD400]" rotate="-rotate-12" floatDelay={0.3} hideOnMobile={false} />
        <Doodle type="sparkle"   bottom="10%" right="6%" size="w-8 h-8"  color="text-[#0099FF]" rotate="rotate-12"  floatDelay={0.9} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#0099FF] text-white font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform rotate-2 mb-3">
            TECHNICAL ARSENAL 🛠️
          </div>
          <h2 className="text-5xl sm:text-6xl font-comic text-[#111111] tracking-wide">
            POWER-UP SKILLS
          </h2>
          <p className="text-base font-bold text-gray-700 max-w-xl mx-auto mt-2">
            Loaded with modern full-stack engines, data structures, and production deployment frameworks.
          </p>
        </div>

        {/* Skill Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((cat, catIdx) => (
            <div
              key={cat.category}
              className={`comic-card p-6 bg-white rounded-3xl relative border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] ${catIdx % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-3 border-black">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${cat.color} text-[#111111] rounded-xl border-2.5 border-black shadow-[2px_2px_0px_#111]`}>
                    {getIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="font-comic text-2xl text-[#111111] leading-none">{cat.category}</h3>
                    <span className="text-xs font-extrabold text-gray-600 uppercase">{cat.badge}</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[#FFD400] text-[#111111] font-comic text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#111]">
                  LEVEL MAX ⚡
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-5">
                {cat.skills.map((skill, skillIdx) => {
                  // Stagger: card offset (catIdx * 120ms) + skill offset (skillIdx * 100ms)
                  const delay = catIdx * 80 + skillIdx * 110;

                  return (
                    <div key={skill.name} className="space-y-1.5">
                      {/* Label row */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-[#111111] flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-[#FFD400] fill-[#FFD400]" />
                          {skill.name}
                        </span>
                        <span className="font-comic text-base text-[#0099FF]">{skill.power}</span>
                      </div>

                      {/* Animated bar — starts at 0, grows when scrolled into view */}
                      <SkillBar
                        targetPct={skill.power}
                        color={cat.color}
                        delay={delay}
                      />

                      <span className="block text-xs font-bold text-gray-600 pl-1">
                        {skill.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
