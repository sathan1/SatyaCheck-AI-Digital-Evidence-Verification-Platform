import React, { useState } from 'react';
import { Lock, FileImage, FileVideo, FileText } from 'lucide-react';
import UploadArea from '../components/UploadArea';

export default function NewVerification({ onFileUpload, isUploading, errorMessage }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      
      {/* Quick Access Format Selector (Image, Video, Document) */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setSelectedCategory('IMAGE')}
          className={`p-4 rounded-2xl border flex items-center justify-center space-x-2 text-sm font-extrabold transition ${
            selectedCategory === 'IMAGE'
              ? 'bg-cyan-100 text-cyan-950 border-cyan-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
          }`}
        >
          <FileImage className="w-5 h-5 text-cyan-600" />
          <span>📷 Image Evidence</span>
        </button>

        <button
          onClick={() => setSelectedCategory('VIDEO')}
          className={`p-4 rounded-2xl border flex items-center justify-center space-x-2 text-sm font-extrabold transition ${
            selectedCategory === 'VIDEO'
              ? 'bg-purple-100 text-purple-950 border-purple-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
          }`}
        >
          <FileVideo className="w-5 h-5 text-purple-600" />
          <span>🎥 Video Evidence</span>
        </button>

        <button
          onClick={() => setSelectedCategory('DOC')}
          className={`p-4 rounded-2xl border flex items-center justify-center space-x-2 text-sm font-extrabold transition ${
            selectedCategory === 'DOC'
              ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
          }`}
        >
          <FileText className="w-5 h-5 text-amber-600" />
          <span>📄 PDF Document</span>
        </button>
      </div>

      {/* Centered Ingestion Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6 shadow-md text-center">
        
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Upload {selectedCategory === 'IMAGE' ? 'Image' : selectedCategory === 'VIDEO' ? 'Video' : selectedCategory === 'DOC' ? 'PDF Document' : 'Digital'} Evidence
          </h1>
          <p className="text-sm sm:text-base text-slate-900 font-extrabold mt-2">
            Submit digital evidence for cryptographic integrity hashing, EXIF metadata extraction, and AI forensic analysis
          </p>
        </div>

        {/* Upload Dropzone Widget */}
        <UploadArea onFileUpload={onFileUpload} isUploading={isUploading} errorMessage={errorMessage} />

        {/* Zero Knowledge Policy Alert Box */}
        <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-300 text-left flex items-start space-x-3.5 text-sm text-slate-950 font-extrabold shadow-sm">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-950 font-black text-sm">Zero-Knowledge Evidence Policy:</strong> Your file is processed in-memory to compute the SHA-256 hash. Raw file data is immediately purged upon evidence registration.
          </p>
        </div>

      </div>

    </div>
  );
}
