/**
 * Login Page — Block Design System (Tactile LEGO-Style Brick Aesthetics)
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldCheck, Home } from 'lucide-react';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrickPanel from '../components/BrickPanel';
import BrickButton from '../components/BrickButton';
import { LegoVisualLeft, LegoVisualRight } from '../components/LegoAuthDecorations';

const DEMO_CREDENTIALS = [
  { role: 'Admin',           email: 'admin@landledger.com',   password: 'Admin@123', color: 'border-l-amber-500 bg-amber-50/60' },
  { role: 'Officer',         email: 'officer@landledger.com', password: 'Officer@123', color: 'border-l-emerald-600 bg-emerald-50/60' },
  { role: 'Seller & Buyer',  email: 'seller@landledger.com',  password: 'Seller@123', color: 'border-l-indigo-600 bg-indigo-50/60' },
  { role: 'Buyer & Seller',  email: 'buyer@landledger.com',   password: 'Buyer@123', color: 'border-l-amber-700 bg-[#FDF8EE]' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickedRole, setClickedRole] = useState(null);

  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
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
    setClickedRole(cred.role);
    setTimeout(() => setClickedRole(null), 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60 relative overflow-hidden">
      {/* Floating 3D LEGO Animations on Left & Right Sides */}
      <LegoVisualLeft />
      <LegoVisualRight />

      <div className="w-full max-w-md relative z-10">

        {/* Floating Brick Icon Badge & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative group animate-idle-bob">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-[#0A1628] border-2 border-amber-500/80 shadow-[4px_4px_0px_#0A1628]">
                <Home className="h-7 w-7 text-amber-400" />
              </div>
            </div>
          </div>
          <h1 className="font-pixel text-3xl sm:text-4xl font-extrabold text-[#0A1628] uppercase tracking-wide">
            Sign In
          </h1>
          <p className="text-gray-600 mt-1.5 text-xs sm:text-sm font-sans">
            Access your LandLedger account
          </p>
        </div>

        {/* Primary Form Brick Panel */}
        <BrickPanel showStuds={false} variant="primary" delay={0}>
          {error && (
            <div className="flex items-center gap-2 rounded-sm bg-red-50 border-2 border-red-300 px-3.5 py-2.5 mb-5 text-xs sm:text-sm text-red-700 shadow-[2px_2px_0px_#0A1628]">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span className="font-sans font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="ll-input-brick"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-pixel text-xs sm:text-sm font-bold text-[#0A1628] uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-amber-700 hover:text-amber-900 font-sans font-medium underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="ll-input-brick pr-10"
                  autoComplete="current-password"
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

            <div className="pt-2">
              <BrickButton
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-3"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </BrickButton>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-600 font-sans mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-pixel text-amber-700 font-bold uppercase tracking-wider hover:underline ml-1">
              Register here
            </Link>
          </p>
        </BrickPanel>

        {/* Demo Credentials Brick Panel */}
        <div className="mt-6">
          <BrickPanel showStuds={false} variant="secondary" delay={0.1} className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-pixel text-xs font-bold text-[#0A1628] uppercase tracking-wider">
                Demo Credentials
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_CREDENTIALS.map(cred => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className={`relative text-left rounded-sm border-2 border-[#0A1628] border-l-4 ${cred.color} p-2.5 shadow-[2.5px_2.5px_0px_#0A1628] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3.5px_3.5px_0px_#0A1628] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 ${
                    clickedRole === cred.role ? 'animate-click-pop' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs font-bold text-[#0A1628] uppercase tracking-wider">
                      {cred.role}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-[#0A1628]" />
                  </div>
                  <p className="text-[11px] text-gray-600 truncate font-mono mt-0.5">
                    {cred.email}
                  </p>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 font-sans mt-3 text-center">
              Click any role to fill credentials automatically
            </p>
          </BrickPanel>
        </div>

      </div>
    </div>
  );
}
