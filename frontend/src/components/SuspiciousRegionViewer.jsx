import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';

export default function SuspiciousRegionViewer({ imageUrl, heatmapUrl, elaScore, aiConfidence = 0 }) {
  const isAiSuspect = aiConfidence >= 0.50;
  const [showOverlay, setShowOverlay] = useState(isAiSuspect);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setShowOverlay(aiConfidence >= 0.50);
  }, [aiConfidence, imageUrl]);

  if (!imageUrl) return null;

  const activeUrl = (showOverlay && heatmapUrl) ? heatmapUrl : imageUrl;
  const hasHeatmap = Boolean(heatmapUrl);
  const confidencePct = Math.round(aiConfidence * 100);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoomLevel(1);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>SPATIAL FORENSICS & REGION INSPECTION</span>
            </h2>
            {confidencePct > 0 && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                confidencePct >= 50
                  ? 'bg-red-50 text-red-800 border-red-300 shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
              }`}>
                {confidencePct}% AI Score
              </span>
            )}
          </div>
          <p className="text-xs text-slate-900 font-extrabold mt-1">
            {isAiSuspect
              ? 'Model-indicated spatial anomaly heatmap overlay active for AI-generated / tampered image.'
              : 'Authentic camera image detected — displaying original unedited photo pixels by default.'}
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center space-x-2">
          {hasHeatmap && (
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                showOverlay
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
            >
              {showOverlay ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>{showOverlay ? 'Heatmap Overlay: ON' : 'Show Original Photo'}</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 border border-slate-300">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-emerald-800">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Display Box */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[300px] max-h-[500px] flex items-center justify-center border border-slate-300 p-4 shadow-inner">
        <div
          className="transition-transform duration-200 origin-center max-w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={activeUrl}
            alt="Evidence Forensic Region"
            className="max-h-[420px] w-auto object-contain rounded-lg shadow-2xl"
          />
        </div>

        {!hasHeatmap && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Region localization unavailable</h4>
              <p className="text-xs text-slate-300 font-medium">
                Spatial heatmap generation requires multi-scale pixel anomaly models. Displaying standard image preview.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Region Detection Summary & Heatmap Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-900 font-black">Model AI Score:</span>
          </div>
          <span className={`font-mono font-black text-sm sm:text-base ${isAiSuspect ? 'text-red-600' : 'text-emerald-800'}`}>
            {confidencePct}% Confidence ({isAiSuspect ? 'AI / Tampered' : 'Authentic Original'})
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 flex items-center justify-between shadow-xs">
          <span className="text-slate-900 font-black">ELA Anomaly Score:</span>
          <span className="font-mono font-black text-sm text-emerald-800">{elaScore || 0.0}</span>
        </div>
      </div>

      {/* Status Notice & Heatmap Legend */}
      {hasHeatmap && showOverlay ? (
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 shadow-xs">
          <div className="flex items-center space-x-4">
            <span className="text-slate-950 font-black">Heatmap Region Legend:</span>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm" />
              <span className="text-slate-950 font-black">Natural Pixel Uniformity</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-slate-950 font-black">Uncertain</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse shadow-sm" />
              <span className="text-slate-950 font-black">Indicated Anomaly Region</span>
            </div>
          </div>
          <span className="text-xs text-emerald-900 font-mono font-black">
            AI Heatmap Mode Active
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-300 flex items-center space-x-3 text-xs shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-slate-900 font-semibold">
            <strong className="text-slate-950 font-black">Authentic Original Photo View: </strong>
            Displaying natural, untouched source photo. Heatmap filter overlay is hidden by default for authentic images to avoid visual distortion.
          </div>
        </div>
      )}
    </div>
  );
}

