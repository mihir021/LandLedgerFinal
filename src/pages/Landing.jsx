/**
 * Landing Page — official, trustworthy government-fintech aesthetic
 * Hero with serif heading, "How It Works" 5-step flow, role cards, trust indicators.
 */
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, FileText, ArrowRight, Lock, Zap, Globe } from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Register & Verify Identity',
    desc: 'Create your account and complete KYC verification through government-issued credentials. Officers review and approve identity documents.',
    actor: 'Seller / Buyer',
    actorStyle: 'actor-seller',
    icon: '🪪',
  },
  {
    step: '02',
    title: 'Register Your Property',
    desc: 'Upload property documents, survey records, and title deed. Government officers verify authenticity against official land records.',
    actor: 'Seller + Officer',
    actorStyle: 'actor-officer',
    icon: '🏠',
  },
  {
    step: '03',
    title: 'List & Discover',
    desc: 'Verified properties appear on the public marketplace. Buyers search by location, type, and price range with full blockchain audit trail.',
    actor: 'Buyer',
    actorStyle: 'actor-buyer',
    icon: '🔍',
  },
  {
    step: '04',
    title: 'Request & Negotiate Transfer',
    desc: 'Buyer submits a formal purchase request. Seller reviews and accepts. Both parties sign digital agreements stored on-chain.',
    actor: 'Buyer + Seller',
    actorStyle: 'actor-buyer',
    icon: '🤝',
  },
  {
    step: '05',
    title: 'Blockchain Ownership Transfer',
    desc: 'Government officer performs final compliance check. Smart contract executes the transfer — ownership record updated immutably on the blockchain.',
    actor: 'Officer + Blockchain',
    actorStyle: 'actor-chain',
    icon: '⛓️',
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
    emoji: '🏡',
    desc: 'Search verified properties, view full blockchain ownership history, and complete secure purchases with wallet signature.',
    cta: 'Explore as Buyer',
    link: '/register',
    color: 'border-green-200 bg-green-50',
    btnColor: 'bg-green-700 hover:bg-green-800',
  },
  {
    role: 'Seller',
    emoji: '📋',
    desc: 'Register your property, upload documents for government verification, list on the marketplace, and manage transfer requests.',
    cta: 'Register as Seller',
    link: '/register',
    color: 'border-blue-200 bg-blue-50',
    btnColor: 'bg-blue-800 hover:bg-blue-900',
  },
  {
    role: 'Government Officer',
    emoji: '⚖️',
    desc: 'Verify user identities, review property documents, approve transfers — digitally. All actions recorded on immutable ledger.',
    cta: 'Officer Login',
    link: '/login',
    color: 'border-amber-200 bg-amber-50',
    btnColor: 'bg-amber-700 hover:bg-amber-800',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-1)' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Document texture overlay */}
        <div className="absolute inset-0 doc-texture pointer-events-none" />
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 60%, #0F1F3D 100%)',
          }}
        />

        {/* Gold accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #C9A227, #D4AF37 50%, #C9A227)' }} />

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-36">
          <div className="max-w-3xl">
            {/* Official seal badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-8 animate-fade-in">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Government-Grade Blockchain Land Registry</span>
            </div>

            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
              The Future of
              <span className="block" style={{ color: '#D4AF37' }}>Land Ownership</span>
              is Here
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl animate-fade-in-up delay-100">
              LandLedger digitizes India's land registry — making property transactions transparent, tamper-proof, and instant. Every deed, every transfer, immutably recorded on the blockchain.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-200">
              <Link to="/register" className="flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-blue-900 transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)' }}>
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search" className="flex items-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all">
                <Search className="h-4 w-4" /> Search Properties
              </Link>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-fade-in-up delay-300">
            {[
              { label: 'Properties Registered', value: '12,400+' },
              { label: 'Transfers Completed',   value: '3,890+' },
              { label: 'States Covered',         value: '18' },
              { label: 'Avg. Transfer Time',     value: '48 hrs' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-white/8 border border-white/15 p-4">
                <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Indicators ── */}
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_INDICATORS.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                  <item.icon className="h-6 w-6 text-blue-800" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6" style={{ background: 'var(--color-surface-1)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 mb-4">
              <FileText className="h-4 w-4 text-amber-700" />
              <span className="text-sm font-semibold text-amber-800">The Complete Process</span>
            </div>
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3">How LandLedger Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From identity verification to blockchain-recorded ownership — a government-grade process, digitized.</p>
          </div>

          <div className="space-y-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="ll-card ll-card-hover p-6 flex gap-6 items-start animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="text-3xl">{step.icon}</div>
                  <div className="w-0.5 flex-1 bg-gray-100 min-h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-gray-400">STEP {step.step}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.actorStyle}`}>
                      {step.actor}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-20 px-6 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3">Choose Your Role</h2>
            <p className="text-gray-500">LandLedger serves every participant in the property lifecycle.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ROLE_CARDS.map((card, i) => (
              <div
                key={card.role}
                className={`ll-card ll-card-hover p-6 border-2 ${card.color} flex flex-col animate-fade-in-up`}
                style={{ animationDelay: `${i * 120}ms`, opacity: 0 }}
              >
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">{card.role}</h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">{card.desc}</p>
                <Link
                  to={card.link}
                  className={`flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${card.btnColor}`}
                >
                  {card.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
        <div className="mx-auto max-w-3xl text-center">
          <VerificationBadge status="verified" size="lg" />
          <h2 className="font-serif text-4xl font-bold text-white mt-6 mb-3">
            Register Your Property Today
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join thousands of property owners who have secured their ownership on the blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-blue-900 hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)' }}>
              Start Registration <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-900">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800">LandLedger</span>
          </div>
          <p>© 2024 LandLedger. Government-grade Blockchain Land Registry.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-800 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
