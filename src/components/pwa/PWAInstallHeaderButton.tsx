import React from 'react';
import { Download, CheckCircle2, Laptop, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallHeaderButtonProps {
  onOpenDistributionModal: () => void;
  schoolName?: string;
}

export const PWAInstallHeaderButton: React.FC<PWAInstallHeaderButtonProps> = ({
  onOpenDistributionModal,
  schoolName,
}) => {
  const { isStandalone, isInstallable, install, platform } = usePWAInstall();

  const handleClick = async () => {
    if (isStandalone) {
      onOpenDistributionModal();
      return;
    }
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        onOpenDistributionModal();
      }
    } else {
      onOpenDistributionModal();
    }
  };

  const getDeviceIcon = () => {
    if (platform === 'android' || platform === 'ios') {
      return <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-red-400 shrink-0" />;
  };

  if (isStandalone) {
    return (
      <button
        type="button"
        id="installed-pwa-badge-btn"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/80 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        title="Running as Installed JJSAK Application. Click to view Application Distribution, Updates & Integrity Status."
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">JJSAK App</span>
        <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-900 text-emerald-300 font-black border border-emerald-600/60">
          Installed
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      id="install-pwa-header-btn"
      onClick={handleClick}
      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-sm border border-red-400/40 animate-pulse hover:animate-none"
      title={`Install official JJSAK Application for ${schoolName || 'your school'} (Windows PC, Laptop, Android)`}
    >
      {getDeviceIcon()}
      <Download className="w-3 h-3 text-white/90 shrink-0" />
      <span className="hidden sm:inline">Install App</span>
      <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 text-white font-black">
        v2.4.0
      </span>
    </button>
  );
};
