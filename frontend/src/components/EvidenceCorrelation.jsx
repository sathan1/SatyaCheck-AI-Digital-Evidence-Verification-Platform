import React from 'react';
import { Layers } from 'lucide-react';

export default function EvidenceCorrelation({ analysis }) {
  const signals = analysis?.why_json?.signals || [];

  if (!signals || signals.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">EVIDENCE CORRELATION BREAKDOWN</h2>
        </div>
        <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm">
          Multi-Signal Correlation Engine
        </span>
      </div>

      <div className="overflow-x-auto">
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
    </div>
  );
}

