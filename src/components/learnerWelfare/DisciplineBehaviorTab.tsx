import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../types';
import {
  DisciplineIncident,
  DisciplineIncidentSeverity,
  DisciplineWorkflowStatus,
} from '../../types/learnerWelfare';
import { AVAILABLE_CLASSES } from '../../data/mockData';

interface DisciplineBehaviorTabProps {
  students: Student[];
  currentUser?: CurrentUser;
  incidents: DisciplineIncident[];
  onAddIncident: (incident: DisciplineIncident) => void;
  onUpdateIncident: (incident: DisciplineIncident) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const SEVERITY_CONFIG: Record<
  DisciplineIncidentSeverity,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  'Positive Recognition': {
    label: 'Positive Recognition (Merit)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Award,
  },
  Minor: {
    label: 'Minor Infraction',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: Clock,
  },
  Moderate: {
    label: 'Moderate Concern',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  'Severe / Critical': {
    label: 'Severe / Critical Disciplinary',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: ShieldAlert,
  },
};

const WORKFLOW_STATUSES: DisciplineWorkflowStatus[] = [
  'Reported',
  'Under Investigation',
  'Resolved',
  'Escalated',
  'Closed',
];

export const DisciplineBehaviorTab: React.FC<DisciplineBehaviorTabProps> = ({
  students,
  currentUser,
  incidents,
  onAddIncident,
  onUpdateIncident,
  onLogAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingIncident, setViewingIncident] = useState<DisciplineIncident | null>(null);

  // Form State
  const [formStudentId, setFormStudentId] = useState('');
  const [formCategory, setFormCategory] = useState('Merit Commendation');
  const [formSeverity, setFormSeverity] = useState<DisciplineIncidentSeverity>('Positive Recognition');
  const [formDate, setFormDate] = useState('2026-08-28');
  const [formTime, setFormTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('Junior School Compound');
  const [formDescription, setFormDescription] = useState('');
  const [formActionTaken, setFormActionTaken] = useState('');
  const [formWitnesses, setFormWitnesses] = useState('');
  const [formParentContacted, setFormParentContacted] = useState(false);
  const [formParentFeedback, setFormParentFeedback] = useState('');
  const [formFollowUpDate, setFormFollowUpDate] = useState('');
  const [formStatus, setFormStatus] = useState<DisciplineWorkflowStatus>('Reported');

  // Stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const merits = incidents.filter((i) => i.severity === 'Positive Recognition').length;
    const underInvest = incidents.filter((i) => i.status === 'Under Investigation').length;
    const escalated = incidents.filter((i) => i.status === 'Escalated').length;
    const resolved = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;

    return { total, merits, underInvest, escalated, resolved };
  }, [incidents]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.admNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'All' || inc.className === selectedClass;
      const matchesSeverity = selectedSeverity === 'All' || inc.severity === selectedSeverity;
      const matchesWorkflow = selectedWorkflow === 'All' || inc.status === selectedWorkflow;

      return matchesSearch && matchesClass && matchesSeverity && matchesWorkflow;
    });
  }, [incidents, searchTerm, selectedClass, selectedSeverity, selectedWorkflow]);

  const handleOpenAddModal = (isMerit: boolean = false) => {
    setFormStudentId(students[0]?.id || '');
    setFormCategory(isMerit ? 'Merit Commendation' : 'General Misconduct');
    setFormSeverity(isMerit ? 'Positive Recognition' : 'Minor');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('10:00');
    setFormLocation('School Assembly Ground');
    setFormDescription('');
    setFormActionTaken(isMerit ? 'Awarded Certificate of Merit' : 'Oral guidance & counseling');
    setFormWitnesses('');
    setFormParentContacted(false);
    setFormParentFeedback('');
    setFormFollowUpDate('');
    setFormStatus(isMerit ? 'Closed' : 'Reported');
    setShowAddModal(true);
  };

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formStudentId);
    if (!student) return;

    const witnessesList = formWitnesses
      ? formWitnesses.split(',').map((w) => w.trim()).filter(Boolean)
      : [];

    const newIncident: DisciplineIncident = {
      id: `disc-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      className: `${student.grade} ${student.stream || student.classArm || ''}`.trim(),
      date: formDate,
      time: formTime,
      location: formLocation,
      category: formCategory,
      description: formDescription,
      severity: formSeverity,
      status: formStatus,
      reportingStaff: currentUser?.fullName || 'Class Teacher',
      witnesses: witnessesList,
      actionTaken: formActionTaken,
      parentContacted: formParentContacted,
      parentContactDate: formParentContacted ? new Date().toISOString() : undefined,
      parentFeedback: formParentFeedback || undefined,
      followUpDate: formFollowUpDate || undefined,
      closedBy: formStatus === 'Closed' ? currentUser?.fullName || 'Headteacher' : undefined,
      closedAt: formStatus === 'Closed' ? new Date().toISOString() : undefined,
    };

    onAddIncident(newIncident);
    if (onLogAudit) {
      onLogAudit(
        'DISCIPLINE_RECORD_CREATED' as any,
        `Recorded discipline entry [${formSeverity}] for ${student.name} (${student.admNo}): ${formCategory}. Status: ${formStatus}.`
      );
    }

    setShowAddModal(false);
  };

  const handleUpdateWorkflowStatus = (
    incident: DisciplineIncident,
    newStatus: DisciplineWorkflowStatus
  ) => {
    const updated: DisciplineIncident = {
      ...incident,
      status: newStatus,
      closedBy: newStatus === 'Closed' ? currentUser?.fullName || 'Authorized Staff' : undefined,
      closedAt: newStatus === 'Closed' ? new Date().toISOString() : undefined,
    };

    onUpdateIncident(updated);
    if (onLogAudit) {
      onLogAudit(
        'DISCIPLINE_STATUS_CHANGED' as any,
        `Discipline incident status updated to "${newStatus}" for ${incident.studentName} (${incident.admNo}).`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-medium">All behavioral logs</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Merits &amp; Honors</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 mt-1">{stats.merits}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Positive recognitions</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">{stats.underInvest}</p>
          <span className="text-[10px] text-amber-600 font-medium">Active investigations</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Escalated Cases</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-700 mt-1">{stats.escalated}</p>
          <span className="text-[10px] text-rose-600 font-medium">Deputy Principal review</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-blue-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Resolved / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700 mt-1">{stats.resolved}</p>
          <span className="text-[10px] text-blue-600 font-medium">Action complete</span>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents by Learner, Category, Staff, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-4 h-4" />
              <span>Record Merit</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal(false)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px] mr-1">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Classes</option>
            {AVAILABLE_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Severities</option>
            {Object.keys(SEVERITY_CONFIG).map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>

          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Workflow Stages</option>
            {WORKFLOW_STATUSES.map((wf) => (
              <option key={wf} value={wf}>
                {wf}
              </option>
            ))}
          </select>

          <span className="text-[11px] text-slate-400 ml-auto font-medium">
            Showing <strong className="text-slate-800">{filteredIncidents.length}</strong> records
          </span>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date &amp; Learner</th>
                <th className="py-3 px-3">Category &amp; Location</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Action Taken</th>
                <th className="py-3 px-3">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    No behavior or discipline records found.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const sevConfig = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.Minor;
                  const Icon = sevConfig.icon;

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inc.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{inc.admNo}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{inc.className}</span>
                          <span>•</span>
                          <span>{inc.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{inc.category}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{inc.location}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sevConfig.bg} ${sevConfig.text} ${sevConfig.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{inc.severity}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-slate-700 font-medium line-clamp-1">{inc.actionTaken}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Reported by: {inc.reportingStaff}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={inc.status}
                          onChange={(e) =>
                            handleUpdateWorkflowStatus(inc, e.target.value as DisciplineWorkflowStatus)
                          }
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-indigo-500"
                        >
                          {WORKFLOW_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingIncident(inc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {viewingIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingIncident.severity === 'Positive Recognition'
                    ? 'Commendation & Merit Certificate'
                    : 'Discipline Incident Dossier'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">Ref: {viewingIncident.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingIncident(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{viewingIncident.studentName}</div>
                <div className="text-slate-600 font-medium">
                  Admission No: <span className="font-mono font-bold">{viewingIncident.admNo}</span> • Class:{' '}
                  <strong>{viewingIncident.className}</strong>
                </div>
                <div className="text-slate-500">
                  Incident Date: {viewingIncident.date} at {viewingIncident.time} • Location:{' '}
                  {viewingIncident.location}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Full Description
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                  {viewingIncident.description}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Action Taken / Corrective Measures
                </span>
                <p className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-indigo-950 font-medium">
                  {viewingIncident.actionTaken}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Reporting Staff</span>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingIncident.reportingStaff}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Parent Contacted</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {viewingIncident.parentContacted ? 'Yes (Notice On File)' : 'No'}
                  </div>
                </div>
              </div>

              {viewingIncident.parentFeedback && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Parent Response / Feedback
                  </span>
                  <p className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                    {viewingIncident.parentFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingIncident(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log / Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Behavioral Incident / Merit</h3>
                <p className="text-xs text-slate-500 font-medium">P6.5 Discipline Management Framework</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Severity / Classification</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as DisciplineIncidentSeverity)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {Object.keys(SEVERITY_CONFIG).map((sev) => (
                      <option key={sev} value={sev}>
                        {sev}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Incident Category</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Integrity Commendation, Lab Safety, Punctuality"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Science Lab 1"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Record factual observations..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Action Taken / Recognition <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formActionTaken}
                  onChange={(e) => setFormActionTaken(e.target.value)}
                  placeholder="e.g. Awarded Merit Certificate during Assembly / Guidance session"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Witnesses (optional)</label>
                  <input
                    type="text"
                    value={formWitnesses}
                    onChange={(e) => setFormWitnesses(e.target.value)}
                    placeholder="Names separated by comma"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Workflow Stage</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DisciplineWorkflowStatus)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {WORKFLOW_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentContacted"
                  checked={formParentContacted}
                  onChange={(e) => setFormParentContacted(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="parentContacted" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Parent / Guardian notified of this event
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                >
                  Save Behavior Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
