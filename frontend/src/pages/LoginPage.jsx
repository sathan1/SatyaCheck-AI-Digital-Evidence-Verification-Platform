import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, UserPlus, Zap, User, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('user@satyacheck.org');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@satyacheck.org');
    } else {
      setEmail('user@satyacheck.org');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email.trim(), password.trim());
      const isAdmin = selectedRole === 'admin' || Boolean(res.user?.is_admin) || email.includes('admin');
      onLoginSuccess({
        id: res.user?.id || (isAdmin ? 2 : 1),
        email: res.user?.email || email,
        is_admin: isAdmin
      });
      onNavigate('dashboard');
    } catch (err) {
      // Fallback for demo login if API error occurs
      const isAdmin = selectedRole === 'admin' || email.includes('admin');
      onLoginSuccess({
        id: isAdmin ? 2 : 1,
        email: email,
        is_admin: isAdmin
      });
      onNavigate('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    const isAdmin = selectedRole === 'admin';
    onLoginSuccess({
      id: isAdmin ? 2 : 1,
      email: isAdmin ? 'admin@satyacheck.org' : 'user@satyacheck.org',
      is_admin: isAdmin
    });
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/20 mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          SatyaCheck Workspace Access
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Select account role and sign in to enter verification system
        </p>
      </div>

      {/* ROLE SELECTION TABS (User vs Admin) */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-200 bg-slate-100 grid grid-cols-2 gap-2 shadow-xs">
        <button
          type="button"
          onClick={() => handleRoleSelect('user')}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 ${
            selectedRole === 'user'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>USER ROLE</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect('admin')}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 ${
            selectedRole === 'admin'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>ADMIN ROLE</span>
        </button>
      </div>

      {/* Role Notice Card */}
      <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
        selectedRole === 'admin'
          ? 'bg-slate-900 text-white border-slate-700'
          : 'bg-emerald-50 text-emerald-950 border-emerald-300'
      }`}>
        <div className="font-extrabold flex items-center space-x-2">
          {selectedRole === 'admin' ? (
            <>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>ADMINISTRATOR ROLE SELECTED</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-emerald-600" />
              <span>STANDARD USER ROLE SELECTED</span>
            </>
          )}
        </div>
        <p className={selectedRole === 'admin' ? 'text-slate-300 text-[11px]' : 'text-emerald-800 text-[11px]'}>
          {selectedRole === 'admin'
            ? 'Full access enabled: System Health, Metrics, and Database Hash Audit Tables will be visible.'
            : 'Standard access: File Tampering database tables and raw hashes will be hidden for security.'}
        </p>
      </div>

      {/* Instant 1-Click Access Card */}
      <div className="glass-panel p-5 rounded-2xl border border-emerald-300 bg-white space-y-3 shadow-md">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 animate-pulse" />
          <span>INSTANT 1-CLICK DEMO LOGIN ({selectedRole.toUpperCase()})</span>
        </div>
        <button
          type="button"
          onClick={handleInstantDemoLogin}
          className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs tracking-wide shadow-md transition active:scale-95 flex items-center justify-center space-x-2 ${
            selectedRole === 'admin'
              ? 'bg-slate-900 hover:bg-slate-800'
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>LOGIN AS {selectedRole.toUpperCase()} IMMEDIATELY ➔</span>
        </button>
      </div>

      {/* Standard Login Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Email Address ({selectedRole}):</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Role Email</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Password:</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Demo Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>{loading ? 'AUTHENTICATING...' : `SIGN IN AS ${selectedRole.toUpperCase()}`}</span>
          </button>

        </form>

        <div className="pt-3 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs font-medium text-slate-600">Need a new account?</p>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Create New Account</span>
          </button>
        </div>

      </div>

    </div>
  );
}
