import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Globe2,
  Layers,
  Award,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  CurriculumFramework,
  LearningAreaStrand,
  CompetencyDefinition,
} from '../../../types/academicStructure';

interface CurriculumFrameworkTabProps {
  curriculum: CurriculumFramework;
  strands: LearningAreaStrand[];
  onUpdateCurriculum?: (updated: CurriculumFramework) => void;
}

export const CurriculumFrameworkTab: React.FC<CurriculumFrameworkTabProps> = ({
  curriculum,
  strands,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'competencies' | 'values' | 'pcis' | 'strands' | 'rubrics'>('competencies');
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyDefinition | null>(
    curriculum.coreCompetencies[0] || null
  );
  const [selectedStrandGrade, setSelectedStrandGrade] = useState('Grade 8');

  const filteredStrands = strands.filter((s) => s.grade === selectedStrandGrade);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white shadow-xs">
                KICD CBC / CBE EDITION 3.2
              </span>
              <span className="text-xs text-indigo-300 font-mono">Curriculum Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {curriculum.name}
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Standardized national curriculum governing Junior Secondary education in Kenya. Mandating 7 Core Competencies, 8 Foundational Values, Pertinent &amp; Contemporary Issues (PCIs), and 4-Level Evaluation Rubrics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs shrink-0 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Framework Code:</span>
              <span className="font-mono font-bold text-white">{curriculum.code}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Total Lessons / Wk:</span>
              <span className="font-bold text-amber-300">{curriculum.totalWeeklyLessons} Periods</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Regulatory Status:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold text-[10px]">
                {curriculum.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'competencies', label: '7 Core Competencies', count: curriculum.coreCompetencies.length, icon: Sparkles },
          { id: 'values', label: '8 Core Values', count: curriculum.coreValues.length, icon: Heart },
          { id: 'pcis', label: 'PCIs & Life Skills', count: curriculum.pcis.length, icon: Globe2 },
          { id: 'strands', label: 'Strands & Sub-Strands', count: strands.length, icon: Layers },
          { id: 'rubrics', label: 'CBC Assessment Rubrics', count: curriculum.assessmentScale.length, icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: 7 Core Competencies */}
      {activeSubTab === 'competencies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              National Core Competencies (KICD Framework)
            </h3>
            <div className="space-y-2">
              {curriculum.coreCompetencies.map((comp) => (
                <button
                  type="button"
                  key={comp.id}
                  onClick={() => setSelectedCompetency(comp)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedCompetency?.id === comp.id
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {comp.code.replace('CC-', '')}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {comp.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {comp.description}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedCompetency ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase">
                      Competency Code: {selectedCompetency.code}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {selectedCompetency.name}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    Active in all JSS Subjects
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">
                    Core Conceptual Definition
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedCompetency.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Observational &amp; Formative Assessment Indicators:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCompetency.indicators.map((ind, i) => (
                      <div
                        key={i}
                        className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-950">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Integrated across automated CBC report cards and teacher lesson plans.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400">
                Select a core competency on the left to view indicator rubrics.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 8 Core Values */}
      {activeSubTab === 'values' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs text-rose-950">
            <strong className="block font-bold">Kenyan National Values &amp; Principles of Governance</strong>
            CBC mandates intentional infusion of these 8 core values into instructional activities, student clubs, and pastoral guidance.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curriculum.coreValues.map((val) => (
              <div
                key={val.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
                      {val.code.replace('VAL-', '')}
                    </span>
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{val.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{val.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <strong className="text-slate-700 block">Assessment Evidence:</strong>
                  <span className="italic">{val.learningEvidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: PCIs */}
      {activeSubTab === 'pcis' && (
        <div className="space-y-4">
          <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-xs text-sky-950">
            <strong className="block font-bold">Pertinent &amp; Contemporary Issues (PCIs)</strong>
            Cross-cutting thematic issues addressing 21st-century adolescent challenges, environmental sustainability, health, and national cohesion.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculum.pcis.map((pci) => (
              <div
                key={pci.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                    {pci.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{pci.code}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{pci.title}</h4>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800 block text-[11px]">Integration Pathway:</strong>
                  {pci.integrationGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Strands & Sub-Strands */}
      {activeSubTab === 'strands' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Cohort:</span>
              {['Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setSelectedStrandGrade(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedStrandGrade === g
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredStrands.length} Learning Area Strands Configured
            </span>
          </div>

          <div className="space-y-4">
            {filteredStrands.map((strand) => (
              <div
                key={strand.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                      S{strand.strandNumber}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {strand.strandTitle}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        Subject: {strand.subjectCode} • {strand.grade}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {strand.subStrands.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs sm:text-sm font-bold text-indigo-950">
                          Sub-Strand {sub.subStrandNumber}: {sub.title}
                        </h5>
                        <span className="text-[11px] font-bold text-slate-500">
                          {sub.assessmentMethods.join(', ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <strong className="text-slate-700 block text-[11px] uppercase">
                            Specific Learning Outcomes:
                          </strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            {sub.specificLearningOutcomes.map((out, oi) => (
                              <li key={oi}>{out}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <strong className="text-slate-700 block text-[11px] uppercase">
                            Key Inquiry Questions:
                          </strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 italic">
                            {sub.keyInquiryQuestions.map((q, qi) => (
                              <li key={qi}>&ldquo;{q}&rdquo;</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: CBC Rubrics */}
      {activeSubTab === 'rubrics' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs">
            <strong className="block font-bold mb-0.5">4-Level National Competence Rubric Standard</strong>
            Kenyan CBC standard grading scale evaluating student performance against criteria rather than purely normative ranking.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curriculum.assessmentScale.map((band) => (
              <div
                key={band.level}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: band.color }}
                    >
                      {band.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 px-2.5 py-1 bg-slate-100 rounded-full">
                      {band.scoreRange}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900">{band.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{band.descriptor}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  Official KICD Assessment Standard
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
