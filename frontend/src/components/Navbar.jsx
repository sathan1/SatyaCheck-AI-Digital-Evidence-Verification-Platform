import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  FileSearch, 
  ShieldCheck, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  User,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const authenticatedNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Workspace Overview' },
    { id: 'verify', label: 'Upload Evidence', icon: Upload, isPrimary: true, desc: 'Analyze Image / Video' },
    { id: 'history', label: 'Evidence Ledger', icon: History, desc: 'Preserved Audit Log' },
    { id: 'tamper', label: 'Certificate Check', icon: FileSearch, desc: 'Reference Comparison' },
    { id: 'hash_verify', label: 'Hash Verification', icon: ShieldCheck, desc: 'SHA-256 Tamper Vault' },
    { id: 'admin', label: 'Admin Health', icon: ShieldCheck, desc: 'System Metrics' },
  ];

  const publicNavItems = [
    { id: 'landing', label: 'Overview', icon: LayoutDashboard, desc: 'Platform Introduction' },
  ];

  const navItems = user ? authenticatedNavItems : publicNavItems;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header (Only visible on small mobile screens) */}
      <div className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div 
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center">
              <span className="font-black text-emerald-400 text-xs">S</span>
            </div>
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">
            Satya<span className="text-emerald-600">Check</span>
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Navbar (Desktop Fixed Left, Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 
        flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-lg
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:sticky md:top-0 md:h-screen md:flex-shrink-0 overflow-hidden
      `}>
        {/* Scrollable Main Navigation Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          
          {/* Brand Logo Header */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group pb-4 border-b border-slate-200"
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-[9px] flex items-center justify-center">
                <span className="font-black text-emerald-400 text-sm">S</span>
              </div>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">
                Satya<span className="text-emerald-600">Check</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 font-extrabold uppercase tracking-wider mt-0.5 block">
                Evidence Forensic System
              </span>
            </div>
          </div>

          {/* Navigation Links with Category Headings */}
          <div className="space-y-3">
            
            {/* Section 1: Main Workspace */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 px-2 pb-1">
                Main Workspace
              </div>

              <nav className="space-y-1">
                {navItems.filter(item => ['dashboard', 'verify', 'history', 'landing'].includes(item.id)).map((item) => {
                  const Icon = item.icon || LayoutDashboard;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group ${
                        isActive 
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg transition ${
                          isActive 
                            ? 'bg-emerald-700 text-white' 
                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className={`block text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                          {item.desc && (
                            <span className={`block text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{item.desc}</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                      }`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section 2: Dedicated Tampering Section Header */}
            {user && (
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 px-2 pb-1 flex items-center space-x-1">
                  <FileSearch className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tampering Detection</span>
                </div>

                <nav className="space-y-1">
                  {navItems.filter(item => ['tamper', 'hash_verify'].includes(item.id)).map((item) => {
                    const Icon = item.icon || FileSearch;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group ${
                          isActive 
                            ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg transition ${
                            isActive 
                              ? 'bg-emerald-700 text-white' 
                              : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className={`block text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                            {item.desc && (
                              <span className={`block text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{item.desc}</span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Section 3: Administration */}
            {user && user.is_admin && (
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 px-2 pb-1">
                  Administration
                </div>

                <nav className="space-y-1">
                  {navItems.filter(item => item.id === 'admin').map((item) => {
                    const Icon = item.icon || ShieldCheck;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group ${
                          isActive 
                            ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg transition ${
                            isActive 
                              ? 'bg-emerald-700 text-white' 
                              : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className={`block text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                            {item.desc && (
                              <span className={`block text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{item.desc}</span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

          </div>

        </div>

        {/* User Auth Section Bottom */}
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex-shrink-0">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{user.email.split('@')[0]}</div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Workspace Active</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-xs font-medium transition flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-slate-600 font-medium">Access full forensic tools</div>
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center justify-center space-x-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>Login to Workspace</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

