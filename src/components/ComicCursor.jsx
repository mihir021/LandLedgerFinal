import React, { useEffect, useRef, useState } from 'react';

export function ComicCursor() {
  const cursorRef = useRef(null);
  const badgeRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const stateRef = useRef({ hovered: false, cardHovered: false, clicked: false });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsMobile(true);
      return;
    }

    document.body.classList.add('custom-comic-cursor-active');

    // Badge text & color state (DOM manipulation for zero-React overhead)
    const setBadge = (text, bgClass) => {
      if (!badgeRef.current) return;
      badgeRef.current.textContent = text;
      badgeRef.current.className = [
        'inline-block px-2 py-0.5 font-comic text-xs rounded-md border-2 border-black shadow-[2px_2px_0px_#111] whitespace-nowrap',
        bgClass
      ].join(' ');
    };

    setBadge('POW!', 'bg-[#FFD400] text-[#111111]');

    // Single rAF loop — zero setTimeout/setInterval lag
    const loop = () => {
      const { x: tx, y: ty } = posRef.current;
      const trail = trailRef.current;

      // Lerp the trailing badge (smooth chase, ~8 frames lag)
      trail.x += (tx - trail.x) * 0.45;
      trail.y += (ty - trail.y) * 0.45;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      }
      if (badgeRef.current) {
        badgeRef.current.parentElement.style.transform =
          `translate3d(${trail.x + 24}px,${trail.y + 24}px,0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = () => {
      stateRef.current.clicked = true;
      if (cursorRef.current) cursorRef.current.style.transform += ' scale(0.82)';
      setBadge('BOOM! 💥', 'bg-[#FF4D5E] text-white animate-pulse');
    };

    const onMouseUp = () => {
      stateRef.current.clicked = false;
      const { hovered, cardHovered } = stateRef.current;
      if (hovered) setBadge('CLICK! ⚡', 'bg-[#0099FF] text-white');
      else if (cardHovered) setBadge('POP! 🎨', 'bg-[#3FCB6B] text-[#111111]');
      else setBadge('POW!', 'bg-[#FFD400] text-[#111111]');
    };

    const onMouseOver = (e) => {
      const t = e.target;
      const isBtn = t.closest('button') || t.closest('a') || t.tagName === 'BUTTON' || t.tagName === 'A';
      const isCard = t.closest('.comic-card');

      if (isBtn) {
        stateRef.current = { ...stateRef.current, hovered: true, cardHovered: false };
        setBadge('CLICK! ⚡', 'bg-[#0099FF] text-white');
      } else if (isCard) {
        stateRef.current = { ...stateRef.current, hovered: false, cardHovered: true };
        setBadge('POP! 🎨', 'bg-[#3FCB6B] text-[#111111]');
      } else {
        stateRef.current = { ...stateRef.current, hovered: false, cardHovered: false };
        setBadge('POW!', 'bg-[#FFD400] text-[#111111]');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.body.classList.remove('custom-comic-cursor-active');
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* ── Primary cursor: zero CSS transition, driven purely by rAF ── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] origin-top-left"
        style={{ willChange: 'transform' }}
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-[2px_2px_0px_#111]">
          {/* Outer body — yellow pop */}
          <polygon
            points="0,0 10,28 15,17 26,16"
            fill="#FFD400"
            stroke="#111111"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner accent — light blue strip */}
          <polygon
            points="4,5 11,21 14,14 21,13"
            fill="#0099FF"
          />
        </svg>
      </div>

      {/* ── Trailing badge wrapper: rAF lerp position, no CSS transition ── */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] hidden sm:block"
        style={{ willChange: 'transform' }}
      >
        <span
          ref={badgeRef}
          className="inline-block px-2 py-0.5 font-comic text-xs rounded-md border-2 border-black shadow-[2px_2px_0px_#111] whitespace-nowrap bg-[#FFD400] text-[#111111]"
        >
          POW!
        </span>
      </div>
    </>
  );
}
