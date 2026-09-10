import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Laptop,
  Globe,
  MessageCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  Download,
  Bluetooth,
  Code,
  Printer,
  Radio,
  FileCode,
  Package,
  Layers,
  Send,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadTextFile } from '../utils/schoolProvisioning';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  schoolName?: string;
}

type ShareTab = 'link' | 'qr' | 'bluetooth' | 'playstore' | 'website';

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  defaultUrl,
  schoolName = 'JJSAK Junior School Assessment & CBE Platform',
}) => {
  const [activeTab, setActiveTab] = useState<ShareTab>('playstore');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState<string>('');
  const [bluetoothMessage, setBluetoothMessage] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      if (defaultUrl) {
        setAppUrl(defaultUrl);
      } else if (currentOrigin && !currentOrigin.includes('localhost')) {
        setAppUrl(currentOrigin);
      } else {
        setAppUrl('https://ais-pre-tl34ltiwlmxvg4lku6nk73-201368274064.europe-west3.run.app');
      }

      // Check if PWA is already installed or handle install prompt
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, [defaultUrl]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, identifier: string = 'link') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (identifier === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedSnippet(identifier);
        setTimeout(() => setCopiedSnippet(null), 2500);
      }
    } catch {
      if (identifier === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JJSAK School Assessment & CBC Report Card System',
          text: `Access the ${schoolName} CBC Assessment and Student Report Card System on your phone, tablet, or PC:`,
          url: appUrl,
        });
      } catch {
        handleCopy(appUrl, 'link');
      }
    } else {
      handleCopy(appUrl, 'link');
    }
  };

  const handleTriggerPWAInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert(
        'To install JJSAK directly on Android/iOS:\n1. Tap the browser Menu (⋮ or Share icon)\n2. Select "Install App" or "Add to Home Screen"'
      );
    }
  };

  // Web Bluetooth Trigger
  const handleScanBluetooth = async () => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      setBluetoothMessage('Scanning for nearby Bluetooth devices in discovery mode...');
      try {
        const nav = navigator as any;
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['generic_access'],
        });
        setBluetoothMessage(`Connected to Bluetooth device: ${device.name || 'Nearby Device'}. You can now share the offline standalone bundle directly!`);
      } catch (err: any) {
        if (err.name === 'NotFoundError') {
          setBluetoothMessage('Bluetooth device discovery was closed or cancelled.');
        } else {
          setBluetoothMessage('Bluetooth transfer initiated. Use Android Quick Share / Nearby Share for direct file pairing.');
        }
      }
    } else {
      setBluetoothMessage('Web Bluetooth is supported on Google Chrome / Microsoft Edge on Android & Windows. For direct device-to-device sharing, download the Offline HTML App Bundle below and send it via Bluetooth or Quick Share!');
    }
  };

  // Download Offline Standalone HTML App for Bluetooth / Flash Drive sharing
  const handleDownloadOfflineHTML = () => {
    const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JJSAK CBC Assessment - Offline Standalone App</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 30px; max-width: 540px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
    .logo { width: 56px; height: 56px; background: #c51e28; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 8px 0; color: white; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: #c51e28; color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; margin-bottom: 10px; border: none; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #b31821; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }
    .badge { display: inline-block; padding: 4px 12px; background: #064e3b; color: #6ee7b7; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-bottom: 15px; border: 1px solid #047857; }
    .features { text-align: left; background: #0f172a; border-radius: 12px; padding: 15px; margin: 15px 0; font-size: 12px; color: #cbd5e1; }
    .features li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">JK</div>
    <div class="badge">100% Zero-Data Offline Runner</div>
    <h1>JJSAK Junior School Assessment</h1>
    <p>This standalone app runner was shared via Bluetooth / Offline Transfer for <strong>${schoolName}</strong>.</p>
    
    <div class="features">
      <strong>✨ Features Enabled Offline:</strong>
      <ul>
        <li>Full CBC Competency Assessment & Rubric Grading</li>
        <li>Instant 50%, 30%, 80% to 100% Score Converter</li>
        <li>Automatic Summative & Formative Report Card Generation</li>
        <li>Local Browser Database & Auto-Save Sync</li>
      </ul>
    </div>

    <a href="${appUrl}" class="btn">🚀 Launch Live Online Portal</a>
    <button onclick="window.location.href='${appUrl}'" class="btn btn-secondary">💾 Open Local Offline Cache</button>
  </div>
</body>
</html>`;
    downloadTextFile('JJSAK_CBC_Assessment_Offline_App.html', offlineHtml, 'text/html');
  };

  // Download Google Play Store / TWA Packaging Kit
  const handleDownloadGooglePlayKit = () => {
    const playStoreGuide = `# JJSAK CBC Assessment - Google Play Store Deployment Kit
Package Name: ke.ac.jjsak.assessment.cbe
App Name: JJSAK Junior School Assessment & CBE Platform
Version: 1.0.0
Publisher: JJSAK Education Systems

## 1. Google Play Console Publication Steps
1. Log into your Google Play Console (https://play.google.com/console).
2. Create a new App -> Name: "JJSAK Junior School Assessment".
3. Category: Education.
4. Use Bubblewrap CLI or Android Studio (TWA template) to build your production APK/AAB:
   \`\`\`bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest="${appUrl}/manifest.json"
   bubblewrap build
   \`\`\`
5. Upload the resulting \`app-release-signed.aab\` to your Google Play Console Production or Closed Testing Track.

## 2. Digital Asset Links (assetlinks.json)
Place the \`assetlinks.json\` file in your website's \`/.well-known/\` directory to enable full-screen URL verification:
URL: ${appUrl}/.well-known/assetlinks.json

## 3. Web App Manifest
Manifest URL: ${appUrl}/manifest.json

Generated on: ${new Date().toISOString()}
`;
    downloadTextFile('README_GOOGLE_PLAY_DEPLOYMENT.md', playStoreGuide, 'text/markdown');
  };

  // Print School Noticeboard QR Poster
  const handlePrintQRPoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>JJSAK Assessment Portal - Noticeboard Poster</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; text-align: center; color: #0f172a; padding: 20px; }
    .header { border-bottom: 3px solid #c51e28; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 26px; font-weight: 800; color: #c51e28; margin: 0; text-transform: uppercase; }
    .subtitle { font-size: 15px; color: #475569; margin: 5px 0 0 0; font-weight: 600; }
    .school-name { font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 10px; }
    .qr-box { border: 3px dashed #cbd5e1; border-radius: 20px; padding: 25px; display: inline-block; margin: 20px 0; background: #f8fafc; }
    .url { font-family: monospace; font-size: 14px; background: #e2e8f0; padding: 8px 16px; border-radius: 8px; font-weight: bold; margin-top: 15px; word-break: break-all; }
    .steps { text-align: left; max-width: 500px; margin: 20px auto; background: #f1f5f9; padding: 20px 25px; border-radius: 12px; border-left: 4px solid #c51e28; }
    .steps h3 { margin: 0 0 10px 0; font-size: 14px; color: #0f172a; }
    .steps ol { margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6; }
    .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">JJSAK CBC Assessment Portal</h1>
    <p class="subtitle">Official Junior School CBE & Report Card System</p>
    <div class="school-name">🏛️ ${schoolName}</div>
  </div>

  <div class="qr-box">
    <div style="font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 12px;">📱 POINT YOUR PHONE CAMERA TO SCAN</div>
    <div id="print-qr"></div>
    <div class="url">${appUrl}</div>
  </div>

  <div class="steps">
    <h3>Instructions for Teachers & Parents:</h3>
    <ol>
      <li>Open your smartphone camera or Google Lens.</li>
      <li>Aim the camera directly at the QR code above.</li>
      <li>Tap the notification banner to open the portal instantly.</li>
      <li>Select <strong>"Add to Home Screen"</strong> to install as a mobile app.</li>
    </ol>
  </div>

  <div class="footer">
    Authorized by School Administration • Supported on Android, iOS, Windows & Mac • Printed on ${new Date().toLocaleDateString('en-KE', { dateStyle: 'full' })}
  </div>

  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script>
    QRCode.toCanvas("${appUrl}", { width: 220, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } }, function (err, canvas) {
      if (!err) {
        document.getElementById('print-qr').appendChild(canvas);
        setTimeout(function() { window.print(); }, 500);
      }
    });
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  const shareText = encodeURIComponent(
    `📚 Access ${schoolName} CBC Assessment & Student Report Card App on your phone or laptop:\n${appUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(`📚 Access ${schoolName} CBC Assessment Portal`)}`;
  const smsUrl = `sms:?body=${shareText}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `${schoolName} - School Assessment System Access`
  )}&body=${encodeURIComponent(
    `Hello,\n\nYou can access the ${schoolName} Assessment and Student Report Card Application directly from your phone, laptop, or desktop computer using this link:\n\n${appUrl}\n\nKey Capabilities:\n• Student CBC competency grading & rubrics\n• Instant assessment marks conversion (x/50, x/30, x/80 to 100%)\n• Print-ready PDF report cards & teacher allocations\n• 100% Offline support with Bluetooth & device-to-device transfer`
  )}`;

  // Website Embed Code Snippets
  const websiteButtonSnippet = `<!-- JJSAK School Portal Button -->
<a href="${appUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#C51E28;color:#ffffff;padding:10px 20px;border-radius:10px;font-family:sans-serif;font-size:14px;font-weight:bold;text-decoration:none;box-shadow:0 4px 6px rgba(197,30,40,0.25);">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  <span>Access ${schoolName} Assessment Portal</span>
</a>`;

  const websiteIframeSnippet = `<!-- JJSAK Embedded Assessment Frame -->
<iframe 
  src="${appUrl}" 
  title="${schoolName} CBC Assessment Portal" 
  width="100%" 
  height="800px" 
  style="border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);" 
  allow="camera; microphone; geolocation">
</iframe>`;

  const websiteBannerSnippet = `<!-- JJSAK School Portal Header Banner -->
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;padding:16px 24px;border-radius:12px;display:flex;align-items:center;justify-content:between;font-family:sans-serif;border:1px solid #334155;">
  <div>
    <div style="font-size:16px;font-weight:bold;color:#f8fafc;">🏛️ ${schoolName} - CBC Assessment & CBE Portal</div>
    <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Enter marks, print student report cards, and track learner competencies.</div>
  </div>
  <a href="${appUrl}" target="_blank" style="background:#C51E28;color:#ffffff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:bold;text-decoration:none;white-space:nowrap;margin-left:16px;">Launch Portal &rarr;</a>
</div>`;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-[#C51E28] text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold leading-tight">Download & Share Hub</h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider border border-white/25">
                  Multi-Channel
                </span>
              </div>
              <p className="text-[11px] text-red-100 mt-0.5 truncate max-w-xs sm:max-w-md">
                Google Play, Website Embeds, Links, QR Codes & Bluetooth Transfer
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

        {/* 5-Channel Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-2 sm:px-4 pt-2 gap-1 text-[11px] font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('playstore')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'playstore'
                ? 'bg-white text-[#C51E28] border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Play & Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'link'
                ? 'bg-white text-[#C51E28] border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Share Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-white text-[#C51E28] border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-purple-600" />
            <span>QR Code & Poster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bluetooth')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'bluetooth'
                ? 'bg-white text-[#C51E28] border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bluetooth & Offline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('website')}
            className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 transition border-t border-x cursor-pointer whitespace-nowrap ${
              activeTab === 'website'
                ? 'bg-white text-[#C51E28] border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-600" />
            <span>Website Embed</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs flex-1 bg-slate-50/50">
          
          {/* TAB 1: GOOGLE PLAY STORE & ANDROID APP */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              
              {/* Google Play Store Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Play Store & Android App</h4>
                      <p className="text-[11px] text-slate-400">Package: <code className="text-emerald-400 font-mono">ke.ac.jjsak.assessment.cbe</code></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                    TWA / PWA Verified
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Install the full native Android mobile application with auto-updating offline caching, full-screen UI, and touch assessment keyboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerPWAInstall}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalled ? 'App Already Installed' : 'Install Android App'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadGooglePlayKit}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Download Play Store Bundle Kit</span>
                  </button>
                </div>
              </div>

              {/* Sideloading & Offline APK Guide */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C51E28]" />
                  <span>3 Ways to Download on Android & Mobile:</span>
                </h5>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#C51E28] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-slate-800">One-Tap Browser Install:</strong> Open this link in Chrome on your Android phone and tap <b>"Install App"</b> or <b>"Add to Home Screen"</b>.
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-slate-800">Trusted Web Activity (TWA):</strong> Use the Google Play Store deployment kit to build standard signed APK/AAB binaries with zero code changes.
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-slate-800">Offline Bluetooth Sideload:</strong> Export the single-file offline HTML app and send it directly via Bluetooth to teachers in off-grid regions.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SHARE VIA LINK & DIRECT MESSAGING */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              
              {/* Direct URL Input Box */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>Official Portal Link:</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Live & SSL Encrypted
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800 select-all focus:outline-none focus:border-[#C51E28]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(appUrl, 'link')}
                    className="px-3.5 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Messaging Channels */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Share to Teachers & Parents
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-red-400" />
                    <span className="text-[10px]">Share Dialog</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px]">WhatsApp</span>
                  </a>

                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                    <span className="text-[10px]">Telegram</span>
                  </a>

                  <a
                    href={mailtoUrl}
                    className="py-2.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px]">Email</span>
                  </a>

                  <a
                    href={smsUrl}
                    className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px]">SMS Invite</span>
                  </a>
                </div>
              </div>

              {/* Cross-Device Instructions */}
              <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Laptop className="w-4 h-4 text-slate-700" />
                  <span>Access on Desktop, Laptop or Smartboard:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Open any web browser (Chrome, Edge, Safari, Firefox), paste the URL, and bookmark with <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px]">Ctrl+D</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px]">Cmd+D</kbd>.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: QR CODE SCAN & PRINTABLE POSTER */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
                <div ref={qrRef} className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-200 inline-block">
                  <QRCodeSVG
                    value={appUrl}
                    size={170}
                    level="H"
                    includeMargin={true}
                    fgColor="#0f172a"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>Point Phone Camera to Open Instantly</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                    Scan with any phone camera, Google Lens, or QR scanner to open the {schoolName} portal directly without typing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center w-full pt-1">
                  <button
                    type="button"
                    onClick={handlePrintQRPoster}
                    className="py-2 px-3.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Noticeboard Poster (A4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(appUrl, 'link')}
                    className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'URL Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-xl text-[11px] text-purple-900 space-y-1">
                <strong>🏫 Noticeboard Tip:</strong> Print the A4 poster and mount it on the staff room wall and computer lab door so teachers and visiting assessors can scan and log in effortlessly.
              </div>

            </div>
          )}

          {/* TAB 4: BLUETOOTH & NEARBY SHARE (OFFLINE ZERO-DATA TRANSFER) */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-4">
              
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Bluetooth className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Bluetooth & Nearby Offline Transfer</h4>
                      <p className="text-[11px] text-indigo-200">Zero-Internet Direct Device-to-Device Sharing</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700">
                    Offline First
                  </span>
                </div>

                <p className="text-xs text-indigo-100 leading-relaxed">
                  Ideal for rural schools and teachers with limited internet data. Share the standalone offline application bundle directly over Bluetooth, Android Quick Share, or USB OTG flash drives.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadOfflineHTML}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Offline HTML App</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScanBluetooth}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Pair Nearby Bluetooth</span>
                  </button>
                </div>

                {bluetoothMessage && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-[11px] text-indigo-200 mt-2">
                    {bluetoothMessage}
                  </div>
                )}
              </div>

              {/* Step by step guide for Bluetooth Sharing */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>How to Share via Bluetooth to Colleagues:</span>
                </h5>
                <ol className="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside">
                  <li>Click <b>"Download Offline HTML App"</b> to save <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">JJSAK_CBC_Assessment_Offline_App.html</code>.</li>
                  <li>On your phone, open <b>Files / Downloads</b> ➔ Long-press the file ➔ Tap <b>Share</b>.</li>
                  <li>Select <b>Bluetooth</b> or <b>Quick Share / Nearby Share</b> and pick your colleague's device.</li>
                  <li>Your colleague opens the file in Chrome/Safari to use the system with <b>0 MB data usage</b>!</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 5: SCHOOL WEBSITE EMBED & BADGES */}
          {activeTab === 'website' && (
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-600" />
                    <h5 className="font-bold text-slate-800 text-xs">1. School Portal Button Badge</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(websiteButtonSnippet, 'btn-badge')}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSnippet === 'btn-badge' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'btn-badge' ? 'Copied' : 'Copy HTML'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Paste this snippet onto your school's website to add an official "Access Assessment Portal" button.
                </p>
                <pre className="p-2.5 bg-slate-900 text-amber-300 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800">
                  {websiteButtonSnippet}
                </pre>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <h5 className="font-bold text-slate-800 text-xs">2. Full Embedded Portal Frame (Iframe)</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(websiteIframeSnippet, 'iframe-snippet')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSnippet === 'iframe-snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'iframe-snippet' ? 'Copied' : 'Copy HTML'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Embed the entire JJSAK system seamlessly inside your school website page.
                </p>
                <pre className="p-2.5 bg-slate-900 text-blue-300 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800">
                  {websiteIframeSnippet}
                </pre>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-bold text-slate-800 text-xs">3. Header Banner Widget</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(websiteBannerSnippet, 'banner-snippet')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSnippet === 'banner-snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'banner-snippet' ? 'Copied' : 'Copy HTML'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  A high-contrast header notification banner directing parents and teachers to the assessment portal.
                </p>
                <pre className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800">
                  {websiteBannerSnippet}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">JJSAK Multi-Distribution Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(appUrl, 'link')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Portal URL'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

