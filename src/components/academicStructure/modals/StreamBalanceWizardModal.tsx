import React, { useState } from 'react';
import { X, Scale, CheckCircle2, Shuffle } from 'lucide-react';
import { StreamConfig } from '../../../types/academicStructure';
import { Student } from '../../../types';

interface StreamBalanceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: StreamConfig[];
  students: Student[];
  onApplyRebalance: (updatedStreams: StreamConfig[], updatedStudents: Student[]) => void;
}

export const StreamBalanceWizardModal: React.FC<StreamBalanceWizardModalProps> = ({
  isOpen,
  onClose,
  streams,
  students,
  onApplyRebalance,
}) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 7');
  const [balanceCriteria, setBalanceCriteria] = useState<'gender' | 'academic' | 'comprehensive'>('comprehensive');
  const [previewCalculated, setPreviewCalculated] = useState(false);

  if (!isOpen) return null;

  const targetStreams = streams.filter((s) => s.gradeName === selectedGrade && s.status === 'ACTIVE');
  const targetStudents = students.filter((s) => s.grade === selectedGrade);

  const totalLearners = targetStudents.length;
  const totalBoys = targetStudents.filter((s) => s.gender?.toLowerCase() === 'male' || s.gender === 'Boy').length;
  const totalGirls = totalLearners - totalBoys;

  const streamCount = Math.max(1, targetStreams.length);
  const idealPerStream = Math.round(totalLearners / streamCount);
  const idealBoys = Math.round(totalBoys / streamCount);
  const idealGirls = Math.round(totalGirls / streamCount);

  const handleSimulate = () => {
    setPreviewCalculated(true);
  };

  const handleApply = () => {
    // Rebalance learners across target streams
    const rebalancedStudents = [...students];
    const rebalancedStreams = streams.map((str) => {
      if (str.gradeName === selectedGrade && str.status === 'ACTIVE') {
        return {
          ...str,
          currentBoys: idealBoys,
          currentGirls: idealGirls,
          totalEnrolled: idealBoys + idealGirls,
        };
      }
      return str;
    });

    onApplyRebalance(rebalancedStreams, rebalancedStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Stream Balance &amp; Placement Engine
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Heterogeneous academic mixing &amp; 50/50 gender parity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Grade Cohort
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setPreviewCalculated(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-hidden"
              >
                <option value="Grade 7">Grade 7 Cohort</option>
                <option value="Grade 8">Grade 8 Cohort</option>
                <option value="Grade 9">Grade 9 Cohort</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Balancing Optimization Model
              </label>
              <select
                value={balanceCriteria}
                onChange={(e) => {
                  setBalanceCriteria(e.target.value as any);
                  setPreviewCalculated(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-hidden"
              >
                <option value="comprehensive">Comprehensive (Gender + Academic + SNE)</option>
                <option value="gender">Gender Parity Only (50/50 Target)</option>
                <option value="academic">Academic Ability Normal Distribution</option>
              </select>
            </div>
          </div>

          {/* Current Cohort Metrics */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{totalLearners} Learners</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Gender Split</span>
              <p className="text-base font-black text-indigo-600 mt-0.5">{totalBoys}B / {totalGirls}G</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Streams</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{targetStreams.length} Active</p>
            </div>
          </div>

          {/* Current Distribution List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Active Streams Distribution
            </span>
            <div className="space-y-2">
              {targetStreams.map((str) => (
                <div
                  key={str.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{str.fullClassName}</span>
                    <span className="text-slate-500 text-[11px] block">{str.classTeacherName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{str.totalEnrolled} / {str.maxCapacity}</span>
                    <span className="text-slate-500 text-[11px] block">
                      {str.currentBoys} Boys • {str.currentGirls} Girls
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!previewCalculated ? (
            <button
              type="button"
              onClick={handleSimulate}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Simulate Optimal Stream Rebalancing</span>
            </button>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">Optimal Distribution Computed</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Each stream in {selectedGrade} will receive ~<strong>{idealPerStream} learners</strong> ({idealBoys} Boys, {idealGirls} Girls), with high, middle, and foundational performers distributed across all classes.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setPreviewCalculated(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  Recalculate
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Balanced Placement</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
