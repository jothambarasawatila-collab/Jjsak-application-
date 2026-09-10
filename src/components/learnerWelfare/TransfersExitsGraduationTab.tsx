import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  GraduationCap,
  FileCheck2,
  Search,
  Plus,
  Building2,
  CheckCircle,
  FileText,
  Award,
  X,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../types';
import {
  Grade9GraduationRecord,
  TransferInRecord,
  TransferOutRecord,
  ClearanceItem,
} from '../../types/learnerWelfare';

interface TransfersExitsGraduationTabProps {
  students: Student[];
  currentUser?: CurrentUser;
  transfersOut: TransferOutRecord[];
  transfersIn: TransferInRecord[];
  graduations: Grade9GraduationRecord[];
  onProcessTransferOut: (record: TransferOutRecord) => void;
  onProcessTransferIn: (record: TransferInRecord) => void;
  onGraduateGrade9: (record: Grade9GraduationRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const TransfersExitsGraduationTab: React.FC<TransfersExitsGraduationTabProps> = ({
  students,
  currentUser,
  transfersOut,
  transfersIn,
  graduations,
  onProcessTransferOut,
  onProcessTransferIn,
  onGraduateGrade9,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transfersOut' | 'transfersIn' | 'graduations'>(
    'transfersOut'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransferOutModal, setShowTransferOutModal] = useState(false);
  const [showTransferInModal, setShowTransferInModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [viewingTransferCert, setViewingTransferCert] = useState<TransferOutRecord | null>(null);
  const [viewingGradCert, setViewingGradCert] = useState<Grade9GraduationRecord | null>(null);

  // Transfer Out Form State
  const [outStudentId, setOutStudentId] = useState(students[0]?.id || '');
  const [outDestSchool, setOutDestSchool] = useState('');
  const [outDestCounty, setOutDestCounty] = useState('Nairobi County');
  const [outReason, setOutReason] = useState('Parental relocation due to employment reassignment');
  const [outDate, setOutDate] = useState('2026-08-28');
  const [outClearFinance, setOutClearFinance] = useState(true);
  const [outClearLibrary, setOutClearLibrary] = useState(true);
  const [outClearLab, setOutClearLab] = useState(true);
  const [outClearBoarding, setOutClearBoarding] = useState(true);

  // Transfer In Form State
  const [inStudentName, setInStudentName] = useState('');
  const [inAdmNo, setInAdmNo] = useState('');
  const [inUpi, setInUpi] = useState('');
  const [inPrevSchool, setInPrevSchool] = useState('');
  const [inPrevAdmNo, setInPrevAdmNo] = useState('');
  const [inAdmittedClass, setInAdmittedClass] = useState('G8 S');
  const [inDate, setInDate] = useState('2026-08-28');
  const [inPriorScore, setInPriorScore] = useState(78.5);
  const [inNotes, setInNotes] = useState('Official NEMIS transfer letter and CBC assessment booklet verified.');

  // Graduation Form State
  const [gradStudentId, setGradStudentId] = useState(students[0]?.id || '');
  const [gradYear, setGradYear] = useState('2026');
  const [gradKjseaBand, setGradKjseaBand] = useState('EE');
  const [gradScore, setGradScore] = useState(88.0);
  const [gradPathway, setGradPathway] = useState<'STEM' | 'Social Sciences' | 'Arts & Sports Science'>('STEM');

  // Filtered lists
  const filteredTransfersOut = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    return transfersOut.filter(
      (t) =>
        !q ||
        (t.studentName && t.studentName.toLowerCase().includes(q)) ||
        (t.admNo && t.admNo.toLowerCase().includes(q)) ||
        (t.destinationSchool && t.destinationSchool.toLowerCase().includes(q)) ||
        (t.transferLetterRef && t.transferLetterRef.toLowerCase().includes(q))
    );
  }, [transfersOut, searchTerm]);

  const filteredTransfersIn = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    return transfersIn.filter(
      (t) =>
        !q ||
        (t.studentName && t.studentName.toLowerCase().includes(q)) ||
        (t.admNo && t.admNo.toLowerCase().includes(q)) ||
        (t.previousSchool && t.previousSchool.toLowerCase().includes(q))
    );
  }, [transfersIn, searchTerm]);

  const filteredGraduations = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    return graduations.filter(
      (g) =>
        !q ||
        (g.studentName && g.studentName.toLowerCase().includes(q)) ||
        (g.admNo && g.admNo.toLowerCase().includes(q)) ||
        (g.recommendedPathway && g.recommendedPathway.toLowerCase().includes(q)) ||
        (g.completionCertificateNumber && g.completionCertificateNumber.toLowerCase().includes(q))
    );
  }, [graduations, searchTerm]);

  // Handle Transfer Out Submit
  const handleSaveTransferOut = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === outStudentId);
    if (!student) return;

    const refNo = `JJSAK/TR/${new Date().getFullYear()}/${student.admNo.replace(/[^a-zA-Z0-9]/g, '')}`;
    const allCleared = outClearFinance && outClearLibrary && outClearLab && outClearBoarding;

    const checklist: ClearanceItem[] = [
      { department: 'Finance / Bursar', item: 'Term Tuition and Ancillary Fees', cleared: outClearFinance, clearedBy: 'Bursar Office', clearedDate: outDate },
      { department: 'Library', item: 'Course Books and Textbooks Returned', cleared: outClearLibrary, clearedBy: 'Librarian', clearedDate: outDate },
      { department: 'Science Lab', item: 'Lab Apparatus & Safety Kit Check', cleared: outClearLab, clearedBy: 'Lab Tech', clearedDate: outDate },
      { department: 'Boarding & Stores', item: 'Hostel Locker & Bedding Check', cleared: outClearBoarding, clearedBy: 'Boarding Master', clearedDate: outDate },
    ];

    const newRecord: TransferOutRecord = {
      id: `tout-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      upi: student.upi || `NEMIS-${Date.now().toString().slice(-6)}`,
      currentClass: `${student.grade} ${student.stream || student.classArm || ''}`.trim(),
      destinationSchool: outDestSchool,
      destinationCounty: outDestCounty,
      transferReason: outReason,
      clearanceDate: outDate,
      transferLetterRef: refNo,
      clearanceChecklist: checklist,
      allCleared,
      authorizedBy: currentUser?.fullName || 'Head Teacher',
      status: allCleared ? 'Completed' : 'Pending Clearance',
    };

    onProcessTransferOut(newRecord);
    if (onLogAudit) {
      onLogAudit(
        'LEARNER_TRANSFER' as any,
        `Processed Transfer-Out for ${student.name} (${student.admNo}) to ${outDestSchool}. Ref: ${refNo}. Active status archived.`
      );
    }

    setShowTransferOutModal(false);
  };

  // Handle Transfer In Submit
  const handleSaveTransferIn = (e: React.FormEvent) => {
    e.preventDefault();
    const refNo = `TR-IN-${Date.now().toString().slice(-5)}`;

    const newRecord: TransferInRecord = {
      id: `tin-${Date.now()}`,
      studentId: `std-in-${Date.now()}`,
      studentName: inStudentName,
      admNo: inAdmNo,
      upi: inUpi || `NEMIS-${Date.now().toString().slice(-6)}`,
      admittedClass: inAdmittedClass,
      previousSchool: inPrevSchool,
      previousAdmNo: inPrevAdmNo,
      transferLetterRef: refNo,
      dateAdmitted: inDate,
      priorMeanScore: inPriorScore,
      specialNotes: inNotes,
      admittedBy: currentUser?.fullName || 'Registrar',
    };

    onProcessTransferIn(newRecord);
    if (onLogAudit) {
      onLogAudit(
        'LEARNER_TRANSFER' as any,
        `Admitted transfer-in learner ${inStudentName} (${inAdmNo}) from ${inPrevSchool}. Assigned to ${inAdmittedClass}.`
      );
    }

    setShowTransferInModal(false);
  };

  // Handle Graduation Submit
  const handleSaveGraduation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === gradStudentId);
    if (!student) return;

    const certNo = `KJSEA-JJSAK-${gradYear}-${Date.now().toString().slice(-4)}`;

    const newRecord: Grade9GraduationRecord = {
      id: `grad-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      upi: student.upi || `NEMIS-${Date.now().toString().slice(-6)}`,
      graduationYear: parseInt(gradYear) || 2026,
      kjseaMeanBand: gradKjseaBand,
      overallScore: gradScore,
      recommendedPathway: gradPathway,
      completionCertificateNumber: certNo,
      exitDate: `${gradYear}-11-30`,
      status: 'Certificate Issued',
    };

    onGraduateGrade9(newRecord);
    if (onLogAudit) {
      onLogAudit(
        'LEARNER_PROMOTE' as any,
        `Issued Grade 9 Completion Certificate for ${student.name} (${student.admNo}). Band: ${gradKjseaBand}, Pathway: ${gradPathway}. Certificate: ${certNo}.`
      );
    }

    setShowGraduationModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transfers Out</span>
            <ArrowRightLeft className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{transfersOut.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Exit clearances issued</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Transfers In</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 mt-1">{transfersIn.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">NEMIS cross-enrolled</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Grade 9 Graduates</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-700 mt-1">{graduations.length}</p>
          <span className="text-[10px] text-indigo-600 font-medium">KJSEA pathway certified</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Historical Rule</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-blue-700 mt-2">P6.8.4 Enforced</p>
          <span className="text-[10px] text-blue-600 font-medium">Immutable exit audit roll</span>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('transfersOut')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'transfersOut'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>P6.8.1 Transfers Out ({transfersOut.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('transfersIn')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'transfersIn'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>P6.8.2 Transfers In ({transfersIn.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('graduations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'graduations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>P6.8.3 Grade 9 Exits ({graduations.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'transfersOut' && (
            <button
              type="button"
              onClick={() => setShowTransferOutModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Process Transfer Out</span>
            </button>
          )}

          {activeSubTab === 'transfersIn' && (
            <button
              type="button"
              onClick={() => setShowTransferInModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Transfer In</span>
            </button>
          )}

          {activeSubTab === 'graduations' && (
            <button
              type="button"
              onClick={() => setShowGraduationModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Certify Grade 9 Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by learner name, admission number, certificate or destination..."
          className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs font-medium"
        />
      </div>

      {/* Sub-Tab 1: Transfers Out Table */}
      {activeSubTab === 'transfersOut' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Learner &amp; Adm No</th>
                  <th className="py-3 px-3">Destination School</th>
                  <th className="py-3 px-3">Transfer Ref</th>
                  <th className="py-3 px-3">Clearance Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Transfer Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfersOut.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      No transfer-out records found.
                    </td>
                  </tr>
                ) : (
                  filteredTransfersOut.map((tout) => (
                    <tr key={tout.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tout.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {tout.admNo} • {tout.currentClass}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{tout.destinationSchool}</div>
                        <div className="text-[11px] text-slate-500">{tout.destinationCounty}</div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {tout.transferLetterRef}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">{tout.clearanceDate}</td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tout.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{tout.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingTransferCert(tout)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Certificate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Transfers In (Admissions) */}
      {activeSubTab === 'transfersIn' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Learner &amp; Adm No</th>
                  <th className="py-3 px-3">Origin School</th>
                  <th className="py-3 px-3">UPI / NEMIS</th>
                  <th className="py-3 px-3">Assigned Class</th>
                  <th className="py-3 px-3">Admission Date</th>
                  <th className="py-3 px-4 text-right">Admitted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfersIn.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      No transfer-in records found.
                    </td>
                  </tr>
                ) : (
                  filteredTransfersIn.map((tin) => (
                    <tr key={tin.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tin.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{tin.admNo}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{tin.previousSchool}</div>
                        {tin.previousAdmNo && (
                          <div className="text-[11px] text-slate-500">Former Adm: {tin.previousAdmNo}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {tin.upi || 'NEMIS Pending'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-slate-800 bg-slate-100 border border-slate-200">
                          {tin.admittedClass}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">{tin.dateAdmitted}</td>

                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {tin.admittedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Grade 9 JSS Graduation */}
      {activeSubTab === 'graduations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Learner &amp; Adm No</th>
                  <th className="py-3 px-3">KJSEA Band</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Recommended Pathway</th>
                  <th className="py-3 px-3">Certificate No.</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGraduations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      No Grade 9 graduation records found.
                    </td>
                  </tr>
                ) : (
                  filteredGraduations.map((grad) => (
                    <tr key={grad.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{grad.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{grad.admNo} • Class of {grad.graduationYear}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {grad.kjseaMeanBand}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-800">
                        {grad.overallScore}%
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-indigo-700">{grad.recommendedPathway}</span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {grad.completionCertificateNumber}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingGradCert(grad)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer border border-amber-200"
                        >
                          <Award className="w-3 h-3" />
                          <span>Exit Certificate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Out Modal */}
      {showTransferOutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Process Learner Transfer Out</h3>
                <p className="text-xs text-slate-500 font-medium">P6.8.1 Transfer-Out Framework</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferOutModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransferOut} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Active Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={outStudentId}
                  onChange={(e) => setOutStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Destination School <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={outDestSchool}
                    onChange={(e) => setOutDestSchool(e.target.value)}
                    placeholder="e.g. Lugulu Junior Academy"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination County</label>
                  <input
                    type="text"
                    value={outDestCounty}
                    onChange={(e) => setOutDestCounty(e.target.value)}
                    placeholder="e.g. Bungoma County"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Transfer</label>
                  <input
                    type="text"
                    required
                    value={outReason}
                    onChange={(e) => setOutReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Clearance Date</label>
                  <input
                    type="date"
                    required
                    value={outDate}
                    onChange={(e) => setOutDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Clearance Checkpoints */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mandatory Clearance Sign-offs
                </span>

                <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outClearFinance}
                      onChange={(e) => setOutClearFinance(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Finance / Fees Cleared</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outClearLibrary}
                      onChange={(e) => setOutClearLibrary(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Library Textbooks</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outClearLab}
                      onChange={(e) => setOutClearLab(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Science &amp; Lab Kit</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outClearBoarding}
                      onChange={(e) => setOutClearBoarding(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Hostel / Locker Check</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferOutModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Authorize Transfer &amp; Issue Cert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer In Modal */}
      {showTransferInModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Process Learner Transfer In</h3>
                <p className="text-xs text-slate-500 font-medium">P6.8.2 Transfer-In Framework</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferInModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransferIn} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Learner Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inStudentName}
                    onChange={(e) => setInStudentName(e.target.value)}
                    placeholder="e.g. Sharon Chepkemoi"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    New Admission No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inAdmNo}
                    onChange={(e) => setInAdmNo(e.target.value)}
                    placeholder="ADM-2026-088"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Origin School <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inPrevSchool}
                    onChange={(e) => setInPrevSchool(e.target.value)}
                    placeholder="e.g. St. Teresa Junior Academy"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">NEMIS / UPI Code</label>
                  <input
                    type="text"
                    value={inUpi}
                    onChange={(e) => setInUpi(e.target.value)}
                    placeholder="NEMIS-99201452"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Admitted Class</label>
                  <select
                    value={inAdmittedClass}
                    onChange={(e) => setInAdmittedClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="G7 J">Grade 7 J</option>
                    <option value="G7 K">Grade 7 K</option>
                    <option value="G8 S">Grade 8 S</option>
                    <option value="G8 K">Grade 8 K</option>
                    <option value="G9 J">Grade 9 J</option>
                    <option value="G9 S">Grade 9 S</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Former Adm No.</label>
                  <input
                    type="text"
                    value={inPrevAdmNo}
                    onChange={(e) => setInPrevAdmNo(e.target.value)}
                    placeholder="STJA-2024-112"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Prior Mean Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={inPriorScore}
                    onChange={(e) => setInPriorScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    required
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Special Academic or Medical Notes
                </label>
                <input
                  type="text"
                  value={inNotes}
                  onChange={(e) => setInNotes(e.target.value)}
                  placeholder="e.g. Top score in Agriculture & Creative Arts..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferInModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Graduation Modal */}
      {showGraduationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Grade 9 JSS Graduation</h3>
                <p className="text-xs text-slate-500 font-medium">P6.8.3 Junior Secondary Exit</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGraduationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGraduation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Grade 9 Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={gradStudentId}
                  onChange={(e) => setGradStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">KJSEA Band</label>
                  <select
                    value={gradKjseaBand}
                    onChange={(e) => setGradKjseaBand(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-emerald-700"
                  >
                    <option value="EE">EE (Exceeding Expectations)</option>
                    <option value="ME">ME (Meeting Expectations)</option>
                    <option value="AE">AE (Approaching Expectations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Overall %</label>
                  <input
                    type="number"
                    value={gradScore}
                    onChange={(e) => setGradScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recommended Senior School Pathway <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gradPathway}
                  onChange={(e) => setGradPathway(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-indigo-700"
                >
                  <option value="STEM">STEM (Pure Sciences, Applied Tech, Pre-Med)</option>
                  <option value="Social Sciences">Social Sciences (Humanities, Business, Languages)</option>
                  <option value="Arts & Sports Science">Arts &amp; Sports Science (Visual/Performing Arts, Athletics)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGraduationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Generate Graduation Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Certificate View Modal */}
      {viewingTransferCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-2 border-slate-300 space-y-6">
            <div className="text-center space-y-1 border-b pb-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                Republic of Kenya • Ministry of Education
              </div>
              <h2 className="text-lg font-black text-slate-900">
                JJSAK JUNIOR SECONDARY SCHOOL
              </h2>
              <div className="text-xs font-bold text-slate-700">
                OFFICIAL LEARNER TRANSFER CERTIFICATE
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Ref: {viewingTransferCert.transferLetterRef}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-medium">
              <p>
                This is to officially certify that learner{' '}
                <strong className="text-slate-950 font-bold underline">
                  {viewingTransferCert.studentName}
                </strong>
                , registered under Admission Number{' '}
                <strong className="font-mono font-bold">{viewingTransferCert.admNo}</strong> in{' '}
                <strong>{viewingTransferCert.currentClass}</strong>, has completed all institutional
                clearance requirements and is officially released to transfer to{' '}
                <strong className="text-indigo-900 font-bold">
                  {viewingTransferCert.destinationSchool}
                </strong>{' '}
                ({viewingTransferCert.destinationCounty}).
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold">UPI / NEMIS:</span>
                  <div className="font-mono font-bold text-slate-900">
                    {viewingTransferCert.upi || 'NEMIS Verified'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Clearance Date:</span>
                  <div className="font-bold text-slate-900">{viewingTransferCert.clearanceDate}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">{viewingTransferCert.authorizedBy}</div>
                <div className="text-[10px] text-slate-500">Registrar / Headteacher</div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTransferCert(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graduation Certificate View Modal */}
      {viewingGradCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-4 border-amber-600 space-y-6">
            <div className="text-center space-y-1 border-b-2 border-amber-600 pb-4">
              <div className="text-xs font-black uppercase tracking-widest text-amber-700">
                Competency-Based Curriculum (CBC)
              </div>
              <h2 className="text-lg font-black text-slate-900">
                JJSAK JUNIOR SECONDARY SCHOOL
              </h2>
              <div className="text-xs font-black text-amber-800">
                GRADE 9 JUNIOR SECONDARY COMPLETION CERTIFICATE
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Cert No: {viewingGradCert.completionCertificateNumber}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-medium">
              <p>
                This certifies that{' '}
                <strong className="text-slate-950 font-bold underline">
                  {viewingGradCert.studentName}
                </strong>{' '}
                (Adm No: <strong className="font-mono">{viewingGradCert.admNo}</strong>, UPI:{' '}
                <strong className="font-mono">{viewingGradCert.upi || 'NEMIS Verified'}</strong>) has
                successfully completed the Junior Secondary Education cycle (Grade 7 - Grade 9) with
                an evaluation band of{' '}
                <strong className="text-emerald-700 font-bold">
                  {viewingGradCert.kjseaMeanBand} ({viewingGradCert.overallScore}%)
                </strong>
                .
              </p>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-300 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold">Completion Year:</span>
                  <div className="font-bold text-slate-900">
                    Class of {viewingGradCert.graduationYear}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Recommended Pathway:</span>
                  <div className="font-bold text-indigo-900">
                    {viewingGradCert.recommendedPathway}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500">Exit Date: {viewingGradCert.exitDate}</span>
              <button
                type="button"
                onClick={() => setViewingGradCert(null)}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
