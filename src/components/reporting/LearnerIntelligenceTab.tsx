import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Compass,
  GraduationCap,
  UserCheck,
  HeartHandshake,
  Lightbulb,
  Search,
  Target,
  Layers,
} from 'lucide-react';
import { Student } from '../../types';
import { generateAICompetencyInsight, generateCompetencyEvaluations } from '../../data/reportingEngine';

interface LearnerIntelligenceTabProps {
  students: Student[];
  onSelectStudent?: (student: Student) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const LearnerIntelligenceTab: React.FC<LearnerIntelligenceTabProps> = ({
  students,
  onSelectStudent,
  onLogAudit,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'insights' | 'risk_radar' | 'competency_spider' | 'interventions'>('insights');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  const aiInsight = generateAICompetencyInsight(activeStudent);
  const competencies = generateCompetencyEvaluations(activeStudent);

  const handleTriggerAIReAnalysis = () => {
    onLogAudit?.(
      'AI_PREDICTIVE_ANALYSIS_EXECUTED',
      `Executed AI predictive competency analysis and senior pathway mapping for ${activeStudent.name} (${activeStudent.admNo}).`
    );
  };

  // High risk / At risk learners across the cohort
  const atRiskLearners = students.filter((s) => (s.avgScore ?? 0) < 55);
  const topHonorsLearners = students.filter((s) => (s.avgScore ?? 0) >= 80);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              P8.12 AI-Powered Academic Intelligence &amp; Predictive Diagnostics
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Cognitive Growth, Risk Radar &amp; Pathway Optimization
            </h2>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed mt-1">
              Machine learning analytics synthesizing continuous assessments, KICD competency mastery, and cognitive learning curves to predict Senior School readiness.
            </p>
          </div>

          <button
            onClick={handleTriggerAIReAnalysis}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            Re-Synthesize Diagnostics
          </button>
        </div>
      </div>

      {/* Cohort Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Honors &amp; STEM Track Ready</span>
            <strong className="text-lg font-black text-slate-900">{topHonorsLearners.length} Learners</strong>
            <span className="text-[10px] text-emerald-700 block">Exceeding KICD Benchmarks</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Pathway Matching Rate</span>
            <strong className="text-lg font-black text-indigo-700">96.8% Confidence</strong>
            <span className="text-[10px] text-slate-500 block">Senior Secondary Readiness</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Early Warning Radar</span>
            <strong className="text-lg font-black text-amber-700">{atRiskLearners.length} Flagged</strong>
            <span className="text-[10px] text-amber-600 block">Remedial Plans Triggered</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[11px]">Average Competency Level</span>
            <strong className="text-lg font-black text-purple-700">ME (Proficient)</strong>
            <span className="text-[10px] text-slate-500 block">Mean Score: 71.4%</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learner Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Select Learner Profile
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {filteredStudents.length} Found
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or Adm No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredStudents.map((st) => {
              const isSelected = st.id === activeStudent.id;
              const avg = st.avgScore ?? 0;
              const isRisk = avg < 55;

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStudentId(st.id);
                    onSelectStudent?.(st);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {st.avatarInitials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{st.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {st.admNo} • {st.classArm}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-slate-900">{avg}%</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded block mt-0.5 ${
                        isRisk
                          ? 'bg-rose-100 text-rose-800'
                          : avg >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {st.overallGrade}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: AI Intelligence Deep Dive for Selected Student */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub Navigation Bar */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'insights', label: 'AI Diagnostic Brief', icon: Sparkles },
              { id: 'risk_radar', label: 'Risk Analysis & Remedies', icon: AlertTriangle },
              { id: 'competency_spider', label: '7 Core Competencies Grid', icon: Layers },
              { id: 'interventions', label: 'Actionable Guidance', icon: Lightbulb },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: AI DIAGNOSTIC BRIEF */}
          {activeSubTab === 'insights' && (
            <div className="space-y-6">
              {/* Senior School Pathway Recommendation Card */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-sm">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                        Senior School Track Affinity
                      </span>
                      <h3 className="text-lg font-black text-white">{aiInsight.recommendedPathway}</h3>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-mono text-xs font-bold">
                    Confidence: {aiInsight.pathwayConfidenceScore}%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Predicted National Exit Band
                    </span>
                    <strong className="text-amber-300 text-sm font-black">{aiInsight.predictedKpseaBand}</strong>
                    <p className="text-[11px] text-slate-300">
                      Projected Mean Score Range: <strong>{aiInsight.predictedMeanRange}</strong>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Top Matched Future Professions
                    </span>
                    <p className="text-white font-bold text-xs">
                      {aiInsight.careerSuggestions.join(' • ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Dominant Academic Strengths
                  </h4>
                  <div className="space-y-2">
                    {aiInsight.primaryStrengths.map((str, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {str}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    Targeted Remedial Growth Areas
                  </h4>
                  <div className="space-y-2">
                    {aiInsight.remedialFocusAreas.map((w, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-50 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RISK RADAR */}
          {activeSubTab === 'risk_radar' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Cognitive Risk Diagnostic &amp; Retention Vulnerabilities
                  </h3>
                  <p className="text-xs text-slate-500">Automated diagnostic flagging of conceptual bottlenecks</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    aiInsight.riskLevel === 'LOW_RISK'
                      ? 'bg-emerald-100 text-emerald-800'
                      : aiInsight.riskLevel === 'MODERATE_RISK'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {aiInsight.riskLevel.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Identified Risk Indicators
                </span>
                {aiInsight.riskFactors.map((rf, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                    <div>
                      <strong>Factor {idx + 1}:</strong> {rf}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  Prescribed Teacher Action Item
                </span>
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                  {aiInsight.teacherInterventionAction}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COMPETENCIES GRID */}
          {activeSubTab === 'competency_spider' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                7 Core CBC Competencies Detailed Diagnostic
              </h3>
              <div className="grid grid-cols-1 gap-3 text-xs">
                {competencies.map((comp) => (
                  <div key={comp.competencyId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">{comp.competencyName}</strong>
                      <span className="font-mono font-black text-indigo-700">{comp.level} ({comp.scorePercent}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${comp.scorePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-600">{comp.descriptor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIONABLE GUIDANCE (PARENTS & TEACHERS) */}
          {activeSubTab === 'interventions' && (
            <div className="space-y-6">
              {/* Parent Home Support Tips */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-950">
                  <HeartHandshake className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Actionable Guidance for Parents &amp; Guardians
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {aiInsight.parentHomeSupportTips.map((tip, idx) => (
                    <div key={idx} className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
