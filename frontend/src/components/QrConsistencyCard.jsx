import React from 'react';
import { QrCode, AlertTriangle } from 'lucide-react';

export default function QrConsistencyCard({ qrData }) {
  const qrFound = qrData?.qr_found ?? false;
  const fieldResults = qrData?.field_results || [];
  const hasFields = qrData?.has_recognizable_fields && fieldResults.length > 0;
  const rawContent = qrData?.raw_content || qrData?.decoded_content || '';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
      <div className="flex items-center space-x-2 text-xs font-black text-slate-950 font-mono uppercase tracking-wider">
        <QrCode className="w-4 h-4 text-cyan-600" />
        <span>QR VS VISIBLE CONTENT CONSISTENCY</span>
      </div>

      {!qrFound ? (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-950 font-extrabold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>QR Code: Not Available (No QR code detected on uploaded document)</span>
        </div>
      ) : hasFields ? (
        <div className="space-y-2 font-mono text-xs">
          {fieldResults.map((resultStr, idx) => {
            const isMatch = resultStr.startsWith('✅');
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center space-x-2 font-semibold ${
                  isMatch
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <span>{resultStr}</span>
              </div>
            );
          })}

          {qrData.has_inconsistency && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{qrData.warning_message || "QR/content inconsistency detected — manual review recommended."}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 font-semibold break-all">
          QR Code Found: {rawContent}
        </div>
      )}
    </div>
  );
}
