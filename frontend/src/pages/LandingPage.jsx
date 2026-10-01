import React from 'react';
import { Upload, Lock, Scale, Shield, FileText } from 'lucide-react';

export default function LandingPage({ onStartVerification, onTryDemo, onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-16">
      
      {/* Centered Clean Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          SatyaCheck — Verify <span className="text-emerald-600">Digital Evidence</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
          An explainable AI digital evidence verification platform. SatyaCheck computes tamper-evident SHA-256 cryptographic fingerprints, logs immutable audit metadata, and upholds zero-knowledge privacy by purging raw files immediately after registration.
        </p>

      </div>

      {/* 3 Core Capability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Card 1 */}
        <div className="glass-card p-7 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
            SHA-256 Fingerprinting
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Every piece of evidence is evaluated using secure cryptographic hashing to produce a permanent 256-bit tamper-evident digest.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-7 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
            Explainable Trust Score
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Computes a 100-point Trust Score from EXIF device provenance, neural AI-detection, and base cryptographic integrity.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-7 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
            Zero-Knowledge Privacy
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Raw evidence media is securely deleted from the server immediately after computing the cryptographic hash and metadata.
          </p>
        </div>

      </div>

    </div>
  );
}
