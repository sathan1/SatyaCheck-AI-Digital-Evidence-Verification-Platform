import React from 'react';
import { Camera, Calendar, HardDrive, MapPin, Sliders, AlertCircle } from 'lucide-react';

export default function MetadataViewer({ metadata }) {
  if (!metadata) return null;

  const hasMeta = metadata.has_metadata || Boolean(metadata.camera_make || metadata.camera_model || metadata.software);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">METADATA & PROVENANCE FINDINGS</h2>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${hasMeta ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm' : 'bg-slate-100 text-slate-900 border-slate-300 font-black'}`}>
          {hasMeta ? 'EXIF Header Present' : 'Metadata Stripped'}
        </span>
      </div>

      {!hasMeta ? (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start space-x-3 text-xs text-amber-950 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-slate-950 text-sm">No provenance metadata available</div>
            <p className="text-slate-950 mt-1 leading-relaxed font-extrabold">
              Standard EXIF camera hardware tags were not detected. Social media platforms (WhatsApp, Twitter/X, Telegram) routinely strip metadata during compression. <strong className="text-emerald-900 font-black">Lack of EXIF metadata does not independently indicate AI generation.</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-emerald-400 transition">
            <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Camera Hardware</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1">
              {metadata.camera_make || 'Generic'} {metadata.camera_model || 'Sensor'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-emerald-400 transition">
            <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Software Tag</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1 truncate">
              {metadata.software || 'Camera Firmware'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-emerald-400 transition">
            <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Capture Timestamp</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1">
              {metadata.date_taken || 'Unspecified'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-emerald-400 transition">
            <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold flex items-center space-x-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dimensions & Format</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1">
              {metadata.dimensions || '1280x720'} ({metadata.format || 'JPEG'})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

