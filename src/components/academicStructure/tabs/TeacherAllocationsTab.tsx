import React, { useState } from 'react';
import {
  UserPlus,
  Award,
  Trash2,
  FileText,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import {
  TeacherSubjectAllocation,
  ClassTeacherAllocation,
  StreamConfig,
  SubjectDefinition,
} from '../../../types/academicStructure';
import { Teacher, SchoolInfo } from '../../../types';
import { AssignTeacherModal } from '../modals/AssignTeacherModal';
import { AppointmentLetterModal } from '../modals/AppointmentLetterModal';

interface TeacherAllocationsTabProps {
  allocations: TeacherSubjectAllocation[];
  classTeacherAllocations: ClassTeacherAllocation[];
  streams: StreamConfig[];
  subjects: SubjectDefinition[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  onUpdateAllocations: (allocations: TeacherSubjectAllocation[]) => void;
  onUpdateClassTeacherAllocations?: (ctas: ClassTeacherAllocation[]) => void;
  onLogAudit?: (action: any, details: string, prev?: string, next?: string) => void;
}

export const TeacherAllocationsTab: React.FC<TeacherAllocationsTabProps> = ({
  allocations,
  classTeacherAllocations,
  streams,
  subjects,
  teachers,
  schoolInfo,
  onUpdateAllocations,
  onUpdateClassTeacherAllocations: _onUpdateClassTeacherAllocations,
  onLogAudit,
}) => {
  const [activeView, setActiveView] = useState<'subject_matrix' | 'workload_summary' | 'class_teachers'>('subject_matrix');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [viewingLetterCTA, setViewingLetterCTA] = useState<ClassTeacherAllocation | null>(null);

  const filteredAllocations = allocations.filter((a) => {
    const matchesGrade = selectedGrade === 'All' || a.gradeName === selectedGrade;
    const matchesSearch =
      a.teacherName.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      a.fullClassName.toLowerCase().includes(searchTeacher.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleSaveAllocation = (newAlloc: TeacherSubjectAllocation) => {
    const updated = [...allocations, newAlloc];
    onUpdateAllocations(updated);
    onLogAudit?.(
      'TEACHER_ALLOCATED',
      `Assigned ${newAlloc.teacherName} to teach ${newAlloc.subjectName} in ${newAlloc.fullClassName} (${newAlloc.lessonsPerWeek} periods/wk).`,
      undefined,
      `${newAlloc.teacherName} -> ${newAlloc.fullClassName}`
    );
  };

  const handleDeleteAllocation = (id: string) => {
    const target = allocations.find((a) => a.id === id);
    if (!target) return;
    if (confirm(`Remove allocation of ${target.teacherName} for ${target.subjectName} in ${target.fullClassName}?`)) {
      const updated = allocations.filter((a) => a.id !== id);
      onUpdateAllocations(updated);
      onLogAudit?.(
        'TEACHER_ALLOCATED',
        `Unassigned ${target.teacherName} from ${target.subjectName} (${target.fullClassName}).`,
        target.teacherName,
        undefined
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'subject_matrix', label: 'Subject Allocation Matrix', icon: Layers, count: allocations.length },
            { id: 'workload_summary', label: 'TSC Staff Workload Audit', icon: Clock, count: teachers.length },
            { id: 'class_teachers', label: 'Class Masters & Letters', icon: Award, count: classTeacherAllocations.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Allocate Teacher</span>
        </button>
      </div>

      {/* VIEW 1: SUBJECT ALLOCATION MATRIX */}
      {activeView === 'subject_matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Grade:</span>
              {['All', 'Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teacher, subject, or stream..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Class Stream</th>
                    <th className="py-3 px-4">Subject Area</th>
                    <th className="py-3 px-4">Allocated Teacher</th>
                    <th className="py-3 px-4 text-center">Lessons / Wk</th>
                    <th className="py-3 px-4">Room / Lab</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAllocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{alloc.fullClassName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alloc.gradeName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-950 block">{alloc.subjectName}</span>
                        <span className="text-[10px] font-mono text-indigo-600">{alloc.subjectCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {alloc.teacherName.charAt(0)}
                          </span>
                          <span className="font-bold text-slate-800">{alloc.teacherName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
                          {alloc.lessonsPerWeek}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {alloc.allocatedRoom || 'Standard Classroom'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteAllocation(alloc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Unassign Teacher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEACHER WORKLOAD SUMMARY */}
      {activeView === 'workload_summary' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block font-bold text-white text-sm">
                Teachers Service Commission (TSC) Workload Benchmark
              </strong>
              <p className="text-slate-300 leading-relaxed">
                Statutory requirement: <strong>24 to 28 periods / week</strong> per full-time teacher. Overloads (&gt; 28 periods) trigger fatigue alerts; underloads (&lt; 18 periods) require remedial scheduling.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teachers.map((teacher) => {
              const teacherAllocations = allocations.filter(
                (a) => a.teacherId === teacher.id || a.teacherName.toLowerCase().includes(teacher.name.toLowerCase().split(' ')[0])
              );
              const totalLessons = teacherAllocations.reduce((sum, a) => sum + (a.lessonsPerWeek || 0), 0);
              const isOverloaded = totalLessons > 28;
              const isUnderloaded = totalLessons < 18 && totalLessons > 0;
              const isOptimal = totalLessons >= 20 && totalLessons <= 28;

              return (
                <div
                  key={teacher.id}
                  className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 ${
                    isOverloaded
                      ? 'border-rose-300 shadow-rose-50 shadow-md'
                      : isOptimal
                      ? 'border-emerald-300 shadow-xs'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
                          {teacher.name.charAt(0)}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{teacher.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {teacher.department || 'Academic Department'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isOverloaded
                            ? 'bg-rose-100 text-rose-800'
                            : isOptimal
                            ? 'bg-emerald-100 text-emerald-800'
                            : isUnderloaded
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOverloaded ? 'Overload' : isOptimal ? 'Optimal' : isUnderloaded ? 'Underload' : 'Unallocated'}
                      </span>
                    </div>

                    {/* Workload Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Weekly Lessons:</span>
                        <span
                          className={
                            isOverloaded
                              ? 'text-rose-600'
                              : isOptimal
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }
                        >
                          {totalLessons} / 28 Periods Max
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOverloaded
                              ? 'bg-rose-600'
                              : isOptimal
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (totalLessons / 28) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Allocated Subjects Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 block uppercase">
                        Teaching Assignments ({teacherAllocations.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {teacherAllocations.length > 0 ? (
                          teacherAllocations.map((a) => (
                            <span
                              key={a.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                            >
                              {a.subjectCode} • {a.fullClassName} ({a.lessonsPerWeek}p)
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No subjects assigned yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      TSC No: <strong>{teacher.tscNumber || 'TSC-884912'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(true)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
                    >
                      + Assign Class
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: CLASS TEACHER APPOINTMENTS */}
      {activeView === 'class_teachers' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/70 rounded-3xl border border-indigo-100 flex items-start gap-3">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block font-bold text-indigo-950 text-sm">
                Official Class Master / Mistress Appointments
              </strong>
              <p className="text-indigo-900/80 leading-relaxed">
                Appointed Class Teachers serve as chief pastoral guardians, attendance custodians, and official liaisons with parents under the Basic Education Regulations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classTeacherAllocations.map((cta) => {
              return (
                <div
                  key={cta.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                          {cta.academicYear} Academic Year
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {cta.fullClassName}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          Ref: {cta.appointmentLetterRef}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {cta.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class Master:</span>
                        <strong className="text-slate-900 font-bold">{cta.primaryClassTeacherName}</strong>
                      </div>
                      {cta.assistantClassTeacherName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Assistant Master:</span>
                          <span className="text-slate-700 font-medium">{cta.assistantClassTeacherName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Appointed Date:</span>
                        <span className="font-mono text-slate-600">{cta.appointmentDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Mandated Pastoral Duties:
                      </span>
                      <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                        {cta.responsibilities.slice(0, 2).map((r, ri) => (
                          <li key={ri}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">TSC Certified</span>
                    <button
                      type="button"
                      onClick={() => setViewingLetterCTA(cta)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Appointment Letter</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AssignTeacherModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleSaveAllocation}
        streams={streams}
        subjects={subjects}
        teachers={teachers}
        existingAllocations={allocations}
      />

      <AppointmentLetterModal
        isOpen={!!viewingLetterCTA}
        onClose={() => setViewingLetterCTA(null)}
        allocation={viewingLetterCTA}
        stream={streams.find((s) => s.id === viewingLetterCTA?.streamId) || null}
        schoolInfo={schoolInfo}
      />
    </div>
  );
};
