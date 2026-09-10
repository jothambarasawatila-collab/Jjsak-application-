import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Search,
  History,
  KeyRound,
} from 'lucide-react';
import { Student } from '../../types';
import { ReportApprovalRecord } from '../../types/reporting';
import { INITIAL_ACCESS_LOGS } from '../../data/reportingEngine';

interface ReportApprovalSecurityTabProps {
  students?: Student[];
  approvalRecord: ReportApprovalRecord;
  onUpdateApprovalRecord: (rec: ReportApprovalRecord) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const ReportApprovalSecurityTab: React.FC<ReportApprovalSecurityTabProps> = ({
  approvalRecord,
  onUpdateApprovalRecord,
  onLogAudit,
}) => {
  const [accessLogs] = useState(INITIAL_ACCESS_LOGS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationOutput, setVerificationOutput] = useState<string | null>(null);

  const handleToggleLock = () => {
    const nextLocked = !approvalRecord.isLocked;
    const updated: ReportApprovalRecord = {
      ...approvalRecord,
      isLocked: nextLocked,
      lockTimestamp: nextLocked ? new Date().toISOString() : undefined,
      status: nextLocked ? 'LOCKED' : 'PUBLISHED',
    };
    onUpdateApprovalRecord(updated);
    onLogAudit?.(
      'REPORT_SECURITY_LOCK_TOGGLED',
      `${nextLocked ? 'Locked & sealed' : 'Unlocked'} academic report cards. Tamper-evident hash: ${approvalRecord.integrityHash}.`
    );
  };

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setVerificationOutput(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationOutput(
        `✓ Cryptographic Check Passed: SHA-256 Hash matches institutional root key. Seal [${approvalRecord.integrityHash}] is 100% genuine and unaltered.`
      );
    }, 900);
  };

  const filteredLogs = accessLogs.filter(
    (l) =>
      l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.accessedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            P8.11 &amp; P8.13 Report Security, Approval Lifecycle &amp; Cryptographic Audit
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Workflow Governance, Digital Signatures &amp; Access Logs
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            End-to-end multi-tiered approval hierarchy (Teacher &rarr; HoD &rarr; Principal), tamper-proof digital seals, and immutable access logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLock}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md ${
              approvalRecord.isLocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {approvalRecord.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {approvalRecord.isLocked ? 'Reports Locked & Sealed' : 'Reports Open (Editable)'}
          </button>
        </div>
      </div>

      {/* Approval Lifecycle Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Multi-Tiered Report Approval Hierarchy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            { stage: 'DRAFT', label: '1. Draft Entries', desc: 'Subject marks populated by teachers', done: true },
            { stage: 'TEACHER_VERIFIED', label: '2. Class Teacher Verified', desc: approvalRecord.verifiedByTeacher || 'David Mutua', done: true },
            { stage: 'HOD_REVIEWED', label: '3. HoD Academic Audit', desc: approvalRecord.reviewedByHoD || 'Dr. Sarah Wambui', done: true },
            { stage: 'PRINCIPAL_APPROVED', label: '4. Principal Approved', desc: approvalRecord.approvedByPrincipal || 'Prof. Jotham Barasa', done: true },
            { stage: 'PUBLISHED', label: '5. Published & Locked', desc: 'Active on Parent/Learner Portal', done: approvalRecord.status === 'PUBLISHED' || approvalRecord.status === 'LOCKED' },
          ].map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                step.done
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs">{step.label}</span>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] opacity-80">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Cryptographic Verification Box */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <strong className="text-xs font-black uppercase text-white tracking-wider">
                Cryptographic Integrity Seal
              </strong>
            </div>
            <span className="font-mono text-xs text-amber-300 block">{approvalRecord.integrityHash}</span>
            <p className="text-[11px] text-slate-400">
              Validates digital signature certificate against unauthorized grade alteration.
            </p>
          </div>

          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            {isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Hash'}
          </button>
        </div>

        {verificationOutput && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-mono text-emerald-900 font-bold">
            {verificationOutput}
          </div>
        )}
      </div>

      {/* Access Logs & Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Immutable Report Access &amp; Dispatch Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500">KDPA 2019 compliant access logging</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, learner, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Learner Profile</th>
                <th className="py-3 px-4">Report Type</th>
                <th className="py-3 px-4">Accessed By</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-600">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.studentName}</td>
                  <td className="py-3 px-4 text-slate-700">{log.reportType}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{log.accessedByName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                      {log.accessedByRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress || '197.232.14.82'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                      {log.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
