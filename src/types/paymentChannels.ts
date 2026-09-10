export type PaymentMethod =
  | 'MPESA_BUSINESS'
  | 'MPESA_PAYBILL'
  | 'MPESA_TILL'
  | 'MPESA_POCHI'
  | 'BANK_TRANSFER'
  | 'CUSTOM';

export type PaymentChannelStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING_VERIFICATION'
  | 'REPLACED'
  | 'EXPIRED';

export interface SubscriptionPaymentChannel {
  id: string;
  method: PaymentMethod;
  providerName: string;
  accountName: string;
  paybillNumber?: string;
  tillNumber?: string;
  businessNumber?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  swiftCode?: string;
  accountReferenceInstructions: string;
  currency: string;
  paymentPurpose: string;
  status: PaymentChannelStatus;
  isPrimary: boolean;
  effectiveDate: string;
  expiryDate?: string;
  internalDescription?: string;
  createdAt: number;
  updatedAt: number;
  createdById: string;
  createdByName: string;
  lastModifiedById: string;
  lastModifiedByName: string;
}

/**
 * Public channel info exposed safely to school users in subscription UI.
 * Internal description and security metadata are omitted.
 */
export interface PublicPaymentChannelInfo {
  id: string;
  method: PaymentMethod;
  providerName: string;
  accountName: string;
  paybillNumber?: string;
  tillNumber?: string;
  businessNumber?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  accountReferenceInstructions: string;
  currency: string;
  paymentPurpose: string;
  isPrimary: boolean;
  effectiveDate: string;
}

export type PaymentChannelActionType =
  | 'CREATED'
  | 'UPDATED'
  | 'REPLACED'
  | 'ACTIVATED'
  | 'DEACTIVATED'
  | 'EMERGENCY_DEACTIVATED'
  | 'PRIMARY_DESIGNATED'
  | 'LEGACY_RESET_PURGE';

export interface PaymentChannelHistoryRecord {
  id: string;
  channelId: string;
  channelName: string;
  timestamp: number;
  modifiedByUserId: string;
  modifiedByUserName: string;
  actionType: PaymentChannelActionType;
  reason: string;
  previousSnapshot?: Partial<SubscriptionPaymentChannel>;
  newSnapshot: Partial<SubscriptionPaymentChannel>;
  ipAddress?: string;
  authMethod?: string;
}

/**
 * JJSAK Official Payment Verification Status Rules:
 * PENDING_VALIDATION - Payment submitted and awaiting Owner review.
 * VALIDATED - Payment approved by the Owner and applied to school subscription account.
 * REJECTED - Payment rejected due to invalid, incomplete, duplicate, fraudulent or unverified details.
 * UNDER_REVIEW - Payment requires additional verification before a final decision.
 * Note: ENTERED_UNVERIFIED and VERIFIED_ACTIVE retained as aliases for backward compatibility.
 */
export type PaymentVerificationStatus =
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'REJECTED'
  | 'UNDER_REVIEW'
  | 'ENTERED_UNVERIFIED'
  | 'VERIFIED_ACTIVE';

export interface SubscriptionTransactionRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolCode?: string;
  transactionReference: string;
  paymentReferenceNumber?: string;
  mpesaTransactionCode?: string;
  paymentMethod: PaymentMethod;
  channelId: string;
  channelSnapshot: string;
  amount: number;
  currency: string;
  timestamp: number;
  subscriptionPeriod: string;
  invoiceId?: string;
  currentSubscriptionBalanceSnapshot?: number;
  submittedByUserId?: string;
  submittedByUserName?: string;
  submittedByUserRole?: string;
  proofDocumentName?: string;
  verificationStatus: PaymentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: number;
  validatedAt?: number;
  verificationNotes?: string;
  ownerRemarks?: string;
  validationDate?: number;
  darajaReceiptNumber?: string;
}

export interface OwnerPaymentNotification {
  id: string;
  timestamp: number;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  amountPaid: number;
  paymentReferenceNumber: string;
  mpesaTransactionCode: string;
  dateTime: string;
  subscriptionInvoice: string;
  subscriptionPeriod: string;
  currentSubscriptionBalance: number;
  channelsDispatched: ('IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP')[];
  isRead: boolean;
  status: PaymentVerificationStatus;
  ownerRemarks?: string;
}

/**
 * Check if a role is authorized to access the Subscription Portal.
 * Restricted strictly to:
 * - Head of Institution
 * - Deputy Head of Institution
 * - Director of Academics
 * (And Owner/Super Administrator for platform governance).
 */
export const isAuthorizedSubscriptionRole = (role?: string): boolean => {
  if (!role) return false;
  const norm = role.toUpperCase();
  return (
    norm === 'HEAD_OF_INSTITUTION' ||
    norm === 'HEAD' ||
    norm === 'HEADTEACHER' ||
    norm === 'DEPUTY_HEAD_OF_INSTITUTION' ||
    norm === 'DEPUTY' ||
    norm === 'DEPUTY_HEADTEACHER' ||
    norm === 'DIRECTOR_OF_ACADEMICS' ||
    norm === 'DIRECTOR_ACADEMICS' ||
    norm === 'SUPER_ADMIN' ||
    norm === 'SYSTEM_ADMIN'
  );
};

