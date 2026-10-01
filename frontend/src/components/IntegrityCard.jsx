import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, RefreshCw, AlertCircle, FileKey } from 'lucide-react';
import { api } from '../services/api';

export default function IntegrityCard({ evidence, referenceData, onReferenceUpdated }) {
  const [registering, setRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [customHashInput, setCustomHashInput] = useState('');
  const [msg, setMsg] = useState(null);

  if (!evidence) return null;

  const handleRegisterSelf = async () => {
    setRegistering(true);
    try {
      const res = await api.registerReference(evidence.evidence_id, evidence.sha256, evidence.filename);
      setMsg({ type: 'success', text: 'Current SHA-256 registered as original reference.' });
      if (onReferenceUpdated) onReferenceUpdated();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to register reference' });
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterCustom = async (e) => {
    e.preventDefault();
    if (!customHashInput.trim()) return;
    setRegistering(true);
    try {
      await api.registerReference(evidence.evidence_id, customHashInput.trim(), 'known_original_reference');
      setMsg({ type: 'success', text: 'Known original SHA-256 reference registered.' });
      setCustomHashInput('');
      if (onReferenceUpdated) onReferenceUpdated();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to register hash' });
    } finally {
      setRegistering(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyReference(evidence.evidence_id);
      setVerifyResult(res);
    } catch (err) {
      setMsg({ type: 'error', text: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const isMatch = verifyResult?.is_match;
  const statusLabel = verifyResult?.status;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <FileKey className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">FILE INTEGRITY & REFERENCE CHECK</h2>
        </div>
        <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
          Cryptographic Fingerprinting
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Registration */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Register Original Reference</span>
          </h3>

          <p className="text-xs text-slate-950 leading-relaxed font-extrabold">
            Store a known authentic SHA-256 hash reference to enable future tamper and re-compression comparison.
          </p>

          <button
            onClick={handleRegisterSelf}
            disabled={registering}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-md transition"
          >
            {registering ? 'Registering...' : 'Register Current SHA-256 as Reference'}
          </button>

          <form onSubmit={handleRegisterCustom} className="pt-2 border-t border-slate-200 space-y-2">
            <label className="text-[11px] text-emerald-800 font-mono font-bold block">OR Enter Known Original SHA-256:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Paste 64-character SHA-256 hash..."
                value={customHashInput}
                onChange={(e) => setCustomHashInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={registering || !customHashInput}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Right: Verification */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>2. Verify Against Registered Reference</span>
            </h3>

            <p className="text-xs text-slate-950 mt-1 leading-relaxed font-extrabold">
              Compare current file SHA-256 (<code className="text-emerald-800 font-mono font-black">{evidence.sha256.substring(0, 12)}...</code>) with registered reference.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-md transition flex items-center justify-center space-x-2"
          >
            {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{verifying ? 'Comparing Hashes...' : 'Run SHA-256 Verification'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl border text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
          {msg.text}
        </div>
      )}

      {/* Verification Result Outcome Box */}
      {verifyResult && (
        <div className={`p-4 rounded-xl border space-y-2 ${isMatch ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'}`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            {isMatch ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
            <span>{statusLabel}</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-950 font-extrabold">
            {verifyResult.explanation}
          </p>

          {!isMatch && verifyResult.advisory && (
            <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-900 italic font-medium">
              <strong>WhatsApp / Re-compression Advisory:</strong> {verifyResult.advisory}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

