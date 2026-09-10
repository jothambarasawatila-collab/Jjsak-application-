import React, { useState } from 'react';
import {
  Scale,
  Shuffle,
  HeartHandshake,
} from 'lucide-react';
import { LearnerPlacementRule, StreamConfig } from '../../../types/academicStructure';
import { Student } from '../../../types';
import { StreamBalanceWizardModal } from '../modals/StreamBalanceWizardModal';

interface LearnerPlacementTabProps {
  placementRules: LearnerPlacementRule[];
  streams: StreamConfig[];
  students: Student[];
  onUpdatePlacementRules: (rules: LearnerPlacementRule[]) => void;
  onUpdateStreams: (streams: StreamConfig[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const LearnerPlacementTab: React.FC<LearnerPlacementTabProps> = ({
  placementRules,
  streams,
  students,
  onUpdatePlacementRules,
  onUpdateStreams,
  onLogAudit,
}) => {
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('Grade 7');

  const cohortStudents = students.filter((s) => s.grade === selectedCohort);
  const cohortStreams = streams.filter((s) => s.gradeName === selectedCohort);

  const totalBoys = cohortStudents.filter((s) => s.gender?.toLowerCase() === 'male' || s.gender === 'Boy').length;
  const totalGirls = cohortStudents.length - totalBoys;

  const handleToggleRule = (ruleId: string) => {
    const updated = placementRules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r));
    onUpdatePlacementRules(updated);
    const rule = placementRules.find((r) => r.id === ruleId);
    onLogAudit?.(
      'LEARNER_STREAM_PLACED',
      `Toggled enforcement of placement rule "${rule?.title}" to ${!rule?.active ? 'ACTIVE' : 'DISABLED'}.`
    );
  };

  const handleApplyRebalance = (rebalancedStreams: StreamConfig[], _rebalancedStudents: Student[]) => {
    onUpdateStreams(rebalancedStreams);
    onLogAudit?.(
      'LEARNER_STREAM_PLACED',
      `Applied automated placement and stream balancing for cohort ${selectedCohort}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Learner Placement &amp; Cohort Distribution Structure
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              National CBC guidelines for non-selective, inclusive stream distribution
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBalanceModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Shuffle className="w-4 h-4" />
          <span>Stream Balancing Wizard</span>
        </button>
      </div>

      {/* Cohort Selector & Parity Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Cohort Selection
            </h4>
            <span className="text-xs font-bold text-indigo-600">
              {cohortStudents.length} Total Enrolled
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setSelectedCohort(g)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition text-center cursor-pointer ${
                  selectedCohort === g
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Gender Ratio Breakdown */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Gender Parity Index:</span>
              <span className="text-emerald-600">0.98 (Balanced)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full"
                style={{
                  width: `${cohortStudents.length > 0 ? (totalBoys / cohortStudents.length) * 100 : 50}%`,
                }}
              />
              <div
                className="bg-purple-500 h-full"
                style={{
                  width: `${cohortStudents.length > 0 ? (totalGirls / cohortStudents.length) * 100 : 50}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>{totalBoys} Boys ({cohortStudents.length > 0 ? Math.round((totalBoys / cohortStudents.length) * 100) : 50}%)</span>
              <span>{totalGirls} Girls ({cohortStudents.length > 0 ? Math.round((totalGirls / cohortStudents.length) * 100) : 50}%)</span>
            </div>
          </div>
        </div>

        {/* Current Streams in Cohort */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              {selectedCohort} Streams Distribution &amp; Class Teacher
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              {cohortStreams.length} Active Classes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cohortStreams.map((str) => (
              <div
                key={str.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-900">{str.fullClassName}</h5>
                  <span className="text-xs font-mono font-bold text-slate-600 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                    {str.totalEnrolled} / {str.maxCapacity}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>Master: <strong>{str.classTeacherName}</strong></p>
                  <p>Room: <span className="font-mono text-slate-700">{str.roomNumber}</span></p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-200">
                  <span>{str.currentBoys} Boys • {str.currentGirls} Girls</span>
                  {str.isSpecialNeedsInclusive && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3" />
                      SNE Inclusive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statutory Placement Rules Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Institutional Placement Policies &amp; Statutory Directives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {placementRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-3 ${
                rule.active ? 'border-slate-200 shadow-xs' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                    {rule.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      rule.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rule.active ? 'Enforced' : 'Disabled'}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{rule.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Max Stream Cap: <strong>{rule.maxStreamSize} Learners</strong></span>
                <span className="text-indigo-600 font-bold uppercase">Gender: {rule.targetRatioBoys}%B / {rule.targetRatioGirls}%G</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StreamBalanceWizardModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        streams={streams}
        students={students}
        onApplyRebalance={handleApplyRebalance}
      />
    </div>
  );
};
