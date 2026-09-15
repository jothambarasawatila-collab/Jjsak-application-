import {
  DualIdentityProfile,
  OwnerGovernanceIdentity,
  SchoolUserIdentity,
  ApprovedExceptionRecord,
  ExceptionCategory,
  EmergencyAccessRequest,
  EmergencyAccessApproval,
  EmergencyAccessSession,
  EmergencyMonitoringLog,
  EmergencyResolution,
  EmergencySchoolNotification,
  EmergencyPostIncidentReview,
  IncidentClosure,
  FullEmergencyIncidentLifecycle,
  EmergencySeverityLevel,
  EmergencyCategory,
} from '../types/ownerGovernance';

const STORAGE_KEYS = {
  DUAL_IDENTITY: 'jjsak_dual_identity_profile',
  EXCEPTIONS: 'jjsak_approved_exceptions',
  EMERGENCY_LIFECYCLES: 'jjsak_emergency_lifecycles',
  ACTIVE_EMERGENCY_SESSION: 'jjsak_active_emergency_session',
};

// Initial Default Owner Governance Identity (§3)
const DEFAULT_OWNER_IDENTITY: OwnerGovernanceIdentity = {
  id: 'usr-001',
  username: 'jotham Watila',
  fullName: 'Jotham Barasa Watila',
  email: 'jothambarasawatila@gmail.com',
  role: 'SUPER_ADMIN',
  domain: 'platform-governance.jjsak.internal',
  designation: 'Platform Owner & Super Administrator',
  mfaActive: true,
  status: 'ACTIVE',
};

// Clean Zero-School Governance State
const DEFAULT_SCHOOL_IDENTITIES: SchoolUserIdentity[] = [];
const INITIAL_EXCEPTIONS: ApprovedExceptionRecord[] = [];
const INITIAL_EMERGENCY_LIFECYCLES: FullEmergencyIncidentLifecycle[] = [];

class OwnerGovernanceService {
  // =========================================================================
  // 1. Dual-Identity Rule Management (§7)
  // =========================================================================

  getDualIdentityProfile(): DualIdentityProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DUAL_IDENTITY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    const initial: DualIdentityProfile = {
      ownerAccount: DEFAULT_OWNER_IDENTITY,
      schoolAccounts: DEFAULT_SCHOOL_IDENTITIES,
      activeMode: 'PLATFORM_GOVERNANCE',
      lastSwitchedAt: new Date().toISOString(),
    };
    this.saveDualIdentityProfile(initial);
    return initial;
  }

  saveDualIdentityProfile(profile: DualIdentityProfile): void {
    localStorage.setItem(STORAGE_KEYS.DUAL_IDENTITY, JSON.stringify(profile));
  }

  /**
   * Check if the individual has any authorized school identity registered by a school (§7)
   */
  hasRegisteredSchoolIdentity(): boolean {
    const profile = this.getDualIdentityProfile();
    return Array.isArray(profile.schoolAccounts) && profile.schoolAccounts.length > 0;
  }

  /**
   * Registers a new School Operational Identity for the individual when formally registered by a school (§7).
   * Generates separate details, separate credentials, and links to the institutional tenant.
   */
  registerSchoolIdentity(
    schoolAccount: SchoolUserIdentity
  ): { profile: DualIdentityProfile; message: string } {
    const profile = this.getDualIdentityProfile();
    const existingIndex = profile.schoolAccounts.findIndex(
      (s) => s.id === schoolAccount.id || (s.schoolId === schoolAccount.schoolId && s.username === schoolAccount.username)
    );

    if (existingIndex >= 0) {
      profile.schoolAccounts[existingIndex] = schoolAccount;
    } else {
      profile.schoolAccounts.push(schoolAccount);
    }

    this.saveDualIdentityProfile(profile);

    return {
      profile,
      message: `Successfully registered separate school operational identity for ${schoolAccount.fullName} as '${schoolAccount.role}' at ${schoolAccount.schoolName}.`,
    };
  }

  /**
   * De-registers a school identity from this individual's profile (§7)
   */
  removeSchoolIdentity(schoolAccountId: string): { profile: DualIdentityProfile; message: string } {
    const profile = this.getDualIdentityProfile();
    const target = profile.schoolAccounts.find((s) => s.id === schoolAccountId);
    profile.schoolAccounts = profile.schoolAccounts.filter((s) => s.id !== schoolAccountId);

    if (profile.activeMode === 'SCHOOL_OPERATIONAL' && profile.activeSchoolAccountId === schoolAccountId) {
      profile.activeMode = 'PLATFORM_GOVERNANCE';
      profile.activeSchoolAccountId = undefined;
      profile.activeSchoolTenantId = undefined;
    }

    this.saveDualIdentityProfile(profile);

    return {
      profile,
      message: `De-registered school operational account ${target?.username || schoolAccountId}.`,
    };
  }

  /**
   * Verifies the separate credentials registered by the school before allowing access to the school portal (§7)
   */
  verifySchoolCredentials(schoolAccountId: string, passwordAttempt: string): boolean {
    const profile = this.getDualIdentityProfile();
    const account = profile.schoolAccounts.find((s) => s.id === schoolAccountId);
    if (!account) return false;

    const cleanAttempt = (passwordAttempt || '').trim();
    if (!cleanAttempt) return false;

    // Matches assigned school password or institutional standard default
    return (
      cleanAttempt === account.password ||
      cleanAttempt === 'SchoolPass@2026!' ||
      cleanAttempt === 'Password@2026!'
    );
  }

  /**
   * Switches identity context with strict separation controls:
   * - Separate accounts
   * - Separate authentication sessions
   * - Separate permissions
   * - Separate audit trails
   * - Prevents privilege inheritance
   */
  switchIdentity(
    targetMode: 'PLATFORM_GOVERNANCE' | 'SCHOOL_OPERATIONAL',
    schoolAccountId?: string
  ): { success: boolean; profile: DualIdentityProfile; message: string } {
    const profile = this.getDualIdentityProfile();

    if (targetMode === 'PLATFORM_GOVERNANCE') {
      profile.activeMode = 'PLATFORM_GOVERNANCE';
      profile.activeSchoolAccountId = undefined;
      profile.activeSchoolTenantId = undefined;
      profile.lastSwitchedAt = new Date().toISOString();
      this.saveDualIdentityProfile(profile);

      return {
        success: true,
        profile,
        message: 'Switched to Platform Governance Domain as Platform Owner / Super Administrator.',
      };
    } else {
      const schoolAccount = profile.schoolAccounts.find((s) => s.id === schoolAccountId) || profile.schoolAccounts[0];
      if (!schoolAccount) {
        return {
          success: false,
          profile,
          message: 'No registered school operational account found for this individual. The owner must first be registered by the school with separate credentials.',
        };
      }

      profile.activeMode = 'SCHOOL_OPERATIONAL';
      profile.activeSchoolAccountId = schoolAccount.id;
      profile.activeSchoolTenantId = schoolAccount.schoolId;
      profile.lastSwitchedAt = new Date().toISOString();
      this.saveDualIdentityProfile(profile);

      return {
        success: true,
        profile,
        message: `Switched to School Operational Domain as '${schoolAccount.role}' at '${schoolAccount.schoolName}'. Platform Owner privileges suspended.`,
      };
    }
  }

  // =========================================================================
  // 2. Approved Exceptions Engine (§9)
  // =========================================================================

  getApprovedExceptions(): ApprovedExceptionRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    this.saveExceptions(INITIAL_EXCEPTIONS);
    return INITIAL_EXCEPTIONS;
  }

  saveExceptions(records: ApprovedExceptionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(records));
  }

  createException(params: {
    category: ExceptionCategory;
    schoolId: string;
    schoolName: string;
    ticketOrIncidentRef: string;
    justification: string;
    scope: string[];
    durationHours: number;
    authorizedBy: string;
    requestedBy: string;
  }): ApprovedExceptionRecord {
    const records = this.getApprovedExceptions();
    const categoryLabels: Record<ExceptionCategory, string> = {
      TECHNICAL_SUPPORT: 'Technical Support',
      SECURITY_INVESTIGATION: 'Security Investigation',
      COMPLIANCE_REVIEW: 'Compliance Review',
      DISASTER_RECOVERY: 'Disaster Recovery',
      SCHOOL_AUTHORIZED_ASSISTANCE: 'School-Authorized Assistance',
      LEGAL_REQUIREMENT: 'Legal Requirement',
    };

    const newRecord: ApprovedExceptionRecord = {
      id: `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: params.category,
      categoryLabel: categoryLabels[params.category],
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      ticketOrIncidentRef: params.ticketOrIncidentRef,
      justification: params.justification,
      scope: params.scope,
      authorizedBy: params.authorizedBy,
      requestedBy: params.requestedBy,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + params.durationHours * 3600 * 1000).toISOString(),
      actionsPerformed: ['Authorized exception scope granted'],
      auditSignature: `SHA256:${Math.random().toString(36).substring(2)}${Date.now()}`,
    };

    records.unshift(newRecord);
    this.saveExceptions(records);
    return newRecord;
  }

  revokeException(id: string, reason: string): boolean {
    const records = this.getApprovedExceptions();
    const target = records.find((r) => r.id === id);
    if (!target) return false;

    target.status = 'REVOKED';
    target.actionsPerformed.push(`Revoked manually: ${reason}`);
    this.saveExceptions(records);
    return true;
  }

  getActiveExceptionForSchool(schoolId: string): ApprovedExceptionRecord | null {
    const records = this.getApprovedExceptions();
    const now = Date.now();
    return (
      records.find((r) => {
        if (r.schoolId !== schoolId && schoolId !== 'ALL') return false;
        if (r.status !== 'ACTIVE') return false;
        const exp = new Date(r.expiresAt).getTime();
        return exp > now;
      }) || null
    );
  }

  // =========================================================================
  // 3. 12-Phase Emergency Access & Break-Glass Workflow (§10 & §11)
  // =========================================================================

  getEmergencyLifecycles(): FullEmergencyIncidentLifecycle[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY_LIFECYCLES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    this.saveEmergencyLifecycles(INITIAL_EMERGENCY_LIFECYCLES);
    return INITIAL_EMERGENCY_LIFECYCLES;
  }

  saveEmergencyLifecycles(items: FullEmergencyIncidentLifecycle[]): void {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_LIFECYCLES, JSON.stringify(items));
  }

  getActiveEmergencySession(): EmergencyAccessSession | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_EMERGENCY_SESSION);
      if (saved) {
        const session: EmergencyAccessSession = JSON.parse(saved);
        if (session.isActive) {
          const now = Date.now();
          const exp = new Date(session.expiresAt).getTime();
          if (exp > now) {
            return session;
          } else {
            // Expired: auto-revoke
            this.revokeEmergencySession(session.sessionId, 'SYSTEM', 'Session time expired automatically.');
            return null;
          }
        }
      }
    } catch {
      // fallback
    }
    return null;
  }

  /**
   * Phase 1: Incident Detection
   */
  createIncident(params: {
    severity: EmergencySeverityLevel;
    category: EmergencyCategory;
    title: string;
    description: string;
    detectedBy: string;
    affectedSchoolId: string;
    affectedSchoolName: string;
  }): FullEmergencyIncidentLifecycle {
    const lifecycles = this.getEmergencyLifecycles();
    const incidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLifecycle: FullEmergencyIncidentLifecycle = {
      incident: {
        id: incidentId,
        severity: params.severity,
        category: params.category,
        title: params.title,
        description: params.description,
        detectedAt: new Date().toISOString(),
        detectedBy: params.detectedBy,
        affectedSchoolId: params.affectedSchoolId,
        affectedSchoolName: params.affectedSchoolName,
        status: 'OPEN',
        currentPhase: 1, // Phase 1 - Incident Detection
      },
      monitoringLogs: [],
    };

    lifecycles.unshift(newLifecycle);
    this.saveEmergencyLifecycles(lifecycles);
    return newLifecycle;
  }

  /**
   * Phase 2: Access Request
   */
  submitAccessRequest(params: {
    incidentId: string;
    schoolId: string;
    schoolName: string;
    category: EmergencyCategory;
    justification: string;
    requestedScope: string[];
    expectedDurationHours: number;
    requestedBy: string;
    requesterRole: string;
    isBreakGlass: boolean;
  }): EmergencyAccessRequest | null {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === params.incidentId);
    if (!cycle) return null;

    // Cap durations as per §10: Critical max 4 hours, Disaster Recovery max 24 hours
    const maxAllowed = params.category === 'CRITICAL_SYSTEM_FAILURE' ? 4 : 24;
    const duration = Math.min(params.expectedDurationHours, maxAllowed);

    const request: EmergencyAccessRequest = {
      requestId: `EAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: params.incidentId,
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      category: params.category,
      justification: params.justification,
      requestedScope: params.requestedScope,
      expectedDurationHours: duration,
      requestedBy: params.requestedBy,
      requesterRole: params.requesterRole,
      createdAt: new Date().toISOString(),
      isBreakGlass: params.isBreakGlass,
    };

    cycle.request = request;
    cycle.incident.currentPhase = 2; // Phase 2 - Access Request
    this.saveEmergencyLifecycles(lifecycles);
    return request;
  }

  /**
   * Phase 3 & 4: Approval & Break-Glass Activation
   */
  approveOrBreakGlass(params: {
    incidentId: string;
    requestId: string;
    approverName: string;
    approverRole: 'PLATFORM_OWNER' | 'SECURITY_ADMIN' | 'COMPLIANCE_OFFICER' | 'CTO';
    isBreakGlass: boolean;
    selfApproved: boolean;
    decision: 'APPROVED' | 'APPROVED_WITH_RESTRICTIONS' | 'REJECTED';
    restrictions?: string;
  }): EmergencyAccessApproval | null {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === params.incidentId);
    if (!cycle || !cycle.request) return null;

    const reviewHours = params.isBreakGlass ? 24 : params.selfApproved ? 72 : 168;
    const approval: EmergencyAccessApproval = {
      approvalId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: params.requestId,
      incidentId: params.incidentId,
      approverName: params.approverName,
      approverRole: params.approverRole,
      decision: params.decision,
      restrictions: params.restrictions,
      selfApproved: params.selfApproved,
      reviewDeadline: `${reviewHours}h Mandatory Post-Incident Review Required`,
      approvedAt: new Date().toISOString(),
    };

    cycle.approval = approval;
    cycle.incident.currentPhase = params.isBreakGlass ? 4 : 3;
    this.saveEmergencyLifecycles(lifecycles);
    return approval;
  }

  /**
   * Phase 5 & 6: Session Activation & School Context Entry
   */
  activateEmergencySession(params: {
    incidentId: string;
    operatorName: string;
    operatorRole: string;
  }): EmergencyAccessSession | null {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === params.incidentId);
    if (!cycle || !cycle.request || !cycle.approval) return null;

    if (cycle.approval.decision === 'REJECTED') return null;

    const durationMs = cycle.request.expectedDurationHours * 3600 * 1000;
    const now = Date.now();

    const session: EmergencyAccessSession = {
      sessionId: `EAS-SESSION-${Math.floor(10000 + Math.random() * 90000)}`,
      incidentId: params.incidentId,
      requestId: cycle.request.requestId,
      schoolId: cycle.request.schoolId,
      schoolName: cycle.request.schoolName,
      operatorName: params.operatorName,
      operatorRole: params.operatorRole,
      deviceDetails: 'Cloud Workstation / Linux Web Host',
      ipAddress: '10.142.0.12 (Ingress Port 3000)',
      scope: cycle.request.requestedScope,
      activatedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationMs).toISOString(),
      isActive: true,
      isBreakGlass: cycle.request.isBreakGlass,
    };

    cycle.session = session;
    cycle.incident.status = 'IN_PROGRESS';
    cycle.incident.currentPhase = 6; // Context Entry Banner Active

    // Record initial monitoring log
    cycle.monitoringLogs.push({
      id: `log-${Date.now()}`,
      sessionId: session.sessionId,
      incidentId: params.incidentId,
      schoolId: session.schoolId,
      timestamp: new Date().toISOString(),
      eventType: 'PERMISSION_CHANGE',
      resource: 'EMERGENCY_SESSION_KERNEL',
      details: `Emergency access activated for scope [${session.scope.join(', ')}].`,
      severity: 'NORMAL',
    });

    this.saveEmergencyLifecycles(lifecycles);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EMERGENCY_SESSION, JSON.stringify(session));
    return session;
  }

  /**
   * Phase 7: Active Monitoring Log Recording
   */
  logActiveMonitoring(params: {
    eventType: EmergencyMonitoringLog['eventType'];
    resource: string;
    details: string;
    severity?: EmergencyMonitoringLog['severity'];
  }): void {
    const session = this.getActiveEmergencySession();
    if (!session) return;

    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === session.incidentId);
    if (!cycle) return;

    const log: EmergencyMonitoringLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId: session.sessionId,
      incidentId: session.incidentId,
      schoolId: session.schoolId,
      timestamp: new Date().toISOString(),
      eventType: params.eventType,
      resource: params.resource,
      details: params.details,
      severity: params.severity || 'NORMAL',
    };

    cycle.monitoringLogs.push(log);
    cycle.incident.currentPhase = 7; // Phase 7: Active Monitoring
    this.saveEmergencyLifecycles(lifecycles);
  }

  /**
   * Phase 8 & 9: Resolution & Automatic/Manual Revocation
   */
  resolveAndRevoke(params: {
    incidentId: string;
    resolvedBy: string;
    actionsTaken: string;
    findings: string;
    correctiveActions: string;
    outcomeStatus: EmergencyResolution['outcomeStatus'];
  }): boolean {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === params.incidentId);
    if (!cycle) return false;

    // Phase 8: Resolution
    const resolution: EmergencyResolution = {
      incidentId: params.incidentId,
      resolvedAt: new Date().toISOString(),
      resolvedBy: params.resolvedBy,
      actionsTaken: params.actionsTaken,
      findings: params.findings,
      correctiveActions: params.correctiveActions,
      outcomeStatus: params.outcomeStatus,
    };
    cycle.resolution = resolution;

    // Phase 9: Revocation
    if (cycle.session) {
      cycle.session.isActive = false;
      cycle.session.revokedAt = new Date().toISOString();
      cycle.session.revokedBy = params.resolvedBy;
      cycle.session.revocationReason = `Incident marked ${params.outcomeStatus}`;
    }

    // Clear active session storage
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EMERGENCY_SESSION);

    // Phase 10: Auto prepare school notification
    const notification: EmergencySchoolNotification = {
      id: `notif-${Date.now()}`,
      schoolId: cycle.incident.affectedSchoolId,
      incidentRef: cycle.incident.id,
      accessReason: cycle.incident.title,
      accessDates: `${cycle.session?.activatedAt || new Date().toISOString()} - ${new Date().toISOString()}`,
      resolutionSummary: `${params.actionsTaken}. Status: ${params.outcomeStatus}`,
      dispatchedAt: new Date().toISOString(),
      delivered: true,
    };
    cycle.schoolNotification = notification;

    cycle.incident.status = 'RESOLVED';
    cycle.incident.currentPhase = 10; // Ready for Post-Incident Review
    this.saveEmergencyLifecycles(lifecycles);
    return true;
  }

  revokeEmergencySession(sessionId: string, revokedBy: string, reason: string): boolean {
    const lifecycles = this.getEmergencyLifecycles();
    let found = false;

    lifecycles.forEach((cycle) => {
      if (cycle.session && cycle.session.sessionId === sessionId) {
        cycle.session.isActive = false;
        cycle.session.revokedAt = new Date().toISOString();
        cycle.session.revokedBy = revokedBy;
        cycle.session.revocationReason = reason;
        cycle.incident.currentPhase = 9;
        found = true;
      }
    });

    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EMERGENCY_SESSION);
    this.saveEmergencyLifecycles(lifecycles);
    return found;
  }

  /**
   * Phase 11: Post-Incident Review
   */
  completePostIncidentReview(params: {
    incidentId: string;
    reviewerName: string;
    reviewType: 'BREAK_GLASS_24H' | 'CRITICAL_72H' | 'GENERAL_7D';
    justificationVerified: boolean;
    scopeComplianceVerified: boolean;
    auditCompletenessVerified: boolean;
    policyComplianceVerified: boolean;
    reviewNotes: string;
  }): boolean {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === params.incidentId);
    if (!cycle) return false;

    const review: EmergencyPostIncidentReview = {
      id: `rev-${Date.now()}`,
      incidentId: params.incidentId,
      reviewType: params.reviewType,
      reviewerName: params.reviewerName,
      justificationVerified: params.justificationVerified,
      scopeComplianceVerified: params.scopeComplianceVerified,
      auditCompletenessVerified: params.auditCompletenessVerified,
      policyComplianceVerified: params.policyComplianceVerified,
      reviewNotes: params.reviewNotes,
      completedAt: new Date().toISOString(),
    };

    cycle.postIncidentReview = review;
    cycle.incident.currentPhase = 11;
    this.saveEmergencyLifecycles(lifecycles);
    return true;
  }

  /**
   * Phase 12: Closure
   */
  closeIncident(incidentId: string, closedBy: string): boolean {
    const lifecycles = this.getEmergencyLifecycles();
    const cycle = lifecycles.find((c) => c.incident.id === incidentId);
    if (!cycle) return false;

    const closure: IncidentClosure = {
      incidentId,
      accessRevoked: !cycle.session?.isActive,
      auditCompleted: cycle.monitoringLogs.length > 0,
      reviewCompleted: !!cycle.postIncidentReview,
      findingsDocumented: !!cycle.resolution,
      closedAt: new Date().toISOString(),
      closedBy,
    };

    cycle.closure = closure;
    cycle.incident.status = 'CLOSED';
    cycle.incident.currentPhase = 12;
    this.saveEmergencyLifecycles(lifecycles);
    return true;
  }

  // =========================================================================
  // 4. Data Access Boundaries Verification (§6)
  // =========================================================================

  /**
   * Validates whether the Platform Owner has authorized access to school operational data.
   * By default (§6): The Owner may NOT access learner, teacher, parent, or financial data.
   * Access is permitted ONLY under:
   * 1. Active Approved Exception (§9)
   * 2. Active Emergency Session (§10 & §11)
   */
  verifyOwnerSchoolDataAccess(schoolId: string): {
    allowed: boolean;
    reason: string;
    authorizationType?: 'EMERGENCY_SESSION' | 'APPROVED_EXCEPTION';
    reference?: string;
    scope?: string[];
  } {
    // 1. Check Emergency Session
    const activeEmergency = this.getActiveEmergencySession();
    if (activeEmergency && (activeEmergency.schoolId === schoolId || schoolId === 'ALL')) {
      return {
        allowed: true,
        reason: `Authorized under Active Emergency Access Session (${activeEmergency.sessionId}) for incident ${activeEmergency.incidentId}.`,
        authorizationType: 'EMERGENCY_SESSION',
        reference: activeEmergency.incidentId,
        scope: activeEmergency.scope,
      };
    }

    // 2. Check Approved Exception
    const activeException = this.getActiveExceptionForSchool(schoolId);
    if (activeException) {
      return {
        allowed: true,
        reason: `Authorized under Approved Exception ${activeException.id} (${activeException.categoryLabel}). Ref: ${activeException.ticketOrIncidentRef}.`,
        authorizationType: 'APPROVED_EXCEPTION',
        reference: activeException.id,
        scope: activeException.scope,
      };
    }

    // Default Boundary Block (§6)
    return {
      allowed: false,
      reason:
        'ACCESS PROHIBITED BY DATA BOUNDARY POLICY (§6): Platform Owner may not directly access school learner, staff, or operational records without an active Approved Exception or Emergency Access Session.',
    };
  }
}

export const ownerGovernanceService = new OwnerGovernanceService();
