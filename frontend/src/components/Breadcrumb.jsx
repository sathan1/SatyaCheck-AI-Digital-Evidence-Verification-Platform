import React from 'react';
import { ChevronRight, Home, LayoutDashboard, FileSearch, History, ShieldCheck, Play, Upload } from 'lucide-react';

const pathConfig = {
  landing: { title: 'Home', icon: Home },
  dashboard: { title: 'Dashboard & Media Workspace', icon: LayoutDashboard },
  verify: { title: 'New Verification', icon: Upload },
  history: { title: 'Evidence History Log', icon: History },
  tamper: { title: 'Tamper Verification', icon: FileSearch },
  demo: { title: 'Demo Media Exhibits', icon: Play },
  admin: { title: 'Admin & System Health', icon: ShieldCheck },
  detail: { title: 'Evidence Forensic Report', icon: FileSearch },
};

export default function Breadcrumb() {
  return null;
}
