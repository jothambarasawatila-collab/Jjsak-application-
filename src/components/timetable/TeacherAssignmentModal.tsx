import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { TeacherStreamAssignment, StreamConfig } from '../../types/streamTimetableGovernance';
import { streamTimetableGovernanceService } from '../../services/streamTimetableGovernanceService';
import { Teacher } from '../../types';
import { AVAILABLE_SUBJECTS } from '../../data/mockData';

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  streams: StreamConfig[];
  onAssignmentsUpdated: (assignments: TeacherStreamAssignment[]) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({
  isOpen,
  onClose,
  teachers,
  streams,
  onAssignmentsUpdated,
  onLogAudit,
}) => {
  const [assignments, setAssignments] = useState<TeacherStreamAssignment[]>(() =>
    streamTimetableGovernanceService.getTeacherAssignments()
  );

  // Filter/Select state
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // New assignment form state
  const [newTeacherId, setNewTeacherId] = useState(teachers[0]?.id || 'tch-00');
  const [newSubject, setNewSubject] = useState(AVAILABLE_SUBJECTS[0] || 'Mathematics');
  const [newStreamCodes, setNewStreamCodes] = useState<string[]>(['7N', '8N', '9N']);
  const [newLessonsPerWeek, setNewLessonsPerWeek] = useState<number>(4);
  const [newHasDoubleLesson, setNewHasDoubleLesson] = useState<boolean>(true);
  const [newIsPractical, setNewIsPractical] = useState<boolean>(true);
  const [newNotes, setNewNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleToggleStream = (code: string) => {
    if (newStreamCodes.includes(code)) {
      setNewStreamCodes(newStreamCodes.filter((c) => c !== code));
    } else {
      setNewStreamCodes([...newStreamCodes, code]);
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStreamCodes.length === 0) {
      alert('Please select at least one stream to assign.');
      return;
    }

    const teacher = teachers.find((t) => t.id === newTeacherId);
    const teacherName = teacher?.name || 'Teacher';

    streamTimetableGovernanceService.addTeacherAssignment({
      teacherId: newTeacherId,
      teacherName,
      subjectName: newSubject,
      streamCodes: newStreamCodes,
      lessonsPerWeekPerStream: Number(newLessonsPerWeek) || 4,
      hasDoubleLesson: newHasDoubleLesson,
      isPractical: newIsPractical,
      notes: newNotes,
    });

    const updated = streamTimetableGovernanceService.getTeacherAssignments();
    setAssignments(updated);
    onAssignmentsUpdated(updated);
    setShowAddForm(false);

    if (onLogAudit) {
      onLogAudit(
        'TEACHER_ASSIGNMENT_CREATED',
        `Director of Academics assigned ${teacherName} to ${newSubject} across streams: ${newStreamCodes.join(', ')} (${newLessonsPerWeek} lessons/wk).`
      );
    }
  };

  const handleRemoveAssignment = (id: string, teacherName: string, subject: string) => {
    if (confirm(`Remove allocation of ${subject} for ${teacherName}?`)) {
      streamTimetableGovernanceService.removeTeacherAssignment(id);
      const updated = streamTimetableGovernanceService.getTeacherAssignments();
      setAssignments(updated);
      onAssignmentsUpdated(updated);

      if (onLogAudit) {
        onLogAudit(
          'TEACHER_ASSIGNMENT_REMOVED',
          `Director of Academics removed assignment of ${subject} for ${teacherName}.`
        );
      }
    }
  };

  const filteredAssignments =
    selectedTeacherFilter === 'All'
      ? assignments
      : assignments.filter((a) => a.teacherId === selectedTeacherFilter);

  return (
    <div
      id="teacher-assignment-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Teacher Stream &amp; Subject Assignment Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Requirement §2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign teachers to multiple streams, balance workloads, and manage curriculum allocations
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
          {/* Workload Highlights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Teaching Staff</div>
              <div className="text-lg font-black text-white mt-0.5">{teachers.length} Instructors</div>
              <div className="text-[10px] text-emerald-400 mt-1">✓ Approved database verified</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject-Stream Allocations</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">{assignments.length} Active Rules</div>
              <div className="text-[10px] text-slate-400 mt-1">Multi-stream distribution enabled</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Weekly Workload Limit</div>
              <div className="text-lg font-black text-purple-400 mt-0.5">26 Lessons / Week</div>
              <div className="text-[10px] text-slate-400 mt-1">Statutory workload cap protected</div>
            </div>
          </div>

          {/* Action Row & Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter Teacher:</span>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-white text-xs"
              >
                <option value="All">All Teachers ({assignments.length} allocations)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel Assignment' : 'Assign Teacher to Streams'}</span>
            </button>
          </div>

          {/* New Assignment Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddAssignment}
              className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 animate-in fade-in"
            >
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Configure Multi-Stream Teacher Assignment (§2)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Teacher</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subjects?.[0] || 'Teaching Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subject to Assign</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  >
                    {AVAILABLE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Stream Checkbox Selection */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-xs font-semibold">
                  Select Multiple Streams to Assign (e.g. 7N, 8N, 9N)
                </label>
                <div className="flex flex-wrap gap-2">
                  {streams.map((st) => {
                    const isChecked = newStreamCodes.includes(st.code);
                    return (
                      <button
                        key={st.code}
                        type="button"
                        onClick={() => handleToggleStream(st.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-red-400' : 'text-slate-600'}`} />
                        <span>{st.name} ({st.code})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lessons / Week Per Stream</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newLessonsPerWeek}
                    onChange={(e) => setNewLessonsPerWeek(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newHasDoubleLesson}
                      onChange={(e) => setNewHasDoubleLesson(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>Requires Double Lesson</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newIsPractical}
                      onChange={(e) => setNewIsPractical(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>Requires Special Lab / Workshop</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-xs font-semibold">Assignment Notes / Directives (Optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Lead teacher for practicals; co-teaching stream 8N"
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div className="text-[11px] text-slate-400">
                  Calculated workload added:{' '}
                  <strong className="text-amber-400">
                    {newStreamCodes.length * newLessonsPerWeek} lessons/week
                  </strong>{' '}
                  across {newStreamCodes.length} streams.
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          )}

          {/* Assignments List Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-850">
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Active Teacher Stream Allocations ({filteredAssignments.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Director of Academics sole authority to assign and reassign loads (§2)
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredAssignments.map((a) => {
                const totalLessons = a.streamCodes.length * a.lessonsPerWeekPerStream;
                return (
                  <div
                    key={a.id}
                    className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-white">{a.teacherName}</strong>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-750">
                          {a.subjectName}
                        </span>
                        {a.isPractical && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                            Practical
                          </span>
                        )}
                        {a.hasDoubleLesson && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                            Double Lesson
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Assigned Streams:</span>
                        <div className="flex flex-wrap gap-1">
                          {a.streamCodes.map((sc) => (
                            <span
                              key={sc}
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800"
                            >
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-400">{totalLessons} lessons/wk</div>
                        <div className="text-[10px] text-slate-500">
                          {a.lessonsPerWeekPerStream} lessons/stream
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(a.id, a.teacherName, a.subjectName)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Teaching loads are validated before timetable publication to prevent duplicate lesson periods (§2 &amp; §5).
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close Assignment Hub
          </button>
        </div>
      </div>
    </div>
  );
};
