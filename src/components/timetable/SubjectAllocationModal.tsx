import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SubjectAllocationConfig } from '../../types/streamTimetableGovernance';
import { streamTimetableGovernanceService } from '../../services/streamTimetableGovernanceService';
import { AVAILABLE_SUBJECTS } from '../../data/mockData';

interface SubjectAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocationsUpdated?: (allocations: SubjectAllocationConfig[]) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const SubjectAllocationModal: React.FC<SubjectAllocationModalProps> = ({
  isOpen,
  onClose,
  onAllocationsUpdated,
  onLogAudit,
}) => {
  const [allocations, setAllocations] = useState<SubjectAllocationConfig[]>(() =>
    streamTimetableGovernanceService.getSubjectAllocations()
  );

  const [selectedGrade, setSelectedGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 8');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [subjectName, setSubjectName] = useState(AVAILABLE_SUBJECTS[0] || 'Mathematics');
  const [frequency, setFrequency] = useState<number>(4);
  const [doubleLessons, setDoubleLessons] = useState<number>(1);
  const [isPractical, setIsPractical] = useState<boolean>(false);
  const [isCompulsory, setIsCompulsory] = useState<boolean>(true);
  const [roomType, setRoomType] = useState<SubjectAllocationConfig['specialRoomType']>('Classroom');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: SubjectAllocationConfig = {
      id: `sa-${Date.now()}`,
      gradeLevel: selectedGrade,
      subjectName,
      weeklyFrequency: Number(frequency) || 4,
      doubleLessonsCount: Number(doubleLessons) || 0,
      isPractical,
      isCompulsory,
      specialRoomType: roomType,
    };

    const updated = [newConfig, ...allocations];
    streamTimetableGovernanceService.saveSubjectAllocations(updated);
    setAllocations(updated);
    if (onAllocationsUpdated) onAllocationsUpdated(updated);
    setShowAddForm(false);

    if (onLogAudit) {
      onLogAudit(
        'SUBJECT_ALLOCATION_CONFIGURED',
        `Director of Academics configured ${subjectName} for ${selectedGrade} with frequency ${frequency}/wk (Compulsory: ${isCompulsory}).`
      );
    }
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove allocation rule for ${name}?`)) {
      const updated = allocations.filter((a) => a.id !== id);
      streamTimetableGovernanceService.saveSubjectAllocations(updated);
      setAllocations(updated);
      if (onAllocationsUpdated) onAllocationsUpdated(updated);

      if (onLogAudit) {
        onLogAudit('SUBJECT_ALLOCATION_REMOVED', `Director of Academics removed allocation rule for ${name}.`);
      }
    }
  };

  const filtered = allocations.filter((a) => a.gradeLevel === selectedGrade);
  const totalWeeklyPeriods = filtered.reduce((acc, curr) => acc + curr.weeklyFrequency, 0);

  return (
    <div
      id="subject-allocation-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Subject Allocation &amp; Curriculum Quotas Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Requirement §3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Set weekly lesson frequencies, double lessons, practicals, and compulsory curriculum slots
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Grade Level Selector & Quota Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Select Grade:</span>
              <div className="flex gap-1.5">
                {(['Grade 7', 'Grade 8', 'Grade 9'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedGrade === g
                        ? 'bg-[#C51E28] text-white shadow-md shadow-red-950/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-black text-amber-400">{totalWeeklyPeriods} Total Weekly Periods</div>
              <div className="text-[10px] text-slate-400">Standard CBC Matrix: 40-45 periods/wk</div>
            </div>
          </div>

          {/* Add Subject Allocation Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>{showAddForm ? 'Cancel Form' : `Add Allocation Rule for ${selectedGrade}`}</span>
            </button>
          </div>

          {/* Form */}
          {showAddForm && (
            <form
              onSubmit={handleAdd}
              className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 animate-in fade-in"
            >
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Define Subject Allocation for {selectedGrade} (§3)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subject</label>
                  <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                  >
                    {AVAILABLE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Weekly Frequency</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Double Lessons / Wk</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={doubleLessons}
                    onChange={(e) => setDoubleLessons(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Specialized Facility Required</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Classroom">Standard Classroom</option>
                    <option value="Science Lab">Science Laboratory</option>
                    <option value="Computer Lab">Computer Laboratory</option>
                    <option value="Workshop">Technical Workshop</option>
                    <option value="Home Science Room">Home Science Studio</option>
                    <option value="Library">Library</option>
                    <option value="Sports Facility">Sports Field / Complex</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPractical}
                      onChange={(e) => setIsPractical(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>CBC Practical Lesson</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isCompulsory}
                      onChange={(e) => setIsCompulsory(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>Compulsory Subject</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-700">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Allocation Rule</span>
                </button>
              </div>
            </form>
          )}

          {/* Allocation List Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-850">
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Current Allocation Matrix for {selectedGrade} ({filtered.length} Subjects)</span>
              <span className="text-[10px] text-slate-500 font-normal">KICD Approved Curriculum Quotas</span>
            </div>

            <div className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-white">{item.subjectName}</strong>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.isCompulsory
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.isCompulsory ? 'Compulsory' : 'Elective'}
                      </span>
                      {item.isPractical && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                          Practical
                        </span>
                      )}
                      {item.specialRoomType && item.specialRoomType !== 'Classroom' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                          {item.specialRoomType}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>Double Lessons: </span>
                      <strong className="text-slate-200">
                        {item.doubleLessonsCount > 0 ? `${item.doubleLessonsCount} per week` : 'None'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-400">
                        {item.weeklyFrequency} lessons/week
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.weeklyFrequency * 40} mins teaching time
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.subjectName)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                      title="Delete Allocation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            The Director of Academics governs subject allocations, lesson frequency, and double periods (§3).
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close Subject Hub
          </button>
        </div>
      </div>
    </div>
  );
};
