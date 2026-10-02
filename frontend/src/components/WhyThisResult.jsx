import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function WhyThisResult({ analysis }) {
  const [showAll, setShowAll] = useState(false);
  const whyItems = analysis?.why_json?.why_items || [];

  if (!whyItems || whyItems.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm">
        <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>WHY THIS RESULT?</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-2">Analysis in progress or no evidence explanations generated.</p>
      </div>
    );
  }

  const totalCount = whyItems.length;
  const displayedItems = showAll ? whyItems : whyItems.slice(0, 3);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-base font-bold tracking-wide text-slate-900">WHY THIS RESULT?</h2>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
          Top {Math.min(3, totalCount)} of {totalCount} Findings
        </span>
      </div>

      <p className="text-xs text-slate-600 font-medium">
        Key findings and verification signals:
      </p>

      {/* Findings List */}
      <div className="space-y-2.5 pt-0.5">
        {displayedItems.map((item, idx) => {
          const type = item.type || 'neutral';
          const text = item.text || '';

          let containerStyle = 'border-slate-200 bg-slate-50/80 text-slate-800 font-medium';
          let icon = <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;

          if (type === 'pass') {
            containerStyle = 'border-emerald-200 bg-emerald-50/50 text-emerald-900 font-medium';
            icon = <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;
          } else if (type === 'concern') {
            containerStyle = 'border-red-200 bg-red-50/60 text-red-900 font-medium';
            icon = <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />;
          } else if (type === 'warning') {
            containerStyle = 'border-amber-200 bg-amber-50/60 text-amber-900 font-medium';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center space-x-3 text-xs sm:text-sm transition ${containerStyle}`}
            >
              {icon}
              <div className="flex-1 leading-relaxed">{text}</div>
            </div>
          );
        })}
      </div>

      {/* Toggle button if more than 3 findings */}
      {totalCount > 3 && (
        <div className="pt-0.5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-xs border border-slate-200 transition"
          >
            <span>{showAll ? 'Show less findings' : `Show all findings (${totalCount})`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      )}
    </div>
  );
}

