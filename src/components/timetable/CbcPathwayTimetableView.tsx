import React, { useState } from 'react';
import {
  GraduationCap,
} from 'lucide-react';
import { TimetableLesson } from '../../types/timetable';
import { SUBJECT_COLOR_MAP } from '../../data/timetableData';

interface CbcPathwayTimetableViewProps {
  lessons: TimetableLesson[];
}

export const CbcPathwayTimetableView: React.FC<CbcPathwayTimetableViewProps> = ({ lessons }) => {
  const [selectedPathway, setSelectedPathway] = useState<'ALL' | 'STEM' | 'ARTS_SPORTS' | 'SOCIAL_SCIENCES'>('ALL');

  const pathways = [
    {
      id: 'STEM',
      title: 'STEM & Technical Sciences Pathway',
      description: 'Mathematics, Integrated Science, Pretechnical Studies, Agriculture, Computer Studies, and Laboratory Practicals.',
      subjects: ['Mathematics', 'Integrated Science', 'Pretechnical Studies', 'Agriculture'],
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      totalWeeklyPeriods: 24,
    },
    {
      id: 'ARTS_SPORTS',
      title: 'Arts & Sports Science Pathway',
      description: 'Creative Arts (Music, Visual Arts, Performing Arts), Physical Education, Sports Science, and Studio Sessions.',
      subjects: ['Creative Arts', 'Creative Arts & Sports'],
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      totalWeeklyPeriods: 8,
    },
    {
      id: 'SOCIAL_SCIENCES',
      title: 'Social Sciences & Humanities Pathway',
      description: 'Languages (English, Kiswahili), Social Studies, CRE, Pastoral Programme of Instruction (PPI), and Life Skills.',
      subjects: ['English', 'Kiswahili', 'Social Studies', 'CRE', 'Pastoral (PPI)', 'Life Skills'],
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      totalWeeklyPeriods: 18,
    },
  ];

  const filteredPathways = selectedPathway === 'ALL'
    ? pathways
    : pathways.filter((p) => p.id === selectedPathway);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">CBC / CBE Pathway Timetable Distribution</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                Rule P11.1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Curriculum progression tracking across STEM, Arts & Sports, and Social Sciences pathways.
            </p>
          </div>
        </div>

        {/* Pathway Filter Pill */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSelectedPathway('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedPathway === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 3 Pathways
          </button>
          <button
            type="button"
            onClick={() => setSelectedPathway('STEM')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedPathway === 'STEM' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            STEM
          </button>
          <button
            type="button"
            onClick={() => setSelectedPathway('ARTS_SPORTS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedPathway === 'ARTS_SPORTS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arts & Sports
          </button>
          <button
            type="button"
            onClick={() => setSelectedPathway('SOCIAL_SCIENCES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedPathway === 'SOCIAL_SCIENCES' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Social Sciences
          </button>
        </div>
      </div>

      {/* Pathway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredPathways.map((pathway) => {
          // Count lessons in this pathway
          const pathwayLessons = lessons.filter((l) =>
            pathway.subjects.includes(l.subject)
          );

          return (
            <div
              key={pathway.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pathway.badgeColor}`}>
                    {pathway.id} TRACK
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {pathway.totalWeeklyPeriods} Pds / Wk
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{pathway.title}</h4>
                <p className="text-xs text-slate-400">{pathway.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Allocated Learning Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pathway.subjects.map((sub) => {
                    const colorDef = SUBJECT_COLOR_MAP[sub] || SUBJECT_COLOR_MAP['Free'];
                    return (
                      <span
                        key={sub}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${colorDef.bg} ${colorDef.text} ${colorDef.border} border`}
                      >
                        {sub}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Scheduled in Master:</span>
                <strong className="text-emerald-400 font-black">{pathwayLessons.length} Periods</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
