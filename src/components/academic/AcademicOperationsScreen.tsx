import React, { useState } from 'react';
import {
  GraduationCap,
  ClipboardList,
  Award,
  Calendar,
  Sliders,
  TrendingUp,
  ShieldCheck,
  ArrowRightLeft,
  ArrowLeft,
} from 'lucide-react';
import {
  Student,
  Assessment,
  Teacher,
  SchoolInfo,
  User,
  AuditLogEntry,
  MarksDeadline,
  TeacherNotification,
  InterClassTransferRecord,
  PromotionRecord,
  AcademicYearArchive,
  BehaviorRecord,
} from '../../types';
import { CoreDataEntryTab } from './CoreDataEntryTab';
import { AssessmentMarksMatrixTab } from './AssessmentMarksMatrixTab';
import { DeadlineManagementTab } from './DeadlineManagementTab';
import { GradingEngineTab } from './GradingEngineTab';
import { AcademicAnalyticsTab } from './AcademicAnalyticsTab';
import { AcademicAuditComplianceTab } from './AcademicAuditComplianceTab';
import { LearnerLifecycleModal } from './LearnerLifecycleModal';
import { ReportCardPreviewModal } from './ReportCardPreviewModal';

interface AcademicOperationsScreenProps {
  students: Student[];
  assessments: Assessment[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  currentUser?: User;
  auditLogs: AuditLogEntry[];
  deadlines: MarksDeadline[];
  notifications: TeacherNotification[];
  transfers: InterClassTransferRecord[];
  promotions: PromotionRecord[];
  archives: AcademicYearArchive[];
  behaviorRecords?: BehaviorRecord[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onBatchUpdateStudents: (updater: (s: Student) => Student) => void;
  onUpdateStudentsList: (students: Student[]) => void;
  onUpdateAssessment: (assessment: Assessment) => void;
  onAddDeadline: (deadline: MarksDeadline) => void;
  onUpdateDeadline: (deadline: MarksDeadline) => void;
  onSendNotification: (notif: TeacherNotification) => void;
  onExecuteTransfer: (record: InterClassTransferRecord) => void;
  onExecutePromotion: (record: PromotionRecord, updatedStudents: Student[]) => void;
  onArchiveYear: (archive: AcademicYearArchive) => void;
  onRestoreArchive: (archiveId: string) => void;
  onAddBehaviorRecord: (record: BehaviorRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
  onNavigateHome: () => void;
}

export type AcademicTabKey =
  | 'data_entry'
  | 'marks_matrix'
  | 'deadlines'
  | 'grading'
  | 'analytics'
  | 'audit';

export const AcademicOperationsScreen: React.FC<AcademicOperationsScreenProps> = ({
  students,
  assessments,
  teachers,
  schoolInfo,
  currentUser,
  auditLogs,
  deadlines,
  notifications,
  transfers,
  promotions,
  archives,
  onAddStudent,
  onUpdateStudent,
  onBatchUpdateStudents,
  onUpdateStudentsList,
  onUpdateAssessment,
  onAddDeadline,
  onUpdateDeadline,
  onSendNotification,
  onExecuteTransfer,
  onExecutePromotion,
  onArchiveYear,
  onRestoreArchive,
  onAddBehaviorRecord,
  onLogAudit,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<AcademicTabKey>('data_entry');
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [lifecycleInitialTab, setLifecycleInitialTab] = useState<'transfers' | 'promotion' | 'archives' | 'history'>('transfers');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<Student>(students[0] || ({} as Student));

  const openLifecycle = (tab: 'transfers' | 'promotion' | 'archives' | 'history') => {
    setLifecycleInitialTab(tab);
    setIsLifecycleModalOpen(true);
  };

  const openReportCard = (student?: Student) => {
    if (student) setSelectedReportStudent(student);
    else if (students.length > 0) setSelectedReportStudent(students[0]);
    setIsReportModalOpen(true);
  };

  // KPI Calculations
  const totalLearners = students.length;
  const validAverages = students
    .map((s) => s.avgScore)
    .filter((s): s is number => s !== null && s !== undefined);
  const institutionalMean =
    validAverages.length > 0
      ? Math.round(validAverages.reduce((a, b) => a + b, 0) / validAverages.length)
      : 76;
  const pendingDeadlinesCount = deadlines.filter((d) => d.status !== 'Submitted').length;
  const finalizedCount = assessments.filter((a) => a.isFinalized).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Back to Main Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                PHASE 5 MASTER SUITE
              </span>
              <span className="text-xs text-slate-400 font-mono">CBC Academic Operations Engine</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Core Data Entry, Academic Records & Assessment Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unified control center for learner lifecycle management, class registers, OCR mark-list ingestion, submission deadline oversight, and automated CBC grading.
            </p>
          </div>

          {/* Quick Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openLifecycle('transfers')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transfers & Promotions</span>
            </button>

            <button
              type="button"
              onClick={() => openReportCard()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <GraduationCap className="w-4 h-4" />
              <span>View Report Card</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Active Learners</span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalLearners}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">Enrolled Across Streams</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Institutional Mean</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{institutionalMean}%</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">CBC Meeting Expectations</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Pending Deadlines</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{pendingDeadlinesCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Under Monitoring</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Finalized Examinations</span>
            <span className="text-xl sm:text-2xl font-black text-white">{finalizedCount}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">Tamper-Evident Lock</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('data_entry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'data_entry'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Core Data Entry (5.2)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('marks_matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'marks_matrix'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assessment & Marks Matrix (5.3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deadlines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'deadlines'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Deadlines & Reminders (5.4 & 5.5)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'grading'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Grading Engine (5.6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Academic Analytics (5.7)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit & Compliance (5.9 & 5.10)</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'data_entry' && (
          <CoreDataEntryTab
            students={students}
            teachers={teachers}
            schoolInfo={schoolInfo}
            currentUser={currentUser}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onBatchUpdateStudents={onBatchUpdateStudents}
            onAddBehaviorRecord={onAddBehaviorRecord}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'marks_matrix' && (
          <AssessmentMarksMatrixTab
            assessments={assessments}
            students={students}
            currentUser={currentUser}
            onUpdateAssessment={onUpdateAssessment}
            onUpdateStudent={onUpdateStudent}
            onBatchUpdateStudents={onBatchUpdateStudents}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'deadlines' && (
          <DeadlineManagementTab
            deadlines={deadlines}
            notifications={notifications}
            teachers={teachers}
            currentUser={currentUser}
            onAddDeadline={onAddDeadline}
            onUpdateDeadline={onUpdateDeadline}
            onSendNotification={onSendNotification}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'grading' && (
          <GradingEngineTab
            students={students}
            currentUser={currentUser}
            onUpdateStudentsList={onUpdateStudentsList}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'analytics' && (
          <AcademicAnalyticsTab
            students={students}
            teachers={teachers}
            deadlines={deadlines}
          />
        )}

        {activeTab === 'audit' && (
          <AcademicAuditComplianceTab
            auditLogs={auditLogs}
            students={students}
            assessments={assessments}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Modals */}
      <LearnerLifecycleModal
        isOpen={isLifecycleModalOpen}
        onClose={() => setIsLifecycleModalOpen(false)}
        initialTab={lifecycleInitialTab}
        students={students}
        currentUser={currentUser}
        transfers={transfers}
        promotions={promotions}
        archives={archives}
        onExecuteTransfer={onExecuteTransfer}
        onExecutePromotion={onExecutePromotion}
        onArchiveYear={onArchiveYear}
        onRestoreArchive={onRestoreArchive}
        onLogAudit={onLogAudit}
      />

      <ReportCardPreviewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={selectedReportStudent}
        schoolInfo={schoolInfo}
      />
    </div>
  );
};
