import React from 'react';
import {
  Calendar,
  Users,
  Building,
  BookOpen,
  AlertTriangle,
  Zap,
  Layers,
  CalendarCheck,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { TimetableEfficiencyMetrics } from '../../types/timetable';

interface TimetableDashboardCardsProps {
  metrics: TimetableEfficiencyMetrics;
  clashesCount: number;
  pendingApprovalsCount: number;
  onOpenClashes: () => void;
  onOpenApproval: () => void;
  onRunOptimizer: () => void;
  isOptimizing?: boolean;
  isAuthorized?: boolean;
}

export const TimetableDashboardCards: React.FC<TimetableDashboardCardsProps> = ({
  metrics,
  clashesCount,
  pendingApprovalsCount,
  onOpenClashes,
  onOpenApproval,
  onRunOptimizer,
  isOptimizing = false,
  isAuthorized = true,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Banner with AI Optimizer Trigger */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Intelligent Timetable & Scheduling Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                Phase 11 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              "The Right Teacher, The Right Subject, The Right Class, At The Right Time."
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">AI Efficiency Rating</div>
            <div className="text-lg font-black text-emerald-400">{metrics.overallEfficiencyScore}% Optimal</div>
          </div>
          <button
            type="button"
            onClick={onRunOptimizer}
            disabled={isOptimizing}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50 ${
              isAuthorized
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-amber-500/40'
            }`}
            title={
              isAuthorized
                ? 'Run Intelligent Timetable Generation & Optimization (Academic Timetable Administrator Authority)'
                : 'Read Access: Only Director of Academics can regenerate timetable schedules'
            }
          >
            {isAuthorized ? (
              <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin text-amber-300' : ''}`} />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isOptimizing
                ? 'AI Optimizing...'
                : isAuthorized
                ? 'Run AI Optimizer'
                : 'Regenerate (Director Authority)'}
            </span>
          </button>
        </div>
      </div>

      {/* 10 Real-time Real-Time Scheduling KPI Cards (P11.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {/* Card 1: Total Lessons Scheduled */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">1. Lessons Scheduled</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">{metrics.totalLessons}</span>
            <span className="text-[10px] text-blue-400 font-medium">40 / stream</span>
          </div>
        </div>

        {/* Card 2: Total Teachers Assigned */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">2. Teachers Assigned</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">{metrics.totalTeachers}</span>
            <span className="text-[10px] text-indigo-400 font-medium">100% covered</span>
          </div>
        </div>

        {/* Card 3: Total Classes Timetabled */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">3. Classes Timetabled</span>
            <Building className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">{metrics.totalClasses}</span>
            <span className="text-[10px] text-amber-400 font-medium">G7, G8, G9</span>
          </div>
        </div>

        {/* Card 4: Total Subjects Allocated */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">4. Subjects Allocated</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">11</span>
            <span className="text-[10px] text-emerald-400 font-medium">CBC Compliant</span>
          </div>
        </div>

        {/* Card 5: Conflict Alerts */}
        <div
          onClick={onOpenClashes}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
            clashesCount > 0
              ? 'bg-rose-950/40 border-rose-600/60 hover:bg-rose-900/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">5. Conflict Alerts</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${clashesCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-black ${clashesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {clashesCount}
            </span>
            <span className={`text-[10px] font-bold ${clashesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {clashesCount === 0 ? 'Zero Clashes' : 'Resolve Now'}
            </span>
          </div>
        </div>

        {/* Card 6: Timetable Efficiency Score */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">6. Efficiency Score</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">{metrics.overallEfficiencyScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">Workload: {metrics.teacherWorkloadBalanceScore}%</span>
          </div>
        </div>

        {/* Card 7: Resource Utilization Rate */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">7. Resource Utilization</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-white">{metrics.roomUtilizationRate}%</span>
            <span className="text-[10px] text-cyan-400 font-medium">{metrics.totalRooms} Facilities</span>
          </div>
        </div>

        {/* Card 8: Weekly Schedule Status */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">8. Weekly Schedule</span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">ACTIVE</span>
            <span className="text-[10px] text-slate-400 font-medium">5 Days / 40 Pds</span>
          </div>
        </div>

        {/* Card 9: Examination Schedule Status */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">9. Exam Schedule</span>
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wide">SCHEDULED</span>
            <span className="text-[10px] text-slate-400 font-medium">Mid-Term 2</span>
          </div>
        </div>

        {/* Card 10: Pending Timetable Approvals */}
        <div
          onClick={onOpenApproval}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
            pendingApprovalsCount > 0
              ? 'bg-amber-950/40 border-amber-600/60 hover:bg-amber-900/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">10. Approvals</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-black ${pendingApprovalsCount > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
              {pendingApprovalsCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {pendingApprovalsCount > 0 ? 'Review Draft' : 'All Approved'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
