import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Search,
} from 'lucide-react';
import { PromotionPolicyConfig, GradeConfig } from '../../../types/academicStructure';
import { Student } from '../../../types';

interface PromotionFrameworkTabProps {
  policies: PromotionPolicyConfig[];
  grades?: GradeConfig[];
  students: Student[];
  onUpdatePolicies?: (policies: PromotionPolicyConfig[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const PromotionFrameworkTab: React.FC<PromotionFrameworkTabProps> = ({
  policies,
  students,
  onUpdateStudents,
  onLogAudit,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || 'pol-g7-to-g8');
  const [searchStudent, setSearchStudent] = useState('');
  const [promotedSuccessMessage, setPromotedSuccessMessage] = useState<string | null>(null);

  const activePolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  const sourceGradeStudents = students.filter((s) => s.grade === activePolicy?.fromGrade);

  const filteredStudents = sourceGradeStudents.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    (s.admNo && s.admNo.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  const handleExecuteBatchPromotion = () => {
    if (!activePolicy) return;
    if (confirm(`Execute automatic promotion for all eligible learners in ${activePolicy.fromGrade} to ${activePolicy.toGrade}?`)) {
      const updatedStudents = students.map((s) => {
        if (s.grade === activePolicy.fromGrade) {
          // If toGrade is Senior School, mark as graduated
          if (activePolicy.toGrade.includes('Senior School')) {
            return {
              ...s,
              grade: 'Graduated - Senior School',
              stream: 'Alumni 2026',
            };
          }
          return {
            ...s,
            grade: activePolicy.toGrade,
          };
        }
        return s;
      });

      onUpdateStudents(updatedStudents);
      onLogAudit?.(
        'PROMOTION_BATCH_EXECUTED',
        `Executed batch academic promotion for ${sourceGradeStudents.length} learners from ${activePolicy.fromGrade} to ${activePolicy.toGrade}.`
      );

      setPromotedSuccessMessage(`Successfully promoted ${sourceGradeStudents.length} learners to ${activePolicy.toGrade}!`);
      setTimeout(() => setPromotedSuccessMessage(null), 4000);
    }
  };

  const handleRollbackPromotion = () => {
    if (!activePolicy) return;
    if (confirm(`Roll back cohort promotion from ${activePolicy.toGrade} back to ${activePolicy.fromGrade}?`)) {
      const updatedStudents = students.map((s) => {
        if (s.grade === activePolicy.toGrade || (activePolicy.toGrade.includes('Senior') && s.grade.includes('Graduated'))) {
          return {
            ...s,
            grade: activePolicy.fromGrade,
          };
        }
        return s;
      });

      onUpdateStudents(updatedStudents);
      onLogAudit?.(
        'PROMOTION_BATCH_EXECUTED',
        `Rolled back promotion: reverted cohort from ${activePolicy.toGrade} to ${activePolicy.fromGrade}.`
      );

      setPromotedSuccessMessage(`Promotion rollback completed for ${activePolicy.fromGrade}.`);
      setTimeout(() => setPromotedSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                CBC Progression Policy
              </span>
              <span className="text-xs text-indigo-300 font-mono">100% Transition Standard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              Academic Promotion &amp; Transition Framework
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standardized progression criteria across Junior Secondary levels (Grade 7 &rarr; Grade 8 &rarr; Grade 9 &rarr; Senior School Pathway Placement). Evaluates attendance, formative assessments, and remedial support flags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRollbackPromotion}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs border border-white/15"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rollback Promotion</span>
            </button>
            <button
              type="button"
              onClick={handleExecuteBatchPromotion}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Cohort Promotion</span>
            </button>
          </div>
        </div>
      </div>

      {promotedSuccessMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{promotedSuccessMessage}</span>
        </div>
      )}

      {/* Policy Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {policies.map((policy) => {
          const isSelected = selectedPolicyId === policy.id;
          return (
            <button
              type="button"
              key={policy.id}
              onClick={() => setSelectedPolicyId(policy.id)}
              className={`p-5 rounded-3xl border text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {policy.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isSelected
                        ? 'bg-emerald-400 text-emerald-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    ACTIVE
                  </span>
                </div>
                <h4 className="text-base font-black leading-snug">{policy.fromGrade} &rarr; {policy.toGrade}</h4>
                <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                  <span>From: {policy.fromGrade}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>To: {policy.toGrade}</span>
                </div>
              </div>

              <div
                className={`pt-2.5 border-t text-[11px] font-medium ${
                  isSelected ? 'border-indigo-500 text-indigo-100' : 'border-slate-100 text-slate-500'
                }`}
              >
                Min Attendance: <strong>{policy.minAttendancePercentage}%</strong> • Mean Score: <strong>{policy.minOverallMeanScore}%</strong>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Policy Rules Breakdown & Cohort Evaluator */}
      {activePolicy && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy Criteria Specification */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Promotion Criteria Specification
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Minimum CBC Level:</span>
                <strong className="text-indigo-600 font-black">Grade Benchmark: {activePolicy.cbcExpectationMinimum} (Meeting Expectations)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Min Overall Score:</span>
                <strong className="text-slate-900">{activePolicy.minOverallMeanScore}% Average</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Attendance Threshold:</span>
                <strong className="text-slate-900">{activePolicy.minAttendancePercentage}% Required</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Compulsory Subjects:</span>
                <strong className="text-slate-900">{activePolicy.compulsoryPassCount} Core Subjects Passed</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Special Needs Exemption:</span>
                <strong className="text-emerald-700 font-bold">{activePolicy.specialNeedsExemption ? 'Yes (Adaptive)' : 'Standard'}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Statutory Guidelines &amp; Exceptions
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Non-punitive progression: Learners below benchmark are placed on remedial holiday support rather than repeating.</li>
                <li>Special Needs Learners receive adaptive accommodations and automatic progression.</li>
                <li>Principal &amp; Academic Board retain discretionary override authority.</li>
              </ul>
            </div>
          </div>

          {/* Learner Eligibility Roster */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {activePolicy.fromGrade} Cohort Progression Roster
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {sourceGradeStudents.length} candidate learners ready for transition evaluation
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or adm no..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Adm No</th>
                    <th className="py-2.5 px-3.5">Learner Name</th>
                    <th className="py-2.5 px-3.5">Current Class</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Target Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.slice(0, 8).map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3.5 font-mono text-indigo-600 font-bold">
                        {st.admNo}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {st.grade} {st.stream}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          QUALIFIED
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-indigo-600">
                        {activePolicy.toGrade}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No learners found matching the active grade filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
