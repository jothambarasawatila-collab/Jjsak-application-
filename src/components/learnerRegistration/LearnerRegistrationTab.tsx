import React, { useState } from 'react';
import {
  UserPlus,
  Hash,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap,
  Save,
  Check,
  ChevronRight,
  Search,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  AdmissionNumberGenerationConfig,
  RegistrationApprovalStatus,
} from '../../types/learnerRegistration';
import {
  KENYA_COUNTIES,
  JUNIOR_SECONDARY_CORE_SUBJECTS,
  generateNextAdmissionNumber,
  generateNemisUpi,
} from '../../data/learnerRegistrationData';

interface LearnerRegistrationTabProps {
  dossiers: LearnerMasterDossier[];
  admissionConfig: AdmissionNumberGenerationConfig;
  onUpdateAdmissionConfig: (cfg: AdmissionNumberGenerationConfig) => void;
  onRegisterLearner: (dossier: LearnerMasterDossier) => void;
  onUpdateDossier: (dossier: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const LearnerRegistrationTab: React.FC<LearnerRegistrationTabProps> = ({
  dossiers,
  admissionConfig,
  onUpdateAdmissionConfig,
  onRegisterLearner,
  onUpdateDossier,
  onLogAudit,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'register' | 'pipeline' | 'config'>('register');
  const [pipelineFilter, setPipelineFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Form State - P9.1 & P9.2 Identity
  const [admNo, setAdmNo] = useState<string>(() => generateNextAdmissionNumber(admissionConfig));
  const [isManualAdmNo, setIsManualAdmNo] = useState<boolean>(false);
  const [upi, setUpi] = useState<string>(() => generateNemisUpi());
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState<string>('2012-05-15');
  const [countyOfBirth, setCountyOfBirth] = useState<string>('Nairobi City');
  const [subCountyOfBirth, setSubCountyOfBirth] = useState<string>('Westlands');
  const [birthPlace, setBirthPlace] = useState<string>('Nairobi Hospital');
  const [nationalityCountry] = useState<string>('Kenya');
  const [birthCertNumber, setBirthCertNumber] = useState<string>('');

  // Form State - P9.3 Parent / Guardian
  const [fatherName, setFatherName] = useState<string>('');
  const [fatherNationalId, setFatherNationalId] = useState<string>('');
  const [fatherPhone, setFatherPhone] = useState<string>('');
  const [fatherEmail, setFatherEmail] = useState<string>('');
  const [fatherOccupation, setFatherOccupation] = useState<string>('');
  const [residentialAddress, setResidentialAddress] = useState<string>('Kilimani, Nairobi');
  const [preferredChannel, setPreferredChannel] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');

  // Form State - P9.4 Academic Placement
  const [enrolledGrade, setEnrolledGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 7');
  const [enrolledStream, setEnrolledStream] = useState<string>('Simba');
  const [academicYear] = useState<number>(2026);
  const [entryTerm, setEntryTerm] = useState<string>('Term 2, 2026');
  const [learningPathway, setLearningPathway] = useState<any>('STEM (Science, Tech, Eng, Math)');
  const [previousSchool, setPreviousSchool] = useState<string>('St. Jude Primary Academy');
  const [kpseaScore, setKpseaScore] = useState<number>(78.5);

  // Form State - P9.5 Medical
  const [bloodGroup, setBloodGroup] = useState<any>('O+');
  const [allergiesText, setAllergiesText] = useState<string>('');
  const [hasAsthma, setHasAsthma] = useState<boolean>(false);
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [preferredHospital, setPreferredHospital] = useState<string>('Nairobi Hospital Outpatient Clinic');

  // Form State - P9.6 Biometrics & Docs
  const [isBiometricCaptured, setIsBiometricCaptured] = useState<boolean>(false);
  const [uploadedBirthCertName, setUploadedBirthCertName] = useState<string>('');
  const [uploadedTransferLetterName, setUploadedTransferLetterName] = useState<string>('');

  // Validation message
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate age
  const calculatedAge = React.useMemo(() => {
    if (!dateOfBirth) return 13;
    const birthYear = new Date(dateOfBirth).getFullYear();
    return 2026 - birthYear;
  }, [dateOfBirth]);

  const handleNextAdmission = () => {
    const nextSeq = admissionConfig.currentSequence + 1;
    const newAdm = generateNextAdmissionNumber(admissionConfig, nextSeq);
    setAdmNo(newAdm);
  };

  const handleRegenerateUpi = () => {
    setUpi(generateNemisUpi());
  };

  const handleStepNext = () => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setValidationError('First Name and Last Name are required to proceed.');
        return;
      }
      if (!birthCertNumber.trim()) {
        setValidationError('Birth Certificate Number is mandatory for MoE NEMIS validation.');
        return;
      }
      if (calculatedAge < 10 || calculatedAge > 18) {
        setValidationError(`Age (${calculatedAge}) is outside the normal Junior Secondary range (11-17 yrs).`);
        return;
      }
    } else if (currentStep === 2) {
      if (!fatherName.trim()) {
        setValidationError('Primary Parent / Guardian full name is required.');
        return;
      }
      if (!fatherPhone.trim()) {
        setValidationError('Primary phone number is required for statutory emergency contact.');
        return;
      }
    } else if (currentStep === 3) {
      if (!enrolledGrade || !enrolledStream) {
        setValidationError('Grade and stream allocation are mandatory.');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handleStepBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleCompleteRegistration = (status: RegistrationApprovalStatus = 'SUBMITTED') => {
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Please provide complete learner name before submitting.');
      return;
    }

    const newId = `st-reg-${Date.now()}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const classCode = `${enrolledGrade === 'Grade 7' ? 'G7' : enrolledGrade === 'Grade 8' ? 'G8' : 'G9'} ${enrolledStream.charAt(0)}`;

    const newDossier: LearnerMasterDossier = {
      id: newId,
      admissionNumber: admNo,
      upiNumber: upi,
      assessmentIndexNumber: `08219001/${admNo.replace(/\D/g, '').slice(-3) || '050'}`,
      registrationStatus: status,
      enrollmentDate: new Date().toISOString().split('T')[0],
      registeredByStaff: 'Mrs. J. Barasa (Registrar)',
      approvedByRegistrar: status === 'ENROLLED' ? 'Dr. Joseph K. Ruto (Principal)' : undefined,
      approvalDate: status === 'ENROLLED' ? new Date().toISOString().split('T')[0] : undefined,
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      preferredName: firstName.trim(),
      gender,
      dateOfBirth,
      calculatedAge,
      countyOfBirth,
      subCountyOfBirth,
      birthPlace,
      nationalityCategory: 'Kenyan Citizen',
      nationalityCountry,
      birthCertificateNumber: birthCertNumber,
      avatarInitials: initials,
      profileStatus: status === 'ENROLLED' ? 'Active' : 'Pending Admission',
      parentsAndGuardians: [
        {
          id: `pg-${newId}-1`,
          learnerId: newId,
          relationship: 'Father',
          fullName: fatherName.trim() || 'Parent / Guardian',
          nationalIdNumber: fatherNationalId || '24567890',
          primaryPhoneNumber: fatherPhone || '+254 700 000 000',
          emailAddress: fatherEmail || undefined,
          occupation: fatherOccupation || 'Private Sector',
          residentialAddress,
          county: countyOfBirth,
          subCounty: subCountyOfBirth,
          isPrimaryContact: true,
          emergencyPriorityOrder: 1,
          authorizedForPickup: true,
          legalCustodyHolder: true,
          parentPortalAccessCode: `PORTAL-${Math.floor(1000 + Math.random() * 9000)}`,
          portalAccountActivated: false,
          preferredCommunicationChannel: preferredChannel as any,
          preferredLanguage: 'English',
          isVerified: true,
          verifiedDate: new Date().toISOString().split('T')[0],
        },
      ],
      academicPlacement: {
        learnerId: newId,
        admissionNumber: admNo,
        upiNumber: upi,
        academicYear,
        entryTerm,
        enrolledGrade,
        enrolledStream,
        classCode,
        classTeacherId: 'tch-001',
        classTeacherName: 'Mr. O. Kinyanjui',
        learningPathway,
        enrolledSubjects: JUNIOR_SECONDARY_CORE_SUBJECTS.map((s) => ({
          subjectCode: s.code,
          subjectName: s.name,
          isCore: s.isCore,
          isElective: s.isElective,
          assignedTeacher: s.teacher,
        })),
        academicStatus: 'Active & In Good Standing',
        previousSchoolName: previousSchool,
        kpseaMeanScore: kpseaScore,
      },
      medicalDossier: {
        learnerId: newId,
        bloodGroup,
        rhesusFactor: 'Positive (+)',
        allergies: allergiesText
          ? [
              {
                category: 'Food',
                allergen: allergiesText,
                severity: 'Moderate',
                reactionDetails: 'Reported upon enrollment admission',
              },
            ]
          : [],
        chronicConditions: hasAsthma
          ? [
              {
                conditionName: 'Mild Asthma',
                diagnosedYear: '2023',
                managementProtocol: 'Emergency inhaler in school clinic',
                requiresCampusInhalerOrKit: true,
              },
            ]
          : [],
        regularMedications: [],
        disabilityAndAccommodations: {
          hasDisability,
          iepRequired: hasDisability,
          classroomAccommodations: hasDisability ? 'Special desk and seating adjustment' : 'None',
        },
        emergencyMedicalDetails: {
          contactName: fatherName || 'Parent',
          relationship: 'Father',
          primaryPhone: emergencyPhone || fatherPhone || '+254 700 000 000',
          preferredHospital,
          insuranceProvider: 'SHA Universal Health Coverage',
        },
        immunizationUpToDate: true,
        medicalClearanceStatus: 'Cleared for Sports & Physical Activity',
      },
      documents: [
        {
          id: `doc-${newId}-1`,
          learnerId: newId,
          documentType: 'BIRTH_CERTIFICATE',
          documentTitle: 'Official Birth Certificate Copy',
          fileName: uploadedBirthCertName || `${firstName}_BirthCertificate.pdf`,
          fileSize: '1.2 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Mrs. J. Barasa (Registrar)',
          verificationStatus: 'VERIFIED',
          documentNumber: birthCertNumber,
        },
        ...(uploadedTransferLetterName
          ? [
              {
                id: `doc-${newId}-2`,
                learnerId: newId,
                documentType: 'NEMIS_TRANSFER_LETTER' as const,
                documentTitle: 'MoE Transfer Letter',
                fileName: uploadedTransferLetterName,
                fileSize: '750 KB',
                uploadDate: new Date().toISOString().split('T')[0],
                uploadedBy: 'Mrs. J. Barasa (Registrar)',
                verificationStatus: 'VERIFIED' as const,
              },
            ]
          : []),
      ],
      isBiometricsVerified: isBiometricCaptured,
      biometricVerificationDate: isBiometricCaptured ? new Date().toISOString().split('T')[0] : undefined,
      tamperProofHash: `SHA256-${Date.now()}-${admNo.replace(/\//g, '')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onRegisterLearner(newDossier);

    // Update sequence config
    const nextSeq = admissionConfig.currentSequence + 1;
    onUpdateAdmissionConfig({
      ...admissionConfig,
      currentSequence: nextSeq,
    });

    onLogAudit?.(
      'LEARNER_REGISTRATION_CREATED',
      `Registered new learner: ${firstName} ${lastName} (Adm: ${admNo}, UPI: ${upi}) with status ${status}.`
    );

    setSuccessMessage(`✓ Learner ${firstName} ${lastName} (${admNo}) successfully registered with status: ${status}!`);

    // Reset form
    setCurrentStep(1);
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setBirthCertNumber('');
    setFatherName('');
    setFatherPhone('');
    setFatherEmail('');
    setFatherNationalId('');
    setAllergiesText('');
    setIsBiometricCaptured(false);
    setUploadedBirthCertName('');
    setUploadedTransferLetterName('');
    setAdmNo(generateNextAdmissionNumber(admissionConfig, nextSeq + 1));
    setUpi(generateNemisUpi());
  };

  const handleUpdateWorkflowStatus = (
    dossier: LearnerMasterDossier,
    newStatus: RegistrationApprovalStatus
  ) => {
    const updated: LearnerMasterDossier = {
      ...dossier,
      registrationStatus: newStatus,
      profileStatus: newStatus === 'ENROLLED' ? 'Active' : dossier.profileStatus,
      approvedByRegistrar: newStatus === 'ENROLLED' || newStatus === 'REGISTRAR_APPROVED' ? 'Dr. Joseph K. Ruto (Principal)' : dossier.approvedByRegistrar,
      approvalDate: newStatus === 'ENROLLED' || newStatus === 'REGISTRAR_APPROVED' ? new Date().toISOString().split('T')[0] : dossier.approvalDate,
      isBiometricsVerified: newStatus === 'BIOMETRICS_VERIFIED' || newStatus === 'REGISTRAR_APPROVED' || newStatus === 'ENROLLED' ? true : dossier.isBiometricsVerified,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updated);
    onLogAudit?.(
      'LEARNER_REGISTRATION_STAGE_CHANGED',
      `Updated registration workflow for ${dossier.firstName} ${dossier.lastName} (${dossier.admissionNumber}) to: ${newStatus}.`
    );
  };

  const filteredDossiers = dossiers.filter((d) => {
    if (pipelineFilter !== 'ALL' && d.registrationStatus !== pipelineFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchName = `${d.firstName} ${d.lastName}`.toLowerCase().includes(q);
      const matchAdm = d.admissionNumber.toLowerCase().includes(q);
      const matchUpi = d.upiNumber.toLowerCase().includes(q);
      if (!matchName && !matchAdm && !matchUpi) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="p9-1-learner-registration">
      {/* Top Header & Navigation Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wide">
              P9.1 FRAMEWORK
            </span>
            <h2 className="text-lg font-black text-slate-900">Learner Registration &amp; Admission</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            New learner onboarding, auto-sequencing admission numbers, NEMIS UPI assignment, and multi-tier approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveWorkflowTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeWorkflowTab === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Learner Wizard
          </button>
          <button
            onClick={() => setActiveWorkflowTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeWorkflowTab === 'pipeline'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Approval Pipeline ({dossiers.length})
          </button>
          <button
            onClick={() => setActiveWorkflowTab('config')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeWorkflowTab === 'config'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Adm &amp; UPI Engine
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 underline text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NEW LEARNER REGISTRATION WIZARD (P9.1.1 - P9.1.6)                      */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'register' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Wizard Step Progress Tracker */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { step: 1, label: '1. Identity & Birth' },
                { step: 2, label: '2. Parent & Contact' },
                { step: 3, label: '3. Academic Placement' },
                { step: 4, label: '4. Health & Medical' },
                { step: 5, label: '5. Biometrics & Docs' },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => setCurrentStep(item.step as any)}
                  className={`flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                    currentStep === item.step
                      ? 'text-blue-700 font-black'
                      : currentStep > item.step
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      currentStep === item.step
                        ? 'bg-blue-600 text-white shadow-xs'
                        : currentStep > item.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentStep > item.step ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1: Personal & Birth Details */}
            {currentStep === 1 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    P9.1.1 - P9.1.3: Learner Identification &amp; Statutory Numbers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the legal name as reflected on the Birth Certificate, along with statutory MoE identifiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Generated Admission Number */}
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <label className="text-[11px] font-black uppercase text-blue-900 tracking-wider flex items-center justify-between">
                      <span>Admission Number (P9.1.2)</span>
                      <button
                        type="button"
                        onClick={handleNextAdmission}
                        className="text-[10px] text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Next Seq
                      </button>
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={admNo}
                        disabled={!isManualAdmNo}
                        onChange={(e) => setAdmNo(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-bold border ${
                          isManualAdmNo
                            ? 'bg-white border-blue-400 text-blue-950 focus:outline-none'
                            : 'bg-blue-100/60 border-blue-200 text-blue-900 cursor-not-allowed'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsManualAdmNo(!isManualAdmNo)}
                        className="px-2.5 py-2 text-[10px] font-bold bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 shrink-0 cursor-pointer"
                      >
                        {isManualAdmNo ? 'Lock' : 'Override'}
                      </button>
                    </div>
                  </div>

                  {/* MoE NEMIS / KICD UPI */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                      <span>MoE NEMIS UPI (P9.1.3)</span>
                      <button
                        type="button"
                        onClick={handleRegenerateUpi}
                        className="text-[10px] text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Auto-Assign
                      </button>
                    </label>
                    <input
                      type="text"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="e.g. NEMIS-KICD-882194"
                      className="mt-1.5 w-full px-3 py-2 bg-white rounded-lg text-xs font-mono font-bold border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Amara"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Middle Name</label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Zola"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Last / Surname *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Kiprono"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      Date of Birth * (Age: {calculatedAge} yrs)
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Birth Certificate No. *</label>
                    <input
                      type="text"
                      value={birthCertNumber}
                      onChange={(e) => setBirthCertNumber(e.target.value)}
                      placeholder="e.g. BC/2012/984129"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Birth Place / Hospital</label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="e.g. Eldoret Hospital"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">County of Birth * (Kenya)</label>
                    <select
                      value={countyOfBirth}
                      onChange={(e) => setCountyOfBirth(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c} County
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Sub-County of Birth</label>
                    <input
                      type="text"
                      value={subCountyOfBirth}
                      onChange={(e) => setSubCountyOfBirth(e.target.value)}
                      placeholder="e.g. Ainabkoi"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Parent & Guardian Details (P9.3) */}
            {currentStep === 2 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    P9.3: Primary Parent &amp; Guardian Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register statutory guardians, emergency contacts, parent portal keys, and communication channels.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Primary Guardian Full Name *</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Ezekiel K. Kiprono"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">National ID / Passport Number *</label>
                    <input
                      type="text"
                      value={fatherNationalId}
                      onChange={(e) => setFatherNationalId(e.target.value)}
                      placeholder="e.g. 28491024"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Primary Phone Number *</label>
                    <input
                      type="text"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      placeholder="e.g. +254 712 345 678"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={fatherEmail}
                      onChange={(e) => setFatherEmail(e.target.value)}
                      placeholder="e.g. ezekiel.kiprono@email.com"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Occupation / Employer</label>
                    <input
                      type="text"
                      value={fatherOccupation}
                      onChange={(e) => setFatherOccupation(e.target.value)}
                      placeholder="e.g. Agricultural Officer"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Residential Address / Estate</label>
                    <input
                      type="text"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      placeholder="e.g. Elgon View Estate, House 42"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Preferred Dispatch Channel</label>
                    <select
                      value={preferredChannel}
                      onChange={(e) => setPreferredChannel(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="SMS">SMS Instant Notice</option>
                      <option value="WhatsApp">WhatsApp Encrypted PDF Dispatch</option>
                      <option value="Email">Email Official Statement</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Academic Placement & Pathway (P9.4) */}
            {currentStep === 3 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    P9.4: Academic Placement &amp; Junior School Pathway Allocation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign grade level, stream allocation, entry academic year, and CBE career pathway.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Enrolled Grade * (P9.4.1)</label>
                    <select
                      value={enrolledGrade}
                      onChange={(e) => setEnrolledGrade(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500 font-bold"
                    >
                      <option value="Grade 7">Grade 7 (Entry)</option>
                      <option value="Grade 8">Grade 8 (Intermediate)</option>
                      <option value="Grade 9">Grade 9 (Senior Transition)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Enrolled Stream * (P9.4.2)</label>
                    <select
                      value={enrolledStream}
                      onChange={(e) => setEnrolledStream(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500 font-bold"
                    >
                      <option value="Simba">Simba Stream</option>
                      <option value="Chui">Chui Stream</option>
                      <option value="Ndovu">Ndovu Stream</option>
                      <option value="Kifaru">Kifaru Stream</option>
                      <option value="Mara">Mara Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Entry Term (P9.1.6)</label>
                    <select
                      value={entryTerm}
                      onChange={(e) => setEntryTerm(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500 font-medium"
                    >
                      <option value="Term 1, 2026">Term 1, 2026</option>
                      <option value="Term 2, 2026">Term 2, 2026</option>
                      <option value="Term 3, 2026">Term 3, 2026</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">CBE Learning Pathway (P9.4.5)</label>
                    <select
                      value={learningPathway}
                      onChange={(e) => setLearningPathway(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500 font-bold text-purple-900"
                    >
                      <option value="STEM (Science, Tech, Eng, Math)">STEM (Science, Tech, Eng, Math)</option>
                      <option value="Social Sciences & Humanities">Social Sciences &amp; Humanities</option>
                      <option value="Arts & Sports Science">Arts &amp; Sports Science</option>
                      <option value="General Junior Foundation (G7/G8)">General Junior Foundation (G7/G8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Prior Primary / Junior School</label>
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="e.g. Highlands Junior Academy"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">KPSEA Grade 6 Baseline Mean Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpseaScore}
                    onChange={(e) => setKpseaScore(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-32 px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Medical & Health Records (P9.5) */}
            {currentStep === 4 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    P9.5: Medical Profile, Allergies &amp; Emergency Protocols
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture blood group, chronic conditions, special needs accommodations, and emergency hospital linkages.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Blood Group *</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-red-500 font-bold text-red-700"
                    >
                      <option value="A+">A+ (A Positive)</option>
                      <option value="A-">A- (A Negative)</option>
                      <option value="B+">B+ (B Positive)</option>
                      <option value="B-">B- (B Negative)</option>
                      <option value="AB+">AB+ (AB Positive)</option>
                      <option value="AB-">AB- (AB Negative)</option>
                      <option value="O+">O+ (O Positive)</option>
                      <option value="O-">O- (O Negative)</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Emergency Medical Contact Phone</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="e.g. +254 712 345 678"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Preferred Hospital / Clinic</label>
                    <input
                      type="text"
                      value={preferredHospital}
                      onChange={(e) => setPreferredHospital(e.target.value)}
                      placeholder="e.g. Mediheal Hospital Eldoret"
                      className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Known Allergies (Food / Medication / Dust)</label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, Pollen"
                    className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasAsthma}
                      onChange={(e) => setHasAsthma(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Has Asthma / Respiratory Alert</span>
                      <p className="text-[11px] text-slate-500">Inhaler will be logged in school clinic repository</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasDisability}
                      onChange={(e) => setHasDisability(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Special Educational Needs (SEN / IEP)</span>
                      <p className="text-[11px] text-slate-500">Visual, hearing, mobility, or learning accommodation</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Biometrics & Documents (P9.6) */}
            {currentStep === 5 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-blue-600" />
                    P9.6: Biometric Verification &amp; Statutory Documents Management
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture learner photo/biometrics and attach birth certificate and transfer letter scans.
                  </p>
                </div>

                {/* Biometric Capture Simulation Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBiometricCaptured
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {isBiometricCaptured ? '✓ Biometric Verification Verified' : 'Biometric Fingerprint & Portrait Scan'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isBiometricCaptured
                          ? 'SHA-256 fingerprint hash verified and cryptographically stamped.'
                          : 'Scan learner right index fingerprint and photo for MoE identity clearance.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBiometricCaptured(!isBiometricCaptured)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      isBiometricCaptured
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    }`}
                  >
                    {isBiometricCaptured ? 'Biometrics Captured ✓' : 'Scan Biometrics Now'}
                  </button>
                </div>

                {/* Document Attachments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <label className="text-xs font-bold text-slate-800 block">
                      Birth Certificate Scan (P9.6.1)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">Upload official certified copy (PDF/JPG)</p>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadedBirthCertName(file.name);
                      }}
                      className="text-xs text-slate-600"
                    />
                    {uploadedBirthCertName && (
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">
                        ✓ Attached: {uploadedBirthCertName}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <label className="text-xs font-bold text-slate-800 block">
                      Transfer Letter / NEMIS Release (P9.6.3)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">Required if transferring from another school</p>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadedTransferLetterName(file.name);
                      }}
                      className="text-xs text-slate-600"
                    />
                    {uploadedTransferLetterName && (
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">
                        ✓ Attached: {uploadedTransferLetterName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-2">
                    Registration Summary Verification
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Learner:</span>
                      <span className="font-bold text-slate-900">
                        {firstName} {lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Adm No:</span>
                      <span className="font-bold font-mono text-blue-700">{admNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Placement:</span>
                      <span className="font-bold text-purple-700">
                        {enrolledGrade} {enrolledStream}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Guardian:</span>
                      <span className="font-bold text-slate-900">{fatherName || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between max-w-4xl mx-auto">
              <button
                type="button"
                onClick={handleStepBack}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentStep === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    Continue to Step {currentStep + 1}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteRegistration('DRAFT')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save as Draft (P9.1.7)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteRegistration('SUBMITTED')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Submit for Registrar Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteRegistration('ENROLLED')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Instant Direct Enroll (Admin)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REGISTRATION APPROVAL PIPELINE (P9.1.7)                                */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: 'ALL', label: 'All Registered' },
                { key: 'DRAFT', label: 'Drafts' },
                { key: 'SUBMITTED', label: 'Submitted (Pending Bio)' },
                { key: 'BIOMETRICS_VERIFIED', label: 'Biometrics Verified' },
                { key: 'REGISTRAR_APPROVED', label: 'Registrar Approved' },
                { key: 'ENROLLED', label: 'Enrolled on Roll' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPipelineFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    pipelineFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, Adm or UPI..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Registration Dossiers Workflow Pipeline ({filteredDossiers.length} Records)
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDossiers.map((dossier) => (
                <div key={dossier.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0">
                      {dossier.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {dossier.firstName} {dossier.middleName ? `${dossier.middleName} ` : ''}{dossier.lastName}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            dossier.registrationStatus === 'ENROLLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dossier.registrationStatus === 'REGISTRAR_APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : dossier.registrationStatus === 'BIOMETRICS_VERIFIED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {dossier.registrationStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="font-mono text-slate-700 font-bold">
                          Adm: {dossier.admissionNumber}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">UPI: {dossier.upiNumber}</span>
                        <span>•</span>
                        <span className="text-purple-700 font-bold">
                          {dossier.academicPlacement.enrolledGrade} ({dossier.academicPlacement.enrolledStream})
                        </span>
                        <span>•</span>
                        <span>Age: {dossier.calculatedAge} yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage transition controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {dossier.registrationStatus === 'DRAFT' && (
                      <button
                        onClick={() => handleUpdateWorkflowStatus(dossier, 'SUBMITTED')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        Submit Dossier <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {dossier.registrationStatus === 'SUBMITTED' && (
                      <button
                        onClick={() => handleUpdateWorkflowStatus(dossier, 'BIOMETRICS_VERIFIED')}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Fingerprint className="w-3 h-3" /> Verify Biometrics
                      </button>
                    )}

                    {dossier.registrationStatus === 'BIOMETRICS_VERIFIED' && (
                      <button
                        onClick={() => handleUpdateWorkflowStatus(dossier, 'REGISTRAR_APPROVED')}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3" /> Approve by Registrar
                      </button>
                    )}

                    {dossier.registrationStatus === 'REGISTRAR_APPROVED' && (
                      <button
                        onClick={() => handleUpdateWorkflowStatus(dossier, 'ENROLLED')}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Enroll to Roll
                      </button>
                    )}

                    {dossier.registrationStatus === 'ENROLLED' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Enrolled &amp; Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADMISSION & UPI CONFIGURATION ENGINE (P9.1.2 & P9.1.3)                 */}
      {/* ========================================================================= */}
      {activeWorkflowTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              P9.1.2: Admission Number &amp; UPI Number Sequencing Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure automatic sequential admission numbering formats, collision safety, and year stamps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700">School Prefix</label>
              <input
                type="text"
                value={admissionConfig.prefix}
                onChange={(e) =>
                  onUpdateAdmissionConfig({
                    ...admissionConfig,
                    prefix: e.target.value.toUpperCase(),
                    samplePreview: generateNextAdmissionNumber({
                      ...admissionConfig,
                      prefix: e.target.value.toUpperCase(),
                    }),
                  })
                }
                className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Delimiter / Separator</label>
              <input
                type="text"
                value={admissionConfig.separator}
                onChange={(e) =>
                  onUpdateAdmissionConfig({
                    ...admissionConfig,
                    separator: e.target.value,
                    samplePreview: generateNextAdmissionNumber({
                      ...admissionConfig,
                      separator: e.target.value,
                    }),
                  })
                }
                className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Current Next Sequence Number</label>
              <input
                type="number"
                value={admissionConfig.currentSequence}
                onChange={(e) => {
                  const seq = parseInt(e.target.value) || 1;
                  onUpdateAdmissionConfig({
                    ...admissionConfig,
                    currentSequence: seq,
                    samplePreview: generateNextAdmissionNumber({
                      ...admissionConfig,
                      currentSequence: seq,
                    }),
                  });
                }}
                className="mt-1 w-full px-3 py-2 bg-white rounded-xl text-xs border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Live Generated Admission Number Preview
              </span>
              <div className="text-base font-mono font-black text-blue-900 mt-0.5">
                {admissionConfig.samplePreview}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLogAudit?.(
                  'ADMISSION_CONFIG_UPDATED',
                  `Updated admission number generator pattern to: ${admissionConfig.samplePreview}.`
                );
                setSuccessMessage('✓ Admission sequence configuration saved successfully!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-xs cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
