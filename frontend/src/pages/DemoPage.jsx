import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';

export default function DemoPage({ onViewDetail, onRunDemoPreset, onNavigate }) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    async function loadSamples() {
      try {
        const res = await api.getDemoSamples();
        setSamples(res.demo_samples || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSamples();
  }, []);

  const handleLaunchDemo = async (sample) => {
    setActivePreset(sample.id);
    if (onRunDemoPreset) {
      await onRunDemoPreset(sample);
    }
    setActivePreset(null);
  };

  return (
    <div className="space-y-6 py-2">
      
      <Breadcrumb activeTab="demo" onNavigate={onNavigate || (() => {})} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-300 p-6 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-purple-900 font-mono text-xs font-black uppercase tracking-widest bg-purple-100 border border-purple-300 px-3 py-1 rounded-full w-fit">
          <Sparkles className="w-4 h-4 text-purple-700" />
          <span>FORENSIC DEMONSTRATION EXHIBITS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          SAMPLE MEDIA DEMO EXHIBITS
        </h1>
        <p className="text-sm sm:text-base text-slate-950 font-extrabold max-w-3xl">
          Select pre-configured video and image exhibits to evaluate SatyaCheck's multi-signal analysis, explainable correlation, and PDF report generator.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm font-bold text-slate-900">Loading demo exhibits...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {samples.map((sample) => {
            const isProcessing = activePreset === sample.id;
            const isVideo = sample.type === 'video';
            const sampleMediaUrl = `/samples/${sample.sample_file}`;

            return (
              <div
                key={sample.id}
                className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-purple-400 bg-white shadow-md space-y-4 flex flex-col justify-between transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
                      {isVideo ? '🎥 VIDEO EXHIBIT' : '🖼️ IMAGE EXHIBIT'}
                    </span>
                    <span className="text-xs font-mono text-slate-950 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded font-black">
                      {sample.expected_assessment}
                    </span>
                  </div>

                  {/* Media Preview Box */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
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

                  <h3 className="text-xl font-black text-slate-950">{sample.title}</h3>
                  <p className="text-sm text-slate-950 font-extrabold leading-relaxed">{sample.description}</p>
                </div>

                <button
                  onClick={() => handleLaunchDemo(sample)}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Demo Exhibit...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Run Demo Scenario</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
