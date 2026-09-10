import React from 'react';
import {
  X,
  BookOpen,
  User as UserIcon,
  Clock,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TimetableLesson } from '../../types/timetable';
import { SUBJECT_COLOR_MAP } from '../../data/timetableData';
import { User } from '../../types';

interface LessonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: TimetableLesson | null;
  onRequestEdit?: () => void;
  currentUser?: User;
}

export const LessonDetailsModal: React.FC<LessonDetailsModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onRequestEdit,
  currentUser: _currentUser,
}) => {
  if (!isOpen || !lesson) return null;

  const colorConfig = SUBJECT_COLOR_MAP[lesson.subject] || SUBJECT_COLOR_MAP['Free'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 space-y-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{lesson.subject}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {lesson.className} • {lesson.day} • Period {lesson.periodNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Governance Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px]">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-amber-200">
            <strong className="text-white block font-bold">Read-Only Timetable Allocation View</strong>
            Only the <strong className="text-white">Director of Academics</strong> is authorized to reallocate periods, assign teachers, or modify learning areas.
          </div>
        </div>

        {/* Lesson Details */}
        <div className="space-y-2.5 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> Assigned Teacher:
            </span>
            <span className="font-bold text-white">{lesson.teacherName} ({lesson.teacherInitials})</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Day & Period:
            </span>
            <span className="font-bold text-white">{lesson.day}, Period {lesson.periodNumber}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Stream / Class:
            </span>
            <span className="font-bold text-white">{lesson.className}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lesson Type:
            </span>
            <span className="font-bold text-white">
              {lesson.isDouble ? 'Double Period (Lab/Practical)' : 'Single Lesson (45 Mins)'}
            </span>
          </div>

          {lesson.notes && (
            <div className="pt-1">
              <span className="text-slate-400 block font-medium mb-1">Room / Syllabus Note:</span>
              <p className="text-slate-200 italic bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-[11px]">
                {lesson.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono">
            ID: {lesson.id}
          </span>
          <div className="flex items-center gap-2">
            {onRequestEdit && (
              <button
                type="button"
                onClick={onRequestEdit}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Request Edit Access</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
