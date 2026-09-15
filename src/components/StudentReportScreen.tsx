import React, { useState } from 'react';
import {
  ArrowLeft,
  Printer,
  MessageSquare,
  Award,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Sparkles,
  X,
  UserCheck,
  Check,
  SlidersHorizontal,
  MinusCircle,
  Calculator,
  Compass,
  Briefcase,
  GraduationCap,
  Phone,
  PhoneCall,
  Plus,
  Trash2,
  Edit2,
  Users,
  MessageCircle,
  Lock,
} from 'lucide-react';
import { Student, SubjectPerformance, Teacher, SchoolTenant, SchoolProfile, User } from '../types';
import { calculateStudentPathways } from '../data/pathwayUtils';
import { resolveSchoolTheme } from '../utils/brandingEngine';
import { isDirectorOfAcademics } from '../utils/securityEngine';
import {
  HEAD_OF_INSTITUTION_COMMENT_PRESETS,
  AVAILABLE_YEARS,
  AVAILABLE_SUBJECTS,
  INITIAL_TEACHERS,
  calculateGrade,
  calculateStudentAverage,
  getDefaultNextTermDate,
  POPULAR_SCORE_BASES,
  convertRawScoreToPercentage,
  parseScoreString,
  calculateSingleStudentRanking,
  getRankSuffix,
  getTeacherForSubject,
} from '../data/mockData';
import { ScoreConverterModal } from './ScoreConverterModal';
import { BatchReportGeneratorModal } from './BatchReportGeneratorModal';
import { StudentPerformanceTrendChart } from './reporting/StudentPerformanceTrendChart';

interface StudentReportScreenProps {
  student: Student;
  allStudents: Student[];
  teachers?: Teacher[];
  activeTenant?: SchoolTenant;
  schoolProfile?: SchoolProfile;
  currentUser?: User;
  onSelectStudent: (student: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onBatchUpdateStudents?: (updater: (s: Student) => Student) => void;
  onBack: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const StudentReportScreen: React.FC<StudentReportScreenProps> = ({
  student,
  allStudents,
  teachers = INITIAL_TEACHERS,
  activeTenant,
  schoolProfile,
  currentUser,
  onSelectStudent,
  onUpdateStudent,
  onBatchUpdateStudents,
  onBack,
  onLogAudit,
}) => {
  const currentTheme = resolveSchoolTheme(
    activeTenant || {
      schoolId: '',
      schoolCode: 'JJSAK-001',
      schoolName: schoolProfile?.schoolName || 'JJSAK Educational Institution',
      address: schoolProfile?.postalAddress || 'P.O. Box 100 - 00100, Nairobi',
      phone: schoolProfile?.phoneNumber || '+254 700 000 000',
      email: schoolProfile?.emailAddress || 'info@jjsak.ac.ke',
      category: 'JUNIOR',
      status: 'ACTIVE',
    }
  );

  const isDirector = isDirectorOfAcademics(currentUser);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-slate-200 shadow-sm">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">No Learner Selected</h2>
          <p className="text-xs text-slate-500">
            Please return to the dashboard to select or register a learner.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showPrintToast, setShowPrintToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Generating Printable Report Card...');
  const [isSignatureBlank, setIsSignatureBlank] = useState(true); // Default to blank signature line for manual signing as requested
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedActionName, setRestrictedActionName] = useState('Print Report Card');

  // Head of Institution comment modal state
  const [showHeadCommentModal, setShowHeadCommentModal] = useState(false);
  const [headCommentDraft, setHeadCommentDraft] = useState('');
  const [headNameDraft, setHeadNameDraft] = useState('');
  const [selectedPresetTab, setSelectedPresetTab] = useState(0);
  const [applyToClass, setApplyToClass] = useState(false);

  // Class teacher comment modal state
  const [showTeacherCommentModal, setShowTeacherCommentModal] = useState(false);
  const [teacherCommentDraft, setTeacherCommentDraft] = useState('');
  const [teacherNameDraft, setTeacherNameDraft] = useState('');

  // Subject Scores Modal state
  const [showSubjectScoresModal, setShowSubjectScoresModal] = useState(false);
  const [draftSubjectScores, setDraftSubjectScores] = useState<Record<string, number | null>>({});
  const [draftRawInputs, setDraftRawInputs] = useState<Record<string, string>>({});
  const [scoreBaseMode, setScoreBaseMode] = useState<number | 'custom'>(100);
  const [customBaseVal, setCustomBaseVal] = useState<string>('50');
  const [showConverterModal, setShowConverterModal] = useState(false);

  const currentScoreBase = scoreBaseMode === 'custom' ? parseFloat(customBaseVal) || 100 : scoreBaseMode;

  const openSubjectScoresEditor = () => {
    const scores: Record<string, number | null> = {};
    const rawInputs: Record<string, string> = {};
    AVAILABLE_SUBJECTS.forEach((subName) => {
      const match = student.subjects.find((s) => s.subject === subName);
      const val = match !== undefined ? match.score : null;
      scores[subName] = val;
      rawInputs[subName] = val !== null && val !== undefined ? String(val) : '';
    });
    setDraftSubjectScores(scores);
    setDraftRawInputs(rawInputs);
    setScoreBaseMode(100);
    setShowSubjectScoresModal(true);
  };

  const handleDraftInputChange = (subName: string, text: string) => {
    setDraftRawInputs((prev) => ({ ...prev, [subName]: text }));

    const parsed = parseScoreString(text, currentScoreBase);
    setDraftSubjectScores((prev) => ({
      ...prev,
      [subName]: parsed.percentage,
    }));
  };

  const handleBaseModeChange = (newBase: number | 'custom') => {
    setScoreBaseMode(newBase);
    const effBase = newBase === 'custom' ? parseFloat(customBaseVal) || 100 : newBase;
    // Re-evaluate raw inputs against new base if they are numeric
    const newScores: Record<string, number | null> = {};
    AVAILABLE_SUBJECTS.forEach((subName) => {
      const rawText = draftRawInputs[subName];
      if (rawText && rawText.trim()) {
        const parsed = parseScoreString(rawText, effBase);
        newScores[subName] = parsed.percentage;
      } else {
        newScores[subName] = draftSubjectScores[subName] ?? null;
      }
    });
    setDraftSubjectScores(newScores);
  };

  const handleCustomBaseValChange = (val: string) => {
    setCustomBaseVal(val);
    const effBase = parseFloat(val) || 100;
    const newScores: Record<string, number | null> = {};
    AVAILABLE_SUBJECTS.forEach((subName) => {
      const rawText = draftRawInputs[subName];
      if (rawText && rawText.trim()) {
        const parsed = parseScoreString(rawText, effBase);
        newScores[subName] = parsed.percentage;
      } else {
        newScores[subName] = draftSubjectScores[subName] ?? null;
      }
    });
    setDraftSubjectScores(newScores);
  };

  const handleDraftScoreChange = (subName: string, val: number | null) => {
    if (val === null) {
      setDraftSubjectScores((prev) => ({
        ...prev,
        [subName]: null,
      }));
      setDraftRawInputs((prev) => ({
        ...prev,
        [subName]: '',
      }));
      return;
    }
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setDraftSubjectScores((prev) => ({
      ...prev,
      [subName]: clamped,
    }));
    setDraftRawInputs((prev) => ({
      ...prev,
      [subName]: String(clamped),
    }));
  };

  const handleSetAllDraftScores = (val: number | null) => {
    const updated: Record<string, number | null> = {};
    const updatedInputs: Record<string, string> = {};
    AVAILABLE_SUBJECTS.forEach((subName) => {
      updated[subName] = val;
      updatedInputs[subName] = val !== null ? String(val) : '';
    });
    setDraftSubjectScores(updated);
    setDraftRawInputs(updatedInputs);
  };

  const handleSaveSubjectScores = () => {
    const updatedSubjects: SubjectPerformance[] = AVAILABLE_SUBJECTS.map((subName) => {
      const score = draftSubjectScores[subName] !== undefined ? draftSubjectScores[subName] : null;
      const g = calculateGrade(score);
      return {
        subject: subName,
        score,
        grade: g.grade,
        remarks: g.remarks,
      };
    });

    const { avgScore, overallGrade } = calculateStudentAverage(updatedSubjects);

    const updatedStudent: Student = {
      ...student,
      avgScore,
      overallGrade,
      position: avgScore === null ? '-' : student.position === '-' ? `1/${allStudents.length}` : student.position,
      subjects: updatedSubjects,
      classTeacherComment:
        avgScore === null && (!student.classTeacherComment || student.classTeacherComment.includes('consistent progress'))
          ? 'Did not sit for term assessments.'
          : student.classTeacherComment,
      headTeacherComment:
        avgScore === null && (!student.headTeacherComment || student.headTeacherComment.includes('exemplary'))
          ? 'Did not sit for term assessments due to authorized absence.'
          : student.headTeacherComment,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setShowSubjectScoresModal(false);
    setToastMessage('Subject scores & competency remarks updated!');
    setShowPrintToast(true);
    setTimeout(() => setShowPrintToast(false), 2200);
  };

  // Term & Academic Year modal state
  const [showTermModal, setShowTermModal] = useState(false);
  const [draftYear, setDraftYear] = useState<number>(student.year || 2026);
  const [draftTerm, setDraftTerm] = useState(student.term || 'Term 2, 2026');
  const [draftNextTermDate, setDraftNextTermDate] = useState(
    student.nextTermDate || '5th August 2026'
  );
  const [termSyncScope, setTermSyncScope] = useState<'student' | 'stream' | 'all'>('all');

  const openTermEditor = () => {
    setDraftYear(student.year || 2026);
    setDraftTerm(student.term || 'Term 2, 2026');
    setDraftNextTermDate(student.nextTermDate || '5th August 2026');
    setTermSyncScope('all');
    setShowTermModal(true);
  };

  const handleSelectYearInModal = (newYear: number) => {
    setDraftYear(newYear);
    const termBase = draftTerm.includes('Term 1')
      ? 'Term 1'
      : draftTerm.includes('Term 3')
      ? 'Term 3'
      : 'Term 2';
    const newTerm = `${termBase}, ${newYear}`;
    setDraftTerm(newTerm);
    setDraftNextTermDate(getDefaultNextTermDate(newTerm, newYear));
  };

  const handleSelectTermInModal = (tNum: 'Term 1' | 'Term 2' | 'Term 3') => {
    const newTerm = `${tNum}, ${draftYear}`;
    setDraftTerm(newTerm);
    setDraftNextTermDate(getDefaultNextTermDate(newTerm, draftYear));
  };

  const handleSaveTermAndYear = () => {
    const updated: Student = {
      ...student,
      year: draftYear,
      term: draftTerm,
      nextTermDate: draftNextTermDate,
    };

    if (termSyncScope === 'student') {
      if (onUpdateStudent) {
        onUpdateStudent(updated);
      }
    } else if (termSyncScope === 'stream') {
      if (onBatchUpdateStudents) {
        onBatchUpdateStudents((s) =>
          s.classArm === student.classArm
            ? { ...s, year: draftYear, term: draftTerm, nextTermDate: draftNextTermDate }
            : s
        );
      } else if (onUpdateStudent) {
        onUpdateStudent(updated);
      }
    } else {
      // Entire school
      if (onBatchUpdateStudents) {
        onBatchUpdateStudents((s) => ({
          ...s,
          year: draftYear,
          term: draftTerm,
          nextTermDate: draftNextTermDate,
        }));
      } else if (onUpdateStudent) {
        onUpdateStudent(updated);
      }
    }

    setShowTermModal(false);
    setToastMessage('Academic Year & Term dates updated successfully!');
    setShowPrintToast(true);
    setTimeout(() => setShowPrintToast(false), 2500);
  };

  const openHeadCommentEditor = () => {
    setHeadCommentDraft(
      student.headTeacherComment ||
        'An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.'
    );
    setHeadNameDraft(student.headOfSchoolName || 'Mrs. J. Barasa');
    setApplyToClass(false);

    // Auto-select tab matching student performance
    if (student.overallGrade.startsWith('EE')) {
      setSelectedPresetTab(0);
    } else if (student.overallGrade.startsWith('ME')) {
      setSelectedPresetTab(1);
    } else if (student.overallGrade.startsWith('AE')) {
      setSelectedPresetTab(2);
    } else if (student.overallGrade.startsWith('BE')) {
      setSelectedPresetTab(3);
    } else {
      setSelectedPresetTab(4);
    }

    setShowHeadCommentModal(true);
  };

  const handleSaveHeadComment = () => {
    if (!headCommentDraft.trim()) return;

    const updatedCurrentStudent: Student = {
      ...student,
      headTeacherComment: headCommentDraft.trim(),
      headOfSchoolName: headNameDraft.trim() || student.headOfSchoolName,
    };

    if (onUpdateStudent) {
      if (applyToClass) {
        // Apply to all students in the same class
        allStudents
          .filter((s) => s.classArm === student.classArm)
          .forEach((s) => {
            onUpdateStudent({
              ...s,
              headTeacherComment: headCommentDraft.trim(),
              headOfSchoolName: headNameDraft.trim() || s.headOfSchoolName,
            });
          });
      } else {
        onUpdateStudent(updatedCurrentStudent);
      }
    }

    setShowHeadCommentModal(false);
    setToastMessage('Head of Institution comment updated successfully!');
    setShowPrintToast(true);
    setTimeout(() => {
      setShowPrintToast(false);
    }, 2200);
  };

  // ==========================================
  // PARENT & GUARDIAN MANAGEMENT STATE & LOGIC
  // ==========================================
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [parentNameDraft, setParentNameDraft] = useState('');
  const [parentPhoneDraft, setParentPhoneDraft] = useState('');
  const [parentRelationDraft, setParentRelationDraft] = useState('Father');
  const [deleteParentConfirmId, setDeleteParentConfirmId] = useState<string | null>(null);

  // Normalize parents list for current student
  const parentContacts = (student.parents && student.parents.length > 0)
    ? student.parents
    : (student.parentName || student.parentPhone)
    ? [
        {
          id: 'p-default',
          name: student.parentName || 'Parent / Guardian',
          phoneNumber: student.parentPhone || '',
          relation: 'Guardian',
        },
      ]
    : [];

  const handleOpenAddParent = () => {
    setEditingParentId(null);
    setParentNameDraft('');
    setParentPhoneDraft('');
    setParentRelationDraft('Father');
    setShowParentModal(true);
  };

  const handleOpenEditParent = (p: { id?: string; name: string; phoneNumber: string; relation?: string }) => {
    setEditingParentId(p.id || p.name);
    setParentNameDraft(p.name);
    setParentPhoneDraft(p.phoneNumber);
    setParentRelationDraft(p.relation || 'Parent');
    setShowParentModal(true);
  };

  const handleSaveParent = () => {
    if (!parentNameDraft.trim()) return;

    let updatedParents = [...parentContacts];
    if (editingParentId) {
      updatedParents = updatedParents.map((p) =>
        (p.id === editingParentId || p.name === editingParentId)
          ? {
              ...p,
              name: parentNameDraft.trim(),
              phoneNumber: parentPhoneDraft.trim(),
              relation: parentRelationDraft,
            }
          : p
      );
    } else {
      updatedParents.push({
        id: `p-${Date.now()}`,
        name: parentNameDraft.trim(),
        phoneNumber: parentPhoneDraft.trim(),
        relation: parentRelationDraft,
      });
    }

    const updatedStudent: Student = {
      ...student,
      parents: updatedParents,
      parentName: updatedParents[0]?.name || '',
      parentPhone: updatedParents[0]?.phoneNumber || '',
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setShowParentModal(false);
    setToastMessage('Parent / Guardian contact saved successfully!');
    setShowPrintToast(true);
    setTimeout(() => setShowPrintToast(false), 2200);
  };

  const handleDeleteParent = (idOrName: string) => {
    const updatedParents = parentContacts.filter((p) => p.id !== idOrName && p.name !== idOrName);
    const updatedStudent: Student = {
      ...student,
      parents: updatedParents,
      parentName: updatedParents[0]?.name || '',
      parentPhone: updatedParents[0]?.phoneNumber || '',
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setDeleteParentConfirmId(null);
    setToastMessage('Parent contact removed.');
    setShowPrintToast(true);
    setTimeout(() => setShowPrintToast(false), 2000);
  };

  const openTeacherCommentEditor = () => {
    setTeacherCommentDraft(student.classTeacherComment);
    setTeacherNameDraft(student.classTeacherName);
    setShowTeacherCommentModal(true);
  };

  const handleSaveTeacherComment = () => {
    if (!teacherCommentDraft.trim()) return;

    const updated: Student = {
      ...student,
      classTeacherComment: teacherCommentDraft.trim(),
      classTeacherName: teacherNameDraft.trim() || student.classTeacherName,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }

    setShowTeacherCommentModal(false);
    setToastMessage("Class Teacher's comment updated!");
    setShowPrintToast(true);
    setTimeout(() => {
      setShowPrintToast(false);
    }, 2000);
  };

  const currentHeadComment =
    student.headTeacherComment ||
    'An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.';

  const rankingInfo = calculateSingleStudentRanking(student, allStudents);

  // Dynamic attendance calculated based on assessment completion
  const totalSubjectsCount = student.subjects.length || 9;
  const assessedSubjectsCount = student.subjects.filter(
    (s) => s.score !== null && s.score !== undefined
  ).length;
  const calculatedAttendance =
    totalSubjectsCount > 0 ? Math.round((assessedSubjectsCount / totalSubjectsCount) * 100) : 100;

  const handlePrint = () => {
    if (!isDirector) {
      setRestrictedActionName('Print Official Report Card');
      setShowRestrictedModal(true);
      return;
    }
    setToastMessage('Generating Official Printable Report Card...');
    setShowPrintToast(true);
    onLogAudit?.(
      'ACADEMIC_REPORT_PRINTED',
      `Director of Academics printed official report card for ${student.name} (${student.admNo}).`
    );
    setTimeout(() => {
      setShowPrintToast(false);
      window.print();
    }, 500);
  };

  const handleOpenBatch = () => {
    if (!isDirector) {
      setRestrictedActionName('Generate Batch Report Cards');
      setShowRestrictedModal(true);
      return;
    }
    setShowBatchModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none print:bg-white print:p-0 print:pb-0">
      {/* Toast Notification */}
      {showPrintToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Restricted Policy Access Modal */}
      {showRestrictedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                JJSAK Academic Policy • Section 9
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Director of Academics Authorization Required
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Under the JJSAK Academic Access Control &amp; Reporting Policy, only the <strong>Director of Academics</strong> (Sole Academic Administrator) is authorized to generate, print, export, publish, or distribute official student report cards.
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-700 text-left border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-800">Your Current Role Access: Read-Only View</p>
                <p className="text-slate-500">To obtain official printed report cards or broadsheets, please coordinate with the Director of Academics.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRestrictedModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Acknowledge &amp; Return to Read-Only View
            </button>
          </div>
        </div>
      )}

      {/* Policy Governance Status Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isDirector ? (
              <span className="text-emerald-300 font-bold">
                Logged in as Sole Academic Administrator (Director of Academics) • Full Generation &amp; Print Authority
              </span>
            ) : (
              <span className="text-slate-300 font-medium">
                Academic Policy Mode: <strong className="text-white">Read-Only View</strong> (Official Printing &amp; Publishing is exclusively reserved for the Director of Academics)
              </span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Policy Ref: SCMH-ACAD-2026</span>
      </div>

      {/* Top Header Bar (Themed) */}
      <div
        className="text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between print:hidden transition-all duration-300"
        style={currentTheme.headerInlineStyle}
      >
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition cursor-pointer text-white text-xs font-bold border border-white/20"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-white tracking-tight leading-tight">
            Student Assessment Report
          </h1>
          <span className="text-[10px] text-white/80 font-medium block">
            {currentTheme.schoolName} • {currentTheme.schoolCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenBatch}
            className={`px-2.5 py-1.5 rounded-xl active:scale-95 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              isDirector ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            title={isDirector ? "1-Click Batch Reports for All Learners" : "Restricted to Director of Academics"}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1-Click Batch (All)</span>
            <span className="sm:hidden">Batch</span>
            {!isDirector && <Lock className="w-3 h-3 text-amber-300 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition cursor-pointer ${
              isDirector ? 'hover:bg-white/10 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
            title={isDirector ? "Print Current Report Card" : "Print Restricted (Director Authorization Required)"}
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Report Card Main Container */}
      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4 print:max-w-2xl print:px-6 print:py-4">
        {/* Printable Header (Visible only when printing) */}
        <div
          className="hidden print:flex flex-col items-center justify-center text-center pb-4 border-b-2"
          style={{ borderColor: currentTheme.primaryColor }}
        >
          {currentTheme.logoUrl && (
            <img
              src={currentTheme.logoUrl}
              alt="School Logo"
              className="w-16 h-16 object-contain mb-1"
              referrerPolicy="no-referrer"
            />
          )}
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: currentTheme.primaryColor }}
          >
            {currentTheme.schoolName.toUpperCase()}
          </h1>
          <p className="text-xs font-bold text-slate-700 tracking-wider">
            OFFICIAL STUDENT ASSESSMENT REPORT CARD
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {currentTheme.address} • Email: {currentTheme.email} • Tel: {currentTheme.phone}
          </p>
          {currentTheme.motto && (
            <p className="text-[10px] text-slate-400 italic font-serif mt-0.5">
              "{currentTheme.motto}"
            </p>
          )}
        </div>

        {/* 1. Student Profile Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Circular Avatar with Initials */}
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#E11D48] to-[#C51E28] text-white flex items-center justify-center text-lg font-extrabold shadow-sm shrink-0">
                {student.avatarInitials}
              </div>

              <div>
                {/* Student Switcher dropdown button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                    className="flex items-center gap-1 text-left font-extrabold text-lg sm:text-xl text-slate-900 leading-snug hover:text-[#C51E28] transition cursor-pointer print:pointer-events-none"
                  >
                    <span>{student.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 print:hidden" />
                  </button>

                  {/* Student Switcher Dropdown */}
                  {showStudentDropdown && (
                    <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-semibold print:hidden max-h-60 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                        Switch Student
                      </div>
                      {allStudents.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            onSelectStudent(s);
                            setShowStudentDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-red-50 hover:text-[#C51E28] transition ${
                            s.id === student.id ? 'text-[#C51E28] bg-red-50/50 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <p>{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{s.classArm}</p>
                          </div>
                          <span className="font-mono text-[10px] opacity-75">{s.admNo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  {student.classArm.includes(student.grade) ? student.classArm : `${student.grade} • ${student.classArm}`}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-medium text-slate-500">
                    {student.term}
                  </span>
                  <button
                    type="button"
                    onClick={openTermEditor}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-[#C51E28] text-[10px] font-bold text-slate-600 transition print:hidden cursor-pointer flex items-center gap-1"
                    title="Edit Term & Academic Year"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Stream & Grade Ranking Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <div className="px-2 py-0.5 rounded-lg bg-red-50 border border-red-200/80 text-[10px] font-bold text-[#C51E28] flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#C51E28]" />
                    <span>Stream Rank: <b>{getRankSuffix(rankingInfo.streamRank)}</b> in {student.classArm} ({rankingInfo.streamPosition})</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <span>Grade Rank: <b>{getRankSuffix(rankingInfo.gradeRank)}</b> in {student.grade || student.classArm.split(' ')[0]} ({rankingInfo.gradePosition})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ADM Badge Pill */}
            <div className="px-2.5 py-1 rounded-full bg-[#C51E28] text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-2xs shrink-0">
              {student.admNo}
            </div>
          </div>
        </div>

        {/* 2. Summary Metric Bar (5 KPI Columns with Stream & Grade Ranks) */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* AVG SCORE */}
          <div className="flex flex-col items-center justify-center p-1">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AVG SCORE
            </span>
            <span className="text-lg sm:text-xl font-black text-[#C51E28] mt-0.5">
              {student.avgScore !== null && student.avgScore !== undefined ? `${student.avgScore}%` : '-'}
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-50 text-[#C51E28] border border-red-100 mt-0.5 inline-block">
              {student.overallGrade || '-'}
            </span>
          </div>

          {/* STREAM RANK */}
          <div className="flex flex-col items-center justify-center p-1 sm:pl-1">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#C51E28] uppercase flex items-center gap-1">
              <Award className="w-2.5 h-2.5 text-[#C51E28]" />
              STREAM RANK
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {rankingInfo.streamPosition || '-'}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
              {student.classArm} ({getRankSuffix(rankingInfo.streamRank)})
            </span>
          </div>

          {/* GRADE RANK */}
          <div className="flex flex-col items-center justify-center p-1 sm:pl-1">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-600 uppercase">
              GRADE RANK
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {rankingInfo.gradePosition || '-'}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
              Grade {student.grade || student.classArm.split(' ')[0]} ({getRankSuffix(rankingInfo.gradeRank)})
            </span>
          </div>

          {/* ATTENDANCE */}
          <div className="flex flex-col items-center justify-center p-1 sm:pl-1">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              ATTENDANCE
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
              {calculatedAttendance}%
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">
              {assessedSubjectsCount}/{totalSubjectsCount} Assessed
            </span>
          </div>
        </div>

        {/* 3. Subject Performance Section & Table */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Subject Performance
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowConverterModal(true)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition print:hidden flex items-center gap-1 cursor-pointer"
                title="Convert x/50, x/30, x/80 marks to 100%"
              >
                <Calculator className="w-2.5 h-2.5 text-[#C51E28]" />
                <span>Converter (x/50, x/30)</span>
              </button>
              <button
                type="button"
                onClick={openSubjectScoresEditor}
                className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#C51E28] text-[10px] font-bold border border-red-200/60 transition print:hidden flex items-center gap-1 cursor-pointer"
                title="Edit Subject Scores or Mark as (-) Not Assessed"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Edit Scores / (-)</span>
              </button>
              <span className="text-[10px] font-bold text-[#C51E28] bg-red-50 px-2 py-0.5 rounded-full">
                CBC Standard (9 Subjects)
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 text-left font-bold">SUBJECT</th>
                  <th className="pb-2 text-center font-bold">TR</th>
                  <th className="pb-2 text-center font-bold">SCORE</th>
                  <th className="pb-2 text-center font-bold">LEVEL</th>
                  <th className="pb-2 text-right font-bold">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.subjects.map((sub) => {
                  const teacherInfo = getTeacherForSubject(sub.subject, student.classArm, teachers);
                  const initials = sub.teacherInitials || teacherInfo.initials;
                  const teacherName = sub.teacherName || teacherInfo.teacherName;

                  return (
                    <tr key={sub.subject} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 font-medium text-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{sub.subject}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Tr: {teacherName}
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-xs">
                        <span
                          className="px-2 py-0.5 rounded-md bg-red-50 text-[#C51E28] border border-red-200/80 font-black text-[10px] tracking-wide inline-block shadow-2xs"
                          title={`Teacher: ${teacherName} (${sub.subject})`}
                        >
                          {initials}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-900 text-xs">
                        {sub.score !== null && sub.score !== undefined ? `${sub.score}%` : '-'}
                      </td>
                      <td className="py-2.5 text-center text-xs">
                        <span className={`font-extrabold px-2 py-0.5 rounded-md border ${
                          sub.score === null || sub.score === undefined || sub.grade === '-'
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : 'bg-red-50 text-[#C51E28] border-red-100'
                        }`}>
                          {sub.grade || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium text-slate-600 text-[11px]">
                        {sub.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Assessment Key / Grading Legend */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Performance Scale Key:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-[9px] font-medium text-slate-600">
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">EE1</b>: 90-100%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">EE2</b>: 75-89%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">ME1</b>: 58-74%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">ME2</b>: 41-57%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">AE1</b>: 31-40%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">AE2</b>: 21-30%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">BE1</b>: 11-20%</span>
              <span className="bg-slate-50 p-1 rounded border border-slate-100"><b className="text-[#C51E28]">BE2</b>: 0-10%</span>
              <span className="bg-amber-50/80 p-1 rounded border border-amber-200 text-amber-900 col-span-2 sm:col-span-2"><b className="text-amber-800">(-)</b>: Not Assessed / Absent (Remarks: -)</span>
            </div>
          </div>

          {/* Subject Teachers Initials & Allocations Key */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Subject Teachers Initials Key ({student.classArm}):
              </span>
              <span className="text-[9px] text-[#C51E28] font-bold">
                CBC Assigned Staff
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
              {(() => {
                const map = new Map<string, { initials: string; name: string; subjects: string[] }>();
                student.subjects.forEach((s) => {
                  const info = getTeacherForSubject(s.subject, student.classArm, teachers);
                  const inits = s.teacherInitials || info.initials;
                  const tName = s.teacherName || info.teacherName;
                  if (!map.has(inits)) {
                    map.set(inits, { initials: inits, name: tName, subjects: [s.subject] });
                  } else {
                    const existing = map.get(inits)!;
                    if (!existing.subjects.includes(s.subject)) {
                      existing.subjects.push(s.subject);
                    }
                  }
                });
                return Array.from(map.values()).map((t) => (
                  <div
                    key={t.initials}
                    className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-red-50 text-[#C51E28] font-black border border-red-200 text-[10px] shrink-0">
                        {t.initials}
                      </span>
                      <span className="font-bold text-slate-800 truncate text-[11px]">{t.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium truncate text-right shrink-0 max-w-[130px]" title={t.subjects.join(', ')}>
                      {t.subjects.join(', ')}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* 3.4 Student Performance Trends (Recharts) */}
        <StudentPerformanceTrendChart student={student} allStudents={allStudents} />

        {/* 3.5 CBE Senior School Pathway Profile & Career Guidance */}
        {(() => {
          const pathwayProfile = calculateStudentPathways(student);
          return (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Senior School Pathway Profile & Guidance</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded">
                        CBE KICD Framework
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Career Affinity & Senior School Academic Track Projection
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: pathwayProfile.topPathway.color }}
                  >
                    {pathwayProfile.topPathway.badge} ({pathwayProfile.topPathway.suitabilityScore}%)
                  </span>
                </div>
              </div>

              {/* 3 Pathway Comparison Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {pathwayProfile.allPathways.map((p, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border transition ${
                        isTop ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300' : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-slate-800 truncate">{p.badge}</span>
                        <span
                          className="font-black text-[11px]"
                          style={{ color: p.color }}
                        >
                          {p.suitabilityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.suitabilityScore}%`, backgroundColor: p.color }}
                        />
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium truncate">
                        {p.matchLevel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Tracks & Careers */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recommended Senior School Track:</span>
                  </span>
                  <span className="font-semibold text-blue-950 truncate">
                    {pathwayProfile.topPathway.seniorSchoolTracks[0]}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Career Prospects:</span>
                  </span>
                  <span className="font-medium text-slate-700 truncate">
                    {pathwayProfile.topPathway.careerProspects.slice(0, 3).join(', ')}
                  </span>
                </div>
              </div>

              {/* CBE Guidance Verdict Note */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2 font-medium leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pathway Advisor Guidance: </span>
                  {pathwayProfile.topPathway.guidanceNotes}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. Class Teacher's Comment Box */}
        <div className="bg-gradient-to-r from-red-50/90 to-rose-50/70 rounded-2xl p-4 border border-red-200/80 shadow-2xs flex items-start gap-3 relative">
          <div className="w-7 h-7 rounded-full bg-red-100 text-[#C51E28] flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#C51E28]">
                Class Teacher&apos;s Remarks ({student.classTeacherName})
              </h3>
              <button
                type="button"
                onClick={openTeacherCommentEditor}
                className="text-[10px] font-bold text-[#C51E28] hover:underline flex items-center gap-1 cursor-pointer print:hidden"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed italic">
              &ldquo;{student.classTeacherComment}&rdquo;
            </p>
          </div>

          <div className="absolute top-3 right-3 text-red-400 print:hidden pointer-events-none">
            <Award className="w-5 h-5 text-[#C51E28]/50" />
          </div>
        </div>

        {/* 5. Head of Institution's Comment Box (Principal / Head of School) */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md flex flex-col gap-2.5 relative border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C51E28] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Head of Institution&apos;s Comment</span>
                  <span className="text-[9px] bg-red-500/30 text-red-300 font-bold px-1.5 py-0.2 rounded">
                    Official
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">
                  {student.headOfSchoolName} • Head of Institution
                </p>
              </div>
            </div>

            {/* Comment / Endorse Button */}
            <button
              type="button"
              onClick={openHeadCommentEditor}
              className="px-2.5 py-1 bg-[#C51E28] hover:bg-[#B31821] active:scale-95 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 transition cursor-pointer print:hidden"
            >
              <Edit3 className="w-3 h-3" />
              <span>Comment</span>
            </button>
          </div>

          {/* Comment Text Body */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-100 font-medium leading-relaxed italic">
              &ldquo;{currentHeadComment}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verified & Endorsed for CBC Records</span>
            </div>
            <span className="print:hidden text-[9px] text-slate-400">
              Click &lsquo;Comment&rsquo; to revise
            </span>
          </div>
        </div>

        {/* 5B. Parent & Guardian Contact Information Card (Editable List Interface) */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>Parent &amp; Guardian Information</span>
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded">
                    {parentContacts.length} Registered
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Direct contacts for progress communication &amp; SMS/WhatsApp reports
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddParent}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1 transition cursor-pointer print:hidden"
            >
              <Plus className="w-3 h-3" />
              <span>Add Parent</span>
            </button>
          </div>

          {/* Parents List */}
          {parentContacts.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-500 font-medium">No parent contact recorded for this learner.</p>
              <button
                type="button"
                onClick={handleOpenAddParent}
                className="mt-1.5 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Parent / Guardian Contact</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {parentContacts.map((p, idx) => (
                <div
                  key={p.id || `${p.name}-${idx}`}
                  className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {p.name}
                      </span>
                      {p.relation && (
                        <span className="text-[9px] font-bold bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                          {p.relation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{p.phoneNumber || 'No phone number'}</span>
                    </div>
                  </div>

                  {/* Actions (Call, WhatsApp, Edit, Delete) */}
                  <div className="flex items-center gap-1 shrink-0 print:hidden">
                    {p.phoneNumber && (
                      <>
                        <a
                          href={`tel:${p.phoneNumber.replace(/\s+/g, '')}`}
                          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition cursor-pointer"
                          title={`Call ${p.name}`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${p.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${p.name}, this is regarding ${student.name} (ADM: ${student.admNo})'s Term 2 Academic & Competency Progress Report at JJSAK Junior School.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer"
                          title={`Send WhatsApp Message to ${p.name}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditParent(p)}
                      className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                      title="Edit Parent Details"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {deleteParentConfirmId === (p.id || p.name) ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteParent(p.id || p.name)}
                          className="px-1.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition"
                          title="Confirm Delete"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteParentConfirmId(null)}
                          className="px-1 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteParentConfirmId(p.id || p.name)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition cursor-pointer"
                        title="Delete Parent Record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Signatures & Official School Stamp Area */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 print:border-none print:pb-0">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C51E28]" />
              <span>Official Institutional Endorsement</span>
            </span>

            {/* Signature Format Toggle (Blank for Ink Pen vs Digital Script) */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold print:hidden">
              <button
                type="button"
                onClick={() => setIsSignatureBlank(true)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  isSignatureBlank
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Blank line for manual physical ink signing"
              >
                Blank (Pen Sign)
              </button>
              <button
                type="button"
                onClick={() => setIsSignatureBlank(false)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  !isSignatureBlank
                    ? 'bg-[#C51E28] text-white shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Digital stylized cursive script"
              >
                Digital Cursive
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center text-center">
            {/* Class Teacher Signature */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Class Teacher
              </span>

              {isSignatureBlank ? (
                /* Blank Line for physical ink pen signing */
                <div className="h-10 flex flex-col items-center justify-end pb-1 w-full max-w-[120px]">
                  <div className="w-full border-b-2 border-dashed border-slate-400 mb-1" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase">
                    Sign &amp; Date
                  </span>
                </div>
              ) : (
                /* Stylized Digital Signature */
                <div className="h-10 flex items-center justify-center">
                  <span className="font-serif italic text-lg sm:text-xl text-slate-800 tracking-wide rotate-[-3deg] select-none">
                    J. Kinyanjui
                  </span>
                </div>
              )}

              <div className="w-20 h-[1px] bg-slate-300 my-1" />
              <span className="text-[10px] font-bold text-slate-700">
                {student.classTeacherName}
              </span>
            </div>

            {/* Institution Official Stamp (Circular Red Stamp) */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-[#C51E28] p-1 flex items-center justify-center rotate-[-6deg] bg-red-50/20 shadow-2xs">
                <div className="w-full h-full rounded-full border-[1.5px] border-[#C51E28] flex flex-col items-center justify-center text-center p-1 relative">
                  <span className="text-[7px] font-black text-[#C51E28] uppercase tracking-wider leading-none truncate max-w-[70px]">
                    {(activeTenant?.schoolName || schoolProfile?.schoolName || 'OFFICIAL').split(' ')[0]}
                  </span>
                  <div className="my-0.5 px-1 py-0.5 bg-[#C51E28] text-white rounded text-[6px] font-black tracking-widest leading-none">
                    OFFICIAL STAMP
                  </div>
                  <span className="text-[6px] font-bold text-[#C51E28] uppercase leading-none">
                    ★ VERIFIED CBC ★
                  </span>
                </div>
              </div>
            </div>

            {/* Head of Institution Signature */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Head of Institution
              </span>

              {isSignatureBlank ? (
                /* Blank Line for physical ink pen signing */
                <div className="h-10 flex flex-col items-center justify-end pb-1 w-full max-w-[120px]">
                  <div className="w-full border-b-2 border-dashed border-slate-400 mb-1" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase">
                    Sign &amp; Date
                  </span>
                </div>
              ) : (
                /* Stylized Digital Signature */
                <div className="h-10 flex items-center justify-center">
                  <span className="font-serif italic text-lg sm:text-xl text-slate-800 tracking-wide rotate-[-2deg] select-none">
                    Barasa J.
                  </span>
                </div>
              )}

              <div className="w-20 h-[1px] bg-slate-300 my-1" />
              <span className="text-[10px] font-bold text-slate-700">
                {student.headOfSchoolName}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Red Bottom Banner: Next Term Opens (Interactive with Edit button) */}
        <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C51E28] to-[#B31821] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              Next Term Opens: {student.nextTermDate}
            </span>
          </div>
          <button
            type="button"
            onClick={openTermEditor}
            className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer print:hidden shrink-0"
            title="Edit Academic Year and Next Term Date"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Action Buttons for Mobile Screen */}
        <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${student.name} - School Report Card`,
                  text: `Assessment Report Card for ${student.name} (${student.grade}) - Term 2, 2024`,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                setToastMessage('Report link copied to clipboard!');
                setShowPrintToast(true);
                setTimeout(() => setShowPrintToast(false), 2000);
              }
            }}
            className="py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Modal: Head of Institution Comment & Endorsement Editor */}
      {showHeadCommentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C51E28] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Head of Institution Comment</h3>
                  <p className="text-[10px] text-slate-300">
                    Official Endorsement for {student.name} ({student.admNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHeadCommentModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-800">
              {/* Student KPI context mini banner */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
                <div>
                  <span className="text-slate-500">Average Score: </span>
                  <span className="font-extrabold text-[#C51E28]">
                    {student.avgScore !== null && student.avgScore !== undefined ? `${student.avgScore}%` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Overall Level: </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-[#C51E28] font-bold">
                    {student.overallGrade || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Class Arm: </span>
                  <span className="font-bold text-slate-700">{student.classArm}</span>
                </div>
              </div>

              {/* Preset Bank Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C51E28]" />
                    <span>Quick CBC Presets for Head of Institution:</span>
                  </label>
                </div>

                {/* Preset Level Tabs */}
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {HEAD_OF_INSTITUTION_COMMENT_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.level}
                      type="button"
                      onClick={() => setSelectedPresetTab(idx)}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition border ${
                        selectedPresetTab === idx
                          ? 'bg-[#C51E28] text-white border-[#C51E28]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset.level.includes('(-)') ? '(-) Absent' : preset.level.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Preset Comments List */}
                <div className="space-y-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Click a preset to apply:
                  </span>
                  {HEAD_OF_INSTITUTION_COMMENT_PRESETS[selectedPresetTab].comments.map((comment, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setHeadCommentDraft(comment)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-[#C51E28] hover:bg-red-50/50 transition text-[11px] text-slate-700 leading-snug flex items-start gap-1.5"
                    >
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${headCommentDraft === comment ? 'text-[#C51E28]' : 'text-slate-300'}`} />
                      <span>{comment}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Head of Institution Custom Remarks Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Institutional Remarks / Comment:
                </label>
                <textarea
                  rows={3}
                  value={headCommentDraft}
                  onChange={(e) => setHeadCommentDraft(e.target.value)}
                  placeholder="Enter official remarks on conduct, competency progress, co-curricular involvement, and encouragement..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28] leading-relaxed"
                />
              </div>

              {/* Head of Institution Name / Signatory */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Head of Institution Name / Title:
                </label>
                <input
                  type="text"
                  value={headNameDraft}
                  onChange={(e) => setHeadNameDraft(e.target.value)}
                  placeholder="e.g. Mrs. J. Barasa (Head of Institution)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              {/* Batch Apply Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToClass}
                  onChange={(e) => setApplyToClass(e.target.checked)}
                  className="rounded text-[#C51E28] focus:ring-[#C51E28] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 text-[11px]">
                    Apply this general comment to all {student.classArm} students
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Saves time by endorsing all {student.classArm} student report cards with this comment.
                  </p>
                </div>
              </label>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowHeadCommentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHeadComment}
                className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Endorse Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Academic Year & Term Dates Editor */}
      {showTermModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#C51E28] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <h3 className="text-sm font-bold">Edit Academic Year & Term Dates</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              {/* Academic Year Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Academic Year
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Select or enter year
                  </span>
                </div>

                {/* Year Stepper & Input */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleSelectYearInModal(Math.max(2020, draftYear - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="2020"
                      max="2040"
                      value={draftYear}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          handleSelectYearInModal(val);
                        }
                      }}
                      className="w-full text-center font-mono font-black text-sm py-1.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C51E28]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">
                      Year
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectYearInModal(Math.min(2040, draftYear + 1))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Year Pill Selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {AVAILABLE_YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYearInModal(y)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                        draftYear === y
                          ? 'bg-[#C51E28] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Academic Term
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(['Term 1', 'Term 2', 'Term 3'] as const).map((t) => {
                    const isSelected = draftTerm.startsWith(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelectTermInModal(t)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#C51E28] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{t}</span>
                        <span className={`text-[9px] font-medium ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                          {draftYear}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={draftTerm}
                  onChange={(e) => setDraftTerm(e.target.value)}
                  placeholder="e.g. Term 2, 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              {/* Next Term Opening Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Next Term Opening Date <span className="text-[#C51E28]">*Printed on bottom banner</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={draftNextTermDate}
                  onChange={(e) => setDraftNextTermDate(e.target.value)}
                  placeholder="e.g. 5th August 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              {/* Scope Selection */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Apply Changes To:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="termScope"
                      checked={termSyncScope === 'all'}
                      onChange={() => setTermSyncScope('all')}
                      className="text-[#C51E28] focus:ring-[#C51E28]"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      All Students in School (Default)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="termScope"
                      checked={termSyncScope === 'stream'}
                      onChange={() => setTermSyncScope('stream')}
                      className="text-[#C51E28] focus:ring-[#C51E28]"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Only students in {student.classArm}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="termScope"
                      checked={termSyncScope === 'student'}
                      onChange={() => setTermSyncScope('student')}
                      className="text-[#C51E28] focus:ring-[#C51E28]"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Only {student.name}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowTermModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTermAndYear}
                className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Class Teacher Comment Editor */}
      {showTeacherCommentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="bg-[#C51E28] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-bold">Edit Class Teacher Comment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTeacherCommentModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Class Teacher Remarks:
                </label>
                <textarea
                  rows={3}
                  value={teacherCommentDraft}
                  onChange={(e) => setTeacherCommentDraft(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Class Teacher Name:
                </label>
                <input
                  type="text"
                  value={teacherNameDraft}
                  onChange={(e) => setTeacherNameDraft(e.target.value)}
                  placeholder="e.g. Mr. O. Kinyanjui"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowTeacherCommentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherComment}
                className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Subject Scores & Competency Marks Editor */}
      {showSubjectScoresModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#C51E28] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <div>
                  <h3 className="text-sm font-bold leading-tight">Edit Assessment Scores</h3>
                  <p className="text-[10px] text-red-100">{student.name} • {student.classArm}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectScoresModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 text-xs overflow-y-auto">
              {/* Scale / Out Of (Denominator) Selector */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Calculator className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>Input Scale / Out Of Base:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConverterModal(true)}
                    className="text-[10px] font-bold text-[#C51E28] hover:underline flex items-center gap-0.5"
                  >
                    <span>Formula Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {POPULAR_SCORE_BASES.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => handleBaseModeChange(b.value)}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition border cursor-pointer ${
                        scoreBaseMode === b.value
                          ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b.shortLabel}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleBaseModeChange('custom')}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition border cursor-pointer ${
                      scoreBaseMode === 'custom'
                        ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {scoreBaseMode === 'custom' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-600">Custom Out Of: /</span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={customBaseVal}
                      onChange={(e) => handleCustomBaseValChange(e.target.value)}
                      placeholder="50"
                      className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center font-bold text-xs focus:outline-none focus:border-[#C51E28]"
                    />
                    <span className="text-[9px] text-slate-400">e.g. 40, 60, 70</span>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 font-medium">
                  {currentScoreBase === 100 ? (
                    <span>💡 Tip: Enter percentage marks directly (0-100), or type fractions like <b className="text-slate-700">33/50</b>, <b className="text-slate-700">25/30</b>.</span>
                  ) : (
                    <span>💡 Converting entered marks out of <b>/{currentScoreBase}</b> to <b>100%</b> automatically (e.g. 33/{currentScoreBase} ➔ {convertRawScoreToPercentage(33, currentScoreBase)}%).</span>
                  )}
                </div>
              </div>

              {/* Quick Fill Batch Options */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Quick Actions:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetAllDraftScores(null)}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold hover:bg-amber-100 flex items-center gap-1 transition cursor-pointer text-[10px]"
                  >
                    <MinusCircle className="w-3 h-3 text-amber-600" />
                    <span>Mark All (-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllDraftScores(75)}
                    className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer text-[10px]"
                  >
                    <span>Set All 75%</span>
                  </button>
                </div>
              </div>

              {/* Subjects List */}
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {AVAILABLE_SUBJECTS.map((subName) => {
                  const currentScore = draftSubjectScores[subName];
                  const rawInput = draftRawInputs[subName] ?? '';
                  const isUnassessed = currentScore === null || currentScore === undefined;
                  const g = calculateGrade(currentScore);
                  const teacherInfo = getTeacherForSubject(subName, student.classArm, teachers);

                  return (
                    <div
                      key={subName}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        isUnassessed
                          ? 'bg-amber-50/40 border-amber-200/80'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-xs truncate block">
                            {subName}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded bg-red-50 text-[#C51E28] font-black border border-red-100 text-[9px] shrink-0"
                            title={`Teacher: ${teacherInfo.teacherName}`}
                          >
                            {teacherInfo.initials}
                          </span>
                          {!isUnassessed && currentScoreBase !== 100 && rawInput && (
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              Raw: {rawInput}/{currentScoreBase}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 truncate">
                          <span>Tr: <b className="font-medium text-slate-700">{teacherInfo.teacherName}</b></span>
                          <span>•</span>
                          <span>Remarks: <b className="font-semibold text-slate-700">{g.remarks}</b></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Toggle button (-) */}
                        <button
                          type="button"
                          onClick={() => handleDraftScoreChange(subName, isUnassessed ? 75 : null)}
                          className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            isUnassessed
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                          }`}
                          title={isUnassessed ? 'Click to enter numeric score' : 'Mark as (-) Did Not Sit'}
                        >
                          {isUnassessed ? '(-) Absent' : 'Set (-)'}
                        </button>

                        {/* Raw / Fraction Input */}
                        <input
                          type="text"
                          placeholder={currentScoreBase === 100 ? '-' : `/${currentScoreBase}`}
                          disabled={isUnassessed}
                          value={isUnassessed ? '' : rawInput}
                          onChange={(e) => handleDraftInputChange(subName, e.target.value)}
                          className={`w-14 px-1.5 py-1 text-center font-bold rounded-lg border text-xs focus:border-[#C51E28] focus:outline-none ${
                            isUnassessed
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          title={currentScoreBase === 100 ? 'Enter % or fraction like 33/50' : `Enter marks out of ${currentScoreBase}`}
                        />

                        {/* Converted Grade Badge */}
                        <span
                          className={`w-11 text-center font-black text-[10px] px-1 py-1 rounded border flex flex-col items-center justify-center leading-none ${
                            isUnassessed
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : 'bg-red-50 text-[#C51E28] border-red-100'
                          }`}
                          title={currentScore !== null ? `${currentScore}%` : 'Not assessed'}
                        >
                          <span>{g.grade}</span>
                          {!isUnassessed && (
                            <span className="text-[8px] font-bold opacity-80 mt-0.5">{currentScore}%</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSubjectScoresModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubjectScores}
                className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Scores & Remarks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone / Contextual Score Converter Calculator Modal */}
      <ScoreConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        initialOutOf={currentScoreBase}
      />

      {/* Parent / Guardian Add & Edit Modal */}
      {showParentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold">
                  {editingParentId ? 'Edit Parent / Guardian Record' : 'Add Parent / Guardian Contact'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5">
              <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
                <span className="font-semibold text-blue-800">Learner:</span>
                <span className="font-bold text-slate-800">{student.name} ({student.admNo})</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Parent / Guardian Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. David Mwangi"
                  value={parentNameDraft}
                  onChange={(e) => setParentNameDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Phone Number (for SMS &amp; WhatsApp Reports)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +254 722 123 456"
                  value={parentPhoneDraft}
                  onChange={(e) => setParentPhoneDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Relationship to Learner
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Father', 'Mother', 'Guardian', 'Sponsor'].map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setParentRelationDraft(rel)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        parentRelationDraft === rel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveParent}
                disabled={!parentNameDraft.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Parent Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Batch Report Card Generator Modal */}
      <BatchReportGeneratorModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        students={allStudents}
        teachers={teachers}
      />

      {/* Policy Governance Restriction Modal */}
      {showRestrictedModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in select-none">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Academic Administrator Policy Restriction
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRestrictedModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex flex-col gap-1.5">
                <span className="font-bold">
                  Attempted Action: {restrictedActionName}
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Under the <b>JJSAK Academic Access Control &amp; Reporting Policy (Section 1 &amp; 8)</b>, the <b>Director of Academics</b> is the sole Academic Administrator with exclusive authority to generate, print, export, and publish official student report cards.
                </p>
              </div>

              <p className="text-xs text-slate-600">
                Current active role: <b className="text-slate-900">{currentUser?.role || 'TEACHER'}</b>. Your role is authorized to enter and submit marks, but official document generation and report printing are reserved for the Director of Academics.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestrictedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Understood (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

