import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function ProjectCard({ project, index }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.07 }}
      className={`comic-card bg-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] ${isEven ? '-rotate-1' : 'rotate-1'}`}
    >
      <div>
        {/* Top Banner Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 ${project.color} ${project.textColor} font-comic text-xs sm:text-sm rounded-xl border-2 border-black shadow-[2px_2px_0px_#111] uppercase tracking-wider`}>
              {project.badge}
            </span>
            {project.live && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#111111] bg-[#3FCB6B] px-2.5 py-1 rounded-xl border-2 border-black">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                LIVE
              </span>
            )}
          </div>
          <span className="font-comic text-xs sm:text-sm text-[#111111] bg-[#FFD400] px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#111]">
            {project.comicBadge}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="font-comic text-3xl sm:text-4xl text-[#111111] leading-none mb-2" style={{ transition: 'color 80ms ease' }}>
          {project.title}
        </h3>

        {/* Tagline */}
        <p className="text-sm font-bold text-gray-700 mb-4 line-clamp-2">
          {project.tagline}
        </p>

        {/* Bullet Highlights */}
        <div className="space-y-2 mb-6">
          {project.highlights.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-bold text-gray-800">
              <CheckCircle className="w-4 h-4 text-[#3FCB6B] flex-shrink-0 mt-0.5 stroke-[2.5]" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area: Tech Stack & Action Links */}
      <div className="pt-4 border-t-2.5 border-dashed border-black/30">
        
        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 bg-[#FFF8E7] text-[#111111] text-[11px] font-bold rounded-lg border border-black shadow-[1.5px_1.5px_0px_#111]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons matching Hero Button Token */}
        <div className="flex items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-button flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FFD400] text-[#111111] font-comic text-lg rounded-xl border-3 border-black shadow-[4px_4px_0px_#111]"
            >
              <span>Visit Live</span>
              <ExternalLink className="w-4 h-4 stroke-[3]" />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-button p-2.5 bg-[#111111] text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_#111]"
              aria-label={`GitHub Repository for ${project.title}`}
            >
              <FaGithub className="w-5 h-5" />
            </a>
          )}
        </div>

      </div>
    </motion.div>
  );
}
