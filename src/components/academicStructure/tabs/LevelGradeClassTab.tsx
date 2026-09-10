import React, { useState } from 'react';
import {
  School,
  Users,
  Plus,
  Edit2,
  Trash2,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  LearningLevelConfig,
  GradeConfig,
  StreamConfig,
} from '../../../types/academicStructure';
import { Teacher } from '../../../types';
import { AddEditStreamModal } from '../modals/AddEditStreamModal';
import { StreamBalanceWizardModal } from '../modals/StreamBalanceWizardModal';

interface LevelGradeClassTabProps {
  levels?: LearningLevelConfig[];
  grades: GradeConfig[];
  streams: StreamConfig[];
  teachers: Teacher[];
  students: any[];
  onUpdateStreams: (streams: StreamConfig[]) => void;
  onUpdateGrades?: (grades: GradeConfig[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const LevelGradeClassTab: React.FC<LevelGradeClassTabProps> = ({
  grades,
  streams,
  teachers,
  students,
  onUpdateStreams,
  onLogAudit,
}) => {
  const [selectedGradeName, setSelectedGradeName] = useState<string>('All');
  const [isAddStreamModalOpen, setIsAddStreamModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<StreamConfig | null>(null);

  const filteredStreams = selectedGradeName === 'All'
    ? streams
    : streams.filter((s) => s.gradeName === selectedGradeName);

  const totalEnrollment = streams.reduce((sum, s) => sum + s.totalEnrolled, 0);
  const totalCapacity = streams.reduce((sum, s) => sum + s.maxCapacity, 0);
  const capacityUtilization = Math.round((totalEnrollment / (totalCapacity || 1)) * 100);

  const handleSaveStream = (stream: StreamConfig) => {
    const isEdit = streams.some((s) => s.id === stream.id);
    let updated: StreamConfig[];
    if (isEdit) {
      updated = streams.map((s) => (s.id === stream.id ? stream : s));
      onLogAudit?.(
        'STREAM_MODIFIED',
        `Updated configuration for stream ${stream.fullClassName}.`,
        undefined,
        stream.fullClassName
      );
    } else {
      updated = [...streams, stream];
      onLogAudit?.(
        'STREAM_CREATED',
        `Created new academic stream ${stream.fullClassName} (${stream.roomNumber}).`,
        undefined,
        stream.fullClassName
      );
    }
    onUpdateStreams(updated);
    setEditingStream(null);
  };

  const handleDeleteStream = (streamId: string) => {
    const target = streams.find((s) => s.id === streamId);
    if (!target) return;
    if (confirm(`Are you sure you want to delete or archive stream "${target.fullClassName}"?`)) {
      const updated = streams.filter((s) => s.id !== streamId);
      onUpdateStreams(updated);
      onLogAudit?.(
        'STREAM_DELETED',
        `Archived/Removed class stream ${target.fullClassName}.`,
        target.fullClassName,
        undefined
      );
    }
  };

  const handleApplyRebalance = (rebalancedStreams: StreamConfig[]) => {
    onUpdateStreams(rebalancedStreams);
    onLogAudit?.(
      'LEARNER_STREAM_PLACEMENT',
      'Rebalanced cohort distribution across active streams for optimal gender and academic parity.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Total Active Streams</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{streams.length} Streams</span>
              <span className="text-xs text-indigo-600 font-bold">JSS Grades 7–9</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Enrolled Learners</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{totalEnrollment}</span>
              <span className="text-xs text-slate-400">/ {totalCapacity} Cap</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Classroom Utilization</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{capacityUtilization}%</span>
              <span className="text-xs text-amber-600 font-bold">Optimal</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Learning Levels</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">3 JSS Grades</span>
              <span className="text-xs text-purple-600 font-bold">CBC Cycle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Configurations Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Junior Secondary School (JSS) Grade Cohort Structures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {grade.numericLevel}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{grade.gradeName}</h4>
                    <span className="text-[11px] text-slate-500">
                      Age Range: {grade.ageBracket}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700">
                  {grade.streamsCount} Streams
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Grade Dean:</span>
                  <strong className="text-slate-800">{grade.coordinatorName}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Assessment Level:</span>
                  <span className="font-mono text-indigo-600 font-bold">{grade.levelCode}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Enrolled:</span>
                  <strong className="text-slate-900">{grade.currentEnrollment} Learners</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streams Header with Filter and Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Filter Grade:</span>
            {['All', 'Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setSelectedGradeName(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedGradeName === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBalanceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Balance Cohorts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingStream(null);
                setIsAddStreamModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class Stream</span>
            </button>
          </div>
        </div>

        {/* Streams Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStreams.map((stream) => {
            const boyPct = stream.totalEnrolled > 0 ? Math.round((stream.currentBoys / stream.totalEnrolled) * 100) : 50;
            const girlPct = 100 - boyPct;
            const isFull = stream.totalEnrolled >= stream.maxCapacity;

            return (
              <div
                key={stream.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                        {stream.gradeName}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {stream.fullClassName}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        {stream.roomNumber} • {stream.buildingWing}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStream(stream);
                          setIsAddStreamModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStream(stream.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Class Teacher Badge */}
                  <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-950">
                      <span className="text-slate-500 font-medium">Class Master / Mistress:</span>
                      <strong className="font-bold">{stream.classTeacherName}</strong>
                    </div>
                    {stream.assistantClassTeacherName && (
                      <div className="flex items-center justify-between text-indigo-900 text-[11px]">
                        <span className="text-slate-400">Assistant:</span>
                        <span>{stream.assistantClassTeacherName}</span>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Progress Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Enrollment ({stream.totalEnrolled}/{stream.maxCapacity})
                      </span>
                      <span className={isFull ? 'text-rose-600' : 'text-emerald-600'}>
                        {Math.round((stream.totalEnrolled / stream.maxCapacity) * 100)}% Cap
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{ width: `${boyPct}%` }}
                        title={`Boys: ${stream.currentBoys} (${boyPct}%)`}
                      />
                      <div
                        className="bg-purple-500 h-full transition-all duration-500"
                        style={{ width: `${girlPct}%` }}
                        title={`Girls: ${stream.currentGirls} (${girlPct}%)`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-indigo-700">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        {stream.currentBoys} Boys ({boyPct}%)
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-purple-700">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        {stream.currentGirls} Girls ({girlPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Leader: <strong>{stream.classRepStudentName || 'Pending Appointment'}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {stream.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddEditStreamModal
        isOpen={isAddStreamModalOpen}
        onClose={() => {
          setIsAddStreamModalOpen(false);
          setEditingStream(null);
        }}
        onSave={handleSaveStream}
        initialStream={editingStream}
        teachers={teachers}
      />

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
