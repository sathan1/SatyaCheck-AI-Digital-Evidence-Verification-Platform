import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  ArrowRight, 
  FileImage, 
  FileVideo, 
  FileKey, 
  FileText, 
  Cpu, 
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Eye
} from 'lucide-react';
import UploadArea from '../components/UploadArea';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';

export default function Dashboard({ onStartVerification, onTryDemo, onFileUpload, onRunDemoPreset, isUploading, onNavigate }) {
  const [demoSamples, setDemoSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [activeSampleId, setActiveSampleId] = useState(null);

  useEffect(() => {
    async function fetchSamples() {
      try {
        const res = await api.getDemoSamples();
        setDemoSamples(res.demo_samples || []);
      } catch (err) {
        console.error("Failed to load demo samples:", err);
      } finally {
        setLoadingSamples(false);
      }
    }
    fetchSamples();
  }, []);

  const handleExecuteSample = async (sample) => {
    setActiveSampleId(sample.id);
    if (onRunDemoPreset) {
      await onRunDemoPreset(sample);
    }
    setActiveSampleId(null);
  };

  return (
    <div className="space-y-8 py-2">
      
      {/* Clear Dashboard Path / Breadcrumb */}
      <Breadcrumb activeTab="dashboard" onNavigate={onNavigate || (() => {})} />

      {/* Hero Header Section */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-10 overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SatyaCheck Digital Evidence Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Evidence Forensic <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-950 font-extrabold max-w-2xl">
            Upload files or select sample media exhibits below for instant forensic verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStartVerification}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition active:scale-95 shadow-emerald-600/20"
            >
              <UploadCloud className="w-4.5 h-4.5" />
              <span>Verify New File</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTryDemo}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-sm border border-purple-300 transition active:scale-95"
            >
              <Play className="w-4.5 h-4.5 text-purple-600 fill-purple-600" />
              <span>All Demo Exhibits</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK FILE UPLOAD SANDBOX */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <Cpu className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black text-slate-950 tracking-wide">
              UPLOAD CUSTOM EVIDENCE FILE
            </h2>
          </div>
          <span className="text-xs text-slate-950 font-mono font-black">Supports JPG, PNG, WEBP, MP4, PDF</span>
        </div>

        <UploadArea onFileUpload={onFileUpload} isUploading={isUploading} />
      </div>

      {/* CORE FORENSIC CAPABILITIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-emerald-400 transition group shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
            <FileImage className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">IMAGE FORENSICS</h3>
          <p className="text-xs text-slate-950 mt-1 leading-relaxed font-extrabold">
            EXIF metadata provenance + ELA error level heatmaps + synthetic model indicators.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-purple-400 transition group shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition">
            <FileVideo className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">VIDEO TIMELINE</h3>
          <p className="text-xs text-slate-950 mt-1 leading-relaxed font-extrabold">
            Frame-by-frame timestamp sampling + localized video anomaly interval detection.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-emerald-400 transition group shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
            <FileKey className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">INTEGRITY CHECK</h3>
          <p className="text-xs text-slate-950 mt-1 leading-relaxed font-extrabold">
            Cryptographic SHA-256 fingerprinting + original reference comparison match.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-amber-400 transition group shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">AUDIT PDF REPORT</h3>
          <p className="text-xs text-slate-950 mt-1 leading-relaxed font-extrabold">
            Export 15-section audit report with detailed findings & multi-signal explanation.
          </p>
        </div>
      </div>

    </div>
  );
}
