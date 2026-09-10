import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Plus,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Star,
  RefreshCw,
  Info,
  KeyRound,
  FileCheck2,
  BadgeAlert,
  Clock,
  Search,
  Trash2,
} from 'lucide-react';
import { User } from '../../types';
import {
  SubscriptionPaymentChannel,
  PaymentChannelHistoryRecord,
  SubscriptionTransactionRecord,
  PaymentMethod,
  PaymentChannelStatus,
} from '../../types/paymentChannels';
import {
  subscriptionPaymentService,
  OWNER_SECURITY_PIN,
} from '../../services/subscriptionPaymentService';

interface OwnerPaymentConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const OwnerPaymentConfigurationModal: React.FC<OwnerPaymentConfigurationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'add' | 'history' | 'verification'>('channels');
  const [channels, setChannels] = useState<SubscriptionPaymentChannel[]>([]);
  const [history, setHistory] = useState<PaymentChannelHistoryRecord[]>([]);
  const [transactions, setTransactions] = useState<SubscriptionTransactionRecord[]>([]);

  // Feedback notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit / Replace state
  const [selectedChannel, setSelectedChannel] = useState<SubscriptionPaymentChannel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isVerifyTxModalOpen, setIsVerifyTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<SubscriptionTransactionRecord | null>(null);

  // Verification 2FA inputs
  const [authPin, setAuthPin] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [verificationOutcome, setVerificationOutcome] = useState<'VALIDATED' | 'UNDER_REVIEW' | 'REJECTED'>('VALIDATED');
  const [darajaCode, setDarajaCode] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'REVIEW' | 'VALIDATED' | 'REJECTED'>('ALL');

  // Add Form state
  const [formData, setFormData] = useState({
    method: 'MPESA_PAYBILL' as PaymentMethod,
    providerName: 'Safaricom M-Pesa',
    accountName: 'JJSAK Systems Ltd',
    paybillNumber: '',
    tillNumber: '',
    businessNumber: '',
    bankAccountNumber: '',
    bankBranch: '',
    swiftCode: '',
    accountReferenceInstructions: 'Enter School Code e.g. NJS-30200 as the Account Number',
    currency: 'KES',
    paymentPurpose: 'JJSAK Annual & Term Subscription Licensing',
    status: 'ACTIVE' as PaymentChannelStatus,
    isPrimary: false,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    internalDescription: '',
  });

  const refreshData = () => {
    try {
      const allChannels = subscriptionPaymentService.getAllPaymentChannels(currentUser);
      const allHist = subscriptionPaymentService.getPaymentChannelHistory(currentUser);
      const allTx = subscriptionPaymentService.getSubscriptionTransactions(currentUser);
      setChannels(allChannels);
      setHistory(allHist);
      setTransactions(allTx);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error fetching payment data' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const unsub = subscriptionPaymentService.subscribe(() => {
        refreshData();
      });
      return () => unsub();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. ADD CHANNEL HANDLER
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA Security PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }

    try {
      subscriptionPaymentService.addPaymentChannel(
        currentUser,
        formData,
        authPin,
        actionReason || 'Registered new subscription payment channel.'
      );
      showToast('success', `Payment channel '${formData.providerName}' successfully configured.`);
      setAuthPin('');
      setActionReason('');
      setActiveTab('channels');
    } catch (err: any) {
      setModalError(err.message || 'Failed to add payment channel.');
    }
  };

  // 2. SET PRIMARY HANDLER
  const handleSetPrimary = (channel: SubscriptionPaymentChannel) => {
    const pin = prompt(`CONFIRM PRIMARY CHANNEL DESIGNATION\nEnter Owner Security PIN (${OWNER_SECURITY_PIN}) to designate ${channel.providerName} as primary:`);
    if (!pin) return;
    try {
      subscriptionPaymentService.setPrimaryChannel(currentUser, channel.id, pin, 'Designated as primary official channel by Owner');
      showToast('success', `${channel.providerName} is now the PRIMARY payment channel for all schools.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update primary channel.');
    }
  };

  // 3. EMERGENCY DEACTIVATION HANDLER
  const handleEmergencyDeactivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!selectedChannel) return;

    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }
    if (!actionReason.trim()) {
      setModalError('Please provide a mandatory reason for emergency deactivation.');
      return;
    }

    try {
      subscriptionPaymentService.emergencyDeactivate(
        currentUser,
        selectedChannel.id,
        actionReason,
        authPin
      );
      showToast('success', `EMERGENCY ALERT: Channel '${selectedChannel.providerName}' has been immediately DEACTIVATED.`);
      setIsEmergencyModalOpen(false);
      setSelectedChannel(null);
      setAuthPin('');
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to deactivate channel.');
    }
  };

  // 4. REPLACE CHANNEL HANDLER
  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!selectedChannel) return;

    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }

    try {
      subscriptionPaymentService.replacePaymentChannel(
        currentUser,
        selectedChannel.id,
        formData,
        authPin,
        actionReason || `Replaced obsolete channel '${selectedChannel.providerName}'.`
      );
      showToast('success', `Channel replaced successfully. Historical records preserved.`);
      setIsReplaceModalOpen(false);
      setSelectedChannel(null);
      setAuthPin('');
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to replace channel.');
    }
  };

  // 5. EDIT CHANNEL SUBMIT
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!selectedChannel) return;

    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }

    try {
      subscriptionPaymentService.updatePaymentChannel(
        currentUser,
        selectedChannel.id,
        formData,
        authPin,
        actionReason || 'Updated channel details via Owner Console.'
      );
      showToast('success', `Channel '${formData.providerName}' updated and audit logged.`);
      setIsEditModalOpen(false);
      setSelectedChannel(null);
      setAuthPin('');
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to update channel.');
    }
  };

  // 6. VALIDATE PAYMENT SUBMISSION (Owner Validation Authority)
  const handleValidateTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }

    try {
      const result = subscriptionPaymentService.validatePaymentByOwner(
        currentUser,
        selectedTx.id,
        verificationOutcome,
        actionReason || (verificationOutcome === 'VALIDATED' ? 'Verified against Safaricom M-Pesa Business 0741478813 statement.' : 'Review status updated by Owner.'),
        authPin,
        darajaCode
      );
      showToast(
        'success',
        `Transaction ${selectedTx.paymentReferenceNumber || selectedTx.transactionReference} marked as ${verificationOutcome}. ${result.receipt ? `Official Receipt ${result.receipt.id} generated!` : ''}`
      );
      setIsVerifyTxModalOpen(false);
      setSelectedTx(null);
      setActionReason('');
      setDarajaCode('');
      setAuthPin('');
      setModalError(null);
      refreshData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to validate transaction.');
    }
  };

  // 7. CLEAN SLATE POLICY: RESET ALL LEGACY PAYMENT CHANNELS
  const handleResetAllLegacyChannels = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPin || authPin !== OWNER_SECURITY_PIN) {
      setModalError(`Invalid Owner 2FA PIN. (Default demo PIN is: ${OWNER_SECURITY_PIN})`);
      return;
    }

    try {
      subscriptionPaymentService.resetAllLegacyPaymentChannels(
        currentUser,
        authPin,
        actionReason || 'Enforced JJSAK Clean Slate Policy: purged all legacy payment accounts.'
      );
      showToast('success', 'Clean Slate Policy Enforced: All legacy payment channels cleared. Safaricom M-Pesa Business Number 0741478813 established.');
      setIsResetModalOpen(false);
      setAuthPin('');
      setActionReason('');
      setModalError(null);
      refreshData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to reset channels.');
    }
  };

  const openEditModal = (c: SubscriptionPaymentChannel) => {
    setSelectedChannel(c);
    setFormData({
      method: c.method,
      providerName: c.providerName,
      accountName: c.accountName,
      paybillNumber: c.paybillNumber || '',
      tillNumber: c.tillNumber || '',
      businessNumber: c.businessNumber || '',
      bankAccountNumber: c.bankAccountNumber || '',
      bankBranch: c.bankBranch || '',
      swiftCode: c.swiftCode || '',
      accountReferenceInstructions: c.accountReferenceInstructions,
      currency: c.currency,
      paymentPurpose: c.paymentPurpose,
      status: c.status,
      isPrimary: c.isPrimary,
      effectiveDate: c.effectiveDate,
      expiryDate: c.expiryDate || '',
      internalDescription: c.internalDescription || '',
    });
    setAuthPin('');
    setActionReason('');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const openReplaceModal = (c: SubscriptionPaymentChannel) => {
    setSelectedChannel(c);
    setFormData({
      method: c.method,
      providerName: `${c.providerName} (New)`,
      accountName: c.accountName,
      paybillNumber: '',
      tillNumber: '',
      businessNumber: '',
      bankAccountNumber: '',
      bankBranch: c.bankBranch || '',
      swiftCode: c.swiftCode || '',
      accountReferenceInstructions: c.accountReferenceInstructions,
      currency: c.currency,
      paymentPurpose: c.paymentPurpose,
      status: 'ACTIVE',
      isPrimary: true,
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      internalDescription: `Replacement channel replacing retired ID: ${c.id}`,
    });
    setAuthPin('');
    setActionReason(`Decommissioning obsolete channel ${c.id} and activating replacement.`);
    setModalError(null);
    setIsReplaceModalOpen(true);
  };

  const openEmergencyModal = (c: SubscriptionPaymentChannel) => {
    setSelectedChannel(c);
    setAuthPin('');
    setActionReason('');
    setModalError(null);
    setIsEmergencyModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header with Security Badge */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  Owner / Super Admin Exclusive
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  SCMH 2.X • Revenue Control
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                JJSAK Subscription Payment Channel Configuration
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/70 hover:text-red-400 text-slate-300 transition cursor-pointer"
              title="Close Modal"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-red-50 text-red-900 border-b border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-4 pt-3 flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'channels'
                ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Official Payment Channels ({channels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('add');
              setModalError(null);
            }}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'add'
                ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Payment Channel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'verification'
                ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-purple-600" />
            <span>Verification Queue</span>
            {transactions.filter((t) => t.verificationStatus === 'ENTERED_UNVERIFIED').length > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {transactions.filter((t) => t.verificationStatus === 'ENTERED_UNVERIFIED').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>Audit & Change History ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CHANNELS LIST */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <p className="text-amber-900 font-medium">
                    <strong>Strict Security Boundary:</strong> Only channels with status <span className="bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded text-[10px]">ACTIVE</span> are rendered on School Subscription screens. Inactive and retired channels are preserved for historical audit.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[11px] font-mono text-slate-600">
                    Active Channels: <strong className="text-emerald-700">{channels.filter((c) => c.status === 'ACTIVE').length}</strong> / {channels.length} Total
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthPin('');
                      setActionReason('');
                      setModalError(null);
                      setIsResetModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clean Slate Reset</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => {
                  const isActive = channel.status === 'ACTIVE';
                  const isPrimary = channel.isPrimary;

                  return (
                    <div
                      key={channel.id}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isPrimary
                          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : isActive
                          ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            {channel.method.startsWith('MPESA') ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                                M
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                                <Building2 className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-black text-slate-900">
                                {channel.providerName}
                              </h3>
                              <p className="text-[10px] text-slate-500 font-mono">
                                ID: {channel.id} • {channel.method.replace('_', ' ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPrimary && (
                              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Star className="w-3 h-3 fill-white" />
                                <span>PRIMARY</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                channel.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : channel.status === 'REPLACED'
                                  ? 'bg-slate-200 text-slate-700'
                                  : channel.status === 'EXPIRED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {channel.status}
                            </span>
                          </div>
                        </div>

                        {/* Channel Details */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Account Name:</span>
                            <span className="font-bold text-slate-900">{channel.accountName}</span>
                          </div>

                          {channel.paybillNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Paybill Number:</span>
                              <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {channel.paybillNumber}
                              </span>
                            </div>
                          )}

                          {channel.tillNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Till Number:</span>
                              <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {channel.tillNumber}
                              </span>
                            </div>
                          )}

                          {channel.bankAccountNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Account Number:</span>
                              <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {channel.bankAccountNumber}
                              </span>
                            </div>
                          )}

                          {channel.bankBranch && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Branch:</span>
                              <span className="font-medium text-slate-800">{channel.bankBranch}</span>
                            </div>
                          )}

                          <div className="pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">
                              Reference Instructions (Shown to Schools):
                            </span>
                            <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded border border-slate-100">
                              "{channel.accountReferenceInstructions}"
                            </p>
                          </div>

                          {/* Owner Internal Description */}
                          {channel.internalDescription && (
                            <div className="pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-amber-700 block font-bold mb-0.5 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Owner Internal Notes (Hidden from Schools):</span>
                              </span>
                              <p className="text-[10px] text-slate-600 bg-amber-50/50 p-1.5 rounded border border-amber-100">
                                {channel.internalDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1">
                          {!isPrimary && isActive && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(channel)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                              title="Designate as primary collection channel"
                            >
                              <Star className="w-3 h-3" />
                              <span>Make Primary</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(channel)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openReplaceModal(channel)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] transition cursor-pointer"
                            title="Decommission this channel and seamlessly activate a replacement"
                          >
                            Replace
                          </button>
                        </div>

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => openEmergencyModal(channel)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                            title="Immediate emergency deactivation"
                          >
                            <BadgeAlert className="w-3.5 h-3.5" />
                            <span>Emergency Deactivate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW CHANNEL */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="max-w-2xl mx-auto space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add Official Subscription Payment Channel</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    This channel will be globally available across all schools for JJSAK licensing payments.
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => {
                      const m = e.target.value as PaymentMethod;
                      setFormData({
                        ...formData,
                        method: m,
                        providerName: m.startsWith('MPESA') ? 'Safaricom M-Pesa' : 'National Bank of Kenya',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="MPESA_PAYBILL">M-Pesa Paybill</option>
                    <option value="MPESA_TILL">M-Pesa Till Number (Buy Goods)</option>
                    <option value="MPESA_POCHI">M-Pesa Business Number</option>
                    <option value="BANK_TRANSFER">Bank Account (EFT / RTGS / Cash)</option>
                    <option value="CUSTOM">Custom Approved Channel</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Provider / Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    placeholder="e.g. Safaricom M-Pesa or Equity Bank"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="e.g. JJSAK Systems Ltd or JJSAK Educational Technologies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {formData.method === 'MPESA_PAYBILL' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Paybill Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.paybillNumber}
                      onChange={(e) => setFormData({ ...formData, paybillNumber: e.target.value })}
                      placeholder="e.g. 522123"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                )}

                {formData.method === 'MPESA_TILL' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Till Number (Buy Goods) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tillNumber}
                      onChange={(e) => setFormData({ ...formData, tillNumber: e.target.value })}
                      placeholder="e.g. 882190"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                )}

                {formData.method === 'BANK_TRANSFER' && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Bank Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        placeholder="e.g. 01280771790100"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Branch & Code
                      </label>
                      <input
                        type="text"
                        value={formData.bankBranch}
                        onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                        placeholder="e.g. Kitale Branch (Code 028)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payment Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.paymentPurpose}
                    onChange={(e) => setFormData({ ...formData, paymentPurpose: e.target.value })}
                    placeholder="e.g. JJSAK Annual Licensing"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Account / Reference Instructions (Public to Schools) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountReferenceInstructions}
                    onChange={(e) => setFormData({ ...formData, accountReferenceInstructions: e.target.value })}
                    placeholder="e.g. Enter your School Code e.g. NJS-30200 as Account Number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Internal Description & Settlement Notes (Owner Only)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.internalDescription}
                    onChange={(e) => setFormData({ ...formData, internalDescription: e.target.value })}
                    placeholder="Owner confidential notes regarding bank settlements or Safaricom liaison..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="isPrimaryCheck"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isPrimaryCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Designate this channel as PRIMARY (Featured first in all school portals)
                  </label>
                </div>
              </div>

              {/* Owner 2FA Gate */}
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-amber-900">
                    Owner Security Authentication (2FA Required)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Modifying official subscription collection destinations requires valid Owner authentication.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-amber-950 block mb-1">
                      Reason for Adding Channel
                    </label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Addition of Safaricom Paybill channel"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-950 block mb-1">
                      Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={authPin}
                      onChange={(e) => setAuthPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('channels')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save & Activate Channel</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: VERIFICATION QUEUE (Owner Validation Authority) */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Owner Payment Validation Authority &amp; Reconciliation:
                  </p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    School users submit payment notifications which are queued under PENDING VALIDATION. Only the Owner/Super Administrator has authority to validate, approve, or reject transactions against Safaricom M-Pesa Business Number 0741478813 statements. Validating a transaction automatically updates the school&apos;s subscription and issues an immutable official receipt.
                  </p>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Filter:</span>
                {[
                  { id: 'ALL', label: `All (${transactions.length})` },
                  { id: 'PENDING', label: `Pending Validation (${transactions.filter((t) => t.verificationStatus === 'PENDING_VALIDATION' || t.verificationStatus === 'ENTERED_UNVERIFIED').length})` },
                  { id: 'REVIEW', label: `Under Review (${transactions.filter((t) => t.verificationStatus === 'UNDER_REVIEW').length})` },
                  { id: 'VALIDATED', label: `Validated (${transactions.filter((t) => t.verificationStatus === 'VALIDATED' || t.verificationStatus === 'VERIFIED_ACTIVE').length})` },
                  { id: 'REJECTED', label: `Rejected (${transactions.filter((t) => t.verificationStatus === 'REJECTED').length})` },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilterStatus(chip.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      filterStatus === chip.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {transactions
                  .filter((tx) => {
                    if (filterStatus === 'PENDING') {
                      return tx.verificationStatus === 'PENDING_VALIDATION' || tx.verificationStatus === 'ENTERED_UNVERIFIED';
                    }
                    if (filterStatus === 'REVIEW') {
                      return tx.verificationStatus === 'UNDER_REVIEW';
                    }
                    if (filterStatus === 'VALIDATED') {
                      return tx.verificationStatus === 'VALIDATED' || tx.verificationStatus === 'VERIFIED_ACTIVE';
                    }
                    if (filterStatus === 'REJECTED') {
                      return tx.verificationStatus === 'REJECTED';
                    }
                    return true;
                  })
                  .map((tx) => {
                    const isValidated = tx.verificationStatus === 'VALIDATED' || tx.verificationStatus === 'VERIFIED_ACTIVE';
                    const isRejected = tx.verificationStatus === 'REJECTED';
                    const isReview = tx.verificationStatus === 'UNDER_REVIEW';
                    const isPending = tx.verificationStatus === 'PENDING_VALIDATION' || tx.verificationStatus === 'ENTERED_UNVERIFIED';

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {tx.paymentReferenceNumber || tx.transactionReference}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                                isValidated
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isReview
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : isRejected
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {isValidated && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                              {isReview && <Search className="w-3 h-3 text-blue-700" />}
                              {isRejected && <AlertTriangle className="w-3 h-3 text-red-700" />}
                              {isPending && <Clock className="w-3 h-3 text-amber-700" />}
                              <span>
                                {isValidated
                                  ? 'VALIDATED'
                                  : isReview
                                  ? 'UNDER REVIEW'
                                  : isRejected
                                  ? 'REJECTED'
                                  : 'PENDING VALIDATION'}
                              </span>
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {tx.schoolName} ({tx.schoolCode || tx.schoolId})
                            </span>
                          </div>

                          <span className="font-mono font-black text-sm text-[#C51E28]">
                            {tx.currency} {tx.amount.toLocaleString()}.00
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block">M-Pesa Code:</span>
                            <span className="font-mono font-bold text-slate-900">{tx.mpesaTransactionCode || tx.transactionReference}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Submitted By:</span>
                            <span className="font-medium text-slate-800">{tx.submittedByUserName || 'Staff'} ({tx.submittedByUserRole || 'ADMIN'})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Period / Invoice:</span>
                            <span className="font-medium text-slate-800">{tx.subscriptionPeriod}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Submitted At:</span>
                            <span className="font-medium text-slate-800">{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                        </div>

                        {tx.ownerRemarks && (
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            Owner Remarks: {tx.ownerRemarks}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Target Channel: {tx.channelSnapshot}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTx(tx);
                                setVerificationOutcome('VALIDATED');
                                setActionReason('Verified against Safaricom M-Pesa statement for Business 0741478813.');
                                setAuthPin('');
                                setModalError(null);
                                setIsVerifyTxModalOpen(true);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Validate &amp; Reconcile</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTx(tx);
                                setVerificationOutcome('UNDER_REVIEW');
                                setActionReason('Requested clarification from school on M-Pesa confirmation SMS.');
                                setAuthPin('');
                                setModalError(null);
                                setIsVerifyTxModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1"
                            >
                              <Search className="w-3 h-3" />
                              <span>Place Under Review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTx(tx);
                                setVerificationOutcome('REJECTED');
                                setActionReason('M-Pesa reference code not found in Safaricom 0741478813 transaction log.');
                                setAuthPin('');
                                setModalError(null);
                                setIsVerifyTxModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT & HISTORY (Rule 5 & 13) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Immutable Audit Log (Rule 13):</strong> Every channel addition, replacement, parameter change, and emergency deactivation is cryptographically logged with user identity, reason, and parameter snapshots.
                </span>
              </div>

              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            record.actionType === 'EMERGENCY_DEACTIVATED'
                              ? 'bg-red-100 text-red-800'
                              : record.actionType === 'REPLACED'
                              ? 'bg-amber-100 text-amber-800'
                              : record.actionType === 'PRIMARY_DESIGNATED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {record.actionType}
                        </span>
                        <span className="font-bold text-slate-900">{record.channelName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium bg-slate-50 p-2 rounded border border-slate-100">
                      Reason: "{record.reason}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Author: <strong className="text-slate-700">{record.modifiedByUserName}</strong></span>
                      <span>Auth Method: <span className="font-mono">{record.authMethod || 'OWNER_2FA_PIN'}</span></span>
                      <span>Log ID: <span className="font-mono">{record.id}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Platform-Level Subscription Payment Destination • Tenant-Isolated</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* MODAL: EMERGENCY DEACTIVATION CONFIRMATION */}
      {isEmergencyModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <BadgeAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-900">EMERGENCY CHANNEL DEACTIVATION</h3>
                <p className="text-[11px] text-slate-500 font-medium">Immediate deactivation of compromised or obsolete channel</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800">
              You are about to immediately deactivate: <strong>{selectedChannel.providerName} ({selectedChannel.accountName})</strong>. All schools will immediately stop seeing this channel on their portals.
            </div>

            {modalError && (
              <p className="text-xs text-red-700 font-bold">{modalError}</p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Reason for Emergency Action <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Account compromise or provider routing dispute"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span>
                </label>
                <input
                  type="password"
                  required
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyDeactivateSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <BadgeAlert className="w-4 h-4" />
                <span>Confirm Immediate Deactivation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CHANNEL */}
      {isEditModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Edit Payment Channel</h3>
                <p className="text-[11px] text-slate-500 font-medium">Updating {selectedChannel.providerName}</p>
              </div>
            </div>

            {modalError && (
              <p className="text-xs text-red-700 font-bold">{modalError}</p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Provider Name</label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              {selectedChannel.method === 'MPESA_PAYBILL' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paybill Number</label>
                  <input
                    type="text"
                    value={formData.paybillNumber}
                    onChange={(e) => setFormData({ ...formData, paybillNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              {selectedChannel.method === 'MPESA_TILL' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Till Number</label>
                  <input
                    type="text"
                    value={formData.tillNumber}
                    onChange={(e) => setFormData({ ...formData, tillNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              {selectedChannel.method === 'BANK_TRANSFER' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reference Instructions</label>
                <input
                  type="text"
                  value={formData.accountReferenceInstructions}
                  onChange={(e) => setFormData({ ...formData, accountReferenceInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentChannelStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                  <option value="REPLACED">REPLACED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Update</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Corrected reference instructions"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span>
                </label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPLACE CHANNEL */}
      {isReplaceModalOpen && selectedChannel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Replace Payment Channel</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Decommissions {selectedChannel.providerName} and seamlessly activates replacement
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Rule 6 (Historical Payment Protection):</strong> Previous transactions remain permanently tied to original coordinates and will never be corrupted or altered.
            </div>

            {modalError && (
              <p className="text-xs text-red-700 font-bold">{modalError}</p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Provider / Bank Name</label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Official Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              {formData.method === 'MPESA_PAYBILL' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Paybill Number</label>
                  <input
                    type="text"
                    value={formData.paybillNumber}
                    onChange={(e) => setFormData({ ...formData, paybillNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Till Number</label>
                  <input
                    type="text"
                    value={formData.tillNumber}
                    onChange={(e) => setFormData({ ...formData, tillNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Reference Instructions</label>
                <input
                  type="text"
                  value={formData.accountReferenceInstructions}
                  onChange={(e) => setFormData({ ...formData, accountReferenceInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Replacement Reason (Audit Log)</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span>
                </label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplaceSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs"
              >
                Confirm Replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OWNER VALIDATION CONFIRMATION DIALOG */}
      {isVerifyTxModalOpen && selectedTx && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  verificationOutcome === 'VALIDATED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : verificationOutcome === 'UNDER_REVIEW'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {verificationOutcome === 'VALIDATED' && <CheckCircle2 className="w-6 h-6" />}
                {verificationOutcome === 'UNDER_REVIEW' && <Search className="w-6 h-6" />}
                {verificationOutcome === 'REJECTED' && <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Owner Payment Validation Decision
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Authoritative validation against Safaricom M-Pesa Business 0741478813
                </p>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Transaction summary card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">School:</span>
                <span className="font-bold text-slate-900">{selectedTx.schoolName} ({selectedTx.schoolCode || selectedTx.schoolId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.paymentReferenceNumber || selectedTx.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">M-Pesa Code:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.mpesaTransactionCode || selectedTx.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-[#C51E28]">{selectedTx.currency} {selectedTx.amount.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted By:</span>
                <span className="text-slate-800">{selectedTx.submittedByUserName} ({selectedTx.submittedByUserRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice / Period:</span>
                <span className="text-slate-800">{selectedTx.subscriptionPeriod}</span>
              </div>
            </div>

            <form onSubmit={handleValidateTxSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select Validation Outcome
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationOutcome('VALIDATED')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      verificationOutcome === 'VALIDATED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Validate &amp; Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationOutcome('UNDER_REVIEW')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      verificationOutcome === 'UNDER_REVIEW'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Place Under Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationOutcome('REJECTED')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      verificationOutcome === 'REJECTED'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Safaricom C2B / Daraja Clearing Reference (Optional)
                </label>
                <input
                  type="text"
                  value={darajaCode}
                  onChange={(e) => setDarajaCode(e.target.value)}
                  placeholder="e.g. C2B-2026-MPESA-8813"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner Audit Remarks / Clearing Notes *
                </label>
                <textarea
                  required
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Record provider statement details or verification notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span> *
                </label>
                <input
                  type="password"
                  required
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit Owner PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyTxModalOpen(false);
                    setSelectedTx(null);
                    setModalError(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    verificationOutcome === 'VALIDATED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : verificationOutcome === 'UNDER_REVIEW'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {verificationOutcome === 'VALIDATED' && <CheckCircle2 className="w-4 h-4" />}
                  {verificationOutcome === 'UNDER_REVIEW' && <Search className="w-4 h-4" />}
                  {verificationOutcome === 'REJECTED' && <XCircle className="w-4 h-4" />}
                  <span>
                    {verificationOutcome === 'VALIDATED'
                      ? 'Confirm & Issue Official Receipt'
                      : verificationOutcome === 'UNDER_REVIEW'
                      ? 'Save Under Review Status'
                      : 'Confirm Rejection'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLEAN SLATE POLICY RESET DIALOG */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 sm:p-6 border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Enforce Clean Slate Policy
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Purge all legacy payment channels &amp; enforce verified accounts
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1.5">
              <p className="font-bold">Important Security Action:</p>
              <p className="text-[11px] text-red-800 leading-relaxed">
                This will immediately purge/deactivate all previous mock, test, and unverified payment channels. The system will establish <strong>Safaricom M-Pesa Business Number 0741478813</strong> as the sole verified primary destination for JJSAK subscription collections.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleResetAllLegacyChannels} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Audit Justification *
                </label>
                <input
                  type="text"
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enforce JJSAK Clean Slate Policy on payment channels"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner Security PIN <span className="text-red-600 font-mono">({OWNER_SECURITY_PIN})</span> *
                </label>
                <input
                  type="password"
                  required
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit Owner PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs tracking-widest text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setModalError(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Execute Clean Slate Reset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
