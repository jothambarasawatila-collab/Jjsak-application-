import React from 'react';
import { ShieldAlert, ArrowLeft, Info, UserCheck } from 'lucide-react';
import { User, SchoolInfo } from '../../types';

interface TimetableAccessDeniedViewProps {
  currentUser?: User;
  schoolInfo: SchoolInfo;
  onBack: () => void;
  onSwitchToAcademicRole?: () => void;
}

export const TimetableAccessDeniedView: React.FC<TimetableAccessDeniedViewProps> = ({
  currentUser,
  schoolInfo,
  onBack,
  onSwitchToAcademicRole,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Policy JJSAK-TIMETABLE-ACCESS-002 — Unauthorized Session
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Timetable Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Under Policy JJSAK-TIMETABLE-ACCESS-002, timetable schedules and assessment calendars require an authenticated institutional role.
          </p>
        </div>

        {/* Current User Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500">Current Session Details</div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">{currentUser?.fullName || 'Active User'}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-black text-[11px]">
              Role: {currentUser?.role || 'UNAUTHORIZED'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Institution: <strong>{schoolInfo.name}</strong>
          </div>
        </div>

        {/* Policy JJSAK-TIMETABLE-ACCESS-002 Role Matrix */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Authorized Timetable Governance Categories (Policy JJSAK-TIMETABLE-ACCESS-002):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/30">
              <strong className="text-emerald-400 block font-bold">1. Director of Academics</strong>
              <span className="text-slate-300">
                Academic Timetable Administrator: Full create, edit, schedule, resolve conflicts &amp; publish authority
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-blue-400 block font-bold">2. Institutional Leadership</strong>
              <span className="text-slate-300">
                Head of Institution &amp; Deputy Head: Read access to published timetables &amp; oversight
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-indigo-400 block font-bold">3. Teaching Staff</strong>
              <span className="text-slate-300">
                Class &amp; Subject Teachers: Read access to class schedules, teaching assignments &amp; change requests
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-purple-400 block font-bold">4. Learners, Parents &amp; Support Departments</strong>
              <span className="text-slate-300">
                Learners, Parents/Guardians, Finance, Guidance &amp; Counselling: Read access to published schedules &amp; exam timetables
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Notice: Unauthenticated sessions or external users without recognized institutional affiliation are denied access.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          {onSwitchToAcademicRole && (
            <button
              type="button"
              onClick={onSwitchToAcademicRole}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Academic Persona (Test Mode)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
