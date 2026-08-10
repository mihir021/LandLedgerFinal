import React, { useState } from 'react';
import { projects } from '../data/projects';
import { ProjectCard } from './ProjectCard';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doodle, SectionDoodleContainer } from './Doodle';

export function ProjectsGrid() {
  const [showAllModal, setShowAllModal] = useState(false);

  const featuredProjects = projects.filter((p) => p.featured);
  const remainingProjects = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-20 px-4 bg-[#FFF8E7] relative">
      <SectionDoodleContainer>
        <Doodle type="star" top="6%" left="4%" size="w-9 h-9" color="text-[#FFD400]" rotate="-rotate-12" floatDelay={0.4} hideOnMobile={false} />
        <Doodle type="sparkle" top="10%" right="5%" size="w-8 h-8" color="text-[#FF4D5E]" rotate="rotate-12" floatDelay={0.8} hideOnMobile={true} />
        <Doodle type="dev-tag" bottom="8%" left="3%" rotate="rotate-6" floatDelay={1.2} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#FFD400] text-[#111111] font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform -rotate-2 mb-3">
            FEATURED BUILDS 🚀
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-comic text-[#111111] tracking-wide">
            PROJECT SHOWCASE
          </h2>
          <p className="text-base font-bold text-gray-700 max-w-xl mx-auto mt-2">
            Production SaaS, AI engines, and algorithm solutions built with MERN, Django, Flask &amp; Next.js.
          </p>
        </div>

        {/* Featured Projects Grid (Top 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>

        {/* View All Projects Action Button matching Hero Button token */}
        <div className="text-center">
          <button
            onClick={() => setShowAllModal(!showAllModal)}
            className="comic-button inline-flex items-center gap-3 px-8 py-4 bg-[#0099FF] text-white font-comic text-2xl rounded-xl font-black border-3.5 border-black shadow-[6px_6px_0px_#111] hover:bg-[#0077E6] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_#111]"
          >
            <Layers className="w-6 h-6 stroke-[3]" />
            <span>{showAllModal ? 'HIDE ADDITIONAL PROJECTS' : 'VIEW ALL PROJECTS (9)'}</span>
            {showAllModal ? <ChevronUp className="w-6 h-6 stroke-[3]" /> : <ChevronDown className="w-6 h-6 stroke-[3]" />}
          </button>
        </div>

        {/* Expanded Projects Section */}
        <AnimatePresence>
          {showAllModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="mt-12 pt-12 border-t-4 border-dashed border-black overflow-hidden"
            >
              <div className="text-center mb-8">
                <span className="font-comic text-3xl text-[#111111] bg-[#FF4D5E] text-white px-4 py-1.5 rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111]">
                  MORE EXPLORATIONS &amp; LAB EXPERIMENTS 🧪
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {remainingProjects.map((project, idx) => (
                  <ProjectCard key={project.id} project={project} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
