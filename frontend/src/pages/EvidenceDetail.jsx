import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import EvidenceHeader from '../components/EvidenceHeader';
import WhyThisResult from '../components/WhyThisResult';
import EvidenceCorrelation from '../components/EvidenceCorrelation';
import IntegrityCard from '../components/IntegrityCard';
import MetadataViewer from '../components/MetadataViewer';
import SuspiciousRegionViewer from '../components/SuspiciousRegionViewer';
import VideoTimelineViewer from '../components/VideoTimelineViewer';
import CompressionResilienceCard from '../components/CompressionResilienceCard';
import QrConsistencyCard from '../components/QrConsistencyCard';
import LimitationsDisclaimer from '../components/LimitationsDisclaimer';
import ReportDownloadButton from '../components/ReportDownloadButton';

export default function EvidenceDetail({ evidenceId, onBack, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    if (!evidenceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEvidenceDetail(evidenceId);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to fetch evidence ${evidenceId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [evidenceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading Forensic Evidence #{evidenceId}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 bg-white border border-slate-200 shadow-md">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Evidence Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve analysis results for this Evidence ID.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 rounded-lg border border-slate-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { evidence, analysis, metadata, forensic, video_frames, suspicious_intervals } = data;
  const fileType = (evidence.file_type || 'image').toLowerCase();

  return (
    <div className="space-y-6 py-2">
      <Breadcrumb activeTab="detail" extraTitle={`Evidence #${evidenceId}`} onNavigate={onNavigate || (() => {})} />

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to History</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDetail}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 shadow-sm transition"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" />
          </button>
          
          <ReportDownloadButton evidenceId={evidence.evidence_id} />
        </div>
      </div>

      {/* 1. Evidence Identity & Status Header */}
      <EvidenceHeader evidence={evidence} analysis={analysis} metadata={metadata} />

      {/* 2. WHY THIS RESULT? (Explainable Synthesis) */}
      <WhyThisResult analysis={analysis} />

      {/* 3. Evidence Signal Correlation Grid */}
      <EvidenceCorrelation analysis={analysis} />

      {/* 4. File Integrity & Reference Verification Card */}
      <IntegrityCard
        evidence={evidence}
        referenceData={analysis}
        onReferenceUpdated={fetchDetail}
      />

      {/* 5. Metadata Provenance Findings */}
      <MetadataViewer metadata={metadata} />

      {/* 6. Media Specific Forensics */}

      {/* IMAGE MEDIA TYPE SPECIFIC: Suspicious Region Viewer & Compression Resilience */}
      {(fileType === 'image' || fileType === 'jpg' || fileType === 'png' || fileType === 'webp') && (
        <>
          <SuspiciousRegionViewer
            imageUrl={`/uploads/${evidence.evidence_id}_${evidence.filename}`}
            heatmapUrl={forensic?.heatmap_path}
            elaScore={forensic?.ela_score}
            aiConfidence={analysis?.ai_confidence}
          />

          <CompressionResilienceCard resilience={analysis?.resilience_json} />
        </>
      )}

      {/* VIDEO MEDIA TYPE SPECIFIC: Video Frame Timeline & Suspicious Interval */}
      {(fileType === 'video' || fileType === 'mp4' || fileType === 'mov' || fileType === 'webm') && (
        <VideoTimelineViewer
          videoFrames={video_frames}
          suspiciousIntervals={suspicious_intervals}
          evidenceId={evidence.evidence_id}
          videoUrl={evidence.storage_path ? `/uploads/${evidence.evidence_id}_${evidence.filename}` : '/samples/sample_video.mp4'}
        />
      )}

      {/* PDF MEDIA TYPE SPECIFIC DETAILS */}
      {(fileType === 'pdf' || fileType === 'document') && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-md space-y-3">
          <h3 className="text-base font-bold text-slate-900">PDF DOCUMENT SPECIFICATIONS</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Producer / Software:</strong> {metadata?.software || 'PyMuPDF Service'}</p>
            <p><strong>Digital Signature Check:</strong> {analysis?.resilience_json?.pdf_details?.signature_status || 'No digital signature structure detected.'}</p>
            {analysis?.resilience_json?.pdf_details?.text_sample && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                <strong>Text Extract Preview:</strong>
                <p className="mt-1">{analysis.resilience_json.pdf_details.text_sample}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR vs Visible Content Consistency Card */}
      <QrConsistencyCard qrData={forensic?.raw_json?.qr_check || analysis?.resilience_json?.pdf_details?.qr_check} />

      {/* 7. Limitations & Investigative Disclaimer */}
      <LimitationsDisclaimer />

      {/* Bottom Report Action Footer */}
      <div className="flex justify-center pt-4">
        <ReportDownloadButton evidenceId={evidence.evidence_id} />
      </div>
    </div>
  );
}

