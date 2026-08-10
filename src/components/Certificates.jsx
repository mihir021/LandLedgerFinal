import React from 'react';
import { certificates } from '../data/certificates';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Doodle, SectionDoodleContainer } from './Doodle';

export function Certificates() {
  return (
    <section id="certificates" className="py-20 px-4 bg-[#FFF8E7] relative">
      <SectionDoodleContainer>
        <Doodle type="star" top="10%" left="5%" size="w-8 h-8" color="text-[#FFD400]" rotate="-rotate-12" floatDelay={0.3} hideOnMobile={false} />
        <Doodle type="sparkle" bottom="8%" right="5%" size="w-8 h-8" color="text-[#9D4EDD]" rotate="rotate-12" floatDelay={0.7} hideOnMobile={true} />
      </SectionDoodleContainer>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block px-4 py-1.5 bg-[#9D4EDD] text-white font-comic text-xl rounded-xl border-3.5 border-black shadow-[4px_4px_0px_#111] transform -rotate-2 mb-3">
            VERIFIED CREDENTIALS 🏅
          </div>
          <h2 className="text-5xl sm:text-6xl font-comic text-[#111111] tracking-wide">
            CERTIFICATES &amp; BADGES
          </h2>
          <p className="text-base font-bold text-gray-700 max-w-xl mx-auto mt-2">
            Formal coursework &amp; specialized specializations from IBM, UPenn, UC San Diego, and Web3 DAOs.
          </p>
        </div>

        {/* Certificate Sticker Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: idx * 0.06 }}
                className={`comic-card bg-white p-6 rounded-3xl flex flex-col justify-between border-3.5 border-[#111111] shadow-[6px_6px_0px_#111] ${isEven ? '-rotate-1' : 'rotate-1'}`}
              >
                <div>
                  {/* Top Badge & Issuer */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`px-3 py-1 ${cert.color} text-white font-comic text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#111] uppercase tracking-wider`}>
                      {cert.badge}
                    </span>
                    <span className="font-comic text-sm text-[#111111] bg-[#FFD400] px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#111]">
                      {cert.date}
                    </span>
                  </div>

                  {/* Cert Title */}
                  <h3 className="font-comic text-2xl text-[#111111] leading-tight mb-2">
                    {cert.title}
                  </h3>

                  {/* Issuer */}
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-4">
                    <ShieldCheck className="w-4 h-4 text-[#0099FF] stroke-[2.5]" />
                    <span>{cert.issuer}</span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-[#FFF8E7] text-[11px] font-bold text-[#111111] rounded border border-black shadow-[1.5px_1.5px_0px_#111]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification Link Button matching Hero token */}
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="comic-button flex items-center justify-center gap-2 py-2.5 bg-[#FFD400] text-[#111111] font-comic text-lg rounded-xl border-3 border-black shadow-[4px_4px_0px_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111]"
                >
                  <span>VIEW CERTIFICATE</span>
                  <ExternalLink className="w-4 h-4 stroke-[3]" />
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
