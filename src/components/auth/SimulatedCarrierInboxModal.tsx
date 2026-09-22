import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Inbox,
  Mail,
  Smartphone,
  MessageSquare,
  Copy,
  Check,
  KeyRound,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { carrierInboxService, InboxMessage, InboxChannel } from '../../services/carrierInboxService';

interface SimulatedCarrierInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenValidation: (otp: string, username?: string, schoolId?: string, password?: string) => void;
  onOpenSchoolActivation?: (params: {
    schoolId: string;
    schoolName: string;
    registrationNumber?: string;
    schoolAccount?: string;
    otp?: string;
    temporaryPassword?: string;
  }) => void;
  onSelectOtpForLogin?: (otp: string, password?: string, username?: string) => void;
}

export const SimulatedCarrierInboxModal: React.FC<SimulatedCarrierInboxModalProps> = ({
  isOpen,
  onClose,
  onOpenValidation,
  onOpenSchoolActivation,
  onSelectOtpForLogin,
}) => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<'ALL' | InboxChannel>('ALL');
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [revealedOtpIds, setRevealedOtpIds] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshMessages = useCallback(async () => {
    setIsSyncing(true);
    try {
      await carrierInboxService.syncWithBackend();
    } finally {
      const list = carrierInboxService.getMessages(activeChannel === 'ALL' ? undefined : activeChannel);
      setMessages(list);
      setIsSyncing(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    if (isOpen) {
      refreshMessages();
      carrierInboxService.markAllAsRead();

      const handleSync = () => {
        const list = carrierInboxService.getMessages(activeChannel === 'ALL' ? undefined : activeChannel);
        setMessages(list);
      };
      window.addEventListener('jjsak_inbox_synced', handleSync);
      window.addEventListener('jjsak_new_inbox_message', handleSync);

      const interval = setInterval(() => {
        carrierInboxService.syncWithBackend().then(() => {
          const list = carrierInboxService.getMessages(activeChannel === 'ALL' ? undefined : activeChannel);
          setMessages(list);
        });
      }, 2500);

      return () => {
        window.removeEventListener('jjsak_inbox_synced', handleSync);
        window.removeEventListener('jjsak_new_inbox_message', handleSync);
        clearInterval(interval);
      };
    }
  }, [isOpen, activeChannel, refreshMessages]);

  if (!isOpen) return null;

  const handleCopyOtp = (msgId: string, otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtpId(msgId);
    setTimeout(() => setCopiedOtpId(null), 2500);
  };

  const handleClearAll = () => {
    if (confirm('Clear all received inbox messages?')) {
      carrierInboxService.clearAll();
      refreshMessages();
    }
  };

  const parseOtpFromMessage = (msg: InboxMessage): string | null => {
    if (msg.otpCode) return msg.otpCode;
    const match = msg.body.match(/\b([0-9]{6})\b/);
    return match ? match[1] : null;
  };

  const parseUsernameFromMessage = (msg: InboxMessage): string => {
    const userMatch = msg.body.match(/(?:Username|Account|ID):\s*([a-zA-Z0-9._-]+)/i);
    return userMatch ? userMatch[1] : msg.recipientAddress || '';
  };

  return (
    <div
      id="carrier-inbox-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 p-5 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Carrier &amp; Email Notification Inboxes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official inboxes for Email, SMS &amp; WhatsApp verification codes and system alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshMessages}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs"
              title="Refresh Inboxes"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveChannel('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeChannel === 'ALL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              All Inboxes ({carrierInboxService.getMessages().length})
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('SMS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeChannel === 'SMS'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS ({carrierInboxService.getMessages('SMS').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('WHATSAPP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp ({carrierInboxService.getMessages('WHATSAPP').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('EMAIL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeChannel === 'EMAIL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email ({carrierInboxService.getMessages('EMAIL').length})</span>
            </button>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-bold text-slate-500 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Inboxes</span>
            </button>
          )}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No Messages in Carrier Inbox</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                When a school administrator registers a new teacher, the OTP verification code and direct portal activation link will arrive here in real-time.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const otp = parseOtpFromMessage(msg);
              const username = parseUsernameFromMessage(msg);

              const channelBadgeColor =
                msg.channel === 'WHATSAPP'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                  : msg.channel === 'EMAIL'
                  ? 'bg-blue-950/60 border-blue-700 text-blue-400'
                  : 'bg-amber-950/60 border-amber-700 text-amber-400';

              const channelIcon =
                msg.channel === 'WHATSAPP' ? (
                  <MessageSquare className="w-3.5 h-3.5" />
                ) : msg.channel === 'EMAIL' ? (
                  <Mail className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                );

              return (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${channelBadgeColor}`}
                      >
                        {channelIcon}
                        <span>{msg.channel} INBOX</span>
                      </span>
                      <span className="text-xs font-bold text-white">
                        To: {msg.recipientName} ({msg.recipientAddress})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {msg.subject && (
                    <div className="text-xs font-bold text-red-300 mb-2">
                      Subject: {msg.subject}
                    </div>
                  )}

                  {(() => {
                    const isRevealed = Boolean(revealedOtpIds[msg.id]);
                    let displayBody = msg.body;
                    if (!isRevealed) {
                      displayBody = displayBody.replace(/\b([0-9]{6})\b/g, '•••••• [CONFIDENTIAL]');
                      if (msg.firstTimePassword) {
                        displayBody = displayBody.split(msg.firstTimePassword).join('•••••••••••• [CONFIDENTIAL TEMPORARY PASSWORD]');
                      }
                    }

                    return (
                      <>
                        <div className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 select-text">
                          {displayBody}
                        </div>

                        {/* First-Time Password & Activation Link Section */}
                        {msg.firstTimePassword && (
                          <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                                  First-Time Temporary Password (Delivered by Portal):
                                </span>
                                {isRevealed ? (
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-sm font-black text-emerald-300 tracking-wider">
                                      {msg.firstTimePassword}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                                      Valid for Login
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-sm font-bold text-slate-500 tracking-wider">
                                      ••••••••••••
                                    </span>
                                    <span className="text-[10px] text-amber-400/90 font-medium">
                                      (Protected • Click Retrieve Credentials below to reveal)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isRevealed ? (
                                <button
                                  type="button"
                                  onClick={() => setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }))}
                                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Retrieve Password</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (msg.firstTimePassword) {
                                      navigator.clipboard.writeText(msg.firstTimePassword);
                                      setCopiedOtpId(`pwd-${msg.id}`);
                                      setTimeout(() => setCopiedOtpId(null), 2500);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                                >
                                  {copiedOtpId === `pwd-${msg.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Password</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }));
                                  onClose();
                                  onOpenValidation(otp || '', username, msg.schoolId, msg.firstTimePassword);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Activate Link &amp; Login</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Highlighted OTP Action Row */}
                        {otp && (
                          <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-emerald-950/40 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <KeyRound className="w-4 h-4 text-red-400" />
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                                  Verification OTP for {msg.recipientAddress}:
                                </span>
                                {isRevealed ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-base font-black text-amber-300 tracking-widest">
                                      {otp}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      Retrieved from inbox address
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-base font-bold text-slate-500 tracking-widest">
                                      ••••••
                                    </span>
                                    <span className="text-[10px] text-amber-400/90 font-medium">
                                      (Protected • Click Retrieve OTP below to reveal)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isRevealed ? (
                                <button
                                  type="button"
                                  onClick={() => setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }))}
                                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition cursor-pointer"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  <span>Retrieve OTP from Inbox</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCopyOtp(msg.id, otp)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-600"
                                >
                                  {copiedOtpId === msg.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy OTP</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }));
                                  if (otp) {
                                    carrierInboxService.triggerAutoFillOtp(otp);
                                  }
                                  if (onSelectOtpForLogin) {
                                    onSelectOtpForLogin(otp || '', msg.firstTimePassword, username);
                                  }
                                  onClose();
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950/50 transition cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Use for Login</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }));
                                  onClose();
                                  onOpenValidation(otp || '', username, msg.schoolId, msg.firstTimePassword);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Validate &amp; Set Password</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Special Institutional School Registration & Personnel Onboarding Card */}
                        {(msg.purpose === 'SCHOOL_REGISTRATION_ONBOARDING' || msg.schoolAccount) && (
                          <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-emerald-950/60 border border-red-500/40">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-600 text-white flex items-center gap-1">
                                  🏫 SCHOOL ONBOARDING DISPATCH
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {msg.schoolName} ({msg.schoolRegistrationNumber || 'Reg No Confirmed'})
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                Account: {msg.schoolAccount || `${msg.schoolId}@jjsak`}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="text-[11px] text-slate-300">
                                Link sent to {msg.channel} ({msg.recipientAddress}) to activate school account <strong className="text-white">{msg.schoolAccount || 'ngonyek@jjsak'}</strong> and access the school portal to onboard personnel.
                              </div>

                              <div className="flex items-center gap-2">
                                {onOpenSchoolActivation && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevealedOtpIds((prev) => ({ ...prev, [msg.id]: true }));
                                      onClose();
                                      onOpenSchoolActivation({
                                        schoolId: msg.schoolId,
                                        schoolName: msg.schoolName,
                                        registrationNumber: msg.schoolRegistrationNumber,
                                        schoolAccount: msg.schoolAccount,
                                        otp: otp || '',
                                        temporaryPassword: msg.firstTimePassword || '',
                                      });
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-950/50 transition cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Activate School &amp; Onboard Staff</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (msg.activationLink) {
                                      navigator.clipboard.writeText(msg.activationLink);
                                      setCopiedOtpId(`link-${msg.id}`);
                                      setTimeout(() => setCopiedOtpId(null), 2500);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                                >
                                  {copiedOtpId === `link-${msg.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Link Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Activation Link</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 text-center flex items-center justify-between text-[11px] text-slate-400">
          <span>JJSAK Carrier Dispatch Service • Multi-Channel Delivery Guarantee</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            Close Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
