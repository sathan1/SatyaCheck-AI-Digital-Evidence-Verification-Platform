import React, { useState, useEffect } from 'react';
import { ShieldCheck, BarChart3, AlertTriangle, FileImage, FileVideo, FileText, ArrowRight, Lock } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';

export default function AdminDashboard({ user, onViewDetail, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      if (!user?.is_admin) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getAdminStats();
        setStats(res.statistics || {});
        setRecent(res.recent_verifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [user]);

  if (!user?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">403 Access Denied</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Admin privileges are required to open the Admin Forensic Dashboard. Standard user accounts cannot view system metrics or audit logs.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="px-5 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition shadow-sm"
        >
          Return to User Workspace
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-600 text-xs font-bold">Loading admin metrics...</div>;
  }

  return (
    <div className="space-y-6 py-2">
      <Breadcrumb activeTab="admin" onNavigate={onNavigate || (() => {})} />

      <div>
        <div className="flex items-center space-x-2 text-cyan-700 font-mono text-xs uppercase tracking-widest font-bold">
          <BarChart3 className="w-4 h-4" />
          <span>PLATFORM CONTROL & METRICS</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">ADMIN FORENSIC DASHBOARD</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="text-[11px] text-slate-600 font-bold uppercase font-mono">TOTAL EVIDENCE</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{stats?.total_evidence || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="text-[11px] text-slate-600 font-bold uppercase font-mono">IMAGE EXHIBITS</div>
          <div className="text-3xl font-black text-cyan-600 mt-1">{stats?.image_analyses || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="text-[11px] text-slate-600 font-bold uppercase font-mono">VIDEO EXHIBITS</div>
          <div className="text-3xl font-black text-purple-600 mt-1">{stats?.video_analyses || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="text-[11px] text-slate-600 font-bold uppercase font-mono">PDF EXHIBITS</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.pdf_analyses || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-red-200 bg-red-50/50 shadow-sm">
          <div className="text-[11px] text-red-700 font-bold uppercase font-mono">NEEDS REVIEW</div>
          <div className="text-3xl font-black text-red-600 mt-1">{stats?.needs_review || 0}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="text-[11px] text-amber-800 font-bold uppercase font-mono">HASH MISMATCHES</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.reference_mismatches || 0}</div>
        </div>
      </div>

      {/* Recent Evidence Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 bg-white overflow-hidden space-y-3 p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">RECENT VERIFICATION AUDIT TRAIL</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono uppercase text-[11px] font-bold">
                <th className="py-2.5 px-3">Evidence ID</th>
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Assessment</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.map((row) => (
                <tr key={row.evidence_id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-700">{row.evidence_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.filename}</td>
                  <td className="py-3 px-3 uppercase text-slate-600 font-medium">{row.file_type}</td>
                  <td className="py-3 px-3 font-bold text-amber-700">{row.assessment || 'PENDING'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onViewDetail(row.evidence_id)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-300 text-xs font-bold transition"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
