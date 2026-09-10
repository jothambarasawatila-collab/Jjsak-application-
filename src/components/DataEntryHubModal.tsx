import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ClipboardList,
  FileSpreadsheet,
  Upload,
  Camera,
  CheckCircle2,
  Save,
  Check,
  Sparkles,
} from 'lucide-react';
import { Student, Teacher, SchoolInfo } from '../types';
import { AVAILABLE_CLASSES, AVAILABLE_GRADES, AVAILABLE_SUBJECTS } from '../data/mockData';

export type DataEntryMode = 'individual' | 'register' | 'marks' | 'bulk' | 'photo';

interface DataEntryHubModalProps {
  isOpen: boolean;
  initialMode?: DataEntryMode;
  students: Student[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateStudentsAttendance?: (updates: { id: string; attendance: number }[]) => void;
  onOpenMarksEntryModal?: (teacherId: string, className: string, subject: string) => void;
  onOpenBulkUploadModal?: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const DataEntryHubModal: React.FC<DataEntryHubModalProps> = ({
  isOpen,
  initialMode = 'individual',
  students,
  teachers,
  schoolInfo,
  onClose,
  onAddStudent,
  onUpdateStudent,
  onUpdateStudentsAttendance,
  onOpenMarksEntryModal,
  onOpenBulkUploadModal,
  onLogAudit,
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<DataEntryMode>(initialMode);

  // Individual Form State
  const [admNo, setAdmNo] = useState('');
  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');
  const [gender, setGender] = useState('Male');
  const [grade, setGrade] = useState('G8');
  const [classArm, setClassArm] = useState('G8 S');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelationship, setParentRelationship] = useState('Parent / Guardian');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Register Form State
  const [registerClass, setRegisterClass] = useState('G8 S');
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'P' | 'A' | 'L' | 'E'>>({});
  const [registerSaved, setRegisterSaved] = useState(false);

  // Photo Management State
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<string>(students[0]?.id || '');
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [photoSavedMessage, setPhotoSavedMessage] = useState<string | null>(null);

  // Filter students for register
  const classStudents = students.filter((s) => s.classArm === registerClass);

  // Init attendance map if empty
  const getAttendanceStatus = (studentId: string): 'P' | 'A' | 'L' | 'E' => {
    return attendanceMap[studentId] || 'P';
  };

  const handleSetAttendance = (studentId: string, status: 'P' | 'A' | 'L' | 'E') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    setRegisterSaved(false);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'P' | 'A' | 'L' | 'E'> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'P';
    });
    setAttendanceMap((prev) => ({ ...prev, ...updated }));
    setRegisterSaved(false);
  };

  const handleSaveAttendanceRegister = () => {
    if (classStudents.length === 0) return;
    const updates = classStudents.map((s) => {
      const status = attendanceMap[s.id] || 'P';
      let newAtt = s.attendance;
      if (status === 'P') newAtt = Math.min(100, (s.attendance || 90) + 1);
      if (status === 'A') newAtt = Math.max(40, (s.attendance || 90) - 2);
      if (status === 'L') newAtt = Math.max(50, (s.attendance || 90) - 1);
      return { id: s.id, attendance: newAtt };
    });

    if (onUpdateStudentsAttendance) {
      onUpdateStudentsAttendance(updates);
    }
    if (onLogAudit) {
      onLogAudit(
        'ATTENDANCE_REGISTER_SUBMIT',
        `Class attendance register saved for ${registerClass} on ${registerDate} (${classStudents.length} learners)`
      );
    }
    setRegisterSaved(true);
    setTimeout(() => setRegisterSaved(false), 3000);
  };

  // Handle individual submission
  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !admNo.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      schoolId: schoolInfo.name,
      admNo: admNo.trim(),
      upi: upi.trim() || `UPI-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      gender,
      grade,
      classArm,
      term: schoolInfo.term,
      year: schoolInfo.year,
      avatarInitials: initials || 'ST',
      photoUrl: photoUrl || undefined,
      avgScore: 70,
      overallGrade: 'ME1',
      position: 'N/A',
      attendance: 98,
      classTeacherName: 'Class Teacher',
      classTeacherComment: 'Promising learner enrolled successfully.',
      headOfSchoolName: schoolInfo.headOfInstitution,
      nextTermDate: schoolInfo.nextTermOpenDate,
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      parentRelationship,
      subjects: AVAILABLE_SUBJECTS.map((sub) => ({
        subject: sub,
        score: 70,
        grade: 'ME1',
        remarks: 'Meeting Expectations',
      })),
    };

    onAddStudent(newStudent);
    if (onLogAudit) {
      onLogAudit(
        'STUDENT_CREATE',
        `Enrolled learner ${newStudent.name} (${newStudent.admNo}) into ${newStudent.classArm}`
      );
    }
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setAdmNo('');
      setName('');
      setUpi('');
      setParentName('');
      setParentPhone('');
      setPhotoUrl('');
    }, 2000);
  };

  // Sample photo presets for quick testing
  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSaveStudentPhoto = () => {
    const student = students.find((s) => s.id === selectedStudentForPhoto);
    if (!student || !tempPhotoUrl) return;

    if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        photoUrl: tempPhotoUrl,
      });
    }

    if (onLogAudit) {
      onLogAudit(
        'STUDENT_UPDATE',
        `Updated official portrait photograph for learner ${student.name} (${student.admNo})`
      );
    }

    setPhotoSavedMessage(`Photograph updated for ${student.name}`);
    setTimeout(() => setPhotoSavedMessage(null), 3000);
  };

  const activePhotoStudent = students.find((s) => s.id === selectedStudentForPhoto) || students[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C51E28] text-white flex items-center justify-center shadow-sm">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                  Core Platform Service
                </span>
                <span className="text-[10px] text-slate-300 font-bold">5 Specialized Ingestion Modes</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Core Data Entry &amp; Ingestion Hub
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Modes Nav Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'individual', label: '1. Individual Entry', icon: UserPlus },
            { id: 'register', label: '2. Register-Based Entry', icon: ClipboardList },
            { id: 'marks', label: '3. Mark-List Entry', icon: FileSpreadsheet },
            { id: 'bulk', label: '4. Bulk Upload (CSV/Excel)', icon: Upload },
            { id: 'photo', label: '5. Photograph Management', icon: Camera },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id as DataEntryMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#C51E28] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800">
          
          {/* ======================================================== */}
          {/* MODE 1: INDIVIDUAL ENTRY */}
          {/* ======================================================== */}
          {activeMode === 'individual' && (
            <form onSubmit={handleIndividualSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Individual Learner Onboarding:</span>
                  <span className="ml-1 text-blue-800">
                    Registers a single student directly with NEMIS / CBA UPI, contact numbers, and photo link.
                  </span>
                </div>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Learner enrolled successfully! Record added to school database.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admission Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM-2026-0312"
                    value={admNo}
                    onChange={(e) => setAdmNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Official Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brian Kiprono"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NEMIS / CBA UPI Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-928174"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    {AVAILABLE_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Stream / Arm
                  </label>
                  <select
                    value={classArm}
                    onChange={(e) => setClassArm(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    {AVAILABLE_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent / Guardian Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mary Wambui"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Phone (SMS Dispatch)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +254 712 345 678"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship / Sponsor Role
                  </label>
                  <select
                    value={parentRelationship}
                    onChange={(e) => setParentRelationship(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Next of Kin">Next of Kin</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Learner Photograph URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://... or choose from Photograph Management tab"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveMode('photo')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enrol Learner</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE 2: REGISTER-BASED ENTRY (ATTENDANCE) */}
          {/* ======================================================== */}
          {activeMode === 'register' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Class Arm
                    </label>
                    <select
                      value={registerClass}
                      onChange={(e) => setRegisterClass(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none"
                    >
                      {AVAILABLE_CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Register Date
                    </label>
                    <input
                      type="date"
                      value={registerDate}
                      onChange={(e) => setRegisterDate(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark All Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAttendanceRegister}
                    className="px-4 py-1.5 bg-[#C51E28] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Register</span>
                  </button>
                </div>
              </div>

              {registerSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Attendance register for {registerClass} saved and synchronized successfully!</span>
                </div>
              )}

              {/* Class Roll Call Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Adm No</th>
                      <th className="py-2.5 px-3">Learner Name</th>
                      <th className="py-2.5 px-3">Current Attendance</th>
                      <th className="py-2.5 px-3 text-center">Daily Status (P / A / L / E)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {classStudents.map((s, idx) => {
                      const status = getAttendanceStatus(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.admNo}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-700">{s.attendance || 95}%</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {[
                                { code: 'P', label: 'Present', color: 'bg-emerald-600 text-white' },
                                { code: 'A', label: 'Absent', color: 'bg-red-600 text-white' },
                                { code: 'L', label: 'Late', color: 'bg-amber-500 text-white' },
                                { code: 'E', label: 'Excused', color: 'bg-blue-600 text-white' },
                              ].map((opt) => (
                                <button
                                  key={opt.code}
                                  type="button"
                                  onClick={() => handleSetAttendance(s.id, opt.code as any)}
                                  className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                                    status === opt.code
                                      ? opt.color
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                  title={opt.label}
                                >
                                  {opt.code}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 3: MARK-LIST ENTRY */}
          {/* ======================================================== */}
          {activeMode === 'marks' && (
            <div className="space-y-4 text-center py-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Interactive Subject Mark-List Sheets
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Launch the rapid keyboard-optimized marks entry spreadsheet. Teachers can enter raw assessment scores for their designated classes with live CBE levels (EE, ME, AE, BE) calculation.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Teacher:</span>
                  <span className="font-bold text-slate-800">{teachers[0]?.name || 'Mr. Jotham Watila'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Default Stream:</span>
                  <span className="font-bold text-slate-800">Grade 8 South (G8 S)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Subject:</span>
                  <span className="font-bold text-slate-800">Pretechnical Studies</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenMarksEntryModal) {
                    onOpenMarksEntryModal(teachers[0]?.id || '', 'G8 S', 'Pretechnical Studies');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Launch Interactive Mark-List Entry Modal</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 4: BULK UPLOAD (CSV / EXCEL) */}
          {/* ======================================================== */}
          {activeMode === 'bulk' && (
            <div className="space-y-4 text-center py-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Bulk CSV &amp; Excel Learner Onboarding
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Import hundreds of learners simultaneously from NEMIS export sheets or standard school Excel registers. Automatically maps Admission No, Full Name, UPI, Grade, and Guardian contacts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenBulkUploadModal) onOpenBulkUploadModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>Open Bulk CSV Onboarding Assistant</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 5: PHOTOGRAPH MANAGEMENT */}
          {/* ======================================================== */}
          {activeMode === 'photo' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
                <Camera className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Learner &amp; Teacher Photograph Repository:</span>
                  <span className="ml-1 text-purple-800">
                    Capture or assign official portrait photos for student report forms, school registers, and ID badges.
                  </span>
                </div>
              </div>

              {photoSavedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{photoSavedMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left: Selector & Photo Input */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Learner
                    </label>
                    <select
                      value={selectedStudentForPhoto}
                      onChange={(e) => {
                        setSelectedStudentForPhoto(e.target.value);
                        const s = students.find((st) => st.id === e.target.value);
                        if (s?.photoUrl) setTempPhotoUrl(s.photoUrl);
                        else setTempPhotoUrl('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.admNo} - {s.name} ({s.classArm})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Photograph URL or Cloud File
                    </label>
                    <input
                      type="url"
                      placeholder="https://... image link"
                      value={tempPhotoUrl}
                      onChange={(e) => setTempPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sample Portrait Presets (Click to Select)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {samplePhotos.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempPhotoUrl(url)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                            tempPhotoUrl === url ? 'border-purple-600 ring-2 ring-purple-300' : 'border-slate-200 hover:border-purple-400'
                          }`}
                        >
                          <img
                            src={url}
                            alt="preset"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveStudentPhoto}
                    disabled={!tempPhotoUrl}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                      tempPhotoUrl
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Save Photograph to Learner Profile</span>
                  </button>
                </div>

                {/* Right: Preview Official Student ID Badge */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Official Student ID Card Badge Preview
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm max-w-xs mx-auto text-left">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#C51E28] text-white flex items-center justify-center font-black text-xs">
                        {schoolInfo.logoInitial || 'NJS'}
                      </div>
                      <div>
                        <div className="font-black text-[11px] text-slate-900 leading-tight">
                          {schoolInfo.name}
                        </div>
                        <div className="text-[9px] text-slate-500">Student Identity Card</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-20 h-24 rounded-xl border border-slate-300 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {tempPhotoUrl || activePhotoStudent.photoUrl ? (
                          <img
                            src={tempPhotoUrl || activePhotoStudent.photoUrl}
                            alt="Student"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                            <span className="text-[9px] text-slate-400 font-bold block">No Photo</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px]">NAME:</span>
                          <span className="font-black text-slate-800 text-xs leading-tight block">
                            {activePhotoStudent.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px]">ADM NO:</span>
                          <span className="font-bold text-slate-700 font-mono">{activePhotoStudent.admNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px]">CLASS:</span>
                          <span className="font-bold text-slate-700">{activePhotoStudent.classArm}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold text-[9px]">UPI:</span>
                          <span className="font-mono text-slate-600 text-[9px]">{activePhotoStudent.upi || 'UPI-PENDING'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>VALID: 2026 ACADEMIC YEAR</span>
                      <span className="font-bold text-slate-600">KENYA MOE/CBA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
