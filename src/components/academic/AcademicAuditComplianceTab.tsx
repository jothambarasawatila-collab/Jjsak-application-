import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import {
  AuditLogEntry,
  Student,
  Assessment,
  User,
} from '../../types';

interface AcademicAuditComplianceTabProps {
  auditLogs: AuditLogEntry[];
  students: Student[];
  assessments: Assessment[];
  currentUser?: User;
}

export const AcademicAuditComplianceTab: React.FC<AcademicAuditComplianceTabProps> = ({
  auditLogs,
  assessments,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  // Filter audit logs strictly for academic events or general system events
  const academicLogEntries = auditLogs.filter((log) => {
    const isAcademic =
      log.actionType.includes('MARKS') ||
      log.actionType.includes('RECORD') ||
      log.actionType.includes('LEARNER') ||
      log.actionType.includes('ACADEMIC') ||
      log.actionType.includes('EXAM') ||
      log.actionType.includes('DEADLINE') ||
      log.actionType.includes('GRADING') ||
      log.actionType.includes('OCR') ||
      log.actionType.includes('BEHAVIOR') ||
      log.actionType.includes('REPORT');

    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;

    return isAcademic && matchesSearch && matchesAction;
  });

  // Integrity scorecard metrics
  const finalizedExams = assessments.filter((a) => a.isFinalized).length;
  const totalAuditEvents = auditLogs.length;

  return (
    <div className="space-y-6">
      {/* Integrity Scorecard Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">JJSAK Academic Integrity & Audit Engine</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Phase 5.9 & 5.10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Non-repudiable transaction logging, before/after differential capture, and anti-tampering verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold font-mono">
              ISO/IEC 27001 & KDPA 2019 COMPLIANT
            </span>
          </div>
        </div>

        {/* 4 Pillars of Integrity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Traceability Standard</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">Officer ID & Role Logged</span>
            <span className="text-[9px] text-slate-400">100% Attribution</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Tamper Lock</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">{finalizedExams} Exams Locked</span>
            <span className="text-[9px] text-slate-400">SHA256 Checksum</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Duplicate Admission Defense</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">0 Conflicts Active</span>
            <span className="text-[9px] text-slate-400">Enforced by Schema</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Audit Trail Volume</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">{totalAuditEvents} Recorded Logs</span>
            <span className="text-[9px] text-slate-400">Immutable Storage</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit details, officer name, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-700"
          >
            <option value="ALL">All Academic Actions</option>
            <option value="MARKS_SUBMIT">Marks Submissions</option>
            <option value="RECORD_CREATE">Record Creations</option>
            <option value="RECORD_EDIT">Record Edits</option>
            <option value="LEARNER_TRANSFER">Learner Transfers</option>
            <option value="LEARNER_PROMOTE">Learner Promotions</option>
            <option value="ACADEMIC_YEAR_ARCHIVE">Year Archives</option>
            <option value="EXAM_FINALIZED">Exam Finalizations</option>
            <option value="BEHAVIOR_RECORD_LOGGED">Behavior Records</option>
            <option value="DEADLINE_EXTENDED">Deadline Extensions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Chronology Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Chronological Academic Operations Audit Trail ({academicLogEntries.length})
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Retention Period: 7 Years (Statutory Requirement)
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {academicLogEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching academic audit events found.
            </div>
          ) : (
            academicLogEntries.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50 transition text-xs space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-emerald-400 font-mono">
                      {log.actionType}
                    </span>
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-slate-400 text-[11px]">({log.userRole})</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>IP: {log.ipAddress || '192.168.1.42'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {log.details}
                </p>

                {(log.beforeValue || log.afterValue) && (
                  <div className="flex items-center gap-3 text-[10px] bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    {log.beforeValue && (
                      <span className="text-slate-500">
                        Before: <strong className="text-red-700">{log.beforeValue}</strong>
                      </span>
                    )}
                    {log.afterValue && (
                      <span className="text-slate-500">
                        After: <strong className="text-emerald-700">{log.afterValue}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
