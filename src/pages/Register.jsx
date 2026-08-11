/**
 * Register Page — role selection (Buyer / Seller) + form fields
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle, Home, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_OPTIONS = [
  {
    role: 'buyer',
    icon: ShoppingBag,
    label: 'Buyer',
    desc: 'Search and purchase verified properties',
    color: 'border-green-200 bg-green-50 text-green-800',
    activeColor: 'border-green-600 bg-green-50 ring-2 ring-green-500 ring-offset-1',
  },
  {
    role: 'seller',
    icon: Home,
    label: 'Seller',
    desc: 'Register and list properties for sale',
    color: 'border-blue-200 bg-blue-50 text-blue-800',
    activeColor: 'border-blue-700 bg-blue-50 ring-2 ring-blue-600 ring-offset-1',
  },
];

export default function Register() {
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', aadhaarNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  // If already authenticated, redirect to dashboard
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
      const data = await register({ ...form, role });
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login', { state: { email: form.email, registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join LandLedger — Government-grade Land Registry</p>
        </div>

        <div className="ll-card p-6 animate-fade-in-up">
          {/* Role Selection */}
          <div className="mb-6">
            <p className="ll-label mb-3">I want to register as</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isActive = role === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setRole(opt.role)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                      isActive ? opt.activeColor : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? (opt.role === 'buyer' ? 'text-green-700' : 'text-blue-700') : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{opt.label}</span>
                    <span className="text-xs text-gray-500">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="ll-divider mb-5" />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="ll-label">Full Name *</label>
                <input type="text" required value={form.fullName} onChange={set('fullName')} placeholder="As on official documents" className="ll-input" />
              </div>
              <div>
                <label className="ll-label">Email Address *</label>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="ll-input" />
              </div>
              <div>
                <label className="ll-label">Phone Number</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" className="ll-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="ll-label">Aadhaar Number</label>
                <input type="text" value={form.aadhaarNumber} onChange={set('aadhaarNumber')} placeholder="XXXX XXXX XXXX" className="ll-input" maxLength={14} />
              </div>
              <div className="sm:col-span-2">
                <label className="ll-label">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 8 characters"
                    className="ll-input pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By registering, you agree to LandLedger's Terms of Service. Your account will be subject to KYC verification by a government officer.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-800 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
