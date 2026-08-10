import React from 'react';
import { motion } from 'framer-motion';

export function Doodle({
  type = 'star',
  top,
  left,
  right,
  bottom,
  size = 'w-10 h-10',
  color = 'text-[#FFD400]',
  rotate = 'rotate-12',
  floatDelay = 0,
  hideOnMobile = true,
  className = ''
}) {
  const style = {};
  if (top !== undefined) style.top = top;
  if (left !== undefined) style.left = left;
  if (right !== undefined) style.right = right;
  if (bottom !== undefined) style.bottom = bottom;

  const renderShape = () => {
    switch (type) {
      case 'sparkle':
        return (
          <svg viewBox="0 0 100 100" className={`${size} ${color} filter drop-shadow-[2px_2px_0px_#111111]`}>
            <path
              d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"
              fill="currentColor"
              stroke="#111111"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'lightning':
        return (
          <svg viewBox="0 0 60 100" className={`${size} ${color} filter drop-shadow-[2px_2px_0px_#111111]`}>
            <polygon
              points="35,0 0,55 25,55 15,100 55,40 30,40"
              fill="currentColor"
              stroke="#111111"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'dev-tag':
        return (
          <div className="inline-flex items-center px-2.5 py-1 bg-[#0099FF] text-white font-comic text-sm sm:text-base rounded-md border-2 border-black shadow-[3px_3px_0px_#111]">
            &lt;/&gt; DEV
          </div>
        );
      case 'burst':
        return (
          <svg viewBox="0 0 100 100" className={`${size} ${color} filter drop-shadow-[2px_2px_0px_#111111]`}>
            <path
              d="M50 0 L58 32 L90 15 L73 45 L100 60 L68 68 L75 100 L48 78 L25 98 L32 66 L0 55 L30 42 L12 12 L42 28 Z"
              fill="currentColor"
              stroke="#111111"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'star':
      default:
        return (
          <svg viewBox="0 0 100 100" className={`${size} ${color} filter drop-shadow-[2px_2px_0px_#111111]`}>
            <polygon
              points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
              fill="currentColor"
              stroke="#111111"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <motion.div
      style={style}
      animate={{
        y: [0, -8, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: floatDelay,
      }}
      className={`absolute pointer-events-none select-none z-0 ${rotate} ${
        hideOnMobile ? 'hidden md:block' : 'block'
      } ${className}`}
    >
      {renderShape()}
    </motion.div>
  );
}

export function SectionDoodleContainer({ children }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {children}
    </div>
  );
}
