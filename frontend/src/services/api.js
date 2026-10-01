import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const serverBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${serverBase}${path.startsWith('/') ? path : '/' + path}`;
};

export const api = {
  // Upload & Analyze
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/evidence/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async analyzeEvidence(evidenceId, isDemo = false, preset = null) {
    let url = `${API_BASE}/analyze/auto/${evidenceId}`;
    const params = [];
    if (isDemo) params.push('demo=true');
    if (preset) params.push(`preset=${preset}`);
    if (params.length) url += `?${params.join('&')}`;

    const res = await axios.post(url);
    return res.data;
  },

  async getEvidenceDetail(evidenceId) {
    const res = await axios.get(`${API_BASE}/evidence/${evidenceId}`);
    return res.data;
  },

  async getHistory(search = '', type = '') {
    const res = await axios.get(`${API_BASE}/evidence/history?search=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}`);
    return res.data;
  },

  // Reference & Tamper Check
  async registerReference(evidenceId, originalSha256, referenceFilename) {
    const res = await axios.post(`${API_BASE}/reference/register`, {
      evidence_id: evidenceId,
      original_sha256: originalSha256,
      reference_filename: referenceFilename
    });
    return res.data;
  },

  async verifyReference(evidenceId) {
    const res = await axios.post(`${API_BASE}/reference/verify`, { evidence_id: evidenceId });
    return res.data;
  },

  async verifyQrTamper(evidenceId) {
    const res = await axios.post(`${API_BASE}/reference/qr_tamper_check`, { evidence_id: evidenceId });
    return res.data;
  },

  async getDemoComparison(type = 'certificate_tampered') {
    const res = await axios.get(`${API_BASE}/reference/demo_comparison?type=${encodeURIComponent(type)}`);
    return res.data;
  },

  // Reports
  async generateReport(evidenceId) {
    const res = await axios.post(`${API_BASE}/report/${evidenceId}/generate`);
    return res.data;
  },

  getReportDownloadUrl(evidenceId) {
    return `${API_BASE}/report/${evidenceId}`;
  },

  // Demo Suite
  async getDemoSamples() {
    const res = await axios.get(`${API_BASE}/demo/samples`);
    return res.data;
  },

  // Admin Stats
  async getAdminStats() {
    const res = await axios.get(`${API_BASE}/admin/statistics`);
    return res.data;
  },

  // Auth
  async login(email, password) {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return res.data;
  },

  async register(email, password) {
    const res = await axios.post(`${API_BASE}/auth/register`, { email, password });
    return res.data;
  },

  // Dedicated SHA-256 Hash Tamper Storage & Verification APIs
  async uploadFileHash(file, userEmail = 'user@satyacheck.org') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaded_by', userEmail);
    const res = await axios.post(`${API_BASE}/reference/upload_hash`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-User-Email': userEmail
      }
    });
    return res.data;
  },

  async verifyFileHash(file, userEmail = 'user@satyacheck.org') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaded_by', userEmail);
    const res = await axios.post(`${API_BASE}/reference/verify_hash`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-User-Email': userEmail
      }
    });
    return res.data;
  },

  async getFileHashes(search = '', role = 'admin') {
    const res = await axios.get(`${API_BASE}/admin/file_hashes?search=${encodeURIComponent(search)}`, {
      headers: { 'X-User-Role': role }
    });
    return res.data;
  },

  async getVerificationLogs(search = '', role = 'admin') {
    const res = await axios.get(`${API_BASE}/admin/verification_logs?search=${encodeURIComponent(search)}`, {
      headers: { 'X-User-Role': role }
    });
    return res.data;
  },

  async deleteFileHashRecord(recordId, role = 'admin') {
    const res = await axios.delete(`${API_BASE}/admin/file_hashes/${recordId}`, {
      headers: { 'X-User-Role': role }
    });
    return res.data;
  }
};
