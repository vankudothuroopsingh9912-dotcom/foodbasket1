import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    showToast,
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password step
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      setForgotStep('reset');
      showToast(data.message, 'info');
      if (data.testOtp) {
        setForgotOtp(data.testOtp);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to send reset instructions');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, otp: forgotOtp }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password');
        return;
      }
      showToast(data.message, 'success');
      setAuthModalTab('login');
      setForgotStep('request');
      setPassword(newPassword);
    } catch {
      setLoading(false);
      setErrorMsg('Failed to update password');
    }
  };

  const setDemoCustomer = () => {
    setEmail('customer@foodbasket.com');
    setPassword('password123');
    setErrorMsg('');
  };

  const setDemoAdmin = () => {
    setEmail('admin@foodbasket.com');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={() => setIsAuthModalOpen(false)} />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 mb-6">
          <button
            onClick={() => {
              setAuthModalTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-extrabold border-b-2 transition-all ${
              authModalTab === 'login'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthModalTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-extrabold border-b-2 transition-all ${
              authModalTab === 'register'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {authModalTab === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all"
              >
                <span>{loading ? 'Signing in...' : 'Sign In to Food Basket'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Logins for Instant Evaluation */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider text-center">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={setDemoCustomer}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-left text-xs transition-colors"
                >
                  <span className="font-bold text-emerald-900 block flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Customer
                  </span>
                  <span className="text-[10px] text-slate-500">Aarav Sharma</span>
                </button>

                <button
                  type="button"
                  onClick={setDemoAdmin}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-left text-xs transition-colors"
                >
                  <span className="font-bold text-amber-900 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Store Admin
                  </span>
                  <span className="text-[10px] text-slate-500">Full Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authModalTab === 'forgot' && (
          <div className="space-y-4">
            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered email address and we'll send you an instant reset verification code.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  {loading ? 'Sending OTP...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  A verification code has been simulated. Code: <strong>{forgotOtp}</strong>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Verification OTP</label>
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  {loading ? 'Resetting...' : 'Save New Password & Log In'}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setAuthModalTab('login');
                setErrorMsg('');
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
