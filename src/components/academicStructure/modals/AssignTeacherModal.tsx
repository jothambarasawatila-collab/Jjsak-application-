import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { StreamConfig, SubjectDefinition, TeacherSubjectAllocation } from '../../../types/academicStructure';
import { Teacher } from '../../../types';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocation: TeacherSubjectAllocation) => void;
  streams: StreamConfig[];
  subjects: SubjectDefinition[];
  teachers: Teacher[];
  initialStreamId?: string;
  initialSubjectId?: string;
  existingAllocations: TeacherSubjectAllocation[];
}

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  streams,
  subjects,
  teachers,
  initialStreamId,
  initialSubjectId,
  existingAllocations,
}) => {
  const [streamId, setStreamId] = useState(initialStreamId || (streams[0]?.id || ''));
  const [subjectId, setSubjectId] = useState(initialSubjectId || (subjects[0]?.id || ''));
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || 't1');
  const [allocatedRoom, setAllocatedRoom] = useState('');

  if (!isOpen) return null;

  const selectedStream = streams.find((s) => s.id === streamId) || streams[0];
  const selectedSubject = subjects.find((sub) => sub.id === subjectId) || subjects[0];
  const selectedTeacher = teachers.find((t) => t.id === teacherId) || teachers[0];

  // Calculate teacher's existing workload
  const teacherCurrentPeriods = existingAllocations
    .filter((a) => a.teacherId === teacherId)
    .reduce((sum, a) => sum + (a.lessonsPerWeek || 0), 0);

  const subjectLessons = selectedSubject ? selectedSubject.lessonsPerWeek : 4;
  const projectedTotalPeriods = teacherCurrentPeriods + subjectLessons;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStream || !selectedSubject || !selectedTeacher) return;

    const newAllocation: TeacherSubjectAllocation = {
      id: `tsa-${Date.now()}`,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      subjectId: selectedSubject.id,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      streamId: selectedStream.id,
      fullClassName: selectedStream.fullClassName,
      gradeName: selectedStream.gradeName,
      lessonsPerWeek: selectedSubject.lessonsPerWeek,
      allocatedRoom: allocatedRoom.trim() || selectedStream.roomNumber,
      academicYear: 2026,
      termNumber: 2,
      assignedBy: 'Academic Dean / Headteacher',
      assignedAt: new Date().toISOString().split('T')[0],
      status: 'CONFIRMED',
    };

    onSave(newAllocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Allocate Teacher to Subject
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Teaching period distribution & stream mapping
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Target Class Stream *
            </label>
            <select
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {streams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullClassName} ({s.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Learning Area / Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code}) — {sub.lessonsPerWeek} Lessons/wk [{sub.department}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Assign Teacher *
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department || 'Academic'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Specialized Room / Lab Location (Optional)
            </label>
            <input
              type="text"
              placeholder={selectedStream?.roomNumber || 'e.g. Science Laboratory'}
              value={allocatedRoom}
              onChange={(e) => setAllocatedRoom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Workload Impact Preview Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Current Teacher Load:</span>
              <span className="font-bold text-slate-800">{teacherCurrentPeriods} Periods / Wk</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">This Subject Load:</span>
              <span className="font-bold text-indigo-600">+{subjectLessons} Periods / Wk</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-800">Projected Total Load:</span>
              <span
                className={`font-black ${
                  projectedTotalPeriods > 28
                    ? 'text-rose-600'
                    : projectedTotalPeriods >= 22
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {projectedTotalPeriods} Periods / Wk
              </span>
            </div>

            {projectedTotalPeriods > 28 && (
              <div className="flex items-start gap-1.5 p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Workload Warning:</strong> Exceeds TSC standard maximum limit of 28 periods/week.
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Allocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
