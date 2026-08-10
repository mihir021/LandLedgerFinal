import React from 'react';

export function ComicStar({ className = '', color = '#FFD400', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`filter drop-shadow-[3px_3px_0px_#111111] ${className}`}
    >
      <polygon
        points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
        fill={color}
        stroke="#111111"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ComicSparkle({ className = '', color = '#FF4D5E', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`filter drop-shadow-[2.5px_2.5px_0px_#111111] ${className}`}
    >
      <path
        d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"
        fill={color}
        stroke="#111111"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ComicLightning({ className = '', color = '#FFD400', size = 36 }) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 60 100"
      className={`filter drop-shadow-[3px_3px_0px_#111111] ${className}`}
    >
      <polygon
        points="35,0 0,55 25,55 15,100 55,40 30,40"
        fill={color}
        stroke="#111111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DevTagBadge({ className = '' }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 bg-[#0099FF] text-white font-comic text-lg rounded-md border-2 border-black shadow-[3px_3px_0px_#111] transform -rotate-3 ${className}`}>
      &lt;/&gt; DEV
    </div>
  );
}
