import React from 'react';
import { motion } from 'framer-motion';

/**
 * BrickPanel Component — Reusable building-block module wrapper
 * @param {boolean} showStuds - Whether to display top 3D studs
 * @param {number} studCount - Number of studs across top edge (default: 6)
 * @param {'primary' | 'secondary' | 'accent'} variant - Color & shadow theme
 */
export default function BrickPanel({
  children,
  showStuds = false,
  studCount = 6,
  variant = 'primary',
  className = '',
  animateSnap = true,
  delay = 0,
  ...props
}) {
  const variantStyles = {
    primary: 'border-2 border-[#475569] bg-white shadow-[6px_6px_0px_rgba(212,175,55,0.4)]',
    secondary: 'border-2 border-[#475569] bg-white shadow-[4px_4px_0px_#475569]',
    accent: 'border-2 border-[#D4AF37] bg-[#0D1B2A] text-white shadow-[6px_6px_0px_#060D17]',
  };

  const panelContent = (
    <div
      className={`relative rounded-sm p-6 sm:p-8 transition-all ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {/* Top 3D Studs Row */}
      {showStuds && (
        <div className="absolute -top-3 left-4 right-4 flex justify-between pointer-events-none z-10 px-2">
          {Array.from({ length: studCount }).map((_, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border border-[#475569]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_3px_rgba(0,0,0,0.3)]"
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );

  if (!animateSnap) return panelContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 20,
        delay,
      }}
    >
      {panelContent}
    </motion.div>
  );
}
