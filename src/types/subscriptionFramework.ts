// JJSAK Approved Subscription Framework Types & Models
// Policy: Learner-Based Subscription Licensing Model (KES 60 / learner / year)
// Strict Tenant Isolation & Immutable Financial Records

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PENDING_PAYMENT'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'SUSPENDED'
  | 'EXPIRED';

export type PaymentStatus =
  | 'TRIAL_EXEMPT'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'OVERDUE';

export type PaymentPlanOption = 'ANNUAL' | 'TERM_1' | 'TERM_2' | 'TERM_3';

export interface PlanBreakdown {
  key: PaymentPlanOption;
  title: string;
  percentage: number;
  amount: number;
  description: string;
  coverage: string;
}

export interface InstitutionalSubscription {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  activeLearnerCount: number;
  billableLearnerCount: number;
  ratePerLearner: number; // Approved rate: KES 60 / learner / year
  currentBillingPeriod: string; // e.g., '2026 Academic Year (Term 1 - Term 3)'
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  amountDue: number;
  amountPaid: number;
  outstandingBalance: number;
  nextDueDate: number; // timestamp
  installationDate: number;
  trialStartDate: number;
  trialEndDate: number; // 1-term free trial (~120 days)
  subscriptionStartDate: number | null;
  subscriptionEndDate: number | null;
  planOption: PaymentPlanOption;
  lastPaymentDate: number | null;
  lastPaymentReference: string | null;
  lastVerifiedBy: string | null;
  notes?: string;
}

export interface SubscriptionInvoice {
  id: string; // e.g., INV-2026-NJS-001
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  issueDate: number;
  dueDate: number;
  billingPeriod: string;
  planType: PaymentPlanOption;
  planTitle: string;
  activeLearnersSnapshot: number;
  billableLearnersSnapshot: number;
  ratePerLearner: number;
  subtotal: number;
  trialCredit: number;
  totalPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
  paymentInstructions: {
    channelName: string;
    paybillOrAccount: string;
    accountName: string;
    accountReference: string;
  }[];
  generatedBy: string;
  generatedByRole: string;
  isImmutable: boolean;
  createdAt: number;
}

export interface SubscriptionReceipt {
  id: string; // e.g., RCT-2026-NJS-001
  invoiceId?: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  transactionReference: string;
  paymentMethod: 'MPESA_PAYBILL' | 'MPESA_TILL' | 'BANK_TRANSFER' | 'CUSTOM';
  channelSnapshot: string;
  amountPaid: number;
  currency: 'KES';
  paymentDate: number;
  verifiedAt: number;
  verifiedBy: string;
  darajaReceiptNumber?: string;
  bankSlipNumber?: string;
  balanceRemaining: number;
  billingPeriod: string;
  planOptionTitle: string;
  status: 'VERIFIED' | 'RECONCILED';
  receiptNotes?: string;
}

export interface SubscriptionAuditEntry {
  id: string;
  schoolId: string;
  schoolName: string;
  action:
    | 'SUBSCRIPTION_INITIALIZED'
    | 'INVOICE_GENERATED'
    | 'PAYMENT_VERIFIED'
    | 'PAYMENT_RECONCILED'
    | 'STATUS_CHANGED'
    | 'LEARNER_COUNT_ADJUSTED'
    | 'TRIAL_EXTENDED'
    | 'MANUAL_BALANCE_ADJUSTMENT';
  performedBy: string;
  performedByRole: string;
  timestamp: number;
  details: string;
  previousValue?: string;
  newValue?: string;
}
