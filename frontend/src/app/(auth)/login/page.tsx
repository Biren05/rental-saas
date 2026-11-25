'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Car, AlertCircle, CheckCircle2, Shield, Building2 } from 'lucide-react';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // First-time login / Force password change state
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err.mustChangePassword) {
        setIsFirstLogin(true);
        setResetEmail(err.email || email);
        setTempPassword(password);
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessNotice(null);
        return;
      }
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPermanentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetting(true);
    try {
      await api.post('/auth/first-login/set-password', {
        email: resetEmail,
        temporaryPassword: tempPassword,
        newPassword,
      });

      setIsFirstLogin(false);
      setEmail(resetEmail);
      setPassword('');
      setError(null);
      setSuccessNotice('Password updated successfully. Please sign in.');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setResetting(false);
    }
  };

  const fillTenant = () => {
    setEmail('tenant@gmail.com');
    setPassword('tenant@123');
    setError(null);
  };

  const fillSuperadmin = () => {
    setEmail('admin@gmail.com');
    setPassword('admin@123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] text-slate-900 font-['Inter']">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white mb-3 shadow-sm">
            <Car className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AutoRent</h1>
          <p className="text-xs text-slate-500 mt-0.5">Vehicle Rental SaaS Platform</p>
        </div>

        {/* Card: First Time Login (Set Permanent Password) */}
        {isFirstLogin ? (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Set New Password</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                First-time sign in: please create your permanent password.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetPermanentPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={resetEmail}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {resetting ? 'Saving...' : 'Set Permanent Password'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsFirstLogin(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Clean Light Mode Sign In Card */
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter your email and password to access your account</p>
            </div>

            {/* Quick Fill Test Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={fillTenant}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                title="Fill Tenant Owner: tenant@gmail.com"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tenant Login</span>
              </button>

              <button
                type="button"
                onClick={fillSuperadmin}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                title="Fill Superadmin: admin@gmail.com"
              >
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span>Admin Login</span>
              </button>
            </div>

            {successNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        <div className="text-center mt-6 text-xs text-slate-400">
          AutoRent SaaS &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
