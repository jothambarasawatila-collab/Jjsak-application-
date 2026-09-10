import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  Search,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { Teacher, Student } from '../../types';
import { generateMarkEntryAudit, generateTeacherPerformanceMetrics } from '../../data/reportingEngine';

interface TeacherReportingTabProps {
  teachers: Teacher[];
  students?: Student[];
  onLogAudit?: (action: any, details: string) => void;
}

export const TeacherReportingTab: React.FC<TeacherReportingTabProps> = ({
  teachers,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mark_entry' | 'teacher_performance' | 'class_teacher_overview'>('mark_entry');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const markEntryList = generateMarkEntryAudit(teachers);
  const teacherPerformanceList = generateTeacherPerformanceMetrics(teachers);

  const completedEntries = markEntryList.filter((m) => m.status === 'COMPLETE').length;
  const inProgressEntries = markEntryList.filter((m) => m.status === 'IN_PROGRESS').length;
  const overallCompliancePct = Math.round(
    (markEntryList.reduce((acc, m) => acc + m.marksEntered, 0) /
      markEntryList.reduce((acc, m) => acc + m.enrolledStudents, 0)) *
      100
  );

  const handleSendReminder = (item: any) => {
    onLogAudit?.(
      'TEACHER_REMINDER_DISPATCHED',
      `Dispatched automated mark entry submission reminder to ${item.teacherName} for ${item.subjectName} (${item.gradeArm}).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-400/30">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            P8.7 Teacher Reporting, Assessment Audits &amp; Pedagogical Metrics
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Mark Entry Compliance &amp; Faculty Value-Added Analytics
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Real-time audit tracking of continuous assessment mark entries, syllabus coverage milestones, and subject-level pass rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Overall Entry Rate</span>
            <strong className="text-2xl font-black text-amber-400 font-mono">{overallCompliancePct}%</strong>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Fully Submitted Streams</span>
            <strong className="text-lg font-black text-slate-900">{completedEntries} / {markEntryList.length}</strong>
            <span className="text-[10px] text-emerald-700 block">100% Mark Entry Recorded</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">In-Progress Entries</span>
            <strong className="text-lg font-black text-amber-700">{inProgressEntries} Pending</strong>
            <span className="text-[10px] text-amber-600 block">Draft marks partially saved</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Average Faculty Mean</span>
            <strong className="text-lg font-black text-indigo-700">73.8% Overall</strong>
            <span className="text-[10px] text-indigo-600 block">Top Dept: Integrated Sciences</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'mark_entry', label: 'Mark Entry Completion Audit', icon: FileSpreadsheet },
          { id: 'teacher_performance', label: 'Teacher Performance & Value-Added', icon: TrendingUp },
          { id: 'class_teacher_overview', label: 'Class Teacher Remarks Generator', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* SUB-TAB 1: MARK ENTRY AUDIT */}
      {activeSubTab === 'mark_entry' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Continuous Assessment Mark Entry Audit Log
              </h3>
              <p className="text-[11px] text-slate-500">Tracking marks entered vs expected per learning area</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px]">
                  <th className="py-3 px-4">Learning Area</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4">Cohort Stream</th>
                  <th className="py-3 px-4 text-center">Entered / Enrolled</th>
                  <th className="py-3 px-4">Progress Bar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {markEntryList
                  .filter(
                    (m) =>
                      m.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.subjectName}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.teacherName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.gradeArm}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {item.marksEntered} / {item.enrolledStudents}
                      </td>
                      <td className="py-3 px-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.completionPercentage === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {item.completionPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            item.status === 'COMPLETE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status !== 'COMPLETE' && (
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Send Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEACHER PERFORMANCE */}
      {activeSubTab === 'teacher_performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherPerformanceList.map((tp) => (
            <div key={tp.teacherId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{tp.teacherName}</h4>
                  <span className="text-[11px] text-slate-500">{tp.department}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                  {tp.valueAddedRating}
                </span>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subjects Taught:</span>
                  <strong className="text-slate-900">{tp.subjectsTaught.join(', ')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject Mean:</span>
                  <strong className="text-indigo-600 font-mono">{tp.subjectMeanScore}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Rate (ME + EE):</span>
                  <strong className="text-emerald-700 font-mono">{tp.passRatePercentage}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mark Compliance:</span>
                  <strong className="text-slate-900 font-mono">{tp.markEntryCompliancePct}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: CLASS TEACHER REMARKS GENERATOR */}
      {activeSubTab === 'class_teacher_overview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Automated Class Teacher Remarks Generator
              </h3>
              <p className="text-[11px] text-slate-500">Generates contextual, growth-oriented comments based on CBC achievement levels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <strong className="text-slate-900 block font-bold">Exceeding Expectation (80–100%)</strong>
              <p className="text-slate-700 italic">
                &quot;Exhibits exemplary mastery of core concepts with autonomous initiative. Consistently models high intellectual curiosity and collaborative leadership.&quot;
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <strong className="text-slate-900 block font-bold">Meeting Expectation (65–79%)</strong>
              <p className="text-slate-700 italic">
                &quot;Demonstrates solid competence and steady academic commitment across all learning areas. Encouraged to step up into advanced enrichment tasks.&quot;
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <strong className="text-slate-900 block font-bold">Approaching Expectation (50–64%)</strong>
              <p className="text-slate-700 italic">
                &quot;Shows genuine effort with promising potential. Further consolidation in numeracy and practical science experiments will elevate performance.&quot;
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <strong className="text-slate-900 block font-bold">Below Expectation (&lt;50%)</strong>
              <p className="text-slate-700 italic">
                &quot;Requires targeted remedial support and disciplined structured revision. Recommended for one-on-one afternoon study clinics.&quot;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
