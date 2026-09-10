import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  Compass,
  CheckCircle2,
  Edit2,
  Save,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  AcademicPlacementDossier,
  PathwayTrack,
} from '../../types/learnerRegistration';
import {
  OPTIONAL_ELECTIVES,
} from '../../data/learnerRegistrationData';

interface AcademicPlacementTabProps {
  selectedDossier: LearnerMasterDossier;
  onUpdateDossier: (updated: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const AcademicPlacementTab: React.FC<AcademicPlacementTabProps> = ({
  selectedDossier,
  onUpdateDossier,
  onLogAudit,
}) => {
  const [placement, setPlacement] = useState<AcademicPlacementDossier>(
    selectedDossier.academicPlacement
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    setPlacement(selectedDossier.academicPlacement);
    setGrade(selectedDossier.academicPlacement.enrolledGrade);
    setStream(selectedDossier.academicPlacement.enrolledStream);
    setClassTeacherName(selectedDossier.academicPlacement.classTeacherName);
    setPathway(selectedDossier.academicPlacement.learningPathway);
    setAcademicStatus(selectedDossier.academicPlacement.academicStatus);
    setPreviousSchool(selectedDossier.academicPlacement.previousSchoolName || '');
    setKpseaScore(selectedDossier.academicPlacement.kpseaMeanScore || 75);
    setEnrolledSubjects(selectedDossier.academicPlacement.enrolledSubjects);
  }, [selectedDossier]);

  // Form states
  const [grade, setGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>(placement.enrolledGrade);
  const [stream, setStream] = useState<string>(placement.enrolledStream);
  const [classTeacherName, setClassTeacherName] = useState<string>(placement.classTeacherName);
  const [pathway, setPathway] = useState<PathwayTrack>(placement.learningPathway);
  const [academicStatus, setAcademicStatus] = useState<any>(placement.academicStatus);
  const [previousSchool, setPreviousSchool] = useState<string>(placement.previousSchoolName || '');
  const [kpseaScore, setKpseaScore] = useState<number>(placement.kpseaMeanScore || 75);
  const [enrolledSubjects, setEnrolledSubjects] = useState(placement.enrolledSubjects);

  const handleSavePlacement = () => {
    const classCode = `${grade === 'Grade 7' ? 'G7' : grade === 'Grade 8' ? 'G8' : 'G9'} ${stream.charAt(0)}`;
    const updatedPlacement: AcademicPlacementDossier = {
      ...placement,
      enrolledGrade: grade,
      enrolledStream: stream,
      classCode,
      classTeacherName,
      learningPathway: pathway,
      academicStatus,
      previousSchoolName: previousSchool || undefined,
      kpseaMeanScore: kpseaScore,
      enrolledSubjects,
    };

    const updatedDossier: LearnerMasterDossier = {
      ...selectedDossier,
      academicPlacement: updatedPlacement,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);
    onLogAudit?.(
      'ACADEMIC_PLACEMENT_UPDATED',
      `Updated academic placement for ${selectedDossier.firstName} ${selectedDossier.lastName} to ${classCode} (${pathway}).`
    );

    setIsEditing(false);
    setFeedbackMsg(`✓ Academic Placement updated to ${classCode} (${pathway})!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggleElective = (elective: typeof OPTIONAL_ELECTIVES[0]) => {
    const exists = enrolledSubjects.some((s) => s.subjectCode === elective.code);
    if (exists) {
      setEnrolledSubjects(enrolledSubjects.filter((s) => s.subjectCode !== elective.code));
    } else {
      setEnrolledSubjects([
        ...enrolledSubjects,
        {
          subjectCode: elective.code,
          subjectName: elective.name,
          isCore: false,
          isElective: true,
          assignedTeacher: elective.teacher,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6" id="p9-4-academic-placement">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold tracking-wide">
              P9.4 PLACEMENT &amp; PATHWAYS
            </span>
            <h2 className="text-lg font-black text-slate-900">Academic Placement &amp; Subject Roll</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grade &amp; stream allocation, appointed class teacher, CBC career pathway track, and enrolled learning areas.
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Adjust Placement
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlacement}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Placement
              </button>
            </div>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Grid: 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Class Placement Card (P9.4.1 - P9.4.3) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Class Allocation (P9.4.1 - P9.4.3)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-100 text-purple-800">
              {placement.classCode}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Grade Level</label>
              <select
                value={grade}
                disabled={!isEditing}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="Grade 7">Grade 7 (Entry)</option>
                <option value="Grade 8">Grade 8 (Intermediate)</option>
                <option value="Grade 9">Grade 9 (Senior Transition)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Stream Allocation</label>
              <select
                value={stream}
                disabled={!isEditing}
                onChange={(e) => setStream(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="Simba">Simba Stream</option>
                <option value="Chui">Chui Stream</option>
                <option value="Ndovu">Ndovu Stream</option>
                <option value="Kifaru">Kifaru Stream</option>
                <option value="Mara">Mara Stream</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Class Teacher (P9.4.4)
              </label>
              <input
                type="text"
                value={classTeacherName}
                disabled={!isEditing}
                onChange={(e) => setClassTeacherName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Learning Pathway Card (P9.4.5) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              CBE Pathway (P9.4.5)
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800">
              KICD Aligned
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Assigned Senior School Pathway Track
              </label>
              <select
                value={pathway}
                disabled={!isEditing}
                onChange={(e) => setPathway(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-blue-900"
              >
                <option value="STEM (Science, Tech, Eng, Math)">STEM (Science, Tech, Eng, Math)</option>
                <option value="Social Sciences & Humanities">Social Sciences &amp; Humanities</option>
                <option value="Arts & Sports Science">Arts &amp; Sports Science</option>
                <option value="General Junior Foundation (G7/G8)">General Junior Foundation (G7/G8)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Academic Standing (P9.4.7)
              </label>
              <select
                value={academicStatus}
                disabled={!isEditing}
                onChange={(e) => setAcademicStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-emerald-800"
              >
                <option value="Active & In Good Standing">Active &amp; In Good Standing</option>
                <option value="Academic Support / Remedial">Academic Support / Remedial</option>
                <option value="Probationary">Probationary</option>
                <option value="On Approved Leave">On Approved Leave</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                KPSEA Grade 6 Baseline Mean Score
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kpseaScore}
                  disabled={!isEditing}
                  onChange={(e) => setKpseaScore(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold font-mono"
                />
                <span className="text-xs font-bold text-slate-600">% Raw Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prior Academic History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Prior School Baseline
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Previous Primary / Junior School
              </label>
              <input
                type="text"
                value={previousSchool}
                disabled={!isEditing}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="e.g. Highlands Junior Academy"
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 font-medium"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500">Entry Term</span>
              <p className="text-xs font-bold text-slate-900">{placement.entryTerm}</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-800">
                MoE Curriculum Cycle
              </span>
              <p className="text-xs font-bold text-purple-950">2026 Academic Calendar (Kenya CBC)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Enrollment Matrix (P9.4.6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              P9.4.6 Enrolled Junior Secondary Learning Areas ({enrolledSubjects.length} Active Subjects)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              10 Compulsory CBE Junior Secondary Learning Areas + Optional Foreign / Pre-Technical Electives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {enrolledSubjects.map((sub) => (
            <div
              key={sub.subjectCode}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{sub.subjectName}</span>
                  {sub.isCore && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                      CORE
                    </span>
                  )}
                  {sub.isElective && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      ELECTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Teacher: {sub.assignedTeacher}</p>
              </div>

              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                {sub.subjectCode}
              </span>
            </div>
          ))}
        </div>

        {/* Elective Selection Strip */}
        {isEditing && (
          <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
              Manage Elective Enrollments:
            </h4>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_ELECTIVES.map((el) => {
                const isSelected = enrolledSubjects.some((s) => s.subjectCode === el.code);
                return (
                  <button
                    key={el.code}
                    type="button"
                    onClick={() => handleToggleElective(el)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {el.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
