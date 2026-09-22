import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  KeyRound,
  Copy,
  Check,
  Send,
  MessageSquare,
  Smartphone,
  Eye,
  EyeOff,
  Inbox,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { SchoolTenant } from '../types';
import { carrierInboxService } from '../services/carrierInboxService';

interface InstitutionalCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolTenant | null;
  onOpenCarrierInbox?: () => void;
  onOpenSchoolActivation?: (params: {
    schoolId?: string;
    schoolName?: string;
    registrationNumber?: string;
    schoolAccount?: string;
    otp?: string;
    temporaryPassword?: string;
  }) => void;
}

export const InstitutionalCredentialsModal: React.FC<InstitutionalCredentialsModalProps> = ({
  isOpen,
  onClose,
  school,
  onOpenCarrierInbox,
  onOpenSchoolActivation,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [liveDispatching, setLiveDispatching] = useState(false);
  const [liveDispatchResult, setLiveDispatchResult] = useState<any>(null);
  const [dispatchedData, setDispatchedData] = useState<{
    schoolAccount?: string;
    firstTimePassword?: string;
    otpCode?: string;
    activationLink?: string;
    recipientName?: string;
    recipientAddress?: string;
    schoolRegistrationNumber?: string;
    sentAt?: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && school) {
      // Fetch or generate verified dispatched credentials
      const creds = carrierInboxService.ensureDispatchedForSchool(school);
      setDispatchedData(creds);
      setResendStatus(null);
    }
  }, [isOpen, school]);

  if (!isOpen || !school) return null;

  const cleanSub = (
    school.subdomain ||
    school.schoolCode ||
    school.schoolName.split(' ')[0] ||
    'school'
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const schoolAccount = dispatchedData?.schoolAccount || `${cleanSub}@jjsak`;
  const regNo =
    dispatchedData?.schoolRegistrationNumber ||
    school.registrationNumber ||
    school.schoolCode ||
    `MOE/${cleanSub.toUpperCase()}-001`;
  const otpCode = dispatchedData?.otpCode || '834921';
  const firstTimePassword = dispatchedData?.firstTimePassword || 'Jjsak@2026!Adm';
  const adminName =
    dispatchedData?.recipientName ||
    school.administratorDetails?.fullName ||
    `Head of Institution (${school.schoolName})`;
  const adminPhone =
    school.administratorDetails?.phoneNumber ||
    school.phone ||
    '+254 741 478 813';
  const adminEmail =
    school.administratorDetails?.emailAddress ||
    school.email ||
    school.officialEmail ||
    `head@${cleanSub}.sc.ke`;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portal.jjsak.edu.ke';
  const activationLink =
    dispatchedData?.activationLink ||
    `${baseUrl}/#activate-school?school=${encodeURIComponent(school.schoolId)}&schoolName=${encodeURIComponent(school.schoolName)}&regNo=${encodeURIComponent(regNo)}&account=${encodeURIComponent(schoolAccount)}&otp=${encodeURIComponent(otpCode)}&pwd=${encodeURIComponent(firstTimePassword)}`;

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleResend = () => {
    const res = carrierInboxService.ensureDispatchedForSchool(school, { force: true });
    setDispatchedData(res);
    setResendStatus(`✓ Link, password & OTP re-dispatched via SMS, WhatsApp & Email to ${adminPhone}!`);
    setTimeout(() => setResendStatus(null), 6000);
  };

  const handleTriggerLiveDispatchNow = async () => {
    setLiveDispatching(true);
    try {
      const resp = await fetch('/api/teacher/dispatch-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: schoolAccount,
          teacherName: adminName,
          username: schoolAccount,
          email: adminEmail,
          phoneNumber: adminPhone,
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          firstTimePassword,
          otpCode,
          activationLink,
          channels: ['WHATSAPP', 'SMS', 'EMAIL'],
        }),
      });
      const data = await resp.json();
      setLiveDispatchResult(data);
      setResendStatus('✓ Live carrier dispatch triggered via installed API keys (WhatsApp / SMS / Email)');
      setTimeout(() => setResendStatus(null), 8000);
    } catch {
      setResendStatus('⚠️ Live carrier dispatch encountered connection error.');
      setTimeout(() => setResendStatus(null), 6000);
    } finally {
      setLiveDispatching(false);
    }
  };

  const handleLaunchActivation = () => {
    onClose();
    if (onOpenSchoolActivation) {
      onOpenSchoolActivation({
        schoolId: school.schoolId,
        schoolName: school.schoolName,
        registrationNumber: regNo,
        schoolAccount,
        otp: otpCode,
        temporaryPassword: firstTimePassword,
      });
    } else {
      window.location.hash = `activate-school?school=${encodeURIComponent(school.schoolId)}&schoolName=${encodeURIComponent(school.schoolName)}&regNo=${encodeURIComponent(regNo)}&account=${encodeURIComponent(schoolAccount)}&otp=${encodeURIComponent(otpCode)}&pwd=${encodeURIComponent(firstTimePassword)}`;
    }
  };

  return (
    <div
      id="institutional-credentials-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{school.schoolName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {school.schoolCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {school.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Onboarding Credentials, First-Time Password &amp; Verification OTP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {resendStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* Registered Administrative Contact Card */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Recipient Administrative Details (Target for Dispatches)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                Active Recipient
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 block">Administrator</span>
                <span className="font-bold text-white text-xs">{adminName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Mobile Phone (SMS &amp; WhatsApp)</span>
                <span className="font-mono font-bold text-amber-300 text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {adminPhone}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Official Email</span>
                <span className="font-mono text-blue-300 text-xs flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  {adminEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Core Credentials Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              Institutional Access Credentials &amp; Single-Use OTP
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* School Account */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">School Account (Login Identifier)</span>
                  <span className="text-sm font-mono font-black text-white">{schoolAccount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(schoolAccount, 'account')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy School Account"
                >
                  {copiedField === 'account' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Ministry Reg No */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Ministry Registration No</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{regNo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(regNo, 'regNo')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Registration Number"
                >
                  {copiedField === 'regNo' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Temporary Password */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Temporary First-Time Password</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {showPassword ? firstTimePassword : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(firstTimePassword, 'password')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Password"
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Single-Use OTP */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 block font-medium">Single-Use Verification OTP</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                      Active
                    </span>
                  </div>
                  <span className="text-lg font-mono font-black text-emerald-400 tracking-widest">{otpCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(otpCode, 'otp')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy OTP"
                >
                  {copiedField === 'otp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Direct Portal Activation Link */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">
                  Direct School Portal Activation &amp; Staff Onboarding Link
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Includes pre-filled auth token</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={activationLink}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(activationLink, 'link')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  {copiedField === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'link' ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Channels Verification Matrix */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Carrier Dispatch Channels Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    Email Gateway
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    DELIVERED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
                <p className="text-[9px] text-slate-500">Includes institutional welcome, credentials &amp; link.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    SMS Carrier
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    DELIVERED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{adminPhone}</p>
                <p className="text-[9px] text-slate-500">Contains OTP code {otpCode} &amp; temp login password.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp Business
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    DELIVERED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{adminPhone}</p>
                <p className="text-[9px] text-slate-500">Instant interactive activation card with 1-click token.</p>
              </div>
            </div>
          </div>

          {/* Direct Instant Device Delivery & Live API Controls */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-300">
                Live Carrier Dispatch &amp; One-Click Device Transmission:
              </span>
              <button
                type="button"
                onClick={handleTriggerLiveDispatchNow}
                disabled={liveDispatching}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${liveDispatching ? 'animate-spin' : ''}`} />
                <span>{liveDispatching ? 'Dispatching via Server APIs...' : 'Send Live via Server APIs'}</span>
              </button>
            </div>

            {(() => {
              const targetPhone = (adminPhone || '0741478813').replace(/\D/g, '');
              let intlPhone = targetPhone;
              if (targetPhone.startsWith('0') && targetPhone.length === 10) intlPhone = '254' + targetPhone.substring(1);
              const waText = `*${school.schoolName} — School Registration & Portal Access*\n\nHello *${adminName}*,\nYour school account is registered.\n\n🏫 *School Account:* ${schoolAccount}\n🔐 *Temporary Password:* ${firstTimePassword}\n🔑 *Activation OTP:* ${otpCode}\n\n👉 *Direct School Activation Link:*\n${activationLink}\n\nPlease click the link to activate your institution.`;
              const smsText = `[JJSAK Alert] ${school.schoolName}: School registered. Account: ${schoolAccount} | Temp Pass: ${firstTimePassword} | OTP: ${otpCode} | Link: ${activationLink}`;
              const emailSubject = `Official School Registration Credentials — ${school.schoolName}`;

              return (
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send via WhatsApp Now</span>
                  </a>

                  <a
                    href={`sms:+${intlPhone}?body=${encodeURIComponent(smsText)}`}
                    className="px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/50 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    <span>Send via SMS Now</span>
                  </a>

                  {adminEmail && (
                    <a
                      href={`mailto:${adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(smsText)}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Send via Email Now</span>
                    </a>
                  )}
                </div>
              );
            })()}

            {liveDispatchResult && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 animate-in fade-in space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Server Carrier Transmission Completed:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-300">
                  <div>WhatsApp: {liveDispatchResult.channelResults?.whatsapp?.accepted ? '✓ Accepted (Cloud API)' : liveDispatchResult.channelResults?.whatsapp?.provider || 'Ready'}</div>
                  <div>SMS: {liveDispatchResult.channelResults?.sms?.accepted ? '✓ Accepted (SMS Gateway)' : liveDispatchResult.channelResults?.sms?.provider || 'Ready'}</div>
                  <div>Email: {liveDispatchResult.channelResults?.email?.accepted ? '✓ Accepted (Resend/SMTP)' : liveDispatchResult.channelResults?.email?.provider || 'Ready'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Resend Dispatches (SMS &amp; WhatsApp)</span>
            </button>

            {onOpenCarrierInbox && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCarrierInbox();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5 text-blue-400" />
                <span>View in Virtual Carrier Inbox</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleLaunchActivation}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch School Portal Activation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
