import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  School,
  UserCheck,
  Scale,
  GraduationCap,
  ShieldCheck,
  History,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  CurriculumFramework,
  AcademicYearConfig,
  AcademicTermConfig,
  LearningLevelConfig,
  GradeConfig,
  StreamConfig,
  SubjectDefinition,
  TeacherSubjectAllocation,
  ClassTeacherAllocation,
  LearnerPlacementRule,
  PromotionPolicyConfig,
  AcademicStructureAuditEntry,
  LearningAreaStrand,
} from '../../types/academicStructure';
import { Teacher, Student, SchoolInfo } from '../../types';
import { CurriculumFrameworkTab } from './tabs/CurriculumFrameworkTab';
import { AcademicCalendarTab } from './tabs/AcademicCalendarTab';
import { LevelGradeClassTab } from './tabs/LevelGradeClassTab';
import { SubjectManagementTab } from './tabs/SubjectManagementTab';
import { TeacherAllocationsTab } from './tabs/TeacherAllocationsTab';
import { LearnerPlacementTab } from './tabs/LearnerPlacementTab';
import { PromotionFrameworkTab } from './tabs/PromotionFrameworkTab';
import { StructureValidationTab } from './tabs/StructureValidationTab';
import { AcademicAuditLogTab } from './tabs/AcademicAuditLogTab';

interface AcademicStructureHubProps {
  curriculum: CurriculumFramework;
  strands: LearningAreaStrand[];
  academicYears: AcademicYearConfig[];
  terms: AcademicTermConfig[];
  levels: LearningLevelConfig[];
  grades: GradeConfig[];
  streams: StreamConfig[];
  subjects: SubjectDefinition[];
  allocations: TeacherSubjectAllocation[];
  classTeacherAllocations: ClassTeacherAllocation[];
  placementRules: LearnerPlacementRule[];
  promotionPolicies: PromotionPolicyConfig[];
  auditLogs: AcademicStructureAuditEntry[];
  teachers: Teacher[];
  students: Student[];
  schoolInfo: SchoolInfo;
  onUpdateCurriculum: (curriculum: CurriculumFramework) => void;
  onUpdateAcademicYears: (years: AcademicYearConfig[]) => void;
  onUpdateTerms: (terms: AcademicTermConfig[]) => void;
  onUpdateGrades: (grades: GradeConfig[]) => void;
  onUpdateStreams: (streams: StreamConfig[]) => void;
  onUpdateSubjects: (subjects: SubjectDefinition[]) => void;
  onUpdateAllocations: (allocations: TeacherSubjectAllocation[]) => void;
  onUpdateClassTeacherAllocations: (ctas: ClassTeacherAllocation[]) => void;
  onUpdatePlacementRules: (rules: LearnerPlacementRule[]) => void;
  onUpdatePromotionPolicies: (policies: PromotionPolicyConfig[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onLogAudit: (action: any, details: string, prev?: string, next?: string) => void;
  onBackToHome?: () => void;
}

export type AcademicTabKey =
  | 'curriculum'
  | 'calendar'
  | 'levels_grades_streams'
  | 'subjects'
  | 'teacher_allocations'
  | 'learner_placement'
  | 'promotion'
  | 'validation'
  | 'audit_logs';

export const AcademicStructureHub: React.FC<AcademicStructureHubProps> = ({
  curriculum,
  strands,
  academicYears,
  terms,
  levels,
  grades,
  streams,
  subjects,
  allocations,
  classTeacherAllocations,
  placementRules,
  promotionPolicies,
  auditLogs,
  teachers,
  students,
  schoolInfo,
  onUpdateCurriculum,
  onUpdateAcademicYears,
  onUpdateTerms,
  onUpdateGrades,
  onUpdateStreams,
  onUpdateSubjects,
  onUpdateAllocations,
  onUpdateClassTeacherAllocations,
  onUpdatePlacementRules,
  onUpdatePromotionPolicies,
  onUpdateStudents,
  onLogAudit,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<AcademicTabKey>('curriculum');

  const navItems = [
    { id: 'curriculum', label: 'Curriculum Framework', icon: BookOpen, tag: 'KICD' },
    { id: 'calendar', label: 'Academic Calendar & Terms', icon: Calendar, tag: '3 Terms' },
    { id: 'levels_grades_streams', label: 'Levels, Grades & Streams', icon: School, count: streams.length },
    { id: 'subjects', label: 'Subject Management', icon: Sparkles, count: subjects.length },
    { id: 'teacher_allocations', label: 'Teacher Allocations', icon: UserCheck, count: allocations.length },
    { id: 'learner_placement', label: 'Learner Placement', icon: Scale },
    { id: 'promotion', label: 'Promotion Framework', icon: GraduationCap },
    { id: 'validation', label: 'Validation Engine', icon: ShieldCheck },
    { id: 'audit_logs', label: 'Academic Audit Logs', icon: History, count: auditLogs.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top App Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Academic Structure Hub
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    Phase 7 Foundation
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {schoolInfo.name} • Competency Based Curriculum (CBC / CBE) Master Architecture
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                2026 Academic Year Active
              </span>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AcademicTabKey)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.tag && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'curriculum' && (
          <CurriculumFrameworkTab
            curriculum={curriculum}
            strands={strands}
            onUpdateCurriculum={onUpdateCurriculum}
          />
        )}

        {activeTab === 'calendar' && (
          <AcademicCalendarTab
            academicYears={academicYears}
            terms={terms}
            onUpdateAcademicYears={onUpdateAcademicYears}
            onUpdateTerms={onUpdateTerms}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'levels_grades_streams' && (
          <LevelGradeClassTab
            levels={levels}
            grades={grades}
            streams={streams}
            teachers={teachers}
            students={students}
            onUpdateStreams={onUpdateStreams}
            onUpdateGrades={onUpdateGrades}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManagementTab
            subjects={subjects}
            onUpdateSubjects={onUpdateSubjects}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'teacher_allocations' && (
          <TeacherAllocationsTab
            allocations={allocations}
            classTeacherAllocations={classTeacherAllocations}
            streams={streams}
            subjects={subjects}
            teachers={teachers}
            schoolInfo={schoolInfo}
            onUpdateAllocations={onUpdateAllocations}
            onUpdateClassTeacherAllocations={onUpdateClassTeacherAllocations}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'learner_placement' && (
          <LearnerPlacementTab
            placementRules={placementRules}
            streams={streams}
            students={students}
            onUpdatePlacementRules={onUpdatePlacementRules}
            onUpdateStreams={onUpdateStreams}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'promotion' && (
          <PromotionFrameworkTab
            policies={promotionPolicies}
            grades={grades}
            students={students}
            onUpdatePolicies={onUpdatePromotionPolicies}
            onUpdateStudents={onUpdateStudents}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'validation' && (
          <StructureValidationTab
            curriculum={curriculum}
            academicYears={academicYears}
            terms={terms}
            grades={grades}
            streams={streams}
            subjects={subjects}
            allocations={allocations}
            classTeacherAllocations={classTeacherAllocations}
            teachers={teachers}
            onUpdateAllocations={onUpdateAllocations}
            onUpdateClassTeachers={onUpdateClassTeacherAllocations}
            onUpdateSubjects={onUpdateSubjects}
            onLogAudit={onLogAudit}
          />
        )}

        {activeTab === 'audit_logs' && (
          <AcademicAuditLogTab
            auditLogs={auditLogs}
            schoolInfo={schoolInfo}
          />
        )}
      </main>
    </div>
  );
};
