import { LearnerEnrollmentStatus, BloodGroup } from './learnerWelfare';

export type RegistrationApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'BIOMETRICS_VERIFIED'
  | 'REGISTRAR_APPROVED'
  | 'ENROLLED'
  | 'REJECTED';

export type RegistrationWorkflowStatus = RegistrationApprovalStatus;

export type NationalityCategory =
  | 'Kenyan Citizen'
  | 'East African Community'
  | 'Foreign Expatriate / Resident'
  | 'Refugee / Special Pass';

export type PathwayTrack =
  | 'STEM (Science, Tech, Eng, Math)'
  | 'Social Sciences & Humanities'
  | 'Arts & Sports Science'
  | 'General Junior Foundation (G7/G8)';

export type CommunicationChannel = 'SMS' | 'WhatsApp' | 'Email' | 'Portal' | 'Hardcopy Letter';

export type DocumentType =
  | 'BIRTH_CERTIFICATE'
  | 'PASSPORT_OR_NATIONAL_ID'
  | 'NEMIS_TRANSFER_LETTER'
  | 'PREVIOUS_ASSESSMENT_TRANSCRIPT'
  | 'IMMUNIZATION_CARD'
  | 'MEDICAL_CLEARANCE_REPORT'
  | 'SPECIAL_NEEDS_ASSESSMENT'
  | 'PARENT_ID_SCAN';

export type DocumentCategory =
  | 'Statutory & Civil'
  | 'Academic & Transcripts'
  | 'Medical & Health'
  | 'Identification & Legal'
  | 'Photographs & Biometrics';

export type DocumentVerificationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED' | 'EXPIRED' | 'Verified' | 'Pending Review' | 'Rejected';

export interface LearnerDocumentItem {
  id: string;
  learnerId?: string;
  documentType?: DocumentType | string;
  documentTitle: string;
  documentCategory?: DocumentCategory | string;
  fileName: string;
  fileSize?: string;
  fileSizeBytes?: number;
  fileFormat?: string;
  uploadDate?: string;
  uploadedAt?: string;
  uploadedBy: string;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verifiedByStaffName?: string;
  verifiedDate?: string;
  documentNumber?: string;
  expiryDate?: string;
  notes?: string;
  fileUrl?: string;
  isMandatory?: boolean;
  checksumSha256?: string;
}

export type LearnerDocumentRecord = LearnerDocumentItem;

export interface ParentGuardianProfile {
  id: string;
  learnerId: string;
  relationship: 'Father' | 'Mother' | 'Legal Guardian' | 'Foster Parent' | 'Sponsor' | 'Next of Kin';
  fullName: string;
  nationalIdNumber: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber?: string;
  emailAddress?: string;
  occupation: string;
  employer?: string;
  residentialAddress: string;
  county: string;
  subCounty: string;
  isPrimaryContact: boolean;
  emergencyPriorityOrder: 1 | 2 | 3;
  authorizedForPickup: boolean;
  legalCustodyHolder: boolean;
  parentPortalAccessCode: string;
  portalAccountActivated: boolean;
  preferredCommunicationChannel: CommunicationChannel;
  preferredLanguage: 'English' | 'Kiswahili' | 'Both';
  isVerified: boolean;
  verifiedDate?: string;
}

export interface EmergencyMedicalContact {
  contactName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  preferredHospital: string;
  physicianName?: string;
  physicianPhone?: string;
  insuranceProvider?: string; // e.g. SHA / NHIF / Britam
  insurancePolicyNumber?: string;
}

export type SpecialNeedCategory =
  | 'Visual Impairment'
  | 'Hearing Impairment'
  | 'Physical / Mobility'
  | 'Speech & Language'
  | 'Dyslexia / Learning Difference'
  | 'ADHD'
  | 'Autism Spectrum'
  | 'Gifted & Talented'
  | 'None';

export interface MedicalConditionEntry {
  id?: string;
  conditionName: string;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  severityLevel?: 'Mild' | 'Moderate' | 'Severe' | 'Critical' | string;
  diagnosedYear?: string;
  emergencyActionPlan?: string;
  managementPlan?: string;
  managementProtocol?: string;
  requiresCampusInhalerOrKit?: boolean;
}

export interface MedicalHealthDossier {
  learnerId?: string;
  bloodGroup: BloodGroup | string;
  rhesusFactor?: 'Positive (+)' | 'Negative (-)' | 'Unknown';
  fitForPhysicalEducation?: boolean;
  knownAllergies?: string[];
  dietaryRestrictions?: string[];
  medicalConditions?: MedicalConditionEntry[];
  hasSpecialNeeds?: boolean;
  specialNeedCategory?: SpecialNeedCategory | string;
  specialNeedAccommodations?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  shaMemberNumber?: string;
  primaryDoctorName?: string;
  primaryDoctorPhone?: string;
  preferredHospital?: string;
  emergencyHospitalPhone?: string;
  allergies?: Array<{
    category: 'Food' | 'Medication' | 'Environmental' | 'Insect';
    allergen: string;
    severity: 'Mild' | 'Moderate' | 'Severe / Anaphylactic';
    reactionDetails: string;
  }>;
  chronicConditions?: Array<{
    conditionName: string;
    diagnosedYear?: string;
    managementProtocol: string;
    requiresCampusInhalerOrKit: boolean;
  }>;
  regularMedications?: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    administeredOnCampus: boolean;
    authorizedByParent: boolean;
  }>;
  disabilityAndAccommodations?: {
    hasDisability: boolean;
    disabilityType?: 'Visual' | 'Hearing' | 'Physical / Mobility' | 'Speech' | 'None';
    specialNeedsCategory?: 'Dyslexia' | 'ADHD' | 'Autism Spectrum' | 'Gifted & Talented' | 'None';
    iepRequired: boolean;
    classroomAccommodations: string;
  };
  emergencyMedicalDetails?: EmergencyMedicalContact;
  immunizationUpToDate?: boolean;
  lastHealthCheckupDate?: string;
  medicalClearanceStatus?: 'Cleared for Sports & Physical Activity' | 'Restricted Activity' | 'Pending Review';
  medicalNotes?: string;
}

export interface AcademicPlacementDossier {
  learnerId: string;
  admissionNumber: string;
  upiNumber: string; // NEMIS / KICD UPI
  academicYear: number;
  entryTerm: string;
  enrolledGrade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  enrolledStream: string; // e.g. 'Simba', 'Chui', 'Ndovu'
  classCode: string; // e.g. 'G8 Simba'
  classTeacherId: string;
  classTeacherName: string;
  learningPathway: PathwayTrack;
  enrolledSubjects: Array<{
    subjectCode: string;
    subjectName: string;
    isCore: boolean;
    isElective: boolean;
    assignedTeacher: string;
  }>;
  academicStatus: 'Active & In Good Standing' | 'Academic Support / Remedial' | 'Probationary' | 'On Approved Leave';
  previousSchoolName?: string;
  previousSchoolAdmNo?: string;
  kpseaMeanScore?: number;
  entryAssessmentRemarks?: string;
}

export interface LearnerMasterDossier {
  id: string;
  // P9.1 Registration Information
  admissionNumber: string;
  upiNumber: string;
  assessmentIndexNumber?: string;
  registrationStatus: RegistrationApprovalStatus;
  enrollmentDate: string;
  registeredByStaff: string;
  approvedByRegistrar?: string;
  approvalDate?: string;
  rejectionReason?: string;

  // P9.2 Learner Biodata & Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  calculatedAge: number;
  countyOfBirth: string;
  subCountyOfBirth: string;
  birthPlace: string;
  nationalityCategory: NationalityCategory;
  nationalityCountry: string;
  birthCertificateNumber: string;
  birthCertEntryNumber?: string;
  passportOrAlienId?: string;
  photoUrl?: string;
  avatarInitials: string;
  profileStatus: LearnerEnrollmentStatus;
  statusChangeReason?: string;

  // P9.3 Parents & Guardians
  parentsAndGuardians: ParentGuardianProfile[];

  // P9.4 Academic Placement
  academicPlacement: AcademicPlacementDossier;

  // P9.5 Medical & Health Records
  medicalDossier: MedicalHealthDossier;
  medicalHealthDossier?: MedicalHealthDossier;

  // P9.6 Learner Documents
  documents: LearnerDocumentRecord[];

  // Biometrics & Verification Records
  isBiometricsVerified: boolean;
  biometricVerificationDate?: string;
  tamperProofHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionNumberGenerationConfig {
  prefix: string; // e.g. 'JJSAK'
  separator: string; // e.g. '/'
  includeYear: boolean;
  yearFormat: 'YYYY' | 'YY'; // e.g. '2026' or '26'
  digitLength: number; // e.g. 4 for '0142'
  currentSequence: number;
  samplePreview: string;
}

export interface RegistrationWorkflowStats {
  totalRegistered: number;
  draftsCount: number;
  pendingBiometricsCount: number;
  pendingApprovalCount: number;
  enrolledCount: number;
  rejectedCount: number;
  maleLearnersCount: number;
  femaleLearnersCount: number;
  grade7Count: number;
  grade8Count: number;
  grade9Count: number;
  specialNeedsCount: number;
}
