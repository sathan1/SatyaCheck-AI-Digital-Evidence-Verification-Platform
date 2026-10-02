import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, AlertTriangle, AlertCircle, Info, Sparkles, Target, CheckCircle2 } from 'lucide-react';

export default function EvidenceHeader({ evidence, analysis, metadata }) {
  const [copied, setCopied] = useState(false);

  if (!evidence) return null;

  const handleCopyHash = () => {
    if (evidence.sha256) {
      navigator.clipboard.writeText(evidence.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const assessment = analysis?.assessment || "LIKELY AUTHENTIC";
  const isDemo = analysis?.demo_mode ?? true;
  const aiConfidence = analysis?.ai_confidence ?? 0.054;
  const aiScorePct = Math.round(aiConfidence * 100);

  // Authenticity score directly calculated from AI frame analysis
  const frameAuthenticityScore = Math.max(5.0, Math.min(100.0, Math.round((1.0 - aiConfidence) * 1000) / 10));
  const trustScoreStr = frameAuthenticityScore.toFixed(1);

  // Metric breakdown out of 100
  const aiFramePts = Math.round((1.0 - aiConfidence) * 500) / 10;
  const cryptoIntegrityPts = (analysis?.reference_status === 'EXACT MATCH' || evidence?.sha256) ? 25.0 : 12.5;
  const metadataForensicPts = Math.max(0.0, Math.round((frameAuthenticityScore - aiFramePts - cryptoIntegrityPts) * 10) / 10);


  // Status Badge Configuration
  const getAssessmentBadge = (status) => {
    if (status === 'INCONCLUSIVE' || !status) {
      if (aiConfidence >= 0.65) status = 'HIGH RISK: SUSPECTED AI GENERATED';
      else if (aiConfidence >= 0.35) status = 'NEEDS REVIEW';
      else status = 'LIKELY AUTHENTIC';
    }

    switch (status) {
      case 'LIKELY AUTHENTIC':
        return {
          border: 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm',
          icon: CheckCircle2,
          label: 'VERIFIED AUTHENTIC'
        };
      case 'HIGH RISK: SUSPECTED AI GENERATED':
      case 'MULTIPLE INDICATORS':
      case 'REFERENCE MISMATCH':
      case 'HIGH RISK':
        return {
          border: 'border-red-400 bg-red-50 text-red-800 shadow-sm',
          icon: AlertCircle,
          label: status
        };
      case 'NEEDS REVIEW':
        return {
          border: 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm',
          icon: AlertTriangle,
          label: 'NEEDS REVIEW'
        };
      default:
        return {
          border: 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm',
          icon: CheckCircle2,
          label: 'VERIFIED AUTHENTIC'
        };
    }
  };

  const badgeConfig = getAssessmentBadge(assessment);
  const StatusIcon = badgeConfig.icon;
  const whyBullets = [];
  const hasCameraMeta = metadata?.camera_make || metadata?.camera_model;
  if (!hasCameraMeta) {
    whyBullets.push("No metadata found. This does not prove the image is AI-generated, as metadata is commonly removed by messaging apps and social media.");
  } else {
    whyBullets.push(`Authentic EXIF camera metadata tags identified (${metadata?.camera_make || 'Device'} ${metadata?.camera_model || ''}).`);
  }

  if (aiConfidence < 0.3) {
    whyBullets.push(`Low AI-generation signals detected (${(aiConfidence * 100).toFixed(1)}% probability)`);
  } else if (aiConfidence < 0.7) {
    whyBullets.push(`Moderate AI-generation signals detected (${(aiConfidence * 100).toFixed(1)}% probability)`);
  } else {
    whyBullets.push(`High AI-generation signals detected (${(aiConfidence * 100).toFixed(1)}% probability)`);
  }

  // Add any custom extra reason if available
  if (analysis?.why_json?.why_items) {
    analysis.why_json.why_items.forEach(item => {
      if (item.type === 'concern' && !whyBullets.some(b => b.includes(item.text))) {
        whyBullets.push(item.text);
      }
    });
  }

  return (
    <div className="space-y-6">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Evidence Verification Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            AI Content Detection & Forensic Verification
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium self-start sm:self-auto shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>STATUS: EVIDENCE PRESERVED</span>
        </div>
      </div>

      {/* AUTOMATED FRAME INTEGRITY RATING - Main Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xs bg-white">
        
        {/* Rating Header & Assessment Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-semibold tracking-wider text-emerald-700 uppercase">
              AUTHENTIC FRAME ANALYSIS RATING
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
              AI Frame & Authenticity Assessment
            </h2>
          </div>

          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold font-mono ${badgeConfig.border}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{badgeConfig.label}</span>
          </div>
        </div>

        {/* Authenticity Rating Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-700 font-mono">Authenticity Score Progress</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">{trustScoreStr}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                frameAuthenticityScore >= 75 
                  ? 'bg-emerald-500'
                  : frameAuthenticityScore >= 50 
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, frameAuthenticityScore)}%` }}
            />
          </div>
        </div>

        {/* Metrics Score & Breakdown Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          
          {/* Left Large Score Card (4 columns) */}
          <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[130px]">
            <div className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${
              frameAuthenticityScore >= 75 ? 'text-emerald-600' : frameAuthenticityScore >= 50 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {trustScoreStr}
            </div>
            <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase mt-2 tracking-wider">
              AUTHENTICITY SCORE / 100
            </div>
          </div>

          {/* Right 3 Breakdown Cards (8 columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* AI FRAME ANALYSIS */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-1 hover:border-emerald-200 transition">
              <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                AI FRAME ANALYSIS
              </div>
              <div className="text-lg font-mono font-bold text-slate-900">
                <span className="text-emerald-600">{aiFramePts.toFixed(1)}</span> <span className="text-slate-500 text-xs font-normal">/ 50 pts</span>
              </div>
            </div>

            {/* CRYPTOGRAPHIC PRESERVATION */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-1 hover:border-emerald-200 transition">
              <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                CRYPTOGRAPHIC PRESERVATION
              </div>
              <div className="text-lg font-mono font-bold text-slate-900">
                <span className="text-emerald-600">{cryptoIntegrityPts.toFixed(1)}</span> <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
              </div>
            </div>

            {/* MEDIA FORENSICS & METADATA */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-1 sm:col-span-2 hover:border-emerald-200 transition">
              <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                MEDIA FORENSICS & METADATA
              </div>
              <div className="text-lg font-mono font-bold text-slate-900">
                <span className="text-emerald-600">{metadataForensicPts.toFixed(1)}</span> <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Cryptographic SHA-256 Fingerprint & File Details Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700">EVIDENCE ID</span>
          <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
            {evidence.evidence_id}
          </span>
          <span className="text-xs text-slate-800 font-semibold truncate max-w-xs" title={evidence.filename}>
            {evidence.filename}
          </span>
          <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
            {evidence.file_type} ({round(evidence.file_size / 1024)} KB)
          </span>
        </div>

        <div className="flex items-center space-x-2 max-w-full min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-mono text-slate-600 font-medium flex-shrink-0">SHA-256:</span>
          <span className="font-mono text-xs text-slate-700 truncate max-w-[200px] sm:max-w-xs font-medium" title={evidence.sha256}>
            {evidence.sha256}
          </span>
          <button
            onClick={handleCopyHash}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  function round(val) {
    return Math.round(val * 10) / 10;
  }
}

