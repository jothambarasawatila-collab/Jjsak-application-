import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Phone,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Send,
  KeyRound,
  ExternalLink,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import {
  Teacher,
  TeacherClassAllocation,
  StaffDesignation,
  StaffDepartment,
  EmploymentStatus,
  StaffSupportingDocument,
  AcademicQualification,
  ProfessionalQualification,
  ProfessionalCertification,
  ProfessionalDevelopmentRecord,
  UserRole,
} from '../../types';
import { staffAuthOtpSecurityService } from '../../services/staffAuthOtpSecurityService';
import { carrierInboxService } from '../../services/carrierInboxService';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTeacher: (
    teacher: Teacher,
    options?: { provisionAccount: boolean; userRole: UserRole; sendInvitation: boolean; firstTimePassword?: string }
  ) => void;
  existingTeachers: Teacher[];
  editingTeacher: Teacher | null;
  availableClasses: string[];
  availableSubjects: string[];
  currentUserRole?: UserRole;
  currentSchoolId?: string;
  onOpenCarrierInbox?: () => void;
  onOpenTeacherValidation?: (otp?: string, username?: string, schoolId?: string, password?: string) => void;
}

export const STAFF_DESIGNATIONS: StaffDesignation[] = [
  'Head of Institution',
  'Deputy Head',
  'Director of Academics',
  'Registrar',
  'Teacher',
  'ICT Administrator',
  'Bursar',
  'System Administrator',
  'Senior Teacher',
  'Class Teacher',
  'Subject Teacher',
  'Head of Department',
];

export const STAFF_DEPARTMENTS: StaffDepartment[] = [
  'Languages',
  'Sciences',
  'Mathematics',
  'Humanities',
  'Technical & Applied',
  'Creative Arts & Sports',
  'Administration',
  'Guidance & Counseling',
  'Finance',
  'ICT & Computing',
];

export const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'Permanent & Pensionable',
  'Contract',
  'BOM',
  'Intern',
  'Probation',
];

const AVATAR_COLORS = [
  '#C51E28',
  '#DC2626',
  '#B91C1C',
  '#991B1B',
  '#E11D48',
  '#C026D3',
  '#7C3AED',
  '#2563EB',
  '#0D9488',
  '#D97706',
];

export const StaffRegistrationModal: React.FC<StaffRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSaveTeacher,
  existingTeachers,
  editingTeacher,
  availableClasses,
  availableSubjects,
  currentUserRole,
  currentSchoolId,
  onOpenCarrierInbox,
  onOpenTeacherValidation,
}) => {
  const classesList: string[] =
    availableClasses && availableClasses.length > 0
      ? availableClasses
      : [
          'Grade 7 North',
          'Grade 7 South',
          'Grade 8 North',
          'Grade 8 South',
          'Grade 9 North',
          'Grade 9 South',
          'G7 N',
          'G7 S',
          'G8 N',
          'G8 S',
          'G9 N',
          'G9 S',
        ];

  const subjectsList: string[] =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects
      : [
          'Mathematics',
          'English Language',
          'Kiswahili Lugha',
          'Integrated Science',
          'Social Studies',
          'CRE',
          'Pretechnical Studies',
          'Agriculture',
          'Creative Arts & Sports',
        ];

  const [activeStep, setActiveStep] = useState<number>(1);
  const [policyBlockedMessage, setPolicyBlockedMessage] = useState<string | null>(null);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [phoneNumber, setPhoneNumber] = useState('+254 7');
  const [email, setEmail] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+254 7');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');

  // Step 2: Employment Information
  const [staffNumber, setStaffNumber] = useState('');
  const [tscNumber, setTscNumber] = useState('');
  const [dateOfEmployment, setDateOfEmployment] = useState(new Date().toISOString().split('T')[0]);
  const [designation, setDesignation] = useState<StaffDesignation>('Teacher');
  const [department, setDepartment] = useState<StaffDepartment>('Technical & Applied');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Permanent & Pensionable');
  const [reportingOfficer, setReportingOfficer] = useState('Mrs. J. Barasa (Head of Institution)');
  const [avatarColor, setAvatarColor] = useState('#C51E28');
  const [isClassTeacher, setIsClassTeacher] = useState<boolean>(false);
  const [assignedClass, setAssignedClass] = useState<string>('Grade 7 North');

  // Step 3: Academic & Professional Information
  const [academicQualifications, setAcademicQualifications] = useState<AcademicQualification[]>([
    {
      id: 'aq-default-1',
      degree: 'Bachelor of Education (Arts)',
      institution: 'Kenyatta University',
      year: 2015,
      gradeOrClass: 'Second Class Honours (Upper)',
      verified: true,
    },
  ]);
  const [professionalQualifications, setProfessionalQualifications] = useState<ProfessionalQualification[]>([
    {
      id: 'pq-default-1',
      title: 'TSC Registered Professional Teacher',
      body: 'Teachers Service Commission Kenya',
      regNumber: '',
      year: 2015,
      status: 'Verified',
    },
  ]);
  const [certifications, setCertifications] = useState<ProfessionalCertification[]>([]);
  const [tpdRecords, setTpdRecords] = useState<ProfessionalDevelopmentRecord[]>([
    {
      id: 'tpd-default-1',
      moduleName: 'TPD Module 1: Foundational CBE Assessment & Rubrics',
      provider: 'KEMI / TSC',
      completionDate: '2023-11-20',
      cpdPoints: 60,
    },
  ]);

  // Step 4: Class & Subject Allocations
  const [classAllocations, setClassAllocations] = useState<Record<string, string[]>>({
    'G8 S': ['Pretechnical Studies', 'Social Studies'],
    'G8 N': ['Pretechnical Studies'],
  });
  const [batchSubject, setBatchSubject] = useState<string>('Pretechnical Studies');
  const [batchClasses, setBatchClasses] = useState<string[]>(['G8 S', 'G8 N']);

  // Step 5: Supporting Documents
  const [documents, setDocuments] = useState<StaffSupportingDocument[]>([
    {
      id: 'doc-init-1',
      type: 'Passport Photo',
      title: 'Passport Size Photograph (Recent Color)',
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifiedBy: 'Administrator',
    },
    {
      id: 'doc-init-2',
      type: 'National ID Copy',
      title: 'National Identity Card (Scanned Front & Back)',
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifiedBy: 'Administrator',
    },
    {
      id: 'doc-init-3',
      type: 'Academic Certificate',
      title: 'Degree / Diploma Certificate & Transcripts',
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifiedBy: 'Administrator',
    },
    {
      id: 'doc-init-4',
      type: 'Appointment Letter',
      title: 'Institution Offer & Appointment Letter',
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifiedBy: 'BOM Secretary',
    },
  ]);

  // Step 6: Role & IAM Account Provisioning
  const [assignedUserRole, setAssignedUserRole] = useState<UserRole>('TEACHER');
  const [provisionAccountNow, setProvisionAccountNow] = useState(true);
  const [sendActivationInvite, setSendActivationInvite] = useState(true);
  const [enableMfa, setEnableMfa] = useState(true);
  const [mfaMethod, setMfaMethod] = useState<'SMS_OTP' | 'EMAIL_OTP'>('SMS_OTP');
  const [firstTimePassword, setFirstTimePassword] = useState<string>(() => carrierInboxService.generateFirstTimePassword());
  const [showFirstTimePassword, setShowFirstTimePassword] = useState(false);
  const [sendViaSms, setSendViaSms] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [isCopiedPassword, setIsCopiedPassword] = useState(false);

  // Registration Credentials & Dispatched Access Link Summary
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    teacher: Teacher;
    username: string;
    firstTimePassword: string;
    otpCode: string;
    activationLink: string;
    expiresAt: number;
    schoolId: string;
    schoolName: string;
    channels: { email?: boolean; sms?: boolean; whatsapp?: boolean };
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [liveDispatching, setLiveDispatching] = useState(false);
  const [liveDispatchStatus, setLiveDispatchStatus] = useState<any | null>(null);

  const handleTriggerLiveDispatchNow = async () => {
    if (!registrationSuccessData) return;
    setLiveDispatching(true);
    try {
      const res = await carrierInboxService.sendLiveCredentialsNow({
        teacherId: registrationSuccessData.teacher.id,
        teacherName: registrationSuccessData.teacher.name,
        username: registrationSuccessData.username,
        email: registrationSuccessData.teacher.email,
        phoneNumber: registrationSuccessData.teacher.phoneNumber,
        schoolId: registrationSuccessData.schoolId,
        schoolName: registrationSuccessData.schoolName,
        firstTimePassword: registrationSuccessData.firstTimePassword,
        otpCode: registrationSuccessData.otpCode,
        activationLink: registrationSuccessData.activationLink,
        channels: ['EMAIL', 'SMS', 'WHATSAPP'],
      });
      setLiveDispatchStatus(res);
    } catch {
      // Tolerate error
    } finally {
      setLiveDispatching(false);
    }
  };

  // Reset success state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setRegistrationSuccessData(null);
      setCopiedLink(false);
      setCopiedAll(false);
      setCopiedOtp(false);
      setLiveDispatchStatus(null);
      setLiveDispatching(false);
    }
  }, [isOpen]);

  // Duplicate Check Errors
  const [duplicateErrors, setDuplicateErrors] = useState<{
    nationalId?: string;
    tscNumber?: string;
    staffNumber?: string;
  }>({});

  // Populate data when editing
  useEffect(() => {
    if (editingTeacher) {
      setFullName(editingTeacher.name);
      setEmail(editingTeacher.email);
      setNationalId(editingTeacher.nationalId || '');
      setGender(editingTeacher.gender || 'Male');
      setDateOfBirth(editingTeacher.dateOfBirth || '1990-01-01');
      setPhoneNumber(editingTeacher.phoneNumber || '+254 7');
      setPhysicalAddress(editingTeacher.physicalAddress || '');
      setEmergencyName(editingTeacher.emergencyContact?.name || '');
      setEmergencyPhone(editingTeacher.emergencyContact?.phone || '+254 7');
      setEmergencyRelation(editingTeacher.emergencyContact?.relationship || 'Spouse');

      setStaffNumber(editingTeacher.staffNumber || editingTeacher.employeeNumber || '');
      setTscNumber(editingTeacher.tscNumber || '');
      setDateOfEmployment(editingTeacher.dateOfEmployment || new Date().toISOString().split('T')[0]);
      setDesignation(editingTeacher.designation || 'Teacher');
      setDepartment(editingTeacher.department || 'Technical & Applied');
      setEmploymentStatus(editingTeacher.employmentStatus || 'Permanent & Pensionable');
      setReportingOfficer(editingTeacher.reportingOfficer || 'Mrs. J. Barasa (Head of Institution)');
      setAvatarColor(editingTeacher.avatarHex || '#C51E28');
      setIsClassTeacher(editingTeacher.isClassTeacher ?? (editingTeacher.designation === 'Class Teacher' || Boolean(editingTeacher.assignedClass)));
      setAssignedClass(editingTeacher.assignedClass || editingTeacher.classes?.[0] || 'Grade 7 North');

      if (editingTeacher.academicQualifications && editingTeacher.academicQualifications.length > 0) {
        setAcademicQualifications(editingTeacher.academicQualifications);
      }
      if (editingTeacher.professionalQualifications && editingTeacher.professionalQualifications.length > 0) {
        setProfessionalQualifications(editingTeacher.professionalQualifications);
      }
      if (editingTeacher.professionalCertifications && editingTeacher.professionalCertifications.length > 0) {
        setCertifications(editingTeacher.professionalCertifications);
      }
      if (editingTeacher.professionalDevelopmentRecords && editingTeacher.professionalDevelopmentRecords.length > 0) {
        setTpdRecords(editingTeacher.professionalDevelopmentRecords);
      }

      // Allocations
      const allocMap: Record<string, string[]> = {};
      if (editingTeacher.allocations && editingTeacher.allocations.length > 0) {
        editingTeacher.allocations.forEach((a) => {
          allocMap[a.className] = [...a.subjects];
        });
      } else if (editingTeacher.classes) {
        editingTeacher.classes.forEach((cls) => {
          allocMap[cls] = [...(editingTeacher.subjects || ['Pretechnical Studies'])];
        });
      }
      setClassAllocations(allocMap);

      if (editingTeacher.supportingDocuments && editingTeacher.supportingDocuments.length > 0) {
        setDocuments(editingTeacher.supportingDocuments);
      }

      setEnableMfa(editingTeacher.mfaEnabled ?? true);
      setMfaMethod(editingTeacher.mfaMethod === 'EMAIL_OTP' ? 'EMAIL_OTP' : 'SMS_OTP');
    } else {
      // Auto-generate staff number for new staff
      const generatedStaffNo = `STF-2026-${String(existingTeachers.length + 1).padStart(3, '0')}`;
      setStaffNumber(generatedStaffNo);
    }
  }, [editingTeacher, existingTeachers.length]);

  // Real-time Duplicate Check
  useEffect(() => {
    const errors: { nationalId?: string; tscNumber?: string; staffNumber?: string } = {};
    const otherTeachers = editingTeacher
      ? existingTeachers.filter((t) => t.id !== editingTeacher.id)
      : existingTeachers;

    if (nationalId.trim()) {
      const match = otherTeachers.find(
        (t) => t.nationalId && t.nationalId.trim().toLowerCase() === nationalId.trim().toLowerCase()
      );
      if (match) {
        errors.nationalId = `National ID is already registered to ${match.name} (${match.tscNumber || match.id})`;
      }
    }

    if (tscNumber.trim()) {
      const match = otherTeachers.find(
        (t) => t.tscNumber && t.tscNumber.trim().toLowerCase() === tscNumber.trim().toLowerCase()
      );
      if (match) {
        errors.tscNumber = `TSC Number is already assigned to ${match.name} (${match.role})`;
      }
    }

    if (staffNumber.trim()) {
      const match = otherTeachers.find(
        (t) =>
          (t.staffNumber && t.staffNumber.trim().toLowerCase() === staffNumber.trim().toLowerCase()) ||
          (t.employeeNumber && t.employeeNumber.trim().toLowerCase() === staffNumber.trim().toLowerCase())
      );
      if (match) {
        errors.staffNumber = `Staff Number is already assigned to ${match.name}`;
      }
    }

    setDuplicateErrors(errors);
  }, [nationalId, tscNumber, staffNumber, existingTeachers, editingTeacher]);

  if (!isOpen) return null;

  // Calculation of weekly periods
  const totalAllocatedPeriods = Object.values(classAllocations).reduce(
    (acc, subjs) => acc + subjs.length * 4,
    0
  );

  const handleToggleClass = (cls: string) => {
    setClassAllocations((prev) => {
      const next = { ...prev };
      if (next[cls]) {
        delete next[cls];
      } else {
        next[cls] = ['Pretechnical Studies'];
      }
      return next;
    });
  };

  const handleToggleSubjectForClass = (cls: string, sub: string) => {
    setClassAllocations((prev) => {
      const current = prev[cls] || [];
      const updated = current.includes(sub) ? current.filter((s) => s !== sub) : [...current, sub];
      return { ...prev, [cls]: updated.length > 0 ? updated : ['Pretechnical Studies'] };
    });
  };

  const handleApplyBatchAllocation = () => {
    if (!batchSubject || batchClasses.length === 0) return;
    setClassAllocations((prev) => {
      const next = { ...prev };
      batchClasses.forEach((cls) => {
        const curr = next[cls] || [];
        if (!curr.includes(batchSubject)) {
          next[cls] = [...curr, batchSubject];
        }
      });
      return next;
    });
  };

  const handleAddAcademicQualification = () => {
    setAcademicQualifications((prev) => [
      ...prev,
      {
        id: `aq-${Date.now()}`,
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        gradeOrClass: '',
        verified: true,
      },
    ]);
  };

  const handleRemoveAcademicQualification = (id: string) => {
    setAcademicQualifications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddDocument = (type: StaffSupportingDocument['type']) => {
    const titlePrompt = window.prompt(`Enter description / title for ${type}:`, `${type} Document`);
    if (!titlePrompt) return;
    const newDoc: StaffSupportingDocument = {
      id: `doc-${Date.now()}`,
      type,
      title: titlePrompt,
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifiedBy: 'Administrator',
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyBlockedMessage(null);

    // Enforce Tenant Isolation & School Onboarding Governance (Section 2.1 & 2.2)
    const targetSchool = editingTeacher?.schoolId || currentSchoolId || '';
    const authCheck = staffAuthOtpSecurityService.canOnboardSchoolStaff(
      { role: currentUserRole, schoolId: currentSchoolId },
      targetSchool
    );

    if (!authCheck.permitted) {
      setPolicyBlockedMessage(authCheck.reason || 'Onboarding restricted by policy');
      staffAuthOtpSecurityService.logAudit({
        userId: 'ACTOR_RESTRICTED',
        tenantId: targetSchool,
        role: currentUserRole || 'UNKNOWN',
        deviceInfo: navigator.userAgent || 'Web Browser',
        sourceIp: '127.0.0.1',
        eventType: 'SECURITY_RESTRICTION',
        eventOutcome: 'DENIED',
        details: `Blocked staff onboarding attempt by role ${currentUserRole || 'UNKNOWN'}. Reason: ${authCheck.reason}`,
      });
      return;
    }

    if (!fullName.trim()) {
      setActiveStep(1);
      alert('Please provide the staff member full name.');
      return;
    }

    if (Object.keys(duplicateErrors).length > 0) {
      alert('Please resolve duplicate national ID, TSC number, or staff number errors before proceeding.');
      return;
    }

    // Prepare allocations
    const finalAllocations: TeacherClassAllocation[] = Object.keys(classAllocations).map((cls) => ({
      className: cls,
      subjects: classAllocations[cls].length > 0 ? classAllocations[cls] : ['Pretechnical Studies'],
    }));

    if (finalAllocations.length === 0) {
      finalAllocations.push({
        className: 'G8 S',
        subjects: ['Pretechnical Studies', 'Social Studies'],
      });
    }

    const allClasses = finalAllocations.map((a) => a.className);
    const allSubjects = Array.from(new Set(finalAllocations.flatMap((a) => a.subjects)));

    const generatedEmail =
      email.trim() ||
      `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@jjsak.ac.ke`;

    const finalClasses = [...allClasses];
    if (isClassTeacher && assignedClass && !finalClasses.includes(assignedClass)) {
      finalClasses.unshift(assignedClass);
    }

    const teacherData: Teacher = {
      ...(editingTeacher || {}),
      id: editingTeacher?.id || `tch-${Date.now()}`,
      schoolId: targetSchool || currentSchoolId || editingTeacher?.schoolId,
      name: fullName.trim(),
      email: generatedEmail,
      role: isClassTeacher
        ? (!designation.includes('Class Teacher') ? `Class Teacher (${department})` : `${designation} (${department})`)
        : `${designation === 'Class Teacher' ? 'Teacher' : designation} (${department})`,
      classes: finalClasses,
      subjects: allSubjects,
      allocations: finalAllocations,
      avatarHex: avatarColor,
      isClassTeacher,
      assignedClass: isClassTeacher ? assignedClass : undefined,
      phoneNumber: phoneNumber.trim(),
      employeeNumber: staffNumber.trim(),
      staffNumber: staffNumber.trim(),
      tscNumber: tscNumber.trim() || undefined,
      nationalId: nationalId.trim() || undefined,
      gender,
      dateOfBirth,
      physicalAddress: physicalAddress.trim(),
      emergencyContact: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRelation.trim(),
      },
      dateOfEmployment,
      designation: isClassTeacher
        ? (designation === 'Teacher' || !designation ? 'Class Teacher' : designation)
        : (designation === 'Class Teacher' ? 'Teacher' : designation),
      department,
      employmentStatus,
      reportingOfficer,
      academicQualifications,
      professionalQualifications,
      teachingSubjects: allSubjects,
      teachingLevels: Array.from(new Set(allClasses.map((c) => c.split(' ')[0]))),
      professionalCertifications: certifications,
      professionalDevelopmentRecords: tpdRecords,
      supportingDocuments: documents,
      accountStatus: editingTeacher?.accountStatus || (provisionAccountNow ? 'REGISTERED_FIRST_LOGIN_REQUIRED' : 'APPROVED'),
      mfaEnabled: enableMfa,
      mfaMethod,
      passwordCreated: editingTeacher ? (editingTeacher.passwordCreated || false) : false,
      active: editingTeacher ? (editingTeacher.active ?? false) : false,
      workload: {
        lessonsPerWeek: Math.round(totalAllocatedPeriods / 1.5),
        standardTarget: 27,
        status:
          Math.round(totalAllocatedPeriods / 1.5) > 28
            ? 'Overloaded'
            : Math.round(totalAllocatedPeriods / 1.5) < 18
            ? 'Underloaded'
            : 'Optimal',
        totalClassesAssigned: allClasses.length,
        totalStudentsReached: allClasses.length * 31,
      },
    };

    const finalPassword = firstTimePassword.trim() || carrierInboxService.generateFirstTimePassword();
    teacherData.password = finalPassword;
    teacherData.firstTimePassword = finalPassword;

    let dispatchResult: any = null;
    const username = generatedEmail.split('@')[0];

    // Dispatch verification link, first-time password, and OTP to registered SMS / WhatsApp / Email inboxes immediately per portal policy
    if (!editingTeacher && (provisionAccountNow || sendActivationInvite)) {
      dispatchResult = carrierInboxService.dispatchTeacherRegistrationInvite({
        teacherId: teacherData.id,
        teacherName: teacherData.name,
        username,
        email: teacherData.email,
        phoneNumber: teacherData.phoneNumber,
        schoolId: targetSchool || currentSchoolId || 'sch-central-001',
        schoolName: targetSchool || 'Registered Institutional School',
        role: assignedUserRole,
        firstTimePassword: finalPassword,
        deliveryChannels: {
          email: sendViaEmail,
          sms: sendViaSms,
          whatsapp: sendViaWhatsapp,
        },
      });
    }

    onSaveTeacher(teacherData, {
      provisionAccount: provisionAccountNow,
      userRole: assignedUserRole,
      sendInvitation: sendActivationInvite,
      firstTimePassword: finalPassword,
    });

    if (!editingTeacher) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.jjsak.edu.ke';
      const otpCode = dispatchResult?.otpCode || carrierInboxService.getLatestOtpForUser(username)?.otp || '839201';
      const actLink =
        dispatchResult?.activationLink ||
        `${origin}/#activate-teacher?id=${encodeURIComponent(teacherData.id)}&user=${encodeURIComponent(username)}&school=${encodeURIComponent(targetSchool || currentSchoolId || 'sch-central-001')}&otp=${encodeURIComponent(otpCode)}&pwd=${encodeURIComponent(finalPassword)}`;

      setRegistrationSuccessData({
        teacher: teacherData,
        username,
        firstTimePassword: finalPassword,
        otpCode,
        activationLink: actLink,
        expiresAt: dispatchResult?.expiresAt || Date.now() + 15 * 60 * 1000,
        schoolId: targetSchool || currentSchoolId || 'sch-central-001',
        schoolName: targetSchool || 'Registered Institutional School',
        channels: {
          email: sendViaEmail,
          sms: sendViaSms,
          whatsapp: sendViaWhatsapp,
        },
      });
    } else {
      onClose();
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Employment', icon: Briefcase },
    { id: 3, title: 'Qualifications', icon: GraduationCap },
    { id: 4, title: 'Workload & Classes', icon: Layers },
    { id: 5, title: 'Documents Vault', icon: FileText },
    { id: 6, title: 'Role & IAM', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Briefcase className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingTeacher ? 'Edit Staff Profile & Professional Records' : 'Staff / Teacher Registration Wizard'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                  Phase 4 Core Service
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-0.5">
                Centralized Kenyan CBC Professional Records, TSC Registration, Workload & IAM Provisioning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Governance Security Notice (Section 2.1 & 2.2) */}
        {policyBlockedMessage && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong className="font-bold">Action Restricted (Section 2.2):</strong> {policyBlockedMessage}
            </div>
          </div>
        )}

        {(currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'SYSTEM_ADMIN') && !policyBlockedMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Governance Policy §2.2:</strong> Platform Owner / Super Administrator is restricted from routine school staff onboarding. Routine onboarding must be executed by authorized school personnel within the respective school tenant.
            </span>
          </div>
        )}

        {registrationSuccessData ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-emerald-950">
                      Staff Registered &amp; Access Dispatched
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      Dispatched Successfully
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Direct portal activation link, first-time temporary password, and 6-digit OTP have been generated and dispatched to the multi-channel notification system.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const fullText = `*JJSAK School Portal — Teacher Login Credentials*\nInstitution: ${registrationSuccessData.schoolName}\nStaff Name: ${registrationSuccessData.teacher.name}\nUsername: ${registrationSuccessData.username}\nTemporary Password: ${registrationSuccessData.firstTimePassword}\nOTP Verification Code: ${registrationSuccessData.otpCode}\nDirect Activation Link: ${registrationSuccessData.activationLink}\n\nPlease click the link to activate your account and set your permanent password.`;
                    navigator.clipboard.writeText(fullText);
                    setCopiedAll(true);
                    setTimeout(() => setCopiedAll(false), 2500);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAll ? 'Copied Full Pack' : 'Copy All Details'}</span>
                </button>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Official Portal Onboarding Credentials</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  School: {registrationSuccessData.schoolName} ({registrationSuccessData.schoolId})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Username */}
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Assigned Username
                  </span>
                  <div className="text-base font-bold font-mono text-white select-all">
                    {registrationSuccessData.username}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {registrationSuccessData.teacher.email}
                  </span>
                </div>

                {/* Temporary Password */}
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Temporary Password
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(registrationSuccessData.firstTimePassword);
                        setCopiedAll(true);
                        setTimeout(() => setCopiedAll(false), 2000);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400 select-all">
                    {registrationSuccessData.firstTimePassword}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Single-use first login key</span>
                </div>

                {/* OTP Code */}
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Activation OTP
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(registrationSuccessData.otpCode);
                        setCopiedOtp(true);
                        setTimeout(() => setCopiedOtp(false), 2000);
                      }}
                      className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xl font-black font-mono tracking-widest text-amber-400 select-all">
                    {registrationSuccessData.otpCode}
                  </div>
                  <span className="text-[10px] text-amber-400/80 block">Valid for 15 minutes</span>
                </div>
              </div>

              {/* Direct Activation URL */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                    <span>Direct School Portal Access Link (Auto-Fills OTP &amp; Username)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(registrationSuccessData.activationLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLink ? 'Copied Link' : 'Copy Activation Link'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-700 font-mono text-[11px] text-slate-300 break-all select-all">
                  {registrationSuccessData.activationLink}
                </div>
              </div>
            </div>

            {/* Dispatched Delivery Channels & Live Transmission */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Multi-Channel Delivery Status &amp; Instant Sending</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Dispatch Ready
                </span>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-800 block">WhatsApp Cloud API</span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {registrationSuccessData.teacher.phoneNumber || '+254741478813'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-800 block">SMS Gateway</span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {registrationSuccessData.teacher.phoneNumber || '+254741478813'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-800 block">Email Gateway</span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {registrationSuccessData.teacher.email || 'Dispatched to queue'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant One-Tap Direct Delivery Controls */}
              {(() => {
                const targetPhone = (registrationSuccessData.teacher.phoneNumber || '0741478813').replace(/\D/g, '');
                let intlPhone = targetPhone;
                if (targetPhone.startsWith('0') && targetPhone.length === 10) intlPhone = '254' + targetPhone.substring(1);
                const waText = `*${registrationSuccessData.schoolName} — Teacher Portal Account*\n\nHello *${registrationSuccessData.teacher.name}*,\nYour institutional teacher account is ready.\n\n👤 *Username:* ${registrationSuccessData.username}\n🔐 *Temporary Password:* ${registrationSuccessData.firstTimePassword}\n🔑 *Activation OTP:* ${registrationSuccessData.otpCode}\n\n👉 *Direct Activation Link:*\n${registrationSuccessData.activationLink}\n\nPlease click the link to activate your portal account.`;
                const smsText = `[JJSAK Alert] ${registrationSuccessData.schoolName}: Welcome ${registrationSuccessData.teacher.name}. User: ${registrationSuccessData.username} | Pass: ${registrationSuccessData.firstTimePassword} | OTP: ${registrationSuccessData.otpCode} | Link: ${registrationSuccessData.activationLink}`;
                const emailSubject = `Welcome to ${registrationSuccessData.schoolName} — Teacher Account Credentials & Verification OTP`;

                return (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-700">
                        Deliver Directly to Teacher&apos;s Device:
                      </span>
                      <button
                        type="button"
                        onClick={handleTriggerLiveDispatchNow}
                        disabled={liveDispatching}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${liveDispatching ? 'animate-spin' : ''}`} />
                        <span>{liveDispatching ? 'Sending via Server APIs...' : 'Send Live via Server APIs'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send to WhatsApp Now</span>
                      </a>

                      <a
                        href={`sms:+${intlPhone}?body=${encodeURIComponent(smsText)}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <span>Send to Phone SMS</span>
                      </a>

                      {registrationSuccessData.teacher.email && (
                        <a
                          href={`mailto:${registrationSuccessData.teacher.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(smsText)}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-600" />
                          <span>Send to Teacher Email</span>
                        </a>
                      )}
                    </div>

                    {liveDispatchStatus && (
                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 animate-in fade-in space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Server Live Multi-Channel Transmission Triggered:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
                          <div>WhatsApp: {liveDispatchStatus.channelResults?.whatsapp?.accepted ? '✓ Accepted (Meta/Twilio)' : 'Dispatched / Direct Ready'}</div>
                          <div>SMS: {liveDispatchStatus.channelResults?.sms?.accepted ? '✓ Accepted (AT/Twilio)' : 'Dispatched / Direct Ready'}</div>
                          <div>Email: {liveDispatchStatus.channelResults?.email?.accepted ? '✓ Accepted (SMTP/Resend)' : 'Dispatched / Direct Ready'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {onOpenCarrierInbox && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCarrierInbox();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Mail className="w-4 h-4 text-red-700" />
                    <span>View in Carrier Inbox</span>
                  </button>
                )}

                {onOpenTeacherValidation && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTeacherValidation(
                        registrationSuccessData.otpCode,
                        registrationSuccessData.username,
                        registrationSuccessData.schoolId,
                        registrationSuccessData.firstTimePassword
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Test Teacher Activation Now</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold shadow-md transition"
              >
                Done &amp; Return to Registry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progression Tracker */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
              <div className="grid grid-cols-6 gap-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isCurrent = activeStep === step.id;
                  const isPast = activeStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                        isCurrent
                          ? 'bg-red-50 border border-red-300 text-red-800 shadow-xs'
                          : isPast
                          ? 'bg-white border border-emerald-200 text-emerald-700'
                          : 'bg-white/60 border border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-red-700' : isPast ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">Step {step.id}</span>
                      </div>
                      <span className="text-[11px] font-medium truncate w-full mt-0.5">
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Body with Step Switching */}
            <form onSubmit={handleFinalSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Personal Information */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500">
                    Full personal biodata, national identification, emergency contacts, and residential details.
                  </p>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs font-medium text-slate-600">Avatar Color:</span>
                  <div className="flex gap-1">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAvatarColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${
                          avatarColor === c ? 'scale-125 border-slate-900 shadow-sm' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mr. Jotham Barasa Watila"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    National ID / Passport Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. 28491034"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:ring-2 ${
                      duplicateErrors.nationalId
                        ? 'border-red-500 bg-red-50 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-red-500'
                    }`}
                  />
                  {duplicateErrors.nationalId && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {duplicateErrors.nationalId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number (SMS / OTP) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+254 741 478 813"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher.name@jjsak.ac.ke"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Residential Address
                </label>
                <input
                  type="text"
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  placeholder="e.g. Kitale - Cherangany Highway, Trans-Nzoia County"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Emergency Contact Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Next of Kin / Emergency Contact</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Name (e.g. Dr. Stella Watila)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Contact Phone (+254 7...)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Relationship (e.g. Spouse / Brother)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Teacher Appointment Type: Class Teacher vs Subject Teacher (Not Class Teacher) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Teacher Appointment &amp; Class Teacher Status <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Indicate whether this teacher is appointed as a Class Teacher (with homeroom &amp; stream responsibilities) or exclusively as a Subject Teacher (not a class teacher).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Subject Teacher (Not a Class Teacher) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassTeacher(false);
                      setAssignedClass('');
                      if (designation === 'Class Teacher') {
                        setDesignation('Subject Teacher');
                      }
                    }}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                      !isClassTeacher
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      !isClassTeacher ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${!isClassTeacher ? 'text-blue-950' : 'text-slate-800'}`}>
                          Not a Class Teacher
                        </span>
                        {!isClassTeacher && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                        Subject Teacher Only
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Teaches assigned subjects across classes. Does not handle homeroom roll call, attendance register sign-offs, or stream pastoral care.
                      </p>
                    </div>
                  </button>

                  {/* Option B: Class Teacher */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassTeacher(true);
                      if (designation === 'Teacher' || designation === 'Subject Teacher' || !designation) {
                        setDesignation('Class Teacher');
                      }
                      if (!assignedClass && classesList.length > 0) {
                        setAssignedClass(classesList[0]);
                      }
                    }}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                      isClassTeacher
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isClassTeacher ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isClassTeacher ? 'text-indigo-950' : 'text-slate-800'}`}>
                          Class Teacher
                        </span>
                        {isClassTeacher && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                        Assigned to Specific Stream
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Designated homeroom tutor with authority over morning roll call attendance, termly holistic report remarks, and learner welfare.
                      </p>
                    </div>
                  </button>
                </div>

                {isClassTeacher ? (
                  <div className="pt-3 border-t border-indigo-200 bg-indigo-50/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                        Assigned Class / Stream <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={assignedClass}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAssignedClass(val);
                          if (val && !classAllocations[val]) {
                            setClassAllocations((prev) => ({
                              ...prev,
                              [val]: ['Pretechnical Studies', 'Social Studies'],
                            }));
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        {classesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:w-72 text-xs text-indigo-900 bg-white/90 p-2.5 rounded-lg border border-indigo-200">
                      <span className="font-bold">Stream Responsibility:</span> Designated as Class Teacher for <strong className="text-indigo-700">{assignedClass || classesList[0] || 'Assigned Stream'}</strong>.
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 px-3.5 py-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Confirmed: <strong>{fullName || 'This teacher'}</strong> is registered as a <strong>Subject Teacher (Not a Class Teacher)</strong>. You can allocate teaching subjects in Step 3.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Employment Information */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Employment Information</h3>
                <p className="text-xs text-slate-500">
                  Institutional staff identification, TSC credentials, designation, department, and reporting hierarchy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                    placeholder="e.g. STF-2026-007"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:ring-2 ${
                      duplicateErrors.staffNumber
                        ? 'border-red-500 bg-red-50 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-red-500'
                    }`}
                  />
                  {duplicateErrors.staffNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {duplicateErrors.staffNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    TSC Number (Where Applicable)
                  </label>
                  <input
                    type="text"
                    value={tscNumber}
                    onChange={(e) => setTscNumber(e.target.value)}
                    placeholder="e.g. TSC-641890"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:ring-2 ${
                      duplicateErrors.tscNumber
                        ? 'border-red-500 bg-red-50 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-red-500'
                    }`}
                  />
                  {duplicateErrors.tscNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {duplicateErrors.tscNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Employment / Appointment
                  </label>
                  <input
                    type="date"
                    value={dateOfEmployment}
                    onChange={(e) => setDateOfEmployment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => {
                      const val = e.target.value as StaffDesignation;
                      setDesignation(val);
                      if (val === 'Class Teacher') {
                        setIsClassTeacher(true);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {STAFF_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic / Administrative Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as StaffDepartment)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {STAFF_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employment Terms / Status
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                  >
                    {EMPLOYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Teacher & Assigned Class Control */}
                <div className="md:col-span-2 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        Class Teacher Responsibility &amp; Assigned Stream
                      </span>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        Designate if this staff member is a Class Teacher with pastoral care, daily attendance roll call, and termly remark authority.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClassTeacher}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setIsClassTeacher(val);
                          if (val) {
                            if (designation === 'Teacher' || !designation) {
                              setDesignation('Class Teacher');
                            }
                            if (!assignedClass && classesList.length > 0) {
                              setAssignedClass(classesList[0]);
                            }
                          } else {
                            if (designation === 'Class Teacher') {
                              setDesignation('Teacher');
                            }
                            setAssignedClass('');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {isClassTeacher ? (
                    <div className="pt-3 border-t border-indigo-200 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                          Assigned Class / Stream <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={assignedClass}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAssignedClass(val);
                            if (val && !classAllocations[val]) {
                              setClassAllocations((prev) => ({
                                ...prev,
                                [val]: ['Pretechnical Studies', 'Social Studies'],
                              }));
                            }
                          }}
                          className="w-full px-3.5 py-2 rounded-lg border border-indigo-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        >
                          {classesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          {!classesList.includes('Grade 7 North') && <option value="Grade 7 North">Grade 7 North</option>}
                          {!classesList.includes('Grade 7 South') && <option value="Grade 7 South">Grade 7 South</option>}
                          {!classesList.includes('Grade 8 North') && <option value="Grade 8 North">Grade 8 North</option>}
                          {!classesList.includes('Grade 8 South') && <option value="Grade 8 South">Grade 8 South</option>}
                          {!classesList.includes('Grade 9 North') && <option value="Grade 9 North">Grade 9 North</option>}
                        </select>
                      </div>
                      <div className="sm:w-72 text-xs text-indigo-900 bg-white/90 p-2.5 rounded-lg border border-indigo-200">
                        <span className="font-bold">Official Class:</span> Designated as primary Class Teacher for <strong className="text-indigo-700">{assignedClass}</strong>.
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/80 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          Not a Class Teacher
                        </span>
                        <p className="text-xs text-slate-600">
                          Designated as <strong>Subject Teacher / Specialist</strong>. Responsible for teaching learning areas across allocated grades and streams without pastoral stream roll-call administration.
                        </p>
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                        Subject Allocations in Step 3
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reporting Officer / Immediate Supervisor
                </label>
                <input
                  type="text"
                  value={reportingOfficer}
                  onChange={(e) => setReportingOfficer(e.target.value)}
                  placeholder="e.g. Mrs. J. Barasa (Head of Institution) / Deputy Head"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Academic & Professional Qualifications */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Academic & Professional Qualifications</h3>
                  <p className="text-xs text-slate-500">
                    Degrees, diplomas, TSC licensure, professional certifications, and TPD continuous development.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAcademicQualification}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Degree / Diploma
                </button>
              </div>

              {/* Academic Qualifications List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tertiary Academic Qualifications
                </h4>
                {academicQualifications.map((aq, index) => (
                  <div
                    key={aq.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                  >
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Degree / Award</label>
                      <input
                        type="text"
                        value={aq.degree}
                        onChange={(e) => {
                          const updated = [...academicQualifications];
                          updated[index].degree = e.target.value;
                          setAcademicQualifications(updated);
                        }}
                        placeholder="e.g. B.Ed (Arts) - First Class"
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Institution</label>
                      <input
                        type="text"
                        value={aq.institution}
                        onChange={(e) => {
                          const updated = [...academicQualifications];
                          updated[index].institution = e.target.value;
                          setAcademicQualifications(updated);
                        }}
                        placeholder="e.g. Kenyatta University"
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Year</label>
                        <input
                          type="number"
                          value={aq.year}
                          onChange={(e) => {
                            const updated = [...academicQualifications];
                            updated[index].year = parseInt(e.target.value) || 2020;
                            setAcademicQualifications(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      {academicQualifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAcademicQualification(aq.id)}
                          className="mt-4 p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* TPD Continuous Professional Development */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-red-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
                      TPD (Teacher Professional Development) Record
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-md">
                    60 CPD Credits Target
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Module Name</label>
                    <input
                      type="text"
                      value={tpdRecords[0]?.moduleName || ''}
                      onChange={(e) => {
                        const updated = [...tpdRecords];
                        if (updated[0]) updated[0].moduleName = e.target.value;
                        setTpdRecords(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Accredited Provider</label>
                    <input
                      type="text"
                      value={tpdRecords[0]?.provider || ''}
                      onChange={(e) => {
                        const updated = [...tpdRecords];
                        if (updated[0]) updated[0].provider = e.target.value;
                        setTpdRecords(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">CPD Points Earned</label>
                    <input
                      type="number"
                      value={tpdRecords[0]?.cpdPoints || 60}
                      onChange={(e) => {
                        const updated = [...tpdRecords];
                        if (updated[0]) updated[0].cpdPoints = parseInt(e.target.value) || 0;
                        setTpdRecords(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Class & Subject Allocations */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Teaching Workload & Class Allocations</h3>
                  <p className="text-xs text-slate-500">
                    Assign Junior Secondary classes (Grade 7, 8, 9) and CBE learning areas. Real-time lesson calculator.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">Calculated Load:</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      Math.round(totalAllocatedPeriods / 1.5) > 28
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {Math.round(totalAllocatedPeriods / 1.5)} / 27 Lessons/Wk (
                    {Math.round(totalAllocatedPeriods / 1.5) > 28 ? 'High' : 'Optimal'})
                  </span>
                </div>
              </div>

              {/* Batch Allocator Shortcut */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  Quick Batch Assigner:
                </span>
                <select
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  {subjectsList.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">into selected classes:</span>
                <div className="flex gap-1">
                  {classesList.map((cls: string) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() =>
                        setBatchClasses((prev) =>
                          prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
                        )
                      }
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                        batchClasses.includes(cls)
                          ? 'bg-red-800 text-white'
                          : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleApplyBatchAllocation}
                  className="px-3 py-1.5 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-800 ml-auto"
                >
                  Apply to Classes
                </button>
              </div>

              {/* Class by Class Stream Allocation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classesList.map((cls: string) => {
                  const isAssigned = !!classAllocations[cls];
                  const currentSubjects = classAllocations[cls] || [];
                  return (
                    <div
                      key={cls}
                      className={`p-4 rounded-xl border transition-all ${
                        isAssigned
                          ? 'bg-white border-red-300 shadow-xs'
                          : 'bg-slate-50/50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleClass(cls)}
                            className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500"
                          />
                          <span className="text-sm font-bold text-slate-900">{cls}</span>
                          {isAssigned && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              ({currentSubjects.length} subjects)
                            </span>
                          )}
                        </div>
                        {isAssigned && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            Active Stream
                          </span>
                        )}
                      </div>

                      {isAssigned && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                          {subjectsList.map((sub: string) => {
                            const isSelected = currentSubjects.includes(sub);
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => handleToggleSubjectForClass(cls, sub)}
                                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                                  isSelected
                                    ? 'bg-red-800 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Supporting Documents Vault */}
          {activeStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Supporting Documents Vault</h3>
                  <p className="text-xs text-slate-500">
                    Passport photograph, National ID copy, academic certificates, TSC certificates, and appointment letters.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Academic Certificate')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Other Approved Document')}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg text-red-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-500">{doc.type}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-400">{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Role Assignment & Centralized IAM Provisioning */}
          {activeStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Role Assignment & IAM Provisioning</h3>
                <p className="text-xs text-slate-500">
                  Fulfill JJSAK final teacher account rule: Provision a secured single user account in authorized tenant.
                </p>
              </div>

              {/* Final JJSAK Rule Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Final JJSAK Teacher Account Policy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every staff member shall have exactly one unique staff profile and one securely provisioned user
                  account in the school tenant. Centralized IAM handles role-based access, MFA authentication,
                  and audit logging for every lifecycle event.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Platform Access Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={assignedUserRole}
                    onChange={(e) => setAssignedUserRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value="TEACHER">TEACHER (Marks Entry, Timetable, Advice)</option>
                    <option value="HEAD">HEAD (Principal / Full Executive Access)</option>
                    <option value="DEPUTY">DEPUTY (Academics & Student Management)</option>
                    <option value="DIRECTOR_ACADEMICS">DIRECTOR_ACADEMICS (Curriculum & Exams)</option>
                    <option value="ADMIN">ADMIN (Institutional Configuration)</option>
                    <option value="FINANCE">FINANCE (Bursar & Subscriptions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Multi-Factor Authentication (MFA)
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableMfa}
                        onChange={(e) => setEnableMfa(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500"
                      />
                      Enforce MFA Protection
                    </label>
                    {enableMfa && (
                      <select
                        value={mfaMethod}
                        onChange={(e) => setMfaMethod(e.target.value as any)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 text-xs"
                      >
                        <option value="SMS_OTP">SMS OTP (+254 Phone)</option>
                        <option value="EMAIL_OTP">Email OTP Link</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Automatic Provisioning Controls - JJSAK Security Policy Compliant */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="provisionAccount"
                    checked={provisionAccountNow}
                    onChange={(e) => setProvisionAccountNow(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <label htmlFor="provisionAccount" className="text-xs font-bold text-emerald-900 cursor-pointer flex items-center gap-1.5">
                      <span>Provision Account in Registered – First Login Required State (Policy §1.4)</span>
                    </label>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Creates unified login credentials with username{' '}
                      <span className="font-mono font-bold">
                        {email ? email.split('@')[0] : fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}
                      </span>. Account access remains locked until teacher verifies their activation OTP and creates a permanent password (Policy §1.5).
                    </p>
                  </div>
                </div>

                {/* Automated First-Time Password & Immediate Multi-Channel Delivery */}
                {provisionAccountNow && (
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-bold text-slate-900">
                          Automated First-Time Temporary Password
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Policy §3.1 Compliant (12+ Chars)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showFirstTimePassword ? 'text' : 'password'}
                          value={firstTimePassword}
                          onChange={(e) => setFirstTimePassword(e.target.value)}
                          placeholder="Auto-generated secure password"
                          className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFirstTimePassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          title={showFirstTimePassword ? 'Hide password' : 'Show password'}
                        >
                          {showFirstTimePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fresh = carrierInboxService.generateFirstTimePassword();
                          setFirstTimePassword(fresh);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                        title="Regenerate random compliant password"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (firstTimePassword) {
                            navigator.clipboard.writeText(firstTimePassword);
                            setIsCopiedPassword(true);
                            setTimeout(() => setIsCopiedPassword(false), 2500);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                        title="Copy password to clipboard"
                      >
                        {isCopiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedPassword ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Delivery Channels Checklist */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Deliver Password, Direct Link &amp; OTP Immediately via:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${sendViaSms ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          <input
                            type="checkbox"
                            checked={sendViaSms}
                            onChange={(e) => setSendViaSms(e.target.checked)}
                            className="w-3.5 h-3.5 text-emerald-600 rounded-sm focus:ring-emerald-500"
                          />
                          <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">SMS ({phoneNumber || '+254...'})</span>
                        </label>

                        <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${sendViaWhatsapp ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          <input
                            type="checkbox"
                            checked={sendViaWhatsapp}
                            onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                            className="w-3.5 h-3.5 text-emerald-600 rounded-sm focus:ring-emerald-500"
                          />
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">WhatsApp ({phoneNumber || '+254...'})</span>
                        </label>

                        <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${sendViaEmail ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          <input
                            type="checkbox"
                            checked={sendViaEmail}
                            onChange={(e) => setSendViaEmail(e.target.checked)}
                            className="w-3.5 h-3.5 text-emerald-600 rounded-sm focus:ring-emerald-500"
                          />
                          <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">Email ({email || 'registered address'})</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-start gap-2">
                      <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Immediate Delivery on Save:</strong> First-time password, portal activation link, and OTP will be dispatched immediately once registration is confirmed so the teacher can log in and access the application right away.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 pl-7">
                  <input
                    type="checkbox"
                    id="sendInvite"
                    checked={sendActivationInvite}
                    onChange={(e) => setSendActivationInvite(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <label htmlFor="sendInvite" className="text-xs font-bold text-emerald-900 cursor-pointer">
                      Automatically Dispatch Time-Limited OTP via SMS, Email & WhatsApp (Policy §2)
                    </label>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      A randomly generated, secure 6-digit OTP (15-minute validity) will be sent directly to the teacher's registered contact channels.
                    </p>
                  </div>
                </div>

                {/* Zero-Exposure Policy Notice (§2.3 & §13) */}
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg text-[11px] border border-slate-700 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">Zero-Exposure Policy Notice (§2.3 &amp; §13):</span> Under JJSAK security policy, the activation OTP will <strong>never</strong> be displayed on school admin screens or portal logs. The teacher must complete verification on their private device.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  Next: {steps[activeStep].title}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingTeacher ? 'Save Changes & Update Records' : 'Complete Staff Registration & Provision Account'}
                </button>
              )}
            </div>
          </div>
        </form>
      </>
    )}
  </div>
</div>
  );
};
