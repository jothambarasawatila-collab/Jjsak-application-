import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  UserCheck,
  Sparkles,
  Share2,
  GraduationCap,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Teacher, AuditActionType, UserRole } from '../types';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS, getTeacherInitials } from '../data/mockData';
import { StaffRegistrationModal } from './teachers/StaffRegistrationModal';
import { StaffDossierModal } from './teachers/StaffDossierModal';
import { StaffPipelineView } from './teachers/StaffPipelineView';
import { StaffRegistersView } from './teachers/StaffRegistersView';

interface TeachersScreenProps {
  teachers: Teacher[];
  onBack: () => void;
  onAddTeacher: (teacher: Teacher, options?: any) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (id: string) => void;
  onOpenMarksEntry?: (teacherId: string, className: string, subject: string) => void;
  onOpenShareModal?: () => void;
  currentUser?: any;
  users?: any;
  onLogAudit?: (action: AuditActionType, details: string, before?: string, after?: string) => void;
}

export const TeachersScreen: React.FC<TeachersScreenProps> = ({
  teachers,
  onBack,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onOpenMarksEntry,
  onOpenShareModal,
  currentUser,
  onLogAudit,
}) => {
  // Top-level Navigation Mode
  const [activeScreenTab, setActiveScreenTab] = useState<'directory' | 'pipeline' | 'registers'>('directory');

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Registration / Edit Modal State
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // 360° Dossier Modal State
  const [dossierTeacher, setDossierTeacher] = useState<Teacher | null>(null);

  // Quick Notification
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setShowRegistrationModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setShowRegistrationModal(true);
  };

  const handleOpenDossier = (t: Teacher) => {
    setDossierTeacher(t);
  };

  const handleSaveTeacherFromModal = (
    teacherData: Teacher,
    options?: { provisionAccount: boolean; userRole: UserRole; sendInvitation: boolean }
  ) => {
    if (editingTeacher) {
      if (onUpdateTeacher) {
        onUpdateTeacher(teacherData);
      }
      showNotification(`✓ Updated profile and records for ${teacherData.name}`);
    } else {
      onAddTeacher(teacherData, options);
      showNotification(`✓ Registered ${teacherData.name} into institutional staff database`);
    }
  };

  // KPIs
  const totalStaff = teachers.length;
  const tscVerifiedCount = teachers.filter((t) => t.tscNumber && t.tscNumber.trim().length > 0).length;
  const tscVerifiedPercent = totalStaff > 0 ? Math.round((tscVerifiedCount / totalStaff) * 100) : 100;
  const activeIamCount = teachers.filter((t) => t.active !== false && t.accountStatus !== 'SUSPENDED').length;
  const avgWorkload =
    totalStaff > 0
      ? Math.round(
          teachers.reduce((acc, t) => acc + (t.workload?.lessonsPerWeek || 22), 0) / totalStaff
        )
      : 24;

  const filteredTeachers = teachers.filter((t) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.role && t.role.toLowerCase().includes(q)) ||
      (t.tscNumber && t.tscNumber.toLowerCase().includes(q)) ||
      (t.staffNumber && t.staffNumber.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q));

    const matchesClass =
      selectedClassFilter === 'All' ||
      (t.classes && t.classes.some((c) => c === selectedClassFilter)) ||
      (t.allocations && t.allocations.some((a) => a.className === selectedClassFilter));

    const subjFilter = (selectedSubjectFilter || '').toLowerCase();
    const matchesSubject =
      selectedSubjectFilter === 'All' ||
      (t.subjects && t.subjects.some((s) => s && s.toLowerCase() === subjFilter)) ||
      (t.allocations &&
        t.allocations.some((a) =>
          a.subjects && a.subjects.some((s) => s && s.toLowerCase() === subjFilter)
        ));

    const deptFilter = (selectedDepartmentFilter || '').toLowerCase();
    const matchesDepartment =
      selectedDepartmentFilter === 'All' ||
      (t.department && t.department.toLowerCase() === deptFilter);

    const isSuspended = t.active === false || t.accountStatus === 'SUSPENDED';
    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Active' && !isSuspended) ||
      (selectedStatusFilter === 'Suspended' && isSuspended);

    return matchesSearch && matchesClass && matchesSubject && matchesDepartment && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Top Header */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Staff & Professional Records</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-red-100 border border-white/20">
                Phase 4
              </span>
            </h1>
            <span className="text-[11px] text-red-100 font-medium block">
              Registration, Verification, Workload, Appraisals & IAM Provisioning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="Share app"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#C51E28] flex items-center gap-1.5 font-bold text-xs shadow-sm hover:bg-red-50 active:scale-95 transition cursor-pointer"
            title="Register New Staff Member"
          >
            <Plus className="w-4 h-4 text-[#C51E28]" />
            <span className="hidden sm:inline">Register Staff</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div className="bg-slate-900 text-red-100 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in fade-in sticky top-14 z-25">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Screen Sub-Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-2xs px-4 py-2 sticky top-14 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'directory', label: 'Staff Directory & Profiles', icon: UserCheck, count: teachers.length },
              { id: 'pipeline', label: '10-Step Approval & IAM Pipeline', icon: ShieldCheck },
              { id: 'registers', label: 'Qualifications & Integrity Registers', icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeScreenTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveScreenTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Staff Profile</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 py-5 flex-1">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Staff</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-[#C51E28]">{totalStaff}</span>
              <span className="text-[11px] text-slate-500 font-semibold">Educators</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">TSC Licensure</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-700">{tscVerifiedPercent}%</span>
              <span className="text-[11px] text-slate-500 font-semibold">Verified</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">IAM Accounts</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-800">{activeIamCount}</span>
              <span className="text-[11px] text-emerald-600 font-bold">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Avg Workload</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-800">{avgWorkload}</span>
              <span className="text-[11px] text-slate-500 font-semibold">/ 27 Lsns</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">TPAD Rating</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-600">86.4%</span>
              <span className="text-[11px] text-amber-700 font-bold">Exceeding</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: STAFF DIRECTORY & PROFILES */}
        {activeScreenTab === 'directory' && (
          <div className="space-y-5">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by teacher name, TSC number, staff ID, or learning area..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#C51E28] transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedDepartmentFilter}
                    onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Departments</option>
                    <option value="Technical & Applied">Technical & Applied</option>
                    <option value="Languages">Languages</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Creative Arts & Sports">Creative Arts & Sports</option>
                    <option value="Administration">Administration</option>
                  </select>

                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Classes (G7-G9)</option>
                    {AVAILABLE_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Subjects</option>
                    {AVAILABLE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active in IAM</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Staff Cards Grid */}
            {filteredTeachers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No staff members match the selected filters</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust your search parameters or register a new teacher.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((t) => {
                  const isSuspended = t.active === false || t.accountStatus === 'SUSPENDED';
                  const primarySubject = t.subjects?.[0] || 'Pretechnical Studies';
                  const primaryClass = t.classes?.[0] || 'G8 S';

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        {/* Header: Avatar, Name, Identifiers */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-xs shrink-0"
                              style={{ backgroundColor: t.avatarHex || '#C51E28' }}
                            >
                              {getTeacherInitials(t.name)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                                  {t.staffNumber || t.employeeNumber || 'STF-001'}
                                </span>
                                {t.tscNumber && (
                                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 text-[10px] font-mono font-bold border border-red-200">
                                    {t.tscNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              !isSuspended
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {!isSuspended ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </div>

                        {/* Role & Department */}
                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800 truncate">{t.role}</p>
                          <p className="text-[11px] text-slate-500">
                            Dept: <span className="font-medium text-slate-700">{t.department || 'Technical & Applied'}</span>
                            {' • '}
                            {t.employmentStatus || 'Permanent'}
                          </p>
                        </div>

                        {/* Stream and Learning Area Allocations */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Assigned Streams & Learning Areas
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(t.allocations && t.allocations.length > 0 ? t.allocations : []).map((alloc) => (
                              <span
                                key={alloc.className}
                                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200"
                              >
                                {alloc.className} ({alloc.subjects.length})
                              </span>
                            ))}
                            {(!t.allocations || t.allocations.length === 0) &&
                              t.classes.map((cls) => (
                                <span
                                  key={cls}
                                  className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200"
                                >
                                  {cls}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Workload Indicator */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-500 font-medium">Weekly Load:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {t.workload?.lessonsPerWeek || 22} / 27 Lessons
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(t)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {onOpenMarksEntry && (
                            <button
                              type="button"
                              onClick={() => onOpenMarksEntry(t.id, primaryClass, primarySubject)}
                              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                              title="Enter Marks as this teacher"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Marks</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-slate-50 transition-colors"
                            title="Edit Staff Records"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTeacher?.(t.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Staff Details (Permanent / Recycle Bin Deletion)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: 10-STEP APPROVAL & IAM PIPELINE */}
        {activeScreenTab === 'pipeline' && (
          <StaffPipelineView
            teachers={teachers}
            onUpdateTeacher={(updated) => {
              if (onUpdateTeacher) onUpdateTeacher(updated);
            }}
            onSelectTeacherForDossier={handleOpenDossier}
            onLogAudit={onLogAudit}
          />
        )}

        {/* VIEW 3: QUALIFICATIONS & INTEGRITY REGISTERS */}
        {activeScreenTab === 'registers' && (
          <StaffRegistersView
            teachers={teachers}
            onSelectTeacherForDossier={handleOpenDossier}
          />
        )}
      </div>

      {/* Registration & Edit Modal */}
      <StaffRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSaveTeacher={handleSaveTeacherFromModal}
        existingTeachers={teachers}
        editingTeacher={editingTeacher}
        availableClasses={AVAILABLE_CLASSES}
        availableSubjects={AVAILABLE_SUBJECTS}
        currentUserRole={currentUser?.role}
        currentSchoolId={currentUser?.schoolId}
      />

      {/* 360° Professional Dossier Modal */}
      <StaffDossierModal
        isOpen={!!dossierTeacher}
        onClose={() => setDossierTeacher(null)}
        teacher={dossierTeacher}
        onUpdateTeacher={(updated) => {
          if (onUpdateTeacher) onUpdateTeacher(updated);
          setDossierTeacher(updated);
        }}
        onOpenMarksEntry={onOpenMarksEntry}
        onLogAudit={onLogAudit}
      />
    </div>
  );
};
