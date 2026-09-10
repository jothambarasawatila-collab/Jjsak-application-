import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Shield,
  Plus,
  Search,
  Lock,
  Users,
  Sparkles,
  X,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../types';
import {
  CounselingCategory,
  CounselingSession,
  VulnerableLearnerRecord,
  VulnerabilityType,
} from '../../types/learnerWelfare';

interface GuidanceCounselingWelfareTabProps {
  students: Student[];
  currentUser?: CurrentUser;
  counselingSessions: CounselingSession[];
  vulnerableLearners: VulnerableLearnerRecord[];
  onAddCounselingSession: (session: CounselingSession) => void;
  onAddVulnerableLearner: (record: VulnerableLearnerRecord) => void;
  onUpdateVulnerableLearner?: (record: VulnerableLearnerRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const COUNSELING_CATEGORIES: CounselingCategory[] = [
  'Academic Guidance',
  'Emotional Well-being',
  'Peer Relations & Bullying',
  'Family & Bereavement',
  'Career & Pathway Guidance',
  'Discipline & Rehabilitation',
  'Substance Awareness',
  'Special Psychological Support',
];

const VULNERABILITY_TYPES: VulnerabilityType[] = [
  'Orphan / Vulnerable Child (OVC)',
  'Needy / Tuition Support',
  'Food / Nutrition Support',
  'Medical Needs Support',
  'Disability Accommodation',
  'Child Protection Concern',
];

export const GuidanceCounselingWelfareTab: React.FC<GuidanceCounselingWelfareTabProps> = ({
  students,
  currentUser,
  counselingSessions,
  vulnerableLearners,
  onAddCounselingSession,
  onAddVulnerableLearner,
  onUpdateVulnerableLearner: _onUpdateVulnerableLearner,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'vulnerable'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddVulnerableModal, setShowAddVulnerableModal] = useState(false);
  const [viewingSession, setViewingSession] = useState<CounselingSession | null>(null);

  // Form State - Counseling Session
  const [formStudentId, setFormStudentId] = useState('');
  const [formCategory, setFormCategory] = useState<CounselingCategory>('Academic Guidance');
  const [formDate, setFormDate] = useState('2026-08-28');
  const [formCounselor, setFormCounselor] = useState(
    currentUser?.fullName ? `${currentUser.fullName} (Guidance & Counseling)` : 'Rev. J. Kiprotich (Head Counselor)'
  );
  const [formSummary, setFormSummary] = useState('');
  const [formSupportPlan, setFormSupportPlan] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('2026-09-10');
  const [formConfidentiality, setFormConfidentiality] = useState<
    'Standard Welfare Team' | 'Strictly Headteacher & Counselor'
  >('Standard Welfare Team');
  const [formStatus, setFormStatus] = useState<'Ongoing' | 'Resolved' | 'Referred to External Specialist'>(
    'Ongoing'
  );

  // Form State - Vulnerable Learner
  const [vulnStudentId, setVulnStudentId] = useState('');
  const [vulnType, setVulnType] = useState<VulnerabilityType>('Needy / Tuition Support');
  const [vulnDetails, setVulnDetails] = useState('');
  const [vulnProgram, setVulnProgram] = useState('County Ward Bursary Fund & School Feeding Program');
  const [vulnSponsor, setVulnSponsor] = useState('Trans-Nzoia Education Support');
  const [vulnAmount, setVulnAmount] = useState('20000');

  // Stats
  const stats = useMemo(() => {
    const totalSessions = counselingSessions.length;
    const ongoingSessions = counselingSessions.filter((s) => s.status === 'Ongoing').length;
    const totalVulnerable = vulnerableLearners.length;
    const totalBursaryAllocated = vulnerableLearners.reduce(
      (acc, v) => acc + (v.allocatedBursaryAmount || 0),
      0
    );

    return { totalSessions, ongoingSessions, totalVulnerable, totalBursaryAllocated };
  }, [counselingSessions, vulnerableLearners]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return counselingSessions.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.counselorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'All' || s.className === selectedClass;
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;

      return matchesSearch && matchesClass && matchesCategory;
    });
  }, [counselingSessions, searchTerm, selectedClass, selectedCategory]);

  const handleSaveCounselingSession = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formStudentId);
    if (!student) return;

    const newSession: CounselingSession = {
      id: `couns-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      className: `${student.grade} ${student.stream || student.classArm || ''}`.trim(),
      date: formDate,
      counselorName: formCounselor,
      category: formCategory,
      sessionSummary: formSummary,
      supportPlan: formSupportPlan,
      followUpDate: formFollowUp || undefined,
      confidentialityLevel: formConfidentiality,
      status: formStatus,
    };

    onAddCounselingSession(newSession);
    if (onLogAudit) {
      onLogAudit(
        'COUNSELING_SESSION_LOGGED' as any,
        `Logged confidential guidance session [${formCategory}] for ${student.name} (${student.admNo}). Confidentiality: ${formConfidentiality}.`
      );
    }

    setShowAddSessionModal(false);
  };

  const handleSaveVulnerableLearner = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === vulnStudentId);
    if (!student) return;

    const newRecord: VulnerableLearnerRecord = {
      id: `vuln-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      className: `${student.grade} ${student.stream || student.classArm || ''}`.trim(),
      vulnerabilityType: vulnType,
      details: vulnDetails,
      assignedSupportProgram: vulnProgram,
      sponsorOrPartner: vulnSponsor || undefined,
      allocatedBursaryAmount: parseFloat(vulnAmount) || 0,
      status: 'Active Support',
    };

    onAddVulnerableLearner(newRecord);
    if (onLogAudit) {
      onLogAudit(
        'VULNERABLE_LEARNER_ENROLLED' as any,
        `Enrolled ${student.name} (${student.admNo}) into Welfare Support Program: [${vulnType}]. Assigned: ${vulnProgram}.`
      );
    }

    setShowAddVulnerableModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guidance Sessions</span>
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.totalSessions}</p>
          <span className="text-[10px] text-slate-400 font-medium">{stats.ongoingSessions} ongoing support</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-purple-200/80 shadow-xs bg-gradient-to-b from-purple-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Vulnerable Learners</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-700 mt-1">{stats.totalVulnerable}</p>
          <span className="text-[10px] text-purple-600 font-medium">OVC &amp; Needy registered</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Welfare &amp; Bursary</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-700 mt-1">
            KES {stats.totalBursaryAllocated.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct scholarship fund</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">P6.7.2 Privacy Seal</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-amber-800 mt-2">Restricted Access</p>
          <span className="text-[10px] text-amber-600 font-medium">Protected guidance notes</span>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Counseling &amp; Guidance Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('vulnerable')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'vulnerable'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Vulnerable Learners &amp; Welfare Support (OVC)</span>
          </button>
        </div>

        {activeSubTab === 'sessions' ? (
          <button
            type="button"
            onClick={() => {
              setFormStudentId(students[0]?.id || '');
              setShowAddSessionModal(true);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Counseling Session</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setVulnStudentId(students[0]?.id || '');
              setShowAddVulnerableModal(true);
            }}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll in Welfare Program</span>
          </button>
        )}
      </div>

      {/* Sub-Tab 1: Counseling Sessions */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guidance sessions by learner, counselor, topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="All">All Classes</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="All">All Categories</option>
                {COUNSELING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Learner</th>
                    <th className="py-3 px-3">Counseling Domain</th>
                    <th className="py-3 px-3">Counselor</th>
                    <th className="py-3 px-3">Confidentiality Level</th>
                    <th className="py-3 px-3">Follow-up Date</th>
                    <th className="py-3 px-4 text-right">Protected View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                        No guidance and counseling records found.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{session.studentName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{session.admNo}</span>
                            <span>•</span>
                            <span>{session.className}</span>
                            <span>•</span>
                            <span>{session.date}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {session.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {session.counselorName}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              session.confidentialityLevel === 'Strictly Headteacher & Counselor'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <Lock className="w-2.5 h-2.5" />
                            {session.confidentialityLevel}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {session.followUpDate || 'Completed'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingSession(session)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                          >
                            View Summary &amp; Plan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Vulnerable Learners & Welfare Support Registry */}
      {activeSubTab === 'vulnerable' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vulnerableLearners.map((vuln) => (
              <div
                key={vuln.id}
                className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-xs hover:border-purple-300 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {vuln.studentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{vuln.studentName}</h4>
                      <div className="text-[11px] font-mono text-slate-500">
                        {vuln.admNo} • {vuln.className}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {vuln.vulnerabilityType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                  {vuln.details}
                </p>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold">Assigned Support Program:</span>
                    <span className="font-semibold text-slate-800">{vuln.assignedSupportProgram}</span>
                  </div>
                  {vuln.sponsorOrPartner && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold">Sponsor / Partner:</span>
                      <span className="font-semibold text-purple-700">{vuln.sponsorOrPartner}</span>
                    </div>
                  )}
                  {vuln.allocatedBursaryAmount && vuln.allocatedBursaryAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-bold">Allocated Bursary:</span>
                      <span className="font-black text-emerald-700">
                        KES {vuln.allocatedBursaryAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counseling Session Detail Modal */}
      {viewingSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Confidential Guidance Case Note</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Ref: {viewingSession.id} • {viewingSession.confidentialityLevel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingSession(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{viewingSession.studentName}</div>
                <div className="text-slate-600 font-medium">
                  Admission No: <span className="font-mono font-bold">{viewingSession.admNo}</span> • Class:{' '}
                  <strong>{viewingSession.className}</strong>
                </div>
                <div className="text-slate-500">
                  Counselor: <strong>{viewingSession.counselorName}</strong> • Date: {viewingSession.date}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Confidential Session Summary
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed">
                  {viewingSession.sessionSummary}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Intervention &amp; Support Action Plan
                </span>
                <p className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-indigo-950 font-semibold leading-relaxed">
                  {viewingSession.supportPlan}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Follow-up Review Date</span>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingSession.followUpDate || 'N/A'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Case Status</span>
                  <div className="font-bold text-indigo-700 mt-0.5">{viewingSession.status}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingSession(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer shadow-xs"
              >
                Close Protected Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Counseling Session Modal */}
      {showAddSessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">New Guidance &amp; Counseling Session</h3>
                <p className="text-xs text-slate-500 font-medium">P6.7.1 Counseling Records</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSessionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCounselingSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Counseling Domain</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CounselingCategory)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {COUNSELING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Counselor in Charge</label>
                <input
                  type="text"
                  required
                  value={formCounselor}
                  onChange={(e) => setFormCounselor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confidential Session Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Record counseling observations, discussions, and learner feelings..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Support &amp; Follow-up Action Plan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formSupportPlan}
                  onChange={(e) => setFormSupportPlan(e.target.value)}
                  placeholder="e.g. Schedule weekly check-ins, connect with peer mentor, monitor academic performance..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confidentiality Tier</label>
                  <select
                    value={formConfidentiality}
                    onChange={(e) => setFormConfidentiality(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-amber-800"
                  >
                    <option value="Standard Welfare Team">Standard Welfare Team</option>
                    <option value="Strictly Headteacher & Counselor">Strictly Headteacher & Counselor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Session Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Referred to External Specialist">Referred to Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Save Guidance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll in Welfare Program Modal */}
      {showAddVulnerableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enroll Learner in Welfare / OVC Program</h3>
                <p className="text-xs text-slate-500 font-medium">P6.7.3 Welfare Monitoring</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVulnerableModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVulnerableLearner} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={vulnStudentId}
                  onChange={(e) => setVulnStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Vulnerability Category</label>
                <select
                  value={vulnType}
                  onChange={(e) => setVulnType(e.target.value as VulnerabilityType)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-purple-700"
                >
                  {VULNERABILITY_TYPES.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assessment Details / Family Background <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={vulnDetails}
                  onChange={(e) => setVulnDetails(e.target.value)}
                  placeholder="e.g. Total orphan living with elderly grandmother; requires uniform & book kit"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Support Program</label>
                  <input
                    type="text"
                    required
                    value={vulnProgram}
                    onChange={(e) => setVulnProgram(e.target.value)}
                    placeholder="County Bursary & Feeding Kit"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Sponsor / Partner</label>
                  <input
                    type="text"
                    value={vulnSponsor}
                    onChange={(e) => setVulnSponsor(e.target.value)}
                    placeholder="e.g. County Education Fund"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Allocated Bursary (KES)</label>
                  <input
                    type="number"
                    value={vulnAmount}
                    onChange={(e) => setVulnAmount(e.target.value)}
                    placeholder="20000"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVulnerableModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Enroll in Welfare Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
