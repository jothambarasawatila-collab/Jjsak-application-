import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Send,
  Search,
  CheckCircle2,
  Lock,
  Users,
  X,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../types';
import { ParentCommunicationRecord } from '../../types/learnerWelfare';
import { AVAILABLE_CLASSES } from '../../data/mockData';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  beforeVal?: string;
  afterVal?: string;
}

interface ParentEngagementAuditTabProps {
  students: Student[];
  currentUser?: CurrentUser;
  communications: ParentCommunicationRecord[];
  auditLogs: AuditLogEntry[];
  onSendMessage: (record: ParentCommunicationRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const ParentEngagementAuditTab: React.FC<ParentEngagementAuditTabProps> = ({
  students,
  currentUser,
  communications,
  auditLogs,
  onSendMessage,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'comms' | 'audit'>('comms');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Broadcast / Message Form State
  const [msgTarget, setMsgTarget] = useState<'All Parents' | 'Selected Class' | 'Single Learner'>(
    'Selected Class'
  );
  const [targetClass, setTargetClass] = useState('G8 S');
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [msgChannel, setMsgChannel] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
  const [msgSubject, setMsgSubject] = useState('JJSAK Junior School Notice');
  const [msgDetails, setMsgDetails] = useState(
    'Dear Parent, reminder on the upcoming Mid-Term consultation day scheduled for this Friday at 9:00 AM.'
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    const totalComms = communications.length;
    const smsCount = communications.filter((c) => c.channel === 'SMS').length;
    const meetingCount = communications.filter((c) => c.channel === 'In-Person Meeting').length;
    const totalAudits = auditLogs.length;

    return { totalComms, smsCount, meetingCount, totalAudits };
  }, [communications, auditLogs]);

  // Filtered Comms
  const filteredComms = useMemo(() => {
    return communications.filter((c) => {
      const matchesSearch =
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChannel = selectedChannel === 'All' || c.channel === selectedChannel;

      return matchesSearch && matchesChannel;
    });
  }, [communications, searchTerm, selectedChannel]);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return auditLogs.filter((a) => {
      return (
        a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [auditLogs, searchTerm]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();

    if (msgTarget === 'Single Learner') {
      const student = students.find((s) => s.id === targetStudentId);
      if (!student) return;

      const record: ParentCommunicationRecord = {
        id: `pcomm-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        admNo: student.admNo,
        parentName: (student as any).parentName || 'Parent / Guardian',
        parentPhone: (student as any).parentPhone || '+254 700 000 000',
        date: new Date().toISOString(),
        channel: msgChannel,
        purpose: 'General Notice',
        subject: msgSubject,
        details: msgDetails,
        staffName: currentUser?.fullName || 'Class Teacher',
        status: 'Delivered',
      };

      onSendMessage(record);
      triggerToast(`✓ Dispatched ${msgChannel} notice to ${record.parentName}`);
    } else {
      // Bulk dispatch
      const targetList =
        msgTarget === 'Selected Class'
          ? students.filter((s) => {
              const cls = `${s.grade} ${s.stream || s.classArm || ''}`.trim();
              return cls === targetClass || s.grade === targetClass;
            })
          : students;

      targetList.forEach((s, idx) => {
        const record: ParentCommunicationRecord = {
          id: `pcomm-${Date.now()}-${idx}`,
          studentId: s.id,
          studentName: s.name,
          admNo: s.admNo,
          parentName: (s as any).parentName || 'Parent / Guardian',
          parentPhone: (s as any).parentPhone || '+254 700 000 000',
          date: new Date().toISOString(),
          channel: msgChannel,
          purpose: 'General Notice',
          subject: msgSubject,
          details: msgDetails,
          staffName: currentUser?.fullName || 'School Principal',
          status: 'Delivered',
        };
        onSendMessage(record);
      });

      triggerToast(
        `✓ Broadcasted ${msgChannel} notice to ${targetList.length} parents (${msgTarget})`
      );
    }

    if (onLogAudit) {
      onLogAudit(
        'PARENT_BROADCAST_DISPATCHED' as any,
        `Dispatched parent broadcast [${msgChannel}] to "${msgTarget}". Subject: ${msgSubject}.`
      );
    }

    setShowBroadcastModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-indigo-900 text-indigo-100 text-xs font-bold shadow-lg border border-indigo-700 flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-indigo-300 hover:text-white ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parent Comms Logs</span>
            <MessageSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.totalComms}</p>
          <span className="text-[10px] text-slate-400 font-medium">Delivered SMS / Meetings</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">SMS Alerts Sent</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 mt-1">{stats.smsCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct parent gateway</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Consultations</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">{stats.meetingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Academic conference days</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Audit Security Log</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-700 mt-1">{stats.totalAudits}</p>
          <span className="text-[10px] text-purple-600 font-medium">Immutable lifecycle events</span>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('comms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'comms'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>P6.9 Parent Engagement &amp; Notices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>P6.10 Immutable Learner Audit Trail</span>
          </button>
        </div>

        {activeSubTab === 'comms' && (
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Notice to Parents</span>
          </button>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'comms'
                ? 'Search parent notices by student, parent, subject, details...'
                : 'Search audit records by action type, staff user, details...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none font-medium"
          />
        </div>

        {activeSubTab === 'comms' && (
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Channels</option>
            <option value="SMS">SMS</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="In-Person Meeting">In-Person Meeting</option>
          </select>
        )}
      </div>

      {/* Sub-Tab 1: Parent Communications Log */}
      {activeSubTab === 'comms' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date &amp; Learner</th>
                  <th className="py-3 px-3">Parent / Contact</th>
                  <th className="py-3 px-3">Channel &amp; Purpose</th>
                  <th className="py-3 px-3">Subject &amp; Content</th>
                  <th className="py-3 px-3">Staff In Charge</th>
                  <th className="py-3 px-4 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      No parent communication records found.
                    </td>
                  </tr>
                ) : (
                  filteredComms.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{comm.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{comm.admNo}</span>
                          <span>•</span>
                          <span>{comm.date.substring(0, 10)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{comm.parentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{comm.parentPhone}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {comm.channel}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{comm.purpose}</div>
                      </td>

                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1">{comm.subject}</div>
                        <div className="text-slate-600 font-medium text-[11px] line-clamp-1 mt-0.5">
                          {comm.details}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium">{comm.staffName}</td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{comm.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Immutable Learner Audit Trail */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">
                P6.10 Immutable Audit Trail (Append-Only Log)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {filteredAudits.length} recorded operations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Performed By</th>
                  <th className="py-3 px-4">Audit Details &amp; Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400 font-medium">
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {log.performedBy}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <div>{log.details}</div>
                        {(log.beforeVal || log.afterVal) && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {log.beforeVal && <span>Before: {log.beforeVal} </span>}
                            {log.afterVal && <span>→ After: {log.afterVal}</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Notice to Parents</h3>
                <p className="text-xs text-slate-500 font-medium">P6.9 Parent Engagement Framework</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={msgTarget}
                    onChange={(e) => setMsgTarget(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Selected Class">Specific Class</option>
                    <option value="All Parents">All School Parents</option>
                    <option value="Single Learner">Individual Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Channel</label>
                  <select
                    value={msgChannel}
                    onChange={(e) => setMsgChannel(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-indigo-700"
                  >
                    <option value="SMS">SMS Gateway</option>
                    <option value="WhatsApp">WhatsApp Business</option>
                    <option value="Email">Email Notification</option>
                  </select>
                </div>
              </div>

              {msgTarget === 'Selected Class' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Class</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {AVAILABLE_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {msgTarget === 'Single Learner' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Learner</label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Message Subject</label>
                <input
                  type="text"
                  required
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="e.g. Mid-Term Consultation Schedule"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={msgDetails}
                  onChange={(e) => setMsgDetails(e.target.value)}
                  placeholder="Type official parent notice..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
