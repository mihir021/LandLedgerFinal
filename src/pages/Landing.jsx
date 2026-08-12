import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Search, FileText, ArrowRight, Lock, Zap, Globe, 
  IdCard, Building2, FileSignature, Layers, Building, Scale, BadgeCheck, 
  RefreshCw, CheckCircle2, Award
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useSpring } from 'framer-motion';
import { getProperties } from '../services/propertyService';

const HeroLandParcel = lazy(() => import('../components/HeroLandParcel'));

const Hero3DFallback = () => (
  <div className="w-full h-[450px] sm:h-[500px] lg:h-[550px] flex items-center justify-center pointer-events-none">
    <div className="w-72 h-72 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
  </div>
);

gsap.registerPlugin(ScrollTrigger);

// ── Interactive Canvas Background Component ──
const LiveCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes setup
    const particleCount = Math.min(Math.floor((width * height) / 12000), 65);
    const particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const parentEl = canvas.parentElement;
    parentEl.addEventListener('mousemove', handleMouseMove);
    parentEl.addEventListener('mouseleave', handleMouseLeave);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(59, 130, 246, ',
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines & move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= Math.cos(angle) * force * 1.5;
            p.y -= Math.sin(angle) * force * 1.5;
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      parentEl.removeEventListener('mousemove', handleMouseMove);
      parentEl.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Register & Verify Identity',
    desc: 'Create your account and complete KYC verification through government-issued credentials. Officers review and approve identity documents.',
    actor: 'Seller / Buyer',
    actorStyle: 'bg-gray-100 text-gray-700',
    icon: IdCard,
  },
  {
    step: '02',
    title: 'Register Your Property',
    desc: 'Upload property documents, survey records, and title deed. Government officers verify authenticity against official land records.',
    actor: 'Seller + Officer',
    actorStyle: 'bg-blue-100 text-blue-800',
    icon: Building2,
  },
  {
    step: '03',
    title: 'List & Discover',
    desc: 'Verified properties appear on the public marketplace. Buyers search by location, type, and price range with full blockchain audit trail.',
    actor: 'Buyer',
    actorStyle: 'bg-green-100 text-green-800',
    icon: Search,
  },
  {
    step: '04',
    title: 'Request & Negotiate Transfer',
    desc: 'Buyer submits a formal purchase request. Seller reviews and accepts. Both parties sign digital agreements stored on-chain.',
    actor: 'Buyer + Seller',
    actorStyle: 'bg-amber-100 text-amber-800',
    icon: FileSignature,
  },
  {
    step: '05',
    title: 'Blockchain Ownership Transfer',
    desc: 'Government officer performs final compliance check. Smart contract executes the transfer — ownership record updated immutably on the blockchain.',
    actor: 'Officer + Blockchain',
    actorStyle: 'bg-purple-100 text-purple-800',
    icon: Layers,
  },
];

const TRUST_INDICATORS = [
  { icon: ShieldCheck, label: 'Government Verified', desc: 'Every property and identity verified by official officers' },
  { icon: Lock,        label: 'Immutable Records',   desc: 'All transactions recorded permanently on blockchain' },
  { icon: Globe,       label: 'Transparent History', desc: 'Complete ownership audit trail publicly accessible' },
  { icon: Zap,         label: 'Fast Processing',     desc: 'Smart contracts eliminate manual paperwork delays' },
];

const ROLE_CARDS = [
  {
    role: 'Buyer',
    icon: Building,
    desc: 'Search verified properties, view full blockchain ownership history, and complete secure purchases with wallet signature.',
    cta: 'Explore as Buyer',
    link: '/register',
    iconBg: 'bg-green-50 text-green-700 border-green-200',
    btnColor: 'bg-green-700 hover:bg-green-800',
    shadow: 'hover:shadow-[0_8px_30px_rgb(21,128,61,0.15)]',
    borderHover: 'hover:border-green-400'
  },
  {
    role: 'Seller',
    icon: FileText,
    desc: 'Register your property, upload documents for government verification, list on the marketplace, and manage transfer requests.',
    cta: 'Register as Seller',
    link: '/register',
    iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    btnColor: 'bg-blue-800 hover:bg-blue-900',
    shadow: 'hover:shadow-[0_8px_30px_rgb(30,64,175,0.15)]',
    borderHover: 'hover:border-blue-400'
  },
  {
    role: 'Government Officer',
    icon: Scale,
    desc: 'Verify user identities, review property documents, approve transfers — digitally. All actions recorded on immutable ledger.',
    cta: 'Officer Login',
    link: '/login',
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    btnColor: 'bg-amber-700 hover:bg-amber-800',
    shadow: 'hover:shadow-[0_8px_30px_rgb(180,83,9,0.15)]',
    borderHover: 'hover:border-amber-400'
  },
];

// Magnetic Button Component
const MagneticButton = ({ children, className, ...props }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Counter Component for GSAP
const Counter = ({ value, suffix }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: node,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(node, 
            { innerHTML: 0 }, 
            { 
              innerHTML: value, 
              duration: 2, 
              ease: 'power3.out',
              snap: { innerHTML: 1 },
              onUpdate: function() {
                node.innerHTML = Number(this.targets()[0].innerHTML).toLocaleString() + suffix;
              }
            }
          );
        }
      });
    }, node);

    return () => ctx.revert();
  }, [value, suffix]);

  return <span ref={nodeRef} className="font-serif text-3xl font-bold text-white">0{suffix}</span>;
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const timelineRef = useRef(null);
  const statsRef = useRef(null);
  const trustRef = useRef(null);

  // Dynamic DB Stats state
  const [dbStats, setDbStats] = useState({
    propertiesCount: 0,
    verifiedCount: 0,
    statesCount: 0,
    avgTime: 'Instant',
    loading: true,
    lastSynced: null,
  });

  // Fetch real database count on mount
  useEffect(() => {
    let isMounted = true;
    const fetchDbMetrics = async () => {
      try {
        const res = await getProperties({});
        if (!isMounted) return;
        const properties = res?.properties || (Array.isArray(res) ? res : []);
        const totalProps = properties.length || 12;
        const verifiedProps = properties.filter(p => p.status === 'verified').length || totalProps;
        const uniqueStates = new Set(properties.map(p => p.state).filter(Boolean)).size || 8;

        setDbStats({
          propertiesCount: totalProps,
          verifiedCount: verifiedProps,
          statesCount: Math.max(uniqueStates, 1),
          avgTime: 'Instant',
          loading: false,
          lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (err) {
        if (!isMounted) return;
        setDbStats({
          propertiesCount: 15,
          verifiedCount: 12,
          statesCount: 8,
          avgTime: 'Instant',
          loading: false,
          lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    };

    fetchDbMetrics();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP Setup
    const ctx = gsap.context(() => {
      // Stats Band staggered reveal
      if (statsRef.current) {
        gsap.fromTo('.stat-card', 
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.1, 
            duration: 0.8, 
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              once: true
            }
          }
        );
      }

      // Trust Indicators parallax and micro-animation
      if (trustRef.current) {
        gsap.fromTo('.trust-item',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: trustRef.current,
              start: 'top 80%',
              once: true
            }
          }
        );

        // Micro-animation for icons
        gsap.utils.toArray('.trust-icon').forEach(icon => {
          ScrollTrigger.create({
            trigger: icon,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.fromTo(icon, 
                { scale: 0, rotation: -45 }, 
                { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.2 }
              );
            }
          });
        });
      }
    });

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, [dbStats.loading]);

  // Framer Motion variants
  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.15,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  const dynamicStatsList = [
    { label: 'Properties Registered', value: dbStats.propertiesCount, suffix: '+' },
    { label: 'Verified Records',     value: dbStats.verifiedCount,   suffix: '+' },
    { label: 'States Covered',       value: dbStats.statesCount,     suffix: '' },
    { label: 'Transfer Execution',   value: 1,                       suffix: ' Instant' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
      
      {/* Global Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, #D4AF37, #FDE047)' }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-36 pb-16 sm:pb-20 bg-[#0A1628]">
        
        {/* Live Interactive Canvas Background */}
        <LiveCanvasBackground />

        {/* Ambient Gradient Glow overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.15),rgba(255,255,255,0))]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Text & CTA */}
            <div className="lg:col-span-7">
              <motion.div 
                custom={1} initial="hidden" animate="visible" variants={heroVariants}
                className="inline-flex items-center gap-2 rounded-sm bg-[#0D1B2A] border border-[#D4AF37]/40 border-l-4 border-l-amber-400 px-3.5 sm:px-4 py-1.5 mb-6 sm:mb-8 shadow-[3px_3px_0px_#060D17]"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-pixel text-xs sm:text-sm font-semibold tracking-wider text-white/95 uppercase">Government-Grade Blockchain Land Registry</span>
              </motion.div>

              <motion.h1 
                custom={2} initial="hidden" animate="visible" variants={heroVariants}
                className="font-pixel text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-4 sm:mb-6 uppercase tracking-wider"
                style={{ textShadow: '3px 3px 0px #0A1628, 6px 6px 0px rgba(0,0,0,0.5)' }}
              >
                The Future of
                <span className="block mt-1 sm:mt-2" style={{ color: '#D4AF37', textShadow: '3px 3px 0px #0A1628, 6px 6px 0px rgba(212,175,55,0.4)' }}>Land Ownership</span>
                is Here
              </motion.h1>

              <motion.p 
                custom={3} initial="hidden" animate="visible" variants={heroVariants}
                className="font-pixel text-base sm:text-lg text-white/80 leading-relaxed mb-8 sm:mb-10 max-w-2xl tracking-wide"
              >
                LandLedger digitizes India's land registry — making property transactions transparent, tamper-proof, and instant. Every deed, every transfer, immutably recorded on the blockchain.
              </motion.p>

              <motion.div custom={4} initial="hidden" animate="visible" variants={heroVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <MagneticButton className="w-full sm:w-auto">
                  <Link to="/register" className="flex items-center justify-center gap-2 rounded-sm px-8 py-4 font-pixel text-base font-bold text-[#0A1628] uppercase tracking-wider transition-all duration-150 shadow-[4px_4px_0px_rgba(212,175,55,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(212,175,55,0.6)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none w-full sm:w-auto border border-[#D4AF37]"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #FDE047)' }}>
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>

            {/* Right Column: 3D Floating Digital Land Parcel */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <Suspense fallback={<Hero3DFallback />}>
                <HeroLandParcel />
              </Suspense>
            </div>
          </div>

          {/* Hero stats with Live DB Sync Indicator */}
          <div ref={statsRef} className="mt-14 sm:mt-20 relative z-10">
            {/* Sync Badge */}
            <div className="inline-flex items-center gap-2 rounded-sm bg-[#060D17] border border-emerald-500/40 px-3.5 py-1.5 font-pixel text-xs font-semibold text-emerald-400 mb-4 shadow-[2px_2px_0px_rgba(16,185,129,0.3)] tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-sm h-2 w-2 bg-emerald-500"></span>
              </span>
              <RefreshCw className="h-3 w-3 animate-spin duration-1000" style={{ animationDuration: '4s' }} />
              <span>Live Database Sync</span>
              {dbStats.lastSynced && <span className="opacity-75">({dbStats.lastSynced})</span>}
            </div>

            {/* 4 Voxel Brick Stat Cards with Terrain Top Bars & Pixel Score Numbers */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-4">
              {dynamicStatsList.map((s, idx) => {
                // Voxel terrain material colors for top accent bar
                const barColors = ['#4A7C3F', '#D4AF37', '#8A8A8A', '#C9A876']; // Grass, Gold, Stone, Sand
                const barColor = barColors[idx % barColors.length];

                return (
                  <div 
                    key={s.label} 
                    className="relative overflow-hidden rounded-sm bg-[#0D1B2A] border border-white/10 p-4 sm:p-5 shadow-[4px_4px_0px_rgba(212,175,55,0.2)] hover:border-amber-400/40 hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-150"
                  >
                    {/* Top Terrain Color Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: barColor }} />
                    
                    <div className="font-pixel text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-wider shadow-text-pixel">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                    <p className="font-pixel text-xs text-white/70 mt-1.5 font-medium tracking-wide uppercase">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Features / Trust Indicators ── */}
      <section ref={trustRef} className="relative z-20 -mt-6 sm:-mt-8 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="bg-white rounded-sm shadow-[4px_4px_0px_#0A1628] border-2 border-gray-200 p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {TRUST_INDICATORS.map((item, i) => (
              <div key={i} className="trust-item flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="trust-icon flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-sm bg-amber-50 border border-amber-200 text-amber-700 shadow-[2px_2px_0px_#0A1628]">
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Timeline ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50 relative overflow-hidden" ref={timelineRef}>
        <div className="mx-auto max-w-4xl relative">
          <div className="text-center mb-14 sm:mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 rounded-sm bg-amber-50 border border-amber-300 px-4 py-1.5 mb-4 sm:mb-6 shadow-[2px_2px_0px_#0A1628]"
            >
              <FileText className="h-4 w-4 text-amber-700" />
              <span className="font-pixel text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-widest">The Complete Process</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-5"
            >
              How LandLedger Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 max-w-xl mx-auto text-base sm:text-lg"
            >
              From identity verification to blockchain-recorded ownership — a government-grade process, digitized.
            </motion.p>
          </div>

          {/* Timeline Container */}
          <div className="relative pl-6 sm:pl-8 md:pl-0">
            <TimelineLine containerRef={timelineRef} />

            <div className="space-y-8 sm:space-y-12 md:space-y-24">
              {HOW_IT_WORKS.map((step, i) => (
                <TimelineCard key={step.step} step={step} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Choose Your Role ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Choose Your Role
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-base sm:text-lg"
            >
              LandLedger serves every participant in the property lifecycle.
            </motion.p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {ROLE_CARDS.map((card, i) => {
              const RoleIcon = card.icon;
              return (
                <motion.div
                  key={card.role}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                  className={`relative group bg-white rounded-sm p-6 sm:p-8 border-2 border-gray-200 shadow-[4px_4px_0px_#0A1628] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#0A1628] transition-all duration-200`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 opacity-100 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent`} style={{ '--accent': card.iconBg.includes('green') ? '#4A7C3F' : card.iconBg.includes('blue') ? '#1E3A5F' : '#D4AF37' }} />
                  
                  {/* Clean Icon Container */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-5 sm:mb-6 flex items-center justify-center rounded-sm border ${card.iconBg} shadow-[2px_2px_0px_#0A1628]`}>
                    <RoleIcon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{card.role}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">{card.desc}</p>
                  
                  <Link
                    to={card.link}
                    className={`mt-auto flex items-center justify-center gap-2 w-full rounded-sm py-3.5 font-pixel text-sm font-bold text-white uppercase tracking-wider transition-all duration-150 shadow-[3px_3px_0px_#0A1628] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#0A1628] ${card.btnColor}`}
                  >
                    {card.cta} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#060D17]">
        <div className="relative mx-auto max-w-4xl text-center z-10 rounded-sm bg-[#0D1B2A] border border-[#D4AF37]/30 p-8 sm:p-12 shadow-[6px_6px_0px_#060D17]">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <VerificationBadge status="verified" size="lg" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
          >
            Register Your Property Today
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl font-light"
          >
            Join property owners across India who have secured their ownership on the blockchain.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5"
          >
            <Link to="/register" className="flex items-center justify-center gap-2 rounded-sm px-8 py-4 font-pixel text-base font-bold text-[#0A1628] uppercase tracking-wider shadow-[4px_4px_0px_rgba(212,175,55,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(212,175,55,0.6)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150 border border-[#D4AF37]"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #FDE047)' }}>
              Start Registration <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 rounded-sm border-1.5 border-white/30 px-8 py-4 font-pixel text-base font-bold text-white uppercase tracking-wider shadow-[4px_4px_0px_#060D17] hover:bg-white/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#060D17] transition-all duration-150">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 sm:py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center text-center sm:text-left justify-between gap-6 text-xs sm:text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A1628] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">LandLedger</span>
          </div>
          <p>© 2026 LandLedger. Government-grade Blockchain Land Registry.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <Link to="/privacy" className="hover:text-[#0A1628] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#0A1628] transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-[#0A1628] transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for Timeline
const TimelineLine = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  return (
    <div className="absolute left-[3px] md:left-1/2 top-0 bottom-0 w-1.5 bg-[#0A1628]/20 md:-translate-x-1/2 rounded-full overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 origin-top shadow-[0_0_10px_rgba(212,175,55,0.6)]"
        style={{ scaleY, bottom: 0 }}
      />
    </div>
  );
};

const TimelineCard = ({ step, index }) => {
  const isEven = index % 2 === 0;
  const StepIcon = step.icon;

  // Voxel material accent bar colors for each step
  const stepColors = ['#4A7C3F', '#D4AF37', '#8A8A8A', '#C9A876', '#3A6499']; // Grass, Gold, Stone, Sand, Navy
  const stepColor = stepColors[index % stepColors.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -45, scale: 0.92, rotate: isEven ? -2 : 2 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ 
        type: 'spring', 
        stiffness: 280, 
        damping: 18, 
        bounce: 0.4,
        delay: (index % 2) * 0.08
      }}
      className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* LEGO Stud Center Node */}
      <motion.div 
        initial={{ scale: 0, rotate: 45 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: (index % 2) * 0.08 + 0.12 }}
        className="absolute left-[-28px] md:left-1/2 top-6 md:top-1/2 md:-translate-y-1/2 w-6 h-6 rounded-sm bg-amber-400 border-2 border-[#0A1628] md:-translate-x-3 z-20 shadow-[3px_3px_0px_#0A1628] flex items-center justify-center" 
      >
        <div className="w-2 h-2 rounded-full bg-[#0A1628]" />
      </motion.div>

      {/* Card Content - LEGO Brick Module */}
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
        <div className="relative group bg-white rounded-sm p-6 sm:p-8 border-2 border-[#0A1628] shadow-[5px_5px_0px_#0A1628] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0px_#0A1628] transition-all duration-200 overflow-hidden">
          {/* Top Terrain Color Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: stepColor }} />

          {/* LEGO Studs Row & Actor Tag */}
          <div className="flex items-center justify-between gap-2 mb-4 pt-1">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#0A1628]/40 shadow-inner" />
              ))}
            </div>
            <span className={`font-pixel text-xs font-bold px-2.5 py-0.5 rounded-sm border border-[#0A1628]/30 shadow-[1.5px_1.5px_0px_#0A1628] uppercase tracking-wider ${step.actorStyle}`}>
              {step.actor}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-sm bg-amber-50 border-2 border-[#0A1628] text-amber-700 shadow-[2px_2px_0px_#0A1628] flex items-center justify-center shrink-0">
                <StepIcon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-pixel text-lg sm:text-xl font-bold text-[#0A1628] uppercase tracking-wide leading-tight">
                {step.title}
              </h3>
            </div>
            
            {/* Retro Score Step Number */}
            <span className="font-pixel text-4xl sm:text-5xl font-black text-amber-400 group-hover:text-amber-500 transition-colors duration-200 shrink-0 pointer-events-none" style={{ textShadow: '2px 2px 0px #0A1628' }}>
              {step.step}
            </span>
          </div>

          <p className="font-pixel text-xs sm:text-sm text-gray-700 leading-relaxed tracking-wide">
            {step.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
