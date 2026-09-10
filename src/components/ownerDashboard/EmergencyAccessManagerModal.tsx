import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  X,
  Activity,
  History,
  AlertTriangle,
} from 'lucide-react';
import {
  EmergencySeverityLevel,
  EmergencyCategory,
  FullEmergencyIncidentLifecycle,
  EmergencyAccessSession,
} from '../../types/ownerGovernance';
import { SchoolTenant } from '../../types';
import { ownerGovernanceService } from '../../services/ownerGovernanceService';

interface EmergencyAccessManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: SchoolTenant[];
  onSessionActivated?: (session: EmergencyAccessSession) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const EmergencyAccessManagerModal: React.FC<EmergencyAccessManagerModalProps> = ({
  isOpen,
  onClose,
  tenants = [],
  onSessionActivated,
  onLogAudit,
}) => {
  const [lifecycles, setLifecycles] = useState<FullEmergencyIncidentLifecycle[]>(() =>
    ownerGovernanceService.getEmergencyLifecycles()
  );
  const [activeSession, setActiveSession] = useState<EmergencyAccessSession | null>(() =>
    ownerGovernanceService.getActiveEmergencySession()
  );

  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'NEW_INCIDENT' | 'BREAK_GLASS' | 'LIFECYCLE_DETAILS'>(
    'INCIDENTS'
  );
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    lifecycles[0]?.incident.id || ''
  );

  // New Incident State (Phase 1)
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<EmergencySeverityLevel>('LEVEL_1_CRITICAL');
  const [newCategory, setNewCategory] = useState<EmergencyCategory>('CRITICAL_SYSTEM_FAILURE');
  const [newSchoolId, setNewSchoolId] = useState<string>(tenants[0]?.schoolId || 'sch-ngonyek-001');

  // Request State (Phase 2)
  const [justification, setJustification] = useState('');
  const [requestedScopes, setRequestedScopes] = useState<string[]>([
    'DATABASE_CONTAINER',
    'SYSTEM_LOGS',
  ]);
  const [durationHours, setDurationHours] = useState<number>(2);

  // Resolution Form (Phase 8)
  const [actionsTaken, setActionsTaken] = useState('');
  const [findings, setFindings] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<'RESOLVED' | 'PARTIALLY_RESOLVED' | 'ESCALATED' | 'MONITORING_REQUIRED'>(
    'RESOLVED'
  );

  // Post-Incident Review (Phase 11)
  const [reviewNotes, setReviewNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedCycle = lifecycles.find((c) => c.incident.id === selectedIncidentId) || lifecycles[0];

  // Handler: Create Incident (Phase 1)
  const handleCreateIncident = (isBreakGlassDirect: boolean = false) => {
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Please provide an Incident Title and Description.');
      return;
    }

    const school = tenants.find((t) => t.schoolId === newSchoolId);
    const schoolName = school ? school.schoolName : 'Affected Institutional Tenant';

    const created = ownerGovernanceService.createIncident({
      title: newTitle.trim(),
      description: newDescription.trim(),
      severity: newSeverity,
      category: newCategory,
      detectedBy: 'Platform Owner / Super Administrator (Manual Sentry)',
      affectedSchoolId: newSchoolId,
      affectedSchoolName: schoolName,
    });

    onLogAudit?.(
      'EMERGENCY_INCIDENT_DETECTED',
      `Emergency incident created: [${created.incident.id}] '${created.incident.title}' (${newSeverity}) for school ${schoolName}.`
    );

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    setSelectedIncidentId(created.incident.id);

    if (isBreakGlassDirect) {
      handleExecuteBreakGlass(created.incident.id);
    } else {
      setActiveTab('LIFECYCLE_DETAILS');
      showToast(`Incident [${created.incident.id}] detected and registered (Phase 1).`);
    }
  };

  // Handler: Submit Request (Phase 2)
  const handleSubmitRequest = (incidentId: string) => {
    if (!justification.trim()) {
      showToast('Mandatory justification required for Emergency Access Request.');
      return;
    }

    const cycle = lifecycles.find((c) => c.incident.id === incidentId);
    if (!cycle) return;

    ownerGovernanceService.submitAccessRequest({
      incidentId,
      schoolId: cycle.incident.affectedSchoolId,
      schoolName: cycle.incident.affectedSchoolName,
      category: cycle.incident.category,
      justification: justification.trim(),
      requestedScope: requestedScopes,
      expectedDurationHours: durationHours,
      requestedBy: 'Jotham Barasa Watila (Platform Owner)',
      requesterRole: 'SUPER_ADMIN',
      isBreakGlass: false,
    });

    onLogAudit?.(
      'EMERGENCY_REQUEST_SUBMITTED',
      `Emergency Access Request submitted for [${incidentId}]. Scope: ${requestedScopes.join(', ')}. Justification: ${justification.trim()}`
    );

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    showToast('Emergency Access Request submitted (Phase 2). Awaiting Approval.');
  };

  // Handler: Approve Request (Phase 3)
  const handleApproveRequest = (incidentId: string) => {
    const cycle = lifecycles.find((c) => c.incident.id === incidentId);
    if (!cycle || !cycle.request) return;

    ownerGovernanceService.approveOrBreakGlass({
      incidentId,
      requestId: cycle.request.requestId,
      approverName: 'Jotham Barasa Watila (Platform Owner)',
      approverRole: 'PLATFORM_OWNER',
      isBreakGlass: false,
      selfApproved: true,
      decision: 'APPROVED',
    });

    onLogAudit?.(
      'EMERGENCY_REQUEST_APPROVED',
      `Emergency request for [${incidentId}] self-approved under §10 policy limitation (72h mandatory post-incident review requirement).`
    );

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    showToast('Emergency Access Approved (Phase 3). Ready to Activate Session.');
  };

  // Handler: Immediate Break-Glass (Phase 4)
  const handleExecuteBreakGlass = (incidentId: string) => {
    const cycle = lifecycles.find((c) => c.incident.id === incidentId);
    if (!cycle) return;

    // Auto generate request if not exists
    let req = cycle.request;
    if (!req) {
      req = ownerGovernanceService.submitAccessRequest({
        incidentId,
        schoolId: cycle.incident.affectedSchoolId,
        schoolName: cycle.incident.affectedSchoolName,
        category: cycle.incident.category,
        justification: justification.trim() || 'IMMEDIATE BREAK-GLASS ACTIVATION: Critical system unavailability or data integrity incident.',
        requestedScope: requestedScopes,
        expectedDurationHours: durationHours || 2,
        requestedBy: 'Jotham Barasa Watila (Platform Owner)',
        requesterRole: 'SUPER_ADMIN',
        isBreakGlass: true,
      })!;
    }

    // Auto approve under break glass
    ownerGovernanceService.approveOrBreakGlass({
      incidentId,
      requestId: req.requestId,
      approverName: 'Jotham Barasa Watila (Break-Glass Protocol)',
      approverRole: 'PLATFORM_OWNER',
      isBreakGlass: true,
      selfApproved: true,
      decision: 'APPROVED',
    });

    // Activate session
    const session = ownerGovernanceService.activateEmergencySession({
      incidentId,
      operatorName: 'Jotham Barasa Watila',
      operatorRole: 'SUPER_ADMIN',
    });

    if (session) {
      setActiveSession(session);
      onSessionActivated?.(session);
      onLogAudit?.(
        'BREAK_GLASS_ACTIVATED',
        `BREAK-GLASS EMERGENCY ACCESS ACTIVATED for tenant [${session.schoolName}] (${session.schoolId}) under incident [${incidentId}]. 24h mandatory review scheduled.`
      );
      showToast(`BREAK-GLASS SESSION ACTIVATED: ${session.sessionId} (Phase 5 & 6)`);
      setActiveTab('LIFECYCLE_DETAILS');
    }

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
  };

  // Handler: Activate Session (Phase 5 & 6)
  const handleStartSession = (incidentId: string) => {
    const session = ownerGovernanceService.activateEmergencySession({
      incidentId,
      operatorName: 'Jotham Barasa Watila',
      operatorRole: 'SUPER_ADMIN',
    });

    if (session) {
      setActiveSession(session);
      onSessionActivated?.(session);
      onLogAudit?.(
        'EMERGENCY_SESSION_ACTIVATED',
        `Emergency Access Session [${session.sessionId}] activated for incident [${incidentId}]. Scope: ${session.scope.join(', ')}.`
      );
      showToast(`Emergency Session [${session.sessionId}] active for ${session.schoolName}.`);
    }

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
  };

  // Handler: Resolve & Revoke (Phase 8, 9 & 10)
  const handleResolveAndRevoke = (incidentId: string) => {
    if (!actionsTaken.trim() || !findings.trim()) {
      showToast('Please provide findings and actions taken to resolve incident.');
      return;
    }

    ownerGovernanceService.resolveAndRevoke({
      incidentId,
      resolvedBy: 'Jotham Barasa Watila (Platform Owner)',
      actionsTaken: actionsTaken.trim(),
      findings: findings.trim(),
      correctiveActions: correctiveActions.trim() || 'No additional corrective action required.',
      outcomeStatus,
    });

    setActiveSession(null);
    onLogAudit?.(
      'EMERGENCY_INCIDENT_RESOLVED',
      `Emergency incident [${incidentId}] marked ${outcomeStatus}. Emergency access permissions automatically revoked (§11 Phase 9). School notification queued.`
    );

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    showToast(`Incident resolved and temporary access revoked (Phase 8, 9 & 10).`);
  };

  // Handler: Complete Post-Incident Review (Phase 11)
  const handleCompleteReview = (incidentId: string) => {
    ownerGovernanceService.completePostIncidentReview({
      incidentId,
      reviewerName: 'Platform Owner & Security Review Board',
      reviewType: 'BREAK_GLASS_24H',
      justificationVerified: true,
      scopeComplianceVerified: true,
      auditCompletenessVerified: true,
      policyComplianceVerified: true,
      reviewNotes: reviewNotes.trim() || 'Post-incident review confirmed access complied with Section 10 least-privilege standards.',
    });

    onLogAudit?.(
      'POST_INCIDENT_REVIEW_COMPLETED',
      `Post-Incident Review completed for [${incidentId}]. Audit trails verified.`
    );

    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    showToast('Post-Incident Review Completed (Phase 11).');
  };

  // Handler: Close Incident (Phase 12)
  const handleCloseIncident = (incidentId: string) => {
    ownerGovernanceService.closeIncident(incidentId, 'Jotham Barasa Watila (Platform Owner)');
    onLogAudit?.(
      'EMERGENCY_INCIDENT_CLOSED',
      `Emergency Incident [${incidentId}] formally closed (Phase 12). All governance requirements fulfilled.`
    );
    setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
    showToast(`Incident [${incidentId}] formally closed.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Emergency Access &amp; Break-Glass Control Center
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                  12-Phase Policy (§10 &amp; §11)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Mandatory time-limited, audited, least-privilege emergency protocol for critical incidents and disaster recovery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-slate-950 text-white rounded-2xl p-3 text-xs font-bold flex items-center gap-2 shadow-lg border border-red-500/40 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active Emergency Session Status Banner */}
        {activeSession && (
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="font-black uppercase tracking-wide">
                    Emergency Session Active: {activeSession.sessionId}
                  </strong>
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">
                    Incident: {activeSession.incidentId}
                  </span>
                </div>
                <p className="text-[11px] text-red-100 mt-0.5">
                  Tenant: <strong>{activeSession.schoolName}</strong> • Scope: [{activeSession.scope.join(', ')}] • Expires:{' '}
                  {new Date(activeSession.expiresAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                ownerGovernanceService.revokeEmergencySession(
                  activeSession.sessionId,
                  'Jotham Barasa Watila',
                  'Operator terminated session early'
                );
                setActiveSession(null);
                setLifecycles(ownerGovernanceService.getEmergencyLifecycles());
                showToast('Emergency session terminated manually.');
              }}
              className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              End Session Now
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'INCIDENTS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Active &amp; Historical Incidents ({lifecycles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIFECYCLE_DETAILS')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'LIFECYCLE_DETAILS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>12-Phase Lifecycle Workflow</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NEW_INCIDENT')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'NEW_INCIDENT'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Detect New Incident (Phase 1)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BREAK_GLASS')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'BREAK_GLASS'
                ? 'bg-red-600 text-white font-black'
                : 'text-red-700 bg-red-50 hover:bg-red-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Break-Glass Emergency Protocol</span>
          </button>
        </div>

        {/* Tab 1: Incidents List */}
        {activeTab === 'INCIDENTS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                Registered Emergency Incidents
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('NEW_INCIDENT')}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                + Register New Incident
              </button>
            </div>

            <div className="space-y-2">
              {lifecycles.map((c) => {
                const isSelected = selectedIncidentId === c.incident.id;
                return (
                  <div
                    key={c.incident.id}
                    onClick={() => {
                      setSelectedIncidentId(c.incident.id);
                      setActiveTab('LIFECYCLE_DETAILS');
                    }}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-50/60 border-red-300 ring-2 ring-red-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{c.incident.id}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            c.incident.severity === 'LEVEL_1_CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.incident.severity.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Phase {c.incident.currentPhase}/12
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                            c.incident.status === 'CLOSED'
                              ? 'bg-slate-100 text-slate-600'
                              : c.incident.status === 'RESOLVED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.incident.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.incident.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        School: <strong>{c.incident.affectedSchoolName}</strong> • Category:{' '}
                        {c.incident.category.replace(/_/g, ' ')} • Detected:{' '}
                        {new Date(c.incident.detectedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Inspect Lifecycle →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Lifecycle Details (All 12 Phases Interactive) */}
        {activeTab === 'LIFECYCLE_DETAILS' && selectedCycle && (
          <div className="space-y-4 text-xs">
            {/* Incident Summary Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-black text-sm">
                    {selectedCycle.incident.id}
                  </span>
                  <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {selectedCycle.incident.severity}
                  </span>
                  <span className="text-slate-400 text-xs">
                    Phase <strong>{selectedCycle.incident.currentPhase} of 12</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Affected: <strong className="text-white">{selectedCycle.incident.affectedSchoolName}</strong>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{selectedCycle.incident.title}</h3>
              <p className="text-[11px] text-slate-300">{selectedCycle.incident.description}</p>
            </div>

            {/* 12-Phase Visual Stepper */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-1 text-[10px] font-mono min-w-[700px]">
                {[
                  { n: 1, label: 'Detection' },
                  { n: 2, label: 'Request' },
                  { n: 3, label: 'Approval' },
                  { n: 4, label: 'Break-Glass' },
                  { n: 5, label: 'Session' },
                  { n: 6, label: 'Context' },
                  { n: 7, label: 'Monitoring' },
                  { n: 8, label: 'Resolution' },
                  { n: 9, label: 'Revocation' },
                  { n: 10, label: 'Notification' },
                  { n: 11, label: 'Review' },
                  { n: 12, label: 'Closure' },
                ].map((step) => {
                  const isDone = selectedCycle.incident.currentPhase >= step.n;
                  const isCurrent = selectedCycle.incident.currentPhase === step.n;
                  return (
                    <div
                      key={step.n}
                      className={`flex-1 p-1.5 rounded-lg text-center font-bold border ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      P{step.n}: {step.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Actions per Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Phase 2: Access Request */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Phase 2 – Access Request</span>
                  </h4>
                  {selectedCycle.request ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Submitted ({selectedCycle.request.requestId})
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>

                {selectedCycle.request ? (
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Justification:</strong> {selectedCycle.request.justification}</div>
                    <div><strong>Scope:</strong> {selectedCycle.request.requestedScope.join(', ')}</div>
                    <div><strong>Duration:</strong> {selectedCycle.request.expectedDurationHours} Hours</div>
                    <div><strong>Requested By:</strong> {selectedCycle.request.requestedBy}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Enter emergency access justification..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={requestedScopes.join(', ')}
                      onChange={(e) => setRequestedScopes(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                      placeholder="Requested Scopes (comma-separated)..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitRequest(selectedCycle.incident.id)}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      Submit Emergency Request (Phase 2)
                    </button>
                  </div>
                )}
              </div>

              {/* Phase 3: Approval */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Phase 3 – Approval Authority</h4>
                  {selectedCycle.approval ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Approved ({selectedCycle.approval.decision})
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Unapproved</span>
                  )}
                </div>

                {selectedCycle.approval ? (
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Approver:</strong> {selectedCycle.approval.approverName}</div>
                    <div><strong>Decision:</strong> {selectedCycle.approval.decision}</div>
                    <div><strong>Review Rule:</strong> {selectedCycle.approval.reviewDeadline}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500">
                      Self-approval permitted under §10 limitation if no peer is available (72h review deadline).
                    </p>
                    <button
                      type="button"
                      disabled={!selectedCycle.request}
                      onClick={() => handleApproveRequest(selectedCycle.incident.id)}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold ${
                        selectedCycle.request
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Authorize Emergency Request (Phase 3)
                    </button>
                  </div>
                )}
              </div>

              {/* Phase 5 & 6: Session Activation */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Phase 5 &amp; 6 – Session Activation</h4>
                  {selectedCycle.session ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedCycle.session.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {selectedCycle.session.isActive ? 'Active' : 'Revoked / Expired'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Not Activated</span>
                  )}
                </div>

                {selectedCycle.session ? (
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Session ID:</strong> {selectedCycle.session.sessionId}</div>
                    <div><strong>Operator:</strong> {selectedCycle.session.operatorName}</div>
                    <div><strong>IP:</strong> {selectedCycle.session.ipAddress}</div>
                    <div><strong>Scope:</strong> {selectedCycle.session.scope.join(', ')}</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedCycle.approval}
                    onClick={() => handleStartSession(selectedCycle.incident.id)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold ${
                      selectedCycle.approval
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Start Temporary Emergency Session
                  </button>
                )}
              </div>

              {/* Phase 8 & 9: Resolution Form */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Phase 8 &amp; 9 – Resolution &amp; Revocation</h4>
                  {selectedCycle.resolution ? (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Resolved ({selectedCycle.resolution.outcomeStatus})
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold">Pending Action</span>
                  )}
                </div>

                {selectedCycle.resolution ? (
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Findings:</strong> {selectedCycle.resolution.findings}</div>
                    <div><strong>Actions Taken:</strong> {selectedCycle.resolution.actionsTaken}</div>
                    <div><strong>Outcome:</strong> {selectedCycle.resolution.outcomeStatus}</div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={actionsTaken}
                      onChange={(e) => setActionsTaken(e.target.value)}
                      placeholder="Actions taken to fix emergency..."
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      placeholder="Root cause findings..."
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={correctiveActions}
                      onChange={(e) => setCorrectiveActions(e.target.value)}
                      placeholder="Corrective actions prevention plan..."
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={outcomeStatus}
                      onChange={(e) => setOutcomeStatus(e.target.value as any)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="RESOLVED">Outcome: Resolved</option>
                      <option value="PARTIALLY_RESOLVED">Outcome: Partially Resolved</option>
                      <option value="MONITORING_REQUIRED">Outcome: Monitoring Required</option>
                      <option value="ESCALATED">Outcome: Escalated</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleResolveAndRevoke(selectedCycle.incident.id)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Resolve Incident &amp; Revoke Access (Phase 8 &amp; 9)
                    </button>
                  </div>
                )}
              </div>

              {/* Phase 10: School Notification */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Phase 10 – School Notification</h4>
                  {selectedCycle.schoolNotification ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Dispatched
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Awaiting Resolution</span>
                  )}
                </div>
                {selectedCycle.schoolNotification && (
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Incident Ref:</strong> {selectedCycle.schoolNotification.incidentRef}</div>
                    <div><strong>Summary:</strong> {selectedCycle.schoolNotification.resolutionSummary}</div>
                    <div><strong>Dispatched At:</strong> {new Date(selectedCycle.schoolNotification.dispatchedAt).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Phase 11 & 12: Post-Incident Review & Closure */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Phase 11 &amp; 12 – Review &amp; Closure</h4>
                  {selectedCycle.closure ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Incident Closed
                    </span>
                  ) : selectedCycle.postIncidentReview ? (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      Review Complete
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold">Awaiting Review</span>
                  )}
                </div>

                {!selectedCycle.postIncidentReview ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Review notes & scope verification..."
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      disabled={!selectedCycle.resolution}
                      onClick={() => handleCompleteReview(selectedCycle.incident.id)}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold ${
                        selectedCycle.resolution
                          ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Complete Post-Incident Review (Phase 11)
                    </button>
                  </div>
                ) : !selectedCycle.closure ? (
                  <button
                    type="button"
                    onClick={() => handleCloseIncident(selectedCycle.incident.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Formally Close Incident (Phase 12)
                  </button>
                ) : (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    Incident formally closed. Audit complete, review verified, permissions revoked.
                  </div>
                )}
              </div>
            </div>

            {/* Active Monitoring Logs (Phase 7) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Phase 7 – Immutable Active Monitoring Trail</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedCycle.monitoringLogs.length} Events Logged
                </span>
              </div>
              {selectedCycle.monitoringLogs.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No events recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedCycle.monitoringLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold font-mono text-slate-800 uppercase mr-2">
                          [{log.eventType}]
                        </span>
                        <span className="text-slate-700">{log.resource}: </span>
                        <span className="text-slate-500">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Detect New Incident (Phase 1 Form) */}
        {activeTab === 'NEW_INCIDENT' && (
          <div className="space-y-3 text-xs">
            <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200 text-blue-900">
              <strong className="block font-bold">Phase 1 – Incident Detection &amp; Classification:</strong>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Every emergency access begins with a verified incident record and generated Incident ID.
              </p>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Affected School Tenant:</label>
                <select
                  value={newSchoolId}
                  onChange={(e) => setNewSchoolId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {tenants.map((t) => (
                    <option key={t.schoolId} value={t.schoolId}>
                      {t.schoolName} ({t.schoolCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity Level:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as EmergencySeverityLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="LEVEL_1_CRITICAL">Level 1 – Critical (Data Breach / Outage)</option>
                    <option value="LEVEL_2_HIGH">Level 2 – High (Major Auth Failure / Degradation)</option>
                    <option value="LEVEL_3_MEDIUM">Level 3 – Medium (Operational Disruption)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emergency Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EmergencyCategory)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CRITICAL_SYSTEM_FAILURE">Critical System Failure (DB / Container)</option>
                    <option value="CYBERSECURITY_INCIDENT">Cybersecurity Incident (Breach / Attack)</option>
                    <option value="DATA_INTEGRITY_INCIDENT">Data Integrity Incident (Corruption)</option>
                    <option value="LEGAL_REGULATORY_EMERGENCY">Legal or Regulatory Directive</option>
                    <option value="HUMAN_SAFETY_INCIDENT">Human Safety / Child Safeguarding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Incident Headline / Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CBA Summative Assessment Database Deadlock"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Technical Incident Details:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the nature of failure, impact on school operations, and error traces..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('INCIDENTS')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateIncident(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Register Incident Record (Phase 1)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Immediate Break-Glass Access (Phase 4) */}
        {activeTab === 'BREAK_GLASS' && (
          <div className="space-y-4 text-xs">
            <div className="bg-red-950 text-red-200 rounded-2xl p-4 border border-red-800 space-y-2">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Flame className="w-5 h-5 text-red-400" />
                <span>BREAK-GLASS PROTOCOL ACTIVATION (§10 &amp; §11 Phase 4)</span>
              </div>
              <p className="text-[11px] text-red-300 leading-relaxed">
                When immediate action is required to prevent catastrophic failure or active breach, break-glass access permits activation without prior multi-party approval. A Break-Glass Event is automatically recorded with high-priority security notifications and <strong>mandatory review within 24 hours</strong>.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target School Tenant:</label>
                <select
                  value={newSchoolId}
                  onChange={(e) => setNewSchoolId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {tenants.map((t) => (
                    <option key={t.schoolId} value={t.schoolId}>
                      {t.schoolName} ({t.schoolCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Justification (Mandatory):</label>
                <input
                  type="text"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State critical necessity (e.g. database unresponsiveness, active cyber incident)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Expected Duration (Critical Max 4h):
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours (Standard Critical Diagnostic)</option>
                  <option value={4}>4 Hours (Maximum Permitted for Critical Incidents)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-red-600 font-bold">
                  ⚠️ Action triggers immediate break-glass audit entry.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!newTitle.trim()) {
                      setNewTitle('Immediate Break-Glass Incident Intervention');
                    }
                    if (!newDescription.trim()) {
                      setNewDescription('Immediate operator intervention executed under Section 10 break-glass clause.');
                    }
                    handleCreateIncident(true);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Flame className="w-4 h-4" />
                  <span>Execute Break-Glass Emergency Access</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px]">
            Governance Standard: <strong className="text-slate-700">100% Immutable SHA-256 Audit Trail</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
