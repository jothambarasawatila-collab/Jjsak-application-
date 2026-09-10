import React, { useState } from 'react';
import {
  UserPlus,
  ClipboardList,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Save,
  HeartHandshake,
} from 'lucide-react';
import {
  Student,
  Teacher,
  SchoolInfo,
  User,
  BehaviorRecord,
  SpecialNeedsCategory,
} from '../../types';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_GRADES,
  AVAILABLE_SUBJECTS,
} from '../../data/mockData';
import {
  isDuplicateAdmissionNumber,
  generateTemplateData,
  triggerFileDownload,
} from '../../data/academicData';

interface CoreDataEntryTabProps {
  students: Student[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  currentUser?: User;
  onAddStudent: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onBatchUpdateStudents: (updater: (s: Student) => Student) => void;
  onAddBehaviorRecord: (record: BehaviorRecord) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const CoreDataEntryTab: React.FC<CoreDataEntryTabProps> = ({
  students,
  teachers,
  schoolInfo,
  currentUser,
  onAddStudent,
  onBatchUpdateStudents,
  onAddBehaviorRecord,
  onLogAudit,
}) => {
  const [entryMode, setEntryMode] = useState<'individual' | 'register' | 'spreadsheet' | 'bulk' | 'behavior'>('individual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- SUBSECTION A: INDIVIDUAL LEARNER ENTRY STATE ---
  const [admNo, setAdmNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('2012-05-14');
  const [selectedGrade, setSelectedGrade] = useState('G8');
  const [selectedStream, setSelectedStream] = useState('S');
  const [upi, setUpi] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Parent / Guardian info
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');
  const [parentAddress, setParentAddress] = useState('');

  // Special Needs Information (SEN)
  const [hasSen, setHasSen] = useState(false);
  const [senCategory, setSenCategory] = useState<SpecialNeedsCategory>('None');
  const [accommodations, setAccommodations] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // School Transfer Information
  const [isTransferred, setIsTransferred] = useState(false);
  const [prevSchool, setPrevSchool] = useState('');
  const [prevAdmNo, setPrevAdmNo] = useState('');
  const [transferRef, setTransferRef] = useState('');

  // Duplicate Check
  const duplicateFound = isDuplicateAdmissionNumber(admNo, students);

  const handleRegisterSingleLearner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admNo.trim() || !firstName.trim() || !lastName.trim()) {
      alert('Please fill out all mandatory fields (Admission Number, First Name, Last Name).');
      return;
    }

    if (duplicateFound) {
      alert(`Admission Number ${admNo} is already registered in the system. Duplicate admission numbers are strictly blocked by JJSAK integrity rules.`);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const initials = (firstName[0] || 'L') + (lastName[0] || 'N');
    const classArm = `${selectedGrade} ${selectedStream}`;

    // Initialize with default subject scores
    const initialSubjects = AVAILABLE_SUBJECTS.map((sub) => ({
      subject: sub,
      score: 75,
      grade: 'ME',
      remarks: 'Meeting Expectations',
    }));

    const newLearner: Student = {
      id: `std-${Date.now()}`,
      admNo: admNo.trim().toUpperCase(),
      upi: upi.trim() || undefined,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      grade: selectedGrade,
      stream: selectedStream,
      classArm,
      term: schoolInfo.term || 'Term 2, 2026',
      year: schoolInfo.year || 2026,
      avatarInitials: initials.toUpperCase(),
      photoUrl: photoUrl || undefined,
      avgScore: 75,
      overallGrade: 'ME',
      position: 'N/A',
      attendance: 95,
      subjects: initialSubjects,
      classTeacherComment: 'Welcome to JJSAK Junior School. Diligent learner with strong potential.',
      classTeacherName: teachers[0]?.name || 'Mr. O. Kinyanjui',
      headOfSchoolName: schoolInfo.headOfInstitution || 'Mrs. J. Barasa',
      nextTermDate: schoolInfo.nextTermOpenDate || '5th August 2026',
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      parentEmail: parentEmail.trim() || undefined,
      homeAddress: parentAddress.trim() || undefined,
      specialNeeds: {
        hasSpecialNeeds: hasSen,
        category: hasSen ? senCategory : 'None',
        accommodationsRequired: accommodations ? accommodations.split(',').map((s) => s.trim()) : [],
        medicalOrDietaryNotes: medicalNotes || undefined,
      },
      transferInfo: {
        isTransferred,
        previousSchoolName: isTransferred ? prevSchool : undefined,
        previousAdmNo: isTransferred ? prevAdmNo : undefined,
        transferLetterRef: isTransferred ? transferRef : undefined,
        admissionDate: new Date().toISOString().split('T')[0],
      },
    };

    onAddStudent(newLearner);
    if (onLogAudit) {
      onLogAudit(
        'RECORD_CREATE',
        `Registered new learner: ${fullName} (Adm: ${newLearner.admNo}) into ${classArm}. SEN: ${hasSen ? senCategory : 'None'}. Transfer: ${isTransferred ? 'Yes' : 'No'}.`
      );
    }

    showToast(`✓ Registered learner: ${fullName} (${newLearner.admNo})`);

    // Reset Form
    setAdmNo('');
    setFirstName('');
    setLastName('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setAccommodations('');
    setMedicalNotes('');
    setPrevSchool('');
  };

  // --- SUBSECTION B: REGISTER-BASED ATTENDANCE MATRIX STATE ---
  const [registerClass, setRegisterClass] = useState('G8 S');
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'P' | 'A' | 'L' | 'E'>>({});

  const classLearners = students.filter((s) => s.classArm === registerClass);

  const handleMarkAll = (status: 'P' | 'A' | 'L' | 'E') => {
    const updated: Record<string, 'P' | 'A' | 'L' | 'E'> = {};
    classLearners.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendanceRegister = () => {
    if (classLearners.length === 0) return;
    onBatchUpdateStudents((s) => {
      if (s.classArm !== registerClass) return s;
      const status = attendanceMap[s.id] || 'P';
      let newAtt = s.attendance || 90;
      if (status === 'P') newAtt = Math.min(100, newAtt + 1);
      if (status === 'A') newAtt = Math.max(40, newAtt - 2);
      if (status === 'L') newAtt = Math.max(50, newAtt - 1);
      return { ...s, attendance: newAtt };
    });

    if (onLogAudit) {
      onLogAudit(
        'RECORD_EDIT',
        `Submitted daily physical attendance register for ${registerClass} on ${registerDate}. Total marked: ${classLearners.length}.`
      );
    }

    showToast(`✓ Attendance Register saved for ${registerClass} (${classLearners.length} learners)`);
  };

  // --- SUBSECTION C: SPREADSHEET SCORE MATRIX STATE ---
  const [matrixClass, setMatrixClass] = useState('G8 S');
  const [matrixSubject, setMatrixSubject] = useState('Social Studies');
  const [matrixScores, setMatrixScores] = useState<Record<string, string>>({});

  const matrixLearners = students.filter((s) => s.classArm === matrixClass);

  const handleSaveSpreadsheetScores = () => {
    if (matrixLearners.length === 0) return;

    let updatedCount = 0;
    onBatchUpdateStudents((student) => {
      if (student.classArm !== matrixClass) return student;
      const raw = matrixScores[student.id];
      if (raw === undefined || raw === '') return student;

      const numeric = parseFloat(raw);
      if (isNaN(numeric) || numeric < 0 || numeric > 100) return student;

      updatedCount++;
      const updatedSubjects = (student.subjects || []).map((sub) => {
        if (sub.subject === matrixSubject) {
          return {
            ...sub,
            score: Math.round(numeric),
            grade: numeric >= 80 ? 'EE' : numeric >= 65 ? 'ME' : numeric >= 50 ? 'AE' : 'BE',
          };
        }
        return sub;
      });

      return {
        ...student,
        subjects: updatedSubjects,
      };
    });

    if (onLogAudit) {
      onLogAudit(
        'MARKS_SUBMIT',
        `Class register spreadsheet scores updated for ${matrixClass} - ${matrixSubject} (${updatedCount} scores updated).`
      );
    }

    showToast(`✓ Updated marks for ${updatedCount} learners in ${matrixClass} - ${matrixSubject}`);
  };

  // --- SUBSECTION D: BEHAVIOR & DISCIPLINE RECORDING STATE ---
  const [behaviorStudentId, setBehaviorStudentId] = useState(students[0]?.id || '');
  const [behaviorCategory, setBehaviorCategory] = useState<BehaviorRecord['category']>('Commendation');
  const [behaviorTitle, setBehaviorTitle] = useState('');
  const [behaviorDesc, setBehaviorDesc] = useState('');
  const [behaviorAction, setBehaviorAction] = useState('');
  const [behaviorSeverity, setBehaviorSeverity] = useState<BehaviorRecord['severity']>('Positive');

  const selectedBehaviorStudent = students.find((s) => s.id === behaviorStudentId) || students[0];

  const handleSaveBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorTitle.trim() || !behaviorDesc.trim()) {
      alert('Please fill out incident title and description.');
      return;
    }

    const newRecord: BehaviorRecord = {
      id: `beh-${Date.now()}`,
      studentId: selectedBehaviorStudent.id,
      studentName: selectedBehaviorStudent.name,
      admNo: selectedBehaviorStudent.admNo,
      className: selectedBehaviorStudent.classArm,
      date: new Date().toISOString().split('T')[0],
      category: behaviorCategory,
      title: behaviorTitle.trim(),
      description: behaviorDesc.trim(),
      actionTaken: behaviorAction.trim() || 'Logged in learner developmental portfolio',
      recordedBy: currentUser?.fullName || 'Class Teacher',
      severity: behaviorSeverity,
    };

    onAddBehaviorRecord(newRecord);
    if (onLogAudit) {
      onLogAudit(
        'BEHAVIOR_RECORD_LOGGED',
        `Logged ${behaviorCategory} record for ${selectedBehaviorStudent.name} (${selectedBehaviorStudent.admNo}): "${behaviorTitle.trim()}".`
      );
    }

    showToast(`✓ Behavior incident logged for ${selectedBehaviorStudent.name}`);
    setBehaviorTitle('');
    setBehaviorDesc('');
    setBehaviorAction('');
  };

  // --- SUBSECTION E: BULK CSV/EXCEL UPLOAD STATE ---
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkValidationReport, setBulkValidationReport] = useState<{
    validCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  const handleParseAndUploadCsv = () => {
    if (!bulkCsvText.trim()) {
      alert('Please paste CSV content or upload a valid CSV file.');
      return;
    }

    const lines = bulkCsvText.trim().split('\n');
    if (lines.length <= 1) {
      alert('CSV file must have a header row and at least one data record.');
      return;
    }

    const errors: string[] = [];
    let valid = 0;
    const newStudentsToAdd: Student[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim());

      const [cAdmNo, cFirst, cLast, cGender, cDob, cGrade, cStream, cParentName, cParentPhone] = parts;

      if (!cAdmNo || !cFirst || !cLast) {
        errors.push(`Row ${i + 1}: Missing mandatory fields (AdmNo, First, Last).`);
        continue;
      }

      if (isDuplicateAdmissionNumber(cAdmNo, students) || newStudentsToAdd.some((s) => s.admNo === cAdmNo)) {
        errors.push(`Row ${i + 1}: Duplicate admission number "${cAdmNo}" blocked.`);
        continue;
      }

      const fullName = `${cFirst} ${cLast}`;
      const initials = (cFirst[0] || 'L') + (cLast[0] || 'N');
      const classArm = `${cGrade || 'G8'} ${cStream || 'S'}`;

      const newS: Student = {
        id: `std-bulk-${Date.now()}-${i}`,
        admNo: cAdmNo.toUpperCase(),
        name: fullName,
        firstName: cFirst,
        lastName: cLast,
        gender: cGender || 'Male',
        dateOfBirth: cDob || '2012-01-01',
        grade: cGrade || 'G8',
        stream: cStream || 'S',
        classArm,
        term: schoolInfo.term,
        year: schoolInfo.year,
        avatarInitials: initials.toUpperCase(),
        avgScore: 75,
        overallGrade: 'ME',
        position: 'N/A',
        attendance: 95,
        subjects: AVAILABLE_SUBJECTS.map((sub) => ({
          subject: sub,
          score: 75,
          grade: 'ME',
          remarks: 'Meeting Expectations',
        })),
        classTeacherComment: 'Bulk onboarded learner. Welcome to JJSAK.',
        classTeacherName: 'Mr. O. Kinyanjui',
        headOfSchoolName: schoolInfo.headOfInstitution,
        nextTermDate: schoolInfo.nextTermOpenDate,
        parentName: cParentName || 'Parent / Guardian',
        parentPhone: cParentPhone || '+254 700 000 000',
      };

      newStudentsToAdd.push(newS);
      valid++;
    }

    setBulkValidationReport({
      validCount: valid,
      errorCount: errors.length,
      errors,
    });

    if (valid > 0) {
      newStudentsToAdd.forEach((s) => onAddStudent(s));
      if (onLogAudit) {
        onLogAudit(
          'BULK_REPORT_GENERATE',
          `Bulk onboarded ${valid} learners from register upload. (${errors.length} errors/duplicates skipped).`
        );
      }
      showToast(`✓ Bulk Import Success: Onboarded ${valid} learners!`);
      setBulkCsvText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Channels */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setEntryMode('individual')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            entryMode === 'individual'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Single Learner Registration</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('register')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            entryMode === 'register'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Physical Class Register</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('spreadsheet')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            entryMode === 'spreadsheet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Spreadsheet Marks Entry</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('behavior')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            entryMode === 'behavior'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Conduct & Behavior Record</span>
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('bulk')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            entryMode === 'bulk'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Bulk Upload & Templates</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CHANNEL 1: INDIVIDUAL REGISTRATION */}
      {entryMode === 'individual' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Learner Biodata & Comprehensive Intake Form</span>
              </h3>
              <p className="text-xs text-slate-500">
                Captures statutory identifiers, parent contacts, SEN accommodations, and school transfer credentials.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Section 5.1 & 5.2
            </span>
          </div>

          <form onSubmit={handleRegisterSingleLearner} className="space-y-4">
            {/* Row 1: Core Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JJSAK-2026-088"
                  value={admNo}
                  onChange={(e) => setAdmNo(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-xl bg-white font-bold ${
                    duplicateFound ? 'border-red-500 text-red-700 focus:outline-red-500' : 'border-slate-300 focus:outline-emerald-600'
                  }`}
                />
                {duplicateFound && (
                  <span className="text-[10px] text-red-600 font-bold mt-1 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Duplicate admission number detected!</span>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emmanuel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wamalwa"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NEMIS / UPI Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-984210"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* Row 2: Demographics & Class Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-semibold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-bold"
                >
                  {AVAILABLE_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stream Allocation</label>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-bold"
                >
                  <option value="N">North Stream (N)</option>
                  <option value="S">South Stream (S)</option>
                  <option value="E">East Stream (E)</option>
                  <option value="W">West Stream (W)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Parent & Guardian Information */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Parent / Primary Guardian Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Parent Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. David Wamalwa"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Telephone</label>
                  <input
                    type="text"
                    placeholder="e.g. +254 722 123 456"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Home Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Section 6, Kitale"
                    value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relationship</label>
                  <select
                    value={parentRelation}
                    onChange={(e) => setParentRelation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passport Photo URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://... or leave blank for initials avatar"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Parent Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Special Needs & Transfer Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Special Needs Section */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Special Needs (SEN) Profile</span>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSen}
                      onChange={(e) => setHasSen(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span className="text-emerald-700">Requires SEN Accommodation</span>
                  </label>
                </div>

                {hasSen && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">SEN Category</label>
                      <select
                        value={senCategory}
                        onChange={(e) => setSenCategory(e.target.value as SpecialNeedsCategory)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold text-slate-700"
                      >
                        <option value="Visual">Visual Impairment</option>
                        <option value="Hearing">Hearing Impairment</option>
                        <option value="Physical">Physical / Mobility</option>
                        <option value="Neurodevelopmental">Neurodevelopmental / Autism</option>
                        <option value="Speech & Language">Speech & Language</option>
                        <option value="Gifted & Talented">Gifted & Talented</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam & Classroom Accommodations</label>
                      <input
                        type="text"
                        placeholder="e.g. Enlarged Print, Extra 30 Mins, Front Row Seating"
                        value={accommodations}
                        onChange={(e) => setAccommodations(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* School Transfer Section */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Inter-School Transfer Data</span>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransferred}
                      onChange={(e) => setIsTransferred(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span className="text-blue-700">Transferred From Another School</span>
                  </label>
                </div>

                {isTransferred && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Previous Institution Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kitale Township Junior Academy"
                        value={prevSchool}
                        onChange={(e) => setPrevSchool(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Previous Adm No</label>
                        <input
                          type="text"
                          placeholder="e.g. KTJA-412"
                          value={prevAdmNo}
                          onChange={(e) => setPrevAdmNo(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transfer Letter Ref</label>
                        <input
                          type="text"
                          placeholder="e.g. MOE/TR/2026/89"
                          value={transferRef}
                          onChange={(e) => setTransferRef(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Enforcing JJSAK Academic Integrity Rule 5.10 (Duplicate checks & Audit Trace)
              </span>
              <button
                type="submit"
                disabled={duplicateFound}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5 ${
                  duplicateFound
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Register Learner Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHANNEL 2: PHYSICAL CLASS REGISTER */}
      {entryMode === 'register' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>Physical Class Register Matrix</span>
              </h3>
              <p className="text-xs text-slate-500">
                Replica of physical attendance roll. Mark daily attendance with rapid 1-click status toggles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={registerClass}
                onChange={(e) => setRegisterClass(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={registerDate}
                onChange={(e) => setRegisterDate(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">
              Class Strength: <strong>{classLearners.length} Learners</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('P')}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 cursor-pointer"
              >
                Mark All Present (P)
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('A')}
                className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-[11px] font-bold hover:bg-red-200 cursor-pointer"
              >
                Mark All Absent (A)
              </button>
            </div>
          </div>

          {/* Register Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {classLearners.map((learner, idx) => {
                const currentStatus = attendanceMap[learner.id] || 'P';
                return (
                  <div key={learner.id} className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px] w-6">{idx + 1}.</span>
                      <div>
                        <div className="font-bold text-slate-900">{learner.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{learner.admNo}</div>
                      </div>
                    </div>

                    {/* Status Toggles: P, A, L, E */}
                    <div className="flex items-center gap-1">
                      {(['P', 'A', 'L', 'E'] as const).map((st) => {
                        const labels: Record<string, string> = { P: 'Present', A: 'Absent', L: 'Late', E: 'Excused' };
                        const isSelected = currentStatus === st;
                        const bgMap: Record<string, string> = {
                          P: 'bg-emerald-600 text-white',
                          A: 'bg-red-600 text-white',
                          L: 'bg-amber-500 text-white',
                          E: 'bg-blue-600 text-white',
                        };
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [learner.id]: st }))}
                            className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition flex items-center justify-center ${
                              isSelected ? bgMap[st] : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title={labels[st]}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveAttendanceRegister}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Commit Attendance Register</span>
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 3: SPREADSHEET MARKS ENTRY */}
      {entryMode === 'spreadsheet' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Spreadsheet / Mark List Quick Ingestion</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct marks input matching standard paper score sheets with instant range validation (0 - 100).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={matrixClass}
                onChange={(e) => setMatrixClass(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold"
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <select
                value={matrixSubject}
                onChange={(e) => setMatrixSubject(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {matrixLearners.map((learner) => {
                const currentScore =
                  matrixScores[learner.id] ??
                  (learner.subjects.find((s) => s.subject === matrixSubject)?.score?.toString() || '');
                const numericScore = parseFloat(currentScore);
                const isOutOfRange = !isNaN(numericScore) && (numericScore < 0 || numericScore > 100);

                return (
                  <div key={learner.id} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs transition">
                    <div>
                      <div className="font-bold text-slate-900">{learner.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{learner.admNo}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentScore}
                        onChange={(e) => setMatrixScores((prev) => ({ ...prev, [learner.id]: e.target.value }))}
                        className={`w-20 px-2 py-1 text-center font-bold text-xs border rounded-lg ${
                          isOutOfRange ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      />
                      <span className="text-[11px] text-slate-400 font-bold">/ 100</span>
                      {isOutOfRange && (
                        <span className="text-[10px] font-bold text-red-600">Invalid</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveSpreadsheetScores}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Commit Spreadsheet Marks</span>
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 4: BEHAVIOR & CONDUCT LOG */}
      {entryMode === 'behavior' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Behavior & Pastoral Conduct Record</span>
            </h3>
            <p className="text-xs text-slate-500">
              Record commendations, positive character merits, guidance counseling referrals, or disciplinary actions.
            </p>
          </div>

          <form onSubmit={handleSaveBehavior} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Learner</label>
                <select
                  value={behaviorStudentId}
                  onChange={(e) => setBehaviorStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.classArm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Incident Category</label>
                <select
                  value={behaviorCategory}
                  onChange={(e) => setBehaviorCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="Commendation">Commendation / Character Merit</option>
                  <option value="Guidance & Counseling">Guidance & Counseling</option>
                  <option value="Disciplinary">Disciplinary Issue</option>
                  <option value="Attendance Concern">Attendance Concern</option>
                  <option value="Co-curricular Excellence">Co-curricular Excellence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity / Impact</label>
                <select
                  value={behaviorSeverity}
                  onChange={(e) => setBehaviorSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="Positive">Positive Merit</option>
                  <option value="Low">Low (Pastoral Note)</option>
                  <option value="Medium">Medium (Counseling Required)</option>
                  <option value="High">High (Parent Conference)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Fair Regional Champion or Repeated Prep Truancy"
                value={behaviorTitle}
                onChange={(e) => setBehaviorTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={2}
                required
                placeholder="Specific observational facts recorded by teacher..."
                value={behaviorDesc}
                onChange={(e) => setBehaviorDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Action Taken & Follow-up Plan</label>
              <input
                type="text"
                placeholder="e.g. Certificate awarded at assembly / SMS alert sent to guardian"
                value={behaviorAction}
                onChange={(e) => setBehaviorAction(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-emerald-600 font-medium"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Behavior Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHANNEL 5: BULK UPLOAD & TEMPLATES */}
      {entryMode === 'bulk' && (
        <div className="space-y-5">
          {/* Download Templates Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Official JJSAK Ingestion Templates</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Download pre-formatted Excel/CSV templates with sample rows for instant offline population.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const data = generateTemplateData('learners');
                  triggerFileDownload(data, 'JJSAK_Learners_Template.csv');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Learners CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const data = generateTemplateData('marks');
                  triggerFileDownload(data, 'JJSAK_Marks_Template.csv');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Marks CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const data = generateTemplateData('attendance');
                  triggerFileDownload(data, 'JJSAK_Attendance_Template.csv');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Attendance CSV</span>
              </button>
            </div>
          </div>

          {/* Bulk Ingestion Paste Area */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Paste CSV Records for Instant Validation</span>
            </h4>
            <p className="text-xs text-slate-500">
              Paste comma-separated rows (with header row). The JJSAK validation engine detects duplicates, missing mandatory fields, and invalid class codes automatically.
            </p>

            <textarea
              rows={5}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              placeholder={`AdmissionNumber,FirstName,LastName,Gender,DateOfBirth,Grade,Stream,ParentName,ParentPhone\nJJSAK-2026-090,Samson,Kiprotich,Male,2012-04-12,G8,S,Peter Kiprotich,+254 711 223 344\nJJSAK-2026-091,Brenda,Chepngetich,Female,2012-08-19,G8,S,Mary Chepngetich,+254 722 334 455`}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:outline-emerald-600"
            />

            {bulkValidationReport && (
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5">
                <div className="flex items-center gap-3 font-bold">
                  <span className="text-emerald-700">Valid Records: {bulkValidationReport.validCount}</span>
                  <span className="text-red-700">Blocked Errors: {bulkValidationReport.errorCount}</span>
                </div>
                {bulkValidationReport.errors.length > 0 && (
                  <ul className="text-[11px] text-red-600 list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                    {bulkValidationReport.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setBulkCsvText(generateTemplateData('learners'))}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Load Sample Data
              </button>
              <button
                type="button"
                onClick={handleParseAndUploadCsv}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Validate & Ingest Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
