import React from 'react';
import { Info } from 'lucide-react';

export default function LimitationsDisclaimer() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-900 font-extrabold shadow-sm">
      <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <strong className="text-slate-950 font-black">Investigative Notice:</strong> SatyaCheck outputs probabilistic AI model confidence scores and cryptographic SHA-256 evidence digests. Results provide forensic indicators for investigative review and should be evaluated by qualified examiners.
      </p>
    </div>
  );
}

