import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  AcademicValidationIssue,
  CurriculumFramework,
  AcademicYearConfig,
  AcademicTermConfig,
  GradeConfig,
  StreamConfig,
  SubjectDefinition,
  TeacherSubjectAllocation,
  ClassTeacherAllocation,
} from '../../../types/academicStructure';
import { Teacher } from '../../../types';
import { runAcademicStructureDiagnostics, ValidationSummary } from '../../../utils/academicStructureEngine';

interface StructureValidationTabProps {
  curriculum: CurriculumFramework;
  academicYears: AcademicYearConfig[];
  terms: AcademicTermConfig[];
  grades: GradeConfig[];
  streams: StreamConfig[];
  subjects: SubjectDefinition[];
  allocations: TeacherSubjectAllocation[];
  classTeacherAllocations: ClassTeacherAllocation[];
  teachers: Teacher[];
  onUpdateAllocations: (allocations: TeacherSubjectAllocation[]) => void;
  onUpdateClassTeachers?: (ctas: ClassTeacherAllocation[]) => void;
  onUpdateSubjects: (subjects: SubjectDefinition[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const StructureValidationTab: React.FC<StructureValidationTabProps> = ({
  curriculum,
  academicYears,
  terms,
  grades,
  streams,
  subjects,
  allocations,
  classTeacherAllocations,
  teachers,
  onUpdateAllocations,
  onUpdateClassTeachers: _onUpdateClassTeachers,
  onUpdateSubjects,
  onLogAudit,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING' | 'INFO'>('ALL');
  const [autoFixSuccessMsg, setAutoFixSuccessMsg] = useState<string | null>(null);

  const diagnostics: ValidationSummary = runAcademicStructureDiagnostics({
    curriculum,
    academicYears,
    terms,
    grades,
    streams,
    subjects,
    allocations,
    classTeacherAllocations,
    teachers,
  });

  const filteredIssues = diagnostics.issues.filter((issue) => {
    if (filterSeverity === 'ALL') return true;
    return issue.severity === filterSeverity;
  });

  const handleAutoFix = (issue: AcademicValidationIssue) => {
    if (issue.autoFixAction === 'ASSIGN_DEFAULT_TEACHER') {
      // Find default teacher and auto allocate
      const defaultTeacher = teachers[0];
      const parts = issue.affectedEntity.split(' • ');
      const streamName = parts[0];
      const subjectName = parts[1];

      const stream = streams.find((s) => s.fullClassName === streamName);
      const subject = subjects.find((sub) => sub.name === subjectName);

      if (stream && subject && defaultTeacher) {
        const newAlloc: TeacherSubjectAllocation = {
          id: `tsa-autofix-${Date.now()}`,
          teacherId: defaultTeacher.id,
          teacherName: defaultTeacher.name,
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          streamId: stream.id,
          fullClassName: stream.fullClassName,
          gradeName: stream.gradeName,
          lessonsPerWeek: subject.lessonsPerWeek,
          allocatedRoom: stream.roomNumber,
          academicYear: 2026,
          termNumber: 2,
          assignedBy: 'Academic Engine Auto-Fix',
          assignedAt: new Date().toISOString().split('T')[0],
          status: 'CONFIRMED',
        };

        onUpdateAllocations([...allocations, newAlloc]);
        onLogAudit?.(
          'VALIDATION_AUTO_FIX_APPLIED',
          `Auto-fixed unassigned subject ${subject.name} in ${stream.fullClassName} -> assigned to ${defaultTeacher.name}.`
        );
        setAutoFixSuccessMsg(`Resolved: ${subject.name} in ${stream.fullClassName} assigned to ${defaultTeacher.name}.`);
        setTimeout(() => setAutoFixSuccessMsg(null), 4000);
      }
    } else if (issue.autoFixAction === 'RESTORE_KICD_PERIODS') {
      const subject = subjects.find((s) => issue.affectedEntity.includes(s.name));
      if (subject) {
        const updated = subjects.map((s) => (s.id === subject.id ? { ...s, lessonsPerWeek: 4 } : s));
        onUpdateSubjects(updated);
        onLogAudit?.(
          'VALIDATION_AUTO_FIX_APPLIED',
          `Auto-fixed curriculum deficit for ${subject.name} -> restored to 4 lessons/week.`
        );
        setAutoFixSuccessMsg(`Restored KICD statutory periods for ${subject.name} to 4 lessons/week.`);
        setTimeout(() => setAutoFixSuccessMsg(null), 4000);
      }
    }
  };

  const handleResolveAllAutoFixable = () => {
    const autoFixable = diagnostics.issues.filter((i) => i.autoFixAvailable);
    autoFixable.forEach((issue) => handleAutoFix(issue));
    setAutoFixSuccessMsg(`Auto-resolved ${autoFixable.length} structural conflicts!`);
    setTimeout(() => setAutoFixSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Diagnostics Score Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shrink-0 shadow-md ${
              diagnostics.scorePercentage >= 90
                ? 'bg-emerald-500 text-white'
                : diagnostics.scorePercentage >= 70
                ? 'bg-amber-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {diagnostics.scorePercentage}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                Academic Structure Health &amp; Compliance
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  diagnostics.isCompliant
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {diagnostics.isCompliant ? 'Compliant' : 'Attention Required'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live audit across teacher workload, stream rooming, KICD lesson allocations, and class master designations.
            </p>
          </div>
        </div>

        {diagnostics.issues.some((i) => i.autoFixAvailable) && (
          <button
            type="button"
            onClick={handleResolveAllAutoFixable}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer self-start md:self-auto active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Auto-Fix All Resolvable Issues</span>
          </button>
        )}
      </div>

      {autoFixSuccessMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{autoFixSuccessMsg}</span>
        </div>
      )}

      {/* Severity Filter Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Issues', count: diagnostics.totalIssues },
            { id: 'ERROR', label: 'Errors (High Priority)', count: diagnostics.errorCount },
            { id: 'WARNING', label: 'Warnings (Workload/Cap)', count: diagnostics.warningCount },
            { id: 'INFO', label: 'Informational', count: diagnostics.infoCount },
          ].map((btn) => (
            <button
              type="button"
              key={btn.id}
              onClick={() => setFilterSeverity(btn.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filterSeverity === btn.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{btn.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  filterSeverity === btn.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Engine: JJSAK Real-Time Diagnostics v2.4
        </span>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => {
          const isError = issue.severity === 'ERROR';
          const isWarning = issue.severity === 'WARNING';

          return (
            <div
              key={issue.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isError
                  ? 'border-rose-300 bg-rose-50/20'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isError
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        isError
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {issue.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {issue.description}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <strong className="text-slate-700">Recommendation:</strong> {issue.suggestedAction}
                  </p>
                </div>
              </div>

              {issue.autoFixAvailable && (
                <button
                  type="button"
                  onClick={() => handleAutoFix(issue)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Auto-Resolve</span>
                </button>
              )}
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-black text-slate-900">
              No Structural Anomalies Detected
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All learning areas, stream capacities, teacher allocations, and academic calendar dates meet statutory Ministry of Education standards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
