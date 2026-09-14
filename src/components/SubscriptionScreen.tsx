import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Calendar,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Building2,
  Settings,
  ShieldAlert,
  FileText,
  Receipt,
  History,
  Printer,
  ChevronRight,
  Clock,
  Send,
  Search,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { SchoolSubscription, SubscriptionActivation, User as UserType, SchoolTenant } from '../types';
import { isOwnerOrSuperAdmin } from '../utils/platformGovernance';
import { subscriptionPaymentService } from '../services/subscriptionPaymentService';
import {
  PublicPaymentChannelInfo,
  SubscriptionTransactionRecord,
  isAuthorizedSubscriptionRole,
} from '../types/paymentChannels';
import { OwnerPaymentConfigurationModal } from './subscription/OwnerPaymentConfigurationModal';
import {
  InstitutionalSubscription,
  PaymentPlanOption,
  SubscriptionInvoice,
  SubscriptionReceipt,
  SubscriptionAuditEntry,
  SubscriptionStatus,
} from '../types/subscriptionFramework';
import {
  institutionalSubscriptionService,
  APPROVED_LEARNER_ANNUAL_RATE,
} from '../services/institutionalSubscriptionService';
import { InvoiceViewModal } from './subscription/InvoiceViewModal';
import { ReceiptViewModal } from './subscription/ReceiptViewModal';
import { SubscriptionStatusModal } from './subscription/SubscriptionStatusModal';
import { PaymentVerificationModal } from './subscription/PaymentVerificationModal';

interface SubscriptionScreenProps {
  subscription: SchoolSubscription;
  currentUser: UserType;
  activeTenant?: SchoolTenant;
  activeTenantId?: string;
  totalRegisteredLearners?: number;
  onActivateSubscription: (activation: SubscriptionActivation) => void;
  onBack: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  subscription,
  currentUser,
  activeTenant,
  activeTenantId,
  totalRegisteredLearners = 256,
  onActivateSubscription: _onActivateSubscription,
  onBack,
  onLogAudit,
}) => {
  const isOwner = isOwnerOrSuperAdmin(currentUser);
  const isAuthorizedRole = isAuthorizedSubscriptionRole(currentUser?.role) || isOwner;

  // Determine current isolated school ID and Name
  const targetSchoolId =
    currentUser.schoolId || activeTenantId || activeTenant?.schoolId || '';
  const targetSchoolName =
    activeTenant?.schoolName || subscription.schoolName || 'JJSAK Educational Institution';
  const targetSchoolCode = activeTenant?.schoolCode || 'JJSAK-001';

  // Institutional Subscription Model State
  const [instSub, setInstSub] = useState<InstitutionalSubscription>(() => {
    return institutionalSubscriptionService.getSchoolSubscription(
      targetSchoolId,
      targetSchoolName,
      targetSchoolCode,
      totalRegisteredLearners
    );
  });

  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>(() => {
    return institutionalSubscriptionService.getSchoolInvoices(targetSchoolId);
  });

  const [receipts, setReceipts] = useState<SubscriptionReceipt[]>(() => {
    return institutionalSubscriptionService.getSchoolReceipts(targetSchoolId);
  });

  const [auditTrail, setAuditTrail] = useState<SubscriptionAuditEntry[]>(() => {
    return institutionalSubscriptionService.getSchoolAuditLogs(targetSchoolId);
  });

  const [schoolTransactions, setSchoolTransactions] = useState<SubscriptionTransactionRecord[]>(() => {
    return subscriptionPaymentService.getSchoolTransactions(targetSchoolId);
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBMISSIONS' | 'PLANS' | 'INVOICES' | 'RECEIPTS' | 'AUDIT'>('OVERVIEW');

  // Selected payment plan option (Annual or Installment)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanOption>('ANNUAL');

  // Active channels
  const [activeChannels, setActiveChannels] = useState<PublicPaymentChannelInfo[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<SubscriptionReceipt | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOwnerConfigOpen, setIsOwnerConfigOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Refresh subscriptions and channels
  const refreshData = () => {
    setInstSub(
      institutionalSubscriptionService.getSchoolSubscription(
        targetSchoolId,
        targetSchoolName,
        targetSchoolCode,
        totalRegisteredLearners
      )
    );
    setInvoices(institutionalSubscriptionService.getSchoolInvoices(targetSchoolId));
    setReceipts(institutionalSubscriptionService.getSchoolReceipts(targetSchoolId));
    setAuditTrail(institutionalSubscriptionService.getSchoolAuditLogs(targetSchoolId));
    setActiveChannels(subscriptionPaymentService.getPublicActivePaymentChannels());
    setSchoolTransactions(subscriptionPaymentService.getSchoolTransactions(targetSchoolId));
  };

  useEffect(() => {
    refreshData();
    const unsubPay = subscriptionPaymentService.subscribe(refreshData);
    const unsubInst = institutionalSubscriptionService.subscribe(refreshData);
    return () => {
      unsubPay();
      unsubInst();
    };
  }, [targetSchoolId, totalRegisteredLearners]);

  const plans = institutionalSubscriptionService.calculatePlanBreakdowns(instSub.activeLearnerCount);
  const currentSelectedPlan = plans[selectedPlan];

  // Trial calculations
  const now = Date.now();
  const isTrial = instSub.status === 'TRIAL';
  const trialDaysRemaining = Math.max(0, Math.ceil((instSub.trialEndDate - now) / 86400000));
  const licensedDaysRemaining = instSub.subscriptionEndDate
    ? Math.max(0, Math.ceil((instSub.subscriptionEndDate - now) / 86400000))
    : 0;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate Invoice Action
  const handleGenerateInvoice = () => {
    const inv = institutionalSubscriptionService.generateInvoice(
      targetSchoolId,
      selectedPlan,
      currentUser.fullName || 'Authorized Staff',
      currentUser.role || 'HEAD_OF_INSTITUTION'
    );
    refreshData();
    setSelectedInvoice(inv);
    setActionSuccessNotice(`Invoice ${inv.id} generated successfully!`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  // Status Badge Helper
  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'TRIAL':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            TRIAL (1-TERM FREE)
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ACTIVE SUBSCRIPTION
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            PENDING PAYMENT
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            PARTIALLY PAID
          </span>
        );
      case 'FULLY_PAID':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
            FULLY PAID (100%)
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white">
            SUSPENDED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
            EXPIRED
          </span>
        );
    }
  };

  // 1. STRICT ACCESS CONTROL POLICY CHECK:
  // Access to the Subscription Portal shall be restricted to institution-level roles only:
  // • Head of Institution
  // • Deputy Head of Institution
  // • Director of Academics
  // No other role shall be permitted.
  if (!isAuthorizedRole) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-200 overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-3">
              Subscription Portal Access Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              JJSAK Institutional Governance &amp; Payment Authorization Policy
            </p>
          </div>

          <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 text-left text-xs space-y-2.5 text-slate-700">
            <p className="font-semibold text-slate-800">
              Access to the JJSAK Subscription Portal is restricted to the following institution-level roles only:
            </p>
            <ul className="list-disc pl-5 font-bold text-slate-900 space-y-1 text-xs">
              <li>Head of Institution</li>
              <li>Deputy Head of Institution</li>
              <li>Director of Academics</li>
            </ul>
            <div className="pt-2 border-t border-red-200 text-xs">
              <span className="text-slate-500 block">Your Current Account:</span>
              <span className="font-bold text-slate-900">{currentUser.fullName}</span> (Role:{' '}
              <span className="font-mono text-red-700 font-bold">{currentUser.role}</span>)
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              No other school-level role is permitted to access subscription status, invoices, receipts, or initiate payments. Roles explicitly denied access include School Administrator, Finance Officer/Bursar, Teachers, Learners/Students, Parents/Guardians, and Support Staff.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to School Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-28 select-none">
      {/* Top Red Header Bar */}
      <div className="bg-[#C51E28] text-white pt-4 pb-6 px-4 sm:px-6 shadow-md rounded-b-[24px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
            title="Back to School Portal"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-red-200" />
              <span>Institutional Subscriptions</span>
            </h1>
            <span className="text-[11px] text-red-100 font-medium">
              Authorized Institution Access • Owner Validation Framework
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* School Identifier & Tenant Isolation Pill */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{instSub.schoolName}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/20 font-mono text-[11px] font-bold">
            Code: {instSub.schoolCode}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider">
            Tenant Isolated
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-4 py-4 sm:px-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Action Notice */}
        {actionSuccessNotice && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {/* Owner Payment Channel Management Banner */}
        {isOwner && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                    Platform Owner Exclusive
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">SCMH 2.X Revenue Core</span>
                </div>
                <h3 className="text-xs font-black text-white mt-0.5">
                  Payment Accounts Governance &amp; Validation Queue
                </h3>
                <p className="text-[11px] text-slate-300">
                  Manage verified M-Pesa Business destinations and validate pending school payments.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOwnerConfigOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Owner Payment Console</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: '1. Overview & Balance', icon: ShieldCheck },
            { id: 'SUBMISSIONS', label: `2. Submitted Payments (${schoolTransactions.length})`, icon: Clock },
            { id: 'PLANS', label: '3. Plans & Schedules', icon: CreditCard },
            { id: 'INVOICES', label: `4. Invoices (${invoices.length})`, icon: FileText },
            { id: 'RECEIPTS', label: `5. Official Receipts (${receipts.length})`, icon: Receipt },
            { id: 'AUDIT', label: `6. Audit Trail (${auditTrail.length})`, icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#C51E28] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SUBSCRIPTION OVERVIEW & BALANCE */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Free Trial Banner / Status Notification */}
            {isTrial ? (
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 border border-blue-700 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-black shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/40 text-blue-200 px-2 py-0.5 rounded">
                          Approved Courtesy Trial
                        </span>
                        <span className="text-[11px] font-mono text-blue-300">
                          {trialDaysRemaining} Days Remaining
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white mt-0.5">
                        One-Term Free Trial Active
                      </h3>
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:border-blue-700/80 sm:pl-4">
                    <span className="text-[10px] text-blue-300 block">Trial Rate:</span>
                    <span className="text-base font-black text-emerald-400">
                      KES 0.00 (Exempt)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-blue-100 font-medium leading-relaxed bg-blue-950/40 p-3 rounded-xl border border-blue-800/60">
                  <strong>JJSAK Policy:</strong> Every newly activated school receives a one-term free trial (120 days). No learner-based subscription charges are applied during this approved trial window. All academic and administrative modules are fully unlocked.
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-blue-200">
                    <span>Trial Progress</span>
                    <span>{trialDaysRemaining} days remaining of 120-day term</span>
                  </div>
                  <div className="w-full bg-blue-950 rounded-full h-2 overflow-hidden border border-blue-800">
                    <div
                      className="bg-blue-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(5, (trialDaysRemaining / 120) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-black shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded">
                      {instSub.status}
                    </span>
                    <h3 className="text-sm font-black text-white mt-0.5">
                      JJSAK Institutional License Active
                    </h3>
                    <p className="text-xs text-emerald-200">
                      Coverage: {instSub.currentBillingPeriod}
                    </p>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-emerald-700 sm:pl-4">
                  <span className="text-[10px] text-emerald-300 block">License Remaining:</span>
                  <span className="text-base font-black text-white font-mono">
                    {licensedDaysRemaining} Days
                  </span>
                </div>
              </div>
            )}

            {/* 10 Required Information Display Grid */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C51E28] flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      Subscription Information Matrix
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Approved JJSAK Pricing: KES {APPROVED_LEARNER_ANNUAL_RATE}.00 per registered learner per year
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                    <span>Status &amp; Learner Controls</span>
                  </button>
                )}
              </div>

              {/* 10 Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. Active Learner Count */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    1. Active Learner Count
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {instSub.activeLearnerCount}
                    </span>
                    <span className="text-[10px] text-slate-500">Learners Enrolled</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Live from Admission Ledger
                  </span>
                </div>

                {/* 2. Rate per Learner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    2. Rate per Learner
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      KES {APPROVED_LEARNER_ANNUAL_RATE}.00
                    </span>
                    <span className="text-[10px] text-slate-500">/ Learner / Year</span>
                  </div>
                  <span className="text-[9px] text-emerald-700 font-medium block mt-0.5">
                    Official Universal Standard Rate
                  </span>
                </div>

                {/* 3. Total Annual Cost */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    3. Total Annual Subscription
                  </span>
                  <p className="text-xl font-black text-[#C51E28] font-mono mt-1">
                    KES {(instSub.activeLearnerCount * APPROVED_LEARNER_ANNUAL_RATE).toLocaleString()}.00
                  </p>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    {instSub.activeLearnerCount} × KES {APPROVED_LEARNER_ANNUAL_RATE}
                  </span>
                </div>

                {/* 4. Current Billing Period */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    4. Current Billing Period
                  </span>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {instSub.currentBillingPeriod}
                  </p>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Academic Year 2026 Cycle
                  </span>
                </div>

                {/* 5. Subscription Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    5. Subscription Status
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(instSub.status)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium block mt-1">
                    Institutional License State
                  </span>
                </div>

                {/* 6. Payment Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    6. Payment Status
                  </span>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {instSub.paymentStatus}
                  </p>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    {isTrial ? 'Trial Courtesy Exemption' : 'Ledger Verified'}
                  </span>
                </div>

                {/* 7. Amount Due */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    7. Amount Due
                  </span>
                  <p className="text-lg font-black text-slate-900 font-mono mt-1">
                    KES {instSub.amountDue.toLocaleString()}.00
                  </p>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    {isTrial ? 'KES 0.00 during free trial' : 'Current period due'}
                  </span>
                </div>

                {/* 8. Amount Paid */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    8. Amount Paid
                  </span>
                  <p className="text-lg font-black text-emerald-700 font-mono mt-1">
                    KES {instSub.amountPaid.toLocaleString()}.00
                  </p>
                  <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">
                    Owner verified &amp; reconciled
                  </span>
                </div>

                {/* 9. Outstanding Balance */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    9. Outstanding Balance
                  </span>
                  <p className="text-lg font-black text-[#C51E28] font-mono mt-1">
                    KES {instSub.outstandingBalance.toLocaleString()}.00
                  </p>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Remaining unpaid balance
                  </span>
                </div>

                {/* 10. Next Due Date */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2 lg:col-span-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    10. Next Due Date
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#C51E28]" />
                      <span>{new Date(instSub.nextDueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isTrial
                        ? `${trialDaysRemaining} days remaining in trial`
                        : 'Scheduled installment / renewal deadline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Official Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Subscription Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('SUBMISSIONS')}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Track Validation Status ({schoolTransactions.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('PLANS')}
                  className="text-xs text-[#C51E28] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View 3-Term Installment Schedule</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Approved Official Payment Destination Channels */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C51E28]" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Official Verified Payment Channel
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Owner Verified Destination
                </span>
              </div>

              {/* Policy Governance Callout */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Payment Validation &amp; Governance Policy:</strong>
                  All school payments must be sent to the official verified M-Pesa Business Number below. When you submit payment details, your transaction is assigned status <span className="font-mono font-bold bg-amber-200 px-1 py-0.2 rounded">PENDING VALIDATION</span> and queued for Owner verification. School officials do not possess authority to self-verify or approve payments.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeChannels.map((channel) => {
                  const copyTarget = channel.businessNumber || channel.paybillNumber || channel.tillNumber || '0741478813';

                  return (
                    <div
                      key={channel.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            M
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              {channel.providerName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {channel.accountName}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                          VERIFIED
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Business Number:</span>
                          <span className="font-mono text-sm font-black text-slate-900">
                            {channel.businessNumber || '0741478813'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(copyTarget, channel.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Copy Business Number"
                        >
                          {copiedField === channel.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-600 italic">
                        Account / Reference: {channel.accountReferenceInstructions}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMITTED PAYMENTS & OWNER VALIDATION TRACKER */}
        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Submitted Payments &amp; Owner Validation Queue</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track payment submissions and official Owner validation outcomes in real time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>+ Submit New Payment</span>
              </button>
            </div>

            {/* Workflow Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <strong className="text-slate-800 block">Owner Validation Life Cycle:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block">1. PENDING VALIDATION</span>
                  Payment recorded; Owner notified across In-App, Email, SMS &amp; WhatsApp.
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                  <span className="font-bold block">2. UNDER REVIEW</span>
                  Owner actively matching reference against Safaricom M-Pesa statements.
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold block">3. VALIDATED</span>
                  Funds confirmed; balance updated and immutable official receipt generated.
                </div>
              </div>
            </div>

            {schoolTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-3">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold">No Payment Submissions Recorded Yet</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  When you make a payment to M-Pesa Business Number 0741478813, click &quot;Submit New Payment&quot; to queue it for Owner validation.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2 bg-[#C51E28] text-white rounded-xl font-bold text-xs"
                >
                  Submit First Payment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {schoolTransactions.map((tx) => {
                  const isValidated = tx.verificationStatus === 'VALIDATED';
                  const isPending = tx.verificationStatus === 'PENDING_VALIDATION' || tx.verificationStatus === 'ENTERED_UNVERIFIED';
                  const isReview = tx.verificationStatus === 'UNDER_REVIEW';
                  const isRejected = tx.verificationStatus === 'REJECTED';

                  return (
                    <div
                      key={tx.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition space-y-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {tx.paymentReferenceNumber || tx.id}
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
                                ? 'VALIDATED & RECONCILED'
                                : isReview
                                ? 'UNDER OWNER REVIEW'
                                : isRejected
                                ? 'REJECTED BY OWNER'
                                : 'PENDING VALIDATION'}
                            </span>
                          </span>
                        </div>

                        <span className="font-mono font-black text-sm text-[#C51E28]">
                          KES {tx.amount.toLocaleString()}.00
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">M-Pesa Transaction Code:</span>
                          <span className="font-mono font-bold text-slate-900">{tx.mpesaTransactionCode || tx.transactionReference}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Destination Channel:</span>
                          <span className="font-medium text-slate-800">{tx.channelSnapshot}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Submitted By:</span>
                          <span className="font-medium text-slate-800">
                            {tx.submittedByUserName} ({tx.submittedByUserRole})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Submission Date:</span>
                          <span className="font-medium text-slate-800">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Owner Remarks / Validation Details */}
                      {tx.ownerRemarks && (
                        <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] space-y-0.5">
                          <span className="text-slate-500 font-bold block">Owner Remarks:</span>
                          <p className="text-slate-800 italic">{tx.ownerRemarks}</p>
                          {tx.validatedAt && (
                            <span className="text-[10px] text-slate-400 block">
                              Validated on {new Date(tx.validatedAt).toLocaleString()} by {tx.verifiedBy || 'System Owner'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action for Validated Transactions */}
                      {isValidated && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const matchingReceipt = receipts.find(
                                (r) => r.transactionReference === tx.mpesaTransactionCode || r.transactionReference === tx.transactionReference
                              ) || receipts[0];
                              if (matchingReceipt) setSelectedReceipt(matchingReceipt);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Official Validated Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT PLANS & 3-TERM INSTALLMENT BREAKDOWN */}
        {activeTab === 'PLANS' && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C51E28]" />
                <span>Payment Options &amp; Installment Schedules</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Approved Annual (100%) or Term Installments (Term 1: 40%, Term 2: 40%, Term 3: 20%)
              </p>
            </div>

            {/* Active Learner Count Metric */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Active Learner Count: {instSub.activeLearnerCount}
                </span>
                <span className="text-[10px] text-slate-500">
                  Calculation Base: {instSub.activeLearnerCount} learners × KES {APPROVED_LEARNER_ANNUAL_RATE} = KES {(instSub.activeLearnerCount * APPROVED_LEARNER_ANNUAL_RATE).toLocaleString()} / year
                </span>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 transition cursor-pointer"
                >
                  Adjust Learner Count
                </button>
              )}
            </div>

            {/* 4 Plan Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Annual 100% */}
              <div
                onClick={() => setSelectedPlan('ANNUAL')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition relative ${
                  selectedPlan === 'ANNUAL'
                    ? 'bg-red-50/80 border-[#C51E28] ring-2 ring-[#C51E28]/40 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">
                    Annual Payment (100%)
                  </span>
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xl font-black text-[#C51E28] font-mono">
                  KES {plans.ANNUAL.amount.toLocaleString()}.00
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {plans.ANNUAL.description}
                </p>
                <span className="text-[10px] font-bold text-emerald-700 block mt-2">
                  Coverage: Full Year (Terms 1, 2 &amp; 3)
                </span>
              </div>

              {/* Option 2: Term 1 (40%) */}
              <div
                onClick={() => setSelectedPlan('TERM_1')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition relative ${
                  selectedPlan === 'TERM_1'
                    ? 'bg-red-50/80 border-[#C51E28] ring-2 ring-[#C51E28]/40 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">
                    Term 1 Installment (40%)
                  </span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Installment 1
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">
                  KES {plans.TERM_1.amount.toLocaleString()}.00
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {plans.TERM_1.description}
                </p>
                <span className="text-[10px] font-bold text-blue-700 block mt-2">
                  Coverage: Term 1 (40% of annual fee)
                </span>
              </div>

              {/* Option 3: Term 2 (40%) */}
              <div
                onClick={() => setSelectedPlan('TERM_2')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition relative ${
                  selectedPlan === 'TERM_2'
                    ? 'bg-red-50/80 border-[#C51E28] ring-2 ring-[#C51E28]/40 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">
                    Term 2 Installment (40%)
                  </span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Installment 2
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">
                  KES {plans.TERM_2.amount.toLocaleString()}.00
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {plans.TERM_2.description}
                </p>
                <span className="text-[10px] font-bold text-blue-700 block mt-2">
                  Coverage: Term 2 (40% of annual fee)
                </span>
              </div>

              {/* Option 4: Term 3 (20%) */}
              <div
                onClick={() => setSelectedPlan('TERM_3')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition relative ${
                  selectedPlan === 'TERM_3'
                    ? 'bg-red-50/80 border-[#C51E28] ring-2 ring-[#C51E28]/40 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">
                    Term 3 Installment (20%)
                  </span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Installment 3
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">
                  KES {plans.TERM_3.amount.toLocaleString()}.00
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {plans.TERM_3.description}
                </p>
                <span className="text-[10px] font-bold text-blue-700 block mt-2">
                  Coverage: Term 3 Completion (20% of annual fee)
                </span>
              </div>
            </div>

            {/* Plan Action Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Selected: <strong>{currentSelectedPlan.title}</strong>
                </span>
                <span className="font-mono text-base font-black text-[#C51E28]">
                  KES {currentSelectedPlan.amount.toLocaleString()}.00
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Payment for this Plan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INVOICE MANAGEMENT & IMMUTABLE SNAPSHOTS */}
        {activeTab === 'INVOICES' && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C51E28]" />
                  <span>Invoice Management &amp; History</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official immutable snapshots and downloadable printable invoices
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ New Invoice</span>
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold">No Invoices Found for {instSub.schoolName}</p>
                <p className="text-[11px]">Click &quot;+ New Invoice&quot; to generate an official immutable invoice.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {inv.id}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.trialCredit > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status === 'PAID'
                            ? 'PAID'
                            : inv.trialCredit > 0
                            ? 'FREE TRIAL EXEMPT'
                            : 'PAYMENT DUE'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Immutable
                        </span>
                      </div>
                      <p className="text-slate-700 font-bold text-xs">
                        {inv.planTitle} • {inv.activeLearnersSnapshot} Active Learners
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Issued: {new Date(inv.issueDate).toLocaleDateString()} • Due: {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Payable:</span>
                        <span className="font-mono font-black text-sm text-[#C51E28]">
                          KES {inv.totalPayable.toLocaleString()}.00
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>View / Print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYMENT RECEIPTS HISTORY */}
        {activeTab === 'RECEIPTS' && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Verified Payment Receipt History</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable electronic receipts issued solely upon official Owner validation against M-Pesa statements
              </p>
            </div>

            {receipts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold">No Verified Payment Receipts Yet</p>
                <p className="text-[11px]">Official receipts are automatically generated once submitted payments are verified and approved by the Owner.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {receipts.map((rct) => (
                  <div
                    key={rct.id}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-xs">
                          {rct.id}
                        </span>
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                          OWNER RECONCILED
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ref: {rct.transactionReference}
                        </span>
                      </div>
                      <p className="text-slate-800 font-bold text-xs">
                        {rct.planOptionTitle} • Channel: {rct.channelSnapshot}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Paid: {new Date(rct.paymentDate).toLocaleDateString()} • Verified by {rct.verifiedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Amount Paid:</span>
                        <span className="font-mono font-black text-sm text-emerald-700">
                          KES {rct.amountPaid.toLocaleString()}.00
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(rct)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: AUDIT LOGS & COMPLIANCE TRAIL */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <span>Subscription Audit &amp; Compliance Trail</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Traceable, immutable records of all balance adjustments, status changes, learner counts, and payments
              </p>
            </div>

            {auditTrail.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No audit entries recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {auditTrail.map((aud) => (
                  <div
                    key={aud.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono">
                          {aud.action}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">
                          by {aud.performedBy} ({aud.performedByRole})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(aud.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {aud.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Invoice Viewer / Print */}
      {selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* MODAL 2: Receipt Viewer / Print */}
      {selectedReceipt && (
        <ReceiptViewModal
          receipt={selectedReceipt}
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* MODAL 3: Subscription Status & Learner Count Controls */}
      {isStatusModalOpen && (
        <SubscriptionStatusModal
          subscription={instSub}
          currentUser={currentUser}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onUpdate={(updated) => {
            setInstSub(updated);
            refreshData();
          }}
        />
      )}

      {/* MODAL 4: Payment Submission Workflow */}
      {isPaymentModalOpen && (
        <PaymentVerificationModal
          subscription={instSub}
          currentUser={currentUser}
          activeChannels={activeChannels}
          selectedPlanOption={selectedPlan}
          selectedPlanAmount={currentSelectedPlan.amount}
          selectedPlanTitle={currentSelectedPlan.title}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSubmitted={(tx) => {
            refreshData();
            setActionSuccessNotice(
              `Payment ref ${tx.paymentReferenceNumber} submitted! Placed into Owner Validation Queue.`
            );
            setActiveTab('SUBMISSIONS');
            if (onLogAudit) {
              onLogAudit(
                'PAYMENT_SUBMITTED',
                `Submitted payment ref ${tx.paymentReferenceNumber} (M-Pesa: ${tx.mpesaTransactionCode}, KES ${tx.amount.toLocaleString()}) for Owner validation.`
              );
            }
          }}
        />
      )}

      {/* MODAL 5: Owner Payment Channel Destination Config */}
      {isOwnerConfigOpen && isOwner && (
        <OwnerPaymentConfigurationModal
          isOpen={isOwnerConfigOpen}
          onClose={() => setIsOwnerConfigOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
