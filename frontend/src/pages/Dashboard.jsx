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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SatyaCheck Digital Evidence Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Evidence Forensic <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>

          <p className="text-sm text-slate-600 font-medium max-w-2xl">
            Upload files or select sample media exhibits below for instant forensic verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStartVerification}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 shadow-emerald-600/20"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Verify New File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTryDemo}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-300 transition active:scale-95"
            >
              <Play className="w-4 h-4 text-purple-600 fill-purple-600" />
              <span>All Demo Exhibits</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROMINENT MEDIA SAMPLES SECTION (Images & Videos immediately visible!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                INSTANT SAMPLE MEDIA EXHIBITS
              </h2>
              <p className="text-xs text-slate-600 font-normal">
                Directly click any video or image below to analyze forensic evidence instantly.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium">
            4 Pre-Loaded Samples
          </span>
        </div>

        {loadingSamples ? (
          <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-xs text-slate-600">Loading media exhibits...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoSamples.map((sample) => {
              const isVideo = sample.type === 'video';
              const isAnalyzing = activeSampleId === sample.id || isUploading;
              const sampleMediaUrl = `/samples/${sample.sample_file}`;

              return (
                <div 
                  key={sample.id}
                  className="glass-card rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 bg-white flex flex-col justify-between transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider border ${
                        isVideo 
                          ? 'bg-purple-50 text-purple-700 border-purple-300' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}>
                        {isVideo ? '🎥 VIDEO EXHIBIT' : '🖼️ IMAGE EXHIBIT'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {sample.expected_assessment}
                      </span>
                    </div>

                    {/* Media Preview Box */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center group-hover:border-emerald-400 transition">
                      {isVideo ? (
                        <video 
                          src={sampleMediaUrl} 
                          controls 
                          muted 
                          preload="metadata"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={sampleMediaUrl} 
                          alt={sample.title} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                        {sample.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {sample.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleExecuteSample(sample)}
                    disabled={isAnalyzing}
                    className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Analyzing Exhibit...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Analyze This {isVideo ? 'Video' : 'Image'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK FILE UPLOAD SANDBOX */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <Cpu className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-wide">
              UPLOAD CUSTOM EVIDENCE FILE
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Supports JPG, PNG, WEBP, MP4, PDF</span>
        </div>

        <UploadArea onFileUpload={onFileUpload} isUploading={isUploading} />
      </div>

      {/* CORE FORENSIC CAPABILITIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-emerald-400 transition group shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
            <FileImage className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">IMAGE FORENSICS</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
            EXIF metadata provenance + ELA error level heatmaps + synthetic model indicators.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-purple-400 transition group shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition">
            <FileVideo className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">VIDEO TIMELINE</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
            Frame-by-frame timestamp sampling + localized video anomaly interval detection.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-emerald-400 transition group shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
            <FileKey className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">INTEGRITY CHECK</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
            Cryptographic SHA-256 fingerprinting + original reference comparison match.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-amber-400 transition group shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">AUDIT PDF REPORT</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
            Export 15-section audit report with detailed findings & multi-signal explanation.
          </p>
        </div>
      </div>

    </div>
  );
}
