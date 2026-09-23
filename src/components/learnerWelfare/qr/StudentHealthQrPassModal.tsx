import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Droplet,
  AlertTriangle,
  Phone,
  QrCode,
  Users,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Student } from '../../../types';
import { LearnerHealthProfile } from '../../../types/learnerWelfare';
import { createStudentQrPayload } from '../../../utils/qrPassUtils';
import { AVAILABLE_CLASSES, AVAILABLE_GRADES } from '../../../data/mockData';

interface StudentHealthQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  healthProfiles: Record<string, LearnerHealthProfile>;
  initialStudentId?: string;
  schoolName?: string;
}

export const StudentHealthQrPassModal: React.FC<StudentHealthQrPassModalProps> = ({
  isOpen,
  onClose,
  students,
  healthProfiles,
  initialStudentId,
  schoolName = 'JJSAK Comprehensive School',
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');
  const [batchClassFilter, setBatchClassFilter] = useState('All');
  const [batchGradeFilter, setBatchGradeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync initial student if prop changes
  React.useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialStudentId, students, selectedStudentId]);

  // Active single student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const activeHealthProfile = activeStudent ? healthProfiles[activeStudent.id] : undefined;

  // Filtered students for batch view
  const batchStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admNo.toLowerCase().includes(searchTerm.toLowerCase());
      const studentClass = `${s.grade} ${s.stream || s.classArm || ''}`.trim();
      const matchesClass = batchClassFilter === 'All' || studentClass === batchClassFilter || s.classArm === batchClassFilter;
      const matchesGrade = batchGradeFilter === 'All' || s.grade === batchGradeFilter;
      return matchesSearch && matchesClass && matchesGrade;
    });
  }, [students, searchTerm, batchClassFilter, batchGradeFilter]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Print Specific CSS Style Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-pass-container, #printable-qr-pass-container * {
            visibility: visible;
          }
          #printable-qr-pass-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-white">
        
        {/* Header (No Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-slate-900/90 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Student Health &amp; Welfare QR Pass Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Official CBC Health Pass
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate high-resolution printable ID cards &amp; digital emergency passes for rapid event check-ins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'single'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Individual Card
              </button>
              <button
                type="button"
                onClick={() => setViewMode('batch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'batch'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Batch Class Sheet ({batchStudents.length})
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pass
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SINGLE PASS VIEW */}
          {viewMode === 'single' && activeStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Student Selector & Info Controls (4 cols) */}
              <div className="lg:col-span-4 space-y-4 no-print">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Select Learner
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by name or ADM..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-700/50">
                    {students
                      .filter((s) =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.admNo.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between ${
                            selectedStudentId === s.id
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-700/60'
                          }`}
                        >
                          <div>
                            <span className="block truncate font-semibold">{s.name}</span>
                            <span className="text-[10px] opacity-75">{s.admNo} • {s.grade}</span>
                          </div>
                          {selectedStudentId === s.id && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Medical Snapshot in Sidebar */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Encoded Health Parameters
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-bold text-white">{activeHealthProfile?.bloodGroup || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Allergies:</span>
                      <span className="font-semibold text-amber-300">
                        {activeHealthProfile?.allergies?.length
                          ? activeHealthProfile.allergies.join(', ')
                          : 'None Recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Guardian Contact:</span>
                      <span className="font-mono text-white">
                        {activeStudent.emergencyPhone || activeStudent.parentPhone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Engine:</span>
                      <span className="text-emerald-400 font-semibold">JJSAK SHA-256</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Printable Health Pass Preview (8 cols) */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center">
                <div id="printable-qr-pass-container" ref={printContainerRef} className="w-full max-w-md">
                  {/* Official Card Body */}
                  <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-indigo-600/30 relative overflow-hidden">
                    
                    {/* Top Decorative Stripe */}
                    <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-indigo-700 via-purple-600 to-emerald-600" />

                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 mt-1">
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-indigo-700 uppercase block">
                          Republic of Kenya • Basic Education
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {schoolName}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500">
                          CBC Student Health &amp; Welfare Pass
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-sm">
                        CBC
                      </div>
                    </div>

                    {/* Main Card Content */}
                    <div className="grid grid-cols-12 gap-4 items-center mb-4">
                      
                      {/* Photo / Avatar & Info (7 cols) */}
                      <div className="col-span-7 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                            {activeStudent.avatarInitials || activeStudent.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-950 leading-tight line-clamp-2">
                              {activeStudent.name}
                            </h4>
                            <span className="text-xs font-bold text-indigo-600 font-mono block">
                              {activeStudent.admNo}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] space-y-0.5 text-slate-600 font-medium pt-1">
                          <div>
                            <span className="text-slate-400">Class: </span>
                            <span className="font-bold text-slate-800">
                              {activeStudent.grade} {activeStudent.stream || activeStudent.classArm}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Gender: </span>
                            <span className="font-semibold text-slate-800">{activeStudent.gender || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">UPI / Nemis: </span>
                            <span className="font-mono text-slate-700">{activeStudent.upi || 'PENDING'}</span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Container (5 cols) */}
                      <div className="col-span-5 flex flex-col items-center justify-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                        <div className="bg-white p-2 rounded-xl shadow-xs">
                          <QRCodeSVG
                            value={createStudentQrPayload(activeStudent, activeHealthProfile)}
                            size={110}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                          Scan for Check-in
                        </span>
                      </div>
                    </div>

                    {/* Medical Quick-Alert Footer Bar */}
                    <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-red-700">
                          <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                          <span>Blood: {activeHealthProfile?.bloodGroup || 'O+'}</span>
                        </div>

                        {activeHealthProfile?.allergies && activeHealthProfile.allergies.length > 0 ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Allergies: {activeHealthProfile.allergies.join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            ✓ No Known Allergies
                          </span>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-indigo-600" />
                          Emergency: <strong className="text-slate-800">{activeStudent.emergencyPhone || activeStudent.parentPhone || '+254 741 478 813'}</strong>
                        </span>
                        <span className="font-mono text-slate-400">Valid: 2026/27</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Print and Instructions below card */}
                <div className="mt-4 flex items-center gap-3 no-print">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Single Health Pass
                  </button>
                  <span className="text-xs text-slate-400">
                    Standard wallet card size (fits standard plastic pouch/lanyard)
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* BATCH PASS SHEET VIEW */}
          {viewMode === 'batch' && (
            <div className="space-y-4">
              
              {/* Batch Filters Toolbar (No Print) */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Filter Grade
                    </label>
                    <select
                      value={batchGradeFilter}
                      onChange={(e) => setBatchGradeFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium"
                    >
                      <option value="All">All Grades</option>
                      {AVAILABLE_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Filter Class / Stream
                    </label>
                    <select
                      value={batchClassFilter}
                      onChange={(e) => setBatchClassFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium"
                    >
                      <option value="All">All Classes</option>
                      {AVAILABLE_CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-48">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Search Learner
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Name or ADM..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Showing <strong className="text-white">{batchStudents.length}</strong> student passes
                  </span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Print All {batchStudents.length} Passes
                  </button>
                </div>
              </div>

              {/* Printable Grid of Cards */}
              <div id="printable-qr-pass-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchStudents.map((student) => {
                  const profile = healthProfiles[student.id];
                  return (
                    <div
                      key={student.id}
                      className="bg-white text-slate-900 rounded-2xl p-4 shadow border-2 border-slate-200 relative overflow-hidden break-inside-avoid"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <div>
                          <span className="text-[8px] font-black tracking-widest text-indigo-700 uppercase block">
                            {schoolName}
                          </span>
                          <h4 className="text-xs font-black text-slate-950 truncate max-w-[180px]">
                            {student.name}
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-600 font-mono">
                            {student.admNo} • {student.grade} {student.stream || student.classArm}
                          </span>
                        </div>

                        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                          <QRCodeSVG
                            value={createStudentQrPayload(student, profile)}
                            size={65}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      {/* Medical quick badges */}
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80 text-[10px] flex items-center justify-between">
                        <span className="font-bold text-red-700 flex items-center gap-1">
                          <Droplet className="w-3 h-3 fill-red-600" />
                          Blood: {profile?.bloodGroup || 'Unknown'}
                        </span>
                        <span className="text-slate-600 truncate max-w-[130px]">
                          {profile?.allergies?.length ? `⚠ ${profile.allergies.join(', ')}` : '✓ No Allergies'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer (No Print) */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted CBC Health Pass Token • Compatible with Mobile &amp; Desktop Scanners</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
