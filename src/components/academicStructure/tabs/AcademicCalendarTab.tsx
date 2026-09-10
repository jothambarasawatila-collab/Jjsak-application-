import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  AcademicYearConfig,
  AcademicTermConfig,
} from '../../../types/academicStructure';
import { YearRolloverWizardModal } from '../modals/YearRolloverWizardModal';

interface AcademicCalendarTabProps {
  academicYears: AcademicYearConfig[];
  terms: AcademicTermConfig[];
  onUpdateAcademicYears: (years: AcademicYearConfig[]) => void;
  onUpdateTerms: (terms: AcademicTermConfig[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const AcademicCalendarTab: React.FC<AcademicCalendarTabProps> = ({
  academicYears,
  terms,
  onUpdateAcademicYears,
  onUpdateTerms,
  onLogAudit,
}) => {
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string>(
    academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || 'ay-2026'
  );

  const currentYear = academicYears.find((y) => y.id === selectedYearId) || academicYears[0];
  const yearTerms = terms.filter((t) => t.academicYearId === currentYear?.id || t.year === currentYear?.year);

  const handleToggleTermLock = (termId: string) => {
    const updated = terms.map((t) => {
      if (t.id === termId) {
        const nextState = !t.isLocked;
        onLogAudit?.(
          'TERM_LOCKED',
          `${nextState ? 'Locked & sealed' : 'Unlocked'} marks entry for ${t.termName}.`,
          t.isLocked ? 'Locked' : 'Unlocked',
          nextState ? 'Locked' : 'Unlocked'
        );
        return {
          ...t,
          isLocked: nextState,
          lockedBy: nextState ? 'Principal / Senior Admin' : undefined,
          lockedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    onUpdateTerms(updated);
  };

  const handleSetActiveTerm = (termId: string) => {
    const updated = terms.map((t) => ({
      ...t,
      isCurrent: t.id === termId,
      status: t.id === termId ? ('ACTIVE' as const) : t.status === 'ACTIVE' ? ('CLOSED' as const) : t.status,
    }));
    onUpdateTerms(updated);
    const activated = terms.find((t) => t.id === termId);
    onLogAudit?.(
      'TERM_DATES_MODIFIED',
      `Switched active school term to ${activated?.termName || 'Selected Term'}.`
    );
  };

  const handleExecuteRollover = (newYear: AcademicYearConfig, newTerms: AcademicTermConfig[]) => {
    const updatedYears = academicYears.map((y) => ({
      ...y,
      isCurrent: false,
      status: y.id === currentYear?.id ? ('ARCHIVED' as const) : y.status,
    }));
    onUpdateAcademicYears([newYear, ...updatedYears]);
    onUpdateTerms([...newTerms, ...terms]);
    setSelectedYearId(newYear.id);
    onLogAudit?.(
      'ACADEMIC_YEAR_TRANSITION',
      `Executed academic year transition to ${newYear.name}. Provisioned 3 terms.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Year Selector Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {currentYear?.name}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  currentYear?.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentYear?.status === 'ARCHIVED'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentYear?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Duration: {currentYear?.startDate} to {currentYear?.endDate} ({currentYear?.totalWeeks} Instructional Weeks)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.name} ({ay.status})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsRolloverModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Academic Year Rollover</span>
          </button>
        </div>
      </div>

      {/* 3 Terms Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Terms Schedule &amp; Assessment Windows ({currentYear?.name})
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            3 Terms • Aligned with Ministry of Education School Calendar
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {yearTerms.map((term) => (
            <div
              key={term.id}
              className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 ${
                term.isCurrent
                  ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      T{term.termNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{term.termName}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {term.totalInstructionalWeeks} Instructional Weeks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {term.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ACTIVE NOW
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleTermLock(term.id)}
                      title={term.isLocked ? 'Term Locked (Click to Unlock)' : 'Term Open (Click to Lock)'}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        term.isLocked
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {term.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Date Ranges */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Term Dates:</span>
                    <strong className="text-slate-800 font-bold">{term.startDate} to {term.endDate}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Mid-Term Break:</span>
                    <strong className="text-amber-700 font-bold">{term.midTermBreakStart} to {term.midTermBreakEnd}</strong>
                  </div>
                </div>

                {/* Assessment Windows */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                    Assessment &amp; Reporting Milestones
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 flex items-center justify-between">
                      <span className="text-indigo-950 font-medium">CAT 1 Window:</span>
                      <span className="font-mono text-slate-700 font-bold text-[11px]">
                        {term.assessmentWindows.cat1Window.start} ({term.assessmentWindows.cat1Window.weight}%)
                      </span>
                    </div>
                    <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 flex items-center justify-between">
                      <span className="text-indigo-950 font-medium">Mid-Term Exam:</span>
                      <span className="font-mono text-slate-700 font-bold text-[11px]">
                        {term.assessmentWindows.midTermWindow.start} ({term.assessmentWindows.midTermWindow.weight}%)
                      </span>
                    </div>
                    <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 flex items-center justify-between">
                      <span className="text-indigo-950 font-medium">End-Term Exam:</span>
                      <span className="font-mono text-slate-700 font-bold text-[11px]">
                        {term.assessmentWindows.endTermWindow.start} ({term.assessmentWindows.endTermWindow.weight}%)
                      </span>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <span className="text-amber-900 font-bold">Marks Deadline:</span>
                      <span className="font-mono text-amber-900 font-black text-[11px]">
                        {term.assessmentWindows.marksSubmissionDeadline.replace('T', ' ')}
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                      <span className="text-emerald-950 font-bold">Report Cards:</span>
                      <span className="font-mono text-emerald-900 font-black text-[11px]">
                        {term.assessmentWindows.reportCardReleaseDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {!term.isCurrent ? (
                  <button
                    type="button"
                    onClick={() => handleSetActiveTerm(term.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Set as Current Term
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Term
                  </span>
                )}

                {term.isLocked && (
                  <span className="text-[10px] text-rose-600 font-mono font-bold">
                    [LOCKED]
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <YearRolloverWizardModal
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
        currentYear={currentYear}
        onExecuteRollover={handleExecuteRollover}
      />
    </div>
  );
};
