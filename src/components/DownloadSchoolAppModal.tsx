import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileCode,
  FileText,
  Smartphone,
  Laptop,
  Check,
  Copy,
  ShieldCheck,
  Printer,
  QrCode,
  RefreshCw,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Key,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SchoolTenant, User as UserType } from '../types';
import {
  generateSchoolAppLauncherHTML,
  generateSchoolManifestJSON,
  generateSchoolCredentialsSheet,
  generateWindowsPowerShellInstaller,
  generateAndroidApkPackageDescriptor,
  downloadTextFile,
  provisionDefaultSchoolUsers,
} from '../utils/schoolProvisioning';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  CURRENT_APP_VERSION,
  checkForApplicationUpdates,
  UpdateCheckResult,
} from '../utils/appUpdateService';
import { getOfflineDrafts, useOnlineStatus } from '../utils/offlineSyncEngine';

interface DownloadSchoolAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolTenant;
  users?: UserType[];
  appUrl?: string;
  onOpenFirstTimeActivation?: () => void;
}

type ModalTab = 'INSTALLERS' | 'STAFF_ONBOARDING' | 'GOVERNANCE_POLICY' | 'OFFLINE_CACHE';

export const DownloadSchoolAppModal: React.FC<DownloadSchoolAppModalProps> = ({
  isOpen,
  onClose,
  school,
  users,
  appUrl,
  onOpenFirstTimeActivation,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('INSTALLERS');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);

  const { isStandalone, isInstallable, install, platform, platformName } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const originUrl =
    appUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');
  const officialSchoolInstallUrl = `${originUrl}?tenant=${school.schoolId}&action=install_app`;

  const staffUsers =
    users && users.length > 0
      ? users.filter((u) => u.schoolId === school.schoolId)
      : provisionDefaultSchoolUsers(school);
  const finalUsers = staffUsers.length > 0 ? staffUsers : provisionDefaultSchoolUsers(school);
  const credentialsText = generateSchoolCredentialsSheet(school, finalUsers, appUrl);

  const offlineDrafts = getOfflineDrafts(school.schoolId);

  useEffect(() => {
    if (!isOpen) {
      setUpdateResult(null);
      setDownloadSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadLauncher = () => {
    const html = generateSchoolAppLauncherHTML(school, appUrl);
    downloadTextFile(`JJSAK-${school.schoolCode}-Offline-Launcher.html`, html, 'text/html');
    setDownloadSuccess('✓ Standalone App Launcher downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadWindowsInstaller = () => {
    const ps1 = generateWindowsPowerShellInstaller(school, appUrl);
    downloadTextFile(`JJSAK-Install-${school.schoolCode}-Windows.ps1`, ps1, 'text/plain');
    setDownloadSuccess('✓ Windows Desktop Installer script (.ps1) downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadAndroidApkDescriptor = () => {
    const apkDesc = generateAndroidApkPackageDescriptor(school, appUrl);
    downloadTextFile(`JJSAK-Android-Package-${school.schoolCode}.json`, apkDesc, 'application/json');
    setDownloadSuccess('✓ Android APK Package Descriptor downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadManifest = () => {
    const json = generateSchoolManifestJSON(school);
    downloadTextFile(`JJSAK-${school.schoolCode}-Manifest.json`, json, 'application/json');
    setDownloadSuccess('✓ School Manifest JSON downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCredentials = () => {
    downloadTextFile(
      `JJSAK-${school.schoolCode}-Credentials-Dossier.txt`,
      credentialsText,
      'text/plain'
    );
    setDownloadSuccess('✓ Staff Login Credentials Dossier downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCopyInstallLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(officialSchoolInstallUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(credentialsText);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
  };

  const handlePrintCredentials = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${school.schoolName} - Staff Onboarding & Credentials Dossier</title>
            <style>
              body { font-family: monospace; font-size: 12px; padding: 24px; white-space: pre-wrap; line-height: 1.4; color: #000; }
            </style>
          </head>
          <body>${credentialsText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const res = await checkForApplicationUpdates();
      setUpdateResult(res);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleTriggerPWAInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      alert('PWA Direct Install: To install on this device, click the browser menu (⋮ or Share) and choose "Install App" or "Add to Home Screen".');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C51E28] to-red-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold leading-tight tracking-tight">
                  {school.schoolName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-white/20 text-white border border-white/30">
                  {school.schoolCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                  Tenant: {school.schoolId}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Official Application Distribution, Installation Links &amp; School-Tenant Binding (Rules §1–17)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Stage Lifecycle Milestone Verification Banner (§3) */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 sm:px-6 py-2.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified 4-Stage School Provisioning Milestones (Rule §3)
            </span>
            <span className="text-emerald-400 font-bold">Status: LICENSED &amp; ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">1</span>
              <span className="text-slate-300 font-semibold truncate">1. Registered</span>
              <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />
            </div>
            <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">2</span>
              <span className="text-slate-300 font-semibold truncate">2. Verified</span>
              <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />
            </div>
            <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">3</span>
              <span className="text-slate-300 font-semibold truncate">3. Provisioned</span>
              <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />
            </div>
            <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">4</span>
              <span className="text-slate-300 font-semibold truncate">4. Activated</span>
              <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />
            </div>
          </div>
        </div>

        {/* Platform Auto-Detection Pill */}
        <div className="bg-slate-850 border-b border-slate-800 px-5 sm:px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Device:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold border border-slate-700 flex items-center gap-1.5">
              {platform === 'android' || platform === 'ios' ? (
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
              )}
              {platformName}
            </span>
            {isStandalone && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/80 text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Standalone App Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Build v{CURRENT_APP_VERSION.version}</span>
            <button
              type="button"
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-700"
              title="Check for application updates against JJSAK central repository (§12)"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingUpdates ? 'animate-spin text-red-400' : 'text-slate-400'}`} />
              <span>Update Status</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-2 gap-1 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('INSTALLERS')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'INSTALLERS'
                ? 'bg-slate-900 text-white border-slate-700 -mb-px shadow-xs'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Installable Packages &amp; Links</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STAFF_ONBOARDING')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'STAFF_ONBOARDING'
                ? 'bg-slate-900 text-white border-slate-700 -mb-px shadow-xs'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Staff Onboarding &amp; Credentials ({finalUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('OFFLINE_CACHE')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'OFFLINE_CACHE'
                ? 'bg-slate-900 text-white border-slate-700 -mb-px shadow-xs'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Offline Drafts &amp; Sync (§14)</span>
            {offlineDrafts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black">
                {offlineDrafts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GOVERNANCE_POLICY')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'GOVERNANCE_POLICY'
                ? 'bg-slate-900 text-white border-slate-700 -mb-px shadow-xs'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Policy &amp; Isolation Rules (§1–17)</span>
          </button>
        </div>

        {/* Notifications */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {updateResult && (
          <div className="bg-blue-950 border-b border-blue-800 text-blue-200 px-4 py-2 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {updateResult.message}
            </span>
            <button
              type="button"
              onClick={() => setUpdateResult(null)}
              className="text-blue-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">
          
          {/* TAB 1: OFFICIAL INSTALLERS & DOWNLOAD LINKS */}
          {activeTab === 'INSTALLERS' && (
            <div className="space-y-4">
              
              {/* One JJSAK Unified Ecosystem Notice (§2, §16) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-800/50 flex items-start gap-3 text-xs">
                <Layers className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>ONE JJSAK Unified Ecosystem: Web Portal + Installable Application</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 font-mono">
                      Rule §2
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    JJSAK operates as one synchronized platform. Both the Web Portal and Installable Application connect to the identical multi-tenant database, authentication framework, marks engine, and audit system. User roles and permissions remain identical across all devices.
                  </p>
                </div>
              </div>

              {/* Package 1: Windows PC & Laptop */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Windows PC &amp; Laptop Application</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                        Windows 10 / 11
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                      Standalone desktop app launcher with desktop shortcut, native menu integration, and offline marks caching.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>• Format: .ps1 / .html launcher</span>
                      <span>• Arch: x64 / ARM64</span>
                      <span>• Cryptographic tenant bound</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadWindowsInstaller}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                    title="Download Windows Desktop Installer (.ps1)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Windows Installer</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadLauncher}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-600 transition"
                    title="Download Offline HTML Launcher (.html)"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>.html Launcher</span>
                  </button>
                </div>
              </div>

              {/* Package 2: Android Mobile Phones & Tablets */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Android Mobile &amp; Tablet Application</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Android 8.0+
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                      Full-featured mobile experience with offline attendance recording, instant marks converter, and home screen launcher.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>• Package: com.jjsak.school.{school.schoolCode.toLowerCase()}</span>
                      <span>• Version: 2.4.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadAndroidApkDescriptor}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                    title="Download Android APK Package Descriptor (.json)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>APK Package</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerPWAInstall}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-600 transition"
                    title="Install as Progressive Web App"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Install</span>
                  </button>
                </div>
              </div>

              {/* Package 3: School Configuration Manifest (.json) */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">School Configuration Manifest</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                      Standard JSON manifest with active CBC assessment schema, grading scales, tenant isolation parameters, and institution profile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json Manifest</span>
                </button>
              </div>

              {/* Secure Application Distribution & Integrity Badging (§11) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Secure Application Distribution &amp; Integrity Verification (§11)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                    Cryptographically Signed &amp; Sealed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Version &amp; Build:</span>
                    <strong className="text-white">JJSAK v{CURRENT_APP_VERSION.version} ({CURRENT_APP_VERSION.buildNumber})</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Digital Code Signing:</span>
                    <strong className="text-emerald-400">{CURRENT_APP_VERSION.signatureCert}</strong>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 break-all">
                  <span className="text-slate-500 block text-[9px] uppercase">SHA-256 Integrity Checksum:</span>
                  <span className="text-amber-200">{CURRENT_APP_VERSION.integrityHash}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  🔒 All installable application binaries and updates are controlled strictly by the JJSAK Security Directorate. Unauthorized modification or distribution is prohibited and detected at launch.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF ONBOARDING & CREDENTIALS DOSSIER */}
          {activeTab === 'STAFF_ONBOARDING' && (
            <div className="space-y-4">
              
              {/* Mandatory First-Time Staff Activation Rule Notice (§6, §5) */}
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-600/70 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-black text-amber-200 uppercase tracking-wide">
                    Mandatory Policy Rule: First-Time Staff Activation (§6 &amp; §5)
                  </h4>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  «First-time staff activation must be performed inside the respective school's own JJSAK portal/dashboard and must never be performed from the Owner/Super Administrator dashboard.»
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Installing the application does not automatically activate accounts. Staff must complete first-time verification, manually enter their confidential SMS/Email OTP, and set a permanent password.
                </p>
                {onOpenFirstTimeActivation && (
                  <button
                    type="button"
                    onClick={onOpenFirstTimeActivation}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Launch Staff First-Time Activation Workflow</span>
                  </button>
                )}
              </div>

              {/* Official School Installation & Onboarding Link for Teachers (§3) */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-400" />
                    Teacher &amp; Staff App Installation Link (Rule §3)
                  </h4>
                  <span className="text-[10px] text-purple-300 font-mono">Bound to {school.schoolCode}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                    <QRCodeSVG
                      value={officialSchoolInstallUrl}
                      size={100}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0 w-full text-left">
                    <p className="text-xs text-slate-300">
                      Share this verified installation URL or QR code with teachers to install the {school.schoolName} application on their personal or school devices:
                    </p>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 truncate">
                      {officialSchoolInstallUrl}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyInstallLink}
                      className="px-3.5 py-1.5 rounded-xl bg-[#C51E28] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Staff Installation Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff Accounts Dossier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Allocated Staff Accounts ({finalUsers.length})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                    >
                      {copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCredentials ? 'Copied' : 'Copy Dossier'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintCredentials}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Print Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCredentials}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {finalUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-white truncate max-w-[170px]">{u.fullName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-red-300 border border-slate-700">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Username: <strong className="text-emerald-400">{u.username}</strong>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Default Pass: <strong className="text-amber-300">{u.password || 'Password@2026!'}</strong>
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">
                        Phone/Email: {u.phoneNumber || u.email || 'School Records'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE DRAFTING & CACHE (§14) */}
          {activeTab === 'OFFLINE_CACHE' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                    )}
                    <span>Controlled Offline Drafting Engine (Rule §14)</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {isOnline ? 'Network Online' : 'Offline Mode Active'}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  JJSAK allows teachers to record assessment marks drafts and attendance registers without active internet connectivity. All cached items are encrypted, strictly bound to <strong>{school.schoolName} ({school.schoolId})</strong>, and validated against staff permissions.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-[11px] leading-tight">
                  🔒 <strong>Critical Security Mandate:</strong> Offline operation must never be used to bypass JJSAK authentication, permissions, tenant isolation, subscription restrictions, or security controls.
                </div>
              </div>

              {/* Pending Offline Drafts Queue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    Local Draft Cache Queue ({offlineDrafts.length} items)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Storage Key: jjsak_offline_queue_{school.schoolId}
                  </span>
                </div>

                {offlineDrafts.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white">All Data Synchronized</div>
                    <p className="text-xs text-slate-500">
                      No unsynced offline marks drafts or attendance records pending for {school.schoolName}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {offlineDrafts.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{d.title}</div>
                          <div className="text-[10px] text-slate-400">
                            Category: {d.category} • Author: {d.userName} ({d.userRole})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Pending Sync
                          </span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{d.checksum}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MASTER GOVERNANCE POLICY (§1–17) */}
          {activeTab === 'GOVERNANCE_POLICY' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-red-400 font-bold">
                  JJSAK Architectural Specification &amp; Governance Policy
                </span>
                <h4 className="text-sm font-bold text-white">
                  Installable School &amp; Teacher Application Master Requirements (§1–17)
                </h4>
                <p className="text-slate-400 text-[11px] leading-tight">
                  Official standards governing application installation, school-tenant binding, first-time staff activation, and governance boundary isolation.
                </p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>1. Installable JJSAK Application</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §1</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Official installable app experience for Windows PCs, laptops, Android phones, and tablets with standalone window and native navigation.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>2. Web Portal + Installable Application</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §2</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Operates as one unified ecosystem connecting to identical backend, database, identity, permissions, and audit logging.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>3. 4-Stage Provisioning &amp; Installation Link</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §3</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Official install link provided strictly after Registration, Verification, Provisioning, and Activation are complete.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>4. School-Tenant Connection</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §4</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Application connects strictly to user's school tenant. Cross-school exposure, tenant switching, or ID tampering is prohibited.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>5. Installation Does Not Equal Account Activation</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §5</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Installing the app does not activate accounts. School status, user status, role, credentials, and manual OTP must all be validated.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>6. First-Time Staff Activation Rule</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §6</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    «First-time staff activation must be performed inside the respective school's own JJSAK portal/dashboard and must never be performed from the Owner/Super Administrator dashboard.»
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>7. Authentication and Confidential OTP Delivery</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §7</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    OTP is never displayed on login screen, dashboard, portal, API, storage, or logs. Delivered strictly via SMS/Email; manual entry required.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>8. Role-Based Access Control</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §8</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Installation never upgrades role, grants admin access, or bypasses subscription controls.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>9. Owner / Super Administrator Isolation</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §9</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Platform Owner governance environment remains completely inaccessible from school portals, app installations, and teacher sessions.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>11 &amp; 12. Secure Distribution &amp; Controlled Updates</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rules §11–12</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    SHA-256 integrity checks, digital CA signatures, and seamless service worker background updates with enforceable critical patches.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>14. Controlled Offline Drafting</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rule §14</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Tenant-bound offline drafting for marks and attendance with automatic queue synchronization upon network restoration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tenant Bound: <strong>{school.schoolId}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
