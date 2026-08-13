/**
 * Register Page — Block Design System (Tactile LEGO-Style Brick Aesthetics)
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle, Home, ShoppingBag, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrickPanel from '../components/BrickPanel';
import BrickButton from '../components/BrickButton';
import { LegoVisualLeft, LegoVisualRight } from '../components/LegoAuthDecorations';

const ROLE_OPTIONS = [
  {
    role: 'both',
    icon: Users,
    label: 'Buyer & Seller',
    desc: 'Buy and sell properties with one account',
    color: 'border-l-blue-600 bg-blue-50/50',
    activeStyle: 'border-2 border-[#475569] bg-blue-100/70 shadow-[4px_4px_0px_#475569]',
    inactiveStyle: 'border-2 border-gray-300 bg-white shadow-[2px_2px_0px_#475569] opacity-75 hover:opacity-100',
  },
  {
    role: 'buyer',
    icon: ShoppingBag,
    label: 'Buyer',
    desc: 'Search and purchase verified properties',
    color: 'border-l-emerald-600 bg-emerald-50/50',
    activeStyle: 'border-2 border-[#475569] bg-emerald-100/70 shadow-[4px_4px_0px_#475569]',
    inactiveStyle: 'border-2 border-gray-300 bg-white shadow-[2px_2px_0px_#475569] opacity-75 hover:opacity-100',
  },
  {
    role: 'seller',
    icon: Home,
    label: 'Seller',
    desc: 'Register and list properties for sale',
    color: 'border-l-indigo-600 bg-indigo-50/50',
    activeStyle: 'border-2 border-[#475569] bg-indigo-100/70 shadow-[4px_4px_0px_#475569]',
    inactiveStyle: 'border-2 border-gray-300 bg-white shadow-[2px_2px_0px_#475569] opacity-75 hover:opacity-100',
  },
];

export default function Register() {
  const [role, setRole] = useState('both');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', aadhaarNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login', { state: { email: form.email, registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60 relative overflow-hidden">
      
      {/* Main Split Container */}
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <BrickPanel showStuds={false} variant="secondary" className="p-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[700px]">
            
            {/* Left 50% - Visual Model Panel */}
            <div className="w-full lg:w-1/2 bg-[#FDF8EE] flex flex-col items-center justify-center p-8 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-[#475569]">
              <LegoVisualLeft activeModel="guy" />
            </div>

            {/* Right 50% - Register Form Panel */}
            <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 flex flex-col justify-center">
              
              {/* Floating Brick Icon Badge & Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative group animate-idle-bob">
                    <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-[#0A1628] border-2 border-amber-500/80 shadow-[4px_4px_0px_#475569]">
                      <UserPlus className="h-7 w-7 text-amber-400" />
                    </div>
                  </div>
                </div>
                <h1 className="font-pixel text-3xl sm:text-4xl font-extrabold text-[#0A1628] uppercase tracking-wide">
                  Create Account
                </h1>
                <p className="text-gray-600 mt-1.5 text-xs sm:text-sm font-sans">
                  Join LandLedger — Government-grade Land Registry
                </p>
              </div>

              {/* Role Selector Brick Buttons */}
          <div className="mb-6">
            <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-2.5">
              I want to register as
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ROLE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isActive = role === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setRole(opt.role)}
                    className={`relative text-left rounded-sm p-3 transition-all duration-150 ${
                      isActive ? opt.activeStyle : opt.inactiveStyle
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-[#0A1628]' : 'text-gray-500'}`} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 border border-[#475569]" />
                    </div>
                    <span className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider">
                      {opt.label}
                    </span>
                    <span className="block text-[10px] text-gray-600 font-sans leading-tight mt-0.5">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-t-2 border-[#475569]/15 mb-5" />

          {error && (
            <div className="flex items-center gap-2 rounded-sm bg-red-50 border-2 border-red-300 px-3.5 py-2.5 mb-4 text-xs sm:text-sm text-red-700 shadow-[2px_2px_0px_#475569]">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span className="font-sans font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="As on official documents"
                  className="ll-input-brick"
                />
              </div>

              <div>
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className="ll-input-brick"
                />
              </div>

              <div>
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 XXXXX XXXXX"
                  className="ll-input-brick"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={form.aadhaarNumber}
                  onChange={set('aadhaarNumber')}
                  placeholder="XXXX XXXX XXXX"
                  className="ll-input-brick"
                  maxLength={14}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 8 characters"
                    className="ll-input-brick pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              By registering, you agree to LandLedger's Terms of Service. Your account will be subject to KYC verification by a government officer.
            </p>

            <div className="pt-2">
              <BrickButton
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-3"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </BrickButton>
            </div>
          </form>

            <p className="text-center text-xs sm:text-sm text-gray-600 font-sans mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-pixel text-amber-700 font-bold uppercase tracking-wider hover:underline ml-1">
                Sign in
              </Link>
            </p>
            </div>
          </div>
        </BrickPanel>
      </div>
    </div>
  );
}
