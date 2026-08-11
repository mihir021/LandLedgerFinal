/**
 * Login Page — light theme form with navy accents
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_CREDENTIALS = [
  { role: 'Admin',    email: 'admin@landledger.com',   password: 'Admin@123' },
  { role: 'Officer',  email: 'officer@landledger.com', password: 'Officer@123' },
  { role: 'Seller',   email: 'seller@landledger.com',  password: 'Seller@123' },
  { role: 'Buyer',    email: 'buyer@landledger.com',   password: 'Buyer@123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If arriving from register, optionally pre-fill email
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate(ROLE_ROUTES[user.role?.toLowerCase()] || '/');
    }
  }, [location.state, isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.fullName || data.name || 'User'}!`);
      navigate(ROLE_ROUTES[data.role?.toLowerCase()] || '/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header card */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-500 mt-2 text-sm">Access your LandLedger account</p>
        </div>

        {/* Form */}
        <div className="ll-card p-6 animate-fade-in-up">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ll-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="ll-input"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="ll-label mb-0">Password</label>
                <a href="#" className="text-xs text-blue-700 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="ll-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-800 font-semibold hover:underline">Register here</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 ll-card p-4 animate-fade-in-up delay-200">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map(cred => (
              <button
                key={cred.role}
                type="button"
                onClick={() => fillDemo(cred)}
                className="text-left rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <p className="font-semibold text-gray-800">{cred.role}</p>
                <p className="text-gray-400 truncate">{cred.email}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">Click any role to fill credentials automatically</p>
        </div>
      </div>
    </div>
  );
}
