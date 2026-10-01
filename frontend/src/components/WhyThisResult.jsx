import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, HelpCircle } from 'lucide-react';

export default function WhyThisResult({ analysis }) {
  const whyItems = analysis?.why_json?.why_items || [];

  if (!whyItems || whyItems.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>WHY THIS RESULT?</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2">Analysis in progress or no evidence explanations generated.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-emerald-200 bg-white shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-black tracking-wide text-slate-900">WHY THIS RESULT?</h2>
        </div>
        <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm">
          Analysis Summary
        </span>
      </div>

      <p className="text-xs text-slate-900 font-extrabold">
        Key findings and verification signals:
      </p>

      <div className="space-y-3 pt-1">
        {whyItems.map((item, idx) => {
          const type = item.type || 'neutral';
          const text = item.text || '';

          let borderStyle = 'border-slate-300 bg-slate-50 text-slate-950 font-extrabold';
          let icon = <span className="text-emerald-600 font-mono text-sm font-bold">○</span>;

          if (type === 'pass') {
            borderStyle = 'border-emerald-300 bg-emerald-50/90 text-emerald-950 font-extrabold';
            icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />;
          } else if (type === 'concern') {
            borderStyle = 'border-red-300 bg-red-50 text-red-950 font-black';
            icon = <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0 mt-0.5" />;
          } else if (type === 'warning') {
            borderStyle = 'border-amber-300 bg-amber-50 text-amber-950 font-extrabold';
            icon = <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs sm:text-sm transition shadow-sm ${borderStyle}`}
            >
              {icon}
              <div className="flex-1 leading-relaxed">{text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

