import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  FileCheck,
  Trash2,
  Edit3,
  BookOpen,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { SchoolInfo, Assessment } from '../types';
import {
  GeneratedAssessmentPaper,
  GeneratedQuestion,
} from '../types/assessmentGenerator';
import {
  JUNIOR_SCHOOL_SYLLABUS_STRANDS,
  generateCustomAssessmentPaper,
} from '../data/assessmentGeneratorData';
import { AVAILABLE_SUBJECTS, AVAILABLE_GRADES, AVAILABLE_ASSESSMENT_TYPES } from '../data/mockData';

interface AssessmentGeneratorScreenProps {
  schoolInfo: SchoolInfo;
  onBack: () => void;
  onAddAssessmentToSystem?: (assessment: Assessment) => void;
}

export const AssessmentGeneratorScreen: React.FC<AssessmentGeneratorScreenProps> = ({
  schoolInfo,
  onBack,
  onAddAssessmentToSystem,
}) => {
  // Config Form State
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState<string>('G8');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('Mid Term Exam');
  const [selectedTerm, setSelectedTerm] = useState<string>(schoolInfo.term || 'Term 2, 2026');
  const [targetMarks, setTargetMarks] = useState<number>(50);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [selectedStrands, setSelectedStrands] = useState<string[]>([]);

  // Generated Paper State
  const [paper, setPaper] = useState<GeneratedAssessmentPaper>(() => {
    return generateCustomAssessmentPaper({
      schoolName: schoolInfo.name,
      subject: 'Mathematics',
      grade: 'G8',
      term: schoolInfo.term || 'Term 2, 2026',
      year: schoolInfo.year || 2026,
      assessmentType: 'Mid Term Exam',
      durationMinutes: 90,
      targetMarks: 50,
      selectedStrands: ['Numbers & Operations', 'Algebra'],
    });
  });

  // Active View Tab: 'paper' (Student Question Paper) or 'marking_scheme' (Teacher Rubric) or 'config' (Generator Form)
  const [activeTab, setActiveTab] = useState<'paper' | 'marking_scheme' | 'config'>('paper');

  // Question editing modal
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestion | null>(null);
  const [editQText, setEditQText] = useState<string>('');
  const [editQMarks, setEditQMarks] = useState<number>(4);
  const [editQAnswer, setEditQAnswer] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Get available strands for the selected subject
  const currentSubjectStrands = React.useMemo(() => {
    const info = JUNIOR_SCHOOL_SYLLABUS_STRANDS.find((s) => s.subject === selectedSubject);
    return info ? info.strands : [];
  }, [selectedSubject]);

  // Toggle strand selection
  const handleToggleStrand = (strandName: string) => {
    if (selectedStrands.includes(strandName)) {
      setSelectedStrands(selectedStrands.filter((s) => s !== strandName));
    } else {
      setSelectedStrands([...selectedStrands, strandName]);
    }
  };

  // Generate Paper Trigger
  const handleGeneratePaper = () => {
    const generated = generateCustomAssessmentPaper({
      schoolName: schoolInfo.name,
      subject: selectedSubject,
      grade: selectedGrade,
      term: selectedTerm,
      year: schoolInfo.year || 2026,
      assessmentType: selectedAssessmentType,
      durationMinutes,
      targetMarks,
      selectedStrands:
        selectedStrands.length > 0
          ? selectedStrands
          : currentSubjectStrands.map((s) => s.name),
    });

    setPaper(generated);
    setActiveTab('paper');
    showToast(`Generated official ${generated.subject} assessment paper (${generated.totalMarks} Marks)!`);
  };

  // Add this generated exam to JJSAK's assessment database
  const handleSyncToSystem = () => {
    if (!onAddAssessmentToSystem) return;

    const newAssessment: Assessment = {
      id: `ass-${Date.now()}`,
      name: `${paper.grade} ${paper.subject} ${paper.assessmentType}`,
      className: `${paper.grade} S`,
      term: paper.term,
      subject: paper.subject,
      assessmentType: paper.assessmentType,
      totalMarks: paper.totalMarks,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Scheduled',
      recordedScoresCount: 0,
      totalStudentsCount: schoolInfo.totalStudents || 256,
    };

    onAddAssessmentToSystem(newAssessment);
    showToast(`Added "${newAssessment.name}" to Active Assessments database!`);
  };

  // Handle Edit Question Save
  const handleSaveQuestionEdit = () => {
    if (!editingQuestion) return;

    const updatedSections = paper.sections.map((sec) => {
      const updatedQuestions = sec.questions.map((q) => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            questionText: editQText,
            marks: editQMarks,
            modelAnswer: editQAnswer,
          };
        }
        return q;
      });

      return {
        ...sec,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0),
        questions: updatedQuestions,
      };
    });

    const newTotal = updatedSections.reduce((sum, s) => sum + s.totalMarks, 0);

    setPaper({
      ...paper,
      totalMarks: newTotal,
      sections: updatedSections,
    });

    setEditingQuestion(null);
    showToast('Question updated successfully!');
  };

  // Handle Delete Question
  const handleDeleteQuestion = (qId: string) => {
    const updatedSections = paper.sections.map((sec) => {
      const filtered = sec.questions.filter((q) => q.id !== qId);
      return {
        ...sec,
        totalMarks: filtered.reduce((sum, q) => sum + q.marks, 0),
        questions: filtered,
      };
    });

    const newTotal = updatedSections.reduce((sum, s) => sum + s.totalMarks, 0);

    setPaper({
      ...paper,
      totalMarks: newTotal,
      sections: updatedSections,
    });
    showToast('Question removed from paper.');
  };

  // Open Edit Modal
  const handleOpenEdit = (q: GeneratedQuestion) => {
    setEditingQuestion(q);
    setEditQText(q.questionText);
    setEditQMarks(q.marks);
    setEditQAnswer(q.modelAnswer);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-white/20 active:scale-95 transition cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight leading-tight">Assessment Generator</h1>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-xs">
                Free CBC Test Maker
              </span>
            </div>
            <p className="text-[11px] text-red-100 font-medium">
              Questions, Marking Schemes & KICD Rubrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Paper</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-white text-[#C51E28] hover:bg-red-50 text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-3.5 space-y-3.5">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 print:hidden">
          <div className="flex items-center gap-2">
            {[
              { id: 'paper', label: 'Student Question Paper', icon: BookOpen },
              { id: 'marking_scheme', label: 'Teacher Marking Scheme & Rubrics', icon: FileCheck },
              { id: 'config', label: 'Generator Settings', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#C51E28] text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSyncToSystem}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
            title="Save to Recorded Assessments"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Add to Marks Entry</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: STUDENT QUESTION PAPER (PRINT READY) */}
        {/* ======================================================== */}
        {activeTab === 'paper' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-slate-900">
            {/* Official Exam Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-[#C51E28] text-[10px] font-black tracking-wider uppercase mb-1">
                MINISTRY OF EDUCATION • JUNIOR SCHOOL ASSESSMENT
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                {paper.schoolName}
              </h2>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                {paper.grade} {paper.subject.toUpperCase()} • {paper.assessmentType.toUpperCase()}
              </h3>
              <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-4 pt-1">
                <span>{paper.term}</span>
                <span>•</span>
                <span>Time Allowed: {Math.floor(paper.durationMinutes / 60)}h {paper.durationMinutes % 60}m</span>
                <span>•</span>
                <span>Maximum Marks: {paper.totalMarks} Marks</span>
              </div>
            </div>

            {/* Candidate Biodata Information Box */}
            <div className="border-2 border-slate-800 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase text-[10px]">Learner's Name:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-400 pb-0.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase text-[10px]">Admission No:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-400 pb-0.5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase text-[10px]">Grade & Stream:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-400 pb-0.5">
                    {paper.grade} S / N
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase text-[10px]">Date:</span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-400 pb-0.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase text-[10px]">Score / {paper.totalMarks}:</span>
                  <div className="w-16 h-7 border border-slate-700 bg-white rounded flex items-center justify-center font-black text-sm" />
                </div>
              </div>
            </div>

            {/* Instructions to Candidates */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 space-y-1">
              <h4 className="font-black text-[11px] uppercase tracking-wider text-amber-900">
                Instructions to Candidates:
              </h4>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] font-medium text-amber-900">
                {paper.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Sections & Questions */}
            <div className="space-y-6">
              {paper.sections.map((section) => (
                <div key={section.sectionLetter} className="space-y-4">
                  {/* Section Title */}
                  <div className="bg-slate-100 border-l-4 border-[#C51E28] px-3 py-2 rounded-r-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                        {section.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">{section.description}</p>
                    </div>
                    <span className="text-xs font-black bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-800 shadow-2xs">
                      [{section.totalMarks} Marks]
                    </span>
                  </div>

                  {/* Question Items */}
                  <div className="space-y-5">
                    {section.questions.map((q) => (
                      <div key={q.id} className="space-y-2 group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-sm text-slate-900 shrink-0">{q.number}.</span>
                            <div className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                              {q.questionText}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(q)}
                              className="p-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition print:hidden"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-red-400 hover:text-red-700 opacity-0 group-hover:opacity-100 transition print:hidden"
                              title="Remove Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Multiple Choice Options if applicable */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1 text-xs">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2"
                              >
                                <span className="font-black text-slate-900">{opt.key}.</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ruled lines for answer space */}
                        <div className="pt-2 pl-6 space-y-3 print:space-y-4">
                          {Array.from({ length: Math.min(4, Math.max(2, q.marks)) }).map((_, idx) => (
                            <div key={idx} className="border-b border-slate-300 border-dotted h-4 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Official End of Paper Line */}
            <div className="text-center pt-6 border-t-2 border-slate-800">
              <span className="text-xs font-black text-slate-700 tracking-wider uppercase">
                *** THIS IS THE LAST PRINTED PAGE • END OF ASSESSMENT ***
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TEACHER MARKING SCHEME & CBE RUBRICS */}
        {/* ======================================================== */}
        {activeTab === 'marking_scheme' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-slate-900">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  CONFIDENTIAL • TEACHER'S MARKING GUIDE
                </span>
                <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 mt-1">
                  {paper.subject} Marking Scheme & Rubrics
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  {paper.grade} • {paper.assessmentType} • Total: {paper.totalMarks} Marks
                </p>
              </div>

              <div className="text-right text-xs font-semibold text-slate-600">
                <div>{paper.schoolName || 'EXAMINATION PANEL'}</div>
                <div className="text-[11px] text-slate-400">Examiner's Reference Copy</div>
              </div>
            </div>

            {/* Questions Marking Points breakdown */}
            <div className="space-y-6">
              {paper.sections.map((section) => (
                <div key={section.sectionLetter} className="space-y-4">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase bg-slate-100 p-2 rounded-lg border-l-4 border-emerald-600">
                    {section.title}
                  </h3>

                  <div className="space-y-4">
                    {section.questions.map((q) => (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">
                            Question {q.number} [{q.marks} Marks]
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Competency: {q.competencyTested}
                          </span>
                        </div>

                        {/* Model Answer */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          <span className="text-[10px] font-black text-emerald-700 uppercase block mb-1">
                            Model Answer / Complete Solution:
                          </span>
                          <p className="text-slate-800 font-semibold whitespace-pre-line leading-relaxed">
                            {q.modelAnswer}
                          </p>
                        </div>

                        {/* Step-by-Step Marking Points */}
                        {q.markingGuide && q.markingGuide.length > 0 && (
                          <div className="text-xs space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              Mark Allocation Breakdown:
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 font-medium">
                              {q.markingGuide.map((mg, i) => (
                                <li key={i}>{mg}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* KICD 4-Level Performance Rubric */}
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            KICD Performance Level Rubric:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                              <span className="font-black text-emerald-800 text-[10px] uppercase">
                                Exceeding (EE)
                              </span>
                              <p className="text-emerald-950 mt-0.5 leading-snug">{q.rubricEE}</p>
                            </div>
                            <div className="p-2 rounded bg-blue-50 border border-blue-200">
                              <span className="font-black text-blue-800 text-[10px] uppercase">
                                Meeting (ME)
                              </span>
                              <p className="text-blue-950 mt-0.5 leading-snug">{q.rubricME}</p>
                            </div>
                            <div className="p-2 rounded bg-amber-50 border border-amber-200">
                              <span className="font-black text-amber-800 text-[10px] uppercase">
                                Approaching (AE)
                              </span>
                              <p className="text-amber-950 mt-0.5 leading-snug">{q.rubricAE}</p>
                            </div>
                            <div className="p-2 rounded bg-rose-50 border border-rose-200">
                              <span className="font-black text-rose-800 text-[10px] uppercase">
                                Below (BE)
                              </span>
                              <p className="text-rose-950 mt-0.5 leading-snug">{q.rubricBE}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: GENERATOR CONFIGURATION FORM */}
        {/* ======================================================== */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#C51E28] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Custom Assessment Generator</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select learning area, grade level, strands, and target marks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Learning Area / Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedStrands([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g} (Junior School)
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  <option value="Term 1, 2026">Term 1, 2026</option>
                  <option value="Term 2, 2026">Term 2, 2026</option>
                  <option value="Term 3, 2026">Term 3, 2026</option>
                </select>
              </div>

              {/* Assessment Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assessment Type</label>
                <select
                  value={selectedAssessmentType}
                  onChange={(e) => setSelectedAssessmentType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  {AVAILABLE_ASSESSMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Marks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Total Marks</label>
                <select
                  value={targetMarks}
                  onChange={(e) => setTargetMarks(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  <option value={30}>30 Marks (Continuous Assessment / CAT)</option>
                  <option value={50}>50 Marks (Mid-Term Exam / Paper)</option>
                  <option value={80}>80 Marks (End-Term Exam)</option>
                  <option value={100}>100 Marks (Comprehensive Assessment)</option>
                </select>
              </div>

              {/* Duration Minutes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                >
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour (60 Mins)</option>
                  <option value={90}>1 Hour 30 Minutes</option>
                  <option value={120}>2 Hours (120 Mins)</option>
                </select>
              </div>
            </div>

            {/* Syllabus Strands Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-black text-slate-800 uppercase">
                Select Specific KICD Syllabus Strands (Optional - selects all if blank):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentSubjectStrands.map((st) => {
                  const isChecked = selectedStrands.includes(st.name);
                  return (
                    <div
                      key={st.name}
                      onClick={() => handleToggleStrand(st.name)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        isChecked ? 'bg-red-50 border-red-300 text-red-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#C51E28] rounded mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {st.subStrands.join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePaper}
                className="px-5 py-2.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Test Paper & Scheme</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* EDIT QUESTION MODAL */}
      {/* ======================================================== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">
                Edit Question {editingQuestion.number}
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={4}
                  value={editQText}
                  onChange={(e) => setEditQText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Allocated Marks</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editQMarks}
                  onChange={(e) => setEditQMarks(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Model Answer / Solution Guide
                </label>
                <textarea
                  rows={3}
                  value={editQAnswer}
                  onChange={(e) => setEditQAnswer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C51E28]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-3 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionEdit}
                className="px-4 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
