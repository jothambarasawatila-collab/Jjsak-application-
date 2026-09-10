import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { AcademicYearConfig, AcademicTermConfig } from '../../../types/academicStructure';

interface YearRolloverWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: AcademicYearConfig | undefined;
  onExecuteRollover: (newYear: AcademicYearConfig, newTerms: AcademicTermConfig[]) => void;
}

export const YearRolloverWizardModal: React.FC<YearRolloverWizardModalProps> = ({
  isOpen,
  onClose,
  currentYear,
  onExecuteRollover,
}) => {
  const [targetYearNumber, setTargetYearNumber] = useState(
    (currentYear?.year || 2026) + 1
  );
  const [startDate, setStartDate] = useState(`${(currentYear?.year || 2026) + 1}-01-04`);
  const [endDate, setEndDate] = useState(`${(currentYear?.year || 2026) + 1}-11-19`);
  const [targetEnrollment, setTargetEnrollment] = useState(420);
  const [archivePreviousYear, setArchivePreviousYear] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleFinish = () => {
    const newYearConfig: AcademicYearConfig = {
      id: `ay-${targetYearNumber}`,
      year: targetYearNumber,
      name: `${targetYearNumber} Academic Year`,
      startDate,
      endDate,
      status: 'ACTIVE',
      totalWeeks: 39,
      workingDaysPerWeek: 5,
      targetEnrollment,
      isCurrent: true,
      termsCount: 3,
      notes: `Rollover from ${currentYear?.year || 2026}. Auto-provisioned calendar.`,
    };

    const newTerms: AcademicTermConfig[] = [
      {
        id: `term-${targetYearNumber}-t1`,
        academicYearId: `ay-${targetYearNumber}`,
        year: targetYearNumber,
        termNumber: 1,
        termName: `Term 1 - ${targetYearNumber}`,
        startDate: `${targetYearNumber}-01-04`,
        endDate: `${targetYearNumber}-04-02`,
        midTermBreakStart: `${targetYearNumber}-02-22`,
        midTermBreakEnd: `${targetYearNumber}-02-26`,
        status: 'ACTIVE',
        isCurrent: true,
        totalInstructionalWeeks: 13,
        assessmentWindows: {
          cat1Window: { start: `${targetYearNumber}-02-08`, end: `${targetYearNumber}-02-12`, weight: 20 },
          midTermWindow: { start: `${targetYearNumber}-02-15`, end: `${targetYearNumber}-02-19`, weight: 30 },
          endTermWindow: { start: `${targetYearNumber}-03-22`, end: `${targetYearNumber}-03-26`, weight: 50 },
          marksSubmissionDeadline: `${targetYearNumber}-03-30T17:00`,
          reportCardReleaseDate: `${targetYearNumber}-04-02`,
        },
        isLocked: false,
      },
      {
        id: `term-${targetYearNumber}-t2`,
        academicYearId: `ay-${targetYearNumber}`,
        year: targetYearNumber,
        termNumber: 2,
        termName: `Term 2 - ${targetYearNumber}`,
        startDate: `${targetYearNumber}-05-03`,
        endDate: `${targetYearNumber}-08-06`,
        midTermBreakStart: `${targetYearNumber}-06-21`,
        midTermBreakEnd: `${targetYearNumber}-06-25`,
        status: 'UPCOMING',
        isCurrent: false,
        totalInstructionalWeeks: 14,
        assessmentWindows: {
          cat1Window: { start: `${targetYearNumber}-05-31`, end: `${targetYearNumber}-06-04`, weight: 20 },
          midTermWindow: { start: `${targetYearNumber}-06-14`, end: `${targetYearNumber}-06-18`, weight: 30 },
          endTermWindow: { start: `${targetYearNumber}-07-26`, end: `${targetYearNumber}-07-30`, weight: 50 },
          marksSubmissionDeadline: `${targetYearNumber}-08-03T17:00`,
          reportCardReleaseDate: `${targetYearNumber}-08-06`,
        },
        isLocked: false,
      },
      {
        id: `term-${targetYearNumber}-t3`,
        academicYearId: `ay-${targetYearNumber}`,
        year: targetYearNumber,
        termNumber: 3,
        termName: `Term 3 - ${targetYearNumber}`,
        startDate: `${targetYearNumber}-08-23`,
        endDate: `${targetYearNumber}-10-29`,
        midTermBreakStart: `${targetYearNumber}-09-27`,
        midTermBreakEnd: `${targetYearNumber}-10-01`,
        status: 'UPCOMING',
        isCurrent: false,
        totalInstructionalWeeks: 10,
        assessmentWindows: {
          cat1Window: { start: `${targetYearNumber}-09-13`, end: `${targetYearNumber}-09-17`, weight: 20 },
          midTermWindow: { start: `${targetYearNumber}-09-20`, end: `${targetYearNumber}-09-24`, weight: 30 },
          endTermWindow: { start: `${targetYearNumber}-10-18`, end: `${targetYearNumber}-10-22`, weight: 50 },
          marksSubmissionDeadline: `${targetYearNumber}-10-25T17:00`,
          reportCardReleaseDate: `${targetYearNumber}-10-29`,
        },
        isLocked: false,
      },
    ];

    onExecuteRollover(newYearConfig, newTerms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Academic Year Transition Wizard</h3>
              <p className="text-xs text-slate-300 font-medium">
                Annual Rollover &amp; Cohort Graduation Framework
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6 space-y-4">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="block font-bold">Academic Year Transition Notice</strong>
                Transitioning to a new academic year locks existing term assessments, prepares Grade cohorts for promotion, and boots clean attendance rolls.
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Upcoming Academic Year *
              </label>
              <input
                type="number"
                value={targetYearNumber}
                onChange={(e) => setTargetYearNumber(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Start Date (Term 1)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  End Date (Term 3)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Projected Enrollment
              </label>
              <input
                type="number"
                value={targetEnrollment}
                onChange={(e) => setTargetEnrollment(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Archive Current Year ({currentYear?.year || 2026}) Records
                </span>
                <span className="text-[11px] text-slate-500">
                  Digitally seal snapshots in KDPA compliance archive
                </span>
              </div>
              <input
                type="checkbox"
                checked={archivePreviousYear}
                onChange={(e) => setArchivePreviousYear(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold">Ready to Launch {targetYearNumber} Academic Year</h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Executing rollover will initialize 3 terms with official MOE assessment dates, maintain active teacher workload allocations, and prime the promotion framework.
              </p>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span>Active Year:</span>
                <strong className="text-indigo-600">{targetYearNumber} Academic Year</strong>
              </div>
              <div className="flex justify-between">
                <span>Calendar Duration:</span>
                <strong>{startDate} to {endDate}</strong>
              </div>
              <div className="flex justify-between">
                <span>Default Terms:</span>
                <strong>Term 1, Term 2, Term 3 (13, 14, 10 Wks)</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Year Rollover</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
