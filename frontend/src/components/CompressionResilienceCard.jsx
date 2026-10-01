import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export default function CompressionResilienceCard({ resilience }) {
  if (!resilience || !resilience.breakdown) return null;

  const stability = resilience.stability || "HIGH";
  const advisory = resilience.advisory || "Prediction stability tested across re-compression levels.";
  const maxDelta = resilience.max_confidence_delta || 0.0;

  const getStabilityBadge = (stab) => {
    if (stab === "HIGH") {
      return "bg-emerald-50 text-emerald-800 border-emerald-300";
    } else if (stab === "MEDIUM") {
      return "bg-amber-50 text-amber-800 border-amber-300";
    }
    return "bg-red-50 text-red-800 border-red-300";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">RESILIENCE CHECK (POST-PROCESSING STABILITY)</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-900 font-mono font-black">Prediction Stability:</span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-black border ${getStabilityBadge(stability)}`}>
            {stability}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-800 font-semibold">
        Tests AI model confidence consistency after applying standard post-processing re-compression and resizing transformations.
      </p>

      {/* Grid of compression stages */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {resilience.breakdown.map((item, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-300 text-center space-y-1 shadow-sm">
            <div className="text-xs text-slate-900 font-mono uppercase font-black">{item.stage}</div>
            <div className="text-base sm:text-lg font-black text-emerald-800">
              {Math.round(item.confidence * 100)}%
            </div>
            <div className="text-xs text-slate-900 font-extrabold">
              {item.status}
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Box */}
      <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-xs text-slate-900 flex items-start space-x-2.5 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed font-semibold">
          <strong className="text-slate-950 font-black">Stability Advisory:</strong> {advisory} (Max Confidence Shift: {Math.round(maxDelta * 100)}%)
        </div>
      </div>
    </div>
  );
}

