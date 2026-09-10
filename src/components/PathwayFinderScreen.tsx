import React, { useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Sparkles,
  FileText,
  Search,
  BookOpen,
  Briefcase,
  Target,
  GraduationCap,
} from 'lucide-react';
import { Student } from '../types';
import { calculateStudentPathways, calculateSchoolPathwayDistribution } from '../data/pathwayUtils';

interface PathwayFinderScreenProps {
  students: Student[];
  initialStudentId?: string;
  onBack: () => void;
  onOpenReportCard: (student: Student) => void;
}

export const PathwayFinderScreen: React.FC<PathwayFinderScreenProps> = ({
  students,
  initialStudentId,
  onBack,
  onOpenReportCard,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'school_overview'>('individual');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const pathwayProfile = currentStudent ? calculateStudentPathways(currentStudent) : null;
  const schoolDistribution = calculateSchoolPathwayDistribution(students);

  const filteredStudents = students.filter((s) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.admNo && s.admNo.toLowerCase().includes(q)) ||
      (s.classArm && s.classArm.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Top Navigation Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-lg tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-300 animate-spin-slow" />
                Senior School Pathway Finder
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                CBE Career Guidance & Senior School Academic Roadmaps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStudent && (
              <button
                onClick={() => onOpenReportCard(currentStudent)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="View Smart Report Card"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Smart Report Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Learner Pathway Profile
          </button>
          <button
            onClick={() => setActiveTab('school_overview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'school_overview'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            School-Wide Pathway Distribution
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {/* INDIVIDUAL LEARNER PATHWAY PROFILE */}
        {activeTab === 'individual' && currentStudent && pathwayProfile && (
          <div className="space-y-4">
            {/* Learner Selector Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center border border-blue-200">
                  {currentStudent.avatarInitials}
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <span>{currentStudent.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentStudent.classArm}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Adm: {currentStudent.admNo} • Overall Mean: <span className="font-bold text-[#C51E28]">{currentStudent.avgScore}%</span> ({currentStudent.overallGrade})
                  </div>
                </div>
              </div>

              {/* Selector Dropdown / Search */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search learner..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {filteredStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.classArm})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Top Recommended Pathway Banner */}
            <div
              className="p-5 rounded-3xl border shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: pathwayProfile.topPathway.bgLight,
                borderColor: pathwayProfile.topPathway.borderColor,
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: pathwayProfile.topPathway.color }}
                    >
                      Primary Recommended Pathway
                    </span>
                    <span className="text-xs font-bold text-slate-700 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200">
                      {pathwayProfile.topPathway.matchLevel}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {pathwayProfile.topPathway.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
                    {pathwayProfile.topPathway.description}
                  </p>
                </div>

                {/* Big Match Score Gauge */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center shrink-0 min-w-[130px]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Suitability Index
                  </div>
                  <div
                    className="text-3xl font-black mt-0.5"
                    style={{ color: pathwayProfile.topPathway.color }}
                  >
                    {pathwayProfile.topPathway.suitabilityScore}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                    Mean: {pathwayProfile.topPathway.pathwayAverage}%
                  </div>
                </div>
              </div>

              {/* CBE Guidance Verdict */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Official CBE Transition Guidance: </span>
                  {pathwayProfile.cbeGuidanceVerdict}
                </div>
              </div>
            </div>

            {/* Comparison of all 3 Senior School CBE Pathways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pathwayProfile.allPathways.map((pathway, index) => {
                const isTop = index === 0;
                return (
                  <div
                    key={pathway.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition ${
                      isTop ? 'ring-2 ring-blue-500/50 border-blue-300' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: pathway.color }}
                        />
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isTop
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {pathway.matchLevel}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 mb-1">
                        {pathway.badge}
                      </h3>

                      {/* Score Progress Bar */}
                      <div className="mt-2 mb-3">
                        <div className="flex items-center justify-between text-xs mb-1 font-bold">
                          <span className="text-slate-600">Suitability Index</span>
                          <span style={{ color: pathway.color }}>
                            {pathway.suitabilityScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pathway.suitabilityScore}%`,
                              backgroundColor: pathway.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Key Learning Area Scores */}
                      <div className="space-y-1.5 my-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Key Learning Areas
                        </div>
                        {pathway.keySubjectAverages.map((sub) => (
                          <div
                            key={sub.subject}
                            className="flex items-center justify-between text-slate-700 text-[11px] font-medium"
                          >
                            <span>{sub.subject}</span>
                            <span className="font-bold">
                              {sub.score !== null ? `${sub.score}% (${sub.grade})` : '-'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Senior School Tracks */}
                      <div className="my-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          <span>Senior School Tracks</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {pathway.seniorSchoolTracks.map((trk, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span>{trk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Career Prospects */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>Recommended Careers</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pathway.careerProspects.slice(0, 3).map((car, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {car}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pathway Guidance Notes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Personalized Teacher & Parent Guidance Roadmap</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {pathwayProfile.topPathway.guidanceNotes}
              </p>
            </div>
          </div>
        )}

        {/* SCHOOL-WIDE PATHWAY DISTRIBUTION */}
        {activeTab === 'school_overview' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>School-Wide Senior School Pathway Projections</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Aggregated affinity across {schoolDistribution.totalStudents} assessed junior school learners
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* STEM Card */}
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                  <div className="flex items-center justify-between text-sky-900 mb-2">
                    <span className="font-bold text-sm">STEM Pathway</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-sky-200 text-sky-800">
                      {schoolDistribution.stemPercent}%
                    </span>
                  </div>
                  <div className="text-3xl font-black text-sky-800">
                    {schoolDistribution.stemCount}{' '}
                    <span className="text-xs font-medium text-sky-600">Learners</span>
                  </div>
                  <p className="text-[11px] text-sky-700 mt-2 font-medium">
                    Pure Sciences, Engineering, Applied Tech & Computing
                  </p>
                </div>

                {/* Social Sciences Card */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center justify-between text-teal-900 mb-2">
                    <span className="font-bold text-sm">Social Sciences & Business</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-200 text-teal-800">
                      {schoolDistribution.socialPercent}%
                    </span>
                  </div>
                  <div className="text-3xl font-black text-teal-800">
                    {schoolDistribution.socialCount}{' '}
                    <span className="text-xs font-medium text-teal-600">Learners</span>
                  </div>
                  <p className="text-[11px] text-teal-700 mt-2 font-medium">
                    Law, Humanities, Global Diplomacy & Business Enterprise
                  </p>
                </div>

                {/* Arts & Sports Card */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between text-amber-900 mb-2">
                    <span className="font-bold text-sm">Arts & Sports Science</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                      {schoolDistribution.artsPercent}%
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-800">
                    {schoolDistribution.artsCount}{' '}
                    <span className="text-xs font-medium text-amber-600">Learners</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-2 font-medium">
                    Visual Arts, Performing Arts, Music & Athletic Sciences
                  </p>
                </div>
              </div>
            </div>

            {/* Learner Roster with Pathway Match */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Individual Learner Senior School Trajectory Table
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Learner Name</th>
                      <th className="py-2.5 px-2">Adm No</th>
                      <th className="py-2.5 px-2 text-center">Class</th>
                      <th className="py-2.5 px-2 text-center">Overall Mean</th>
                      <th className="py-2.5 px-3">Top Recommended Pathway</th>
                      <th className="py-2.5 px-2 text-center">Suitability</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {students.map((st) => {
                      const p = calculateStudentPathways(st);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>
                          <td className="py-2.5 px-2 text-slate-500">{st.admNo}</td>
                          <td className="py-2.5 px-2 text-center font-bold">{st.classArm}</td>
                          <td className="py-2.5 px-2 text-center font-black text-[#C51E28]">
                            {st.avgScore}%
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: p.topPathway.color }}
                            >
                              {p.topPathway.badge}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                            {p.topPathway.suitabilityScore}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudentId(st.id);
                                setActiveTab('individual');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold text-[11px] cursor-pointer"
                            >
                              View Profile →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
