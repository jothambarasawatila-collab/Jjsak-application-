import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  TrendingUp,
  Users,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
  BookOpen,
  School,
  Compass,
} from 'lucide-react';
import { Student, Teacher } from '../types';
import { AVAILABLE_CLASSES, AVAILABLE_GRADES } from '../data/mockData';
import { computeAnalytics } from '../data/analyticsUtils';

interface AnalyticsScreenProps {
  students: Student[];
  teachers: Teacher[];
  onBack: () => void;
  onSelectStudent?: (student: Student) => void;
  onNavigateToPathways?: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  students,
  teachers,
  onBack,
  onSelectStudent,
  onNavigateToPathways,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'overview' | 'top_learners' | 'champions' | 'subjects' | 'streams'>('overview');

  const analytics = computeAnalytics(students, teachers, selectedClass, selectedGrade);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Subject', 'Student Count', 'Mean Score', 'Grade', 'Exceeding %', 'Meeting %', 'Approaching %', 'Below %', 'Highest Score', 'Subject Teacher'];
    const rows = analytics.learningAreaStats.map((s) => [
      s.subject,
      s.studentCount,
      s.meanScore,
      s.overallGrade,
      `${s.exceedingPercent}%`,
      `${s.meetingPercent}%`,
      `${s.approachingPercent}%`,
      `${s.belowPercent}%`,
      s.highestScore,
      `"${s.teacherName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JJSAK_Analytics_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Top App Header */}
      <div className="bg-[#C51E28] text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-lg tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-300" />
                Results & Performance Analytics
              </h1>
              <p className="text-xs text-red-100 font-medium">
                CBE Grading, Class Means, Subject Champions & Distributions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/20"
              title="Export Analytics CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white text-[#C51E28] hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Print Summary Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1.5 text-red-100 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedClass('All');
            }}
            className="bg-red-950/40 text-white border border-red-400/40 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
          >
            <option value="All" className="text-slate-900">All Grades</option>
            {AVAILABLE_GRADES.map((g) => (
              <option key={g} value={g} className="text-slate-900">
                Grade {g.replace('G', '')}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedGrade('All');
            }}
            className="bg-red-950/40 text-white border border-red-400/40 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
          >
            <option value="All" className="text-slate-900">All Classes & Streams</option>
            {AVAILABLE_CLASSES.map((c) => (
              <option key={c} value={c} className="text-slate-900">
                Class {c}
              </option>
            ))}
          </select>

          {onNavigateToPathways && (
            <button
              onClick={onNavigateToPathways}
              className="ml-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pathway Finder</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-[108px] z-20 shadow-xs overflow-x-auto flex gap-2">
        {[
          { id: 'overview', label: 'CBE Summary & Means', icon: BarChart3 },
          { id: 'top_learners', label: 'Top 5 Learners', icon: Award },
          { id: 'champions', label: 'Subject Champions', icon: Sparkles },
          { id: 'subjects', label: 'Learning Area Table', icon: BookOpen },
          { id: 'streams', label: 'Class Performance', icon: School },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-red-50 text-[#C51E28] border border-red-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-4 max-w-6xl mx-auto">
        {/* Core KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Total Learners</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.totalLearners}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Filtered: {selectedClass !== 'All' ? selectedClass : selectedGrade !== 'All' ? selectedGrade : 'All School'}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Mean Performance</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{analytics.schoolMean}%</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {analytics.schoolOverallGrade}
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              CBE Benchmark: Meeting Expectations
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Pass Rate (ME + EE)</span>
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700">{analytics.passRate}%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {analytics.cbeBroadDistribution.eeCount + analytics.cbeBroadDistribution.meCount} of {analytics.totalLearners} Learners
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Top Score in School</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {analytics.top5Learners[0]?.avgScore ?? 0}%
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              {analytics.top5Learners[0]?.student.name ?? '-'}
            </div>
          </div>
        </div>

        {/* 1. OVERVIEW TAB: CBE Distributions & 4 Tiers */}
        {(activeTab === 'overview' || activeTab === 'streams') && (
          <div className="space-y-4">
            {/* Broad 4-Tier CBE Distribution */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                <span>CBE 4-Tier Competency Breakdown</span>
                <span className="text-xs font-semibold text-slate-500">KICD / KNEC Standards</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800">Exceeding Expectations (EE)</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    {analytics.cbeBroadDistribution.eeCount} <span className="text-xs font-semibold">({analytics.cbeBroadDistribution.eePercent}%)</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1 font-medium">75% - 100% (EE1, EE2)</div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="text-xs font-bold text-sky-800">Meeting Expectations (ME)</div>
                  <div className="text-xl font-black text-sky-700 mt-1">
                    {analytics.cbeBroadDistribution.meCount} <span className="text-xs font-semibold">({analytics.cbeBroadDistribution.mePercent}%)</span>
                  </div>
                  <div className="text-[10px] text-sky-600 mt-1 font-medium">41% - 74% (ME1, ME2)</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-xs font-bold text-amber-800">Approaching Expectations (AE)</div>
                  <div className="text-xl font-black text-amber-700 mt-1">
                    {analytics.cbeBroadDistribution.aeCount} <span className="text-xs font-semibold">({analytics.cbeBroadDistribution.aePercent}%)</span>
                  </div>
                  <div className="text-[10px] text-amber-600 mt-1 font-medium">21% - 40% (AE1, AE2)</div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-bold text-rose-800">Below Expectations (BE)</div>
                  <div className="text-xl font-black text-rose-700 mt-1">
                    {analytics.cbeBroadDistribution.beCount} <span className="text-xs font-semibold">({analytics.cbeBroadDistribution.bePercent}%)</span>
                  </div>
                  <div className="text-[10px] text-rose-600 mt-1 font-medium">0% - 20% (BE1, BE2)</div>
                </div>
              </div>
            </div>

            {/* CBE 8-Sublevel Granular Distribution */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                <span>Detailed 8-Sublevel Performance Distribution</span>
                <span className="text-xs text-slate-500 font-medium">8 Sub-levels (EE1 to BE2)</span>
              </h2>

              <div className="space-y-2.5">
                {analytics.cbeSublevelDistribution.map((item) => (
                  <div key={item.sublevel} className="flex items-center gap-3 text-xs">
                    <div className="w-12 font-black text-slate-800 shrink-0 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.sublevel}</span>
                    </div>
                    <div className="w-28 text-slate-500 shrink-0 text-[11px] font-medium hidden sm:block">
                      {item.range}
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(item.percent, item.count > 0 ? 4 : 0)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <div className="w-20 text-right font-bold text-slate-800 shrink-0">
                      {item.count} <span className="text-slate-400 text-[10px] font-normal">({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. TOP 5 LEARNERS TAB */}
        {(activeTab === 'top_learners' || activeTab === 'overview') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top 5 Learners Overall (Honour Roll)</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">Ranked by Overall CBE Mean</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {analytics.top5Learners.map((learner) => {
                const isGold = learner.rank === 1;
                const isSilver = learner.rank === 2;
                const isBronze = learner.rank === 3;

                return (
                  <div
                    key={learner.student.id}
                    onClick={() => onSelectStudent && onSelectStudent(learner.student)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer hover:shadow-md relative overflow-hidden ${
                      isGold
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40'
                        : isSilver
                        ? 'bg-slate-50 border-slate-300'
                        : isBronze
                        ? 'bg-orange-50/70 border-orange-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Badge Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                          isGold
                            ? 'bg-amber-500 shadow-xs'
                            : isSilver
                            ? 'bg-slate-400 shadow-xs'
                            : isBronze
                            ? 'bg-amber-700 shadow-xs'
                            : 'bg-slate-700'
                        }`}
                      >
                        #{learner.rank}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {learner.classArm}
                      </span>
                    </div>

                    <div className="font-black text-sm text-slate-900 truncate">
                      {learner.student.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {learner.student.admNo}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Mean Score</div>
                        <div className="text-base font-black text-[#C51E28]">
                          {learner.avgScore}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Grade</div>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {learner.overallGrade}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200/60 truncate font-medium">
                      ⭐ Best: <span className="font-bold text-slate-800">{learner.topSubject}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SUBJECT CHAMPIONS TAB (Best Learner per Learning Area) */}
        {(activeTab === 'champions' || activeTab === 'overview') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Subject Champions (Best Learner per Learning Area)</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">9 Core Learning Areas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analytics.subjectChampions.map((champ) => (
                <div
                  key={champ.subject}
                  className="p-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 shadow-2xs hover:border-red-200 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {champ.subject}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-100 text-[#C51E28]">
                      {champ.score}% ({champ.grade})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-50 text-[#C51E28] font-black text-xs flex items-center justify-center border border-red-200">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {champ.studentName}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <span>{champ.classArm}</span>
                        <span>•</span>
                        <span>{champ.admNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span className="truncate">Teacher: {champ.teacherName}</span>
                    <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {champ.teacherInitials}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LEARNING AREA PERFORMANCE TABLE */}
        {(activeTab === 'subjects' || activeTab === 'overview') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-600" />
                <span>Learning Area Performance Table</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">Subject Means & Mastery Ratios</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Learning Area</th>
                    <th className="py-2.5 px-2 text-center">Assessed</th>
                    <th className="py-2.5 px-2 text-center">Mean Score</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-2 text-center">Exceeding (EE)</th>
                    <th className="py-2.5 px-2 text-center">Meeting (ME)</th>
                    <th className="py-2.5 px-2 text-center">Approaching (AE)</th>
                    <th className="py-2.5 px-2 text-center">Below (BE)</th>
                    <th className="py-2.5 px-2 text-center">High / Low</th>
                    <th className="py-2.5 px-3 text-right">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analytics.learningAreaStats.map((sub) => (
                    <tr key={sub.subject} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C51E28]" />
                        <span>{sub.subject}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{sub.studentCount}</td>
                      <td className="py-2.5 px-2 text-center font-black text-[#C51E28]">
                        {sub.meanScore}%
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                          {sub.overallGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">
                        {sub.exceedingCount} ({sub.exceedingPercent}%)
                      </td>
                      <td className="py-2.5 px-2 text-center text-sky-700 font-bold">
                        {sub.meetingCount} ({sub.meetingPercent}%)
                      </td>
                      <td className="py-2.5 px-2 text-center text-amber-700 font-bold">
                        {sub.approachingCount} ({sub.approachingPercent}%)
                      </td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold">
                        {sub.belowCount} ({sub.belowPercent}%)
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-700 font-semibold text-[11px]">
                        <span className="text-emerald-600 font-bold">{sub.highestScore}%</span> /{' '}
                        <span className="text-slate-400">{sub.lowestScore}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-semibold truncate max-w-[140px]">
                        {sub.teacherName} ({sub.teacherInitials})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CLASS & STREAM PERFORMANCE COMPARISON TABLE */}
        {(activeTab === 'streams' || activeTab === 'overview') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <span>Class & Stream Performance Comparison Table</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">Inter-Stream Performance Analysis</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Class / Stream</th>
                    <th className="py-2.5 px-2 text-center">Learners</th>
                    <th className="py-2.5 px-2 text-center">Class Mean</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-2 text-center">Pass Rate (ME+EE)</th>
                    <th className="py-2.5 px-2 text-center">EE Count</th>
                    <th className="py-2.5 px-2 text-center">ME Count</th>
                    <th className="py-2.5 px-2 text-center">AE Count</th>
                    <th className="py-2.5 px-2 text-center">BE Count</th>
                    <th className="py-2.5 px-3 text-right">Class Champion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analytics.classStreamStats.map((cls) => (
                    <tr key={cls.className} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        Class {cls.className}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{cls.totalStudents}</td>
                      <td className="py-2.5 px-2 text-center font-black text-[#C51E28]">
                        {cls.meanScore}%
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                          {cls.overallGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-700">
                        {cls.passRate}%
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">{cls.eeCount}</td>
                      <td className="py-2.5 px-2 text-center text-sky-700 font-bold">{cls.meCount}</td>
                      <td className="py-2.5 px-2 text-center text-amber-700 font-bold">{cls.aeCount}</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold">{cls.beCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {cls.topStudentName} ({cls.topStudentScore}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
