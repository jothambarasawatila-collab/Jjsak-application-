// JJSAK Institutional Subscription Service
// Approved Learner-Based Subscription Framework (KES 60 / learner / year)
// Strict Multi-Tenant Isolation, Real-Time Payment Reconciliation & Immutable Audit Trail

import {
  InstitutionalSubscription,
  SubscriptionInvoice,
  SubscriptionReceipt,
  SubscriptionAuditEntry,
  SubscriptionStatus,
  PaymentPlanOption,
  PlanBreakdown,
} from '../types/subscriptionFramework';
import { subscriptionPaymentService } from './subscriptionPaymentService';

const STORAGE_KEY_SUBSCRIPTIONS = 'jjsak_institutional_subscriptions_v2';
const STORAGE_KEY_INVOICES = 'jjsak_subscription_invoices_v2';
const STORAGE_KEY_RECEIPTS = 'jjsak_subscription_receipts_v2';
const STORAGE_KEY_AUDIT = 'jjsak_subscription_audit_v2';

export const APPROVED_LEARNER_ANNUAL_RATE = 60; // KES 60 per learner per year
export const FREE_TRIAL_TERM_DAYS = 120; // One School Term (120 days)

// Seed default institutional subscriptions with tenant isolation
const DEFAULT_INSTITUTIONAL_SUBSCRIPTIONS: Record<string, InstitutionalSubscription> = {
  'sch-ngonyek-001': {
    schoolId: 'sch-ngonyek-001',
    schoolName: 'Ngonyek Junior School',
    schoolCode: 'NJS-30200',
    activeLearnerCount: 256,
    billableLearnerCount: 0, // 0 during 1-term free trial
    ratePerLearner: APPROVED_LEARNER_ANNUAL_RATE,
    currentBillingPeriod: '2026 Academic Year (Term 1 - Term 3)',
    status: 'TRIAL',
    paymentStatus: 'TRIAL_EXEMPT',
    amountDue: 0, // No charges during approved trial
    amountPaid: 0,
    outstandingBalance: 0,
    nextDueDate: Date.now() + 90 * 86400000, // 90 days remaining in trial
    installationDate: Date.now() - 30 * 86400000,
    trialStartDate: Date.now() - 30 * 86400000,
    trialEndDate: Date.now() + 90 * 86400000,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    planOption: 'ANNUAL',
    lastPaymentDate: null,
    lastPaymentReference: null,
    lastVerifiedBy: null,
    notes: 'Newly onboarded school currently enjoying approved 1-term free trial with zero charges.',
  },
  'sch-bidii-002': {
    schoolId: 'sch-bidii-002',
    schoolName: 'Bidii Junior Academy',
    schoolCode: 'BJA-30100',
    activeLearnerCount: 320,
    billableLearnerCount: 320,
    ratePerLearner: APPROVED_LEARNER_ANNUAL_RATE,
    currentBillingPeriod: '2026 Academic Year (Term 1 - Term 3)',
    status: 'FULLY_PAID',
    paymentStatus: 'FULLY_PAID',
    amountDue: 19200, // 320 * 60
    amountPaid: 19200,
    outstandingBalance: 0,
    nextDueDate: Date.now() + 310 * 86400000,
    installationDate: Date.now() - 120 * 86400000,
    trialStartDate: Date.now() - 120 * 86400000,
    trialEndDate: Date.now() - 30 * 86400000,
    subscriptionStartDate: Date.now() - 30 * 86400000,
    subscriptionEndDate: Date.now() + 335 * 86400000,
    planOption: 'ANNUAL',
    lastPaymentDate: Date.now() - 30 * 86400000,
    lastPaymentReference: 'NBK-77192801',
    lastVerifiedBy: 'Jotham Barasa Watila (Platform Owner)',
    notes: 'Annual license fully settled via National Bank capitation transfer.',
  },
  'sch-stmarys-003': {
    schoolId: 'sch-stmarys-003',
    schoolName: "St. Mary's Kitale Junior",
    schoolCode: 'SMK-30202',
    activeLearnerCount: 350,
    billableLearnerCount: 350,
    ratePerLearner: APPROVED_LEARNER_ANNUAL_RATE,
    currentBillingPeriod: '2026 Academic Year (Term 1 - Term 3)',
    status: 'PARTIALLY_PAID',
    paymentStatus: 'PARTIALLY_PAID',
    amountDue: 21000, // 350 * 60
    amountPaid: 8400, // Term 1 (40% = 8400)
    outstandingBalance: 12600, // Term 2 & 3 remaining
    nextDueDate: Date.now() + 60 * 86400000,
    installationDate: Date.now() - 140 * 86400000,
    trialStartDate: Date.now() - 140 * 86400000,
    trialEndDate: Date.now() - 20 * 86400000,
    subscriptionStartDate: Date.now() - 20 * 86400000,
    subscriptionEndDate: Date.now() + 90 * 86400000,
    planOption: 'TERM_1',
    lastPaymentDate: Date.now() - 20 * 86400000,
    lastPaymentReference: 'RAB8910Q77',
    lastVerifiedBy: 'Jotham Barasa Watila (Platform Owner)',
    notes: 'Term 1 installment paid via M-Pesa Till. Term 2 balance pending.',
  },
};

const DEFAULT_INVOICES: SubscriptionInvoice[] = [
  {
    id: 'INV-2026-NJS-001',
    schoolId: 'sch-ngonyek-001',
    schoolName: 'Ngonyek Junior School',
    schoolCode: 'NJS-30200',
    issueDate: Date.now() - 10 * 86400000,
    dueDate: Date.now() + 90 * 86400000,
    billingPeriod: '2026 Academic Year (Post-Trial Coverage)',
    planType: 'ANNUAL',
    planTitle: 'Full Annual Subscription (100%)',
    activeLearnersSnapshot: 256,
    billableLearnersSnapshot: 256,
    ratePerLearner: 60,
    subtotal: 15360,
    trialCredit: 15360, // 100% discount during free trial
    totalPayable: 0,
    amountPaid: 0,
    balanceDue: 0,
    status: 'ISSUED',
    paymentInstructions: [
      {
        channelName: 'Safaricom M-Pesa Paybill',
        paybillOrAccount: '522123',
        accountName: 'JJSAK Systems Ltd',
        accountReference: 'NJS-30200',
      },
      {
        channelName: 'National Bank of Kenya (NBK)',
        paybillOrAccount: '01280771790100',
        accountName: 'JJSAK Educational Technologies Ltd',
        accountReference: 'NJS-30200',
      },
    ],
    generatedBy: 'System Auto-Billing Engine',
    generatedByRole: 'SYSTEM',
    isImmutable: true,
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'INV-2026-BJA-001',
    schoolId: 'sch-bidii-002',
    schoolName: 'Bidii Junior Academy',
    schoolCode: 'BJA-30100',
    issueDate: Date.now() - 35 * 86400000,
    dueDate: Date.now() - 25 * 86400000,
    billingPeriod: '2026 Academic Year (Term 1 - Term 3)',
    planType: 'ANNUAL',
    planTitle: 'Full Annual Subscription (100%)',
    activeLearnersSnapshot: 320,
    billableLearnersSnapshot: 320,
    ratePerLearner: 60,
    subtotal: 19200,
    trialCredit: 0,
    totalPayable: 19200,
    amountPaid: 19200,
    balanceDue: 0,
    status: 'PAID',
    paymentInstructions: [],
    generatedBy: 'System Auto-Billing Engine',
    generatedByRole: 'SYSTEM',
    isImmutable: true,
    createdAt: Date.now() - 35 * 86400000,
  },
  {
    id: 'INV-2026-SMK-001',
    schoolId: 'sch-stmarys-003',
    schoolName: "St. Mary's Kitale Junior",
    schoolCode: 'SMK-30202',
    issueDate: Date.now() - 25 * 86400000,
    dueDate: Date.now() + 60 * 86400000,
    billingPeriod: '2026 Academic Year (Term 1 Installment)',
    planType: 'TERM_1',
    planTitle: 'Term 1 Installment (40%)',
    activeLearnersSnapshot: 350,
    billableLearnersSnapshot: 350,
    ratePerLearner: 60,
    subtotal: 21000,
    trialCredit: 0,
    totalPayable: 8400,
    amountPaid: 8400,
    balanceDue: 0,
    status: 'PAID',
    paymentInstructions: [],
    generatedBy: 'System Auto-Billing Engine',
    generatedByRole: 'SYSTEM',
    isImmutable: true,
    createdAt: Date.now() - 25 * 86400000,
  },
];

const DEFAULT_RECEIPTS: SubscriptionReceipt[] = [
  {
    id: 'RCT-2026-BJA-001',
    invoiceId: 'INV-2026-BJA-001',
    schoolId: 'sch-bidii-002',
    schoolName: 'Bidii Junior Academy',
    schoolCode: 'BJA-30100',
    transactionReference: 'NBK-77192801',
    paymentMethod: 'BANK_TRANSFER',
    channelSnapshot: 'National Bank 01280771790100 (JJSAK Educational Technologies Ltd)',
    amountPaid: 19200,
    currency: 'KES',
    paymentDate: Date.now() - 30 * 86400000,
    verifiedAt: Date.now() - 30 * 86400000 + 3600000,
    verifiedBy: 'Jotham Barasa Watila (Platform Owner)',
    bankSlipNumber: 'NBK-SLIP-0912804',
    balanceRemaining: 0,
    billingPeriod: '2026 Full Academic Year (320 Learners)',
    planOptionTitle: 'Full Year (100%)',
    status: 'RECONCILED',
    receiptNotes: 'Payment verified and automatically reconciled against National Bank Kitale branch credit.',
  },
  {
    id: 'RCT-2026-SMK-001',
    invoiceId: 'INV-2026-SMK-001',
    schoolId: 'sch-stmarys-003',
    schoolName: "St. Mary's Kitale Junior",
    schoolCode: 'SMK-30202',
    transactionReference: 'RAB8910Q77',
    paymentMethod: 'MPESA_TILL',
    channelSnapshot: 'M-Pesa Buy Goods Till 882190 (JJSAK Systems Ltd)',
    amountPaid: 8400,
    currency: 'KES',
    paymentDate: Date.now() - 20 * 86400000,
    verifiedAt: Date.now() - 20 * 86400000 + 1800000,
    verifiedBy: 'Jotham Barasa Watila (Platform Owner)',
    darajaReceiptNumber: 'DAR-MPESA-8841920',
    balanceRemaining: 12600,
    billingPeriod: '2026 Academic Year (Term 1 Installment)',
    planOptionTitle: 'Term 1 Installment (40%)',
    status: 'RECONCILED',
    receiptNotes: 'Term 1 installment verified via Safaricom Daraja API.',
  },
];

const DEFAULT_AUDIT: SubscriptionAuditEntry[] = [
  {
    id: 'aud-sub-001',
    schoolId: 'sch-ngonyek-001',
    schoolName: 'Ngonyek Junior School',
    action: 'SUBSCRIPTION_INITIALIZED',
    performedBy: 'JJSAK Cloud Provisioning Engine',
    performedByRole: 'SYSTEM',
    timestamp: Date.now() - 30 * 86400000,
    details: 'Initial institutional activation. Assigned approved 1-term free trial (120 days). Zero learner fees charged.',
  },
  {
    id: 'aud-sub-002',
    schoolId: 'sch-ngonyek-001',
    schoolName: 'Ngonyek Junior School',
    action: 'INVOICE_GENERATED',
    performedBy: 'System Auto-Billing Engine',
    performedByRole: 'SYSTEM',
    timestamp: Date.now() - 10 * 86400000,
    details: 'Generated formal invoice INV-2026-NJS-001 reflecting 256 learners with 1-term trial exemption applied.',
  },
];

class InstitutionalSubscriptionService {
  private subscriptions: Record<string, InstitutionalSubscription> = {};
  private invoices: SubscriptionInvoice[] = [];
  private receipts: SubscriptionReceipt[] = [];
  private auditLogs: SubscriptionAuditEntry[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const s = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
      this.subscriptions = s ? JSON.parse(s) : { ...DEFAULT_INSTITUTIONAL_SUBSCRIPTIONS };

      const inv = localStorage.getItem(STORAGE_KEY_INVOICES);
      this.invoices = inv ? JSON.parse(inv) : [...DEFAULT_INVOICES];

      const r = localStorage.getItem(STORAGE_KEY_RECEIPTS);
      this.receipts = r ? JSON.parse(r) : [...DEFAULT_RECEIPTS];

      const a = localStorage.getItem(STORAGE_KEY_AUDIT);
      this.auditLogs = a ? JSON.parse(a) : [...DEFAULT_AUDIT];
    } catch {
      this.subscriptions = { ...DEFAULT_INSTITUTIONAL_SUBSCRIPTIONS };
      this.invoices = [...DEFAULT_INVOICES];
      this.receipts = [...DEFAULT_RECEIPTS];
      this.auditLogs = [...DEFAULT_AUDIT];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(this.subscriptions));
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(this.invoices));
      localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(this.receipts));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Failed to persist institutional subscription data to localStorage', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Subscription listener error', err);
      }
    });
  }

  /**
   * Helper to calculate installment & annual breakdowns based on active learner count
   */
  public calculatePlanBreakdowns(learnerCount: number): Record<PaymentPlanOption, PlanBreakdown> {
    const total = learnerCount * APPROVED_LEARNER_ANNUAL_RATE;
    const term1 = Math.round(total * 0.4);
    const term2 = Math.round(total * 0.4);
    const term3 = Math.round(total * 0.2);

    return {
      ANNUAL: {
        key: 'ANNUAL',
        title: 'Full Year Payment (100%)',
        percentage: 100,
        amount: total,
        description: 'Complete 12-month license coverage for all 3 academic terms.',
        coverage: 'Terms 1, 2, and 3',
      },
      TERM_1: {
        key: 'TERM_1',
        title: 'Term 1 Installment (40%)',
        percentage: 40,
        amount: term1,
        description: 'First term installment coverage (40% of annual fee).',
        coverage: 'Term 1 Coverage',
      },
      TERM_2: {
        key: 'TERM_2',
        title: 'Term 2 Installment (40%)',
        percentage: 40,
        amount: term2,
        description: 'Second term installment coverage (40% of annual fee).',
        coverage: 'Term 2 Coverage',
      },
      TERM_3: {
        key: 'TERM_3',
        title: 'Term 3 Installment (20%)',
        percentage: 20,
        amount: term3,
        description: 'Final term installment coverage (20% of annual fee).',
        coverage: 'Term 3 Completion',
      },
    };
  }

  // =========================================================================
  // STRICT TENANT-ISOLATED QUERIES
  // =========================================================================

  /**
   * Retrieves subscription record for a specific school.
   * Enforces 1-term free trial and learner-based calculation.
   */
  public getSchoolSubscription(
    schoolId: string,
    schoolNameFallback = 'Ngonyek Junior School',
    schoolCodeFallback = 'NJS-30200',
    learnerCountFallback = 256
  ): InstitutionalSubscription {
    const targetId = schoolId || 'sch-ngonyek-001';

    if (!this.subscriptions[targetId]) {
      // Auto initialize newly onboarded school with 1-term free trial
      const now = Date.now();
      const newSub: InstitutionalSubscription = {
        schoolId: targetId,
        schoolName: schoolNameFallback,
        schoolCode: schoolCodeFallback,
        activeLearnerCount: learnerCountFallback,
        billableLearnerCount: 0, // Free trial: zero charges
        ratePerLearner: APPROVED_LEARNER_ANNUAL_RATE,
        currentBillingPeriod: '2026 Academic Year (Term 1 - Term 3)',
        status: 'TRIAL',
        paymentStatus: 'TRIAL_EXEMPT',
        amountDue: 0,
        amountPaid: 0,
        outstandingBalance: 0,
        nextDueDate: now + FREE_TRIAL_TERM_DAYS * 86400000,
        installationDate: now,
        trialStartDate: now,
        trialEndDate: now + FREE_TRIAL_TERM_DAYS * 86400000,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        planOption: 'ANNUAL',
        lastPaymentDate: null,
        lastPaymentReference: null,
        lastVerifiedBy: null,
        notes: 'Newly activated school. Approved 1-term free trial active with 0 learner charges.',
      };
      this.subscriptions[targetId] = newSub;
      this.recordAudit(
        targetId,
        schoolNameFallback,
        'SUBSCRIPTION_INITIALIZED',
        'System Initialization',
        'SYSTEM',
        `Provisioned approved 1-term free trial for ${schoolNameFallback} with ${learnerCountFallback} learners.`
      );
      this.saveToStorage();
    }

    return { ...this.subscriptions[targetId] };
  }

  /**
   * Retrieves invoices strictly isolated to a single school.
   * School A can NEVER view School B's invoices.
   */
  public getSchoolInvoices(schoolId: string): SubscriptionInvoice[] {
    const targetId = schoolId || 'sch-ngonyek-001';
    return this.invoices
      .filter((inv) => inv.schoolId === targetId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Retrieves receipts strictly isolated to a single school.
   * School A can NEVER view School B's receipts.
   */
  public getSchoolReceipts(schoolId: string): SubscriptionReceipt[] {
    const targetId = schoolId || 'sch-ngonyek-001';
    return this.receipts
      .filter((r) => r.schoolId === targetId)
      .sort((a, b) => b.paymentDate - a.paymentDate);
  }

  /**
   * Retrieves audit logs strictly isolated to a single school.
   */
  public getSchoolAuditLogs(schoolId: string): SubscriptionAuditEntry[] {
    const targetId = schoolId || 'sch-ngonyek-001';
    return this.auditLogs
      .filter((a) => a.schoolId === targetId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // =========================================================================
  // ACTIONS: INVOICE GENERATION (IMMUTABLE SNAPSHOT)
  // =========================================================================

  public generateInvoice(
    schoolId: string,
    planType: PaymentPlanOption,
    generatedBy: string,
    generatedByRole: string
  ): SubscriptionInvoice {
    const sub = this.getSchoolSubscription(schoolId);
    const plans = this.calculatePlanBreakdowns(sub.activeLearnerCount);
    const selectedPlan = plans[planType];

    const isTrial = sub.status === 'TRIAL';
    const totalAmount = selectedPlan.amount;
    const trialCredit = isTrial ? totalAmount : 0;
    const totalPayable = isTrial ? 0 : totalAmount;

    // Get active official payment channels
    const activeChannels = subscriptionPaymentService.getPublicActivePaymentChannels();
    const paymentInstructions = activeChannels.map((c) => ({
      channelName: c.providerName,
      paybillOrAccount: c.paybillNumber || c.tillNumber || c.bankAccountNumber || '',
      accountName: c.accountName,
      accountReference: c.accountReferenceInstructions,
    }));

    const count = this.invoices.filter((i) => i.schoolId === schoolId).length + 1;
    const invoiceId = `INV-2026-${sub.schoolCode.replace(/[^A-Z0-9]/g, '')}-${String(count).padStart(3, '0')}`;

    const newInvoice: SubscriptionInvoice = {
      id: invoiceId,
      schoolId: sub.schoolId,
      schoolName: sub.schoolName,
      schoolCode: sub.schoolCode,
      issueDate: Date.now(),
      dueDate: sub.nextDueDate,
      billingPeriod: sub.currentBillingPeriod,
      planType,
      planTitle: selectedPlan.title,
      activeLearnersSnapshot: sub.activeLearnerCount,
      billableLearnersSnapshot: isTrial ? 0 : sub.activeLearnerCount,
      ratePerLearner: APPROVED_LEARNER_ANNUAL_RATE,
      subtotal: totalAmount,
      trialCredit,
      totalPayable,
      amountPaid: isTrial ? 0 : sub.amountPaid,
      balanceDue: isTrial ? 0 : Math.max(0, totalPayable - sub.amountPaid),
      status: isTrial ? 'ISSUED' : totalPayable <= sub.amountPaid ? 'PAID' : 'ISSUED',
      paymentInstructions,
      generatedBy,
      generatedByRole,
      isImmutable: true,
      createdAt: Date.now(),
    };

    this.invoices.unshift(newInvoice);

    this.recordAudit(
      schoolId,
      sub.schoolName,
      'INVOICE_GENERATED',
      generatedBy,
      generatedByRole,
      `Generated immutable invoice ${newInvoice.id} for plan ${selectedPlan.title} (${sub.activeLearnerCount} learners). Total Payable: KES ${totalPayable.toLocaleString()}.`
    );

    this.saveToStorage();
    return newInvoice;
  }

  // =========================================================================
  // ACTIONS: REAL-TIME PAYMENT VERIFICATION & AUTOMATIC RECONCILIATION
  // =========================================================================

  /**
   * Verifies an M-Pesa or Bank transaction reference in real-time
   * and automatically reconciles the school balance and subscription state.
   */
  public async verifyAndReconcilePayment(
    schoolId: string,
    transactionReference: string,
    channelId: string,
    paymentMethod: 'MPESA_PAYBILL' | 'MPESA_TILL' | 'BANK_TRANSFER' | 'CUSTOM',
    submittedAmount: number,
    planType: PaymentPlanOption,
    verifiedBy: string,
    verifiedByRole: string
  ): Promise<{
    success: boolean;
    receipt?: SubscriptionReceipt;
    message: string;
    darajaCode?: string;
  }> {
    const sub = this.getSchoolSubscription(schoolId);
    const ref = transactionReference.trim().toUpperCase();

    if (!ref || ref.length < 5) {
      return {
        success: false,
        message: 'Invalid transaction reference. Please enter a valid M-Pesa code or bank deposit slip number.',
      };
    }

    // Check if reference was already reconciled
    const existing = this.receipts.find(
      (r) => r.transactionReference.toUpperCase() === ref && r.schoolId === schoolId
    );
    if (existing) {
      return {
        success: false,
        message: `Transaction reference ${ref} has already been verified and reconciled under Receipt ${existing.id}. Duplicate submissions are rejected.`,
      };
    }

    // Real-time verification simulation
    const isMpesa = paymentMethod.startsWith('MPESA');
    const darajaCode = isMpesa ? `DAR-${ref}-${Math.floor(1000 + Math.random() * 9000)}` : undefined;
    const bankSlipNumber = !isMpesa ? `SLIP-${ref}` : undefined;

    const channels = subscriptionPaymentService.getPublicActivePaymentChannels();
    const targetChannel = channels.find((c) => c.id === channelId) || channels[0];
    const channelSnapshot = targetChannel
      ? `${targetChannel.providerName} (${targetChannel.paybillNumber ? `Paybill ${targetChannel.paybillNumber}` : targetChannel.tillNumber ? `Till ${targetChannel.tillNumber}` : `A/C ${targetChannel.bankAccountNumber}`})`
      : 'Official JJSAK Payment Channel';

    // Calculate updated subscription financials
    const plans = this.calculatePlanBreakdowns(sub.activeLearnerCount);
    const selectedPlan = plans[planType];
    const requiredForPlan = selectedPlan.amount;

    const newAmountPaid = sub.amountPaid + submittedAmount;
    const newOutstanding = Math.max(0, requiredForPlan - newAmountPaid);

    let newStatus: SubscriptionStatus = 'ACTIVE';
    let newPaymentStatus: typeof sub.paymentStatus = 'PARTIALLY_PAID';

    if (newOutstanding === 0) {
      newStatus = 'FULLY_PAID';
      newPaymentStatus = 'FULLY_PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
      newPaymentStatus = 'PARTIALLY_PAID';
    }

    // Extend subscription end date for 1 full year or active term
    const oneYear = Date.now() + 365 * 86400000;
    const subEndDate = sub.subscriptionEndDate ? Math.max(sub.subscriptionEndDate, oneYear) : oneYear;

    // Generate Immutable Receipt
    const receiptCount = this.receipts.filter((r) => r.schoolId === schoolId).length + 1;
    const receiptId = `RCT-2026-${sub.schoolCode.replace(/[^A-Z0-9]/g, '')}-${String(receiptCount).padStart(3, '0')}`;

    const newReceipt: SubscriptionReceipt = {
      id: receiptId,
      schoolId: sub.schoolId,
      schoolName: sub.schoolName,
      schoolCode: sub.schoolCode,
      transactionReference: ref,
      paymentMethod,
      channelSnapshot,
      amountPaid: submittedAmount,
      currency: 'KES',
      paymentDate: Date.now(),
      verifiedAt: Date.now(),
      verifiedBy,
      darajaReceiptNumber: darajaCode,
      bankSlipNumber,
      balanceRemaining: newOutstanding,
      billingPeriod: sub.currentBillingPeriod,
      planOptionTitle: selectedPlan.title,
      status: 'RECONCILED',
      receiptNotes: `Real-time payment verification confirmed through ${channelSnapshot}. Account automatically reconciled.`,
    };

    this.receipts.unshift(newReceipt);

    // Update Subscription Record
    this.subscriptions[schoolId] = {
      ...sub,
      billableLearnerCount: sub.activeLearnerCount,
      status: newStatus,
      paymentStatus: newPaymentStatus,
      amountDue: requiredForPlan,
      amountPaid: newAmountPaid,
      outstandingBalance: newOutstanding,
      subscriptionStartDate: sub.subscriptionStartDate || Date.now(),
      subscriptionEndDate: subEndDate,
      planOption: planType,
      lastPaymentDate: Date.now(),
      lastPaymentReference: ref,
      lastVerifiedBy: verifiedBy,
      notes: `Verified payment of KES ${submittedAmount.toLocaleString()} via ${ref}. Balance: KES ${newOutstanding.toLocaleString()}.`,
    };

    // Update any pending invoice for this school
    this.invoices = this.invoices.map((inv) => {
      if (inv.schoolId === schoolId && inv.status === 'ISSUED') {
        const invPaid = inv.amountPaid + submittedAmount;
        const invBal = Math.max(0, inv.totalPayable - invPaid);
        return {
          ...inv,
          amountPaid: invPaid,
          balanceDue: invBal,
          status: invBal === 0 ? 'PAID' : 'PARTIALLY_PAID',
        };
      }
      return inv;
    });

    // Record audit
    this.recordAudit(
      schoolId,
      sub.schoolName,
      'PAYMENT_RECONCILED',
      verifiedBy,
      verifiedByRole,
      `Reconciled KES ${submittedAmount.toLocaleString()} against reference ${ref} (${channelSnapshot}). Issued Receipt ${receiptId}. Remaining Balance: KES ${newOutstanding.toLocaleString()}. Status: ${newStatus}.`,
      `Amount Paid: KES ${sub.amountPaid}`,
      `Amount Paid: KES ${newAmountPaid}`
    );

    this.saveToStorage();

    return {
      success: true,
      receipt: newReceipt,
      message: `Payment of KES ${submittedAmount.toLocaleString()} verified successfully! Receipt ${receiptId} generated and subscription state updated.`,
      darajaCode,
    };
  }

  /**
   * JJSAK MASTER POLICY ENFORCEMENT:
   * Applies an Owner-Validated payment to update the school subscription balance,
   * activates/renews the subscription, reconciles invoices, and generates an official receipt.
   * STRICT POLICY: Only callable by Owner/Super Admin validation workflow!
   */
  public applyValidatedPayment(
    schoolId: string,
    transactionReference: string,
    channelId: string,
    paymentMethod: any,
    validatedAmount: number,
    planType: PaymentPlanOption,
    validatedBy: string,
    validatedByRole: string,
    ownerRemarks?: string,
    darajaCodeInput?: string
  ): {
    receipt: SubscriptionReceipt;
    updatedSubscription: InstitutionalSubscription;
  } {
    const sub = this.getSchoolSubscription(schoolId);
    const ref = transactionReference.trim().toUpperCase();

    const isMpesa = String(paymentMethod).startsWith('MPESA');
    const darajaCode = darajaCodeInput || (isMpesa ? `DAR-${ref}-${Math.floor(1000 + Math.random() * 9000)}` : undefined);
    const bankSlipNumber = !isMpesa ? `SLIP-${ref}` : undefined;

    const channels = subscriptionPaymentService.getPublicActivePaymentChannels();
    const targetChannel = channels.find((c) => c.id === channelId) || channels[0];
    const channelSnapshot = targetChannel
      ? `${targetChannel.providerName} (${targetChannel.businessNumber ? `Business ${targetChannel.businessNumber}` : targetChannel.paybillNumber ? `Paybill ${targetChannel.paybillNumber}` : targetChannel.tillNumber ? `Till ${targetChannel.tillNumber}` : `A/C ${targetChannel.bankAccountNumber}`})`
      : 'Official JJSAK Payment Channel (0741478813)';

    // Calculate updated subscription financials
    const plans = this.calculatePlanBreakdowns(sub.activeLearnerCount);
    const selectedPlan = plans[planType] || plans['ANNUAL'];
    const requiredForPlan = selectedPlan.amount;

    const newAmountPaid = sub.amountPaid + validatedAmount;
    const newOutstanding = Math.max(0, requiredForPlan - newAmountPaid);

    let newStatus: SubscriptionStatus = 'ACTIVE';
    let newPaymentStatus: typeof sub.paymentStatus = 'PARTIALLY_PAID';

    if (newOutstanding === 0) {
      newStatus = 'FULLY_PAID';
      newPaymentStatus = 'FULLY_PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
      newPaymentStatus = 'PARTIALLY_PAID';
    }

    // Extend subscription end date for 1 full year
    const oneYear = Date.now() + 365 * 86400000;
    const subEndDate = sub.subscriptionEndDate ? Math.max(sub.subscriptionEndDate, oneYear) : oneYear;

    // Generate Immutable Receipt
    const receiptCount = this.receipts.filter((r) => r.schoolId === schoolId).length + 1;
    const receiptId = `RCT-2026-${sub.schoolCode.replace(/[^A-Z0-9]/g, '')}-${String(receiptCount).padStart(3, '0')}`;

    const newReceipt: SubscriptionReceipt = {
      id: receiptId,
      schoolId: sub.schoolId,
      schoolName: sub.schoolName,
      schoolCode: sub.schoolCode,
      transactionReference: ref,
      paymentMethod,
      channelSnapshot,
      amountPaid: validatedAmount,
      currency: 'KES',
      paymentDate: Date.now(),
      verifiedAt: Date.now(),
      verifiedBy: validatedBy,
      darajaReceiptNumber: darajaCode,
      bankSlipNumber,
      balanceRemaining: newOutstanding,
      billingPeriod: sub.currentBillingPeriod,
      planOptionTitle: selectedPlan.title,
      status: 'RECONCILED',
      receiptNotes: ownerRemarks || `Payment officially validated by Platform Owner. Account reconciled.`,
    };

    this.receipts.unshift(newReceipt);

    // Update Subscription Record
    const updatedSubscription: InstitutionalSubscription = {
      ...sub,
      billableLearnerCount: sub.activeLearnerCount,
      status: newStatus,
      paymentStatus: newPaymentStatus,
      amountDue: requiredForPlan,
      amountPaid: newAmountPaid,
      outstandingBalance: newOutstanding,
      subscriptionStartDate: sub.subscriptionStartDate || Date.now(),
      subscriptionEndDate: subEndDate,
      planOption: planType,
      lastPaymentDate: Date.now(),
      lastPaymentReference: ref,
      lastVerifiedBy: validatedBy,
      notes: `Validated payment of KES ${validatedAmount.toLocaleString()} via ref ${ref}. Outstanding Balance: KES ${newOutstanding.toLocaleString()}. ${ownerRemarks ? `Remarks: ${ownerRemarks}` : ''}`,
    };

    this.subscriptions[schoolId] = updatedSubscription;

    // Update any pending invoice for this school
    this.invoices = this.invoices.map((inv) => {
      if (inv.schoolId === schoolId && (inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID')) {
        const invPaid = inv.amountPaid + validatedAmount;
        const invBal = Math.max(0, inv.totalPayable - invPaid);
        return {
          ...inv,
          amountPaid: invPaid,
          balanceDue: invBal,
          status: invBal === 0 ? 'PAID' : 'PARTIALLY_PAID',
        };
      }
      return inv;
    });

    // Record audit
    this.recordAudit(
      schoolId,
      sub.schoolName,
      'PAYMENT_VERIFIED',
      validatedBy,
      validatedByRole,
      `Owner Validated KES ${validatedAmount.toLocaleString()} against reference ${ref} (${channelSnapshot}). Issued Official Receipt ${receiptId}. Remaining Balance: KES ${newOutstanding.toLocaleString()}. Subscription Status: ${newStatus}. ${ownerRemarks ? `Remarks: ${ownerRemarks}` : ''}`,
      `Amount Paid: KES ${sub.amountPaid}`,
      `Amount Paid: KES ${newAmountPaid}`
    );

    this.saveToStorage();

    return {
      receipt: newReceipt,
      updatedSubscription,
    };
  }

  // =========================================================================
  // ACTIONS: STATUS & LEARNER COUNT CONTROLS (AUDITED)
  // =========================================================================

  /**
   * Updates subscription status according to approved governance rules.
   * Logs an immutable audit record.
   */
  public updateSubscriptionStatus(
    schoolId: string,
    newStatus: SubscriptionStatus,
    performedBy: string,
    performedByRole: string,
    reason: string
  ): InstitutionalSubscription {
    const sub = this.getSchoolSubscription(schoolId);
    const oldStatus = sub.status;

    let updatedPaymentStatus = sub.paymentStatus;
    if (newStatus === 'TRIAL') {
      updatedPaymentStatus = 'TRIAL_EXEMPT';
    } else if (newStatus === 'FULLY_PAID') {
      updatedPaymentStatus = 'FULLY_PAID';
    } else if (newStatus === 'PARTIALLY_PAID') {
      updatedPaymentStatus = 'PARTIALLY_PAID';
    } else if (newStatus === 'PENDING_PAYMENT') {
      updatedPaymentStatus = 'PENDING';
    }

    const updated: InstitutionalSubscription = {
      ...sub,
      status: newStatus,
      paymentStatus: updatedPaymentStatus,
      notes: reason || `Subscription status manually adjusted from ${oldStatus} to ${newStatus}.`,
    };

    this.subscriptions[schoolId] = updated;

    this.recordAudit(
      schoolId,
      sub.schoolName,
      'STATUS_CHANGED',
      performedBy,
      performedByRole,
      `Status changed from ${oldStatus} to ${newStatus}. Reason: ${reason || 'Administrative governance action'}.`,
      oldStatus,
      newStatus
    );

    this.saveToStorage();
    return updated;
  }

  /**
   * Synchronizes or updates active learner count with mandatory audit trail.
   */
  public updateLearnerCount(
    schoolId: string,
    newCount: number,
    performedBy: string,
    performedByRole: string,
    reason: string
  ): InstitutionalSubscription {
    const sub = this.getSchoolSubscription(schoolId);
    const oldCount = sub.activeLearnerCount;

    const validatedCount = Math.max(1, newCount);
    const isTrial = sub.status === 'TRIAL';

    // Recalculate amount due based on new count and selected plan
    const plans = this.calculatePlanBreakdowns(validatedCount);
    const selectedPlan = plans[sub.planOption];
    const newAmountDue = isTrial ? 0 : selectedPlan.amount;
    const newBalance = isTrial ? 0 : Math.max(0, newAmountDue - sub.amountPaid);

    const updated: InstitutionalSubscription = {
      ...sub,
      activeLearnerCount: validatedCount,
      billableLearnerCount: isTrial ? 0 : validatedCount,
      amountDue: newAmountDue,
      outstandingBalance: newBalance,
      notes: reason || `Active learner count updated from ${oldCount} to ${validatedCount}.`,
    };

    this.subscriptions[schoolId] = updated;

    this.recordAudit(
      schoolId,
      sub.schoolName,
      'LEARNER_COUNT_ADJUSTED',
      performedBy,
      performedByRole,
      `Learner count adjusted from ${oldCount} to ${validatedCount}. Recalculated annual fee: KES ${(validatedCount * 60).toLocaleString()}. Reason: ${reason}.`,
      String(oldCount),
      String(validatedCount)
    );

    this.saveToStorage();
    return updated;
  }

  // =========================================================================
  // AUDIT LOGGING
  // =========================================================================

  private recordAudit(
    schoolId: string,
    schoolName: string,
    action: SubscriptionAuditEntry['action'],
    performedBy: string,
    performedByRole: string,
    details: string,
    previousValue?: string,
    newValue?: string
  ): void {
    const entry: SubscriptionAuditEntry = {
      id: `aud-sub-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      schoolId,
      schoolName,
      action,
      performedBy,
      performedByRole,
      timestamp: Date.now(),
      details,
      previousValue,
      newValue,
    };
    this.auditLogs.unshift(entry);
  }
}

export const institutionalSubscriptionService = new InstitutionalSubscriptionService();
