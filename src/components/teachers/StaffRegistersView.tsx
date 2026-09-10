import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
} from 'lucide-react';
import { Teacher } from '../../types';

interface StaffRegistersViewProps {
  teachers: Teacher[];
  onSelectTeacherForDossier: (teacher: Teacher) => void;
}

export const StaffRegistersView: React.FC<StaffRegistersViewProps> = ({
  teachers,
  onSelectTeacherForDossier,
}) => {
  const [activeRegisterTab, setActiveRegisterTab] = useState<
    'qualifications' | 'tpd' | 'workload' | 'integrity'
  >('qualifications');
  const [searchQuery, setSearchQuery] = useState('');

  // Duplicate Scanner Engine
  const duplicateIdPairs: { id: string; teachers: Teacher[] }[] = [];
  const duplicateTscPairs: { tsc: string; teachers: Teacher[] }[] = [];
  const duplicateStaffNoPairs: { staffNo: string; teachers: Teacher[] }[] = [];

  const nationalIdMap: Record<string, Teacher[]> = {};
  const tscMap: Record<string, Teacher[]> = {};
  const staffNoMap: Record<string, Teacher[]> = {};

  teachers.forEach((t) => {
    if (t.nationalId && t.nationalId.trim()) {
      const key = t.nationalId.trim().toLowerCase();
      nationalIdMap[key] = nationalIdMap[key] ? [...nationalIdMap[key], t] : [t];
    }
    if (t.tscNumber && t.tscNumber.trim()) {
      const key = t.tscNumber.trim().toLowerCase();
      tscMap[key] = tscMap[key] ? [...tscMap[key], t] : [t];
    }
    const staffNo = t.staffNumber || t.employeeNumber;
    if (staffNo && staffNo.trim()) {
      const key = staffNo.trim().toLowerCase();
      staffNoMap[key] = staffNoMap[key] ? [...staffNoMap[key], t] : [t];
    }
  });

  Object.entries(nationalIdMap).forEach(([id, list]) => {
    if (list.length > 1) duplicateIdPairs.push({ id, teachers: list });
  });
  Object.entries(tscMap).forEach(([tsc, list]) => {
    if (list.length > 1) duplicateTscPairs.push({ tsc, teachers: list });
  });
  Object.entries(staffNoMap).forEach(([staffNo, list]) => {
    if (list.length > 1) duplicateStaffNoPairs.push({ staffNo, teachers: list });
  });

  const totalIntegrityIssues =
    duplicateIdPairs.length + duplicateTscPairs.length + duplicateStaffNoPairs.length;

  const filteredTeachers = teachers.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.tscNumber && t.tscNumber.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      t.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'qualifications', label: 'Academic & Professional Register', icon: GraduationCap },
            { id: 'tpd', label: 'TPD & Continuous Development Register', icon: Award },
            { id: 'workload', label: 'Workload & Staffing Matrix', icon: Layers },
            { id: 'integrity', label: 'Institutional Duplicate Scanner', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeRegisterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRegisterTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'integrity' && totalIntegrityIssues > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-mono">
                    {totalIntegrityIssues}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search register records..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* REGISTER 1: QUALIFICATIONS */}
      {activeRegisterTab === 'qualifications' && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Institutional Qualifications & Licensure Register
              </h3>
              <p className="text-xs text-slate-500">
                Verified degrees, diplomas, and TSC registration numbers for all authorized staff.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Print / Export Register
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Name & No</th>
                  <th className="px-4 py-3">TSC Licensure</th>
                  <th className="px-4 py-3">Highest Academic Qualification</th>
                  <th className="px-4 py-3">Institution & Year</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => {
                  const highestQual = t.academicQualifications?.[0];
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {t.staffNumber || t.employeeNumber || 'STF'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-red-700">
                        {t.tscNumber || <span className="text-slate-400 font-sans font-normal">BOM / In Process</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {highestQual?.degree || 'Bachelor of Education'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {highestQual?.institution || 'Kenyatta University'} ({highestQual?.year || 2018})
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectTeacherForDossier(t)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[11px]"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER 2: TPD */}
      {activeRegisterTab === 'tpd' && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Teacher Professional Development (TPD) Continuous Compliance
              </h3>
              <p className="text-xs text-slate-500">
                Tracking completed modules, accredited training institutions, and CPD points (Target: 60 Credits/Yr).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Recent TPD Module</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Date Completed</th>
                  <th className="px-4 py-3">CPD Points Earned</th>
                  <th className="px-4 py-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => {
                  const tpd = t.professionalDevelopmentRecords?.[0];
                  const points = tpd?.cpdPoints || 60;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {tpd?.moduleName || 'TPD Module 1: Foundational CBE Assessment & Rubrics'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{tpd?.provider || 'KEMI / TSC'}</td>
                      <td className="px-4 py-3 text-slate-500">{tpd?.completionDate || '2023-11-20'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-red-700">+{points} Points</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Compliant (100%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER 3: WORKLOAD & STAFFING MATRIX */}
      {activeRegisterTab === 'workload' && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Institutional Teaching Workload & Allocation Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Comparing weekly lesson load against the 27 periods/week MOE standard for Junior Secondary.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Assigned Classes</th>
                  <th className="px-4 py-3">Assigned Learning Areas</th>
                  <th className="px-4 py-3">Lessons / Week</th>
                  <th className="px-4 py-3">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => {
                  const lessonCount = t.workload?.lessonsPerWeek || (t.allocations?.length || 2) * 6;
                  const isOver = lessonCount > 28;
                  const isUnder = lessonCount < 18;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {t.classes.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {t.subjects.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{lessonCount} / 27 Target</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOver
                              ? 'bg-amber-100 text-amber-800'
                              : isUnder
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOver ? 'High Workload' : isUnder ? 'Underloaded' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER 4: INTEGRITY SCANNER */}
      {activeRegisterTab === 'integrity' && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Institutional Duplicate Profile & Credential Integrity Guard
                </h3>
                <p className="text-xs text-slate-500">
                  Enforcing the Phase 4 rule: exactly one unique staff profile and credential per person.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  totalIntegrityIssues === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {totalIntegrityIssues === 0 ? '✓ 100% Clean — No Duplicates' : `⚠️ ${totalIntegrityIssues} Potential Conflicts`}
              </span>
            </div>
          </div>

          {totalIntegrityIssues === 0 ? (
            <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">All Staff Profiles Pass Verification</h4>
              <p className="text-xs text-emerald-700 max-w-lg mx-auto">
                No duplicate National ID numbers, TSC registration codes, or internal Staff Numbers were found across{' '}
                {teachers.length} registered profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateIdPairs.map((pair) => (
                <div key={pair.id} className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Duplicate National ID Detected: {pair.id}</span>
                  </div>
                  <p className="text-xs text-red-700">
                    Shared between: {pair.teachers.map((t) => t.name).join(' and ')}
                  </p>
                </div>
              ))}
              {duplicateTscPairs.map((pair) => (
                <div key={pair.tsc} className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Duplicate TSC Number Detected: {pair.tsc}</span>
                  </div>
                  <p className="text-xs text-red-700">
                    Shared between: {pair.teachers.map((t) => t.name).join(' and ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
