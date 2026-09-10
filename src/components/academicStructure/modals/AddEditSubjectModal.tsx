import React, { useState } from 'react';
import { X, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { SubjectDefinition, SubjectDepartment } from '../../../types/academicStructure';

interface AddEditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: SubjectDefinition) => void;
  initialSubject?: SubjectDefinition | null;
}

const DEPARTMENTS: SubjectDepartment[] = [
  'Mathematics',
  'Languages',
  'Sciences',
  'Humanities & Social Sciences',
  'Technical & Applied Studies',
  'Creative Arts & Sports',
  'Religious Education',
];

const GRADES = ['Grade 7', 'Grade 8', 'Grade 9'];

export const AddEditSubjectModal: React.FC<AddEditSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState(initialSubject?.name || '');
  const [code, setCode] = useState(initialSubject?.code || '');
  const [shortName, setShortName] = useState(initialSubject?.shortName || '');
  const [department, setDepartment] = useState<SubjectDepartment>(
    initialSubject?.department || 'Sciences'
  );
  const [applicableGrades, setApplicableGrades] = useState<string[]>(
    initialSubject?.applicableGrades || ['Grade 7', 'Grade 8', 'Grade 9']
  );
  const [isCoreCompulsory, setIsCoreCompulsory] = useState(
    initialSubject ? initialSubject.isCoreCompulsory : true
  );
  const [lessonsPerWeek, setLessonsPerWeek] = useState(
    initialSubject?.lessonsPerWeek || 4
  );
  const [passingBenchmark, setPassingBenchmark] = useState(
    initialSubject?.passingBenchmark || 50
  );
  const [requiresLabOrWorkshop, setRequiresLabOrWorkshop] = useState(
    initialSubject?.requiresLabOrWorkshop || false
  );
  const [specialFacility, setSpecialFacility] = useState(
    initialSubject?.specialFacility || ''
  );
  const [hodStaffName, setHodStaffName] = useState(
    initialSubject?.hodStaffName || 'Head of Department'
  );
  const [description, setDescription] = useState(
    initialSubject?.description || ''
  );
  const [status, setStatus] = useState<'ACTIVE' | 'ELECTIVE_AVAILABLE' | 'INACTIVE'>(
    initialSubject?.status || 'ACTIVE'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectData: SubjectDefinition = {
      id: initialSubject?.id || `sub-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 4),
      department,
      applicableGrades,
      isCoreCompulsory,
      lessonsPerWeek: Number(lessonsPerWeek),
      passingBenchmark: Number(passingBenchmark),
      requiresLabOrWorkshop,
      specialFacility: requiresLabOrWorkshop ? specialFacility : undefined,
      hodStaffName,
      hodStaffId: initialSubject?.hodStaffId || 't1',
      gradingScaleId: 'cbc-4-band',
      description,
      status,
    };
    onSave(subjectData);
    onClose();
  };

  const toggleGrade = (grade: string) => {
    if (applicableGrades.includes(grade)) {
      if (applicableGrades.length > 1) {
        setApplicableGrades(applicableGrades.filter((g) => g !== grade));
      }
    } else {
      setApplicableGrades([...applicableGrades, grade]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {initialSubject ? 'Edit Learning Area / Subject' : 'Add New CBC Learning Area'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                KICD Junior Secondary Curriculum Specification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Integrated Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Short Name / Code
              </label>
              <input
                type="text"
                placeholder="e.g. Science"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SCI-704"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Academic Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as SubjectDepartment)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Head of Department (HOD)
              </label>
              <input
                type="text"
                value={hodStaffName}
                onChange={(e) => setHodStaffName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lessons / Week (Periods) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={lessonsPerWeek}
                onChange={(e) => setLessonsPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Passing Benchmark (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={passingBenchmark}
                onChange={(e) => setPassingBenchmark(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="ACTIVE">Active (Compulsory)</option>
                <option value="ELECTIVE_AVAILABLE">Elective / Optional</option>
                <option value="INACTIVE">Inactive / Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Applicable Learning Grades
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((grade) => (
                <button
                  type="button"
                  key={grade}
                  onClick={() => toggleGrade(grade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    applicableGrades.includes(grade)
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{grade}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Core Compulsory Learning Area
                </span>
                <span className="text-[11px] text-slate-500">
                  Mandatory for all learners in enrolled grades
                </span>
              </div>
              <input
                type="checkbox"
                checked={isCoreCompulsory}
                onChange={(e) => setIsCoreCompulsory(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Requires Specialized Laboratory / Workshop
                </span>
                <span className="text-[11px] text-slate-500">
                  Science lab, home science kitchen, computer lab or field
                </span>
              </div>
              <input
                type="checkbox"
                checked={requiresLabOrWorkshop}
                onChange={(e) => setRequiresLabOrWorkshop(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md"
              />
            </div>

            {requiresLabOrWorkshop && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Designated Facility Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Laboratory / Computer Lab"
                  value={specialFacility}
                  onChange={(e) => setSpecialFacility(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Curricular Description & Competencies Focus
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of learning outcomes and key inquiry questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialSubject ? 'Save Changes' : 'Create Learning Area'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
