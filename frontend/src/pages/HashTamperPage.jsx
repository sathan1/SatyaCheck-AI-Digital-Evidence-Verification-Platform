import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Search, 
  Trash2, 
  Lock, 
  RefreshCw,
  Database,
  History,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function HashTamperPage({ user, onNavigate }) {
  const userEmail = user?.email || 'user@satyacheck.org';
  const isAdmin = Boolean(user?.is_admin);
  const userRole = isAdmin ? 'admin' : 'user';

  // Upload Hash state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Verification state
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Admin Audit Log states
  const [searchQuery, setSearchQuery] = useState('');
  const [fileHashes, setFileHashes] = useState([]);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [adminError, setAdminError] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('stored_hashes'); // 'stored_hashes' or 'logs'

  // Handle Hash Upload (Requirement 1)
  const handleUploadHash = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.uploadFileHash(file, userEmail);
      setUploadStatus({
        type: 'success',
        message: res.message || 'File uploaded and hash stored successfully.',
        filename: res.filename,
        uploaded_by: res.uploaded_by,
        date: res.upload_date
      });
      if (isAdmin) fetchAdminData();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to upload and store hash.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle File Verification (Requirement 2)
  const handleVerifyHash = async (file) => {
    if (!file) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyFileHash(file, userEmail);
      setVerifyResult({
        result: res.result, // "File is original" or "File is tampered"
        filename: res.filename,
        who: res.who,
        timestamp: res.timestamp,
        change_pct: res.change_pct != null ? res.change_pct : (res.result === 'File is original' ? 0 : 15.0),
        similarity_pct: res.similarity_pct != null ? res.similarity_pct : (res.result === 'File is original' ? 100 : 85.0),
        change_summary: res.change_summary || (res.result === 'File is original' ? '0% Content Modification — Document matches registered reference 100%' : 'Content modification detected compared to original reference.')
      });
      if (isAdmin) fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Fetch Admin Records (Requirement 4 & Server-side 403 enforcement Requirement 3)
  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setLoadingAdmin(true);
    setAdminError(null);
    try {
      const hashRes = await api.getFileHashes(searchQuery, userRole);
      setFileHashes(hashRes.file_hashes || []);

      const logRes = await api.getVerificationLogs(searchQuery, userRole);
      setVerificationLogs(logRes.verification_logs || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setAdminError("403 Access Denied: Admin privileges required to view database records.");
      } else {
        setAdminError("Failed to load admin records.");
      }
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, searchQuery]);

  // Handle Record Deletion (Requirement 4)
  const handleDeleteHashRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this hash record?")) return;
    try {
      await api.deleteFileHashRecord(recordId, userRole);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete record.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xs space-y-2">
        <div className="flex items-center space-x-2 font-mono text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>SHA-256 TAMPER VAULT</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">File Integrity & Hash Verification</h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl font-medium">
          Stores SHA-256 reference fingerprints on upload and verifies file originality with zero exposure of raw hashes.
        </p>
      </div>

      {/* Grid: 1. Store Hash on Upload & 2. User Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* REQUIREMENT 1: STORE HASH ON UPLOAD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-mono text-xs font-semibold uppercase tracking-wider bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-200">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>1. REGISTER ORIGINAL FILE</span>
            </div>

            <h2 className="text-base font-bold text-slate-900">Upload Reference File</h2>
            <p className="text-xs text-slate-600 font-medium">
              Calculates SHA-256 fingerprint on upload and stores reference record in secure vault.
            </p>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-emerald-300/80 rounded-xl p-5 text-center hover:border-emerald-500 bg-emerald-50/30 transition cursor-pointer relative flex flex-col items-center justify-center space-y-2">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                    handleUploadHash(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {uploading ? 'Calculating & Storing Hash...' : 'Click or Drop Reference File Here'}
                </span>
                <span className="text-[11px] text-slate-500 font-normal">Supports PDF, Image, Video, and Document Files</span>
              </div>
            </div>
          </div>

          {/* Upload Status Card */}
          {uploadStatus && (
            <div className={`p-3.5 rounded-xl border text-xs font-medium ${
              uploadStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{uploadStatus.message}</span>
              </div>
              {uploadStatus.filename && (
                <div className="mt-2 pt-2 border-t border-emerald-200/80 font-mono text-[11px] space-y-0.5 text-slate-700">
                  <div><strong>File:</strong> {uploadStatus.filename}</div>
                  <div><strong>Uploaded By:</strong> {uploadStatus.uploaded_by}</div>
                  <div><strong>Date:</strong> {uploadStatus.date}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REQUIREMENT 2: USER VERIFICATION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-cyan-800 font-mono text-xs font-semibold uppercase tracking-wider bg-cyan-50 w-fit px-3 py-1 rounded-full border border-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>2. USER FILE VERIFICATION</span>
            </div>

            <h2 className="text-base font-bold text-slate-900">Verify File Originality</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Upload file again to test for tampering. Server recalculates hash, compares with database, and logs verification.
              <strong className="text-slate-800 block mt-1 font-semibold">Shows ONLY "File is original" or "File is tampered".</strong>
            </p>

            {/* Active Vault Baseline Banner */}
            {uploadStatus?.filename && (
              <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active Vault Baseline: <span className="font-extrabold underline">{uploadStatus.filename}</span></span>
              </div>
            )}

            {/* Dropzone */}
            <div className="border-2 border-dashed border-cyan-300/80 rounded-xl p-5 text-center hover:border-cyan-500 bg-cyan-50/30 transition cursor-pointer relative flex flex-col items-center justify-center space-y-2">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVerifyFile(e.target.files[0]);
                    handleVerifyHash(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <RefreshCw className={`w-5 h-5 ${verifying ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {verifying ? 'Recalculating & Comparing Hash...' : 'Click or Drop File to Test Integrity'}
                </span>
                <span className="text-[11px] text-slate-500 font-normal block mt-0.5">Recalculates cryptographic fingerprint</span>
              </div>
              {verifyFile && (
                <div className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold shadow-xs mt-1">
                  {verifyFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Verification Result Display */}
          {verifyResult && (
            <div className={`p-6 rounded-2xl border text-center font-mono shadow-xs space-y-2.5 ${
              verifyResult.result === "File is original"
                ? 'bg-emerald-50/90 text-emerald-900 border-emerald-300'
                : 'bg-red-50/90 text-red-900 border-red-300'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">VERIFICATION RESULT</div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center space-x-2.5 my-1">
                {verifyResult.result === "File is original" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                )}
                <span className={verifyResult.result === "File is original" ? 'text-emerald-950 font-black' : 'text-red-950 font-black'}>
                  {verifyResult.result}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-sans font-medium pt-1">
                Verified: {verifyResult.filename} • {verifyResult.timestamp}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* REQUIREMENT 3 & 4: ADMIN FEATURES & SERVER-SIDE ROLE ACCESS CONTROL */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-slate-800 font-mono text-xs font-extrabold uppercase tracking-wider bg-slate-100 w-fit px-3 py-1 rounded-full border border-slate-300">
                <Database className="w-4 h-4 text-slate-700" />
                <span>4. ADMIN AUDIT & HASH MANAGEMENT</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Database Hash Table & Verification Logs</h2>
              <p className="text-xs text-slate-600">Admin-exclusive full table view with search, filter, verification logs, and record deletion.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file, user, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ADMIN DATABASE DASHBOARD (Requirement 4) */}
          <div className="space-y-4">
            
            {/* Admin Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveAdminTab('stored_hashes')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
                  activeAdminTab === 'stored_hashes'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Stored File Hashes ({fileHashes.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('logs')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
                  activeAdminTab === 'logs'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Verification Audit Logs ({verificationLogs.length})</span>
              </button>
            </div>

            {adminError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
                {adminError}
              </div>
            )}

            {/* Table 1: Stored File Hashes */}
            {activeAdminTab === 'stored_hashes' && (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">SHA-256 Hash</th>
                      <th className="px-4 py-3">Uploaded By</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px] bg-white">
                    {fileHashes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-500 font-sans text-xs">
                          No file hash records stored yet. Upload a file above to create records.
                        </td>
                      </tr>
                    ) : (
                      fileHashes.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-500">#{row.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{row.file_name}</td>
                          <td className="px-4 py-3 text-emerald-800 font-mono truncate max-w-[200px]" title={row.hash}>
                            {row.hash}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">{row.uploaded_by}</td>
                          <td className="px-4 py-3 text-slate-600">{row.upload_date}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteHashRecord(row.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table 2: Verification Logs */}
            {activeAdminTab === 'logs' && (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Log ID</th>
                      <th className="px-4 py-3">User (Who)</th>
                      <th className="px-4 py-3">File (Which File)</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px] bg-white">
                    {verificationLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-500 font-sans text-xs">
                          No verification logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      verificationLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-500">#{log.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{log.who}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{log.which_file}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              log.result === "File is original"
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{log.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
