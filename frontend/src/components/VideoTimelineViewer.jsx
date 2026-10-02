import React, { useState, useRef } from 'react';
import { Film, Play, Pause, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle2, Eye, Layers, ShieldAlert, Sparkles, ArrowRight, RotateCcw, Volume2, Scissors } from 'lucide-react';

export default function VideoTimelineViewer({ videoFrames = [], suspiciousIntervals = [], evidenceId, videoUrl }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiOnlyPlayback, setAiOnlyPlayback] = useState(false);
  const [clipLooping, setClipLooping] = useState(true);
  const videoRef = useRef(null);

  if (!videoFrames || videoFrames.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Film className="w-5 h-5 text-purple-600" />
          <span>VIDEO FRAME TIMELINE</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2">No frame sampling data available for this video exhibit.</p>
      </div>
    );
  }

  const getTimestampStr = (f) => {
    if (!f) return '00:00';
    if (f.timestamp_str) return f.timestamp_str;
    const sec = f.timestamp_sec || 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const selectedFrame = videoFrames[selectedIndex] || videoFrames[0];
  const selectedTs = getTimestampStr(selectedFrame);
  const selectedPct = Math.round((selectedFrame.confidence || 0.15) * 100);

  const suspiciousFrames = videoFrames.filter(
    f => f.ai_indicator === 'Elevated' || f.ai_indicator === 'High' || (f.confidence || 0) >= 0.70
  );

  const normalFrames = videoFrames.filter(
    f => !(f.ai_indicator === 'Elevated' || f.ai_indicator === 'High' || (f.confidence || 0) >= 0.70)
  );

  const isMergedVideo = suspiciousFrames.length > 0 && normalFrames.length > 0;
  
  const firstAiFrame = suspiciousFrames.length > 0 ? suspiciousFrames[0] : null;
  const lastAiFrame = suspiciousFrames.length > 0 ? suspiciousFrames[suspiciousFrames.length - 1] : null;

  const firstAiTs = firstAiFrame ? getTimestampStr(firstAiFrame) : null;
  const lastAiTs = lastAiFrame ? getTimestampStr(lastAiFrame) : null;

  const firstAiSec = firstAiFrame ? (firstAiFrame.timestamp_sec || 0) : 0;
  const lastAiSec = lastAiFrame ? ((lastAiFrame.timestamp_sec || 0) + 1.0) : (firstAiSec + 5.0);

  const firstAiPct = firstAiFrame ? Math.round((firstAiFrame.confidence || 0.85) * 100) : 0;
  const prevAuthenticTs = firstAiFrame && firstAiFrame.frame_num > 1 
    ? getTimestampStr(videoFrames[firstAiFrame.frame_num - 2]) 
    : '00:00';

  const defaultVideoSrc = videoUrl || `/uploads/${evidenceId}_video.mp4`;

  const playAiOnlySegment = () => {
    if (!firstAiFrame) return;
    setAiOnlyPlayback(true);
    
    const idx = videoFrames.findIndex(f => f.frame_num === firstAiFrame.frame_num);
    if (idx !== -1) setSelectedIndex(idx);

    if (videoRef.current) {
      videoRef.current.currentTime = firstAiSec;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Autoplay note:", err));
    }
  };

  const playFullVideo = () => {
    setAiOnlyPlayback(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentSec = videoRef.current.currentTime;

    if (aiOnlyPlayback && firstAiFrame) {
      if (currentSec >= lastAiSec) {
        if (clipLooping) {
          videoRef.current.currentTime = firstAiSec;
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }

    let closestIdx = 0;
    let minDiff = 9999;
    videoFrames.forEach((f, idx) => {
      const diff = Math.abs((f.timestamp_sec || 0) - currentSec);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setSelectedIndex(closestIdx);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-6 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Film className="w-5 h-5 text-purple-600" />
              <span>AI VIDEO CLIP PLAYER & MERGED SEGMENT ANALYSIS</span>
            </h2>
            {isMergedVideo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-50 text-purple-800 border border-purple-200 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>MERGED VIDEO DETECTED (Original + AI)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-950 font-extrabold mt-0.5">
            Play ONLY the AI Generated Deepfake video segment isolated from authentic frames
          </p>
        </div>

        {firstAiFrame && (
          <div className="flex items-center space-x-2">
            <button
              onClick={playAiOnlySegment}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition shadow-md ${
                aiOnlyPlayback
                  ? 'bg-red-600 text-white border border-red-500 shadow-red-600/30'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <Scissors className="w-4 h-4 text-red-600" />
              <span>Play ONLY AI Clip ({firstAiTs} → {lastAiTs})</span>
            </button>
          </div>
        )}
      </div>

      {/* Prominent AI Video Start & Dedicated AI Clip Playback Banner */}
      {firstAiFrame && (
        <div className={`border rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
          aiOnlyPlayback 
            ? 'bg-red-50 border-red-300 text-red-950' 
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-7 h-7 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase font-mono tracking-widest text-red-700 font-extrabold flex items-center space-x-2">
                <span>🚨 ISOLATED AI DEEPFAKE VIDEO SEGMENT</span>
                {aiOnlyPlayback && (
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">
                    AI ONLY CLIP ACTIVE
                  </span>
                )}
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                AI Video Clip Range: <span className="text-emerald-700 font-mono underline decoration-emerald-500 underline-offset-4">{firstAiTs} → {lastAiTs}</span> (Frames #{firstAiFrame.frame_num} → #{lastAiFrame.frame_num})
              </div>
              <p className="text-xs text-slate-950 leading-relaxed font-extrabold">
                Authentic Video segment ended at <span className="text-emerald-800 font-mono font-black">{prevAuthenticTs}</span>. AI deepfake insertion starts at timestamp <span className="text-emerald-800 font-mono font-black">{firstAiTs}</span> ({firstAiPct}% AI score).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-stretch md:self-center">
            <button
              onClick={playAiOnlySegment}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 border border-red-400 flex-shrink-0"
            >
              <Scissors className="w-4 h-4 fill-white" />
              <span>PLAY ONLY AI CLIP</span>
            </button>

            <button
              onClick={playFullVideo}
              className="px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition flex items-center justify-center space-x-1.5 flex-shrink-0 shadow-sm"
            >
              <Film className="w-4 h-4 text-emerald-600" />
              <span>Play Full Video</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Video Player & Selected Frame Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 items-start shadow-sm">
        
        {/* Left Column: Interactive HTML5 Video Player */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Film className="w-4 h-4 text-emerald-600" />
              <span>{aiOnlyPlayback ? '🛑 Playing ONLY AI Deepfake Clip' : '🎬 Playing Full Merged Video'}</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {aiOnlyPlayback ? `AI Clip: ${firstAiTs} → ${lastAiTs}` : 'Full Video Mode'}
            </span>
          </div>

          <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-300 aspect-video flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              src={defaultVideoSrc}
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />

            {aiOnlyPlayback && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-600 text-white border border-red-500 rounded-lg text-xs font-bold font-mono flex items-center space-x-2 backdrop-blur-md shadow-md animate-pulse">
                <Scissors className="w-4 h-4 text-white" />
                <span>ONLY AI CLIP MODE ACTIVE ({firstAiTs} → {lastAiTs})</span>
              </div>
            )}
          </div>

          {/* Player Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayPause}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setClipLooping(!clipLooping)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  clipLooping ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold' : 'bg-white text-slate-700 border-slate-300'
                }`}
                title="Loop AI Clip when reaching end"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                <span>{clipLooping ? 'Auto-Loop Clip: ON' : 'Auto-Loop: OFF'}</span>
              </button>
            </div>

            {firstAiFrame && (
              <button
                onClick={playAiOnlySegment}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
              >
                <Scissors className="w-3.5 h-3.5 fill-white" />
                <span>Play ONLY AI Clip</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Selected Sampled Frame Inspector */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
            <div>
              <div className="text-[10px] text-emerald-700 uppercase font-mono tracking-widest font-extrabold">SAMPLED FRAME INSPECTOR</div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Frame #{selectedFrame.frame_num} <span className="text-slate-500 text-sm">({selectedTs})</span>
              </h3>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">AI CONFIDENCE SCORE</div>
              <div className={`text-2xl font-extrabold ${selectedPct >= 70 ? 'text-red-600' : 'text-emerald-600'}`}>
                {selectedPct}%
              </div>
            </div>
          </div>

          {/* Sampled Frame Image */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-300 aspect-video flex items-center justify-center shadow-sm">
            {(selectedFrame.frame_url || selectedFrame.frame_path) ? (
              <img
                src={selectedFrame.frame_url || selectedFrame.frame_path}
                alt={`Frame ${selectedFrame.frame_num}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400">Frame image unavailable</div>
            )}
            
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/90 rounded text-[11px] font-mono text-emerald-400 border border-slate-700 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Timestamp: {selectedTs}</span>
            </div>
          </div>

          {/* Selected Frame Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-bold">Classification Label:</span>
              <span className={`font-bold uppercase ${selectedPct >= 70 ? 'text-red-600' : 'text-emerald-700'}`}>
                {selectedPct >= 70 ? 'AI GENERATED (SYNTHETIC)' : 'NORMAL (AUTHENTIC)'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-bold">AI Model Score:</span>
              <span className="font-mono text-slate-900 font-extrabold">{selectedPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Merged Video Segment Classification Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Normal Authentic Segment Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AUTHENTIC / NORMAL VIDEO SEGMENTS</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {normalFrames.length} Frames ({Math.round((normalFrames.length / videoFrames.length) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-950 leading-relaxed font-extrabold">
            Contains natural camera noise variance & consistent temporal lighting. Low AI score indicators.
          </p>
        </div>

        {/* AI Generated Deepfake Segment Box */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>AI GENERATED DEEPFAKE SEGMENTS</span>
            </span>
            <span className="text-xs font-mono font-bold text-red-800">
              {suspiciousFrames.length} Frames ({Math.round((suspiciousFrames.length / videoFrames.length) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-950 leading-relaxed font-extrabold">
            Frame analysis detected artificial smoothness & elevated synthetic model indicators (≥70% AI Confidence).
          </p>
        </div>
      </div>

      {/* Visual Timeline Grid Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] text-slate-600 font-mono font-bold">
          <span>00:00</span>
          <span className="text-slate-800 font-bold">Frame Sequence ({videoFrames.length} Frames Sampled)</span>
          <span>{getTimestampStr(videoFrames[videoFrames.length - 1])}</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          {videoFrames.map((frame, idx) => {
            const isSus = frame.ai_indicator === 'Elevated' || frame.ai_indicator === 'High' || (frame.confidence || 0) >= 0.70;
            const isSelected = idx === selectedIndex;
            const isFirstAi = firstAiFrame && frame.frame_num === firstAiFrame.frame_num;
            const tsStr = getTimestampStr(frame);
            const framePct = Math.round((frame.confidence || 0.15) * 100);

            return (
              <button
                key={idx}
                onClick={() => {
                  setAiOnlyPlayback(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = frame.timestamp_sec || 0;
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(e=>e);
                  }
                }}
                className={`h-11 rounded-xl flex flex-col items-center justify-center transition relative ${
                  isSelected ? 'ring-2 ring-emerald-500 bg-white scale-105 z-10 shadow-md' : ''
                } ${
                  isFirstAi ? 'ring-2 ring-amber-500 bg-red-100' : ''
                } ${
                  isSus ? 'bg-red-50 border border-red-300 hover:bg-red-100' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                }`}
                title={`Click to play video from Frame #${frame.frame_num} (${tsStr}) - ${isSus ? 'AI GENERATED' : 'NORMAL'} (${framePct}%)`}
              >
                {isFirstAi && (
                  <span className="absolute -top-2 bg-amber-400 text-slate-950 font-bold text-[8px] font-mono px-1 rounded shadow">
                    AI START
                  </span>
                )}
                <div className={`w-2 h-2 rounded-full ${isSus ? 'bg-red-600 animate-ping' : 'bg-emerald-600'}`} />
                <span className="text-[9px] font-mono text-slate-800 font-extrabold mt-1">{tsStr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Per-Frame Classification Audit Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>PER-FRAME CLASSIFICATION & PERCENTAGE AUDIT TABLE ({videoFrames.length} Frames)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Click 'Play ONLY AI Clip' to restrict playback to deepfake frames
          </span>
        </div>

        <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Frame #</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">AI Score (%)</th>
                <th className="py-2.5 px-4 text-right">Playback Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
              {videoFrames.map((f, idx) => {
                const fTs = getTimestampStr(f);
                const fPct = Math.round((f.confidence || 0.15) * 100);
                const isSus = fPct >= 70;
                const isSelected = idx === selectedIndex;
                const isFirstAi = firstAiFrame && f.frame_num === firstAiFrame.frame_num;

                return (
                  <tr
                    key={f.frame_num}
                    onClick={() => {
                      setAiOnlyPlayback(false);
                      if (videoRef.current) {
                        videoRef.current.currentTime = f.timestamp_sec || 0;
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(e=>e);
                      }
                    }}
                    className={`cursor-pointer transition ${isSelected ? 'bg-emerald-50 text-slate-900 font-bold' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-2.5 px-4 text-emerald-700 font-mono font-bold flex items-center space-x-1.5">
                      <span>Frame #{f.frame_num}</span>
                      {isFirstAi && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase">
                          AI Start
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-mono">{fTs}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSus ? 'bg-red-50 text-red-800 border border-red-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isSus ? 'AI GENERATED' : 'NORMAL (AUTHENTIC)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold font-mono">
                      <span className={isSus ? 'text-red-600' : 'text-emerald-700'}>{fPct}%</span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSus) {
                            playAiOnlySegment();
                          } else {
                            setAiOnlyPlayback(false);
                            if (videoRef.current) {
                              videoRef.current.currentTime = f.timestamp_sec || 0;
                              videoRef.current.play().then(() => setIsPlaying(true)).catch(e=>e);
                            }
                          }
                        }}
                        className={`px-3 py-1 rounded text-[11px] font-bold shadow-sm flex items-center space-x-1 ml-auto ${
                          isSus ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isSus ? <Scissors className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
                        <span>{isSus ? 'Play ONLY AI Clip' : `Play (${fTs})`}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

