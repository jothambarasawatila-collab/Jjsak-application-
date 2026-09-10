import React from 'react';
import { X, Printer, Award } from 'lucide-react';
import { ClassTeacherAllocation, StreamConfig } from '../../../types/academicStructure';
import { SchoolInfo } from '../../../types';

interface AppointmentLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: ClassTeacherAllocation | null;
  stream: StreamConfig | null;
  schoolInfo: SchoolInfo;
}

export const AppointmentLetterModal: React.FC<AppointmentLetterModalProps> = ({
  isOpen,
  onClose,
  allocation,
  stream,
  schoolInfo,
}) => {
  if (!isOpen || !allocation || !stream) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Class Teacher Appointment Letter
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official institutional appointment certification (TSC / MOE Standard)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formal Appointment Document Content */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 font-serif leading-relaxed">
          {/* Header & Crest */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-900">
              {schoolInfo.name}
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">
              Ministry of Education • Republic of Kenya
            </p>
            <p className="text-xs font-sans text-slate-500">
              {schoolInfo.address || 'P.O. Box 450-30200, Kitale, Trans Nzoia County'} • Tel: {schoolInfo.phone || '+254 700 000 000'}
            </p>
            <div className="pt-2 text-right text-[11px] font-sans text-slate-600">
              <span>Date: <strong>{allocation.appointmentDate}</strong></span>
              <br />
              <span>Ref No: <strong>{allocation.appointmentLetterRef}</strong></span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-sm font-sans text-slate-900">
              TO: {allocation.primaryClassTeacherName.toUpperCase()}
            </p>
            <p className="text-xs font-sans text-slate-600">
              Designated Academic Staff • {schoolInfo.name}
            </p>
          </div>

          <div className="py-2 border-y border-slate-300 text-center font-sans font-black text-sm uppercase tracking-wide text-slate-900 bg-slate-50">
            RE: APPOINTMENT AS CLASS TEACHER — {allocation.fullClassName.toUpperCase()} ({allocation.academicYear} ACADEMIC YEAR)
          </div>

          <p className="text-xs sm:text-sm">
            Following the recommendations of the Academic Board and the School Administration, I am pleased to formally appoint you as the <strong>Primary Class Teacher</strong> for <strong>{allocation.fullClassName}</strong> ({stream.roomNumber}) for the {allocation.academicYear} academic cycle, effective from <strong>{allocation.appointmentDate}</strong>.
          </p>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold font-sans text-slate-900">
              Key Terms of Reference & Pastoral Mandates:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-slate-700">
              {allocation.responsibilities.map((resp, i) => (
                <li key={i}>{resp}</li>
              ))}
              <li>Coordinate with Assistant Class Teacher ({allocation.assistantClassTeacherName || 'Appointed Deputy'}) in maintaining high standards of learner hygiene, punctuality, and peer barazas.</li>
              <li>Safeguard learner privacy and sensitive health/counseling records in compliance with Kenya Data Protection Act (KDPA 2019).</li>
            </ul>
          </div>

          <p className="text-xs sm:text-sm">
            The school administration expresses utmost confidence in your professional leadership, pastoral care, and dedication toward nurturing our learners to achieve their full holistic potential under the Competency Based Curriculum.
          </p>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-sans">
            <div className="space-y-4">
              <div className="border-b border-slate-400 w-48 pb-6 text-slate-400 italic">
                (Official Stamp / Signature)
              </div>
              <div>
                <p className="font-black text-slate-900">JOTHAM BARASA WATILA</p>
                <p className="text-slate-600 font-medium">Headteacher & Principal Secretary</p>
                <p className="text-slate-500">{schoolInfo.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b border-slate-400 w-48 pb-6 text-slate-400 italic">
                (Teacher Acceptance Signature)
              </div>
              <div>
                <p className="font-black text-slate-900">{allocation.primaryClassTeacherName}</p>
                <p className="text-slate-600 font-medium">Appointed Class Master / Mistress</p>
                <p className="text-slate-500">Date: ________________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
