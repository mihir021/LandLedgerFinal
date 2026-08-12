import React from 'react';

/**
 * BrickButton Component — Tactile pressed-brick button
 * @param {'primary' | 'secondary' | 'outline' | 'demo'} variant
 * @param {boolean} showCornerStud - Adds a 3D stud accent in corner
 */
export default function BrickButton({
  children,
  variant = 'primary',
  showCornerStud = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-pixel text-sm font-bold uppercase tracking-wider rounded-sm border-2 border-[#0A1628] transition-all duration-150 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none";

  const variants = {
    primary: "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-[#0A1628] shadow-[4px_4px_0px_#0A1628] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0A1628]",
    secondary: "bg-[#0A1628] text-white shadow-[4px_4px_0px_rgba(212,175,55,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(212,175,55,0.4)] border-amber-500/40",
    outline: "bg-white text-gray-900 shadow-[3px_3px_0px_#0A1628] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#0A1628]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {showCornerStud && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300 border border-[#0A1628]/50 shadow-inner" />
      )}
      {children}
    </button>
  );
}
