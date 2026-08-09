/**
 * Register Page
 * Registration form with full name, email, password, and role selection.
 * Only Buyer and Seller roles are allowed for self-registration.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLoader, FiPhone } from 'react-icons/fi';
import { HiOutlineBriefcase, HiOutlineHome } from 'react-icons/hi';
import { SiBlockchaindotcom } from 'react-icons/si';
import { useAuth, ROLES, ROLE_ROUTES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const roleOptions = [
  { value: ROLES.BUYER,  label: 'Buyer',  desc: 'Search & purchase properties', icon: HiOutlineHome },
  { value: ROLES.SELLER, label: 'Seller', desc: 'List & manage your properties', icon: HiOutlineBriefcase },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.password || !form.role) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
      });
      toast.success('Account created successfully!');
      const route = ROLE_ROUTES[user.role] || '/buyer';
      navigate(route);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <SiBlockchaindotcom className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="mt-2 text-sm text-navy-400">Join the blockchain land registry platform</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection — Buyer and Seller only */}
            <div>
              <label className="mb-3 block text-sm font-medium text-navy-300">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ${
                      form.role === role.value
                        ? 'bg-blue-500/15 ring-1 ring-blue-500/40'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <role.icon className={`h-7 w-7 ${form.role === role.value ? 'text-blue-400' : 'text-navy-500'}`} />
                    <span className={`text-sm font-medium ${form.role === role.value ? 'text-blue-400' : 'text-navy-300'}`}>
                      {role.label}
                    </span>
                    <span className="text-xs text-navy-500">{role.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="mb-2 block text-sm font-medium text-navy-300">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="reg-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-navy-300">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="reg-phone" className="mb-2 block text-sm font-medium text-navy-300">Phone <span className="text-navy-600">(optional)</span></label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-navy-300">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="mb-2 block text-sm font-medium text-navy-300">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
