import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, Swords } from 'lucide-react';
import legoMinifigureImg from '../assets/lego_minifigure_left.png';

/**
 * Floating 3D LEGO Minifigure Warrior Sculpture (Left Side)
 */
export function LegoVisualLeft() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center absolute left-4 xl:left-12 top-1/2 -translate-y-1/2 pointer-events-none z-0">
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotateY: [-8, 8, -8],
          rotateX: [4, -4, 4],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center justify-center p-2"
        style={{ perspective: 1000 }}
      >
        {/* Floating Header Tag */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-3 inline-flex items-center gap-1.5 rounded-sm bg-[#0A1628] border-2 border-amber-400 px-3 py-1 shadow-[3px_3px_0px_#060D17]"
        >
          <Swords className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-pixel text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            REGISTRY GUARDIAN
          </span>
        </motion.div>

        {/* 3D LEGO Minifigure Sculpture Image Container */}
        <div className="relative w-52 xl:w-64 flex flex-col items-center group">
          <img
            src={legoMinifigureImg}
            alt="3D LEGO Minifigure Guardian"
            className="w-full h-auto object-contain rounded-sm filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)] mix-blend-multiply"
          />

          {/* Pedestal Tag */}
          <div className="mt-2 rounded-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 border-2 border-[#0A1628] px-3 py-1 shadow-[3px_3px_0px_#0A1628]">
            <span className="font-pixel text-[10px] font-black text-[#0A1628] uppercase tracking-widest">
              VOXEL WARRIOR #01
            </span>
          </div>
        </div>

        {/* Dynamic Shadow Plate underneath */}
        <motion.div
          animate={{
            scale: [1, 0.85, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-44 h-3 bg-black rounded-full blur-md mt-2 transform scale-y-50"
        />
      </motion.div>
    </div>
  );
}

/**
 * Floating 3D LEGO House / Deed Block (Right Side)
 */
export function LegoVisualRight() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center absolute right-6 xl:right-14 top-1/2 -translate-y-1/2 pointer-events-none z-0">
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotateY: [12, -12, 12],
          rotateX: [-6, 6, -6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center justify-center p-6"
        style={{ perspective: 1000 }}
      >
        {/* Floating Header Tag */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-amber-400 border-2 border-[#0A1628] px-3 py-1 shadow-[3px_3px_0px_#0A1628]"
        >
          <FileCheck className="h-3.5 w-3.5 text-[#0A1628]" />
          <span className="font-pixel text-[11px] font-bold text-[#0A1628] uppercase tracking-wider">
            SMART DEED ACTIVE
          </span>
        </motion.div>

        {/* 3D LEGO House / Deed Module */}
        <div className="relative w-40 sm:w-44 flex flex-col items-center">
          {/* Triangular Roof Roof Block */}
          <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[30px] border-b-amber-500 filter drop-shadow-[2px_2px_0px_#0A1628] mb-[-2px] relative z-10" />

          {/* House Roof Studs */}
          <div className="flex gap-2 mb-1 relative z-20">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border border-[#0A1628] shadow-inner"
              />
            ))}
          </div>

          {/* Main House Body — Navy Brick */}
          <div className="w-full h-20 rounded-sm bg-[#0A1628] border-2 border-amber-400/80 shadow-[5px_5px_0px_#0A1628] p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              {/* Left Window */}
              <div className="w-5 h-5 rounded-sm bg-amber-400/30 border border-amber-400/70 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-300" />
              </div>
              <span className="font-pixel text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                IMMUTABLE
              </span>
              {/* Right Window */}
              <div className="w-5 h-5 rounded-sm bg-amber-400/30 border border-amber-400/70 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-300" />
              </div>
            </div>

            {/* House Door */}
            <div className="flex justify-center">
              <div className="w-6 h-8 rounded-t-sm bg-amber-500 border-2 border-amber-300 flex items-end justify-end p-0.5">
                <div className="w-1 h-1 rounded-full bg-[#0A1628]" />
              </div>
            </div>
          </div>
        </div>

        {/* Shadow Plate underneath */}
        <div className="w-36 h-3 bg-black/15 rounded-full blur-sm mt-4 transform scale-y-50" />
      </motion.div>
    </div>
  );
}
