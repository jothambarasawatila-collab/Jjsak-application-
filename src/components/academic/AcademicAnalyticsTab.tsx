import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  Student,
  Teacher,
  MarksDeadline,
} from '../../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
} from '../../data/mockData';

interface AcademicAnalyticsTabProps {
  students: Student[];
  teachers: Teacher[];
  deadlines: MarksDeadline[];
}

export const AcademicAnalyticsTab: React.FC<AcademicAnalyticsTabProps> = ({
  students,
  teachers,
  deadlines,
}) => {
  const [analyticsScope, setAnalyticsScope] = useState<'school' | 'teacher' | 'learner'>('school');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(students[0]?.id || '');
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>(teachers[0]?.name || '');

  // 1. School-Level Computations
  const validScores = students
    .map((s) => s.avgScore)
    .filter((s): s is number => s !== null && s !== undefined);
  const schoolMeanScore =
    validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 78;

  // Stream Performance Means
  const streamPerformance = AVAILABLE_CLASSES.map((cls) => {
    const classLearners = students.filter((s) => s.classArm === cls);
    const scores = classLearners
      .map((s) => s.avgScore)
      .filter((s): s is number => s !== null && s !== undefined);
    const mean = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      className: cls,
      count: classLearners.length,
      meanScore: mean,
    };
  });

  // Subject Averages across entire school
  const subjectAverages = AVAILABLE_SUBJECTS.map((sub) => {
    const allScoresForSub: number[] = [];
    students.forEach((st) => {
      const match = st.subjects.find((s) => s.subject === sub);
      if (match && match.score !== null && match.score !== undefined) {
        allScoresForSub.push(match.score);
      }
    });
    const avg =
      allScoresForSub.length > 0
        ? Math.round(allScoresForSub.reduce((a, b) => a + b, 0) / allScoresForSub.length)
        : 75;
    return {
      subject: sub,
      average: avg,
      learnerCount: allScoresForSub.length,
    };
  }).sort((a, b) => b.average - a.average);

  // 2. Teacher-Level Computations
  const teacherDeadlines = deadlines.filter((d) => d.assignedTeacherName === selectedTeacherName);
  const submittedDeadlines = teacherDeadlines.filter((d) => d.status === 'Submitted').length;
  const complianceRate =
    teacherDeadlines.length > 0 ? Math.round((submittedDeadlines / teacherDeadlines.length) * 100) : 100;

  // 3. Learner-Level Computations
  const activeLearner = students.find((s) => s.id === selectedLearnerId) || students[0];
  const sortedLearnerSubjects = [...(activeLearner?.subjects || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topStrengths = sortedLearnerSubjects.slice(0, 3);
  const remedialNeeds = sortedLearnerSubjects.slice(-2);

  return (
    <div className="space-y-6">
      {/* Scope Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnalyticsScope('school')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              analyticsScope === 'school'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>School-Wide Performance</span>
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsScope('teacher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              analyticsScope === 'teacher'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teacher & Department Compliance</span>
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsScope('learner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              analyticsScope === 'learner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner Diagnostic & Remediation</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 px-3">
          Institutional Population: {students.length} Learners
        </span>
      </div>

      {/* SCOPE 1: SCHOOL-WIDE PERFORMANCE */}
      {analyticsScope === 'school' && (
        <div className="space-y-6">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Institutional Mean Score</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{schoolMeanScore}%</div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                <span>+3.2% vs Term 1 Baseline</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-medium">Highest Performing Subject</span>
              <div className="text-lg font-black text-slate-800 mt-1">{subjectAverages[0]?.subject}</div>
              <span className="text-[11px] text-emerald-600 font-bold">{subjectAverages[0]?.average}% Average</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-medium">Top Stream by Mean</span>
              <div className="text-lg font-black text-slate-800 mt-1">
                {[...streamPerformance].sort((a, b) => b.meanScore - a.meanScore)[0]?.className}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">
                {[...streamPerformance].sort((a, b) => b.meanScore - a.meanScore)[0]?.meanScore}% Mean
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-medium">Cohort Attendance Rate</span>
              <div className="text-2xl font-black text-slate-800 mt-1">94.8%</div>
              <span className="text-[10px] text-slate-500 font-medium">High correlation with pass rates</span>
            </div>
          </div>

          {/* Stream Comparison Cards */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-800">
              Stream-by-Stream Performance Comparison
            </div>
            <div className="divide-y divide-slate-100">
              {streamPerformance.map((item) => (
                <div key={item.className} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 font-bold text-slate-800 flex items-center justify-center">
                      {item.className}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{item.className} Stream Cohort</div>
                      <div className="text-[11px] text-slate-500">{item.count} Active Learners</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, item.meanScore)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-800">{item.meanScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Area Ranking */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-800">
              Subject Aggregate Performance Ranking
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-800 block mb-2">Top Learning Areas</span>
                {subjectAverages.slice(0, 5).map((sub, idx) => (
                  <div key={sub.subject} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">
                      {idx + 1}. {sub.subject}
                    </span>
                    <span className="font-bold text-emerald-700">{sub.average}%</span>
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-2">
                <span className="text-xs font-bold text-amber-800 block mb-2">Areas for Targeted Intervention</span>
                {subjectAverages.slice(-4).map((sub) => (
                  <div key={sub.subject} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{sub.subject}</span>
                    <span className="font-bold text-amber-700">{sub.average}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCOPE 2: TEACHER & COMPLIANCE ANALYTICS */}
      {analyticsScope === 'teacher' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Select Educator / Reporting Officer</h3>
              <p className="text-[11px] text-slate-500">
                Evaluate marks deadline compliance, assigned learning areas, and stream outcomes.
              </p>
            </div>
            <select
              value={selectedTeacherName}
              onChange={(e) => setSelectedTeacherName(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.designation || 'Teacher'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Submission Compliance Rate</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{complianceRate}%</div>
              <span className="text-[10px] text-slate-400">Timely marks turn-in</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Assigned Submissions</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{teacherDeadlines.length}</div>
              <span className="text-[10px] text-slate-400">Deadlines monitored</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Director of Academics Standing</span>
              <div className="text-2xl font-black text-slate-800 mt-1">Exemplary</div>
              <span className="text-[10px] text-emerald-600 font-bold">Compliant with Policy 5.4</span>
            </div>
          </div>
        </div>
      )}

      {/* SCOPE 3: LEARNER DIAGNOSTIC & REMEDIATION */}
      {analyticsScope === 'learner' && activeLearner && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Select Learner for Diagnostic Profile</h3>
              <p className="text-[11px] text-slate-500">
                Identify individual academic strengths, remediation priorities, and attendance correlations.
              </p>
            </div>
            <select
              value={selectedLearnerId}
              onChange={(e) => setSelectedLearnerId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.admNo}) — {s.classArm}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Primary CBC Competency Strengths</span>
              </h4>
              <div className="space-y-2">
                {topStrengths.map((sub) => (
                  <div key={sub.subject} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{sub.subject}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{sub.remarks}</div>
                    </div>
                    <span className="text-sm font-black text-emerald-800">{sub.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remediation Priorities */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Targeted Learning Scaffolding & Remediation</span>
              </h4>
              <div className="space-y-2">
                {remedialNeeds.map((sub) => (
                  <div key={sub.subject} className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{sub.subject}</div>
                      <div className="text-[10px] text-amber-700 font-semibold">Additional practice exercises recommended</div>
                    </div>
                    <span className="text-sm font-black text-amber-800">{sub.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
