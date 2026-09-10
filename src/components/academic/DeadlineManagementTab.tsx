import React, { useState } from 'react';
import {
  CheckCircle2,
  Bell,
  Mail,
  MessageSquare,
  Plus,
} from 'lucide-react';
import {
  MarksDeadline,
  TeacherNotification,
  User,
  Teacher,
} from '../../types';
import {
  AVAILABLE_SUBJECTS,
} from '../../data/mockData';

interface DeadlineManagementTabProps {
  deadlines: MarksDeadline[];
  notifications: TeacherNotification[];
  teachers: Teacher[];
  currentUser?: User;
  onAddDeadline: (deadline: MarksDeadline) => void;
  onUpdateDeadline: (deadline: MarksDeadline) => void;
  onSendNotification: (notif: TeacherNotification) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const DeadlineManagementTab: React.FC<DeadlineManagementTabProps> = ({
  deadlines,
  notifications,
  teachers,
  currentUser,
  onAddDeadline,
  onUpdateDeadline,
  onSendNotification,
  onLogAudit,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedDeadlineForExtension, setSelectedDeadlineForExtension] = useState<MarksDeadline | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(3);
  const [extensionReason, setExtensionReason] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Form state for creating deadline
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newGrade, setNewGrade] = useState('G8');
  const [newStream, setNewStream] = useState('N');
  const [newDepartment, setNewDepartment] = useState('Mathematics');
  const [newExamType, setNewExamType] = useState('Mid Term Exam');
  const [newDateTime, setNewDateTime] = useState('2026-09-05T17:00');
  const [assignedTeacher, setAssignedTeacher] = useState(teachers[0]?.name || 'Mrs. J. Barasa');

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please provide a deadline title.');
      return;
    }

    const created: MarksDeadline = {
      id: `dead-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      grade: newGrade,
      stream: newStream,
      department: newDepartment,
      examinationType: newExamType,
      term: 'Term 2',
      year: 2026,
      deadlineDateTime: newDateTime,
      createdBy: currentUser?.fullName || 'Director of Academics (Mr. Jotham Watila)',
      assignedTeacherName: assignedTeacher,
      status: 'Pending',
      remindersSent: {
        sevenDays: true,
        threeDays: false,
        oneDay: false,
        deadlineDay: false,
        overdue: false,
      },
    };

    onAddDeadline(created);

    // Generate initial teacher notification
    const initialNotification: TeacherNotification = {
      id: `notif-${Date.now()}`,
      teacherName: assignedTeacher,
      title: `Submission Window Assigned: ${created.title}`,
      message: `Director of Academics set submission deadline for ${created.grade} ${created.stream} ${created.subject} on ${new Date(created.deadlineDateTime).toLocaleString()}.`,
      channel: 'In-App',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      deadlineId: created.id,
      urgency: 'Routine',
    };
    onSendNotification(initialNotification);

    if (onLogAudit) {
      onLogAudit(
        'DEADLINE_CREATE',
        `Director of Academics established marks deadline: ${created.title} for ${assignedTeacher} due ${created.deadlineDateTime}.`
      );
    }

    showToast(`✓ Established marks submission deadline for ${assignedTeacher}`);
    setShowCreateModal(false);
    setNewTitle('');
  };

  // Grant extension handler
  const handleApproveExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeadlineForExtension) return;

    const baseDate = new Date(selectedDeadlineForExtension.deadlineDateTime);
    baseDate.setDate(baseDate.getDate() + extensionDays);
    const newDateTimeStr = baseDate.toISOString().slice(0, 16);

    const updated: MarksDeadline = {
      ...selectedDeadlineForExtension,
      status: 'Extended',
      extendedUntil: newDateTimeStr,
      extensionReason: extensionReason || 'Authorized by Director of Academics',
      extensionApprovedBy: currentUser?.fullName || 'Director of Academics',
    };

    onUpdateDeadline(updated);

    const notif: TeacherNotification = {
      id: `notif-${Date.now()}`,
      teacherName: updated.assignedTeacherName || 'Teacher',
      title: `Extension Granted: ${updated.title}`,
      message: `Your deadline extension has been approved until ${new Date(newDateTimeStr).toLocaleString()}. Reason: ${updated.extensionReason}.`,
      channel: 'SMS',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      deadlineId: updated.id,
      urgency: 'Routine',
    };
    onSendNotification(notif);

    if (onLogAudit) {
      onLogAudit(
        'DEADLINE_EXTENDED',
        `Extended deadline for ${updated.title} by ${extensionDays} days to ${newDateTimeStr}. Reason: ${updated.extensionReason}.`
      );
    }

    showToast(`✓ Extension of ${extensionDays} days granted for ${updated.title}`);
    setSelectedDeadlineForExtension(null);
    setExtensionReason('');
  };

  // Trigger automated reminder
  const handleTriggerManualReminder = (deadline: MarksDeadline, channel: 'In-App' | 'Email' | 'SMS' | 'Mobile Push') => {
    const notif: TeacherNotification = {
      id: `notif-${Date.now()}`,
      teacherName: deadline.assignedTeacherName || 'Subject Teacher',
      title: `Reminder: ${deadline.title} Due Soon`,
      message: `Please finalize score sheets for ${deadline.grade} ${deadline.stream} ${deadline.subject} before ${new Date(deadline.deadlineDateTime).toLocaleString()}.`,
      channel,
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      deadlineId: deadline.id,
      urgency: deadline.status === 'Overdue' ? 'Critical' : 'Urgent',
    };

    onSendNotification(notif);
    showToast(`✓ Sent ${channel} alert to ${deadline.assignedTeacherName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Director of Academics Deadline Command Hub</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Phase 5.4 & 5.5
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Regulates institutional submission calendars, automates multi-channel notifications (7d, 3d, 1d, overdue), and authorizes extension requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Set Submission Deadline</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Deadlines List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">
              Active Submission Deadlines ({deadlines.length})
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Overdue: <strong className="text-red-600">{deadlines.filter((d) => d.status === 'Overdue').length}</strong> • In Progress: <strong className="text-blue-600">{deadlines.filter((d) => d.status === 'In Progress').length}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {deadlines.map((deadline) => {
              const isOverdue = deadline.status === 'Overdue';
              const isExtended = deadline.status === 'Extended';
              const isSubmitted = deadline.status === 'Submitted';

              return (
                <div
                  key={deadline.id}
                  className={`p-4 rounded-2xl border transition ${
                    isOverdue
                      ? 'bg-red-50/60 border-red-200'
                      : isExtended
                      ? 'bg-amber-50/50 border-amber-200'
                      : isSubmitted
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{deadline.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-red-100 text-red-800'
                              : isExtended
                              ? 'bg-amber-100 text-amber-800'
                              : isSubmitted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {deadline.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Class: <strong className="text-slate-800">{deadline.grade} {deadline.stream}</strong> • Subject: <strong className="text-slate-800">{deadline.subject}</strong> • Dept: <strong className="text-slate-800">{deadline.department}</strong>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                        <span>Assigned Officer: <strong className="text-slate-700">{deadline.assignedTeacherName}</strong></span>
                        <span>Due Date: <strong className="text-slate-800">{new Date(deadline.deadlineDateTime).toLocaleString()}</strong></span>
                      </div>
                      {isExtended && (
                        <div className="text-[10px] text-amber-800 mt-1 font-semibold">
                          Extended to: {new Date(deadline.extendedUntil || '').toLocaleString()} • Note: {deadline.extensionReason}
                        </div>
                      )}
                    </div>

                    {/* Quick Reminder Dispatch */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleTriggerManualReminder(deadline, 'SMS')}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Dispatch SMS Reminder"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>SMS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerManualReminder(deadline, 'Email')}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Dispatch Email Reminder"
                      >
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>Email</span>
                      </button>
                      {!isSubmitted && (
                        <button
                          type="button"
                          onClick={() => setSelectedDeadlineForExtension(deadline)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Extend</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Teacher Notification Audit Log */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Automated Notification Log</span>
              </h4>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                {notifications.length} Sent
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.teacherName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        n.channel === 'SMS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : n.channel === 'Email'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {n.channel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium pt-0.5">
                    <span>{new Date(n.sentAt).toLocaleDateString()}</span>
                    <span className="text-emerald-600 font-bold">{n.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500">
            Escalates to Head of Institution if overdue exceeds 48 hours.
          </div>
        </div>
      </div>

      {/* CREATE DEADLINE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Set New Marks Submission Deadline</h3>
            <form onSubmit={handleCreateDeadline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 2 G8 S Social Studies End-Term Scores"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {AVAILABLE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Technical & Applied">Technical & Applied</option>
                    <option value="Creative Arts & Sports">Creative Arts & Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Teacher</label>
                  <select
                    value={assignedTeacher}
                    onChange={(e) => setAssignedTeacher(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="G7">G7</option>
                    <option value="G8">G8</option>
                    <option value="G9">G9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stream</label>
                  <select
                    value={newStream}
                    onChange={(e) => setNewStream(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="N">North (N)</option>
                    <option value="S">South (S)</option>
                    <option value="E">East (E)</option>
                    <option value="W">West (W)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="CAT 1">CAT 1</option>
                    <option value="Mid Term Exam">Mid Term Exam</option>
                    <option value="End Term Exam">End Term Exam</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Publish Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTENSION APPROVAL MODAL */}
      {selectedDeadlineForExtension && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Grant Submission Deadline Extension</h3>
            <p className="text-xs text-slate-500">
              Extending submission for <strong>{selectedDeadlineForExtension.title}</strong> assigned to {selectedDeadlineForExtension.assignedTeacherName}.
            </p>

            <form onSubmit={handleApproveExtension} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Extension Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Reason for Extension</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Science lab equipment maintenance or inter-school athletics participation..."
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeadlineForExtension(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Approve Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
