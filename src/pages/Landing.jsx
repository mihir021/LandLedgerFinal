/**
 * Landing Page
 * Hero, Features, How It Works timeline, Why Blockchain, CTA, and Footer sections.
 * Static content — no backend data needed.
 */
import { Link } from 'react-router-dom';
import {
  FiShield, FiCheckCircle, FiRepeat, FiLock,
  FiFileText, FiCode, FiArrowRight, FiGlobe,
  FiDatabase, FiUsers, FiZap, FiGrid,
} from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';

/** Map feature icon string to React Icon component */
const iconMap = {
  shield: FiShield,
  check: FiCheckCircle,
  transfer: FiRepeat,
  lock: FiLock,
  document: FiFileText,
  code: FiCode,
};

/** Static features data (previously from mockData) */
const features = [
  {
    title: 'Immutable Records',
    description: 'Every land record is stored on the blockchain, making it tamper-proof and permanently verifiable.',
    icon: 'shield',
  },
  {
    title: 'Instant Verification',
    description: 'Government officers can verify property ownership and documents in minutes, not weeks.',
    icon: 'check',
  },
  {
    title: 'Transparent Transfers',
    description: 'Property transfers are recorded in real time with complete audit trails visible to all parties.',
    icon: 'transfer',
  },
  {
    title: 'Fraud Prevention',
    description: 'Blockchain consensus mechanisms eliminate duplicate registrations and fraudulent claims.',
    icon: 'lock',
  },
  {
    title: 'Digital Documents',
    description: 'Upload and manage all property documents digitally with encrypted storage and easy retrieval.',
    icon: 'document',
  },
  {
    title: 'Smart Contracts',
    description: 'Automated contract execution ensures seamless, condition-based property transfers.',
    icon: 'code',
  },
];

/** Static how-it-works data (previously from mockData) */
const howItWorks = [
  { step: 1, title: 'Register & Verify', description: 'Create your account, select your role, and complete identity verification through the government portal.' },
  { step: 2, title: 'List Your Property', description: 'Submit property details, upload documents, and the data is recorded on the blockchain.' },
  { step: 3, title: 'Government Verification', description: 'Designated officers verify documents and approve the property listing on-chain.' },
  { step: 4, title: 'Search & Purchase', description: 'Buyers search verified properties, submit purchase requests, and initiate smart-contract transfers.' },
  { step: 5, title: 'Secure Transfer', description: 'Once approved, ownership transfers automatically via blockchain with an immutable record.' },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const dashboardRoute = user ? (ROLE_ROUTES[user.role] || '/buyer') : '/login';

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="hero-gradient relative flex min-h-screen items-center justify-center px-4">
        {/* Decorative grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Floating decorative blobs */}
        <div className="absolute left-10 top-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] animate-float delay-500" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 animate-fade-in-up">
            <SiBlockchaindotcom className="text-blue-400" />
            Powered by Blockchain Technology
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up delay-100">
            The Future of
            <br />
            <span className="text-gradient">Land Registry</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-300 sm:text-xl animate-fade-in-up delay-200">
            A secure, transparent, and tamper-proof land registration platform.
            Eliminate fraud, reduce paperwork, and empower citizens with blockchain-verified property records.
          </p>

          {/* CTA buttons — conditional based on auth */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up delay-300">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardRoute}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                >
                  <FiGrid className="h-5 w-5" />
                  Go to Dashboard
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/search"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Explore Properties
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                >
                  Get Started Free
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/search"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Explore Properties
                </Link>
              </>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-fade-in-up delay-400">
            {[
              { value: '15,000+', label: 'Properties Registered' },
              { value: '10,000+', label: 'Verified Users' },
              { value: '99.9%', label: 'Uptime' },
              { value: '₹500 Cr+', label: 'Transactions Secured' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-navy-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════ */}
      <section id="features" className="relative py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">Features</span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Why Choose <span className="text-gradient">LandLedger</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Our platform combines the power of blockchain with intuitive design to transform how land records are managed.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || FiShield;
              return (
                <div
                  key={feature.title}
                  className="glass-card group p-7 transition-all duration-300 hover:border-white/20 hover:bg-glass-hover animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS TIMELINE
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800/50 to-navy-900" />

        <div className="relative mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Process</span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-navy-400">
              Five simple steps from registration to secure property transfer.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mt-16">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/50 via-indigo-500/50 to-purple-500/50 sm:block" />

            <div className="flex flex-col gap-10">
              {howItWorks.map((step, idx) => (
                <div
                  key={step.step}
                  className="relative flex gap-6 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Step circle */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/25">
                    {step.step}
                  </div>

                  {/* Content card */}
                  <div className="glass-card flex-1 p-6">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-navy-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY BLOCKCHAIN SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left – Content */}
            <div className="animate-fade-in-up">
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Technology</span>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Why <span className="text-gradient">Blockchain</span>?
              </h2>
              <p className="mt-4 text-navy-400">
                Traditional land registries are plagued by fraud, disputes, and bureaucratic delays.
                Blockchain technology solves these problems at the protocol level.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {[
                  { icon: FiDatabase, title: 'Decentralized Storage', desc: 'No single point of failure. Records distributed across multiple nodes.' },
                  { icon: FiLock, title: 'Cryptographic Security', desc: 'SHA-256 hashing ensures records cannot be altered without detection.' },
                  { icon: FiGlobe, title: 'Public Auditability', desc: 'Anyone can verify ownership and transfer history in real time.' },
                  { icon: FiZap, title: 'Instant Settlement', desc: 'Smart contracts execute transfers automatically when conditions are met.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                      <item.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-navy-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Visual Block */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="glass-card animate-pulse-glow p-8">
                {/* Simulated blockchain block visualization */}
                <div className="space-y-4">
                  {[
                    { label: 'Block #15,482', hash: '0x7a3f...e82c', status: 'Confirmed' },
                    { label: 'Block #15,481', hash: '0x4b2d...a91f', status: 'Confirmed' },
                    { label: 'Block #15,480', hash: '0x9c1e...d73b', status: 'Confirmed' },
                  ].map((block, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                      <div>
                        <p className="text-sm font-semibold text-white">{block.label}</p>
                        <p className="mt-0.5 font-mono text-xs text-navy-500">{block.hash}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                        {block.status}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Chain link indicators */}
                <div className="mt-4 flex items-center justify-center gap-2 text-navy-500">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
                  <SiBlockchaindotcom className="text-blue-500" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
                </div>
                <p className="mt-3 text-center text-xs text-navy-500">Live blockchain sync • 15,482 blocks verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CALL TO ACTION
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card relative overflow-hidden p-12 text-center sm:p-16">
            {/* Gradient blobs */}
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[80px]" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Secure Your Land Records?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-navy-300">
                Join thousands of users who trust LandLedger for transparent, blockchain-secured land management.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {isAuthenticated ? (
                  <Link
                    to={dashboardRoute}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                  >
                    <FiGrid className="h-5 w-5" />
                    Go to Dashboard
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
                    >
                      Create Free Account
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-navy-950 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <SiBlockchaindotcom className="text-sm text-white" />
                </div>
                <span className="text-white">Land<span className="text-blue-400">Ledger</span></span>
              </Link>
              <p className="mt-4 text-sm text-navy-500">
                Blockchain-powered land registry for secure, transparent, and tamper-proof property management.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-300">Platform</h4>
              <ul className="mt-4 space-y-3 text-sm text-navy-500">
                <li><Link to="/search" className="transition-colors hover:text-white">Search Properties</Link></li>
                <li><Link to="/register-property" className="transition-colors hover:text-white">Register Property</Link></li>
                <li><Link to="/register" className="transition-colors hover:text-white">Create Account</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-300">Resources</h4>
              <ul className="mt-4 space-y-3 text-sm text-navy-500">
                <li><a href="#" className="transition-colors hover:text-white">Documentation</a></li>
                <li><a href="#" className="transition-colors hover:text-white">API Reference</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Blockchain Explorer</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-300">Legal</h4>
              <ul className="mt-4 space-y-3 text-sm text-navy-500">
                <li><a href="#" className="transition-colors hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Government Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-sm text-navy-600">
              © {new Date().getFullYear()} LandLedger. All rights reserved.
            </p>
            <p className="text-xs text-navy-600">
              Built with ❤️ for transparent governance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
