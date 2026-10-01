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
    loadDemoScenario('certificate_tampered');
  }, []);

  const handleFileUploadAndVerify = async (file) => {
    setLoading(true);
    setComparisonResult(null);
    setQrAlertMessage('');
    try {
      const uploadRes = await api.uploadFile(file);
      const evId = uploadRes.evidence_id;
      setEvidenceIdInput(evId);
      
      const res = await api.verifyQrTamper(evId);
      setComparisonResult(res);

      if (!res.qr_found) {
        const msg = "⚠️ No QR code detected in the uploaded file.";
        setQrAlertMessage(msg);
        alert(msg);
      }
    } catch (err) {
      alert("Failed to analyze uploaded file for QR tampering.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyById = async (e) => {
    if (e) e.preventDefault();
    if (!evidenceIdInput.trim()) return;
    setLoading(true);
    setComparisonResult(null);
    setQrAlertMessage('');
    try {
      const res = await api.verifyQrTamper(evidenceIdInput.trim());
      setComparisonResult(res);

      if (!res.qr_found) {
        const msg = "⚠️ No QR code detected in the uploaded file.";
        setQrAlertMessage(msg);
        alert(msg);
      }
    } catch (err) {
      alert("Verification failed. Please check Evidence ID.");
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
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-400 p-5 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-emerald-900 font-mono text-xs uppercase tracking-widest font-black bg-emerald-200/80 border border-emerald-400 w-fit px-3 py-1 rounded-full shadow-xs">
          <QrCode className="w-4 h-4 text-emerald-800" />
          <span>CERTIFICATE CHECK MODULE</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Certificate Check</h1>
        <p className="text-xs sm:text-sm font-extrabold text-slate-900 max-w-2xl">
          Decodes embedded QR codes and verifies document text to compute an instant 100-Point Integrity Rating.
        </p>
      </div>

      {/* 3 Interactive Demo Selector Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span>CERTIFICATE VERIFICATION DEMO SAMPLES</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => loadDemoScenario('certificate_tampered')}
            className={`p-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
              activeTab === 'certificate_tampered'
                ? 'bg-red-50 text-red-900 border-red-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-red-600" />
            <span>Community Certificate (Tampered)</span>
          </button>

          <button
            onClick={() => loadDemoScenario('mark_sheet')}
            className={`p-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
              activeTab === 'mark_sheet'
                ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Academic Mark Sheet (Tampered Marks)</span>
          </button>

          <button
            onClick={() => loadDemoScenario('genuine')}
            className={`p-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
              activeTab === 'genuine'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authentic Government Certificate (Verified)</span>
          </button>
        </div>
      </div>

      {/* Custom Certificate Upload & Evidence ID Verification */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 text-xs font-bold font-mono">
            QR
          </div>
          <h3 className="text-sm font-bold text-slate-900">UPLOAD CERTIFICATE IMAGE OR ENTER EVIDENCE ID</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-cyan-500 bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center space-y-2 relative">
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
              <span className="text-xs font-bold text-slate-800 block">Click or Drop Certificate File Here</span>
              <span className="text-[11px] text-slate-500">Decodes QR code and checks text consistency</span>
            </div>
          </div>

          {/* Evidence ID Input */}
          <form onSubmit={handleVerifyById} className="space-y-2 text-xs flex flex-col justify-center">
            <label className="font-bold text-slate-700">OR Enter Existing Evidence ID:</label>
            <input
              type="text"
              placeholder="e.g. SATYA-2026-8F3A7C"
              value={evidenceIdInput}
              onChange={(e) => setEvidenceIdInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning & Decoding...' : 'Run QR & Document Consistency Check'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* NO QR CODE POPUP NOTIFICATION BANNER */}
      {qrAlertMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{qrAlertMessage}</span>
          </div>
          <button
            onClick={() => setQrAlertMessage('')}
            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs transition"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* RESULT DISPLAY CARD */}
      {comparisonResult && (
        <div className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${
          isAuthentic ? 'border-emerald-300 bg-emerald-50/40' : 'border-red-300 bg-red-50/40'
        }`}>

          {/* Top Status Header with 100-Point Score Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              {isAuthentic ? (
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-red-100 text-red-800 border border-red-300">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">VERDICT</span>
                <h2 className={`text-2xl sm:text-3xl font-black ${isAuthentic ? 'text-emerald-900' : 'text-red-900'}`}>
                  {comparisonResult.main_result || comparisonResult.status}
                </h2>
              </div>
            </div>

            {/* Large 100-Point Score Badge */}
            <div className={`px-5 py-3 rounded-2xl border text-center font-mono shadow-sm ${
              isAuthentic ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-red-100 text-red-900 border-red-300'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider">INTEGRITY SCORE</div>
              <div className="text-3xl font-black">{score} / 100</div>
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                🔎 WHAT CHANGED?
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs">
                <div className="text-center flex-1">
                  <div className="text-[10px] text-slate-500 font-sans">QR RECORD</div>
                  <div className="font-bold text-slate-800 text-[11px] truncate">{comparisonResult.what_changed?.qr_record_value}</div>
                </div>

                <ArrowRight className="w-4 h-4 text-red-500 shrink-0 mx-1" />

                <div className="text-center flex-1">
                  <div className="text-[10px] text-slate-500 font-sans">CERTIFICATE TEXT</div>
                  <div className="font-bold text-red-600 text-[11px] truncate">{comparisonResult.what_changed?.certificate_text_value}</div>
                </div>
              </div>

              <div className={`text-center text-xs font-bold font-mono p-2 rounded-lg border ${
                isAuthentic ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {comparisonResult.what_changed?.arrow}
              </div>
            </div>

            {/* 2. WHERE DID IT CHANGE? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                📍 WHERE DID IT CHANGE?
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <div className="text-sm font-extrabold text-slate-900">
                  {comparisonResult.where_changed}
                </div>
                <div className="text-xs text-slate-500">
                  Cross-checked against embedded QR record
                </div>
              </div>
            </div>

            {/* 3. WHY WAS IT FLAGGED? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                WHY WAS IT FLAGGED?
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                {comparisonResult.why_flagged?.map((item, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <span>{item}</span>
                  </div>
                ))}
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
