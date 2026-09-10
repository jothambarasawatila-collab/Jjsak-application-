import React, { useState } from 'react';
import {
  X,
  Layers,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StreamConfig } from '../../types/streamTimetableGovernance';
import { streamTimetableGovernanceService } from '../../services/streamTimetableGovernanceService';
import { Teacher } from '../../types';

interface StreamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onStreamsUpdated: (streams: StreamConfig[]) => void;
  onLogAudit?: (action: string, details: string) => void;
  onGenerateStreamTimetable?: (streamCode: string) => void;
}

export const StreamManagementModal: React.FC<StreamManagementModalProps> = ({
  isOpen,
  onClose,
  teachers,
  onStreamsUpdated,
  onLogAudit,
  onGenerateStreamTimetable,
}) => {
  const [streams, setStreams] = useState<StreamConfig[]>(() =>
    streamTimetableGovernanceService.getStreams()
  );

  // Form for new stream
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 8');
  const [newStreamName, setNewStreamName] = useState('East');
  const [newLearnerCount, setNewLearnerCount] = useState<number>(40);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers.length > 0 ? teachers[0].id : 'tch-01'
  );

  if (!isOpen) return null;

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeDigit = newGrade.replace('Grade ', '');
    const streamInitial = newStreamName.charAt(0).toUpperCase();
    const code = `${gradeDigit}${streamInitial}`;
    const name = `${newGrade} ${newStreamName}`;

    const teacher = teachers.find((t) => t.id === selectedTeacherId);

    streamTimetableGovernanceService.addStream({
      code,
      name,
      gradeLevel: newGrade,
      streamName: newStreamName,
      classTeacherId: teacher?.id,
      classTeacherName: teacher?.name,
      homeRoomName: `Junior Block (${code})`,
      learnerCount: Number(newLearnerCount) || 40,
      isActive: true,
    });

    const updated = streamTimetableGovernanceService.getStreams();
    setStreams(updated);
    onStreamsUpdated(updated);
    setShowAddForm(false);

    if (onLogAudit) {
      onLogAudit(
        'STREAM_CREATED',
        `Director of Academics configured new stream ${name} (${code}) with Class Teacher ${teacher?.name || 'Unassigned'}.`
      );
    }
  };

  const handleToggleStreamActive = (stream: StreamConfig) => {
    const updatedStream = { ...stream, isActive: !stream.isActive };
    streamTimetableGovernanceService.updateStream(updatedStream);
    const updated = streamTimetableGovernanceService.getStreams();
    setStreams(updated);
    onStreamsUpdated(updated);
  };

  return (
    <div
      id="stream-management-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Stream Timetable Creation &amp; Management Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Director Authority (§1)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure official teaching streams (7N, 7S, 8N, 8S, 9N, 9S &amp; Custom Additions)
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
          {/* Summary / Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-850 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Configured Institutional Streams</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total {streams.length} active streams eligible for automated master and stream-level timetable scheduling.
              </p>
            </div>

            <button
              type="button"
              id="btn-add-new-stream"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel New Stream' : 'Add New Stream'}</span>
            </button>
          </div>

          {/* New Stream Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddStream}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 animate-in fade-in"
            >
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Register Additional Class Stream (§1)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Grade Level</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Stream Designation</label>
                  <input
                    type="text"
                    required
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    placeholder="e.g. East, West, Central"
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Class Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Learner Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={newLearnerCount}
                    onChange={(e) => setNewLearnerCount(Number(e.target.value) || 40)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Stream Code generated:{' '}
                  <strong className="text-amber-400">
                    {newGrade.replace('Grade ', '')}
                    {newStreamName.charAt(0).toUpperCase()}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Stream to Database</span>
                </button>
              </div>
            </form>
          )}

          {/* Stream Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {streams.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400 font-black text-xs flex items-center justify-center">
                        {s.code}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.name}</h4>
                        <span className="text-[10px] text-slate-400">{s.gradeLevel}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.isActive
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span>Class Teacher:</span>
                      <strong className="text-slate-200">{s.classTeacherName || 'Pending'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Home Room:</span>
                      <strong className="text-slate-200 truncate max-w-[170px]">
                        {s.homeRoomName || 'Standard Classroom'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enrolled Learners:</span>
                      <strong className="text-amber-400">{s.learnerCount} students</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-xs">
                  {onGenerateStreamTimetable ? (
                    <button
                      type="button"
                      onClick={() => {
                        onGenerateStreamTimetable(s.code);
                        onClose();
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate Layout</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleStreamActive(s)}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {s.isActive ? 'Archive Stream' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Director of Academics is the sole authority for creating and maintaining institutional streams (§1).
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close Stream Hub
          </button>
        </div>
      </div>
    </div>
  );
};
