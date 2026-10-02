import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  FileImage,
  Award,
  ChevronDown,
  ChevronUp,
  QrCode,
  Upload
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import QrConsistencyCard from '../components/QrConsistencyCard';

export default function TamperCheckPage({ onViewDetail, onNavigate }) {
  const [evidenceIdInput, setEvidenceIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate_tampered'); // 'certificate_tampered', 'mark_sheet', 'genuine'
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [qrAlertMessage, setQrAlertMessage] = useState('');

  // Load interactive demo scenario
  const loadDemoScenario = async (type) => {
    setActiveTab(type);
    setLoading(true);
    setComparisonResult(null);
    setQrAlertMessage('');
    try {
      const res = await api.getDemoComparison(type);
      setComparisonResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial view starts with upload form ready
  }, []);

  const handleFileUploadAndVerify = async (file) => {
    setLoading(true);
    setQrAlertMessage('');
    try {
      const uploadRes = await api.uploadFile(file);
      const evId = uploadRes.evidence_id;
      setEvidenceIdInput(evId);
      
      const res = await api.verifyQrTamper(evId);

      if (!res.qr_found) {
        setComparisonResult(null);
        setQrAlertMessage("⚠️ No embedded QR Code detected in this certificate.");
      } else {
        setComparisonResult(res);
        setQrAlertMessage('');
      }
    } catch (err) {
      setComparisonResult(null);
      setQrAlertMessage("⚠️ No embedded QR Code detected in this certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyById = async (e) => {
    if (e) e.preventDefault();
    if (!evidenceIdInput.trim()) return;
    setLoading(true);
    setQrAlertMessage('');
    try {
      const res = await api.verifyQrTamper(evidenceIdInput.trim());

      if (!res.qr_found) {
        setComparisonResult(null);
        setQrAlertMessage("⚠️ No embedded QR Code detected in this certificate.");
      } else {
        setComparisonResult(res);
        setQrAlertMessage('');
      }
    } catch (err) {
      setComparisonResult(null);
      setQrAlertMessage("⚠️ No embedded QR Code detected in this certificate.");
    } finally {
      setLoading(false);
    }
  };

  const score = comparisonResult?.integrity_score ?? 100;
  const isAuthentic = score >= 80;

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      <Breadcrumb activeTab="tamper" onNavigate={onNavigate || (() => {})} />

      {/* Dedicated Certificate Check Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300 p-5 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-emerald-800 font-mono text-xs uppercase tracking-wider font-semibold bg-emerald-100/80 border border-emerald-300 w-fit px-3 py-0.5 rounded-full">
          <QrCode className="w-4 h-4 text-emerald-700" />
          <span>CERTIFICATE CHECK MODULE</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Certificate Check</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
          Decodes embedded QR codes and verifies document text to compute an instant 100-Point Integrity Rating.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-800 text-xs font-bold font-mono">
            QR
          </div>
          <h3 className="text-base font-bold text-slate-900">UPLOAD CERTIFICATE IMAGE OR ENTER EVIDENCE ID</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-cyan-500 bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center space-y-2 relative">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUploadAndVerify(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-6 h-6 text-cyan-600" />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Click or Drop Certificate File Here</span>
              <span className="text-[11px] text-slate-500 font-normal">Decodes QR code and checks text consistency</span>
            </div>
          </div>

          {/* Evidence ID Input */}
          <form onSubmit={handleVerifyById} className="space-y-2 text-xs flex flex-col justify-center">
            <label className="font-semibold text-slate-800">OR Enter Existing Evidence ID:</label>
            <input
              type="text"
              placeholder="e.g. SATYA-2026-8F3A7C"
              value={evidenceIdInput}
              onChange={(e) => setEvidenceIdInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning & Decoding...' : 'Run QR & Document Consistency Check'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* NO QR CODE POPUP NOTIFICATION BANNER (Displayed ONLY when NO QR code is found) */}
      {qrAlertMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold font-mono flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{qrAlertMessage}</span>
          </div>
          <button
            onClick={() => setQrAlertMessage('')}
            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* RESULT DISPLAY CARD (Displayed ONLY when QR Code IS present) */}
      {comparisonResult && comparisonResult.qr_found && (
        <div className={`glass-panel rounded-2xl p-6 sm:p-8 border shadow-xs space-y-6 ${
          isAuthentic ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'
        }`}>

          {/* Top Status Header with 100-Point Score Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              {isAuthentic ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">VERDICT</span>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isAuthentic ? 'text-emerald-900' : 'text-red-900'}`}>
                  {comparisonResult.main_result || comparisonResult.status}
                </h2>
              </div>
            </div>

            {/* Large 100-Point Score Badge */}
            <div className={`px-4 py-2.5 rounded-xl border text-center font-mono shadow-xs ${
              isAuthentic ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">INTEGRITY SCORE</div>
              <div className="text-2xl font-bold">{score} / 100</div>
            </div>
          </div>

          {/* QR vs Visible Content Consistency Section */}
          <QrConsistencyCard
            qrData={comparisonResult?.qr_consistency || {
              qr_found: comparisonResult?.qr_found ?? false,
              raw_content: comparisonResult?.qr_decoded_content || '',
              has_recognizable_fields: false,
              field_results: []
            }}
          />

          {/* Visual "WHAT CHANGED?" Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. WHAT CHANGED? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                🔎 WHAT CHANGED?
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-center flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-600">QR RECORD</div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5" title={comparisonResult.what_changed?.qr_record_value}>
                    {comparisonResult.what_changed?.qr_record_value}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-red-500 shrink-0 mx-2" />

                <div className="text-center flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-600">CERTIFICATE TEXT</div>
                  <div className="font-bold text-red-600 text-xs sm:text-sm truncate mt-0.5" title={comparisonResult.what_changed?.certificate_text_value}>
                    {comparisonResult.what_changed?.certificate_text_value}
                  </div>
                </div>
              </div>

              <div className={`text-center text-xs sm:text-sm font-semibold p-2.5 rounded-xl border ${
                isAuthentic ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {comparisonResult.what_changed?.arrow}
              </div>
            </div>

            {/* 2. WHERE DID IT CHANGE? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                📍 WHERE DID IT CHANGE?
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {comparisonResult.where_changed}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Cross-checked against embedded QR record
                </div>
              </div>
            </div>

            {/* 3. WHY WAS IT FLAGGED? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                WHY WAS IT FLAGGED?
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                {comparisonResult.why_flagged?.map((item, i) => {
                  const isPass = item.includes('✓') || item.includes('✅');
                  const isFail = item.includes('❌');
                  const cleanText = item.replace(/^(❌\s*|✓\s*|✅\s*|•\s*)+/, '').trim();

                  return (
                    <div key={i} className="flex items-start space-x-2 leading-relaxed">
                      <span className="shrink-0 mt-0.5">
                        {isFail ? '❌' : isPass ? '✅' : '•'}
                      </span>
                      <span className={isFail ? 'text-slate-900 font-semibold' : 'text-slate-800 font-medium'}>
                        {cleanText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* SIMPLE EXPLANATION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">SatyaCheck Tampering Analysis Summary:</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {comparisonResult.explanation}
            </p>
          </div>

          {/* TECHNICAL EVIDENCE (Collapsible) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-between transition border-b border-slate-200"
            >
              <span>TECHNICAL EVIDENCE & SHA-256 HASH DETAILS</span>
              {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnical && (
              <div className="p-5 text-xs font-mono space-y-3 bg-white text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold text-[10px]">QR DECODE STATUS:</span>
                    <div className="truncate text-slate-900">{comparisonResult.technical_evidence?.qr_status || 'DECODED'}</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-bold text-[10px]">RAW QR DATA:</span>
                    <div className="truncate text-cyan-700">{comparisonResult.technical_evidence?.qr_raw_data}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    STATUS: <span className={isAuthentic ? 'text-emerald-600' : 'text-red-600'}>{comparisonResult.technical_evidence?.sha256_status || 'CHECKED'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    CONTENT: <span className={isAuthentic ? 'text-emerald-600' : 'text-red-600'}>{comparisonResult.technical_evidence?.content_comparison || 'ANALYZED'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    SCORE: <span className={isAuthentic ? 'text-emerald-600' : 'text-red-600'}>{score} / 100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
