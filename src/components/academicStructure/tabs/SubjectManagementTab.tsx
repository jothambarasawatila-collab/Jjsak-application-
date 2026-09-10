import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  FlaskConical,
  Layers,
} from 'lucide-react';
import { SubjectDefinition, SubjectDepartment } from '../../../types/academicStructure';
import { AddEditSubjectModal } from '../modals/AddEditSubjectModal';

interface SubjectManagementTabProps {
  subjects: SubjectDefinition[];
  onUpdateSubjects: (subjects: SubjectDefinition[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

const DEPARTMENTS: ('All' | SubjectDepartment)[] = [
  'All',
  'Mathematics',
  'Languages',
  'Sciences',
  'Humanities & Social Sciences',
  'Technical & Applied Studies',
  'Creative Arts & Sports',
  'Religious Education',
];

export const SubjectManagementTab: React.FC<SubjectManagementTabProps> = ({
  subjects,
  onUpdateSubjects,
  onLogAudit,
}) => {
  const [selectedDept, setSelectedDept] = useState<'All' | SubjectDepartment>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDefinition | null>(null);

  const filteredSubjects = subjects.filter((sub) => {
    const matchesDept = selectedDept === 'All' || sub.department === selectedDept;
    const matchesQuery =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const totalWeeklyLessons = subjects.reduce((sum, s) => sum + s.lessonsPerWeek, 0);
  const coreCount = subjects.filter((s) => s.isCoreCompulsory).length;

  const handleSaveSubject = (subject: SubjectDefinition) => {
    const isEdit = subjects.some((s) => s.id === subject.id);
    let updated: SubjectDefinition[];
    if (isEdit) {
      updated = subjects.map((s) => (s.id === subject.id ? subject : s));
      onLogAudit?.(
        'SUBJECT_MODIFIED',
        `Updated learning area ${subject.name} (${subject.code}) specification.`,
        undefined,
        subject.name
      );
    } else {
      updated = [...subjects, subject];
      onLogAudit?.(
        'SUBJECT_CREATED',
        `Added new learning area ${subject.name} (${subject.code}) with ${subject.lessonsPerWeek} periods/wk.`,
        undefined,
        subject.name
      );
    }
    onUpdateSubjects(updated);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const target = subjects.find((s) => s.id === subjectId);
    if (!target) return;
    if (confirm(`Are you sure you want to delete/archive learning area "${target.name}"?`)) {
      const updated = subjects.filter((s) => s.id !== subjectId);
      onUpdateSubjects(updated);
      onLogAudit?.(
        'SUBJECT_DELETED',
        `Archived/Removed learning area ${target.name} (${target.code}).`,
        target.name,
        undefined
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Total Learning Areas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{subjects.length} Areas</span>
              <span className="text-xs text-indigo-600 font-bold">KICD Approved</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Core Compulsory</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{coreCount} Subjects</span>
              <span className="text-xs text-emerald-600 font-bold">100% Cohort</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Weekly Lesson Load</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{totalWeeklyLessons} Periods</span>
              <span className="text-xs text-amber-600 font-bold">40 Min / Lesson</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Practical / Labs</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">
                {subjects.filter((s) => s.requiresLabOrWorkshop).length} Subjects
              </span>
              <span className="text-xs text-purple-600 font-bold">Dedicated Labs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingSubject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Learning Area</span>
          </button>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DEPARTMENTS.map((dept) => (
            <button
              type="button"
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {subject.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        subject.isCoreCompulsory
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {subject.isCoreCompulsory ? 'Compulsory' : 'Elective'}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    {subject.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Dept: {subject.department}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubject(subject);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subject Specs Info Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Weekly Lessons:</span>
                  <strong className="text-indigo-600 font-bold">{subject.lessonsPerWeek} Lessons / Week</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pass Benchmark:</span>
                  <strong className="text-slate-800 font-bold">{subject.passingBenchmark}% Score</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Head of Dept:</span>
                  <span className="text-slate-700 font-medium">{subject.hodStaffName}</span>
                </div>
              </div>

              {subject.requiresLabOrWorkshop && (
                <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-100 flex items-center gap-2 text-xs text-purple-950">
                  <FlaskConical className="w-4 h-4 text-purple-700 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    Requires: {subject.specialFacility || 'Science Lab'}
                  </span>
                </div>
              )}

              {/* Grades Badges */}
              <div className="flex flex-wrap gap-1.5">
                {subject.applicableGrades.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 italic line-clamp-1">
                {subject.description || 'KICD Core Learning Area'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {subject.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AddEditSubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />
    </div>
  );
};
