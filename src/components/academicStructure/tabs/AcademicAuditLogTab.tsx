import React, { useState } from 'react';
import {
  Search,
  Printer,
  Lock,
  History,
} from 'lucide-react';
import { AcademicStructureAuditEntry } from '../../../types/academicStructure';
import { SchoolInfo } from '../../../types';

interface AcademicAuditLogTabProps {
  auditLogs: AcademicStructureAuditEntry[];
  schoolInfo: SchoolInfo;
}

export const AcademicAuditLogTab: React.FC<AcademicAuditLogTabProps> = ({
  auditLogs,
  schoolInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.integrityHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Academic Operations Audit Trail &amp; KDPA Compliance
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Tamper-Evident Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {schoolInfo.name} — Cryptographically verified institutional record tracking curriculum modifications, teacher assignments, stream creations, and term locks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrintAudit}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Audit Certificate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, administrator, hash, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-hidden"
        >
          <option value="ALL">All Audit Actions ({auditLogs.length})</option>
          <option value="TEACHER_ALLOCATED">Teacher Subject Allocations</option>
          <option value="CLASS_TEACHER_APPOINTED">Class Master Appointments</option>
          <option value="STREAM_CREATED">Stream Creation</option>
          <option value="SUBJECT_CATALOG_UPDATED">Subject Additions</option>
          <option value="TERM_LOCKED">Term Seals &amp; Locks</option>
          <option value="ACADEMIC_YEAR_TRANSITION">Year Rollovers</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp &amp; User</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Audit Operation Details</th>
                <th className="py-3 px-4 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                        {log.userName ? log.userName.charAt(0) : 'A'}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{log.userName || 'Administrator'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.formattedDate || new Date(log.timestamp).toLocaleString('en-KE')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400 font-bold">
                    {log.integrityHash.slice(0, 12)}...
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No audit records matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
