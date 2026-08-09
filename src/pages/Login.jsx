/**
 * Login Page
 * Email/password form with real backend authentication.
 * Role is determined by the backend — no role selector.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Login successful!');
      // Navigate to the appropriate dashboard based on role from backend
      const route = ROLE_ROUTES[user.role] || '/buyer';
      navigate(route);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <SiBlockchaindotcom className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-navy-400">Sign in to your LandLedger account</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-navy-300">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-navy-300">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-navy-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
