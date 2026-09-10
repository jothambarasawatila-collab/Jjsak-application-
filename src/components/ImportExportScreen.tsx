import React, { useState } from 'react';
import {
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { Student, Assessment } from '../types';

interface ImportExportScreenProps {
  students: Student[];
  assessments: Assessment[];
  onBack: () => void;
  onImportSuccess?: (msg: string) => void;
  onOpenBulkUpload?: () => void;
}

export const ImportExportScreen: React.FC<ImportExportScreenProps> = ({
  students,
  assessments,
  onBack,
  onOpenBulkUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = 'ADM No,Name,Grade,Class,Average Score,Performance Level,Position,Attendance,Parent / Guardian Name,Parent Phone\n';
    const rows = students
      .map(
        (s) => {
          const parentName = s.parents && s.parents[0] ? s.parents[0].name : (s.parentName || '-');
          const parentPhone = s.parents && s.parents[0] ? s.parents[0].phoneNumber : (s.parentPhone || '-');
          return `"${s.admNo}","${s.name}","${s.grade}","${s.classArm}","${
            s.avgScore !== null && s.avgScore !== undefined ? `${s.avgScore}%` : '-'
          }","${s.overallGrade || '-'}","${s.position || '-'}","${s.attendance}%","${parentName}","${parentPhone}"`;
        }
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JJSAK_Students_Performance_Term2_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setImportedStatus('Student grades and parent contact data exported to CSV successfully!');
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ students, assessments }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `JJSAK_Assessment_Full_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setImportedStatus('Full backup JSON file downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-bold text-white tracking-tight">Import / Export</h1>
        <div className="w-9" />
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-2 text-center text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-3 transition relative ${
              activeTab === 'export' ? 'text-[#C51E28]' : 'text-slate-500'
            }`}
          >
            <span>Export Reports</span>
            {activeTab === 'export' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C51E28]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-3 transition relative ${
              activeTab === 'import' ? 'text-[#C51E28]' : 'text-slate-500'
            }`}
          >
            <span>Import Marks</span>
            {activeTab === 'import' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C51E28]" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {importedStatus && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importedStatus}</span>
          </div>
        )}

        {activeTab === 'export' ? (
          <div className="flex flex-col gap-3">
            {/* Export Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Export Class Broad-Sheets & Marks
              </h3>
              <p className="text-xs text-slate-500">
                Download consolidated performance sheets formatted for Ministry reporting and parent records.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download Excel/CSV Spreadsheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <FileCode className="w-4 h-4 text-[#C51E28]" />
                  <span>Download Full Data Backup (JSON)</span>
                </button>
              </div>
            </div>

            {/* Ready to Print batch */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Print All Report Cards</h4>
                <p className="text-[11px] text-slate-500">G8 S (32 Students)</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-xs transition"
              >
                Print Batch
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C51E28] flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bulk Learner Registration & Marks Upload</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload official CBE CSV spreadsheets with student biodata and all 9 learning area assessment scores.
              </p>
            </div>

            <div
              onClick={() => onOpenBulkUpload && onOpenBulkUpload()}
              className="border-2 border-dashed border-slate-300 hover:border-[#C51E28] bg-slate-50 rounded-2xl p-6 transition flex flex-col items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-8 h-8 text-slate-400" />
              <span className="text-xs font-bold text-slate-800">Click to Open Bulk CSV Onboarding Wizard</span>
              <span className="text-[10px] text-slate-500">Supports .CSV with live validation & preview</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenBulkUpload && onOpenBulkUpload()}
              className="py-3 rounded-xl bg-[#C51E28] text-white text-xs font-bold shadow-md hover:bg-[#B31821] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Launch CSV Bulk Onboarding</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
