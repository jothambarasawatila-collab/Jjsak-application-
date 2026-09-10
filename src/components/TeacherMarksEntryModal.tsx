import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Users,
  Award,
  Send,
  Laptop,
  Smartphone,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  Minus,
  Lock,
  Unlock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Student, Teacher, Assessment, User } from '../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
  AVAILABLE_TERMS,
  INITIAL_TEACHERS,
  calculateGrade,
  calculateStudentAverage,
  calculateStudentRankings,
  convertRawScoreToPercentage,
  getTeacherInitials,
} from '../data/mockData';
import { isDirectorOfAcademics } from '../utils/securityEngine';

interface TeacherMarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers: Teacher[];
  assessments: Assessment[];
  currentUser?: User;
  initialTeacherId?: string;
  initialClass?: string;
  initialSubject?: string;
  initialAssessmentId?: string;
  onSaveAssessmentMarks: (
    assessment: Assessment,
    updatedStudents: Student[]
  ) => void;
  onOpenShareModal?: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const TeacherMarksEntryModal: React.FC<TeacherMarksEntryModalProps> = ({
  isOpen,
  onClose,
  students,
  teachers,
  assessments,
  currentUser,
  initialTeacherId,
  initialClass,
  initialSubject,
  initialAssessmentId,
  onSaveAssessmentMarks,
  onOpenShareModal,
  onLogAudit,
}) => {
  const isDirector = isDirectorOfAcademics(currentUser);

  // Find existing assessment if provided
  const existingAss = assessments.find((a) => a.id === initialAssessmentId);
  const isAssessmentLocked = existingAss?.isLocked || existingAss?.approvalStatus === 'Approved';

  // 1. Teacher selection
  const allTeachers = teachers && teachers.length > 0 ? teachers : INITIAL_TEACHERS;
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    if (initialTeacherId) return initialTeacherId;
    return allTeachers[0]?.id || 'tch-01';
  });

  const currentTeacher =
    allTeachers.find((t) => t.id === selectedTeacherId) || allTeachers[0];

  // 2. Class, Subject, Assessment Info
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || 'G8 S');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || 'Social Studies'
  );
  const [assessmentName, setAssessmentName] = useState<string>('Term 2 Mid Term Exam');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 2, 2024');
  const [assessmentType, setAssessmentType] = useState<string>('Mid Term Exam');
  const [scoreBase, setScoreBase] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'grid' | 'mobile_cards'>('grid');

  // Paste raw scores modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Submission / Success State
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Score entries: map studentId -> raw string input
  const [scoresMap, setScoresMap] = useState<Record<string, string>>({});
  const [customRemarksMap, setCustomRemarksMap] = useState<Record<string, string>>({});

  // Input refs for keyboard navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync initial props
  useEffect(() => {
    if (initialTeacherId) setSelectedTeacherId(initialTeacherId);
    if (initialClass) setSelectedClass(initialClass);
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialAssessmentId) {
      const foundAss = assessments.find((a) => a.id === initialAssessmentId);
      if (foundAss) {
        setAssessmentName(foundAss.name);
        setSelectedClass(foundAss.className.includes('(') ? 'G8 S' : foundAss.className);
        setSelectedSubject(foundAss.subject);
        setSelectedTerm(foundAss.term);
        setAssessmentType(foundAss.assessmentType);
        setScoreBase(foundAss.totalMarks || 100);
      }
    }
  }, [initialTeacherId, initialClass, initialSubject, initialAssessmentId, assessments]);

  // Load existing student scores when class or subject changes
  useEffect(() => {
    const classStudents = students.filter(
      (s) => s.classArm === selectedClass || s.classArm.includes(selectedClass)
    );
    const newMap: Record<string, string> = {};
    const newRemarks: Record<string, string> = {};

    const targetSub = (selectedSubject || '').toLowerCase();
    classStudents.forEach((student) => {
      const existingSub = (student.subjects || []).find(
        (sub) => (sub?.subject || '').toLowerCase() === targetSub
      );
      if (existingSub && existingSub.score !== null && existingSub.score !== undefined) {
        // If scoreBase is 100, use score directly; otherwise if we have existing normalized score, we show percentage or raw
        if (scoreBase === 100) {
          newMap[student.id] = String(existingSub.score);
        } else {
          // Convert from % back to scoreBase approximately or use existing raw
          const raw = Math.round((existingSub.score * scoreBase) / 100);
          newMap[student.id] = String(raw);
        }
        if (existingSub.remarks) {
          newRemarks[student.id] = existingSub.remarks;
        }
      } else {
        newMap[student.id] = '';
      }
    });

    setScoresMap(newMap);
    setCustomRemarksMap(newRemarks);
    setSubmittedSuccess(false);
  }, [selectedClass, selectedSubject, scoreBase, students]);

  if (!isOpen) return null;

  // Filter students in selected class arm
  const classStudents = students.filter(
    (s) => s.classArm === selectedClass || s.classArm.includes(selectedClass)
  );

  // Derived stats
  const teacherInitials = getTeacherInitials(currentTeacher?.name);
  const teacherAllocations = currentTeacher?.allocations || [];

  // Parse scores for analytics
  const scoreEntries = classStudents.map((st) => {
    const rawStr = scoresMap[st.id]?.trim() ?? '';
    const isUnassessed = rawStr === '' || rawStr === '-';
    let rawNum = isUnassessed ? null : parseFloat(rawStr);
    if (rawNum !== null && (isNaN(rawNum) || rawNum < 0)) rawNum = null;

    const percentage =
      rawNum !== null ? convertRawScoreToPercentage(rawNum, scoreBase) : null;
    const gradeInfo = calculateGrade(percentage);
    const remarks = customRemarksMap[st.id]?.trim() || gradeInfo.remarks;

    return {
      student: st,
      rawStr,
      rawNum,
      percentage,
      grade: gradeInfo.grade,
      level: gradeInfo.level,
      remarks,
      isUnassessed,
    };
  });

  const gradedList = scoreEntries.filter((e) => e.percentage !== null);
  const gradedCount = gradedList.length;
  const totalCount = classStudents.length;
  const avgScore =
    gradedCount > 0
      ? Math.round(
          gradedList.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            gradedCount
        )
      : null;
  const highestScore =
    gradedCount > 0
      ? Math.max(...gradedList.map((g) => g.percentage || 0))
      : null;
  const lowestScore =
    gradedCount > 0
      ? Math.min(...gradedList.map((g) => g.percentage || 0))
      : null;

  // Grade distributions
  const eeCount = gradedList.filter((g) => g.grade.startsWith('EE')).length;
  const meCount = gradedList.filter((g) => g.grade.startsWith('ME')).length;
  const aeCount = gradedList.filter((g) => g.grade.startsWith('AE')).length;
  const beCount = gradedList.filter((g) => g.grade.startsWith('BE')).length;

  const handleScoreChange = (studentId: string, val: string) => {
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStudent = classStudents[index + 1];
      if (nextStudent && inputRefs.current[nextStudent.id]) {
        inputRefs.current[nextStudent.id]?.focus();
        inputRefs.current[nextStudent.id]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStudent = classStudents[index - 1];
      if (prevStudent && inputRefs.current[prevStudent.id]) {
        inputRefs.current[prevStudent.id]?.focus();
        inputRefs.current[prevStudent.id]?.select();
      }
    }
  };

  const handleQuickPreset = (studentId: string, delta: number) => {
    const current = parseFloat(scoresMap[studentId] || '0') || 0;
    const nextVal = Math.min(scoreBase, Math.max(0, current + delta));
    handleScoreChange(studentId, String(nextVal));
  };

  const handleMarkAbsent = (studentId: string) => {
    handleScoreChange(studentId, '-');
  };

  const handlePrefillSample = () => {
    const sampleVals = [
      Math.round(scoreBase * 0.85),
      Math.round(scoreBase * 0.78),
      Math.round(scoreBase * 0.92),
      Math.round(scoreBase * 0.64),
      Math.round(scoreBase * 0.72),
      Math.round(scoreBase * 0.88),
      Math.round(scoreBase * 0.58),
    ];
    const newMap: Record<string, string> = { ...scoresMap };
    classStudents.forEach((st, idx) => {
      newMap[st.id] = String(sampleVals[idx % sampleVals.length]);
    });
    setScoresMap(newMap);
    showToast('Sample scores pre-filled');
  };

  const handleApplyPaste = () => {
    if (!pastedText.trim()) {
      setShowPasteModal(false);
      return;
    }
    // Split by newlines or tabs or commas
    const tokens = pastedText
      .split(/[\r\n,\t]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newMap: Record<string, string> = { ...scoresMap };
    classStudents.forEach((st, idx) => {
      if (idx < tokens.length) {
        newMap[st.id] = tokens[idx];
      }
    });

    setScoresMap(newMap);
    setPastedText('');
    setShowPasteModal(false);
    showToast(`Pasted ${Math.min(tokens.length, classStudents.length)} scores successfully!`);
  };

  // Process and compute student updates
  const computeStudentUpdates = () => {
    return students.map((student) => {
      // Check if student belongs to this class
      if (
        student.classArm !== selectedClass &&
        !student.classArm.includes(selectedClass)
      ) {
        return student;
      }

      const rawVal = scoresMap[student.id]?.trim() ?? '';
      const isUnassessed = rawVal === '' || rawVal === '-';
      const rawNum = isUnassessed ? null : parseFloat(rawVal);
      const percentage =
        rawNum !== null ? convertRawScoreToPercentage(rawNum, scoreBase) : null;
      const gradeInfo = calculateGrade(percentage);
      const customRem = customRemarksMap[student.id]?.trim();
      const remarks = customRem || gradeInfo.remarks;

      // Update student's subjects array
      const targetSub = (selectedSubject || '').toLowerCase();
      const existingSubIndex = (student.subjects || []).findIndex(
        (sub) => (sub?.subject || '').toLowerCase() === targetSub
      );

      const newSubjectEntry = {
        subject: selectedSubject,
        score: percentage,
        grade: gradeInfo.grade,
        remarks: remarks,
        teacherInitials: teacherInitials,
        teacherName: currentTeacher?.name || 'Assigned Teacher',
      };

      let newSubjectsList = [...student.subjects];
      if (existingSubIndex >= 0) {
        newSubjectsList[existingSubIndex] = newSubjectEntry;
      } else {
        newSubjectsList.push(newSubjectEntry);
      }

      // Recalculate average score and overall grade
      const avgInfo = calculateStudentAverage(newSubjectsList);

      return {
        ...student,
        subjects: newSubjectsList,
        avgScore: avgInfo.avgScore,
        overallGrade: avgInfo.overallGrade,
      };
    });
  };

  // 1. Teacher Draft Save
  const handleSaveDraft = () => {
    const targetAssId = initialAssessmentId || 'ass-' + Math.random().toString(36).substring(2, 9);
    const updatedAss: Assessment = {
      id: targetAssId,
      name: assessmentName.trim() || `${selectedSubject} Assessment`,
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: assessmentType,
      totalMarks: scoreBase,
      date: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      approvalStatus: 'Draft',
      isLocked: false,
      recordedScoresCount: gradedCount,
      totalStudentsCount: totalCount,
      submittedByTeacherName: currentTeacher?.name,
    };

    const updatedStudentsList = computeStudentUpdates();
    const fullyRankedStudents = calculateStudentRankings(updatedStudentsList);
    onSaveAssessmentMarks(updatedAss, fullyRankedStudents);
    onLogAudit?.(
      'ASSESSMENT_MARKS_ENTERED',
      `Saved draft assessment marks for ${selectedSubject} (${selectedClass})`
    );
    showToast('Draft assessment saved successfully!');
  };

  // 2. Teacher Submit to Director of Academics
  const handleSubmitForApproval = () => {
    const targetAssId = initialAssessmentId || 'ass-' + Math.random().toString(36).substring(2, 9);
    const updatedAss: Assessment = {
      id: targetAssId,
      name: assessmentName.trim() || `${selectedSubject} Assessment`,
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: assessmentType,
      totalMarks: scoreBase,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      approvalStatus: 'Submitted',
      isLocked: false,
      recordedScoresCount: gradedCount,
      totalStudentsCount: totalCount,
      submittedByTeacherName: currentTeacher?.name,
      submittedAt: new Date().toISOString(),
    };

    const updatedStudentsList = computeStudentUpdates();
    const fullyRankedStudents = calculateStudentRankings(updatedStudentsList);
    onSaveAssessmentMarks(updatedAss, fullyRankedStudents);
    onLogAudit?.(
      'ASSESSMENT_SUBMITTED',
      `Submitted ${selectedSubject} assessment for ${selectedClass} to Director of Academics for formal approval.`
    );
    setSubmittedSuccess(true);
    showToast('Assessment submitted to Director of Academics for approval!');
  };

  // 3. Director of Academics Approve & Lock
  const handleApproveAndLock = () => {
    const targetAssId = initialAssessmentId || 'ass-' + Math.random().toString(36).substring(2, 9);
    const updatedAss: Assessment = {
      id: targetAssId,
      name: assessmentName.trim() || `${selectedSubject} Assessment`,
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: assessmentType,
      totalMarks: scoreBase,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      approvalStatus: 'Approved',
      isLocked: true,
      recordedScoresCount: gradedCount,
      totalStudentsCount: totalCount,
      approvedByDirectorName: currentUser?.fullName || 'Director of Academics',
      approvedAt: new Date().toISOString(),
    };

    const updatedStudentsList = computeStudentUpdates();
    const fullyRankedStudents = calculateStudentRankings(updatedStudentsList);
    onSaveAssessmentMarks(updatedAss, fullyRankedStudents);
    onLogAudit?.(
      'ASSESSMENT_APPROVED',
      `Director of Academics approved and locked ${selectedSubject} (${selectedClass}) assessment.`
    );
    showToast('✓ Assessment approved & locked by Director of Academics!');
    setSubmittedSuccess(true);
  };

  // 4. Director Return for Correction
  const handleReturnForCorrection = () => {
    const targetAssId = initialAssessmentId || 'ass-' + Math.random().toString(36).substring(2, 9);
    const updatedAss: Assessment = {
      id: targetAssId,
      name: assessmentName.trim() || `${selectedSubject} Assessment`,
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: assessmentType,
      totalMarks: scoreBase,
      date: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      approvalStatus: 'Returned for Correction',
      isLocked: false,
      recordedScoresCount: gradedCount,
      totalStudentsCount: totalCount,
    };

    const updatedStudentsList = computeStudentUpdates();
    const fullyRankedStudents = calculateStudentRankings(updatedStudentsList);
    onSaveAssessmentMarks(updatedAss, fullyRankedStudents);
    onLogAudit?.(
      'ASSESSMENT_RETURNED_FOR_CORRECTION',
      `Director of Academics returned ${selectedSubject} (${selectedClass}) assessment to teacher for corrections.`
    );
    showToast('Assessment returned to teacher for correction.');
  };

  // 5. Director Reopen / Unlock
  const handleToggleLock = () => {
    const nextLocked = !isAssessmentLocked;
    const targetAssId = initialAssessmentId || 'ass-' + Math.random().toString(36).substring(2, 9);
    const updatedAss: Assessment = {
      id: targetAssId,
      name: assessmentName.trim() || `${selectedSubject} Assessment`,
      className: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      assessmentType: assessmentType,
      totalMarks: scoreBase,
      date: new Date().toISOString().split('T')[0],
      status: nextLocked ? 'Completed' : 'In Progress',
      approvalStatus: nextLocked ? 'Approved' : 'Draft',
      isLocked: nextLocked,
      recordedScoresCount: gradedCount,
      totalStudentsCount: totalCount,
    };

    const updatedStudentsList = computeStudentUpdates();
    const fullyRankedStudents = calculateStudentRankings(updatedStudentsList);
    onSaveAssessmentMarks(updatedAss, fullyRankedStudents);
    onLogAudit?.(
      nextLocked ? 'ASSESSMENT_LOCKED' : 'ASSESSMENT_REOPENED',
      `Director of Academics ${nextLocked ? 'locked' : 'reopened'} ${selectedSubject} (${selectedClass}) assessment.`
    );
    showToast(nextLocked ? 'Assessment locked' : 'Assessment reopened for editing');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border border-slate-200">
        
        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-[#C51E28] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-sm">
              {teacherInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                  Teacher Assessment Mark Sheet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Mobile & PC Portal
                </span>
              </div>
              <p className="text-[11px] text-red-100 font-medium">
                {currentTeacher?.name} ({teacherInitials}) • Enter and submit CBC subject results
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
                title="Share portal to Mobile or PC"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Share App</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assessment Status & Policy Banner */}
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Status:{' '}
              <strong
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                  existingAss?.approvalStatus === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : existingAss?.approvalStatus === 'Submitted'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : existingAss?.approvalStatus === 'Returned for Correction'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {existingAss?.approvalStatus || 'Draft / In Progress'}
              </strong>
              {existingAss?.isLocked && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <Lock className="w-3 h-3" /> Locked &amp; Sealed
                </span>
              )}
            </span>
          </div>

          <div className="text-[11px] text-slate-300">
            {isDirector ? (
              <span className="text-emerald-300 font-bold">
                Director of Academics • Sole Approval &amp; Lock Authority
              </span>
            ) : (
              <span>
                Class/Subject Teacher Marks Entry Mode
              </span>
            )}
          </div>
        </div>

        {/* Lock Warning for Teacher */}
        {isAssessmentLocked && !isDirector && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Assessment Locked:</strong> This assessment has been approved and locked by the Director of Academics. Mark entries are read-only. Contact the Director of Academics to reopen for amendments.
              </span>
            </div>
          </div>
        )}

        {/* Success Banner if submitted */}
        {submittedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-900">
                Assessment workflow updated successfully! Changes reflected in learner records.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Teacher & Subject Control Panel */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-col gap-3 shrink-0 overflow-y-auto max-h-[30vh] sm:max-h-none">
          
          {/* Row 1: Teacher Selector & Fast Allocations */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 shrink-0">
                Staff Profile:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => {
                  const newTid = e.target.value;
                  setSelectedTeacherId(newTid);
                  const t = allTeachers.find((tch) => tch.id === newTid);
                  if (t && t.allocations && t.allocations.length > 0) {
                    setSelectedClass(t.allocations[0].className);
                    setSelectedSubject(t.allocations[0].subjects[0] || 'Social Studies');
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#C51E28]"
              >
                {allTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({getTeacherInitials(t.name)}) - {t.role.split('/')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Load Fast Allocation Shortcuts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                Assigned:
              </span>
              {teacherAllocations.length > 0 ? (
                teacherAllocations.flatMap((alloc) =>
                  alloc.subjects.map((sub) => {
                    const isCurrent =
                      selectedClass === alloc.className && selectedSubject === sub;
                    return (
                      <button
                        key={`${alloc.className}-${sub}`}
                        type="button"
                        onClick={() => {
                          setSelectedClass(alloc.className);
                          setSelectedSubject(sub);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-[#C51E28] text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Award className="w-2.5 h-2.5" />
                        <span>
                          {sub} ({alloc.className})
                        </span>
                      </button>
                    );
                  })
                )
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">
                  General Staff Access
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Parameters Grid (Class, Subject, Assessment Title, Term, Max Marks Base) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-200/80">
            {/* Class */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Class Stream
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Learning Area
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Assessment Title
              </label>
              <input
                type="text"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                placeholder="e.g. Mid Term Exam"
              />
            </div>

            {/* Term */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Term & Year
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {AVAILABLE_TERMS.slice(0, 6).map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Base */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] font-bold text-slate-600">
                  Total Marks Out Of
                </label>
              </div>
              <div className="flex items-center gap-1">
                {[100, 50, 80, 30].map((base) => (
                  <button
                    key={base}
                    type="button"
                    onClick={() => setScoreBase(base)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                      scoreBase === base
                        ? 'bg-[#C51E28] text-white border-[#C51E28]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    /{base}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Analytics / KPI Bar */}
        <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">Graded:</span>
              <span className="font-extrabold text-slate-900">
                {gradedCount} / {totalCount}
              </span>
              <span className="text-[10px] text-slate-400">
                ({totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0}%)
              </span>
            </div>

            {avgScore !== null && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#C51E28]" />
                <span className="text-slate-600 font-medium">Class Avg:</span>
                <span className="font-extrabold text-[#C51E28]">{avgScore}%</span>
                <span className="px-1.5 py-0.2 rounded bg-red-50 text-[#C51E28] font-bold text-[10px]">
                  {calculateGrade(avgScore).grade}
                </span>
              </div>
            )}

            {highestScore !== null && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                <span>High: <b className="text-emerald-700">{highestScore}%</b></span>
                <span>•</span>
                <span>Low: <b className="text-rose-700">{lowestScore}%</b></span>
              </div>
            )}
          </div>

          {/* Grade Distribution Badges & Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                EE: {eeCount}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                ME: {meCount}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                AE: {aeCount}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                BE: {beCount}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPasteModal(true)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Paste column from Excel or Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#C51E28]" />
                <span className="hidden sm:inline">Paste Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrefillSample}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer"
                title="Prefill realistic sample marks"
              >
                Sample
              </button>

              {/* View Toggle (Grid / Mobile Cards) */}
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#C51E28] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="PC/Laptop Spreadsheet Table"
                >
                  <Laptop className="w-3 h-3" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mobile_cards')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                    viewMode === 'mobile_cards'
                      ? 'bg-white text-[#C51E28] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Mobile Touch Card Mode"
                >
                  <Smartphone className="w-3 h-3" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Students Scores Entry Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-100/70">
          {classStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
              <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No students registered in {selectedClass}</h4>
              <p className="text-xs text-slate-500 mt-1">Please select another class arm from the controls above.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* PC & Laptop Spreadsheet Table View */
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Adm No</th>
                      <th className="py-2.5 px-3">Learner Name</th>
                      <th className="py-2.5 px-3 w-36 text-center">
                        Raw Score (/{scoreBase})
                      </th>
                      {scoreBase !== 100 && (
                        <th className="py-2.5 px-3 w-20 text-center">
                          Conv %
                        </th>
                      )}
                      <th className="py-2.5 px-3 w-24 text-center">CBC Level</th>
                      <th className="py-2.5 px-3">Subject Remarks</th>
                      <th className="py-2.5 px-3 w-16 text-center">Tr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {scoreEntries.map((entry, index) => {
                      const st = entry.student;
                      const hasScore = entry.percentage !== null;

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Index */}
                          <td className="py-2.5 px-3 text-center text-slate-400 font-semibold text-[11px]">
                            {index + 1}
                          </td>

                          {/* Adm No */}
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 text-[11px] whitespace-nowrap">
                            {st.admNo}
                          </td>

                          {/* Name */}
                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {st.name}
                          </td>

                          {/* Raw Score Input with Fast Stepper & Keyboard Navigation */}
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                ref={(el) => {
                                  inputRefs.current[st.id] = el;
                                }}
                                type="text"
                                inputMode="decimal"
                                value={scoresMap[st.id] ?? ''}
                                onChange={(e) => handleScoreChange(st.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                placeholder="--"
                                className={`w-16 sm:w-20 px-2 py-1.5 text-center font-extrabold text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                                  hasScore
                                    ? 'bg-red-50/60 border-red-200 text-[#C51E28] focus:ring-[#C51E28]'
                                    : 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleMarkAbsent(st.id)}
                                className="px-1.5 py-1 text-[10px] font-bold rounded bg-slate-100 text-slate-500 hover:bg-slate-200"
                                title="Mark Absent (-)"
                              >
                                -
                              </button>
                            </div>
                          </td>

                          {/* Converted % Column */}
                          {scoreBase !== 100 && (
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                              {hasScore ? `${entry.percentage}%` : '-'}
                            </td>
                          )}

                          {/* CBC Competency Grade */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] border ${
                                hasScore
                                  ? 'bg-red-50 text-[#C51E28] border-red-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              {entry.grade}
                            </span>
                          </td>

                          {/* Remarks */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={customRemarksMap[st.id] ?? entry.remarks}
                              onChange={(e) =>
                                setCustomRemarksMap((prev) => ({
                                  ...prev,
                                  [st.id]: e.target.value,
                                }))
                              }
                              placeholder="Auto remarks..."
                              className="w-full px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700 bg-white/90 focus:outline-none focus:border-[#C51E28]"
                            />
                          </td>

                          {/* Teacher Initials */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className="px-1.5 py-0.5 rounded bg-red-50 text-[#C51E28] font-black border border-red-100 text-[10px]"
                              title={`Teacher: ${currentTeacher?.name}`}
                            >
                              {teacherInitials}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Mobile-First Touch Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scoreEntries.map((entry, index) => {
                const st = entry.student;
                const hasScore = entry.percentage !== null;

                return (
                  <div
                    key={st.id}
                    className={`bg-white rounded-2xl p-3.5 border transition shadow-xs flex flex-col gap-2 ${
                      hasScore ? 'border-red-200/90' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {st.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 ml-6 block">
                          {st.admNo} • {st.classArm}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] border ${
                            hasScore
                              ? 'bg-red-50 text-[#C51E28] border-red-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {entry.grade}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-[#C51E28] font-bold text-[10px]">
                          {teacherInitials}
                        </span>
                      </div>
                    </div>

                    {/* Numeric Input with Stepper */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(st.id, -5)}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-95"
                          title="-5 marks"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(st.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-95"
                          title="-1 mark"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          ref={(el) => {
                            inputRefs.current[st.id] = el;
                          }}
                          type="text"
                          inputMode="decimal"
                          value={scoresMap[st.id] ?? ''}
                          onChange={(e) => handleScoreChange(st.id, e.target.value)}
                          placeholder="Raw"
                          className="w-16 text-center font-black text-sm py-1 rounded-lg border border-slate-300 focus:outline-none focus:border-[#C51E28]"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(st.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-95"
                          title="+1 mark"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset(st.id, 5)}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-95"
                          title="+5 marks"
                        >
                          +5
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          Converted:
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {hasScore ? `${entry.percentage}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#C51E28]" />
            <span>
              Teacher: <b className="text-slate-800">{currentTeacher?.name}</b> • Initial: <b className="text-[#C51E28]">{teacherInitials}</b>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition cursor-pointer"
            >
              Close
            </button>

            {isDirector ? (
              // Director of Academics Controls
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Save Edits
                </button>

                <button
                  type="button"
                  onClick={handleReturnForCorrection}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Return to Teacher for corrections"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Teacher</span>
                </button>

                {isAssessmentLocked ? (
                  <button
                    type="button"
                    onClick={handleToggleLock}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Reopen / Unlock</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApproveAndLock}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve &amp; Lock Assessment</span>
                  </button>
                )}
              </>
            ) : (
              // Teacher Controls
              <>
                {!isAssessmentLocked ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitForApproval}
                      className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit for Director Approval ({gradedCount}/{totalCount})</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assessment Locked (Read-Only)</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Paste Scores Column Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-4 sm:p-5 border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#C51E28]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Paste Scores from Excel / Google Sheets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Copy a single column of marks from your spreadsheet (Excel, Google Sheets, Word) and paste here. They will automatically fill the learners in order.
            </p>

            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="78&#10;85&#10;92&#10;64&#10;70..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#C51E28]"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                className="px-4 py-1.5 rounded-lg bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-xs active:scale-95"
              >
                Apply Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
