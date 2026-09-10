import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  UserCheck,
  UserX,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Eye,
  Edit2,
  Users,
  X,
  Phone,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { Student, User } from '../../types';
import { LearnerEnrollmentStatus } from '../../types/learnerWelfare';
import { AVAILABLE_CLASSES, AVAILABLE_GRADES } from '../../data/mockData';

interface LearnerProfileMasterTabProps {
  students: Student[];
  currentUser?: User;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
  onSelectStudent?: (student: Student) => void;
  onOpenLearnerDossier?: (student: Student) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const ALL_STATUSES: LearnerEnrollmentStatus[] = [
  'Active',
  'Pending Admission',
  'Transferred In',
  'Transferred Out',
  'Graduated',
  'Completed',
  'Suspended',
  'Withdrawn',
  'Deceased',
  'Archived',
];

export const LearnerProfileMasterTab: React.FC<LearnerProfileMasterTabProps> = ({
  students,
  currentUser: _currentUser,
  onAddStudent,
  onUpdateStudent,
  onOpenLearnerDossier,
  onLogAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  // Form State
  const [formAdmNo, setFormAdmNo] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female'>('Male');
  const [formDob, setFormDob] = useState('2012-05-14');
  const [formNationality, setFormNationality] = useState('Kenyan');
  const [formGrade, setFormGrade] = useState('G8');
  const [formStream, setFormStream] = useState('S');
  const [formStatus, setFormStatus] = useState<LearnerEnrollmentStatus>('Active');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formHomeAddress, setFormHomeAddress] = useState('Kiminini, Kitale');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formUpi, setFormUpi] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('O+');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.upi && s.upi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const studentClass = `${s.grade} ${s.stream || s.classArm || ''}`.trim();
      const matchesClass =
        selectedClass === 'All' ||
        studentClass === selectedClass ||
        s.grade === selectedClass;

      const currentStat = s.enrollmentStatus || (s.status as any) || 'Active';
      const matchesStatus = selectedStatus === 'All' || currentStat === selectedStatus;

      const matchesGender = selectedGender === 'All' || s.gender === selectedGender;

      return matchesSearch && matchesClass && matchesStatus && matchesGender;
    });
  }, [students, searchTerm, selectedClass, selectedStatus, selectedGender]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(
      (s) => (s.enrollmentStatus || s.status || 'Active') === 'Active'
    ).length;
    const pending = students.filter(
      (s) => (s.enrollmentStatus || s.status) === 'Pending Admission'
    ).length;
    const transferredOut = students.filter(
      (s) => (s.enrollmentStatus || s.status) === 'Transferred Out'
    ).length;
    const graduated = students.filter(
      (s) => (s.enrollmentStatus || s.status) === 'Graduated' || (s.enrollmentStatus || s.status) === 'Completed'
    ).length;
    const specialCare = students.filter(
      (s) => s.specialNeeds?.hasSpecialNeeds || s.healthProfile?.allergies?.length || s.vulnerability
    ).length;

    return { total, active, pending, transferredOut, graduated, specialCare };
  }, [students]);

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormAdmNo(student.admNo);
    setFormName(student.name);
    setFormGender((student.gender as any) || 'Male');
    setFormDob(student.dateOfBirth || '2012-05-14');
    setFormNationality(student.nationality || 'Kenyan');
    setFormGrade(student.grade);
    setFormStream(student.stream || student.classArm?.split(' ')[1] || 'S');
    setFormStatus((student.enrollmentStatus as any) || (student.status as any) || 'Active');
    setFormParentName(student.parentName || student.parents?.[0]?.name || '');
    setFormParentPhone(student.parentPhone || student.parents?.[0]?.phoneNumber || '');
    setFormParentEmail(student.parentEmail || '');
    setFormHomeAddress(student.homeAddress || 'Kiminini, Kitale');
    setFormEmergencyContact(student.emergencyContact || '');
    setFormEmergencyPhone(student.emergencyPhone || '');
    setFormUpi(student.upi || '');
    setFormAllergies(student.healthProfile?.allergies?.join(', ') || '');
    setFormBloodGroup(student.healthProfile?.bloodGroup || 'O+');
    setFormValidationError(null);
    setShowAddModal(true);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    const nextNum = students.length + 1;
    setFormAdmNo(`ADM-2026-${String(nextNum).padStart(3, '0')}`);
    setFormName('');
    setFormGender('Male');
    setFormDob('2012-05-14');
    setFormNationality('Kenyan');
    setFormGrade('G8');
    setFormStream('S');
    setFormStatus('Active');
    setFormParentName('');
    setFormParentPhone('+254 7');
    setFormParentEmail('');
    setFormHomeAddress('Kiminini, Kitale');
    setFormEmergencyContact('');
    setFormEmergencyPhone('');
    setFormUpi('');
    setFormAllergies('');
    setFormBloodGroup('O+');
    setFormValidationError(null);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    const trimmedAdm = formAdmNo.trim().toUpperCase();
    const trimmedName = formName.trim();

    if (!trimmedAdm) {
      setFormValidationError('Admission Number is mandatory.');
      return;
    }
    if (!trimmedName) {
      setFormValidationError('Learner full name is mandatory.');
      return;
    }

    // P6.1.2 Unique Admission Number rule
    const existing = students.find(
      (s) => s.admNo.toUpperCase() === trimmedAdm && s.id !== editingStudent?.id
    );
    if (existing) {
      setFormValidationError(
        `Admission Number "${trimmedAdm}" is already assigned to "${existing.name}". Duplicate admission numbers are strictly prohibited.`
      );
      return;
    }

    const className = `${formGrade} ${formStream}`;
    const nameParts = trimmedName.split(' ');
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : trimmedName.substring(0, 2).toUpperCase();

    const allergiesList = formAllergies
      ? formAllergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        admNo: trimmedAdm,
        name: trimmedName,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gender: formGender,
        dateOfBirth: formDob,
        nationality: formNationality,
        grade: formGrade,
        stream: formStream,
        classArm: className,
        avatarInitials: initials,
        upi: formUpi.trim() || undefined,
        status: formStatus,
        enrollmentStatus: formStatus,
        parentName: formParentName.trim() || undefined,
        parentPhone: formParentPhone.trim() || undefined,
        parentEmail: formParentEmail.trim() || undefined,
        homeAddress: formHomeAddress.trim() || undefined,
        emergencyContact: formEmergencyContact.trim() || undefined,
        emergencyPhone: formEmergencyPhone.trim() || undefined,
        healthProfile: {
          studentId: editingStudent.id,
          bloodGroup: formBloodGroup as any,
          allergies: allergiesList,
          chronicConditions: editingStudent.healthProfile?.chronicConditions || [],
          disabilities: editingStudent.healthProfile?.disabilities || [],
          regularMedications: editingStudent.healthProfile?.regularMedications || [],
          emergencyMedicalNotes: editingStudent.healthProfile?.emergencyMedicalNotes || '',
          immunizationUpToDate: true,
        },
      };

      onUpdateStudent(updated);
      if (onLogAudit) {
        onLogAudit(
          'STUDENT_UPDATED' as any,
          `Updated Master Learner Record for ${updated.name} (${updated.admNo}). Status: ${formStatus}. Class: ${className}.`,
          JSON.stringify(editingStudent),
          JSON.stringify(updated)
        );
      }
    } else {
      const newStudent: Student = {
        id: `std-p6-${Date.now()}`,
        schoolId: 'sch-jjsak-001',
        admNo: trimmedAdm,
        name: trimmedName,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gender: formGender,
        dateOfBirth: formDob,
        nationality: formNationality,
        grade: formGrade,
        stream: formStream,
        classArm: className,
        term: 'Term 2, 2026',
        year: 2026,
        avatarInitials: initials,
        avgScore: null,
        overallGrade: 'ME',
        position: 'N/A',
        attendance: 100,
        subjects: [],
        classTeacherComment: 'Admitted into cohort.',
        classTeacherName: 'Class Teacher',
        headOfSchoolName: 'Mrs. J. Barasa',
        nextTermDate: '5th August 2026',
        upi: formUpi.trim() || undefined,
        status: formStatus,
        enrollmentStatus: formStatus,
        enrollmentDate: new Date().toISOString().split('T')[0],
        parentName: formParentName.trim() || undefined,
        parentPhone: formParentPhone.trim() || undefined,
        parentEmail: formParentEmail.trim() || undefined,
        homeAddress: formHomeAddress.trim() || undefined,
        emergencyContact: formEmergencyContact.trim() || undefined,
        emergencyPhone: formEmergencyPhone.trim() || undefined,
        healthProfile: {
          studentId: `std-p6-${Date.now()}`,
          bloodGroup: formBloodGroup as any,
          allergies: allergiesList,
          chronicConditions: [],
          disabilities: [],
          regularMedications: [],
          emergencyMedicalNotes: '',
          immunizationUpToDate: true,
        },
      };

      onAddStudent(newStudent);
      if (onLogAudit) {
        onLogAudit(
          'STUDENT_CREATED' as any,
          `Registered new Master Learner Record: ${newStudent.name} (${newStudent.admNo}) in ${className}. Status: ${newStudent.enrollmentStatus}.`
        );
      }
    }

    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Admission_Number',
      'Full_Name',
      'Gender',
      'Date_of_Birth',
      'Nationality',
      'Grade',
      'Stream',
      'Enrollment_Status',
      'UPI_NEMIS',
      'Parent_Name',
      'Parent_Phone',
      'Emergency_Contact',
      'Emergency_Phone',
      'Blood_Group',
      'Allergies',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.admNo}"`,
      `"${s.name}"`,
      `"${s.gender || 'Male'}"`,
      `"${s.dateOfBirth || ''}"`,
      `"${s.nationality || 'Kenyan'}"`,
      `"${s.grade}"`,
      `"${s.stream || s.classArm?.split(' ')[1] || 'S'}"`,
      `"${s.enrollmentStatus || s.status || 'Active'}"`,
      `"${s.upi || ''}"`,
      `"${s.parentName || s.parents?.[0]?.name || ''}"`,
      `"${s.parentPhone || s.parents?.[0]?.phoneNumber || ''}"`,
      `"${s.emergencyContact || ''}"`,
      `"${s.emergencyPhone || ''}"`,
      `"${s.healthProfile?.bloodGroup || 'O+'}"`,
      `"${s.healthProfile?.allergies?.join('; ') || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JJSAK_Master_Learner_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = () => {
    setBulkError(null);
    setBulkSuccess(null);

    if (!bulkCsvText.trim()) {
      setBulkError('Please paste valid CSV lines to import.');
      return;
    }

    const lines = bulkCsvText.trim().split('\n');
    let importedCount = 0;
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 2) return;

      const adm = parts[0];
      const name = parts[1];
      const gender = parts[2] === 'Female' ? 'Female' : 'Male';
      const grade = parts[3] || 'G8';
      const stream = parts[4] || 'S';
      const parentName = parts[5] || '';
      const parentPhone = parts[6] || '';

      if (students.some((s) => s.admNo.toUpperCase() === adm.toUpperCase())) {
        errors.push(`Row ${index + 1}: Admission number ${adm} already exists.`);
        return;
      }

      const className = `${grade} ${stream}`;
      const nameParts = name.split(' ');
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : name.substring(0, 2).toUpperCase();

      const newStudent: Student = {
        id: `std-bulk-${Date.now()}-${index}`,
        schoolId: 'sch-jjsak-001',
        admNo: adm,
        name: name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gender: gender,
        grade: grade,
        stream: stream,
        classArm: className,
        term: 'Term 2, 2026',
        year: 2026,
        avatarInitials: initials,
        avgScore: null,
        overallGrade: 'ME',
        position: 'N/A',
        attendance: 100,
        subjects: [],
        classTeacherComment: 'Enrolled via bulk registration.',
        classTeacherName: 'Class Teacher',
        headOfSchoolName: 'Mrs. J. Barasa',
        nextTermDate: '5th August 2026',
        status: 'Active',
        enrollmentStatus: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
      };

      onAddStudent(newStudent);
      importedCount++;
    });

    if (importedCount > 0) {
      setBulkSuccess(`Successfully registered ${importedCount} learners!`);
      setBulkCsvText('');
      if (onLogAudit) {
        onLogAudit(
          'BULK_STUDENTS_IMPORTED' as any,
          `Bulk enrollment executed: ${importedCount} new learners registered.`
        );
      }
    }
    if (errors.length > 0) {
      setBulkError(errors.join('; '));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-medium">All cohorts</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Learners</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 mt-1">{stats.active}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Academic eligible</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending / Review</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">{stats.pending}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting activation</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Transferred Out</span>
            <UserX className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700 mt-1">{stats.transferredOut}</p>
          <span className="text-[10px] text-blue-600 font-medium">Archived clearance</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Graduated / Alumni</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-700 mt-1">{stats.graduated}</p>
          <span className="text-[10px] text-purple-600 font-medium">Grade 9 completed</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Special Care</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-700 mt-1">{stats.specialCare}</p>
          <span className="text-[10px] text-rose-600 font-medium">Medical / Welfare</span>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Learner Name, Admission Number, UPI NEMIS, or Parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Learner</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title="Bulk Import Learners"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Bulk Import</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title="Export Learner Directory to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px] mr-1">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Classes &amp; Streams</option>
            {AVAILABLE_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {AVAILABLE_GRADES.map((g) => (
              <option key={g} value={g}>
                All {g}
              </option>
            ))}
          </select>

          {/* Enrollment Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            {(['All', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGender(g)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  selectedGender === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 ml-auto font-medium">
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            {students.length} records
          </span>
        </div>
      </div>

      {/* Master Learners Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Learner &amp; Adm No</th>
                <th className="py-3 px-3">Gender / Age</th>
                <th className="py-3 px-3">Class &amp; Stream</th>
                <th className="py-3 px-3">Enrollment Status</th>
                <th className="py-3 px-3">Parent / Emergency Contact</th>
                <th className="py-3 px-3">Health &amp; Welfare</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    No learners match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const status = (s.enrollmentStatus as LearnerEnrollmentStatus) || (s.status as any) || 'Active';
                  const isSuspended = status === 'Suspended';
                  const isInactive = status !== 'Active';

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  );

                  if (status === 'Pending Admission') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    );
                  } else if (status === 'Transferred In') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Transferred In
                      </span>
                    );
                  } else if (status === 'Transferred Out') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Transferred Out
                      </span>
                    );
                  } else if (status === 'Graduated' || status === 'Completed') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <GraduationCap className="w-2.5 h-2.5" />
                        {status}
                      </span>
                    );
                  } else if (isSuspended) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Suspended
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isInactive ? 'bg-slate-50/40 text-slate-500' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {s.avatarInitials || s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {s.upi && (
                                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200">
                                  {s.upi}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">{s.admNo}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-700">{s.gender || 'Male'}</div>
                        <div className="text-[10px] text-slate-400">
                          DOB: {s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : '2012-05-14'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{`${s.grade} ${s.stream || s.classArm || ''}`.trim()}</div>
                        <div className="text-[10px] text-slate-400">{s.grade}</div>
                      </td>

                      <td className="py-3 px-3">{statusBadge}</td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {s.parentName || s.parents?.[0]?.name || 'Guardian'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.parentPhone || s.parents?.[0]?.phoneNumber || 'Not provided'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            🩸 {s.healthProfile?.bloodGroup || 'O+'}
                          </span>
                          {s.healthProfile?.allergies && s.healthProfile.allergies.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              ⚠️ Allergies ({s.healthProfile.allergies.length})
                            </span>
                          )}
                          {s.vulnerability && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
                              🛡️ Welfare
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenLearnerDossier?.(s)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Open 360° Comprehensive Learner Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit Learner Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Learner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudent ? 'Edit Master Learner Profile' : 'Register New Learner (Phase 6)'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Compliant with P6.1 Master Record &amp; P6.1.2 Unique Admission Number Rules
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formValidationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formValidationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              {/* Section 1: Core Learner Identification */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Core Identification</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Admission Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formAdmNo}
                      onChange={(e) => setFormAdmNo(e.target.value)}
                      placeholder="e.g. ADM-2026-045"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Victor Kipruto Cheruiyot"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formNationality}
                      onChange={(e) => setFormNationality(e.target.value)}
                      placeholder="Kenyan"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">UPI / NEMIS No.</label>
                    <input
                      type="text"
                      value={formUpi}
                      onChange={(e) => setFormUpi(e.target.value)}
                      placeholder="NEMIS-xxxx"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Class Allocation & Status */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Class Allocation &amp; Enrollment Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Grade</label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="G7">Grade 7</option>
                      <option value="G8">Grade 8</option>
                      <option value="G9">Grade 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Stream</label>
                    <select
                      value={formStream}
                      onChange={(e) => setFormStream(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="S">Stream S</option>
                      <option value="J">Stream J</option>
                      <option value="K">Stream K</option>
                      <option value="A">Stream A</option>
                      <option value="B">Stream B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Enrollment Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-indigo-700"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Parent / Guardian & Emergency */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Parent / Guardian &amp; Emergency Contacts</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      placeholder="e.g. Agnes Cheruiyot"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Phone (SMS/Alerts)</label>
                    <input
                      type="tel"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Home Address / Location</label>
                    <input
                      type="text"
                      value={formHomeAddress}
                      onChange={(e) => setFormHomeAddress(e.target.value)}
                      placeholder="e.g. Kiminini, Trans-Nzoia"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={formEmergencyContact}
                      onChange={(e) => setFormEmergencyContact(e.target.value)}
                      placeholder="e.g. Uncle Peter Barasa"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={formEmergencyPhone}
                      onChange={(e) => setFormEmergencyPhone(e.target.value)}
                      placeholder="+254 722 000 111"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Basic Health Card */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Health Card Basics</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formBloodGroup}
                      onChange={(e) => setFormBloodGroup(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-rose-700"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formAllergies}
                      onChange={(e) => setFormAllergies(e.target.value)}
                      placeholder="e.g. Peanuts, Penicillin, Dust Mites"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                >
                  {editingStudent ? 'Save Profile Changes' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bulk Learner Registration (CSV)</h3>
                <p className="text-xs text-slate-500 font-medium">P6.2.1 Batch Enrollment Import</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono space-y-1 border border-slate-200">
              <div className="font-bold text-slate-800 font-sans">Required CSV Format:</div>
              <div>ADM_NO, FULL_NAME, GENDER, GRADE, STREAM, PARENT_NAME, PARENT_PHONE</div>
              <div className="text-slate-400 italic font-sans mt-1">
                Example: ADM-2026-101, Collins Barasa, Male, G8, S, Patrick Barasa, +254712345678
              </div>
            </div>

            {bulkError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {bulkError}
              </div>
            )}

            {bulkSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {bulkSuccess}
              </div>
            )}

            <textarea
              rows={6}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              placeholder="Paste comma-separated rows here..."
              className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Import Learners
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
