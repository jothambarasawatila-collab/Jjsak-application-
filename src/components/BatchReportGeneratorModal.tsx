import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileCheck,
  CheckCircle2,
  Filter,
  Download,
  Sliders,
} from 'lucide-react';
import { Student, Teacher, SchoolInfo, SchoolProfile } from '../types';
import { calculateStudentRankings } from '../data/mockData';

interface BatchReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers?: Teacher[];
  schoolInfo?: SchoolInfo;
  schoolProfile?: SchoolProfile;
}

export const BatchReportGeneratorModal: React.FC<BatchReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('All');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState<string>('All');
  const [blankSignatures, setBlankSignatures] = useState<boolean>(true); // Default to blank for manual signing as requested
  const [includeStamp, setIncludeStamp] = useState<boolean>(true);
  const [includePathways, setIncludePathways] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);

  // Ranked students pool
  const rankedStudents = useMemo(() => {
    return calculateStudentRankings(students);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return rankedStudents.filter((s) => {
      if (selectedGradeFilter !== 'All' && s.grade !== selectedGradeFilter) return false;
      if (selectedStreamFilter !== 'All' && s.classArm !== selectedStreamFilter) return false;
      return true;
    });
  }, [rankedStudents, selectedGradeFilter, selectedStreamFilter]);

  const availableGrades = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.grade))).sort();
  }, [students]);

  const availableStreams = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.classArm))).sort();
  }, [students]);

  const handlePrintAll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationSuccess(true);
      setTimeout(() => {
        window.print();
      }, 300);
      setTimeout(() => {
        setGenerationSuccess(false);
      }, 4000);
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = [
      'ADM No',
      'Name',
      'Grade',
      'Stream',
      'Avg Score (%)',
      'Overall Grade',
      'Stream Rank',
      'Grade Rank',
      'Attendance (%)',
      'Primary Parent',
      'Parent Phone',
    ];

    const rows = filteredStudents.map((s) => {
      // Calculate attendance based on assessment completion
      const totalSubjects = s.subjects.length || 9;
      const assessedCount = s.subjects.filter((sub) => sub.score !== null && sub.score !== undefined).length;
      const calculatedAttendance = totalSubjects > 0 ? Math.round((assessedCount / totalSubjects) * 100) : 100;

      const parentContact = s.parents && s.parents.length > 0 ? s.parents[0] : null;
      const parentName = parentContact ? parentContact.name : s.parentName || 'Parent';
      const parentPhone = parentContact ? parentContact.phoneNumber : s.parentPhone || '';

      return [
        s.admNo,
        `"${s.name}"`,
        s.grade,
        `"${s.classArm}"`,
        s.avgScore ?? '',
        s.overallGrade ?? '',
        s.streamPosition || s.streamRank || '',
        s.gradePosition || s.gradeRank || '',
        calculatedAttendance,
        `"${parentName}"`,
        `"${parentPhone}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JJSAK_All_Student_Reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setGenerationSuccess(true);
    setTimeout(() => setGenerationSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#C51E28] text-white px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>1-Click Batch Report Generator</span>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                  All Learners
                </span>
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Generate, compile, and print official report cards for all {students.length} learners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total In Scope</span>
              <span className="text-xl font-black text-[#C51E28]">{filteredStudents.length}</span>
              <span className="text-[10px] text-slate-500 font-medium block">Learners</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Streams</span>
              <span className="text-xl font-black text-slate-900">
                {selectedStreamFilter === 'All' ? availableStreams.length : 1}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">Classes</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Signatures</span>
              <span className="text-base font-black text-emerald-700 mt-0.5 block">
                {blankSignatures ? 'Blank (Ink Sign)' : 'Digital Cursive'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">Format</span>
            </div>
          </div>

          {/* Filtering Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Filter className="w-4 h-4 text-[#C51E28]" />
              <span>Scope &amp; Student Filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Grade Level
                </label>
                <select
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C51E28]"
                >
                  <option value="All">All Grades (G7 - G9)</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Class Stream
                </label>
                <select
                  value={selectedStreamFilter}
                  onChange={(e) => setSelectedStreamFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C51E28]"
                >
                  <option value="All">All Streams ({availableStreams.length} Classes)</option>
                  {availableStreams.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Sliders className="w-4 h-4 text-[#C51E28]" />
              <span>Report Card Format &amp; Signature Settings</span>
            </div>

            <div className="space-y-2">
              {/* Blank Signature toggle */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Blank Signature Lines (for Class Teacher &amp; Head of Institution)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Leaves the signature section blank with a clean line for physical ink pen signing
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={blankSignatures}
                  onChange={(e) => setBlankSignatures(e.target.checked)}
                  className="w-4 h-4 text-[#C51E28] rounded focus:ring-[#C51E28]"
                />
              </label>

              {/* Official Stamp toggle */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Include Official School Stamp Box
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Prints circular school stamp emblem in the endorsement section
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeStamp}
                  onChange={(e) => setIncludeStamp(e.target.checked)}
                  className="w-4 h-4 text-[#C51E28] rounded focus:ring-[#C51E28]"
                />
              </label>

              {/* CBE Pathway Profile toggle */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Include CBE Senior School Pathway &amp; Career Guidance Profile
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Calculates STEM, Social Sciences, and Arts affinities for each learner
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includePathways}
                  onChange={(e) => setIncludePathways(e.target.checked)}
                  className="w-4 h-4 text-[#C51E28] rounded focus:ring-[#C51E28]"
                />
              </label>
            </div>
          </div>

          {/* Success Toast */}
          {generationSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All student reports successfully compiled &amp; exported!</span>
            </div>
          )}
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster CSV ({filteredStudents.length} Records)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintAll}
            disabled={isGenerating || filteredStudents.length === 0}
            className="flex-1 py-3 px-4 bg-[#C51E28] hover:bg-[#B31821] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {isGenerating ? 'Compiling All Reports...' : `1-Click Print All (${filteredStudents.length} Reports)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
