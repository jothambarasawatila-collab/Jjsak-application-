import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  GraduationCap,
  ChevronRight,
  UserPlus,
  X,
  Edit2,
  Trash2,
  Award,
  MinusCircle,
  Calculator,
  Users,
  ShieldAlert,
  FileCheck,
  QrCode,
  Check,
  Copy,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Student, User, ParentContact } from '../types';
import {
  calculateGrade,
  calculateStudentAverage,
  AVAILABLE_CLASSES,
  AVAILABLE_GRADES,
  AVAILABLE_SUBJECTS,
  AVAILABLE_TERMS,
  POPULAR_SCORE_BASES,
  parseScoreString,
  getRankSuffix,
} from '../data/mockData';
import { ScoreConverterModal } from './ScoreConverterModal';
import { BatchReportGeneratorModal } from './BatchReportGeneratorModal';

interface StudentsScreenProps {
  students: Student[];
  currentUser?: User;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent?: (id: string) => void;
  onBack: () => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  students,
  currentUser,
  onSelectStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBack,
  onLogAudit,
}) => {
  const userRole = currentUser?.role || 'ADMIN';
  const canEditParents = userRole === 'ADMIN' || userRole === 'TEACHER' || userRole === 'HEADTEACHER' || userRole === 'DEPUTY_HEADTEACHER';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [selectedPerformanceFilter, setSelectedPerformanceFilter] = useState<'All' | 'EE' | 'ME' | 'AE' | 'BE'>('All');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [showRankings, setShowRankings] = useState(true);
  const [sortBy, setSortBy] = useState<'stream' | 'grade' | 'score' | 'name'>('stream');
  const [showBatchReportModal, setShowBatchReportModal] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'learner' | 'parents' | 'scores'>('learner');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Student QR Code Modal State for Attendance & Verification
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [attendanceLoggedForStudent, setAttendanceLoggedForStudent] = useState<string | null>(null);

  // Learner Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admNo, setAdmNo] = useState('');
  const [upi, setUpi] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('2012-04-15');
  const [grade, setGrade] = useState('G8');
  const [classArm, setClassArm] = useState('G8 S');
  const [stream, setStream] = useState('S');
  const [enrollmentDate, setEnrollmentDate] = useState('2024-01-08');
  const [status, setStatus] = useState<'Active' | 'Transferred' | 'Inactive'>('Active');
  const [term, setTerm] = useState('Term 2, 2026');
  const [year, setYear] = useState(2026);
  const [attendance, setAttendance] = useState(95);
  const [classTeacherComment, setClassTeacherComment] = useState('');
  const [classTeacherName, setClassTeacherName] = useState('Mr. O. Kinyanjui');
  const [headTeacherComment, setHeadTeacherComment] = useState('');
  const [headOfSchoolName, setHeadOfSchoolName] = useState('Mrs. J. Barasa');
  const [nextTermDate, setNextTermDate] = useState('5th August 2026');

  // Parent / Guardian Information State
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [occupation, setOccupation] = useState('');
  const [homeAddress, setHomeAddress] = useState('Kiminini, Kitale');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Subject Scores for student registration / editing
  const [subjectScores, setSubjectScores] = useState<Record<string, number | null>>(() => {
    const init: Record<string, number | null> = {};
    AVAILABLE_SUBJECTS.forEach((s) => {
      init[s] = 80;
    });
    return init;
  });
  const [rawScoreInputs, setRawScoreInputs] = useState<Record<string, string>>({});
  const [scoreBaseMode, setScoreBaseMode] = useState<number | 'custom'>(100);
  const [customBaseVal, setCustomBaseVal] = useState<string>('50');
  const [showConverterModal, setShowConverterModal] = useState(false);

  const currentScoreBase = scoreBaseMode === 'custom' ? parseFloat(customBaseVal) || 100 : scoreBaseMode;

  const openRegisterModal = () => {
    setEditingStudentId(null);
    setValidationError(null);
    setActiveModalTab('learner');
    setFirstName('');
    setLastName('');
    const randomAdm = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setAdmNo(randomAdm);
    setUpi(`UPI-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    setGender('Male');
    setDateOfBirth('2012-05-10');
    setGrade('G8');
    setClassArm('G8 S');
    setStream('S');
    setEnrollmentDate('2024-01-08');
    setStatus('Active');
    setTerm('Term 2, 2026');
    setYear(2026);
    setAttendance(95);
    setClassTeacherComment('Demonstrates positive character, active classroom participation, and strong competency across core areas.');
    setClassTeacherName('Mr. O. Kinyanjui');
    setHeadTeacherComment('An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.');
    setHeadOfSchoolName('Mrs. J. Barasa');
    setNextTermDate('5th August 2026');

    setFatherName('');
    setMotherName('');
    setGuardianName('');
    setRelationship('Father');
    setPhoneNumber1('+254 7');
    setPhoneNumber2('');
    setParentEmail('');
    setNationalId('');
    setOccupation('Business / Farming');
    setHomeAddress('Kiminini, Kitale');
    setEmergencyContact('');
    setEmergencyPhone('+254 7');

    const defaultScores: Record<string, number | null> = {
      English: 85,
      Kiswahili: 80,
      Mathematics: 82,
      'Integrated Science': 84,
      'Social Studies': 78,
      CRE: 88,
      Agriculture: 80,
      'Pretechnical Studies': 86,
      'Creative Arts': 76,
    };
    const defaultInputs: Record<string, string> = {};
    Object.entries(defaultScores).forEach(([k, v]) => {
      defaultInputs[k] = v !== null ? String(v) : '';
    });
    setSubjectScores(defaultScores);
    setRawScoreInputs(defaultInputs);
    setScoreBaseMode(100);
    setShowModal(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudentId(s.id);
    setValidationError(null);
    setActiveModalTab('learner');
    const nameParts = (s.name || '').trim().split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setAdmNo(s.admNo);
    setUpi(s.upi || `UPI-${s.admNo.replace(/\D/g, '')}`);
    const sName = (s.name || '').toLowerCase();
    setGender((s.gender as 'Male' | 'Female') || (sName.includes('mary') || sName.includes('jane') || sName.includes('grace') || sName.includes('joy') || sName.includes('cynthia') ? 'Female' : 'Male'));
    setDateOfBirth(s.dateOfBirth || '2012-04-15');
    setGrade(s.grade);
    setClassArm(s.classArm);
    setStream(s.classArm.split(' ')[1] || 'S');
    setEnrollmentDate(s.enrollmentDate || '2024-01-08');
    setStatus((s.status as 'Active' | 'Transferred' | 'Inactive') || 'Active');
    setTerm(s.term);
    setYear(s.year);
    setAttendance(s.attendance);
    setClassTeacherComment(s.classTeacherComment);
    setClassTeacherName(s.classTeacherName);
    setHeadTeacherComment(s.headTeacherComment || 'Commendable performance. Maintain diligence and active participation.');
    setHeadOfSchoolName(s.headOfSchoolName);
    setNextTermDate(s.nextTermDate);

    setFatherName(s.fatherName || s.parentName || '');
    setMotherName(s.motherName || '');
    setGuardianName(s.guardianName || '');
    setRelationship(s.parentRelationship || 'Father');
    setPhoneNumber1(s.parentPhone || s.parentPhone1 || '+254 7');
    setPhoneNumber2(s.parentPhone2 || '');
    setParentEmail(s.parentEmail || '');
    setNationalId(s.parentNationalId || '');
    setOccupation(s.parentOccupation || 'Civil Servant / Farmer');
    setHomeAddress(s.homeAddress || 'Kiminini, Kitale');
    setEmergencyContact(s.emergencyContact || s.fatherName || s.parentName || '');
    setEmergencyPhone(s.emergencyPhone || s.parentPhone || '+254 7');

    const scores: Record<string, number | null> = {};
    const inputs: Record<string, string> = {};
    AVAILABLE_SUBJECTS.forEach((sub) => {
      const match = s.subjects.find((item) => item.subject === sub);
      const val = match ? match.score : null;
      scores[sub] = val;
      inputs[sub] = val !== null && val !== undefined ? String(val) : '';
    });
    setSubjectScores(scores);
    setRawScoreInputs(inputs);
    setScoreBaseMode(100);
    setShowModal(true);
  };

  const handleRawScoreInputChange = (sub: string, text: string) => {
    setRawScoreInputs((prev) => ({ ...prev, [sub]: text }));
    const parsed = parseScoreString(text, currentScoreBase);
    setSubjectScores((prev) => ({
      ...prev,
      [sub]: parsed.percentage,
    }));
  };

  const handleBaseModeChange = (newBase: number | 'custom') => {
    setScoreBaseMode(newBase);
    const effBase = newBase === 'custom' ? parseFloat(customBaseVal) || 100 : newBase;
    const newScores: Record<string, number | null> = {};
    AVAILABLE_SUBJECTS.forEach((sub) => {
      const rawText = rawScoreInputs[sub];
      if (rawText && rawText.trim()) {
        const parsed = parseScoreString(rawText, effBase);
        newScores[sub] = parsed.percentage;
      } else {
        newScores[sub] = subjectScores[sub] ?? null;
      }
    });
    setSubjectScores(newScores);
  };

  const handleCustomBaseValChange = (val: string) => {
    setCustomBaseVal(val);
    const effBase = parseFloat(val) || 100;
    const newScores: Record<string, number | null> = {};
    AVAILABLE_SUBJECTS.forEach((sub) => {
      const rawText = rawScoreInputs[sub];
      if (rawText && rawText.trim()) {
        const parsed = parseScoreString(rawText, effBase);
        newScores[sub] = parsed.percentage;
      } else {
        newScores[sub] = subjectScores[sub] ?? null;
      }
    });
    setSubjectScores(newScores);
  };

  const handleScoreChange = (sub: string, val: number | null) => {
    if (val === null) {
      setSubjectScores((prev) => ({
        ...prev,
        [sub]: null,
      }));
      setRawScoreInputs((prev) => ({
        ...prev,
        [sub]: '',
      }));
      return;
    }
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setSubjectScores((prev) => ({
      ...prev,
      [sub]: clamped,
    }));
    setRawScoreInputs((prev) => ({
      ...prev,
      [sub]: String(clamped),
    }));
  };

  const handleSetAllScores = (val: number | null) => {
    const updated: Record<string, number | null> = {};
    const updatedInputs: Record<string, string> = {};
    AVAILABLE_SUBJECTS.forEach((sub) => {
      updated[sub] = val;
      updatedInputs[sub] = val !== null ? String(val) : '';
    });
    setSubjectScores(updated);
    setRawScoreInputs(updatedInputs);
    if (val === null) {
      setClassTeacherComment('Did not sit for term assessments.');
      setHeadTeacherComment('Did not sit for term assessments due to authorized absence.');
    }
  };

  const handleGradeChange = (selectedGrade: string) => {
    setGrade(selectedGrade);
    setClassArm(`${selectedGrade} ${stream}`);
    if (selectedGrade === 'G7') {
      setClassTeacherName('Ms. C. Wanjiru');
    } else if (selectedGrade === 'G8') {
      setClassTeacherName('Mr. O. Kinyanjui');
    } else {
      setClassTeacherName('Mr. P. Otieno');
    }
  };

  const handleStreamChange = (newStream: string) => {
    setStream(newStream);
    setClassArm(`${grade} ${newStream}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName && !firstName.trim()) {
      setValidationError('Please provide the learner\'s first name.');
      setActiveModalTab('learner');
      return;
    }
    if (!admNo.trim()) {
      setValidationError('Admission number is mandatory.');
      setActiveModalTab('learner');
      return;
    }

    const finalName = fullName || firstName.trim();
    const initials = finalName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'ST';

    const formattedSubjects = AVAILABLE_SUBJECTS.map((subName) => {
      const score = subjectScores[subName] !== undefined ? subjectScores[subName] : 75;
      const g = calculateGrade(score);
      return {
        subject: subName,
        score,
        grade: g.grade,
        remarks: g.remarks,
      };
    });

    const { avgScore, overallGrade } = calculateStudentAverage(formattedSubjects);

    // Prepare primary parent contact
    const primaryParent = fatherName || motherName || guardianName || 'Parent';
    const primaryPhone = phoneNumber1 || phoneNumber2 || '+254 700 000 000';

    const validParents: ParentContact[] = [
      ...(fatherName ? [{ id: 'p-f', name: fatherName, phoneNumber: phoneNumber1, relation: 'Father' }] : []),
      ...(motherName ? [{ id: 'p-m', name: motherName, phoneNumber: phoneNumber2 || phoneNumber1, relation: 'Mother' }] : []),
      ...(guardianName ? [{ id: 'p-g', name: guardianName, phoneNumber: phoneNumber1, relation: relationship || 'Guardian' }] : []),
    ];

    if (validParents.length === 0 && primaryPhone) {
      validParents.push({
        id: 'p-main',
        name: primaryParent,
        phoneNumber: primaryPhone,
        relation: relationship || 'Father',
      });
    }

    if (editingStudentId) {
      const existing = students.find((s) => s.id === editingStudentId);
      const updated: Student = {
        id: editingStudentId,
        admNo: admNo.trim() || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        upi: upi.trim() || undefined,
        name: finalName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth,
        grade,
        classArm,
        stream,
        enrollmentDate,
        status,
        term,
        year,
        avatarInitials: initials,
        avgScore,
        overallGrade,
        position: avgScore === null ? '-' : existing ? existing.position : `1/${students.length}`,
        attendance,
        classTeacherComment:
          classTeacherComment.trim() ||
          (avgScore === null
            ? 'Did not sit for term assessments.'
            : `${finalName} demonstrates positive character and consistent progress in all key competencies.`),
        classTeacherName,
        headTeacherComment:
          headTeacherComment.trim() ||
          (avgScore === null
            ? 'Did not sit for term assessments due to authorized absence.'
            : `Commendable performance and positive attitude. Maintain diligence next term.`),
        headOfSchoolName,
        nextTermDate,
        parentName: primaryParent,
        parentPhone: primaryPhone,
        fatherName,
        motherName,
        guardianName,
        parentRelationship: relationship,
        parentPhone1: phoneNumber1,
        parentPhone2: phoneNumber2,
        parentEmail,
        parentNationalId: nationalId,
        parentOccupation: occupation,
        homeAddress,
        emergencyContact,
        emergencyPhone,
        parents: validParents,
        subjects: formattedSubjects,
      };

      if (onUpdateStudent) {
        onUpdateStudent(updated);
      }
      onSelectStudent(updated);
      onLogAudit?.('STUDENT_UPDATE', `Updated student record for ${finalName} (${updated.admNo})`);
    } else {
      const newStudent: Student = {
        id: 'std-' + Math.random().toString(36).substring(2, 9),
        admNo: admNo.trim() || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        upi: upi.trim() || undefined,
        name: finalName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth,
        grade,
        classArm,
        stream,
        enrollmentDate,
        status,
        term,
        year,
        avatarInitials: initials,
        avgScore,
        overallGrade,
        position: `${students.length + 1}/${students.length + 1}`,
        attendance,
        classTeacherComment:
          classTeacherComment.trim() ||
          `${finalName} demonstrates positive character and consistent progress in all key competencies.`,
        classTeacherName,
        headTeacherComment:
          headTeacherComment.trim() ||
          `Commendable performance and positive attitude. Maintain diligence next term.`,
        headOfSchoolName,
        nextTermDate,
        parentName: primaryParent,
        parentPhone: primaryPhone,
        fatherName,
        motherName,
        guardianName,
        parentRelationship: relationship,
        parentPhone1: phoneNumber1,
        parentPhone2: phoneNumber2,
        parentEmail,
        parentNationalId: nationalId,
        parentOccupation: occupation,
        homeAddress,
        emergencyContact,
        emergencyPhone,
        parents: validParents,
        subjects: formattedSubjects,
      };

      onAddStudent(newStudent);
      onSelectStudent(newStudent);
      onLogAudit?.('STUDENT_CREATE', `Enrolled new student ${finalName} (${newStudent.admNo}) in ${classArm}`);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (onDeleteStudent) {
      onDeleteStudent(id);
    }
    setDeleteConfirmId(null);
    onLogAudit?.('STUDENT_DELETE', `Deleted student record: ${studentToDelete?.name || id}`);
  };

  const streamCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    AVAILABLE_CLASSES.forEach((c) => {
      counts[c] = 0;
    });
    students.forEach((s) => {
      counts[s.classArm] = (counts[s.classArm] || 0) + 1;
    });
    return counts;
  }, [students]);

  const filteredStudents = students
    .filter((s) => {
      const q = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.admNo && s.admNo.toLowerCase().includes(q)) ||
        (s.upi && s.upi.toLowerCase().includes(q));

      const matchesClass =
        selectedClassFilter === 'All' ||
        s.classArm === selectedClassFilter ||
        s.classArm.includes(selectedClassFilter);

      const matchesGrade =
        selectedGradeFilter === 'All' ||
        s.grade === selectedGradeFilter ||
        s.classArm.startsWith(selectedGradeFilter);

      const matchesPerformance =
        selectedPerformanceFilter === 'All' ||
        (() => {
          const score = s.avgScore ?? 0;
          if (selectedPerformanceFilter === 'EE') return score >= 80;
          if (selectedPerformanceFilter === 'ME') return score >= 65 && score < 80;
          if (selectedPerformanceFilter === 'AE') return score >= 50 && score < 65;
          if (selectedPerformanceFilter === 'BE') return score < 50;
          return true;
        })();

      const matchesGender =
        selectedGenderFilter === 'All' || (s.gender || 'Male') === selectedGenderFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesGrade &&
        matchesPerformance &&
        matchesGender
      );
    })
    .sort((a, b) => {
      if (sortBy === 'stream') {
        if (a.classArm !== b.classArm) return a.classArm.localeCompare(b.classArm);
        const rankA = a.streamRank ?? 9999;
        const rankB = b.streamRank ?? 9999;
        return rankA - rankB;
      }
      if (sortBy === 'grade') {
        if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
        const rankA = a.gradeRank ?? 9999;
        const rankB = b.gradeRank ?? 9999;
        return rankA - rankB;
      }
      if (sortBy === 'score') {
        const scoreA = a.avgScore ?? -1;
        const scoreB = b.avgScore ?? -1;
        return scoreB - scoreA;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 select-none">
      {/* Top Red Header */}
      <div className="bg-[#C51E28] text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-white tracking-tight">
            Student Management
          </h1>
          <span className="text-[10px] text-red-100 font-medium block">
            Directory &amp; CBC Assessment Records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowBatchReportModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 transition cursor-pointer"
            title="1-Click Batch Reports for All Learners"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1-Click Batch</span>
          </button>
          <button
            type="button"
            onClick={() => setShowConverterModal(true)}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="Score to 100% Converter (x/50, x/30, x/80 ➔ 100%)"
          >
            <Calculator className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={openRegisterModal}
            className="w-8 h-8 rounded-full bg-white text-[#C51E28] flex items-center justify-center font-bold shadow-xs hover:bg-red-50 active:scale-95 transition cursor-pointer"
            title="Register New Student"
          >
            <Plus className="w-4 h-4 text-[#C51E28]" />
          </button>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Quick Summary Pill Bar */}
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/90 grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Students</span>
            <span className="text-lg font-black text-[#C51E28] mt-0.5 block">{students.length}</span>
          </div>
          <div className="pl-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Classes</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 block">{AVAILABLE_CLASSES.length}</span>
          </div>
          <div className="pl-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">CBC Levels</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 block">G7, G8, G9</span>
          </div>
        </div>

        {/* Total Students Registered per Stream breakdown */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C51E28]" />
              <span>Registered Learners per Stream</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Click to filter stream</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedClassFilter('All')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedClassFilter === 'All'
                  ? 'bg-[#C51E28] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Streams</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedClassFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {students.length}
              </span>
            </button>

            {AVAILABLE_CLASSES.map((cls) => {
              const count = streamCounts[cls] || 0;
              const isSelected = selectedClassFilter === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#C51E28] text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cls}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-[#C51E28]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or ADM No..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28] shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
            >
              <option value="All">All Grades (G7-G9)</option>
              {AVAILABLE_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#C51E28]"
            >
              <option value="All">All Streams (N & S)</option>
              {AVAILABLE_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ranking Sort Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('stream')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                sortBy === 'stream'
                  ? 'bg-[#C51E28] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>Stream Rank</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('grade')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                sortBy === 'grade'
                  ? 'bg-[#C51E28] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Grade Rank</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                sortBy === 'score'
                  ? 'bg-[#C51E28] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Highest Score</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-[#C51E28] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Name A-Z</span>
            </button>
          </div>

          {/* Level, Gender & Rankings Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Level:
            </span>
            {(['All', 'EE', 'ME', 'AE', 'BE'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedPerformanceFilter(lvl)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                  selectedPerformanceFilter === lvl
                    ? 'bg-[#C51E28] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lvl === 'All' ? 'All CBC' : lvl}
              </button>
            ))}

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 ml-2 mr-1">
              Gender:
            </span>
            {(['All', 'Male', 'Female'] as const).map((gen) => (
              <button
                key={gen}
                type="button"
                onClick={() => setSelectedGenderFilter(gen)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                  selectedGenderFilter === gen
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {gen}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowRankings(!showRankings)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ml-auto border ${
                showRankings
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {showRankings ? '✓ Rank: On' : 'Rank: Off'}
            </button>
          </div>
        </div>

        {/* Register Student Action Banner */}
        <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C51E28] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Admin Student Registration</h4>
              <p className="text-[10px] text-slate-500 font-medium">Add student records, allocate class & scores</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openRegisterModal}
            className="px-3 py-1.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Student List */}
        <div className="flex flex-col gap-2.5 mt-1">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No students found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try changing filters or register a new student</p>
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/90 hover:border-red-300 hover:shadow-md transition text-left flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div
                  onClick={() => onSelectStudent(s)}
                  className="flex items-center gap-3 flex-1 overflow-hidden"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E11D48] to-[#C51E28] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {s.avatarInitials}
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#C51E28] transition truncate">
                      {s.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {s.classArm}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        {s.admNo}
                      </span>
                    </div>

                    {/* Ranking Badges for Stream & Grade */}
                    {showRankings && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-[#C51E28] border border-red-100 font-bold text-[10px] flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" />
                          <span>Stream: {s.streamRank ? getRankSuffix(s.streamRank) : s.streamPosition || '-'}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                          Grade: {s.gradeRank ? getRankSuffix(s.gradeRank) : s.gradePosition || '-'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Score */}
                  <div
                    onClick={() => onSelectStudent(s)}
                    className="text-right"
                  >
                    <span className="text-base font-extrabold text-[#C51E28] block">
                      {s.avgScore !== null && s.avgScore !== undefined ? `${s.avgScore}%` : '-'}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-red-50 text-[#C51E28] border border-red-100 inline-block">
                      {s.overallGrade || '-'}
                    </span>
                  </div>

                  {/* Actions (QR Code / Edit / Delete) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudentForQr(s);
                      setQrCopied(false);
                      setAttendanceLoggedForStudent(null);
                    }}
                    className="w-7 h-7 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 flex items-center justify-center transition"
                    title="Generate & View Unique Student QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(s);
                    }}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                    title="Edit Student"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(s.id);
                    }}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition"
                    title="Delete Student"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectStudent(s)}
                    className="w-7 h-7 rounded-lg text-slate-400 group-hover:text-[#C51E28] flex items-center justify-center transition"
                    title="View Report Card"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Student Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-11 h-11 rounded-full bg-red-100 text-[#C51E28] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delete Student Record?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              This will permanently delete this student and their CBC assessment scores.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-[#C51E28]">
                <UserPlus className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingStudentId ? 'Edit Learner Record' : 'Register New Learner'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ministry of Education CBC Junior School Dossier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl my-3 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setActiveModalTab('learner')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'learner'
                    ? 'bg-white text-[#C51E28] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>1. Learner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('parents')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'parents'
                    ? 'bg-white text-[#C51E28] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>2. Parents</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('scores')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'scores'
                    ? 'bg-white text-[#C51E28] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. CBC Scores</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 text-xs">
              {validationError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* TAB 1: LEARNER DETAILS */}
              {activeModalTab === 'learner' && (
                <div className="space-y-3">
                  {/* Name Fields: First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Samuel"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Last / Other Names <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Mutua Wambua"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                      />
                    </div>
                  </div>

                  {/* Admission No, UPI & Gender */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Admission No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={admNo}
                        onChange={(e) => setAdmNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        UPI / NEMIS No
                      </label>
                      <input
                        type="text"
                        value={upi}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="UPI-2026-..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Date of Birth & Enrollment Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Enrollment Date
                      </label>
                      <input
                        type="date"
                        value={enrollmentDate}
                        onChange={(e) => setEnrollmentDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      />
                    </div>
                  </div>

                  {/* Grade & Stream Class Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Grade
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => handleGradeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      >
                        {AVAILABLE_GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Stream
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => handleStreamChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      >
                        <option value="S">South (S)</option>
                        <option value="N">North (N)</option>
                        <option value="E">East (E)</option>
                        <option value="W">West (W)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'Active' | 'Transferred' | 'Inactive')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#C51E28]"
                      >
                        <option value="Active">Active</option>
                        <option value="Transferred">Transferred</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Term & Attendance */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Academic Term
                      </label>
                      <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      >
                        {AVAILABLE_TERMS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Attendance (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={attendance}
                        onChange={(e) => setAttendance(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('parents')}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Continue to Parent Info</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PARENT / GUARDIAN INFORMATION */}
              {activeModalTab === 'parents' && (
                <div className="space-y-3">
                  {!canEditParents ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs">
                        Parent and guardian records can only be modified by authorized Teachers and Administrators.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200/80 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Parent / Guardian Directory Information</span>
                        </div>

                        {/* Father Name & Mother Name */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Father's Name
                            </label>
                            <input
                              type="text"
                              value={fatherName}
                              onChange={(e) => setFatherName(e.target.value)}
                              placeholder="e.g. John Mutua"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Mother's Name
                            </label>
                            <input
                              type="text"
                              value={motherName}
                              onChange={(e) => setMotherName(e.target.value)}
                              placeholder="e.g. Grace Wambua"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        {/* Guardian Name & Relationship */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Guardian's Name (If applicable)
                            </label>
                            <input
                              type="text"
                              value={guardianName}
                              onChange={(e) => setGuardianName(e.target.value)}
                              placeholder="e.g. Uncle David"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Primary Relationship
                            </label>
                            <select
                              value={relationship}
                              onChange={(e) => setRelationship(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Sponsor">Sponsor / Relative</option>
                            </select>
                          </div>
                        </div>

                        {/* Phone 1 & Phone 2 */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Phone Number 1 (Primary WhatsApp) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={phoneNumber1}
                              onChange={(e) => setPhoneNumber1(e.target.value)}
                              placeholder="+254 7..."
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Phone Number 2 (Alternative)
                            </label>
                            <input
                              type="tel"
                              value={phoneNumber2}
                              onChange={(e) => setPhoneNumber2(e.target.value)}
                              placeholder="+254 7..."
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        {/* Email & National ID */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Parent Email Address
                            </label>
                            <input
                              type="email"
                              value={parentEmail}
                              onChange={(e) => setParentEmail(e.target.value)}
                              placeholder="parent@gmail.com"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              National ID / Passport No.
                            </label>
                            <input
                              type="text"
                              value={nationalId}
                              onChange={(e) => setNationalId(e.target.value)}
                              placeholder="e.g. 29384756"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        {/* Occupation & Home Address */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Occupation
                            </label>
                            <input
                              type="text"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              placeholder="e.g. Teacher / Farmer"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Home Address / Location
                            </label>
                            <input
                              type="text"
                              value={homeAddress}
                              onChange={(e) => setHomeAddress(e.target.value)}
                              placeholder="e.g. Kiminini, Kitale"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        {/* Emergency Contact & Emergency Phone */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Emergency Contact Person
                            </label>
                            <input
                              type="text"
                              value={emergencyContact}
                              onChange={(e) => setEmergencyContact(e.target.value)}
                              placeholder="e.g. Aunt Mary"
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Emergency Contact Phone
                            </label>
                            <input
                              type="tel"
                              value={emergencyPhone}
                              onChange={(e) => setEmergencyPhone(e.target.value)}
                              placeholder="+254 7..."
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('learner')}
                      className="px-3 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition hover:bg-slate-50"
                    >
                      Back to Learner
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('scores')}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Continue to Scores</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CBC SCORES & REMARKS */}
              {activeModalTab === 'scores' && (
                <div className="space-y-3">
                  {/* CBC Subject Performance Baseline Scores */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                        <Award className="w-3.5 h-3.5 text-[#C51E28]" />
                        <span>CBC Subject Assessment ({AVAILABLE_SUBJECTS.length} Subjects)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConverterModal(true)}
                        className="text-[10px] font-bold text-[#C51E28] hover:underline flex items-center gap-0.5"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Formula Guide</span>
                      </button>
                    </div>

                    {/* Scale / Out Of (Denominator) Selector */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">
                          Input Scale / Out Of Base:
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Base: /{currentScoreBase}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {POPULAR_SCORE_BASES.map((b) => (
                          <button
                            key={b.value}
                            type="button"
                            onClick={() => handleBaseModeChange(b.value)}
                            className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition border cursor-pointer ${
                              scoreBaseMode === b.value
                                ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {b.shortLabel}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleBaseModeChange('custom')}
                          className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition border cursor-pointer ${
                            scoreBaseMode === 'custom'
                              ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {scoreBaseMode === 'custom' && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-slate-600">Custom Out Of: /</span>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={customBaseVal}
                            onChange={(e) => handleCustomBaseValChange(e.target.value)}
                            placeholder="50"
                            className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center font-bold text-xs focus:outline-none focus:border-[#C51E28]"
                          />
                        </div>
                      )}

                      {/* Quick batch actions */}
                      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 text-[10px]">
                        <span className="font-semibold text-slate-500">Quick Fill:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetAllScores(null)}
                            className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold hover:bg-amber-100 flex items-center gap-1 transition cursor-pointer"
                          >
                            <MinusCircle className="w-3 h-3" />
                            <span>(-) Absent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAllScores(80)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                          >
                            <span>Set 80%</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subject Rows */}
                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const currentVal = subjectScores[sub];
                        const rawInput = rawScoreInputs[sub] ?? '';
                        const isUnassessed = currentVal === null || currentVal === undefined;
                        const g = calculateGrade(currentVal);
                        return (
                          <div
                            key={sub}
                            className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 ${
                              isUnassessed
                                ? 'bg-amber-50/40 border-amber-200/70'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-slate-800 text-[11px] truncate block">
                                {sub}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {g.remarks}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleScoreChange(sub, isUnassessed ? 75 : null)}
                                className={`px-1.5 py-1 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                                  isUnassessed
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200'
                                }`}
                              >
                                {isUnassessed ? '(-) Absent' : 'Set (-)'}
                              </button>

                              <input
                                type="text"
                                placeholder={currentScoreBase === 100 ? '-' : `/${currentScoreBase}`}
                                disabled={isUnassessed}
                                value={isUnassessed ? '' : rawInput}
                                onChange={(e) => handleRawScoreInputChange(sub, e.target.value)}
                                className={`w-14 px-1.5 py-1 text-center font-bold rounded-lg border text-xs focus:border-[#C51E28] focus:outline-none ${
                                  isUnassessed
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />

                              <span
                                className={`w-10 text-center font-black text-[10px] px-1 py-0.5 rounded border flex flex-col items-center justify-center leading-none ${
                                  isUnassessed
                                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                                    : 'bg-red-50 text-[#C51E28] border-red-100'
                                }`}
                              >
                                <span>{g.grade}</span>
                                {!isUnassessed && (
                                  <span className="text-[8px] font-bold opacity-80 mt-0.5">{currentVal}%</span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Class Teacher Remarks */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Class Teacher Comment
                    </label>
                    <textarea
                      rows={2}
                      value={classTeacherComment}
                      onChange={(e) => setClassTeacherComment(e.target.value)}
                      placeholder="Enter remarks on student conduct, competency, and academic consistency..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                    />
                  </div>

                  {/* Head of Institution Remarks */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Head of Institution Comment
                      </label>
                      <span className="text-[10px] font-bold text-[#C51E28]">{headOfSchoolName}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={headTeacherComment}
                      onChange={(e) => setHeadTeacherComment(e.target.value)}
                      placeholder="Enter official institutional remarks, guidance, and commendation..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons (Sticky at bottom) */}
              <div className="flex gap-2 pt-3 sticky bottom-0 bg-white pb-1 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingStudentId ? 'Save Learner & Parents' : 'Register Learner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Score Converter Modal */}
      <ScoreConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        initialOutOf={currentScoreBase}
      />

      {/* 1-Click Batch Report Card Generator Modal */}
      <BatchReportGeneratorModal
        isOpen={showBatchReportModal}
        onClose={() => setShowBatchReportModal(false)}
        students={students}
      />

      {/* Unique Student QR Code Modal for Quick Attendance & Assessment Verification */}
      {selectedStudentForQr && (
        <div
          id="student-qr-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in select-none"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#C51E28] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Learner Identity QR Code
                  </h3>
                  <span className="text-[10px] text-red-100 font-medium">
                    Attendance Check-in &amp; Assessment Verification
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForQr(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center text-center">
              {/* Student Details */}
              <div className="mb-3">
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                  {selectedStudentForQr.name}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#C51E28] font-bold text-[10px] border border-red-100">
                    {selectedStudentForQr.classArm}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-600 font-bold text-[11px]">
                    Adm: {selectedStudentForQr.admNo}
                  </span>
                </div>
                {selectedStudentForQr.upi && (
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                    UPI: {selectedStudentForQr.upi}
                  </span>
                )}
              </div>

              {/* QR Code Graphic Container */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center relative my-1">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'JJSAK_STUDENT_IDENTITY',
                    id: selectedStudentForQr.id,
                    admNo: selectedStudentForQr.admNo,
                    upi: selectedStudentForQr.upi || selectedStudentForQr.admNo,
                    name: selectedStudentForQr.name,
                    classArm: selectedStudentForQr.classArm,
                    grade: selectedStudentForQr.grade,
                    schoolId: selectedStudentForQr.schoolId || 'SCH-001',
                    issued: 'JJSAK-CBE-NATIONAL-PORTAL',
                  })}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <span className="text-[10px] font-mono text-slate-400 mt-2">
                Scan with any standard 2D reader or JJSAK Attendance Scanner
              </span>

              {/* Attendance Status */}
              {attendanceLoggedForStudent && (
                <div className="w-full mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{attendanceLoggedForStudent}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setAttendanceLoggedForStudent(`Checked in at ${timeStr} for Assessment`);
                    onLogAudit?.(
                      'ATTENDANCE_CHECKIN',
                      `Verified student QR code for [${selectedStudentForQr.name}] (${selectedStudentForQr.admNo}) at ${timeStr}.`
                    );
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Check In Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const payload = JSON.stringify(
                      {
                        type: 'JJSAK_STUDENT_IDENTITY',
                        id: selectedStudentForQr.id,
                        admNo: selectedStudentForQr.admNo,
                        upi: selectedStudentForQr.upi || selectedStudentForQr.admNo,
                        name: selectedStudentForQr.name,
                        classArm: selectedStudentForQr.classArm,
                        grade: selectedStudentForQr.grade,
                        schoolId: selectedStudentForQr.schoolId || 'SCH-001',
                      },
                      null,
                      2
                    );
                    navigator.clipboard.writeText(payload);
                    setQrCopied(true);
                    setTimeout(() => setQrCopied(false), 2000);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {qrCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
