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

      <div>
        <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>FORENSIC DEMONSTRATION EXHIBITS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          SAMPLE MEDIA DEMO EXHIBITS
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Select pre-configured video and image exhibits to evaluate SatyaCheck's multi-signal analysis, explainable correlation, and PDF report generator.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <span className="ml-2 text-xs text-slate-400">Loading demo exhibits...</span>
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
                className="glass-panel p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-500/30">
                      {isVideo ? '🎥 VIDEO EXHIBIT' : '🖼️ IMAGE EXHIBIT'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {sample.expected_assessment}
                    </span>
                  </div>

                  {/* Media Preview Box */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
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

                  <h3 className="text-lg font-bold text-white">{sample.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sample.description}</p>
                </div>

                <button
                  onClick={() => handleLaunchDemo(sample)}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
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
                      <ArrowRight className="w-3.5 h-3.5" />
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
