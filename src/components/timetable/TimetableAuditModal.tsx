import React from 'react';
import {
  X,
  ShieldCheck,
  History,
  RotateCcw,
  CheckCircle2,
  Lock,
  FileCheck,
  Clock,
} from 'lucide-react';
import { TimetableAuditLog, TimetableVersion } from '../../types/timetable';

interface TimetableAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: TimetableAuditLog[];
  versions: TimetableVersion[];
  onApproveVersion: (versionId: string) => void;
  onRollbackVersion: (versionId: string) => void;
  onNotifyToast: (msg: string) => void;
  isAuthorized?: boolean;
}

export const TimetableAuditModal: React.FC<TimetableAuditModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  versions,
  onApproveVersion,
  onRollbackVersion,
  onNotifyToast,
  isAuthorized = true,
}) => {
  const [activeTab, setActiveTab] = React.useState<'versions' | 'audit'>('versions');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Timetable Security & Audit Governance</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  Rule P11.20
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional approval workflows, immutable audit logs, version histories, and instant rollback controls.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/50 flex gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'versions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version Approvals & Snapshots ({versions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Change Logs & User Activity ({auditLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'versions' ? (
            <div className="space-y-3">
              {versions.map((ver) => {
                const isApproved = ver.status === 'Approved';
                return (
                  <div
                    key={ver.versionId}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{ver.versionName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Created by: {ver.createdBy}</span>
                        <span>•</span>
                        <span>Date: {ver.createdAt}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          {ver.efficiencyScore}% Efficiency Score
                        </span>
                        <span>•</span>
                        <span>{ver.lessonsCount} lessons locked</span>
                      </div>
                      {ver.approvedBy && (
                        <p className="text-[10px] text-emerald-300/90 font-medium">
                          Approved by {ver.approvedBy} on {ver.approvedAt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthorized) {
                              onNotifyToast('Permission Denied: Only Director of Academics can approve timetable versions.');
                              return;
                            }
                            onApproveVersion(ver.versionId);
                            onNotifyToast(`Approved ${ver.versionName} for institutional publication!`);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                            isAuthorized
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                          title={isAuthorized ? 'Approve timetable version' : 'Director of Academics authority required'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approve Version</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthorized) {
                            onNotifyToast('Permission Denied: Only Director of Academics can restore timetable snapshots.');
                            return;
                          }
                          onRollbackVersion(ver.versionId);
                          onNotifyToast(`Restored snapshot from ${ver.versionName}!`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                          isAuthorized
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-slate-800/60 text-slate-500'
                        }`}
                        title={isAuthorized ? 'Rollback to this version' : 'Director of Academics authority required'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback / Restore</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {log.action} — <span className="text-slate-300">{log.details}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Officer: <strong className="text-slate-300">{log.user}</strong> ({log.userRole})</span>
                      {log.academicTerm && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{log.academicTerm}</span>
                        </>
                      )}
                      {log.schoolName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{log.schoolName}</span>
                        </>
                      )}
                      {log.affectedClassOrTeacher && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{log.affectedClassOrTeacher}</span>
                        </>
                      )}
                    </div>

                    {(log.previousValue || log.newValue || log.reason) && (
                      <div className="mt-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px] space-y-0.5">
                        {log.previousValue && (
                          <div className="text-slate-400">
                            <span className="text-rose-400 font-semibold">Previous:</span> {log.previousValue}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-slate-300">
                            <span className="text-emerald-400 font-semibold">New Value:</span> {log.newValue}
                          </div>
                        )}
                        {log.reason && (
                          <div className="text-slate-400 italic">
                            <span className="text-amber-400 font-semibold not-italic">Justification / Reason:</span> {log.reason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-tenant encrypted audit store active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
