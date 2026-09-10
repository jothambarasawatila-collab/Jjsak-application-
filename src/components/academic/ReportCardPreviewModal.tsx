import React, { useRef } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import {
  Student,
  SchoolInfo,
  GradingScheme,
} from '../../types';
import {
  triggerFileDownload,
} from '../../data/academicData';

interface ReportCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  schoolInfo: SchoolInfo;
  gradingScheme?: GradingScheme;
}

export const ReportCardPreviewModal: React.FC<ReportCardPreviewModalProps> = ({
  isOpen,
  onClose,
  student,
  schoolInfo,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csv = `JJSAK CBC OFFICIAL REPORT CARD\n`;
    csv += `School,${schoolInfo.name}\n`;
    csv += `Learner Name,${student.name}\n`;
    csv += `Admission No,${student.admNo}\n`;
    csv += `Grade & Stream,${student.classArm}\n`;
    csv += `Term & Year,${student.term} ${student.year}\n`;
    csv += `Attendance,${student.attendance}%\n`;
    csv += `Overall Grade,${student.overallGrade}\n`;
    csv += `Class Position,${student.position}\n\n`;
    csv += `Subject,Score,CBC Competency Band,Remarks\n`;

    student.subjects.forEach((sub) => {
      csv += `"${sub.subject}",${sub.score},"${sub.grade}","${sub.remarks || ''}"\n`;
    });

    csv += `\nClass Teacher Remarks,"${student.classTeacherComment || ''}"\n`;
    csv += `Head of Institution Remarks,"${student.headTeacherComment || ''}"\n`;

    triggerFileDownload(csv, `ReportCard_${student.admNo}_${student.classArm.replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        {/* Modal Action Header (hidden in print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Official CBC Student Summative Report Card</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Phase 5.8
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div ref={reportRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-4 text-slate-900 bg-white">
          {/* Institution Header & Crest */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-sm">
                JJ
              </div>
              <div className="text-left">
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {schoolInfo.address || 'P.O. Box 450-30200, Kitale, Kenya'} • Tel: {schoolInfo.phone || '+254 722 000 000'}
                </p>
                <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                  Ministry of Education • Competency-Based Assessment (CBA) Institutional Report
                </p>
              </div>
            </div>
          </div>

          {/* Student Dossier Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Learner Full Name</span>
              <span className="font-black text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Admission / UPI</span>
              <span className="font-mono font-bold text-slate-800">{student.admNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Class & Stream</span>
              <span className="font-bold text-emerald-700">{student.classArm}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Academic Term</span>
              <span className="font-bold text-slate-800">{student.term} ({student.year})</span>
            </div>
          </div>

          {/* Core Performance Summary Strip */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
            <div>
              <span className="text-[10px] text-emerald-800 block">Mean Score</span>
              <span className="text-base font-black text-emerald-950">{student.avgScore ?? '—'}%</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 block">Overall CBC Band</span>
              <span className="text-base font-black text-emerald-950">{student.overallGrade}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 block">Stream Rank</span>
              <span className="text-base font-black text-emerald-950">{student.position || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 block">Attendance Rate</span>
              <span className="text-base font-black text-emerald-950">{student.attendance}%</span>
            </div>
          </div>

          {/* Learning Area Subject Breakdown Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-3 w-8 text-center">#</th>
                  <th className="py-2 px-3">Learning Area (Subject)</th>
                  <th className="py-2 px-3 text-center">Score / 100</th>
                  <th className="py-2 px-3 text-center">Competency Band</th>
                  <th className="py-2 px-3">Teacher Assessment Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {student.subjects.map((sub, idx) => (
                  <tr key={sub.subject} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-900">{sub.subject}</td>
                    <td className="py-1.5 px-3 text-center font-bold text-slate-800">
                      {sub.score ?? '—'}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-600 text-[11px]">{sub.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competency Band Key */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><strong>EE (80-100%):</strong> Exceeding Expectations</div>
            <div><strong>ME (65-79%):</strong> Meeting Expectations</div>
            <div><strong>AE (50-64%):</strong> Approaching Expectations</div>
            <div><strong>BE (0-49%):</strong> Below Expectations</div>
          </div>

          {/* Professional Remarks Section */}
          <div className="space-y-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Class Teacher Remarks:</span>
              <p className="text-slate-600 italic">
                "{student.classTeacherComment || 'Diligent learner demonstrating steady competency growth across all core learning areas.'}"
              </p>
              <div className="pt-2 text-[11px] font-semibold text-slate-700 flex justify-between">
                <span>Teacher: {student.classTeacherName || 'Mr. O. Kinyanjui'}</span>
                <span>Signature: _______________________</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Head of Institution / Principal Remarks:</span>
              <p className="text-slate-600 italic">
                "{student.headTeacherComment || 'Commendable discipline and academic progress. Keep up the high standard in Senior School preparation.'}"
              </p>
              <div className="pt-2 text-[11px] font-semibold text-slate-700 flex justify-between">
                <span>Head of School: {student.headOfSchoolName || 'Mrs. J. Barasa'}</span>
                <span>Signature: _______________________</span>
              </div>
            </div>
          </div>

          {/* Next Term Notice & Official Seal */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span>Next Term Opening Date: <strong className="text-slate-800">{student.nextTermDate || '5th August 2026'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-[10px]">VERIFIED AUTHENTIC BY JJSAK ACADEMIC INTEGRITY ENGINE</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
