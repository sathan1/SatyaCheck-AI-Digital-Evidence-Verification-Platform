import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, FileVideo, FileText, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function UploadArea({ onFileUpload, isUploading, errorMessage }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [forceAiMode, setForceAiMode] = useState(true);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    if (onFileUpload) {
      onFileUpload(file, forceAiMode);
    }
  };

  return (
    <div className="w-full space-y-3">
      
      {/* Sleek Minimal AI Sensitivity Toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="font-semibold text-slate-800">AI Deepfake Sensitivity:</span>
          <span className="text-emerald-800 font-mono font-semibold text-xs px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">HIGH</span>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={forceAiMode}
            onChange={(e) => setForceAiMode(e.target.checked)}
            className="w-3.5 h-3.5 accent-emerald-600 rounded border-slate-300 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-800">Enabled</span>
        </label>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 shadow-xs ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.pdf"
          onChange={handleFileChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-emerald-600 animate-spin flex items-center justify-center" />
              <ShieldCheck className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Analyzing Evidence File...</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">Computing SHA-256 hash & AI indicators</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Drop Digital Evidence File Here
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                or <span className="text-emerald-700 font-semibold underline underline-offset-4">browse files</span> to upload
              </p>
            </div>

            {/* Clean format pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 border border-slate-200 font-medium">
                <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image (JPG, PNG)</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 border border-slate-200 font-medium">
                <FileVideo className="w-3.5 h-3.5 text-purple-600" />
                <span>Video (MP4, MOV)</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 border border-slate-200 font-medium">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Document (PDF)</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Max file size: <strong className="text-slate-700 font-semibold">20 MB</strong>
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}


