import React, { useState } from 'react';
import { FileText, Download, Loader2, Check } from 'lucide-react';
import { api } from '../services/api';

export default function ReportDownloadButton({ evidenceId }) {
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleDownload = async () => {
    if (!evidenceId) return;
    setGenerating(true);
    try {
      await api.generateReport(evidenceId);
      const url = api.getReportDownloadUrl(evidenceId);
      
      // Trigger browser file download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satya_report_${evidenceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setCompleted(true);
      setTimeout(() => setCompleted(false), 3000);
    } catch (err) {
      alert("Failed to generate forensic report PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 transition active:scale-95"
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Generating PDF Report...</span>
        </>
      ) : completed ? (
        <>
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Report Downloaded</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 text-cyan-200" />
          <span>Generate Forensic PDF Report</span>
        </>
      )}
    </button>
  );
}
