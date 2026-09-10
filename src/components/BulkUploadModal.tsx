import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Student } from '../types';
import { calculateGrade, calculateStudentAverage, calculateStudentRankings } from '../data/mockData';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onUploadSuccess: (students: Student[]) => void;
}

interface ParsedRow {
  admNo: string;
  name: string;
  grade: string;
  classArm: string;
  english?: number | null;
  kiswahili?: number | null;
  math?: number | null;
  science?: number | null;
  social_studies?: number | null;
  cre?: number | null;
  agriculture?: number | null;
  pretechnical?: number | null;
  creative_arts?: number | null;
  parentName?: string;
  parentPhone?: string;
  isValid: boolean;
  errors: string[];
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      'Admission No,Student Name,Grade,Class Stream,English,Kiswahili,Mathematics,Integrated Science,Social Studies,CRE,Agriculture,Pretechnical Studies,Creative Arts,Parent Name,Parent Phone\n' +
      'ADM-2026-0201,Kevin Mwangi,G8,G8 S,85,82,88,84,80,90,79,87,75,David Mwangi,+254 722 111 222\n' +
      'ADM-2026-0202,Mercy Achieng,G8,G8 S,90,88,92,86,85,94,88,91,84,Grace Achieng,+254 733 444 555\n' +
      'ADM-2026-0203,Brian Kibet,G8,G8 N,78,74,80,75,70,80,72,76,68,John Kibet,+254 711 666 777\n' +
      'ADM-2026-0204,Faith Wambui,G7,G7 S,88,86,84,89,82,90,85,88,82,Esther Wambui,+254 720 888 999\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'JJSAK_Learner_Bulk_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseScore = (val: string | undefined): number | null => {
    if (!val || val.trim() === '' || val.trim() === '-') return null;
    const num = parseFloat(val.trim());
    return isNaN(num) ? null : Math.max(0, Math.min(100, Math.round(num)));
  };

  const processCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setStatusMessage('CSV file is empty or contains only headers.');
      return;
    }

    const rows: ParsedRow[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle comma separation
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) continue;

      const admNo = cols[0] || `ADM-2026-${String(i).padStart(4, '0')}`;
      const name = cols[1] || `Learner ${i}`;
      const grade = (cols[2] || 'G8').toUpperCase();
      const classArm = cols[3] || `${grade} S`;

      const english = parseScore(cols[4]);
      const kiswahili = parseScore(cols[5]);
      const math = parseScore(cols[6]);
      const science = parseScore(cols[7]);
      const social_studies = parseScore(cols[8]);
      const cre = parseScore(cols[9]);
      const agriculture = parseScore(cols[10]);
      const pretechnical = parseScore(cols[11]);
      const creative_arts = parseScore(cols[12]);
      const parentName = cols[13] || '';
      const parentPhone = cols[14] || '';

      const errors: string[] = [];
      if (!name) errors.push('Name missing');
      if (!admNo) errors.push('Admission No missing');

      rows.push({
        admNo,
        name,
        grade,
        classArm,
        english,
        kiswahili,
        math,
        science,
        social_studies,
        cre,
        agriculture,
        pretechnical,
        creative_arts,
        parentName,
        parentPhone,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) processCSVText(content);
    };
    reader.readAsText(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) processCSVText(content);
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleConfirmUpload = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    const convertedStudents: Student[] = parsedRows.map((row, index) => {
      const getInitials = (n: string) =>
        n
          .split(' ')
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'ST';

      const subjects = [
        {
          subject: 'English',
          score: row.english ?? null,
          grade: calculateGrade(row.english).grade,
          remarks: calculateGrade(row.english).remarks,
        },
        {
          subject: 'Kiswahili',
          score: row.kiswahili ?? null,
          grade: calculateGrade(row.kiswahili).grade,
          remarks: calculateGrade(row.kiswahili).remarks,
        },
        {
          subject: 'Mathematics',
          score: row.math ?? null,
          grade: calculateGrade(row.math).grade,
          remarks: calculateGrade(row.math).remarks,
        },
        {
          subject: 'Integrated Science',
          score: row.science ?? null,
          grade: calculateGrade(row.science).grade,
          remarks: calculateGrade(row.science).remarks,
        },
        {
          subject: 'Social Studies',
          score: row.social_studies ?? null,
          grade: calculateGrade(row.social_studies).grade,
          remarks: calculateGrade(row.social_studies).remarks,
        },
        {
          subject: 'CRE',
          score: row.cre ?? null,
          grade: calculateGrade(row.cre).grade,
          remarks: calculateGrade(row.cre).remarks,
        },
        {
          subject: 'Agriculture',
          score: row.agriculture ?? null,
          grade: calculateGrade(row.agriculture).grade,
          remarks: calculateGrade(row.agriculture).remarks,
        },
        {
          subject: 'Pretechnical Studies',
          score: row.pretechnical ?? null,
          grade: calculateGrade(row.pretechnical).grade,
          remarks: calculateGrade(row.pretechnical).remarks,
        },
        {
          subject: 'Creative Arts',
          score: row.creative_arts ?? null,
          grade: calculateGrade(row.creative_arts).grade,
          remarks: calculateGrade(row.creative_arts).remarks,
        },
      ];

      const avgResult = calculateStudentAverage(subjects);
      const avgScore = avgResult.avgScore;
      const overallGrade = avgResult.overallGrade || calculateGrade(avgScore).grade;

      return {
        id: `std-bulk-${Date.now()}-${index}`,
        admNo: row.admNo,
        name: row.name,
        grade: row.grade,
        classArm: row.classArm,
        term: 'Term 2, 2026',
        year: 2026,
        avatarInitials: getInitials(row.name),
        avgScore,
        overallGrade,
        position: '1/1',
        streamPosition: '1/1',
        gradePosition: '1/1',
        attendance: 95,
        classTeacherComment:
          'Diligent learner with commendable academic discipline and competency mastery.',
        classTeacherName: 'Class Teacher',
        headTeacherComment:
          'Commendable term progress. Keep up the high standards and focus.',
        headOfSchoolName: 'Mrs. J. Barasa',
        nextTermDate: '5th August 2026',
        parentName: row.parentName || '',
        parentPhone: row.parentPhone || '',
        parents: row.parentName
          ? [
              {
                id: `p-${Date.now()}-${index}`,
                name: row.parentName,
                phoneNumber: row.parentPhone || '',
                relation: 'Father',
              },
            ]
          : [],
        subjects,
      };
    });

    let finalStudentList: Student[] = [];
    if (uploadMode === 'replace') {
      finalStudentList = calculateStudentRankings(convertedStudents);
    } else {
      // Append mode: merge with existing (update matching admNo or append)
      const existingMap = new Map(existingStudents.map((s) => [s.admNo, s]));
      convertedStudents.forEach((newS) => {
        existingMap.set(newS.admNo, newS);
      });
      finalStudentList = calculateStudentRankings(Array.from(existingMap.values()));
    }

    onUploadSuccess(finalStudentList);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-[#C51E28] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Upload className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight">
                Bulk Learner Onboarding & CSV Upload
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Register multiple learners and import subject assessment scores fast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          {/* Download CSV Template Action */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-blue-950 text-xs">Need the official template?</div>
                <div className="text-[11px] text-blue-700 font-medium">
                  Includes all 9 CBE learning areas and pre-filled sample rows.
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              isDragOver
                ? 'border-red-500 bg-red-50/50'
                : 'border-slate-300 hover:border-[#C51E28] bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <div className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Click to select CSV or drag & drop here'}
            </div>
            <div className="text-slate-500 text-[11px] mt-1 font-medium">
              Supported format: .CSV (Comma Separated Values)
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              {statusMessage}
            </div>
          )}

          {/* Upload Mode Selector */}
          {parsedRows.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Upload Action Mode:</span>
                <div className="text-[11px] text-slate-500 font-medium">
                  {uploadMode === 'append'
                    ? 'Merge with existing learners (update matching Adm No)'
                    : 'Replace entire student list with this CSV'}
                </div>
              </div>
              <div className="flex bg-slate-200 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUploadMode('append')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    uploadMode === 'append' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Append / Merge
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('replace')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    uploadMode === 'replace'
                      ? 'bg-[#C51E28] text-white shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Replace All
                </button>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Preview ({parsedRows.length} Learners Ready)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  All 9 subjects will be imported
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <th className="py-2 px-2.5">Adm No</th>
                      <th className="py-2 px-2.5">Learner Name</th>
                      <th className="py-2 px-2 text-center">Class</th>
                      <th className="py-2 px-2 text-center">Eng</th>
                      <th className="py-2 px-2 text-center">Math</th>
                      <th className="py-2 px-2 text-center">Sci</th>
                      <th className="py-2 px-2 text-center">Pretech</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 text-slate-500 font-mono">{r.admNo}</td>
                        <td className="py-1.5 px-2.5 font-bold text-slate-900">{r.name}</td>
                        <td className="py-1.5 px-2 text-center">{r.classArm}</td>
                        <td className="py-1.5 px-2 text-center text-slate-600">{r.english ?? '-'}</td>
                        <td className="py-1.5 px-2 text-center text-slate-600">{r.math ?? '-'}</td>
                        <td className="py-1.5 px-2 text-center text-slate-600">{r.science ?? '-'}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-[#C51E28]">{r.pretechnical ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmUpload}
            disabled={parsedRows.length === 0 || isProcessing}
            className="px-5 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Onboarding Learners...'
                : `Confirm & Import ${parsedRows.length} Learners`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
