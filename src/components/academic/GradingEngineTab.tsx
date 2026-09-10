import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  GradingScheme,
  Student,
  User,
} from '../../types';
import {
  DEFAULT_CBC_GRADING_SCHEME,
  KENYAN_12_GRADE_SCHEME,
  recalculateAllAcademicRecords,
  gradeFromScheme,
} from '../../data/academicData';

interface GradingEngineTabProps {
  students: Student[];
  currentUser?: User;
  onUpdateStudentsList: (updated: Student[]) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const GradingEngineTab: React.FC<GradingEngineTabProps> = ({
  students,
  currentUser,
  onUpdateStudentsList,
  onLogAudit,
}) => {
  const [activeSchemeType, setActiveSchemeType] = useState<'CBC_4_BAND' | 'KENYAN_12_GRADE'>('CBC_4_BAND');
  const [scheme, setScheme] = useState<GradingScheme>(DEFAULT_CBC_GRADING_SCHEME);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSwitchSchemeType = (type: 'CBC_4_BAND' | 'KENYAN_12_GRADE') => {
    setActiveSchemeType(type);
    if (type === 'CBC_4_BAND') {
      setScheme(DEFAULT_CBC_GRADING_SCHEME);
    } else {
      setScheme(KENYAN_12_GRADE_SCHEME);
    }
  };

  const handleBoundaryChange = (idx: number, field: 'minScore' | 'maxScore' | 'remarks', val: any) => {
    setScheme((prev) => {
      const copy = [...prev.boundaries];
      copy[idx] = {
        ...copy[idx],
        [field]: field === 'remarks' ? val : parseInt(val) || 0,
      };
      return {
        ...prev,
        boundaries: copy,
      };
    });
  };

  // Re-grade and Re-Rank All Students
  const handleExecuteRegrade = () => {
    const updated = recalculateAllAcademicRecords(students, scheme);
    onUpdateStudentsList(updated);

    if (onLogAudit) {
      onLogAudit(
        'GRADING_SCHEME_UPDATED',
        `Automated Grading Engine executed re-grading and institutional re-ranking for ${students.length} learners using ${scheme.name} by ${currentUser?.fullName || 'Academic Director'}.`
      );
    }

    showToast(`✓ Re-graded and re-ranked all ${students.length} learners across streams`);
  };

  // Compute live grade distribution based on active scheme
  const gradeCounts: Record<string, number> = {};
  scheme.boundaries.forEach((b) => {
    gradeCounts[b.grade] = 0;
  });

  students.forEach((s) => {
    const evalGrade = gradeFromScheme(s.avgScore, scheme);
    if (gradeCounts[evalGrade.grade] !== undefined) {
      gradeCounts[evalGrade.grade]++;
    } else {
      gradeCounts[evalGrade.grade] = 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Automated Grading & Institutional Ranking Engine</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Phase 5.6
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure competency cutoffs, customize point bands, and recalculate longitudinal student ranks and CBC classifications instantly.
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleSwitchSchemeType('CBC_4_BAND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSchemeType === 'CBC_4_BAND'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CBC 4-Band Scale
          </button>
          <button
            type="button"
            onClick={() => handleSwitchSchemeType('KENYAN_12_GRADE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSchemeType === 'KENYAN_12_GRADE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kenyan 12-Grade (A–E)
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grade Distribution Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scheme.boundaries.map((b) => {
          const count = gradeCounts[b.grade] || 0;
          const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
          return (
            <div key={b.grade} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">{b.grade} ({b.label})</span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {b.minScore}–{b.maxScore}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700">{count}</span>
                <span className="text-xs text-slate-500 font-semibold">{pct}% of cohort</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boundary Configuration Matrix */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Active Boundary Table: {scheme.name}
          </span>
          <span className="text-[11px] text-slate-500">
            Last modified by: {scheme.updatedBy}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {scheme.boundaries.map((boundary, idx) => (
            <div key={boundary.grade} className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 sm:w-1/4">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center">
                  {boundary.grade}
                </span>
                <div>
                  <div className="font-bold text-slate-900">{boundary.label}</div>
                  <div className="text-[10px] text-slate-500">{boundary.points} Points Weight</div>
                </div>
              </div>

              {/* Score Range Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500">Min:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={boundary.minScore}
                    onChange={(e) => handleBoundaryChange(idx, 'minScore', e.target.value)}
                    className="w-16 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-[11px] text-slate-400">%</span>
                </div>
                <span className="text-slate-400 font-bold">—</span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500">Max:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={boundary.maxScore}
                    onChange={(e) => handleBoundaryChange(idx, 'maxScore', e.target.value)}
                    className="w-16 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-[11px] text-slate-400">%</span>
                </div>
              </div>

              {/* Teacher Remarks / Assessment Descriptor */}
              <div className="sm:flex-1">
                <input
                  type="text"
                  value={boundary.remarks}
                  onChange={(e) => handleBoundaryChange(idx, 'remarks', e.target.value)}
                  placeholder="Official CBC competency descriptor..."
                  className="w-full px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Commit Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Applying this scheme re-calculates all learner overall CBC bands, class positions, and term aggregates.
          </span>
          <button
            type="button"
            onClick={handleExecuteRegrade}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Grade & Re-Rank All Students</span>
          </button>
        </div>
      </div>
    </div>
  );
};
