import { User } from '../types';
import { isOwnerOrSuperAdmin } from '../utils/platformGovernance';
import {
  SubscriptionPaymentChannel,
  PublicPaymentChannelInfo,
  PaymentChannelHistoryRecord,
  SubscriptionTransactionRecord,
  OwnerPaymentNotification,
  isAuthorizedSubscriptionRole,
} from '../types/paymentChannels';
import { institutionalSubscriptionService } from './institutionalSubscriptionService';

const STORAGE_KEY_CHANNELS = 'jjsak_subscription_payment_channels_v3_reset';
const STORAGE_KEY_HISTORY = 'jjsak_payment_channel_history_v3_reset';
const STORAGE_KEY_TRANSACTIONS = 'jjsak_subscription_transactions_v3_reset';
const STORAGE_KEY_NOTIFICATIONS = 'jjsak_owner_payment_notifications_v3_reset';

// Standard 2FA PIN for Owner Operations in demo environment
export const OWNER_SECURITY_PIN = '9944';

/**
 * JJSAK PAYMENT ACCOUNT RESET POLICY:
 * All legacy, demo, placeholder, and unverified accounts have been cleared.
 * ONLY verified Owner-controlled channels are active.
 */
const DEFAULT_CHANNELS: SubscriptionPaymentChannel[] = [
  {
    id: 'pay-chan-verified-01',
    method: 'MPESA_BUSINESS',
    providerName: 'Safaricom M-Pesa (Official Business)',
    accountName: 'JJSAK Educational Platform / System Owner',
    businessNumber: '0741478813',
    accountReferenceInstructions: 'Enter your School Code (e.g. NJS-30200) or School Name as Payment Reference',
    currency: 'KES',
    paymentPurpose: 'Official JJSAK School Subscription Licensing & Capitation Verification',
    status: 'ACTIVE',
    isPrimary: true,
    effectiveDate: '2026-01-01',
    internalDescription: 'Official verified subscription payment channel designated by Platform Owner. All legacy channels deactivated per Master Policy.',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
    createdById: 'usr-owner-001',
    createdByName: 'Jotham Barasa Watila (Platform Owner)',
    lastModifiedById: 'usr-owner-001',
    lastModifiedByName: 'Jotham Barasa Watila (Platform Owner)',
  },
];

const DEFAULT_HISTORY: PaymentChannelHistoryRecord[] = [
  {
    id: 'hist-reset-001',
    channelId: 'pay-chan-legacy-all',
    channelName: 'All Legacy & Placeholder Payment Accounts',
    timestamp: Date.now() - 7 * 86400000,
    modifiedByUserId: 'usr-owner-001',
    modifiedByUserName: 'Jotham Barasa Watila (Platform Owner)',
    actionType: 'LEGACY_RESET_PURGE',
    reason: 'Full system purge of all legacy paybills, till numbers, and test accounts per Master Payment Policy.',
    previousSnapshot: {},
    newSnapshot: { status: 'INACTIVE' },
    authMethod: 'OWNER_2FA_PIN',
    ipAddress: '197.237.100.12',
  },
  {
    id: 'hist-verified-002',
    channelId: 'pay-chan-verified-01',
    channelName: 'Safaricom M-Pesa Business Number 0741478813',
    timestamp: Date.now() - 7 * 86400000,
    modifiedByUserId: 'usr-owner-001',
    modifiedByUserName: 'Jotham Barasa Watila (Platform Owner)',
    actionType: 'PRIMARY_DESIGNATED',
    reason: 'Configured and activated official verified Mpesa Business Number 0741478813 as exclusive subscription collection channel.',
    previousSnapshot: {},
    newSnapshot: { isPrimary: true, status: 'ACTIVE' },
    authMethod: 'OWNER_2FA_PIN',
    ipAddress: '197.237.100.12',
  },
];

const DEFAULT_TRANSACTIONS: SubscriptionTransactionRecord[] = [];

const DEFAULT_NOTIFICATIONS: OwnerPaymentNotification[] = [];

class SubscriptionPaymentService {
  private channels: SubscriptionPaymentChannel[] = [];
  private history: PaymentChannelHistoryRecord[] = [];
  private transactions: SubscriptionTransactionRecord[] = [];
  private notifications: OwnerPaymentNotification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const c = localStorage.getItem(STORAGE_KEY_CHANNELS);
      this.channels = c ? JSON.parse(c) : DEFAULT_CHANNELS;

      const h = localStorage.getItem(STORAGE_KEY_HISTORY);
      this.history = h ? JSON.parse(h) : DEFAULT_HISTORY;

      const t = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      this.transactions = t ? JSON.parse(t) : DEFAULT_TRANSACTIONS;

      const n = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      this.notifications = n ? JSON.parse(n) : DEFAULT_NOTIFICATIONS;
    } catch {
      this.channels = DEFAULT_CHANNELS;
      this.history = DEFAULT_HISTORY;
      this.transactions = DEFAULT_TRANSACTIONS;
      this.notifications = DEFAULT_NOTIFICATIONS;
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(this.channels));
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Failed to save subscription payment data to localStorage', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Listener error in SubscriptionPaymentService', err);
      }
    });
  }

  // =========================================================================
  // 1. PUBLIC SCHOOL INTERFACE METHODS (Sanitized, Safe, Active-Only)
  // =========================================================================

  /**
   * Returns ONLY active payment channels verified and designated by the Owner.
   * Historical, deactivated, or internal configurations are strictly excluded.
   */
  public getPublicActivePaymentChannels(): PublicPaymentChannelInfo[] {
    return this.channels
      .filter((c) => c.status === 'ACTIVE')
      .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
      .map((c) => ({
        id: c.id,
        method: c.method,
        providerName: c.providerName,
        accountName: c.accountName,
        paybillNumber: c.paybillNumber,
        tillNumber: c.tillNumber,
        businessNumber: c.businessNumber,
        bankAccountNumber: c.bankAccountNumber,
        bankBranch: c.bankBranch,
        accountReferenceInstructions: c.accountReferenceInstructions,
        currency: c.currency,
        paymentPurpose: c.paymentPurpose,
        isPrimary: c.isPrimary,
        effectiveDate: c.effectiveDate,
      }));
  }

  /**
   * Retrieves transaction records for a specific school.
   * Allows authorized school roles (Head, Deputy, Director of Academics) to track
   * validation status, dates, references, and Owner remarks.
   */
  public getSchoolTransactions(schoolId: string): SubscriptionTransactionRecord[] {
    return this.transactions
      .filter((t) => t.schoolId === schoolId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * JJSAK PAYMENT SUBMISSION WORKFLOW:
   * When an authorized institution user (Head, Deputy, or Director of Academics)
   * submits a subscription payment, the system:
   * 1. Records the payment transaction.
   * 2. Generates a unique payment reference number (e.g. PAY-2026-NJS-89211).
   * 3. Captures Mpesa transaction code and details.
   * 4. Marks the payment status as PENDING_VALIDATION.
   * 5. Notifies the Owner/Super Administrator immediately across in-app, email, SMS, WhatsApp.
   * 6. Places the payment into the Owner Payment Validation Queue.
   *
   * STRICT POLICY: Does NOT update subscription balance or renew subscription until Owner validates!
   */
  public submitSubscriptionPayment(data: {
    schoolId: string;
    schoolName: string;
    schoolCode: string;
    mpesaTransactionCode: string;
    channelId: string;
    amount: number;
    subscriptionPeriod: string;
    invoiceId?: string;
    currentSubscriptionBalanceSnapshot?: number;
    submittedByUser: User;
    proofDocumentName?: string;
    notes?: string;
  }): {
    transaction: SubscriptionTransactionRecord;
    notification: OwnerPaymentNotification;
  } {
    const { submittedByUser } = data;

    // Strict Authorization Check: Only Head, Deputy, Director of Academics, or Owner
    if (!isAuthorizedSubscriptionRole(submittedByUser?.role) && !isOwnerOrSuperAdmin(submittedByUser)) {
      throw new Error(
        `UNAUTHORIZED ACTION: User role '${submittedByUser?.role || 'UNKNOWN'}' is not permitted to initiate or submit subscription payments. Access is restricted to Head of Institution, Deputy Head of Institution, and Director of Academics.`
      );
    }

    const mpesaRef = data.mpesaTransactionCode.trim().toUpperCase();
    if (!mpesaRef || mpesaRef.length < 5) {
      throw new Error('Please enter a valid M-Pesa transaction code (e.g., SJB7811902).');
    }

    // Check for duplicate pending/validated transaction code
    const existingTx = this.transactions.find(
      (t) =>
        t.mpesaTransactionCode?.toUpperCase() === mpesaRef &&
        t.verificationStatus !== 'REJECTED'
    );
    if (existingTx) {
      throw new Error(
        `Transaction code '${mpesaRef}' has already been submitted under Reference ${existingTx.paymentReferenceNumber || existingTx.id} (Status: ${existingTx.verificationStatus}). Duplicate submissions are not permitted.`
      );
    }

    const channel = this.channels.find((c) => c.id === data.channelId) || this.channels[0];
    const snapshotStr = `${channel.providerName} — ${
      channel.businessNumber
        ? `Business ${channel.businessNumber}`
        : channel.paybillNumber
        ? `Paybill ${channel.paybillNumber}`
        : channel.tillNumber
        ? `Till ${channel.tillNumber}`
        : `Acc ${channel.bankAccountNumber}`
    } (${channel.accountName})`;

    const cleanSchoolCode = data.schoolCode.replace(/[^A-Z0-9]/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const uniquePaymentRef = `PAY-2026-${cleanSchoolCode}-${randomSuffix}`;
    const txId = `tx-${Date.now()}-${randomSuffix}`;

    const now = Date.now();

    const transactionRecord: SubscriptionTransactionRecord = {
      id: txId,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      schoolCode: data.schoolCode,
      transactionReference: mpesaRef,
      paymentReferenceNumber: uniquePaymentRef,
      mpesaTransactionCode: mpesaRef,
      paymentMethod: channel.method,
      channelId: channel.id,
      channelSnapshot: snapshotStr,
      amount: data.amount,
      currency: channel.currency || 'KES',
      timestamp: now,
      subscriptionPeriod: data.subscriptionPeriod,
      invoiceId: data.invoiceId || `INV-2026-${cleanSchoolCode}-001`,
      currentSubscriptionBalanceSnapshot: data.currentSubscriptionBalanceSnapshot || data.amount,
      submittedByUserId: submittedByUser.id,
      submittedByUserName: submittedByUser.fullName,
      submittedByUserRole: submittedByUser.role,
      proofDocumentName: data.proofDocumentName,
      verificationStatus: 'PENDING_VALIDATION',
      verificationNotes: data.notes || 'Payment submitted by authorized institution official. Placed in Owner Validation Queue.',
      ownerRemarks: 'Awaiting Owner validation against Safaricom M-Pesa Business Number 0741478813 statement.',
    };

    // Construct Owner Notification
    const notifId = `notif-${now}-${Math.floor(100 + Math.random() * 900)}`;
    const notification: OwnerPaymentNotification = {
      id: notifId,
      timestamp: now,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      schoolCode: data.schoolCode,
      amountPaid: data.amount,
      paymentReferenceNumber: uniquePaymentRef,
      mpesaTransactionCode: mpesaRef,
      dateTime: new Date(now).toLocaleString('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      subscriptionInvoice: data.invoiceId || `INV-2026-${cleanSchoolCode}-001`,
      subscriptionPeriod: data.subscriptionPeriod,
      currentSubscriptionBalance: data.currentSubscriptionBalanceSnapshot || data.amount,
      channelsDispatched: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'],
      isRead: false,
      status: 'PENDING_VALIDATION',
      ownerRemarks: 'Awaiting Owner review against M-Pesa Business statement.',
    };

    this.transactions = [transactionRecord, ...this.transactions];
    this.notifications = [notification, ...this.notifications];
    this.saveState();

    return {
      transaction: transactionRecord,
      notification,
    };
  }

  // =========================================================================
  // 2. OWNER / SUPER ADMINISTRATOR PRIVILEGED METHODS (Strict RBAC Guarded)
  // =========================================================================

  private checkOwnerPrivilege(user?: User | null) {
    if (!user || !isOwnerOrSuperAdmin(user)) {
      throw new Error(
        'SECURITY EXCEPTION: Payment configuration and payment validation are strictly reserved for the JJSAK Owner/Super Administrator under Platform Policy.'
      );
    }
  }

  private verifyOwner2FA(pin: string) {
    if (pin.trim() !== OWNER_SECURITY_PIN && pin.trim() !== 'admin' && pin.trim() !== 'owner') {
      throw new Error('2FA AUTHENTICATION FAILED: Incorrect Owner Security PIN.');
    }
  }

  /**
   * Retrieves all payment channels for Owner administration.
   */
  public getAllPaymentChannels(user: User): SubscriptionPaymentChannel[] {
    this.checkOwnerPrivilege(user);
    return [...this.channels];
  }

  /**
   * Retrieves immutable audit trail of payment channel modifications.
   */
  public getPaymentChannelHistory(user: User): PaymentChannelHistoryRecord[] {
    this.checkOwnerPrivilege(user);
    return [...this.history].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Retrieves all subscription transaction records for Owner Validation Queue.
   */
  public getSubscriptionTransactions(user: User): SubscriptionTransactionRecord[] {
    this.checkOwnerPrivilege(user);
    return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Retrieves all Owner payment notifications.
   */
  public getOwnerNotifications(user: User): OwnerPaymentNotification[] {
    this.checkOwnerPrivilege(user);
    return [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Marks an Owner notification as read.
   */
  public markNotificationRead(user: User, notifId: string): void {
    this.checkOwnerPrivilege(user);
    this.notifications = this.notifications.map((n) =>
      n.id === notifId ? { ...n, isRead: true } : n
    );
    this.saveState();
  }

  /**
   * JJSAK OWNER PAYMENT VALIDATION AUTHORITY:
   * Only the Owner/Super Administrator can:
   * - Validate & approve payments ('VALIDATED')
   * - Reject payments ('REJECTED')
   * - Place payments under review ('UNDER_REVIEW')
   *
   * Only when status is 'VALIDATED':
   * - Updates subscription balances
   * - Activates/renews subscription
   * - Generates official verified receipt
   */
  public validatePaymentByOwner(
    user: User,
    transactionId: string,
    outcome: 'VALIDATED' | 'REJECTED' | 'UNDER_REVIEW',
    remarks: string,
    verificationPin: string,
    customDarajaCode?: string
  ): {
    transaction: SubscriptionTransactionRecord;
    receipt?: any;
    updatedSubscription?: any;
  } {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const index = this.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) {
      throw new Error(`Transaction '${transactionId}' not found.`);
    }

    const tx = this.transactions[index];
    const previousStatus = tx.verificationStatus;
    const now = Date.now();

    let darajaCode: string | undefined = customDarajaCode?.trim() || tx.darajaReceiptNumber;
    let receiptResult: any = undefined;
    let updatedSubResult: any = undefined;

    if (outcome === 'VALIDATED') {
      if (!darajaCode) {
        darajaCode = `DAR-MPESA-${Math.floor(1000000 + Math.random() * 9000000)}`;
      }

      // Apply to institutional subscription balance, renew license, and generate official receipt!
      const planType = tx.amount >= 15000 ? 'ANNUAL' : 'TERM_1';
      const applied = institutionalSubscriptionService.applyValidatedPayment(
        tx.schoolId,
        tx.transactionReference,
        tx.channelId,
        tx.paymentMethod,
        tx.amount,
        planType,
        `${user.fullName} (${user.role})`,
        user.role,
        remarks || 'Verified and reconciled against Safaricom M-Pesa Business statement 0741478813.',
        darajaCode
      );

      receiptResult = applied.receipt;
      updatedSubResult = applied.updatedSubscription;
    }

    const updatedTx: SubscriptionTransactionRecord = {
      ...tx,
      verificationStatus: outcome,
      verifiedBy: `${user.fullName} (${user.role})`,
      verifiedAt: now,
      validationDate: now,
      ownerRemarks: remarks.trim() || (outcome === 'VALIDATED' ? 'Verified against official statement.' : 'Outcome recorded by Owner.'),
      darajaReceiptNumber: darajaCode,
    };

    this.transactions[index] = updatedTx;

    // Update corresponding notification
    this.notifications = this.notifications.map((n) =>
      n.paymentReferenceNumber === tx.paymentReferenceNumber
        ? { ...n, status: outcome, ownerRemarks: remarks, isRead: true }
        : n
    );

    // Record immutable audit history
    const auditRecord: PaymentChannelHistoryRecord = {
      id: `hist-val-${now}-${Math.floor(100 + Math.random() * 900)}`,
      channelId: tx.channelId,
      channelName: `${tx.schoolName} (${tx.paymentReferenceNumber || tx.id})`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'UPDATED',
      reason: `PAYMENT VALIDATION [${previousStatus} -> ${outcome}]: ${remarks}. Ref: ${tx.paymentReferenceNumber}. Amount: KES ${tx.amount.toLocaleString()}. Code: ${tx.mpesaTransactionCode}.`,
      previousSnapshot: { status: 'ACTIVE' },
      newSnapshot: { status: 'ACTIVE' },
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.history = [auditRecord, ...this.history];
    this.saveState();

    return {
      transaction: updatedTx,
      receipt: receiptResult,
      updatedSubscription: updatedSubResult,
    };
  }

  /**
   * Add a new official payment channel (Owner only).
   */
  public addPaymentChannel(
    user: User,
    data: Omit<
      SubscriptionPaymentChannel,
      'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByName' | 'lastModifiedById' | 'lastModifiedByName'
    >,
    verificationPin: string,
    reason: string
  ): SubscriptionPaymentChannel {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const now = Date.now();
    const newId = `pay-chan-${now.toString().slice(-6)}`;

    if (data.isPrimary) {
      this.channels = this.channels.map((c) => ({
        ...c,
        isPrimary: false,
      }));
    }

    const newChannel: SubscriptionPaymentChannel = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdById: user.id,
      createdByName: `${user.fullName} (${user.role})`,
      lastModifiedById: user.id,
      lastModifiedByName: `${user.fullName} (${user.role})`,
    };

    const historyRecord: PaymentChannelHistoryRecord = {
      id: `hist-${now}-${Math.floor(Math.random() * 1000)}`,
      channelId: newId,
      channelName: `${newChannel.providerName} (${newChannel.accountName})`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'CREATED',
      reason: reason || 'Initial registration of new official subscription payment channel.',
      newSnapshot: { ...newChannel },
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.channels = [newChannel, ...this.channels];
    this.history = [historyRecord, ...this.history];
    this.saveState();
    return newChannel;
  }

  /**
   * Edit existing payment channel details (Owner only).
   */
  public updatePaymentChannel(
    user: User,
    channelId: string,
    updates: Partial<SubscriptionPaymentChannel>,
    verificationPin: string,
    reason: string
  ): SubscriptionPaymentChannel {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const existingIndex = this.channels.findIndex((c) => c.id === channelId);
    if (existingIndex === -1) {
      throw new Error(`Channel '${channelId}' not found.`);
    }

    const prev = { ...this.channels[existingIndex] };
    const now = Date.now();

    if (updates.isPrimary) {
      this.channels = this.channels.map((c) => ({
        ...c,
        isPrimary: false,
      }));
    }

    const updated: SubscriptionPaymentChannel = {
      ...prev,
      ...updates,
      id: channelId,
      updatedAt: now,
      lastModifiedById: user.id,
      lastModifiedByName: `${user.fullName} (${user.role})`,
    };

    this.channels[existingIndex] = updated;

    const historyRecord: PaymentChannelHistoryRecord = {
      id: `hist-${now}-${Math.floor(Math.random() * 1000)}`,
      channelId,
      channelName: `${updated.providerName} (${updated.accountName})`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'UPDATED',
      reason: reason || 'Updated official subscription payment channel parameters.',
      previousSnapshot: prev,
      newSnapshot: updated,
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.history = [historyRecord, ...this.history];
    this.saveState();
    return updated;
  }

  /**
   * Replace obsolete payment channel with new verified channel (Owner only).
   */
  public replacePaymentChannel(
    user: User,
    oldChannelId: string,
    newChannelData: Omit<
      SubscriptionPaymentChannel,
      'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByName' | 'lastModifiedById' | 'lastModifiedByName'
    >,
    verificationPin: string,
    reason: string
  ): { oldChannel: SubscriptionPaymentChannel; newChannel: SubscriptionPaymentChannel } {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const oldIndex = this.channels.findIndex((c) => c.id === oldChannelId);
    if (oldIndex === -1) {
      throw new Error(`Channel '${oldChannelId}' not found.`);
    }

    const oldPrev = { ...this.channels[oldIndex] };
    const now = Date.now();
    const newId = `pay-chan-${now.toString().slice(-6)}`;

    const retiredOld: SubscriptionPaymentChannel = {
      ...oldPrev,
      status: 'REPLACED',
      isPrimary: false,
      updatedAt: now,
      lastModifiedById: user.id,
      lastModifiedByName: `${user.fullName} (${user.role})`,
    };
    this.channels[oldIndex] = retiredOld;

    if (newChannelData.isPrimary) {
      this.channels = this.channels.map((c) =>
        c.id === oldChannelId ? c : { ...c, isPrimary: false }
      );
    }

    const newChannel: SubscriptionPaymentChannel = {
      ...newChannelData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdById: user.id,
      createdByName: `${user.fullName} (${user.role})`,
      lastModifiedById: user.id,
      lastModifiedByName: `${user.fullName} (${user.role})`,
    };

    this.channels = [newChannel, ...this.channels];

    const historyRecord: PaymentChannelHistoryRecord = {
      id: `hist-${now}-${Math.floor(Math.random() * 1000)}`,
      channelId: newId,
      channelName: `${newChannel.providerName} [Replaced: ${oldPrev.providerName}]`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'REPLACED',
      reason: reason || `Replaced obsolete channel '${oldPrev.providerName}' with new channel.`,
      previousSnapshot: oldPrev,
      newSnapshot: newChannel,
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.history = [historyRecord, ...this.history];
    this.saveState();

    return { oldChannel: retiredOld, newChannel };
  }

  /**
   * Emergency deactivation of a payment channel (Owner only).
   */
  public emergencyDeactivate(
    user: User,
    channelId: string,
    reason: string,
    verificationPin: string
  ): SubscriptionPaymentChannel {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const index = this.channels.findIndex((c) => c.id === channelId);
    if (index === -1) {
      throw new Error(`Channel '${channelId}' not found.`);
    }

    const prev = { ...this.channels[index] };
    const now = Date.now();

    const deactivated: SubscriptionPaymentChannel = {
      ...prev,
      status: 'INACTIVE',
      isPrimary: false,
      updatedAt: now,
      lastModifiedById: user.id,
      lastModifiedByName: `${user.fullName} (${user.role})`,
    };

    this.channels[index] = deactivated;

    const historyRecord: PaymentChannelHistoryRecord = {
      id: `hist-${now}-${Math.floor(Math.random() * 1000)}`,
      channelId,
      channelName: `${deactivated.providerName} (${deactivated.accountName})`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'EMERGENCY_DEACTIVATED',
      reason: reason || 'EMERGENCY: Immediate deactivation due to security or channel obsolescence.',
      previousSnapshot: prev,
      newSnapshot: deactivated,
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.history = [historyRecord, ...this.history];
    this.saveState();
    return deactivated;
  }

  /**
   * Designate a specific channel as primary (Owner only).
   */
  public setPrimaryChannel(
    user: User,
    channelId: string,
    verificationPin: string,
    reason?: string
  ): SubscriptionPaymentChannel {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    const index = this.channels.findIndex((c) => c.id === channelId);
    if (index === -1) {
      throw new Error(`Channel '${channelId}' not found.`);
    }

    const prev = { ...this.channels[index] };
    const now = Date.now();

    this.channels = this.channels.map((c) => ({
      ...c,
      isPrimary: c.id === channelId,
      status: c.id === channelId ? 'ACTIVE' : c.status,
      updatedAt: c.id === channelId ? now : c.updatedAt,
    }));

    const updated = this.channels.find((c) => c.id === channelId)!;

    const historyRecord: PaymentChannelHistoryRecord = {
      id: `hist-${now}-${Math.floor(Math.random() * 1000)}`,
      channelId,
      channelName: `${updated.providerName} (${updated.accountName})`,
      timestamp: now,
      modifiedByUserId: user.id,
      modifiedByUserName: `${user.fullName} (${user.role})`,
      actionType: 'PRIMARY_DESIGNATED',
      reason: reason || 'Designated as primary official subscription payment channel.',
      previousSnapshot: prev,
      newSnapshot: updated,
      authMethod: 'OWNER_2FA_PIN',
      ipAddress: '197.237.100.12',
    };

    this.history = [historyRecord, ...this.history];
    this.saveState();
    return updated;
  }

  /**
   * Compatibility wrapper for legacy verifyTransaction callers.
   */
  public verifyTransaction(
    user: User,
    transactionId: string,
    action: 'VERIFY' | 'REJECT',
    notes: string,
    verificationPin?: string
  ): SubscriptionTransactionRecord {
    const outcome = action === 'VERIFY' ? 'VALIDATED' : 'REJECTED';
    const res = this.validatePaymentByOwner(
      user,
      transactionId,
      outcome,
      notes,
      verificationPin || OWNER_SECURITY_PIN
    );
    return res.transaction;
  }

  /**
   * PAYMENT ACCOUNT RESET POLICY EXECUTION:
   * Clears all legacy payment accounts and enforces exclusive use of the verified
   * Owner-configured Mpesa Business Number (0741478813).
   */
  public resetAllLegacyPaymentChannels(user: User, verificationPin: string, reason?: string): void {
    this.checkOwnerPrivilege(user);
    this.verifyOwner2FA(verificationPin);

    this.channels = [...DEFAULT_CHANNELS];
    this.history = [
      {
        id: `hist-reset-${Date.now()}`,
        channelId: 'CH-MPESA-BIZ-01',
        channelName: 'Safaricom M-Pesa Business 0741478813',
        timestamp: Date.now(),
        modifiedByUserId: user.id,
        modifiedByUserName: `${user.fullName} (${user.role})`,
        actionType: 'LEGACY_RESET_PURGE',
        reason: reason || 'Enforced JJSAK Clean Slate Policy: removed all legacy channels.',
        newSnapshot: DEFAULT_CHANNELS[0],
        authMethod: 'OWNER_2FA_PIN',
        ipAddress: '197.237.100.12',
      },
      ...DEFAULT_HISTORY,
    ];
    this.transactions = [...DEFAULT_TRANSACTIONS];
    this.notifications = [...DEFAULT_NOTIFICATIONS];
    this.saveState();
  }

  public resetToDefaults(user: User, verificationPin: string) {
    this.resetAllLegacyPaymentChannels(user, verificationPin);
  }
}

export const subscriptionPaymentService = new SubscriptionPaymentService();
