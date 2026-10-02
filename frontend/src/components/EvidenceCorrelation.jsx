import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export default function EvidenceCorrelation({ analysis }) {
  const [showDetails, setShowDetails] = useState(false);
  const signals = analysis?.why_json?.signals || [];

  if (!signals || signals.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">EVIDENCE CORRELATION BREAKDOWN</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm hidden sm:inline-block">
            Multi-Signal Engine
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition flex items-center space-x-1.5 shadow-sm ${
              showDetails 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showDetails ? 'Hide Signal Breakdown' : 'Show Signal Breakdown'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="overflow-x-auto pt-1 animate-fade-in">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-slate-950 font-mono uppercase text-xs bg-slate-100 font-black">
                <th className="py-3.5 px-4">Signal Category</th>
                <th className="py-3.5 px-4">Observed Finding</th>
                <th className="py-3.5 px-4 text-right">Evidence Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {signals.map((sig, idx) => {
                const impact = sig.impact || 'NEUTRAL';
                let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm';
                
                if (impact === 'SUPPORTING') {
                  badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm';
                } else if (impact === 'CONCERN') {
                  badgeColor = 'bg-red-50 text-red-800 border-red-300 shadow-sm';
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-black text-slate-950 whitespace-nowrap">
                      {sig.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-950 font-extrabold leading-relaxed">
                      {sig.finding}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
                        {sig.badge || impact}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

