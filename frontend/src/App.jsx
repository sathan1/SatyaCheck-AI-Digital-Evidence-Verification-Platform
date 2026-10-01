import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import NewVerification from './pages/NewVerification';
import EvidenceDetail from './pages/EvidenceDetail';
import EvidenceHistory from './pages/EvidenceHistory';
import TamperCheckPage from './pages/TamperCheckPage';
import HashTamperPage from './pages/HashTamperPage';
import DemoPage from './pages/DemoPage';
import AdminDashboard from './pages/AdminDashboard';
import { api } from './services/api';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // Step 1: Starts at Index Page!
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [user, setUser] = useState(null); // Unauthenticated by default

  // Handles File Upload and immediate analysis execution
  const handleFileUpload = async (file) => {
    // If not logged in, prompt user to login first
    if (!user) {
      setActiveTab('login');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      // 1. Upload & fingerprint file
      const uploadRes = await api.uploadFile(file);
      const evId = uploadRes.evidence_id;

      // 2. Determine preset based on file type & filename
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
      const preset = isVideo ? 'video' : null;

      // Trigger automated multi-signal AI analysis pipeline
      await api.analyzeEvidence(evId, true, preset);

      // 3. Switch view to detailed evidence report
      setSelectedEvidenceId(evId);
      setActiveTab('detail');
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload and analyze evidence file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handles Demo Preset execution
  const handleRunDemoPreset = async (demoSample) => {
    try {
      const fileUrl = `/samples/${demoSample.sample_file}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], demoSample.sample_file, { type: blob.type || 'image/jpeg' });

      const uploadRes = await api.uploadFile(file);
      const evId = uploadRes.evidence_id;

      await api.analyzeEvidence(evId, true, demoSample.demo_preset);

      setSelectedEvidenceId(evId);
      setActiveTab('detail');
    } catch (err) {
      console.error("Demo run error:", err);
      alert("Failed to run demo scenario.");
    }
  };

  const handleViewDetail = (evidenceId) => {
    setSelectedEvidenceId(evidenceId);
    setActiveTab('detail');
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    setActiveTab('dashboard'); // Step 4: Successful Login/Register unlocks and navigates to Dashboard!
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('landing'); // Reset to Index Page on logout
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white relative overflow-x-hidden bg-grid-pattern">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      
      {/* Left Sidebar Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          // If trying to access protected workspace tab without logging in, redirect to login
          if (!user && ['dashboard', 'verify', 'history', 'tamper', 'hash_verify', 'admin'].includes(tab)) {
            setActiveTab('login');
          } else if (tab === 'admin' && !user?.is_admin) {
            alert('Access Denied: Admin privileges required.');
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
        onTryDemo={() => setActiveTab('demo')}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area Right */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Step 1: Index / Home Landing Page */}
          {activeTab === 'landing' && (
            <LandingPage
              onStartVerification={() => setActiveTab(user ? 'verify' : 'login')}
              onTryDemo={() => setActiveTab('demo')}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Step 2: Dedicated Login Page */}
          {activeTab === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Step 3: Dedicated Register Page */}
          {activeTab === 'register' && (
            <RegisterPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Step 4: Dashboard Workspace (Unlocked after authentication) */}
          {activeTab === 'dashboard' && (
            <Dashboard
              onStartVerification={() => setActiveTab('verify')}
              onTryDemo={() => setActiveTab('demo')}
              onFileUpload={handleFileUpload}
              onRunDemoPreset={handleRunDemoPreset}
              isUploading={isUploading}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'verify' && (
            <NewVerification
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              errorMessage={uploadError}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'detail' && (
            <EvidenceDetail
              evidenceId={selectedEvidenceId}
              onBack={() => setActiveTab('history')}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'history' && (
            <EvidenceHistory
              onViewDetail={handleViewDetail}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'tamper' && (
            <TamperCheckPage
              onViewDetail={handleViewDetail}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'hash_verify' && (
            <HashTamperPage
              user={user}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'demo' && (
            <DemoPage
              onViewDetail={handleViewDetail}
              onRunDemoPreset={handleRunDemoPreset}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              user={user}
              onViewDetail={handleViewDetail}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/95 py-5 text-center text-xs text-slate-600 space-y-1 relative z-10 shadow-sm">
          <div className="flex items-center justify-center space-x-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SATYACHECK — Digital Evidence Verification Platform</span>
          </div>
          <p className="text-[11px] max-w-xl mx-auto px-4 text-slate-500 font-medium">
            Cryptographic SHA-256 fingerprinting, EXIF provenance analysis & AI forensic tamper detection.
          </p>
        </footer>
      </div>

    </div>
  );
}
