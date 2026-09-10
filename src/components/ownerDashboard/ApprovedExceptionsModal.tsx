import React, { useState } from 'react';
import {
  FileCheck2,
  X,
  Plus,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  ApprovedExceptionRecord,
  ExceptionCategory,
} from '../../types/ownerGovernance';
import { SchoolTenant } from '../../types';
import { ownerGovernanceService } from '../../services/ownerGovernanceService';

interface ApprovedExceptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: SchoolTenant[];
  onLogAudit?: (action: string, details: string) => void;
}

export const ApprovedExceptionsModal: React.FC<ApprovedExceptionsModalProps> = ({
  isOpen,
  onClose,
  tenants = [],
  onLogAudit,
}) => {
  const [exceptions, setExceptions] = useState<ApprovedExceptionRecord[]>(() =>
    ownerGovernanceService.getApprovedExceptions()
  );
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExceptionCategory>('TECHNICAL_SUPPORT');
  const [schoolId, setSchoolId] = useState<string>(tenants[0]?.schoolId || 'sch-ngonyek-001');
  const [ticketRef, setTicketRef] = useState('');
  const [justification, setJustification] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Institutional Head & Platform Security Board');
  const [durationHours, setDurationHours] = useState(6);
  const [scopeTags, setScopeTags] = useState<string[]>(['LEARNER_PROFILES', 'ASSESSMENTS']);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreate = () => {
    if (!ticketRef.trim() || !justification.trim()) {
      showToast('Ticket Reference and Justification are required.');
      return;
    }

    const school = tenants.find((t) => t.schoolId === schoolId);
    const schoolName = school ? school.schoolName : 'Institutional Tenant';

    const newRec = ownerGovernanceService.createException({
      category,
      schoolId,
      schoolName,
      ticketOrIncidentRef: ticketRef.trim(),
      justification: justification.trim(),
      scope: scopeTags,
      durationHours,
      authorizedBy,
      requestedBy: 'Jotham Barasa Watila (Platform Owner)',
    });

    onLogAudit?.(
      'APPROVED_EXCEPTION_CREATED',
      `Approved Exception created: [${newRec.id}] Category: ${newRec.categoryLabel} for school ${schoolName}. Ref: ${ticketRef.trim()}`
    );

    setExceptions(ownerGovernanceService.getApprovedExceptions());
    setIsCreating(false);
    showToast(`Approved Exception [${newRec.id}] successfully established.`);
  };

  const handleRevoke = (id: string) => {
    ownerGovernanceService.revokeException(id, 'Platform Owner manual revocation');
    setExceptions(ownerGovernanceService.getApprovedExceptions());
    onLogAudit?.('APPROVED_EXCEPTION_REVOKED', `Approved Exception [${id}] revoked manually.`);
    showToast(`Exception [${id}] revoked.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Approved Exceptions Governance
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  Section 9 Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Documented, time-limited, and authorized exceptions allowing temporary access to school data.
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
          <div className="bg-slate-900 text-white rounded-2xl p-3 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Policy Explainer */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Section 9 – Authorized Exception Categories</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Least-Privilege Standard</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Access to school data is strictly prohibited unless an exception has been formally authorized under one of 6 approved categories:
            <strong> Technical Support, Security Investigation, Compliance Review, Disaster Recovery, School-Authorized Assistance, or Legal Requirement</strong>.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
            Registered Exceptions ({exceptions.length})
          </span>
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Cancel Creation' : 'Request New Exception'}</span>
          </button>
        </div>

        {/* Creation Form */}
        {isCreating && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs animate-in fade-in">
            <h3 className="font-bold text-slate-900 text-sm">Request Approved Exception (§9)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Approved Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExceptionCategory)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="TECHNICAL_SUPPORT">1. Technical Support (Support Ticket)</option>
                  <option value="SECURITY_INVESTIGATION">2. Security Investigation (Incident Ref)</option>
                  <option value="COMPLIANCE_REVIEW">3. Compliance Review (Auditor Authorization)</option>
                  <option value="DISASTER_RECOVERY">4. Disaster Recovery (Recovery Ref)</option>
                  <option value="SCHOOL_AUTHORIZED_ASSISTANCE">5. School-Authorized Assistance</option>
                  <option value="LEGAL_REQUIREMENT">6. Legal Requirement (Official Request)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target School Tenant:</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  {tenants.map((t) => (
                    <option key={t.schoolId} value={t.schoolId}>
                      {t.schoolName} ({t.schoolCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ticket or Incident Reference:</label>
                <input
                  type="text"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value)}
                  placeholder="e.g. SUP-TICKET-9921 / MOE-DIR-2026"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Duration (Hours):</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Authorizing Body:</label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scope Tags (Comma-separated):</label>
                <input
                  type="text"
                  value={scopeTags.join(', ')}
                  onChange={(e) => setScopeTags(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Justification:</label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="State specific operational or support rationale..."
                className="w-full p-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Authorize &amp; Register Exception
              </button>
            </div>
          </div>
        )}

        {/* Exceptions List */}
        <div className="space-y-2.5">
          {exceptions.map((exc) => {
            const isExpired = new Date(exc.expiresAt).getTime() < Date.now();
            const effectiveStatus = isExpired && exc.status === 'ACTIVE' ? 'EXPIRED' : exc.status;
            return (
              <div
                key={exc.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-xs space-y-2 transition shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{exc.id}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {exc.categoryLabel}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        effectiveStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : effectiveStatus === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                  </div>

                  {effectiveStatus === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(exc.id)}
                      className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Revoke Exception
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-700 font-medium">
                  <strong>School:</strong> {exc.schoolName} ({exc.schoolId}) •{' '}
                  <strong>Ref:</strong> <span className="font-mono">{exc.ticketOrIncidentRef}</span>
                </div>

                <p className="text-[11px] text-slate-500">{exc.justification}</p>

                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 gap-2">
                  <span>Authorized By: <strong className="text-slate-600">{exc.authorizedBy}</strong></span>
                  <span>Expires: <strong className="text-slate-600">{new Date(exc.expiresAt).toLocaleString()}</strong></span>
                  <span className="font-mono truncate max-w-[200px]">{exc.auditSignature}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px]">
            Audited Scope Enforcement: <strong className="text-slate-700">Strictly Least-Privilege</strong>
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
