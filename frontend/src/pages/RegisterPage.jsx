import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, UserPlus, Building, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { api } from '../services/api';

export default function RegisterPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('Digital Forensics Lab');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.register(email.trim(), password.trim());
      setSuccessMsg('Account registered successfully! Opening Workspace...');
      
      setTimeout(() => {
        onLoginSuccess({
          id: res.user_id || Date.now(),
          email: res.email || email,
          is_admin: email.includes('admin')
        });
        onNavigate('dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/20 mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Create Investigator Account
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Create your digital evidence clearance credentials
        </p>
      </div>

      {/* Register Form */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white space-y-5 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="investigator@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Organization / Department:</label>
            <div className="relative">
              <Building className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Cyber Crime Forensic Unit"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Confirm Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>{loading ? 'REGISTERING ACCOUNT...' : 'COMPLETE REGISTRATION & OPEN WORKSPACE'}</span>
          </button>

        </form>

        <div className="pt-4 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs font-medium text-slate-600">Already registered?</p>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Back to Login</span>
          </button>
        </div>

      </div>

    </div>
  );
}

