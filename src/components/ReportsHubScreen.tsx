import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  FileSpreadsheet,
  BarChart3,
  Users,
  CheckCircle2,
  Search,
  School,
  ShieldCheck,
  Sparkles,
  Send,
  FileText,
  Lock,
} from 'lucide-react';
import { Student, Teacher, SchoolInfo, SchoolProfile, User } from '../types';
import {
  ReportTemplateType,
  ReportApprovalRecord,
} from '../types/reporting';
import {
  AVAILABLE_GRADES,
  AVAILABLE_SUBJECTS,
  calculateStudentRankings,
} from '../data/mockData';
import { computeAnalytics } from '../data/analyticsUtils';
import { isDirectorOfAcademics } from '../utils/securityEngine';
import {
  getInitialApprovalRecord,
  generateCompetencyEvaluations,
  generateValueEvaluations,
  generatePCIEvaluations,
  generateTermComparisonRecords,
  generateAICompetencyInsight,
} from '../data/reportingEngine';
import { ReportCardPreview } from './reporting/ReportCardPreview';
import { LearnerIntelligenceTab } from './reporting/LearnerIntelligenceTab';
import { TeacherReportingTab } from './reporting/TeacherReportingTab';
import { AdministrativeReportsTab } from './reporting/AdministrativeReportsTab';
import { ReportApprovalSecurityTab } from './reporting/ReportApprovalSecurityTab';
import { ReportDistributionModal } from './reporting/ReportDistributionModal';

export type MainReportTab =
  | 'report_cards'
  | 'broadsheet'
  | 'performance_analytics'
  | 'ai_intelligence'
  | 'teacher_reporting'
  | 'administrative_reports'
  | 'security_audit';

interface ReportsHubScreenProps {
  students: Student[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  schoolProfile?: SchoolProfile;
  currentUser?: User;
  onBack: () => void;
  onSelectStudent?: (student: Student) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const ReportsHubScreen: React.FC<ReportsHubScreenProps> = ({
  students,
  teachers,
  schoolInfo,
  schoolProfile,
  currentUser,
  onBack,
  onSelectStudent,
  onLogAudit,
}) => {
  const isDirector = isDirectorOfAcademics(currentUser);
  const [activeMainTab, setActiveMainTab] = useState<MainReportTab>('report_cards');
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplateType>('standard_cbc_report');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('G8 S');
  const [selectedTerm] = useState<string>(schoolInfo.term || 'Term 2, 2026');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [includeOfficialStamp, setIncludeOfficialStamp] = useState<boolean>(true);
  const [showRankings, setShowRankings] = useState<boolean>(true);
  const [isDistributionOpen, setIsDistributionOpen] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [policyActionAttempted, setPolicyActionAttempted] = useState<string>('Print Report');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ranked students
  const rankedStudents = useMemo(() => {
    return calculateStudentRankings(students);
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return rankedStudents.filter((s) => {
      if (selectedGrade !== 'All' && s.grade !== selectedGrade) return false;
      if (selectedClass !== 'All' && s.classArm !== selectedClass) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.admNo.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [rankedStudents, selectedGrade, selectedClass, searchTerm]);

  const activeStudent = useMemo(() => {
    return (
      rankedStudents.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      rankedStudents[0]
    );
  }, [rankedStudents, selectedStudentId, filteredStudents]);

  // Approval record state
  const [approvalRecord, setApprovalRecord] = useState<ReportApprovalRecord>(() =>
    getInitialApprovalRecord(activeStudent || rankedStudents[0], selectedTerm)
  );

  // Computed data for active student
  const competencies = useMemo(() => generateCompetencyEvaluations(activeStudent), [activeStudent]);
  const values = useMemo(() => generateValueEvaluations(), []);
  const pcis = useMemo(() => generatePCIEvaluations(), []);
  const termRecords = useMemo(() => generateTermComparisonRecords(activeStudent), [activeStudent]);
  const aiInsight = useMemo(() => generateAICompetencyInsight(activeStudent), [activeStudent]);

  // Class analytics
  const classAnalytics = useMemo(() => {
    const targetClass = selectedClass === 'All' ? 'G8 S' : selectedClass;
    return computeAnalytics(students, teachers, targetClass, selectedGrade);
  }, [students, teachers, selectedClass, selectedGrade]);

  // School-wide analytics
  const schoolAnalytics = useMemo(() => {
    return computeAnalytics(students, teachers, 'All', 'All');
  }, [students, teachers]);

  const availableClassArms = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.classArm))).sort();
  }, [students]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let filename = `JJSAK_${activeMainTab}_${Date.now()}.csv`;
    let csvContent = '';

    if (activeMainTab === 'broadsheet') {
      const headers = [
        'Rank',
        'Adm No',
        'Student Name',
        'Grade Arm',
        'Gender',
        ...AVAILABLE_SUBJECTS,
        'Total Marks',
        'Mean Score (%)',
        'Mean Grade',
        'Competency Level',
      ];
      const rows = filteredStudents.map((s, idx) => {
        const subjectScores = AVAILABLE_SUBJECTS.map((subName) => {
          const match = s.subjects.find((item) => item.subject === subName);
          return match && match.score !== null ? match.score : '-';
        });
        const total = s.subjects.reduce((sum, item) => sum + (item.score || 0), 0);
        return [
          idx + 1,
          s.admNo,
          `"${s.name}"`,
          `"${s.classArm}"`,
          s.gender || 'Male',
          ...subjectScores,
          total,
          s.avgScore ?? '',
          s.overallGrade,
          s.avgScore && s.avgScore >= 80
            ? 'EE'
            : s.avgScore && s.avgScore >= 65
            ? 'ME'
            : s.avgScore && s.avgScore >= 50
            ? 'AE'
            : 'BE',
        ].join(',');
      });
      csvContent = [headers.join(','), ...rows].join('\n');
      filename = `JJSAK_Official_Broadsheet_${selectedClass}_${Date.now()}.csv`;
    } else {
      const headers = [
        'Adm No',
        'Name',
        'Grade',
        'Class Arm',
        'Gender',
        'Avg Score (%)',
        'Overall Grade',
        'Stream Rank',
        'Grade Rank',
      ];
      const rows = filteredStudents.map((s) => [
        s.admNo,
        `"${s.name}"`,
        s.grade,
        `"${s.classArm}"`,
        s.gender || 'Male',
        s.avgScore ?? '',
        s.overallGrade,
        s.streamPosition || s.streamRank || '',
        s.gradePosition || s.gradeRank || '',
      ].join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
      filename = `JJSAK_Learners_Performance_${selectedClass}_${Date.now()}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onLogAudit?.(
      'ACADEMIC_REPORT_EXPORTED',
      `Director of Academics exported ${filename} with ${filteredStudents.length} records.`
    );
    showToast(`✓ Exported CSV successfully!`);
  };

  const handleExportCSVWithCheck = () => {
    if (!isDirector) {
      setPolicyActionAttempted('Export Academic CSV / Broadsheet Data');
      setShowPolicyModal(true);
      return;
    }
    handleExportCSV();
  };

  const handlePrint = () => {
    if (!isDirector) {
      setPolicyActionAttempted('Print Official Academic Reports / Broadsheets');
      setShowPolicyModal(true);
      return;
    }
    window.print();
    onLogAudit?.(
      'ACADEMIC_REPORT_PRINTED',
      `Director of Academics printed official report card for ${activeStudent.name} (${activeStudent.admNo}).`
    );
  };

  const handleOpenDistribution = () => {
    if (!isDirector) {
      setPolicyActionAttempted('Publish & Distribute Academic Reports');
      setShowPolicyModal(true);
      return;
    }
    setIsDistributionOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Policy Restriction Dialog */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                JJSAK Academic Policy • Section 5 &amp; 9
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Director of Academics Exclusive Authority
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Action blocked: <strong className="text-slate-800">{policyActionAttempted}</strong>.
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Under the JJSAK Academic Policy, only the <strong>Director of Academics</strong> (Sole Academic Administrator) is authorized to generate, print, export, publish, or distribute official academic reports and documents.
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-700 text-left border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-800">Your Current Role Access: Read-Only</p>
                <p className="text-slate-500">You may review and analyze performance data on screen. To obtain official exports or prints, please request the Director of Academics.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Acknowledge &amp; Return to Read-Only View
            </button>
          </div>
        </div>
      )}

      {/* Policy Governance Status Banner */}
      <div className="bg-slate-950 text-white px-4 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isDirector ? (
              <span className="text-emerald-300 font-bold">
                Logged in as Sole Academic Administrator (Director of Academics) • Full Access: Generate, Print, Export, Publish &amp; Approve
              </span>
            ) : (
              <span className="text-slate-300 font-medium">
                Academic Policy Mode: <strong className="text-white">Institutional Read-Only View</strong> (Generating, Printing, Exporting &amp; Publishing reserved exclusively for Director of Academics)
              </span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">SCMH Policy Ref: SEC-05 &amp; SEC-09</span>
      </div>

      {/* Top App Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  PHASE 8
                </span>
                <h1 className="font-black text-lg tracking-tight flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-amber-300" />
                  Academic Reporting &amp; Performance Analytics Master Hub
                </h1>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                CBE Report Cards • Broadsheets • AI Growth Diagnostics • Faculty Audits • Ministry Extracts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDistribution}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm text-white ${
                isDirector
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
                  : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-900'
              }`}
              title={isDirector ? "Multi-Channel Distribution" : "Distribute Reports (Director of Academics Only)"}
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Distribute Reports</span>
              {!isDirector && <Lock className="w-3 h-3 text-amber-300 ml-0.5" />}
            </button>

            <button
              onClick={handleExportCSVWithCheck}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isDirector
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
              }`}
              title={isDirector ? "Export CSV" : "Export CSV (Director Authorization Required)"}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              {!isDirector && <Lock className="w-3 h-3 text-amber-300 ml-0.5" />}
            </button>

            <button
              onClick={handlePrint}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isDirector
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
              }`}
              title={isDirector ? "Print Active View" : "Print View (Director Authorization Required)"}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
              {!isDirector && <Lock className="w-3 h-3 text-amber-300 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'report_cards', label: 'Learner Report Cards (P8.2)', icon: FileText },
            { id: 'broadsheet', label: 'Class Master Broadsheet (P8.3)', icon: FileSpreadsheet },
            { id: 'performance_analytics', label: 'Cohort Performance Analytics (P8.5/P8.6)', icon: BarChart3 },
            { id: 'ai_intelligence', label: 'AI Academic Intelligence (P8.12)', icon: Sparkles },
            { id: 'teacher_reporting', label: 'Teacher Audits & Value-Added (P8.7)', icon: Users },
            { id: 'administrative_reports', label: 'Administrative & BoM Briefs (P8.8)', icon: School },
            { id: 'security_audit', label: 'Security, Approval & Audit (P8.11/P8.13)', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as MainReportTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: LEARNER REPORT CARDS (P8.2 & P8.1) */}
        {activeMainTab === 'report_cards' && (
          <div className="space-y-6">
            {/* Filter & Template Control Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Template Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Template:</span>
                  <select
                    value={activeTemplate}
                    onChange={(e) => setActiveTemplate(e.target.value as ReportTemplateType)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="standard_cbc_report">Standard CBC Report Card (Formative + Summative)</option>
                    <option value="detailed_cbc_progress">Detailed CBC Competencies &amp; Strand Mastery</option>
                    <option value="competency_values_matrix">Learner Core Values &amp; PCIs Matrix</option>
                    <option value="official_transcript">Official Multi-Term Academic Transcript</option>
                    <option value="subject_breakdown">Learning Areas Item Analysis Breakdown</option>
                    <option value="ministry_nemis_export">Ministry / NEMIS Statutory Format</option>
                    <option value="executive_brief">Senior Pathway &amp; Career Diagnostic</option>
                  </select>
                </div>

                {/* Cohort Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="All">All Grades</option>
                    {AVAILABLE_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="All">All Streams</option>
                    {availableClassArms.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Toggle Controls */}
                  <div className="flex items-center gap-3 pl-2 border-l border-slate-200 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={includeSignatures}
                        onChange={(e) => setIncludeSignatures(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Digital Signatures</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={includeOfficialStamp}
                        onChange={(e) => setIncludeOfficialStamp(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Official Stamp</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={showRankings}
                        onChange={(e) => setShowRankings(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Show Positions</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Student Quick Strip & Search */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider shrink-0">
                    Learner ({filteredStudents.length}):
                  </span>
                  {filteredStudents.slice(0, 10).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        onSelectStudent?.(st);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        st.id === activeStudent.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{st.name.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-75 font-mono">({st.avgScore}%)</span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or Adm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Printable Report Card Preview */}
            <ReportCardPreview
              student={activeStudent}
              templateType={activeTemplate}
              schoolInfo={schoolInfo}
              schoolProfile={schoolProfile}
              approvalRecord={approvalRecord}
              competencies={competencies}
              values={values}
              pcis={pcis}
              termRecords={termRecords}
              aiInsight={aiInsight}
              includeSignatures={includeSignatures}
              includeOfficialStamp={includeOfficialStamp}
              showRankings={showRankings}
            />
          </div>
        )}

        {/* TAB 2: CLASS MASTER BROADSHEET (P8.3) */}
        {activeMainTab === 'broadsheet' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Academic Matrix
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Class Master Broadsheet &amp; Subject Mark Sheet
                </h3>
                <p className="text-xs text-slate-500">
                  Cohort: {selectedClass} • Total Learners: {filteredStudents.length} • Term Mean: {classAnalytics.schoolMean}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Broadsheet CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Adm No</th>
                    <th className="py-3 px-4">Student Name</th>
                    {AVAILABLE_SUBJECTS.map((sub) => (
                      <th key={sub} className="py-3 px-2.5 text-center text-[9px] max-w-[70px] truncate" title={sub}>
                        {sub.slice(0, 4)}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center">Total</th>
                    <th className="py-3 px-3 text-center">Mean %</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">CBC Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    const total = st.subjects.reduce((sum, item) => sum + (item.score || 0), 0);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">{st.admNo}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{st.name}</td>
                        {AVAILABLE_SUBJECTS.map((subName) => {
                          const match = st.subjects.find((item) => item.subject === subName);
                          const sc = match?.score;
                          return (
                            <td key={subName} className="py-2.5 px-2.5 text-center font-mono">
                              <span
                                className={`text-[11px] font-bold ${
                                  sc === undefined || sc === null
                                    ? 'text-slate-300'
                                    : sc >= 80
                                    ? 'text-emerald-700 font-black'
                                    : sc >= 50
                                    ? 'text-slate-800'
                                    : 'text-rose-600 font-black'
                                }`}
                              >
                                {sc ?? '-'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{total}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-indigo-900 text-sm">
                          {st.avgScore}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-black text-[10px]">
                            {st.overallGrade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[10px] ${
                              st.avgScore && st.avgScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.avgScore && st.avgScore >= 65
                                ? 'bg-indigo-100 text-indigo-800'
                                : st.avgScore && st.avgScore >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.avgScore && st.avgScore >= 80
                              ? 'EE'
                              : st.avgScore && st.avgScore >= 65
                              ? 'ME'
                              : st.avgScore && st.avgScore >= 50
                              ? 'AE'
                              : 'BE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COHORT PERFORMANCE ANALYTICS (P8.5/P8.6) */}
        {activeMainTab === 'performance_analytics' && (
          <div className="space-y-6">
            {/* School Performance Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-slate-500 font-bold block">Cohort Mean Score</span>
                <strong className="text-2xl font-black text-indigo-600">{schoolAnalytics.schoolMean}%</strong>
                <span className="text-[10px] text-emerald-700 block font-semibold">
                  Overall Grade: {schoolAnalytics.schoolOverallGrade} (Proficient)
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-slate-500 font-bold block">Overall Pass Rate</span>
                <strong className="text-2xl font-black text-emerald-700">{schoolAnalytics.passRate}%</strong>
                <span className="text-[10px] text-slate-500 block">Meeting or Exceeding (ME + EE)</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-slate-500 font-bold block">Exceeding Benchmark (EE)</span>
                <strong className="text-2xl font-black text-purple-700">
                  {schoolAnalytics.cbeBroadDistribution.eePercent}%
                </strong>
                <span className="text-[10px] text-purple-600 block">
                  {schoolAnalytics.cbeBroadDistribution.eeCount} Exceptional Learners
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-slate-500 font-bold block">Total Assessed Learners</span>
                <strong className="text-2xl font-black text-slate-900">{schoolAnalytics.totalLearners}</strong>
                <span className="text-[10px] text-slate-500 block">Across Junior Secondary</span>
              </div>
            </div>

            {/* Subject Breakdown & Learning Area Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Learning Areas Performance &amp; Pass Rate Matrix
                </h3>
                <span className="text-xs text-slate-500 font-mono">9 Core Learning Areas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {schoolAnalytics.learningAreaStats.map((item) => (
                  <div key={item.subject} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-black text-sm">{item.subject}</strong>
                      <span className="font-mono text-indigo-700 font-black text-sm">{item.meanScore}%</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.meanScore}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                      <span>Teacher: {item.teacherName}</span>
                      <span className="font-bold text-emerald-700">EE: {item.exceedingPercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI ACADEMIC INTELLIGENCE (P8.12) */}
        {activeMainTab === 'ai_intelligence' && (
          <LearnerIntelligenceTab
            students={rankedStudents}
            onSelectStudent={(st) => setSelectedStudentId(st.id)}
            onLogAudit={onLogAudit}
          />
        )}

        {/* TAB 5: TEACHER REPORTING (P8.7) */}
        {activeMainTab === 'teacher_reporting' && (
          <TeacherReportingTab
            teachers={teachers}
            students={students}
            onLogAudit={onLogAudit}
          />
        )}

        {/* TAB 6: ADMINISTRATIVE REPORTS (P8.8) */}
        {activeMainTab === 'administrative_reports' && (
          <AdministrativeReportsTab
            students={students}
            schoolInfo={schoolInfo}
            onLogAudit={onLogAudit}
          />
        )}

        {/* TAB 7: SECURITY, APPROVAL & AUDIT (P8.11 / P8.13) */}
        {activeMainTab === 'security_audit' && (
          <ReportApprovalSecurityTab
            students={students}
            approvalRecord={approvalRecord}
            onUpdateApprovalRecord={setApprovalRecord}
            onLogAudit={onLogAudit}
          />
        )}
      </div>

      {/* Multi-Channel Report Distribution Modal */}
      <ReportDistributionModal
        isOpen={isDistributionOpen}
        onClose={() => setIsDistributionOpen(false)}
        students={filteredStudents}
        schoolInfo={schoolInfo}
        activeTemplate={activeTemplate}
        onLogAudit={onLogAudit}
      />
    </div>
  );
};
