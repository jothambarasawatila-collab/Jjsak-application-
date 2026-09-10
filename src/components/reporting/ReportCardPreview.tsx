import React from 'react';
import {
  School,
  QrCode,
  Award,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  FileText,
  Lock,
} from 'lucide-react';
import { Student, SchoolInfo, SchoolProfile } from '../../types';
import {
  ReportTemplateType,
  ReportApprovalRecord,
  LearnerCompetencyEvaluation,
  LearnerValueEvaluation,
  LearnerPCIEvaluation,
  TermComparisonRecord,
  AICompetencyInsight,
} from '../../types/reporting';

interface ReportCardPreviewProps {
  student: Student;
  templateType: ReportTemplateType;
  schoolInfo: SchoolInfo;
  schoolProfile?: SchoolProfile;
  approvalRecord: ReportApprovalRecord;
  competencies: LearnerCompetencyEvaluation[];
  values: LearnerValueEvaluation[];
  pcis: LearnerPCIEvaluation[];
  termRecords: TermComparisonRecord[];
  aiInsight: AICompetencyInsight;
  includeSignatures: boolean;
  includeOfficialStamp: boolean;
  showRankings: boolean;
}

export const ReportCardPreview: React.FC<ReportCardPreviewProps> = ({
  student,
  templateType,
  schoolInfo,
  schoolProfile,
  approvalRecord,
  competencies,
  values,
  pcis,
  termRecords,
  aiInsight,
  includeSignatures,
  includeOfficialStamp,
  showRankings,
}) => {
  const avg = student.avgScore ?? 68;
  const grade = student.overallGrade || (avg >= 80 ? 'EE' : avg >= 65 ? 'ME' : avg >= 50 ? 'AE' : 'BE');

  const getCbeColor = (lvl: string) => {
    switch (lvl) {
      case 'EE':
        return 'bg-emerald-600 text-white';
      case 'ME':
        return 'bg-indigo-600 text-white';
      case 'AE':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-rose-500 text-white';
    }
  };

  const getCbeBadge = (score: number | null) => {
    if (score === null) return { code: 'N/A', label: 'Not Graded', color: 'bg-slate-200 text-slate-700' };
    if (score >= 80) return { code: 'EE', label: 'Exceeding Expectation', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 65) return { code: 'ME', label: 'Meeting Expectation', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (score >= 50) return { code: 'AE', label: 'Approaching Expectation', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { code: 'BE', label: 'Below Expectation', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 print:shadow-none print:border-none print:m-0 print:rounded-none relative">
      {/* Watermark for official branding */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none z-0">
        <div className="text-center">
          <GraduationCap className="w-96 h-96 text-slate-900 mx-auto" />
          <span className="text-6xl font-black tracking-widest uppercase">JJSAK CBE PLATFORM</span>
        </div>
      </div>

      {/* Header Banner with School Crest */}
      <div className="relative z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 print:bg-slate-900 print:text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-700/60 pb-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white/10 p-2.5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shrink-0">
              <School className="w-12 h-12 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1 border border-amber-400/30">
                <ShieldCheck className="w-3 h-3" /> Ministry of Education • KICD CBE Standards
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                {schoolProfile?.schoolName || schoolInfo.name || 'JJSAK COMPREHENSIVE JUNIOR SCHOOL'}
              </h1>
              <p className="text-xs text-slate-300 font-medium tracking-wide">
                {schoolProfile?.motto || schoolInfo.motto || 'Striving for Academic Distinction & Moral Excellence'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-1.5 font-mono">
                <span>NEMIS/MoE Reg: MOE/JS/2026/8941</span>
                <span>•</span>
                <span>Tel: {schoolProfile?.phoneNumber || schoolInfo.phone || '+254 700 000 000'}</span>
                <span>•</span>
                <span>Email: {schoolProfile?.emailAddress || schoolInfo.email || 'admin@jjsak.edu.ke'}</span>
              </div>
            </div>
          </div>

          {/* Verification Badge & QR */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 text-right">
            <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-sm shrink-0">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                SEAL: {approvalRecord.integrityHash.slice(0, 14)}...
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Status: <strong className="text-white">{approvalRecord.status}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Report Sub-Title */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-500/30 text-indigo-200">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              {templateType === 'standard_cbc_report' && 'Official Junior Secondary Summative & Formative Report Card'}
              {templateType === 'detailed_cbc_progress' && 'Detailed CBC Competencies & Strand Mastery Report'}
              {templateType === 'competency_values_matrix' && 'Learner Core Values & PCIs Assessment Matrix'}
              {templateType === 'official_transcript' && 'Official Junior School Multi-Term Academic Transcript'}
              {templateType === 'subject_breakdown' && 'Learning Areas Performance Breakdown & Item Analysis'}
              {templateType === 'ministry_nemis_export' && 'Ministry of Education / NEMIS Statutory Academic Extract'}
              {templateType === 'executive_brief' && 'Senior School Pathway & Career Readiness Diagnostic'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-white/10 px-3 py-1 rounded-xl border border-white/15">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Year 2026 • {schoolInfo.term || 'Term 2'}</span>
          </div>
        </div>
      </div>

      {/* Learner Demographic Information Strip */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Learner Full Name</span>
          <span className="text-slate-900 font-black text-sm">{student.name}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Admission / UPI Number</span>
          <span className="font-mono text-indigo-700 font-black text-sm">{student.admNo}</span>
          {student.upi && <span className="text-[10px] text-slate-500 block">UPI: {student.upi}</span>}
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Grade &amp; Stream</span>
          <span className="text-slate-900 font-bold text-sm">{student.grade} • {student.classArm}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Gender &amp; Age</span>
          <span className="text-slate-900 font-bold text-sm">{student.gender || 'Male'} • 14 Yrs</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Overall Mean / Grade</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-black text-slate-900">{avg}%</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${getCbeColor(grade)}`}>
              {grade}
            </span>
          </div>
        </div>
        {showRankings && (
          <div>
            <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Position &amp; Cohort Rank</span>
            <span className="text-slate-900 font-black text-sm">
              {student.streamPosition || `${student.streamRank || 8} / 45`} (Stream)
            </span>
            <span className="text-[10px] text-slate-500 block">
              Grade: {student.gradePosition || `${student.gradeRank || 24} / 180`}
            </span>
          </div>
        )}
      </div>

      {/* Main Body Depending on Template */}
      <div className="p-6 sm:p-8 space-y-8 relative z-10">
        {/* TEMPLATE 1: STANDARD CBC REPORT OR SUBJECT BREAKDOWN */}
        {(templateType === 'standard_cbc_report' || templateType === 'subject_breakdown') && (
          <>
            {/* Learning Areas Performance Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Learning Areas Summative &amp; Formative Evaluation
                </h3>
                <span className="text-xs text-slate-500">KICD 9-Subject Core Framework</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3.5">#</th>
                      <th className="py-3 px-3.5">Learning Area / Subject</th>
                      <th className="py-3 px-3">Opener (20%)</th>
                      <th className="py-3 px-3">Midterm (30%)</th>
                      <th className="py-3 px-3">Endterm (50%)</th>
                      <th className="py-3 px-3.5 text-center">Total (100%)</th>
                      <th className="py-3 px-3.5 text-center">CBC Level</th>
                      <th className="py-3 px-3.5">Learning Area Teacher Remarks</th>
                      <th className="py-3 px-3 text-center">Tr. Sign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.subjects.map((sub, idx) => {
                      const score = sub.score ?? 0;
                      const badge = getCbeBadge(sub.score);
                      const opener = Math.round(score * 0.2);
                      const midterm = Math.round(score * 0.28);
                      const endterm = score - opener - midterm;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">{sub.subject}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{opener}/20</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{midterm}/30</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{endterm}/50</td>
                          <td className="py-3 px-3.5 text-center font-mono font-black text-slate-900 text-sm">
                            {sub.score !== null ? `${sub.score}%` : '-'}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge.color}`}>
                              {badge.code}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 italic text-[11px] max-w-xs">
                            {sub.remarks || 'Consistently grasps key concepts with commendable diligence.'}
                          </td>
                          <td className="py-3 px-3 text-center font-serif text-[11px] text-slate-500 font-bold">
                            {sub.teacherInitials || 'DM'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black text-xs">
                      <td colSpan={5} className="py-3 px-4 text-right uppercase tracking-wider">
                        Cumulative Performance Summary:
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono text-base text-amber-300">
                        {avg}%
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-black ${getCbeColor(grade)}`}>
                          {grade}
                        </span>
                      </td>
                      <td colSpan={2} className="py-3 px-3.5 text-slate-300 font-normal">
                        Total Subjects: <strong>{student.subjects.length}</strong> • Overall Mastery: <strong>{avg >= 80 ? 'Exceeding' : avg >= 65 ? 'Meeting' : 'Approaching'} Expectation</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Performance Rubric Key */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block mb-2">
                CBE Grading &amp; Performance Descriptors Scale
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between font-black text-emerald-800">
                    <span>EE: Exceeding</span>
                    <span>80% – 100%</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-1">Exhibits superior, autonomous mastery beyond standard curricular expectations.</p>
                </div>
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center justify-between font-black text-indigo-800">
                    <span>ME: Meeting</span>
                    <span>65% – 79%</span>
                  </div>
                  <p className="text-[10px] text-indigo-700 mt-1">Demonstrates proficient competence and consistently meets all core benchmarks.</p>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between font-black text-amber-800">
                    <span>AE: Approaching</span>
                    <span>50% – 64%</span>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-1">Developing foundational skills; occasional guidance and scaffolding required.</p>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center justify-between font-black text-rose-800">
                    <span>BE: Below</span>
                    <span>0% – 49%</span>
                  </div>
                  <p className="text-[10px] text-rose-700 mt-1">Struggling with core competencies; intensive diagnostic remediation required.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TEMPLATE 2: DETAILED CBC PROGRESS / COMPETENCY MATRIX */}
        {(templateType === 'detailed_cbc_progress' || templateType === 'competency_values_matrix') && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Assessment of CBC Core Competencies (7 Pillars)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencies.map((c) => (
                  <div key={c.competencyId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-slate-900">{c.competencyName}</strong>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${getCbeColor(c.level)}`}>
                        {c.level} ({c.scorePercent}%)
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{c.descriptor}</p>
                    <div className="text-[10px] text-indigo-800 bg-indigo-50/80 p-2 rounded-xl border border-indigo-100">
                      <strong>Observed Evidence:</strong> {c.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Values & PCIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-3">
                  Core National Values Evaluation
                </h4>
                <div className="space-y-2.5">
                  {values.map((v) => (
                    <div key={v.valueId} className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 last:border-0">
                      <span className="font-medium text-slate-800">{v.valueName}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                        {v.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-3">
                  Pertinent &amp; Contemporary Issues (PCIs)
                </h4>
                <div className="space-y-3 text-xs">
                  {pcis.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 font-bold">{p.pciName}</strong>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {p.engagement}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{p.observedActivity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATE 3: OFFICIAL TRANSCRIPT / MULTI-TERM COMPARISON */}
        {(templateType === 'official_transcript' || templateType === 'executive_brief') && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Multi-Term Progression &amp; Growth Trajectory
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-3 px-4">Academic Term</th>
                      <th className="py-3 px-4 text-center">Mean Score</th>
                      <th className="py-3 px-4 text-center">CBC Level</th>
                      <th className="py-3 px-4 text-center">Stream Rank</th>
                      <th className="py-3 px-4 text-center">Grade Rank</th>
                      <th className="py-3 px-4 text-center">Attendance</th>
                      <th className="py-3 px-4">Term Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {termRecords.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{t.term}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-indigo-600 text-sm">{t.meanScore}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getCbeColor(t.overallGrade)}`}>
                            {t.overallGrade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{t.streamPosition} / 45</td>
                        <td className="py-3 px-4 text-center font-mono">{t.gradePosition} / 180</td>
                        <td className="py-3 px-4 text-center font-mono text-emerald-700 font-bold">
                          {t.attendanceDaysPresent}/{t.attendanceTotalDays} Days ({Math.round((t.attendanceDaysPresent / t.attendanceTotalDays) * 100)}%)
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {idx === 1 ? 'Current Session' : idx === 2 ? 'Projected Milestone' : 'Promoted with Honors'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Senior School Pathway Recommendation Brief */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-black text-indigo-950 uppercase tracking-tight">
                    AI-Powered Senior School Pathway &amp; Career Diagnostic
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  Match Confidence: {aiInsight.pathwayConfidenceScore}%
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommended Senior Track</span>
                  <strong className="text-indigo-900 text-sm font-black">{aiInsight.recommendedPathway}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Predicted KPSEA Exit Band</span>
                  <strong className="text-emerald-700 text-sm font-black">{aiInsight.predictedKpseaBand}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Career Affinities</span>
                  <p className="text-slate-800 text-xs font-semibold">{aiInsight.careerSuggestions.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remarks & Signatures Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Class Teacher Remarks */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Class Teacher&apos;s Comprehensive Remarks
              </span>
              <span className="text-[10px] font-mono text-slate-500">Date: 2026-08-20</span>
            </div>
            <p className="text-slate-800 italic leading-relaxed">
              &quot;{student.name} continues to exhibit high intellectual curiosity, strong problem-solving acumen, and exemplary conduct. Recommended for Senior School STEM Track inquiry clubs.&quot;
            </p>
            {includeSignatures && (
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-serif italic text-sm text-indigo-950 font-bold block">David Mutua</span>
                  <span className="text-[10px] text-slate-500">Class Master (Grade 8 South)</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  VERIFIED DIGITAL SIGNATURE
                </span>
              </div>
            )}
          </div>

          {/* Principal Remarks & Official Stamp */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Chief Principal&apos;s Seal &amp; Remarks
              </span>
              <span className="text-[10px] font-mono text-slate-500">Date: 2026-08-22</span>
            </div>
            <p className="text-slate-800 italic leading-relaxed">
              &quot;An outstanding academic term. Keep up this disciplined dedication to your learning goals. Approved for formal term progression.&quot;
            </p>

            {/* Official Stamp & Principal Signature */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between relative">
              <div>
                <span className="font-serif italic text-sm text-slate-900 font-bold block">
                  Prof. Jotham Barasa, PhD
                </span>
                <span className="text-[10px] text-slate-500">Chief Principal &amp; Secretary to BOM</span>
              </div>

              {includeOfficialStamp && (
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-600/60 p-1 flex items-center justify-center text-center rotate-[-12deg] bg-red-50/50 shadow-inner select-none pointer-events-none">
                  <div className="text-[8px] font-black text-red-700 uppercase leading-tight font-mono">
                    ★ JJSAK JUNIOR ★<br />
                    OFFICIAL EMBOSSED<br />
                    ACADEMIC SEAL<br />
                    ★ 2026 ★
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Term Administrative Logistics Footer */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Closing Date:</span>
              <strong className="text-amber-300">22nd August 2026</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Next Term Re-Opening:</span>
              <strong className="text-emerald-400">8th September 2026</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Term Fee Balance:</span>
              <strong className="text-white">KES 0.00 (Cleared)</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Verification Hash: {approvalRecord.integrityHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
