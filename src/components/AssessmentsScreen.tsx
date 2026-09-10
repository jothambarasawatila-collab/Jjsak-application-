import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  FilePlus,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  Calculator,
  Percent,
  Share2,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { Assessment, Student, Teacher, User } from '../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_TERMS,
  AVAILABLE_SUBJECTS,
  AVAILABLE_ASSESSMENT_TYPES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
} from '../data/mockData';
import { isDirectorOfAcademics } from '../utils/securityEngine';
import { ScoreConverterModal } from './ScoreConverterModal';
import { TeacherMarksEntryModal } from './TeacherMarksEntryModal';

interface AssessmentsScreenProps {
  assessments: Assessment[];
  students?: Student[];
  teachers?: Teacher[];
  currentUser?: User;
  onBack: () => void;
  onCreateAssessment: (newAssessment: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
  onSaveAssessmentMarks?: (assessment: Assessment, updatedStudents: Student[]) => void;
  onOpenShareModal?: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({
  assessments,
  students = INITIAL_STUDENTS,
  teachers = INITIAL_TEACHERS,
  currentUser,
  onBack,
  onCreateAssessment,
  onDeleteAssessment,
  onSaveAssessmentMarks,
  onOpenShareModal,
  onLogAudit,
}) => {
  const isDirector = isDirectorOfAcademics(currentUser);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED'>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('G8 S');
  const [selectedTerm, setSelectedTerm] = useState('Term 2, 2024');
  const [selectedSubject, setSelectedSubject] = useState('Social Studies');
  const [selectedType, setSelectedType] = useState('Mid Term Exam');
  const [totalMarks, setTotalMarks] = useState('100');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nameError, setNameError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showConverterModal, setShowConverterModal] = useState(false);

  // Teacher Mark Sheet Modal state
  const [markSheetModalOpen, setMarkSheetModalOpen] = useState(false);
  const [markSheetAssessmentId, setMarkSheetAssessmentId] = useState<string | undefined>(undefined);
  const [markSheetClass, setMarkSheetClass] = useState<string>('G8 S');
  const [markSheetSubject, setMarkSheetSubject] = useState<string>('Social Studies');
  const [markSheetTeacherId, setMarkSheetTeacherId] = useState<string>(teachers[0]?.id || 'tch-01');

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenMarksEntry = (
    assId?: string,
    cls: string = 'G8 S',
    subj: string = 'Social Studies',
    teachId: string = teachers[0]?.id || 'tch-01'
  ) => {
    setMarkSheetAssessmentId(assId);
    setMarkSheetClass(cls.includes('(') ? 'G8 S' : cls);
    setMarkSheetSubject(subj);
    setMarkSheetTeacherId(teachId);
    setMarkSheetModalOpen(true);
    setActiveMenuId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const newAssId = 'ass-' + Math.random().toString(36).substring(2, 9);
    const newAss: Assessment = {
      id: newAssId,
      name: name.trim(),
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: selectedType,
      totalMarks: parseInt(totalMarks) || 100,
      date: date || new Date().toISOString().split('T')[0],
      status: 'In Progress',
      recordedScoresCount: 0,
      totalStudentsCount: students.filter((s) => s.classArm === selectedClass).length || 32,
    };

    onCreateAssessment(newAss);
    setName('');
    setNameError(false);
    setFormOpen(false);
    showNotification('Assessment created! Opening Mark Sheet...');
    
    // Immediately open mark sheet for rapid score entry
    setTimeout(() => {
      handleOpenMarksEntry(newAssId, selectedClass, selectedSubject);
    }, 400);
  };

  const filteredAssessments = assessments.filter((a) => {
    // 1. Tab filter
    if (activeTab === 'my') {
      const matchMy = a.className.includes('G8') || a.subject === 'Social Studies' || a.subject === 'Mathematics' || a.subject === 'Pretechnical Studies';
      if (!matchMy) return false;
    }
    // 2. Approval status filter
    if (approvalFilter === 'DRAFT') return !a.approvalStatus || a.approvalStatus === 'Draft';
    if (approvalFilter === 'SUBMITTED') return a.approvalStatus === 'Submitted';
    if (approvalFilter === 'APPROVED') return a.approvalStatus === 'Approved' || a.isLocked;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Policy Governance Status Banner */}
      <div className="bg-slate-950 text-white px-4 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isDirector ? (
              <span className="text-emerald-300 font-bold">
                Director of Academics • Exclusive Assessment Approval, Mark Locking &amp; Publishing Authority
              </span>
            ) : (
              <span className="text-slate-300 font-medium">
                Teacher Access: <strong className="text-white">Enter, Edit &amp; Submit Marks</strong> for Assigned Classes (Approval reserved for Director of Academics)
              </span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Academic Policy • Sec 1, 5, 8</span>
      </div>

      {/* Top Red Header Bar */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-white tracking-tight">
            Assessments
          </h1>
          <span className="text-[10px] text-red-100 font-medium">
            Teacher Mark Entry &amp; Director Approval
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="Share app to Phone, Laptop or PC"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowConverterModal(true)}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="Score Converter"
          >
            <Calculator className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setFormOpen(!formOpen)}
            className="w-8 h-8 rounded-full bg-white text-[#C51E28] flex items-center justify-center font-bold shadow-xs hover:bg-red-50 active:scale-95 transition cursor-pointer"
            title="Toggle New Assessment"
          >
            <Plus className="w-4 h-4 text-[#C51E28]" />
          </button>
        </div>
      </div>

      {/* Quick Teacher Score Entry Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-3.5 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-black tracking-wide uppercase">
                Teacher Subject Marks Entry
              </span>
            </div>
            <p className="text-[11px] text-red-100 mt-0.5">
              Enter subject scores on your phone, laptop or PC & publish to report cards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenMarksEntry()}
            className="px-3.5 py-2 rounded-xl bg-white text-[#C51E28] hover:bg-red-50 font-bold text-xs shadow-md active:scale-95 transition shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#C51E28]" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher & Status Filter */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-2 text-center text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('my')}
            className={`py-3 transition-all cursor-pointer relative ${
              activeTab === 'my' ? 'text-[#C51E28]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Assessments</span>
            {activeTab === 'my' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C51E28] rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-3 transition-all cursor-pointer relative ${
              activeTab === 'all' ? 'text-[#C51E28]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All Assessments</span>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C51E28] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Approval Status Filter Pills */}
        <div className="max-w-md mx-auto px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
            Status:
          </span>
          {[
            { id: 'ALL', label: 'All Statuses' },
            { id: 'SUBMITTED', label: 'Submitted (Review)' },
            { id: 'APPROVED', label: 'Approved & Locked' },
            { id: 'DRAFT', label: 'Drafts' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setApprovalFilter(pill.id as any)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition shrink-0 cursor-pointer ${
                approvalFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & List Content */}
      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4">
        
        {/* "Create New Assessment" Card */}
        {formOpen && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3 animate-in fade-in">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C51E28] flex items-center justify-center">
                  <FilePlus className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Create Assessment & Mark Sheet
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3 pt-1">
              {/* Assessment Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="e.g. End of Term 2 Exam"
                  className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                    nameError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-[#C51E28] focus:ring-[#C51E28]'
                  }`}
                />
                {nameError && (
                  <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">
                    Please enter assessment name
                  </span>
                )}
              </div>

              {/* Class Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Term Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Term
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_TERMS.slice(0, 6).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Subject / Learning Area
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Assessment Type Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assessment Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_ASSESSMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Total Marks */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Total Marks (Out Of)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConverterModal(true)}
                    className="text-[10px] font-bold text-[#C51E28] hover:underline flex items-center gap-0.5"
                  >
                    <Percent className="w-3 h-3" />
                    <span>Score Converter</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {['100', '80', '50', '30', '40'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTotalMarks(preset)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                        totalMarks === preset
                          ? 'bg-[#C51E28] text-white border-[#C51E28]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      /{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Create Assessment Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C51E28] hover:bg-[#B31821] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Open Mark Sheet</span>
              </button>
            </form>
          </div>
        )}

        {/* "Recent Assessments" List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide">
              Recent Assessments
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {filteredAssessments.length} assessments
            </span>
          </div>

          {filteredAssessments.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenMarksEntry(item.id, item.className, item.subject)}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col gap-2 relative hover:border-[#C51E28] hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#C51E28] border border-red-100">
                      {item.className.includes('(') ? 'All Classes' : item.className}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border flex items-center gap-1 ${
                        item.approvalStatus === 'Approved' || item.isLocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.approvalStatus === 'Submitted'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.approvalStatus === 'Returned for Correction'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.isLocked && <Lock className="w-2.5 h-2.5 text-emerald-600" />}
                      <span>{item.approvalStatus || 'Draft'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {item.className} • {item.subject}
                  </p>
                </div>

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === item.id && (
                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          handleOpenMarksEntry(item.id, item.className, item.subject);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-slate-800 flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C51E28]" />
                        <span>{item.isLocked && !isDirector ? 'View Marks (Locked)' : 'Enter / Edit Marks'}</span>
                      </button>

                      {isDirector && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              const nextLocked = !item.isLocked;
                              const updatedAss: Assessment = {
                                ...item,
                                isLocked: nextLocked,
                                approvalStatus: nextLocked ? 'Approved' : 'Draft',
                              };
                              onSaveAssessmentMarks?.(updatedAss, students);
                              onLogAudit?.(
                                nextLocked ? 'ASSESSMENT_LOCKED' : 'ASSESSMENT_REOPENED',
                                `Director ${nextLocked ? 'approved & locked' : 'reopened'} ${item.name}`
                              );
                              showNotification(nextLocked ? 'Assessment approved & locked!' : 'Assessment reopened.');
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-1.5"
                          >
                            {item.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            <span>{item.isLocked ? 'Reopen Assessment' : 'Approve & Lock'}</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          onDeleteAssessment(item.id);
                          showNotification('Assessment deleted');
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 mt-1">
                <span>Total Marks: /{item.totalMarks} • {item.date}</span>
                <span className="text-[#C51E28] font-bold flex items-center gap-1 text-xs">
                  <Edit2 className="w-3 h-3" />
                  <span>{item.isLocked && !isDirector ? 'View Mark Sheet' : 'Open Mark Sheet'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standalone Score Converter Modal */}
      <ScoreConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        initialOutOf={parseInt(totalMarks) || 100}
      />

      {/* Full Teacher Assessment Mark Entry & Submit Modal */}
      <TeacherMarksEntryModal
        isOpen={markSheetModalOpen}
        onClose={() => setMarkSheetModalOpen(false)}
        students={students}
        teachers={teachers}
        assessments={assessments}
        currentUser={currentUser}
        initialTeacherId={markSheetTeacherId}
        initialClass={markSheetClass}
        initialSubject={markSheetSubject}
        initialAssessmentId={markSheetAssessmentId}
        onSaveAssessmentMarks={(ass, updatedStudents) => {
          if (onSaveAssessmentMarks) {
            onSaveAssessmentMarks(ass, updatedStudents);
          }
        }}
        onOpenShareModal={onOpenShareModal}
        onLogAudit={onLogAudit}
      />
    </div>
  );
};
