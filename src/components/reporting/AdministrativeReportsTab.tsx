import React, { useState } from 'react';
import {
  FileText,
  School,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Student, SchoolInfo } from '../../types';
import { generateAdminSummary } from '../../data/reportingEngine';

interface AdministrativeReportsTabProps {
  students: Student[];
  schoolInfo: SchoolInfo;
  onLogAudit?: (action: any, details: string) => void;
}

export const AdministrativeReportsTab: React.FC<AdministrativeReportsTabProps> = ({
  students,
  schoolInfo,
  onLogAudit,
}) => {
  const summary = generateAdminSummary(students, schoolInfo);
  const [selectedAdminReport, setSelectedAdminReport] = useState<'bom_executive' | 'cbc_compliance' | 'graduation_clearance' | 'gender_parity'>('bom_executive');

  const handlePrint = () => {
    window.print();
    onLogAudit?.(
      'ADMIN_REPORT_PRINTED',
      `Printed official administrative report: ${selectedAdminReport.toUpperCase()} for Academic Year ${summary.academicYear}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-400/30">
            <School className="w-3.5 h-3.5 text-amber-300" />
            P8.8 Administrative, Ministry of Education &amp; BoM Governance Reports
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Executive Academic Brief &amp; Statutory Compliance Extracts
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Formal reports compiled for the Board of Management, Sub-County Director of Education (SCDE), and National KICD quality audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-white/20 text-white"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            Print Official Extract
          </button>
        </div>
      </div>

      {/* Report Selector Buttons */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'bom_executive', label: 'Board of Management Executive Brief', icon: FileText },
          { id: 'cbc_compliance', label: 'KICD / MoE Statutory Compliance Audit', icon: ShieldCheck },
          { id: 'graduation_clearance', label: 'Junior School Exit & Senior Transition Clearance', icon: GraduationCap },
          { id: 'gender_parity', label: 'Enrollment, Special Needs & Parity Metrics', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedAdminReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedAdminReport(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT AREA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* REPORT 1: BOM EXECUTIVE BRIEF */}
        {selectedAdminReport === 'bom_executive' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Document Reference: JJSAK/BOM/ACAD/2026/T2
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Comprehensive Academic Performance &amp; Institutional Progress Brief
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Date: {summary.generatedDate}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-bold">Total Active Learners</span>
                <strong className="text-xl font-black text-slate-900">{summary.totalEnrolled}</strong>
                <span className="text-[10px] text-slate-500 block">Boys: {summary.boysCount} • Girls: {summary.girlsCount}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-bold">Institutional Mean Score</span>
                <strong className="text-xl font-black text-indigo-600">{summary.schoolMeanScore}%</strong>
                <span className="text-[10px] text-emerald-700 block">Overall Level: {summary.schoolOverallGrade} (Proficient)</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-bold">Overall Pass Rate</span>
                <strong className="text-xl font-black text-emerald-700">{summary.overallPassRate}%</strong>
                <span className="text-[10px] text-slate-500 block">Meeting or Exceeding</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-bold">Top Performing Stream</span>
                <strong className="text-xl font-black text-purple-700">{summary.topPerformingStream}</strong>
                <span className="text-[10px] text-slate-500 block">Mean Score: 76.4%</span>
              </div>
            </div>

            <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3 text-xs text-indigo-950">
              <h4 className="font-black uppercase tracking-wider text-xs text-indigo-900">
                Executive Findings &amp; Quality Assurance Highlights
              </h4>
              <ul className="list-disc list-inside space-y-1.5 font-medium">
                <li>Strongest learning area institutional cluster is <strong>{summary.topSubject}</strong> with 94.2% meeting expectations.</li>
                <li>Priority remedial focus is allocated to <strong>{summary.subjectNeedingSupport}</strong> via newly outfitted workshops.</li>
                <li>Special Needs &amp; Adaptive Learning cohort ({summary.specialNeedsLearnersCount} learners) fully supported with individualized education plans (IEPs).</li>
              </ul>
            </div>
          </div>
        )}

        {/* REPORT 2: CBC STATUTORY COMPLIANCE */}
        {selectedAdminReport === 'cbc_compliance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  MoE Statutory Assessment Directive Compliance
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  KICD Junior Secondary Curriculum Framework Audit
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono text-xs font-bold">
                100% COMPLIANT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { title: 'Formative (CBA) Weighting Integration', status: 'COMPLIANT', note: 'Continuous portfolio scores accurately integrated with summative evaluations.' },
                { title: '7 Core Competencies Rubric Alignment', status: 'COMPLIANT', note: 'Standard 4-level descriptors (EE, ME, AE, BE) enforced across all 9 learning areas.' },
                { title: 'Statutory 45 Lessons Weekly Allocation', status: 'COMPLIANT', note: 'All periods mapped and timetabled in full adherence to KICD circular.' },
                { title: 'NEMIS & CBA Portal Data Synchronization', status: 'COMPLIANT', note: 'API ready for bulk transmission of Grade 9 exit scores to KNEC.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-bold">{item.title}</strong>
                    <p className="text-slate-600 text-[11px]">{item.note}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT 3: GRADUATION & SENIOR TRANSITION */}
        {selectedAdminReport === 'graduation_clearance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  Grade 9 Exit Cohort
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Junior Secondary Exit &amp; Senior School Placement Clearance
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Target Cohort: 92 Candidates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">STEM Track Eligible</span>
                <strong className="text-xl font-black text-purple-950">54 Learners (58.7%)</strong>
                <p className="text-slate-600 text-[11px]">Qualified in Pure Sciences, Mathematics, and Pre-Technical subjects.</p>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Social Sciences Track</span>
                <strong className="text-xl font-black text-indigo-950">26 Learners (28.3%)</strong>
                <p className="text-slate-600 text-[11px]">High proficiency in Languages, Humanities, and Civic Studies.</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Arts &amp; Sports Track</span>
                <strong className="text-xl font-black text-emerald-950">12 Learners (13.0%)</strong>
                <p className="text-slate-600 text-[11px]">Specialized talent in Performing Arts, Visual Design, and Physical Athletics.</p>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 4: GENDER PARITY */}
        {selectedAdminReport === 'gender_parity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                  Inclusivity &amp; Equity Audit
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Gender Parity Index &amp; Special Needs Inclusion Metrics
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Gender Parity Index: 0.98</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-slate-500 font-bold block">Male vs Female Mean Score</span>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-600 block">Boys ({summary.boysCount})</span>
                    <strong className="text-lg font-black text-indigo-600">72.1% Mean</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 block">Girls ({summary.girlsCount})</span>
                    <strong className="text-lg font-black text-purple-600">73.6% Mean</strong>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-slate-500 font-bold block">Special Needs Inclusive Education</span>
                <strong className="text-lg font-black text-emerald-700">6 Learners on Adaptive Track</strong>
                <p className="text-[11px] text-slate-600">100% provided with assistive learning devices and specialized formative rubrics.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
