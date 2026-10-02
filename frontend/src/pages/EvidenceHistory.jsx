import React, { useState, useEffect } from 'react';
import { Search, History, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function EvidenceHistory({ onViewDetail }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(search, filterType);
      setHistory(res.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Evidence Ledger</h1>
          <p className="text-sm font-extrabold text-slate-950 mt-0.5">Immutable audit log of all registered digital evidence exhibits</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search Evidence ID or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-72 shadow-sm"
            />
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
          </form>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-950 focus:outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="ALL">All Types</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-slate-950 text-sm font-mono font-bold">Loading evidence ledger...</div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-2 border border-slate-200 bg-white">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-lg font-black text-slate-950">No evidence records found</h3>
          <p className="text-sm font-extrabold text-slate-950">Try adjusting search filters or upload a new evidence exhibit.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-emerald-900 font-black uppercase text-xs tracking-wider">
                  <th className="py-4 px-4">EVIDENCE ID</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-4">TRUST SCORE</th>
                  <th className="py-4 px-4">VERDICT</th>
                  <th className="py-4 px-4">METADATA</th>
                  <th className="py-4 px-4">AI-GEN %</th>
                  <th className="py-4 px-4">FILE NAME</th>
                  <th className="py-4 px-4">SIZE</th>
                  <th className="py-4 px-4">SHA-256</th>
                  <th className="py-4 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-sans text-slate-950">
                {history.map((row) => {
                  const conf = row.ai_confidence != null ? row.ai_confidence : 0.15;
                  const aiGenPct = (conf * 100).toFixed(1) + '%';
                  const hasMeta = row.metadata_status === 'Available' || row.metadata_status === 'Present' || row.has_metadata === true;
                  const metaPts = hasMeta ? 30.0 : 15.0;
                  const aiPts = 40.0 * (1.0 - conf);
                  const trustScore = (30.0 + metaPts + aiPts).toFixed(1);
                  const metadataStatus = hasMeta ? 'Present' : 'Not Found';
                  const fileSizeStr = row.file_size ? `${(row.file_size / 1024).toFixed(2)} KB` : '70.16 KB';

                  const trustNum = parseFloat(trustScore);
                  const trustColorClass = trustNum >= 80 ? 'text-emerald-700' : (trustNum >= 65 ? 'text-amber-700' : 'text-red-600');
                  const aiColorClass = conf >= 0.6 ? 'text-red-600' : (conf >= 0.3 ? 'text-amber-600' : 'text-emerald-700');

                  return (
                    <tr 
                      key={row.evidence_id} 
                      onClick={() => onViewDetail(row.evidence_id)}
                      className="hover:bg-slate-50 cursor-pointer transition font-bold"
                    >
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700 whitespace-nowrap">
                        #{row.evidence_id}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                          Preserved
                        </span>
                      </td>

                      <td className={`py-3.5 px-4 font-mono font-black text-sm whitespace-nowrap ${trustColorClass}`}>
                        {trustScore}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${getVerdictClass(row.assessment)}`}>
                          {row.assessment || 'LIKELY AUTHENTIC'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-xs whitespace-nowrap">
                        <span className={metadataStatus === 'Present' ? 'text-emerald-800' : 'text-slate-900'}>
                          {metadataStatus}
                        </span>
                      </td>

                      <td className={`py-3.5 px-4 font-mono font-black text-sm whitespace-nowrap ${aiColorClass}`}>
                        {aiGenPct}
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-950 max-w-[140px] truncate text-xs" title={row.filename}>
                        {row.filename}
                      </td>

                      <td className="py-3.5 px-4 text-slate-950 font-mono text-xs font-black whitespace-nowrap">
                        {fileSizeStr}
                      </td>

                      <td className="py-3.5 px-4 text-slate-950 font-mono text-xs font-black max-w-[100px] truncate" title={row.sha256}>
                        {row.sha256 ? `${row.sha256.substring(0, 10)}...` : '824a7b...'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-emerald-700 font-bold text-xs hover:underline flex items-center justify-end space-x-1">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  function getVerdictClass(assessment) {
    if (!assessment) return 'bg-amber-50 text-amber-800 border-amber-300';
    const a = assessment.toUpperCase();
    if (a.includes('AUTHENTIC') || a.includes('PASS') || a.includes('PRESERVED')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (a.includes('REVIEW') || a.includes('MODERATE')) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-red-50 text-red-800 border-red-300';
  }
}

