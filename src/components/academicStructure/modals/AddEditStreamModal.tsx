import React, { useState } from 'react';
import { X, School, CheckCircle2 } from 'lucide-react';
import { StreamConfig } from '../../../types/academicStructure';
import { Teacher } from '../../../types';

interface AddEditStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stream: StreamConfig) => void;
  initialStream?: StreamConfig | null;
  teachers: Teacher[];
}

const GRADES = ['Grade 7', 'Grade 8', 'Grade 9'];

export const AddEditStreamModal: React.FC<AddEditStreamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStream,
  teachers,
}) => {
  const [gradeName, setGradeName] = useState(initialStream?.gradeName || 'Grade 7');
  const [streamName, setStreamName] = useState(initialStream?.streamName || '');
  const [classTeacherStaffId, setClassTeacherStaffId] = useState(
    initialStream?.classTeacherStaffId || (teachers[0]?.id || 't1')
  );
  const [assistantClassTeacherStaffId, setAssistantClassTeacherStaffId] = useState(
    initialStream?.assistantClassTeacherStaffId || ''
  );
  const [roomNumber, setRoomNumber] = useState(initialStream?.roomNumber || 'Room JSS-101');
  const [buildingWing, setBuildingWing] = useState(initialStream?.buildingWing || 'Main Academic Block');
  const [maxCapacity, setMaxCapacity] = useState(initialStream?.maxCapacity || 45);
  const [currentBoys, setCurrentBoys] = useState(initialStream?.currentBoys || 25);
  const [currentGirls, setCurrentGirls] = useState(initialStream?.currentGirls || 25);
  const [status, setStatus] = useState<'ACTIVE' | 'COMBINED' | 'INACTIVE'>(
    initialStream?.status || 'ACTIVE'
  );
  const [classRepStudentName, setClassRepStudentName] = useState(
    initialStream?.classRepStudentName || ''
  );
  const [isSpecialNeedsInclusive, setIsSpecialNeedsInclusive] = useState(
    initialStream ? initialStream.isSpecialNeedsInclusive : true
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryTeacher = teachers.find((t) => t.id === classTeacherStaffId);
    const assistantTeacher = teachers.find((t) => t.id === assistantClassTeacherStaffId);

    const fullClassName = `${gradeName} ${streamName.trim()}`;

    const streamData: StreamConfig = {
      id: initialStream?.id || `strm-${gradeName.toLowerCase().replace(/\s+/g, '-')}-${streamName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      gradeName,
      streamName: streamName.trim(),
      fullClassName,
      classTeacherName: primaryTeacher?.name || initialStream?.classTeacherName || 'Assigned Teacher',
      classTeacherStaffId,
      assistantClassTeacherName: assistantTeacher?.name || undefined,
      assistantClassTeacherStaffId: assistantClassTeacherStaffId || undefined,
      roomNumber: roomNumber.trim(),
      buildingWing: buildingWing.trim(),
      maxCapacity: Number(maxCapacity),
      currentBoys: Number(currentBoys),
      currentGirls: Number(currentGirls),
      totalEnrolled: Number(currentBoys) + Number(currentGirls),
      status,
      classRepStudentName: classRepStudentName.trim() || undefined,
      isSpecialNeedsInclusive,
    };

    onSave(streamData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {initialStream ? 'Edit Class Stream' : 'Add New Class Stream'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cohort configuration & rooming allocation
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Grade Level *
              </label>
              <select
                value={gradeName}
                onChange={(e) => setGradeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stream Name / Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. East, West, Alpha"
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Class Teacher *
              </label>
              <select
                value={classTeacherStaffId}
                onChange={(e) => setClassTeacherStaffId(e.target.value)}
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
                Assistant Class Teacher (Optional)
              </label>
              <select
                value={assistantClassTeacherStaffId}
                onChange={(e) => setAssistantClassTeacherStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="">None / Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Allocated Room / Class *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room JSS-101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Building Wing / Location
              </label>
              <input
                type="text"
                placeholder="e.g. East Academic Block"
                value={buildingWing}
                onChange={(e) => setBuildingWing(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Boys Count
              </label>
              <input
                type="number"
                min="0"
                value={currentBoys}
                onChange={(e) => setCurrentBoys(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Girls Count
              </label>
              <input
                type="number"
                min="0"
                value={currentGirls}
                onChange={(e) => setCurrentGirls(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Class Representative (Student Leader)
              </label>
              <input
                type="text"
                placeholder="e.g. Victor Omondi"
                value={classRepStudentName}
                onChange={(e) => setClassRepStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stream Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="ACTIVE">Active Stream</option>
                <option value="COMBINED">Combined / Merged</option>
                <option value="INACTIVE">Inactive / Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">
                Special Needs Inclusive Classroom
              </span>
              <span className="text-[11px] text-indigo-700">
                Equipped with wheelchair accessibility and adaptive materials
              </span>
            </div>
            <input
              type="checkbox"
              checked={isSpecialNeedsInclusive}
              onChange={(e) => setIsSpecialNeedsInclusive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md"
            />
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
              <span>{initialStream ? 'Update Stream' : 'Create Stream'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
