import {
  Student,
  Assessment,
  Teacher,
  SchoolInfo,
  SchoolProfile,
  SchoolSubscription,
  SchoolTenant,
  User,
  AuditLogEntry,
} from '../types';

export const DEFAULT_TENANT_SCHOOLS: SchoolTenant[] = [
  {
    schoolId: 'sch-ngonyek-001',
    schoolCode: 'NJS-30200',
    schoolName: 'Ngonyek Junior School',
    subdomain: 'ngonyek',
    tenantDomain: 'ngonyek.jjsak.com',
    category: 'JUNIOR',
    schoolType: 'Public',
    educationLevel: 'Junior School (Grade 7 - 9)',
    country: 'Kenya',
    county: 'Trans Nzoia',
    subCounty: 'Kiminini',
    ward: 'Sirende',
    physicalAddress: 'Sirende Ward, Kiminini, Trans Nzoia County',
    postalAddress: 'P.O. Box 450 - 30200, Kitale',
    address: 'P.O. Box 450 - 30200, Kitale, Kiminini Sub-County',
    phone: '+254 722 345 678',
    email: 'info@ngonyekjuniorschool.sc.ke',
    website: 'https://www.ngonyekjuniorschool.sc.ke',
    status: 'ACTIVE',
    createdAt: '2024-01-10',
    schoolBranding: {
      themePreset: 'maroon', // School D – Maroon Theme
      primaryColor: '#881337',
      secondaryColor: '#E11D48',
      backgroundColor: '#FFF1F2',
      cardColorStyle: 'clean-white',
      navMenuColorStyle: 'theme-matched',
      headerColorStyle: 'gradient',
      footerColorStyle: 'brand-accent',
      buttonColorStyle: 'brand-primary',
      motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
      vision: 'To be a premier center of holistic CBC junior academic excellence and moral leadership.',
      mission: 'Nurturing innovative, disciplined, and self-reliant learners through competency-based pathways.',
      coreValues: ['Integrity', 'Academic Excellence', 'Diligence', 'Discipline', 'Respect'],
      logoUrl: '',
      stampUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      banners: {
        welcomeBannerText: 'Welcome to Ngonyek Junior School Portal - Striving for Excellence',
        mottoBannerText: 'Smart. Simple. Accurate. Assessment reporting made easy.',
        visionBannerText: 'To be a premier center of holistic CBC junior academic excellence and moral leadership.',
        missionBannerText: 'Nurturing innovative, disciplined, and self-reliant learners through competency-based pathways.',
        bannerStyle: 'gradient',
        showWelcomeBanner: true,
        showMottoBanner: true,
        showVisionBanner: false,
      },
      lastModifiedBy: 'Mrs. J. Barasa (Head of Institution)',
      lastModifiedRole: 'HEAD_OF_INSTITUTION',
      lastModifiedAt: Date.now() - 86400000 * 2,
      isApprovedBySuperAdmin: true,
    },
  },
  {
    schoolId: 'sch-stmarys-004',
    schoolCode: 'SMJ-30210',
    schoolName: "St. Mary's Junior School",
    subdomain: 'stmarys',
    tenantDomain: 'stmarys.jjsak.com',
    category: 'JUNIOR',
    schoolType: 'Faith-Based',
    educationLevel: 'Junior School (Grade 7 - 9)',
    country: 'Kenya',
    county: 'Nairobi',
    subCounty: 'Westlands',
    ward: 'Parklands',
    physicalAddress: 'Msongari, Westlands, Nairobi',
    postalAddress: 'P.O. Box 40562 - 00100, Nairobi',
    address: 'P.O. Box 40562 - 00100, Nairobi',
    phone: '+254 722 889 900',
    email: 'admin@stmarys.sc.ke',
    website: 'https://stmarys.jjsak.com',
    status: 'ACTIVE',
    createdAt: '2024-02-15',
    schoolBranding: {
      themePreset: 'blue',
      primaryColor: '#1E3A8A',
      secondaryColor: '#3B82F6',
      backgroundColor: '#EFF6FF',
      cardColorStyle: 'clean-white',
      navMenuColorStyle: 'theme-matched',
      headerColorStyle: 'gradient',
      footerColorStyle: 'brand-accent',
      buttonColorStyle: 'brand-primary',
      motto: 'Bonitas, Disciplina, Scientia (Goodness, Discipline, Knowledge)',
      vision: 'Developing morally upright and academically distinguished leaders for tomorrow.',
      mission: 'Cultivating holistic junior learners grounded in character, innovation, and global service.',
      coreValues: ['Discipline', 'Integrity', 'Knowledge', 'Humility', 'Excellence'],
      logoUrl: '',
      stampUrl: '',
      banners: {
        welcomeBannerText: "Welcome to St. Mary's Junior School Portal",
        mottoBannerText: 'Bonitas, Disciplina, Scientia',
        visionBannerText: 'Developing morally upright and distinguished leaders.',
        missionBannerText: 'Cultivating holistic junior learners.',
        bannerStyle: 'gradient',
        showWelcomeBanner: true,
        showMottoBanner: true,
        showVisionBanner: false,
      },
      lastModifiedBy: 'Fr. Joseph Mwangi (Head of Institution)',
      lastModifiedRole: 'HEAD_OF_INSTITUTION',
      lastModifiedAt: Date.now() - 86400000 * 3,
      isApprovedBySuperAdmin: true,
    },
  },
  {
    schoolId: 'sch-greenhill-005',
    schoolCode: 'GHJ-30220',
    schoolName: 'Greenhill Junior Academy',
    subdomain: 'greenhill',
    tenantDomain: 'greenhill.jjsak.com',
    category: 'JUNIOR',
    schoolType: 'Private',
    educationLevel: 'Junior School (Grade 7 - 9)',
    country: 'Kenya',
    county: 'Kiambu',
    subCounty: 'Ruiru',
    ward: 'Kibichoi',
    physicalAddress: 'Greenhill Campus, Ruiru-Githunguri Road',
    postalAddress: 'P.O. Box 789 - 00232, Ruiru',
    address: 'P.O. Box 789 - 00232, Ruiru',
    phone: '+254 733 445 566',
    email: 'info@greenhillacademy.sc.ke',
    website: 'https://greenhill.jjsak.com',
    status: 'ACTIVE',
    createdAt: '2024-04-01',
    schoolBranding: {
      themePreset: 'green',
      primaryColor: '#065F46',
      secondaryColor: '#10B981',
      backgroundColor: '#F0FDF4',
      cardColorStyle: 'clean-white',
      navMenuColorStyle: 'theme-matched',
      headerColorStyle: 'gradient',
      footerColorStyle: 'brand-accent',
      buttonColorStyle: 'brand-primary',
      motto: 'Nurturing Innovation and Potential',
      vision: 'Pioneering transformative competence-based junior secondary education in East Africa.',
      mission: 'Empowering future-ready learners with critical thinking, digital literacy, and environmental stewardship.',
      coreValues: ['Innovation', 'Stewardship', 'Inclusivity', 'Hard Work', 'Courage'],
      logoUrl: '',
      stampUrl: '',
      banners: {
        welcomeBannerText: 'Welcome to Greenhill Junior Academy Portal',
        mottoBannerText: 'Nurturing Innovation and Potential',
        visionBannerText: 'Pioneering transformative CBC education.',
        missionBannerText: 'Empowering future-ready learners.',
        bannerStyle: 'gradient',
        showWelcomeBanner: true,
        showMottoBanner: true,
        showVisionBanner: false,
      },
      lastModifiedBy: 'Dr. Evelyn Wekesa (Head of Institution)',
      lastModifiedRole: 'HEAD_OF_INSTITUTION',
      lastModifiedAt: Date.now() - 86400000 * 4,
      isApprovedBySuperAdmin: true,
    },
  },
  {
    schoolId: 'sch-kitale-002',
    schoolCode: 'KAC-30201',
    schoolName: 'Kitale Comprehensive Academy',
    category: 'MIXED',
    schoolType: 'Private',
    educationLevel: 'Comprehensive Primary & Junior School',
    country: 'Kenya',
    county: 'Trans Nzoia',
    subCounty: 'Kitale Town',
    ward: 'Hospital',
    physicalAddress: 'Kitale Town Center, Trans Nzoia',
    postalAddress: 'P.O. Box 112 - 30200, Kitale Town',
    address: 'P.O. Box 112 - 30200, Kitale Town',
    phone: '+254 711 987 654',
    email: 'admin@kitaleacademy.sc.ke',
    website: 'https://www.kitaleacademy.sc.ke',
    status: 'ACTIVE',
    createdAt: '2024-03-15',
    schoolBranding: {
      themePreset: 'blue', // School A – Blue Theme
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      backgroundColor: '#F0F4FF',
      cardColorStyle: 'clean-white',
      navMenuColorStyle: 'theme-matched',
      headerColorStyle: 'gradient',
      footerColorStyle: 'brand-accent',
      buttonColorStyle: 'brand-primary',
      motto: 'Knowledge is the Light of the World',
      vision: 'Inspiring global standard scholars grounded in technology, sciences, and arts.',
      mission: 'Delivering exceptional learner-centered education with modern pedagogical facilities.',
      coreValues: ['Knowledge', 'Leadership', 'Innovation', 'Honesty', 'Excellence'],
      logoUrl: '',
      stampUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      banners: {
        welcomeBannerText: 'Welcome to Kitale Comprehensive Academy Portal',
        mottoBannerText: 'Knowledge is the Light of the World',
        visionBannerText: 'Inspiring global standard scholars grounded in technology, sciences, and arts.',
        missionBannerText: 'Delivering exceptional learner-centered education with modern pedagogical facilities.',
        bannerStyle: 'gradient',
        showWelcomeBanner: true,
        showMottoBanner: true,
        showVisionBanner: false,
      },
      lastModifiedBy: 'Mr. Patrick Simiyu (Director of Academics)',
      lastModifiedRole: 'DIRECTOR_OF_ACADEMICS',
      lastModifiedAt: Date.now() - 86400000 * 5,
      isApprovedBySuperAdmin: true,
    },
  },
  {
    schoolId: 'sch-chep-003',
    schoolCode: 'CPS-30205',
    schoolName: 'Cheptiret Junior Secondary',
    category: 'JUNIOR',
    schoolType: 'Public',
    educationLevel: 'Junior School (Grade 7 - 9)',
    country: 'Kenya',
    county: 'Uasin Gishu',
    subCounty: 'Kesses',
    ward: 'Cheptiret',
    physicalAddress: 'Cheptiret Center, Eldoret - Nakuru Highway',
    postalAddress: 'P.O. Box 88 - 30205, Cheptiret',
    address: 'P.O. Box 88 - 30205, Cheptiret',
    phone: '+254 733 554 433',
    email: 'contact@cheptiretschool.ac.ke',
    website: 'https://www.cheptiretschool.ac.ke',
    status: 'ACTIVE',
    createdAt: '2024-06-01',
    schoolBranding: {
      themePreset: 'green', // School B – Green Theme
      primaryColor: '#065F46',
      secondaryColor: '#10B981',
      backgroundColor: '#F0FDF4',
      cardColorStyle: 'clean-white',
      navMenuColorStyle: 'theme-matched',
      headerColorStyle: 'gradient',
      footerColorStyle: 'brand-accent',
      buttonColorStyle: 'brand-primary',
      motto: 'Discipline, Hard Work and Integrity',
      vision: 'To nurture all-round junior leaders ready for STEM and creative senior secondary pathways.',
      mission: 'Providing inclusive, high-quality CBC learning in a supportive school environment.',
      coreValues: ['Discipline', 'Integrity', 'Perseverance', 'Community', 'Service'],
      logoUrl: '',
      stampUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      banners: {
        welcomeBannerText: 'Welcome to Cheptiret Junior Secondary Portal',
        mottoBannerText: 'Discipline, Hard Work and Integrity',
        visionBannerText: 'To nurture all-round junior leaders ready for STEM and creative senior secondary pathways.',
        missionBannerText: 'Providing inclusive, high-quality CBC learning in a supportive school environment.',
        bannerStyle: 'gradient',
        showWelcomeBanner: true,
        showMottoBanner: true,
        showVisionBanner: false,
      },
      lastModifiedBy: 'Mrs. Florence Kemboi (Headteacher)',
      lastModifiedRole: 'HEAD_OF_INSTITUTION',
      lastModifiedAt: Date.now() - 86400000 * 10,
      isApprovedBySuperAdmin: true,
    },
  },
];

export const SubscriptionConfig = {
  APP_NAME: 'JJSAK School Management System',
  APP_OWNER: 'Jotham Barasa Watila',
  OWNER_PHONE: '+254741478813 / +254100559811',
  OWNER_EMAIL: 'jothambarasawatila@gmail.com',
  BANK_NAME: 'National Bank of Kenya',
  BANK_ACCOUNT: '7717901382',
  MPESA_PAYBILL_OR_TILL: '0741478813',
  MPESA_NAME: 'JOTHAM BARASA WATILA',
  PER_LEARNER_ANNUAL_FEE: 60, // KSh 60 per registered learner per year
  TERM_1_PERCENTAGE: 40, // 40% first term
  TERM_2_PERCENTAGE: 40, // 40% second term
  TERM_3_PERCENTAGE: 20, // 20% third term
  SUBSCRIPTION_AMOUNT: '60 / learner / yr',
  SUBSCRIPTION_PERIOD_MONTHS: 12,
  TRIAL_DURATION_DAYS: 120, // 1 School Term (approx 4 months)
};

export const DEFAULT_SUBSCRIPTION: SchoolSubscription = {
  installationDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Installed 30 days ago
  trialEndDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days remaining in 1-term trial
  subscriptionEndDate: null,
  active: true,
  schoolName: 'Ngonyek Junior School',
  paymentReference: '',
  activatedBy: 'Jotham Barasa Watila',
};

export function isSubscriptionValid(
  trialEndDate: number,
  subscriptionEndDate: number | null
): boolean {
  const now = Date.now();
  return now <= trialEndDate || (subscriptionEndDate !== null && now <= subscriptionEndDate);
}

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-001',
    username: 'jotham Watila',
    email: 'jothambarasawatila@gmail.com',
    password: '299991jB@#2026',
    fullName: 'Jotham Barasa Watila',
    role: 'SYSTEM_ADMIN',
    designation: 'Platform Owner & Super Administrator',
    phoneNumber: '+254741478813 / +254100559811',
    active: true,
    mfaEnabled: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-002',
    schoolId: 'sch-ngonyek-001',
    username: 'headteacher',
    email: 'head@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Mrs. J. Barasa',
    role: 'HEAD',
    employeeNumber: 'TSC-192834',
    phoneNumber: '+254 711 223 344',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-003',
    schoolId: 'sch-ngonyek-001',
    username: 'deputy',
    email: 'deputy@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Mr. O. Kinyanjui',
    role: 'DEPUTY',
    employeeNumber: 'TSC-382910',
    phoneNumber: '+254 720 112 233',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-004',
    schoolId: 'sch-ngonyek-001',
    username: 'academics',
    email: 'academics@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Mr. P. Otieno',
    role: 'DIRECTOR_ACADEMICS',
    employeeNumber: 'TSC-518290',
    phoneNumber: '+254 725 889 900',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-005',
    schoolId: 'sch-ngonyek-001',
    username: 'teacher',
    email: 'teacher@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Ms. C. Wanjiru',
    role: 'TEACHER',
    employeeNumber: 'TSC-729104',
    phoneNumber: '+254 733 445 566',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-006',
    schoolId: 'sch-ngonyek-001',
    username: 'finance',
    email: 'finance@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Mr. E. Rotich',
    role: 'FINANCE',
    employeeNumber: 'TSC-904128',
    phoneNumber: '+254 712 334 455',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-007',
    schoolId: 'sch-ngonyek-001',
    username: 'parent',
    email: 'parent.wanjiku@gmail.com',
    password: 'Password@2026!',
    fullName: 'Mrs. Grace Wanjiku (Parent)',
    role: 'PARENT',
    parentId: 'p-001a',
    learnerId: 'std-001',
    phoneNumber: '+254 722 998 877',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-008',
    schoolId: 'sch-ngonyek-001',
    username: 'student',
    email: 'student.brian@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Brian Kiprop (G8 South)',
    role: 'STUDENT',
    learnerId: 'std-002',
    admissionNumber: 'ADM-2024-0142',
    phoneNumber: '+254 700 112 233',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-009',
    schoolId: 'sch-ngonyek-001',
    username: 'amina.student',
    email: 'amina.mwangi@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Amina Mwangi (G8 South)',
    role: 'STUDENT',
    learnerId: 'std-001',
    admissionNumber: 'ADM-2024-0156',
    phoneNumber: '+254 711 223 344',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-010',
    schoolId: 'sch-ngonyek-001',
    username: 'unlinked.student',
    email: 'unlinked.learner@ngonyek.sc.ke',
    password: 'Password@2026!',
    fullName: 'Dennis Otieno (Unlinked Account)',
    role: 'STUDENT',
    learnerId: undefined,
    admissionNumber: undefined,
    phoneNumber: '+254 700 999 888',
    active: true,
    activationStatus: 'ACTIVE',
    firstLoginCompleted: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-011',
    schoolId: 'sch-ngonyek-001',
    username: 'sarah.chebet',
    fullName: 'Madam Sarah Chebet',
    email: 'sarah.chebet@ngonyek.sc.ke',
    phoneNumber: '+254 712 555 666',
    role: 'TEACHER',
    designation: 'Class Teacher (Grade 7 North)',
    employeeNumber: 'TSC-881923',
    active: false, // Inactive until first login verification (Policy §1.5)
    activationStatus: 'REGISTERED_FIRST_LOGIN_REQUIRED', // Policy §1.4
    firstLoginCompleted: false,
    tempOtp: '849120',
    otpExpiry: Date.now() + 15 * 60 * 1000,
    failedOtpAttempts: 0,
    resendCount: 0,
    lastResendAt: Date.now() - 3 * 60 * 1000,
  },
  {
    id: 'usr-012',
    schoolId: 'sch-ngonyek-001',
    username: 'kenneth.omondi',
    fullName: 'Mr. Kenneth Omondi',
    email: 'k.omondi@ngonyek.sc.ke',
    phoneNumber: '+254 721 998 776',
    role: 'TEACHER',
    designation: 'Mathematics Teacher (Junior School)',
    employeeNumber: 'TSC-662910',
    active: false, // Inactive until first login verification (Policy §1.5)
    activationStatus: 'REGISTERED_FIRST_LOGIN_REQUIRED', // Policy §1.4
    firstLoginCompleted: false,
    tempOtp: '392174',
    otpExpiry: Date.now() + 15 * 60 * 1000,
    failedOtpAttempts: 0,
    resendCount: 1,
    lastResendAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'usr-sm-01',
    schoolId: 'sch-stmarys-004',
    username: 'stmarys',
    email: 'head@stmarys.sc.ke',
    password: 'Password@2026!',
    fullName: 'Fr. Joseph Mwangi',
    role: 'HEAD',
    employeeNumber: 'TSC-449102',
    phoneNumber: '+254 722 889 900',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-sm-02',
    schoolId: 'sch-stmarys-004',
    username: 'stmarys.teacher',
    email: 'b.mutua@stmarys.sc.ke',
    password: 'Password@2026!',
    fullName: 'Sr. Beatrice Mutua',
    role: 'TEACHER',
    employeeNumber: 'TSC-612984',
    phoneNumber: '+254 722 990 011',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-gh-01',
    schoolId: 'sch-greenhill-005',
    username: 'greenhill',
    email: 'head@greenhill.sc.ke',
    password: 'Password@2026!',
    fullName: 'Dr. Evelyn Wekesa',
    role: 'HEAD',
    employeeNumber: 'TSC-382901',
    phoneNumber: '+254 733 445 566',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'usr-gh-02',
    schoolId: 'sch-greenhill-005',
    username: 'greenhill.teacher',
    email: 'd.njoroge@greenhill.sc.ke',
    password: 'Password@2026!',
    fullName: 'Mr. David Njoroge',
    role: 'TEACHER',
    employeeNumber: 'TSC-551029',
    phoneNumber: '+254 733 881 223',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    schoolId: 'sch-ngonyek-001',
    userId: 'usr-001',
    userName: 'Jotham Barasa Watila',
    userRole: 'SYSTEM_ADMIN',
    actionType: 'LOGIN',
    details: 'System Administrator logged in securely via 2FA verification.',
    timestamp: Date.now() - 3600000 * 2,
    ipAddress: '197.237.12.89',
  },
  {
    id: 'log-002',
    schoolId: 'sch-ngonyek-001',
    userId: 'usr-002',
    userName: 'Mrs. J. Barasa',
    userRole: 'HEAD',
    actionType: 'REPORT_GENERATE',
    details: 'Generated official Term 2 assessment report cards for Grade 8 South.',
    timestamp: Date.now() - 3600000 * 1.5,
    ipAddress: '197.237.12.90',
  },
  {
    id: 'log-003',
    schoolId: 'sch-ngonyek-001',
    userId: 'usr-005',
    userName: 'Ms. C. Wanjiru',
    userRole: 'TEACHER',
    actionType: 'MARKS_SUBMIT',
    details: 'Submitted Pretechnical Studies scores for 38 Grade 7 learners.',
    timestamp: Date.now() - 1800000,
    ipAddress: '197.237.12.94',
  },
];

// JJSAK Password Policy Validation Rule (P1.6)
export function validatePasswordPolicy(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*)');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolId: 'sch-ngonyek-001',
  schoolName: 'Ngonyek Junior School',
  motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
  county: 'Trans Nzoia',
  subCounty: 'Kiminini',
  postalAddress: 'P.O. Box 450 - 30200, Kitale',
  phoneNumber: '+254 722 345 678',
  emailAddress: 'info@ngonyekjuniorschool.sc.ke',
  website: 'www.ngonyekjuniorschool.sc.ke',
  headTeacherName: 'Mrs. J. Barasa',
  schoolLogoUri: '',
  schoolStampUri: '',
  lastUpdated: Date.now(),
};

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  name: 'Ngonyek Junior School',
  motto: 'Smart. Simple. Accurate. Assessment reporting made easy.',
  term: 'Term 2, 2026',
  year: 2026,
  termStartDate: '6th May 2026',
  termEndDate: '1st August 2026',
  headOfInstitution: 'Mrs. J. Barasa',
  headTeacher: 'Mrs. J. Barasa',
  logoInitial: 'NJS',
  nextTermOpenDate: '5th August 2026',
  totalStudents: 256,
  totalClasses: 6,
  totalAssessments: 42,
  avgPerformance: 85,
};

export const HEAD_OF_INSTITUTION_COMMENT_PRESETS = [
  {
    level: 'Exceeding Expectations (EE)',
    comments: [
      'An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.',
      'Excellent competencies demonstrated across all learning areas. Highly commendable attitude and work ethic.',
      'Very impressive academic progress and moral conduct. Maintain this outstanding trajectory next term.',
    ],
  },
  {
    level: 'Meeting Expectations (ME)',
    comments: [
      'Commendable progress made this term. With consistent practice in core learning areas, higher attainment is within reach.',
      'Good overall performance and positive conduct. Encourage extra focus on revision and active classroom engagement.',
      'A satisfactory and steady effort throughout the term. Keep working diligently to exceed key competencies.',
    ],
  },
  {
    level: 'Approaching Expectations (AE)',
    comments: [
      'Has demonstrated potential. Closer guidance, targeted remedial support, and regular home study will yield great improvement.',
      'Encourage greater consistency in daily study habits, active subject revision, and timely completion of tasks.',
    ],
  },
  {
    level: 'Below Expectations (BE)',
    comments: [
      'Requires focused academic remediation, regular parental consultation, and dedicated follow-up on foundational competencies.',
    ],
  },
  {
    level: 'Did Not Sit / Not Assessed (-)',
    comments: [
      '-',
      'Did not sit for term assessments due to authorized absence.',
      'Did not complete assessments this term.',
    ],
  },
];

export const HEAD_TEACHER_COMMENT_PRESETS = HEAD_OF_INSTITUTION_COMMENT_PRESETS;

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    schoolId: 'sch-ngonyek-001',
    admNo: 'ADM-2024-0156',
    name: 'Amina Mwangi',
    grade: 'G8',
    classArm: 'G8 S',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'AM',
    avgScore: 85,
    overallGrade: 'EE2',
    position: '1/3',
    streamPosition: '1/3',
    gradePosition: '2/5',
    streamRank: 1,
    gradeRank: 2,
    attendance: 94,
    classTeacherComment: 'Amina is a dedicated and hardworking student. Consistently exceeding expectations!',
    classTeacherName: 'Mr. O. Kinyanjui',
    headTeacherComment: 'An exemplary term performance! Keep up the outstanding academic discipline, diligence, and leadership.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    parentName: 'Mr. David Mwangi',
    parentPhone: '+254 722 345 678',
    parents: [
      { id: 'p-001a', name: 'Mr. David Mwangi', phoneNumber: '+254 722 345 678', relation: 'Father' },
      { id: 'p-001b', name: 'Mrs. Grace Mwangi', phoneNumber: '+254 733 987 654', relation: 'Mother' },
    ],
    subjects: [
      { subject: 'English', score: 86, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 82, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 88, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Integrated Science', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Social Studies', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'CRE', score: 90, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 79, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Pretechnical Studies', score: 87, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Creative Arts', score: 75, grade: 'EE2', remarks: 'Exceeding Expectations' },
    ],
  },
  {
    id: 'std-002',
    schoolId: 'sch-ngonyek-001',
    admNo: 'ADM-2024-0142',
    name: 'Brian Kiprop',
    grade: 'G8',
    classArm: 'G8 N',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'BK',
    avgScore: 89,
    overallGrade: 'EE2',
    position: '1/2',
    streamPosition: '1/2',
    gradePosition: '1/5',
    streamRank: 1,
    gradeRank: 1,
    attendance: 98,
    classTeacherComment: 'Outstanding leadership and academic consistency throughout the term.',
    classTeacherName: 'Mr. O. Kinyanjui',
    headTeacherComment: 'Very impressive academic progress and moral conduct. Maintain this outstanding trajectory next term.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    parentName: 'Eng. Joseph Kiprop',
    parentPhone: '+254 711 567 890',
    parents: [
      { id: 'p-002a', name: 'Eng. Joseph Kiprop', phoneNumber: '+254 711 567 890', relation: 'Father' },
      { id: 'p-002b', name: 'Dr. Mary Kiprop', phoneNumber: '+254 720 112 233', relation: 'Mother' },
    ],
    subjects: [
      { subject: 'English', score: 92, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 85, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 96, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Integrated Science', score: 90, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Social Studies', score: 86, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'CRE', score: 88, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Pretechnical Studies', score: 91, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Creative Arts', score: 81, grade: 'EE2', remarks: 'Exceeding Expectations' },
    ],
  },
  {
    id: 'std-008',
    admNo: 'ADM-2024-0177',
    name: 'Ryan Mutua',
    grade: 'G8',
    classArm: 'G8 S',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'RM',
    avgScore: 78,
    overallGrade: 'EE2',
    position: '2/3',
    streamPosition: '2/3',
    gradePosition: '3/5',
    streamRank: 2,
    gradeRank: 3,
    attendance: 92,
    classTeacherComment: 'Solid performance across all CBC competency areas with great teamwork in Pretechnical Studies.',
    classTeacherName: 'Mr. O. Kinyanjui',
    headTeacherComment: 'Very impressive academic progress and moral conduct. Maintain this trajectory.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 76, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 75, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Integrated Science', score: 79, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Social Studies', score: 74, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'CRE', score: 82, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 77, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Pretechnical Studies', score: 85, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Creative Arts', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
    ],
  },
  {
    id: 'std-009',
    admNo: 'ADM-2024-0195',
    name: 'Cynthia Nyambura',
    grade: 'G8',
    classArm: 'G8 N',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'CN',
    avgScore: 72,
    overallGrade: 'ME1',
    position: '2/2',
    streamPosition: '2/2',
    gradePosition: '4/5',
    streamRank: 2,
    gradeRank: 4,
    attendance: 95,
    classTeacherComment: 'Shows enthusiasm in languages and arts. Extra focus in mathematics will unlock higher levels.',
    classTeacherName: 'Mr. O. Kinyanjui',
    headTeacherComment: 'Good overall performance and positive conduct. Encourage extra focus on revision.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 76, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 60, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Integrated Science', score: 70, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Social Studies', score: 75, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'CRE', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 68, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Pretechnical Studies', score: 72, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Creative Arts', score: 63, grade: 'ME1', remarks: 'Meeting Expectations' },
    ],
  },
  {
    id: 'std-003',
    admNo: 'ADM-2024-0168',
    name: 'Faith Chebet',
    grade: 'G7',
    classArm: 'G7 S',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'FC',
    avgScore: 87,
    overallGrade: 'EE2',
    position: '1/1',
    streamPosition: '1/1',
    gradePosition: '1/2',
    streamRank: 1,
    gradeRank: 1,
    attendance: 96,
    classTeacherComment: 'A very disciplined student who shows great passion in Sciences and Languages.',
    classTeacherName: 'Ms. C. Wanjiru',
    headTeacherComment: 'Excellent competencies demonstrated across all learning areas. Highly commendable attitude.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 88, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 89, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Integrated Science', score: 88, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Social Studies', score: 83, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'CRE', score: 92, grade: 'EE1', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 82, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Pretechnical Studies', score: 86, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Creative Arts', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
    ],
  },
  {
    id: 'std-004',
    admNo: 'ADM-2024-0189',
    name: 'David Ochieng',
    grade: 'G7',
    classArm: 'G7 N',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'DO',
    avgScore: 68,
    overallGrade: 'ME1',
    position: '1/1',
    streamPosition: '1/1',
    gradePosition: '2/2',
    streamRank: 1,
    gradeRank: 2,
    attendance: 91,
    classTeacherComment: 'Meeting expectations consistently with good potential to exceed in Languages and Science.',
    classTeacherName: 'Ms. C. Wanjiru',
    headTeacherComment: 'Commendable progress made this term. With consistent practice in core learning areas, higher attainment is within reach.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 72, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Kiswahili', score: 68, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Mathematics', score: 62, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Integrated Science', score: 74, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Social Studies', score: 70, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'CRE', score: 75, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 65, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Pretechnical Studies', score: 71, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Creative Arts', score: 56, grade: 'ME2', remarks: 'Meeting Expectations' },
    ],
  },
  {
    id: 'std-005',
    admNo: 'ADM-2024-0205',
    name: 'Kelvin Maina',
    grade: 'G9',
    classArm: 'G9 S',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'KM',
    avgScore: 52,
    overallGrade: 'ME2',
    position: '1/1',
    streamPosition: '1/1',
    gradePosition: '2/2',
    streamRank: 1,
    gradeRank: 2,
    attendance: 89,
    classTeacherComment: 'Meeting expectations across core areas. Regular revision will help improve mathematics.',
    classTeacherName: 'Mr. P. Otieno',
    headTeacherComment: 'A satisfactory and steady effort throughout the term. Keep working diligently to exceed key competencies.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 54, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'Kiswahili', score: 58, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Mathematics', score: 45, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'Integrated Science', score: 54, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'Social Studies', score: 50, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'CRE', score: 60, grade: 'ME1', remarks: 'Meeting Expectations' },
      { subject: 'Agriculture', score: 52, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'Pretechnical Studies', score: 56, grade: 'ME2', remarks: 'Meeting Expectations' },
      { subject: 'Creative Arts', score: 38, grade: 'AE1', remarks: 'Approaching Expectations' },
    ],
  },
  {
    id: 'std-006',
    admNo: 'ADM-2024-0220',
    name: 'Stacey Wanjiku',
    grade: 'G9',
    classArm: 'G9 N',
    term: 'Term 2, 2024',
    year: 2024,
    avatarInitials: 'SW',
    avgScore: 82,
    overallGrade: 'EE2',
    position: '1/1',
    streamPosition: '1/1',
    gradePosition: '1/2',
    streamRank: 1,
    gradeRank: 1,
    attendance: 95,
    classTeacherComment: 'Consistently demonstrating high competencies in Languages, Sciences, and Creative Arts.',
    classTeacherName: 'Mr. P. Otieno',
    headTeacherComment: 'Very impressive academic progress and moral conduct. Maintain this outstanding trajectory next term.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2024',
    subjects: [
      { subject: 'English', score: 84, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Kiswahili', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Mathematics', score: 78, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Integrated Science', score: 86, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Social Studies', score: 82, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'CRE', score: 88, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Agriculture', score: 80, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Pretechnical Studies', score: 85, grade: 'EE2', remarks: 'Exceeding Expectations' },
      { subject: 'Creative Arts', score: 82, grade: 'EE2', remarks: 'Exceeding Expectations' },
    ],
  },
  {
    id: 'std-007',
    admNo: 'ADM-2024-0244',
    name: 'Emmanuel Kiprop',
    grade: 'G8',
    classArm: 'G8 S',
    term: 'Term 2, 2026',
    year: 2026,
    avatarInitials: 'EK',
    avgScore: null,
    overallGrade: '-',
    position: '-',
    streamPosition: '-',
    gradePosition: '-',
    streamRank: null,
    gradeRank: null,
    attendance: 64,
    classTeacherComment: 'Did not sit for term assessments due to medical leave.',
    classTeacherName: 'Mr. O. Kinyanjui',
    headTeacherComment: 'Did not sit for term assessments due to authorized absence.',
    headOfSchoolName: 'Mrs. J. Barasa',
    nextTermDate: '5th August 2026',
    subjects: [
      { subject: 'English', score: null, grade: '-', remarks: '-' },
      { subject: 'Kiswahili', score: null, grade: '-', remarks: '-' },
      { subject: 'Mathematics', score: null, grade: '-', remarks: '-' },
      { subject: 'Integrated Science', score: null, grade: '-', remarks: '-' },
      { subject: 'Social Studies', score: null, grade: '-', remarks: '-' },
      { subject: 'CRE', score: null, grade: '-', remarks: '-' },
      { subject: 'Agriculture', score: null, grade: '-', remarks: '-' },
      { subject: 'Pretechnical Studies', score: null, grade: '-', remarks: '-' },
      { subject: 'Creative Arts', score: null, grade: '-', remarks: '-' },
    ],
  },
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'ass-101',
    name: 'Term 2 Mathematics Test',
    className: 'G8 S',
    term: 'Term 2, 2024',
    subject: 'Mathematics',
    assessmentType: 'Mid Term Exam',
    totalMarks: 100,
    date: '24 May 2024',
    status: 'Completed',
    recordedScoresCount: 32,
    totalStudentsCount: 32,
  },
  {
    id: 'ass-102',
    name: 'Integrated Science CAT 2',
    className: 'G7 S',
    term: 'Term 2, 2024',
    subject: 'Integrated Science',
    assessmentType: 'Continuous Assessment',
    totalMarks: 50,
    date: '18 May 2024',
    status: 'Completed',
    recordedScoresCount: 30,
    totalStudentsCount: 30,
  },
  {
    id: 'ass-103',
    name: 'English Grammar & Composition',
    className: 'G9 N',
    term: 'Term 2, 2024',
    subject: 'English',
    assessmentType: 'Mid Term Exam',
    totalMarks: 100,
    date: '20 May 2024',
    status: 'Completed',
    recordedScoresCount: 34,
    totalStudentsCount: 34,
  },
  {
    id: 'ass-104',
    name: 'End of Term 2 Main Examination',
    className: 'All Classes (G7 N, G7 S, G8 N, G8 S, G9 N, G9 S)',
    term: 'Term 2, 2024',
    subject: 'All Subjects',
    assessmentType: 'End Term Exam',
    totalMarks: 100,
    date: '15 July 2024',
    status: 'Scheduled',
    recordedScoresCount: 0,
    totalStudentsCount: 256,
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-00',
    schoolId: 'sch-ngonyek-001',
    name: 'Mr. Jotham Watila',
    email: 'jotham.watila@ngonyek.ac.ke',
    role: 'Senior Teacher / Pretechnical & Social Studies Lead',
    classes: ['G8 S', 'G8 N', 'G9 S', 'G9 N', 'G7 S', 'G7 N'],
    subjects: ['Social Studies', 'Pretechnical Studies', 'Creative Arts'],
    allocations: [
      { className: 'G8 S', subjects: ['Social Studies', 'Pretechnical Studies'] },
      { className: 'G8 N', subjects: ['Pretechnical Studies', 'Social Studies'] },
      { className: 'G9 S', subjects: ['Social Studies', 'Pretechnical Studies'] },
      { className: 'G9 N', subjects: ['Pretechnical Studies', 'Creative Arts'] },
      { className: 'G7 S', subjects: ['Pretechnical Studies'] },
      { className: 'G7 N', subjects: ['Pretechnical Studies'] },
    ],
    avatarHex: '#C51E28',
    tscNumber: 'TSC-641890',
    staffNumber: 'STF-2022-001',
    nationalId: '28491034',
    gender: 'Male',
    dateOfBirth: '1988-04-12',
    phoneNumber: '+254 741 478 813',
    physicalAddress: 'Kitale - Cherangany Highway, Trans-Nzoia',
    emergencyContact: {
      name: 'Dr. Stella Watila',
      phone: '+254 722 998 877',
      relationship: 'Spouse',
    },
    dateOfEmployment: '2022-01-10',
    designation: 'Senior Teacher',
    department: 'Technical & Applied',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Mrs. J. Barasa (Head of Institution)',
    qualification: 'B.Ed (Arts) - Social Sciences & Pretech',
    academicQualifications: [
      {
        id: 'aq-001',
        degree: 'Bachelor of Education (Arts) - First Class Honours',
        institution: 'Kenyatta University',
        year: 2012,
        gradeOrClass: 'First Class Honours',
        verified: true,
      },
      {
        id: 'aq-002',
        degree: 'Master of Education (Curriculum & Instructional Technology)',
        institution: 'University of Nairobi',
        year: 2021,
        gradeOrClass: 'Distinction',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-001',
        title: 'TSC Registered Professional Educator',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/641890',
        year: 2012,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Pretechnical Studies', 'Social Studies', 'Creative Arts'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [
      {
        id: 'pc-001',
        name: 'KICD CBC Master Facilitator & Assessment Specialist',
        issuer: 'Kenya Institute of Curriculum Development',
        date: '2023-08-15',
        validUntil: '2027-08-15',
        verified: true,
      },
      {
        id: 'pc-002',
        name: 'CEMASTEA STEM Champion & Robotics Lead',
        issuer: 'Centre for Mathematics, Science and Technology Education in Africa',
        date: '2024-03-20',
        verified: true,
      },
    ],
    professionalDevelopmentRecords: [
      {
        id: 'cpd-001',
        moduleName: 'TPD Module 1: Teacher Professionalism & Ethics in CBC',
        provider: 'Mount Kenya University / TSC',
        completionDate: '2023-11-28',
        cpdPoints: 60,
        certificateId: 'TPD-MKU-2023-8841',
      },
      {
        id: 'cpd-002',
        moduleName: 'TPD Module 2: Pedagogical Content Knowledge & CBE Assessment',
        provider: 'Kenyatta University / TSC',
        completionDate: '2024-06-14',
        cpdPoints: 60,
        certificateId: 'TPD-KU-2024-1092',
      },
    ],
    trainingHistory: [
      {
        id: 'th-001',
        workshopTitle: 'National Junior School CBE Assessment Implementation Workshop',
        organizer: 'KNEC / KICD',
        dates: '12-16 Jan 2024',
        venueOrPlatform: 'KEMI Nairobi',
      },
    ],
    supportingDocuments: [
      {
        id: 'doc-001',
        type: 'Passport Photo',
        title: 'Official Passport Photograph (High Res)',
        uploadDate: '2024-01-10',
        verificationStatus: 'Verified',
        verifiedBy: 'Administrator',
      },
      {
        id: 'doc-002',
        type: 'National ID Copy',
        title: 'National Identity Card (Front & Back)',
        uploadDate: '2024-01-10',
        verificationStatus: 'Verified',
        verifiedBy: 'Administrator',
      },
      {
        id: 'doc-003',
        type: 'Academic Certificate',
        title: 'B.Ed Degree Certificate & Transcripts',
        uploadDate: '2024-01-10',
        verificationStatus: 'Verified',
        verifiedBy: 'Administrator',
      },
      {
        id: 'doc-004',
        type: 'Professional Certificate',
        title: 'TSC Permanent Registration Certificate',
        uploadDate: '2024-01-10',
        verificationStatus: 'Verified',
        verifiedBy: 'Administrator',
      },
      {
        id: 'doc-005',
        type: 'Appointment Letter',
        title: 'TSC Senior Teacher Appointment Letter',
        uploadDate: '2023-05-18',
        verificationStatus: 'Verified',
        verifiedBy: 'Board of Management',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-001',
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 26,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 6,
      totalStudentsReached: 184,
      notes: 'Optimal CBE teaching workload with Pretechnical & Social Studies lead responsibility.',
    },
    appraisals: [
      {
        id: 'appr-001',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Exceeding Targets',
        scorePercentage: 94,
        appraiserName: 'Mrs. J. Barasa',
        appraiserRole: 'Head of Institution',
        appraisalDate: '2024-04-05',
        targetsSet: 'Integrate hands-on pretechnical project portfolio and digital tracking for all Grade 8 learners.',
        competencyScores: {
          curriculumDelivery: 19,
          assessmentRubrics: 20,
          learnerProgress: 19,
          ictIntegration: 18,
          professionalEthics: 18,
        },
        recommendations: 'Recommended for Master Teacher / County Lead Facilitator recognition.',
        teacherComments: 'All targets achieved. Grade 8 cohort demonstrated high mastery in design and technical rubrics.',
        status: 'Completed',
      },
    ],
    promotions: [
      {
        id: 'prm-001',
        fromDesignation: 'Teacher II (Job Group K)',
        toDesignation: 'Senior Teacher I (Job Group L)',
        effectiveDate: '2023-05-01',
        approvedBy: 'Teachers Service Commission',
        referenceNumber: 'TSC/PRM/2023/44910',
      },
    ],
    awards: [
      {
        id: 'awd-001',
        awardTitle: 'Outstanding STEM & Pretechnical Educator of the Year',
        awardedBy: 'Trans-Nzoia County Education Board',
        year: 2023,
        category: 'Excellence in CBC Implementation',
        description: 'Recognized for pioneering student practical exhibition in solar circuits and sustainable agriculture models.',
      },
    ],
    employeeNumber: 'EMP-001',
  },
  {
    id: 'tch-01',
    schoolId: 'sch-ngonyek-001',
    name: 'Mr. O. Kinyanjui',
    email: 'kinyanjui@ngonyek.ac.ke',
    role: 'Class Teacher (G8 S) / Mathematics Lead',
    classes: ['G8 S', 'G8 N', 'G7 S', 'G7 N', 'G9 S', 'G9 N'],
    subjects: ['Mathematics', 'Pretechnical Studies'],
    allocations: [
      { className: 'G8 S', subjects: ['Mathematics'] },
      { className: 'G8 N', subjects: ['Mathematics'] },
      { className: 'G7 S', subjects: ['Mathematics'] },
      { className: 'G7 N', subjects: ['Mathematics'] },
      { className: 'G9 S', subjects: ['Mathematics'] },
      { className: 'G9 N', subjects: ['Mathematics'] },
    ],
    avatarHex: '#DC2626',
    tscNumber: 'TSC-553210',
    staffNumber: 'STF-2021-003',
    nationalId: '24190823',
    gender: 'Male',
    dateOfBirth: '1985-09-22',
    phoneNumber: '+254 711 223 344',
    physicalAddress: 'Sirende Ward, Cherangany Sub-County',
    emergencyContact: {
      name: 'Mrs. Anne Kinyanjui',
      phone: '+254 720 112 233',
      relationship: 'Spouse',
    },
    dateOfEmployment: '2021-05-14',
    designation: 'Class Teacher',
    department: 'Mathematics',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Mrs. J. Barasa (Head of Institution)',
    qualification: 'B.Sc (Ed) - Mathematics Specialist',
    academicQualifications: [
      {
        id: 'aq-010',
        degree: 'Bachelor of Science in Education (Mathematics & Physics)',
        institution: 'Egerton University',
        year: 2008,
        gradeOrClass: 'Second Class Honours (Upper)',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-010',
        title: 'TSC Licensed Teacher',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/553210',
        year: 2008,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Mathematics'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [
      {
        id: 'pc-010',
        name: 'KNEC Accredited CBE Mathematics Assessor',
        issuer: 'Kenya National Examinations Council',
        date: '2023-02-10',
        verified: true,
      },
    ],
    professionalDevelopmentRecords: [
      {
        id: 'cpd-010',
        moduleName: 'TPD Module 1: Foundational CBE Assessment Rubrics',
        provider: 'Riara University / TSC',
        completionDate: '2023-12-01',
        cpdPoints: 60,
      },
    ],
    trainingHistory: [
      {
        id: 'th-010',
        workshopTitle: 'Junior School Mathematics Conceptual Diagnostics',
        organizer: 'CEMASTEA',
        dates: '08-11 Aug 2023',
        venueOrPlatform: 'CEMASTEA Karen, Nairobi',
      },
    ],
    supportingDocuments: [
      {
        id: 'doc-011',
        type: 'Passport Photo',
        title: 'Passport Photo',
        uploadDate: '2021-05-14',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-012',
        type: 'National ID Copy',
        title: 'National Identity Card',
        uploadDate: '2021-05-14',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-013',
        type: 'Academic Certificate',
        title: 'Egerton Univ B.Sc Degree',
        uploadDate: '2021-05-14',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-014',
        type: 'Professional Certificate',
        title: 'TSC Registration Certificate',
        uploadDate: '2021-05-14',
        verificationStatus: 'Verified',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-003',
    mfaEnabled: true,
    mfaMethod: 'EMAIL_OTP',
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 24,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 6,
      totalStudentsReached: 184,
    },
    appraisals: [
      {
        id: 'appr-010',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Exceeding Targets',
        scorePercentage: 88,
        appraiserName: 'Mrs. J. Barasa',
        appraiserRole: 'Head of Institution',
        appraisalDate: '2024-04-05',
        targetsSet: 'Maintain pass rate above 75% in Junior School CBE math problem-solving.',
        competencyScores: {
          curriculumDelivery: 18,
          assessmentRubrics: 18,
          learnerProgress: 18,
          ictIntegration: 17,
          professionalEthics: 17,
        },
        recommendations: 'Strong numeracy instructional leadership. Commended.',
        status: 'Completed',
      },
    ],
    employeeNumber: 'EMP-002',
  },
  {
    id: 'tch-02',
    schoolId: 'sch-ngonyek-001',
    name: 'Mrs. J. Barasa',
    email: 'head@ngonyek.ac.ke',
    role: 'Head of School / English Lead',
    classes: ['G7 S', 'G7 N', 'G8 S', 'G8 N', 'G9 S', 'G9 N'],
    subjects: ['English'],
    allocations: [
      { className: 'G7 S', subjects: ['English'] },
      { className: 'G7 N', subjects: ['English'] },
      { className: 'G8 S', subjects: ['English'] },
      { className: 'G8 N', subjects: ['English'] },
      { className: 'G9 S', subjects: ['English'] },
      { className: 'G9 N', subjects: ['English'] },
    ],
    avatarHex: '#B91C1C',
    tscNumber: 'TSC-382910',
    staffNumber: 'STF-2018-001',
    nationalId: '19283401',
    gender: 'Female',
    dateOfBirth: '1976-11-04',
    phoneNumber: '+254 722 345 678',
    physicalAddress: 'Milimani Estate, Kitale',
    emergencyContact: {
      name: 'Mr. David Barasa',
      phone: '+254 711 223 344',
      relationship: 'Spouse',
    },
    dateOfEmployment: '2018-01-08',
    designation: 'Head of Institution',
    department: 'Administration',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Sub-County Director of Education',
    qualification: 'M.Ed (Educational Leadership & English)',
    academicQualifications: [
      {
        id: 'aq-020',
        degree: 'Master of Education (Educational Administration & Planning)',
        institution: 'University of Nairobi',
        year: 2014,
        gradeOrClass: 'Distinction',
        verified: true,
      },
      {
        id: 'aq-021',
        degree: 'Bachelor of Education (Arts - English & Literature)',
        institution: 'Moi University',
        year: 1999,
        gradeOrClass: 'Second Class Honours (Upper)',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-020',
        title: 'TSC Senior Institutional Administrator',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/382910',
        year: 1999,
        status: 'Verified',
      },
      {
        id: 'pq-021',
        title: 'Diploma in Educational Management',
        body: 'Kenya Education Management Institute (KEMI)',
        year: 2016,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['English'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [
      {
        id: 'pc-020',
        name: 'Certified Institutional Leadership Executive',
        issuer: 'KEMI Kenya',
        date: '2019-10-12',
        verified: true,
      },
    ],
    professionalDevelopmentRecords: [
      {
        id: 'cpd-020',
        moduleName: 'TPD Module 1 & 2 Executive Track: Strategic Institutional Governance',
        provider: 'Kenyatta University',
        completionDate: '2024-02-18',
        cpdPoints: 120,
      },
    ],
    trainingHistory: [
      {
        id: 'th-020',
        workshopTitle: 'KEPSHA National Headteachers Annual Conference',
        organizer: 'KEPSHA / MOE',
        dates: '04-08 Nov 2024',
        venueOrPlatform: 'Sheikh Zayed Hall, Mombasa',
      },
    ],
    supportingDocuments: [
      {
        id: 'doc-021',
        type: 'Passport Photo',
        title: 'Official Headteacher Portrait',
        uploadDate: '2018-01-08',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-022',
        type: 'National ID Copy',
        title: 'National Identity Card',
        uploadDate: '2018-01-08',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-023',
        type: 'Academic Certificate',
        title: 'Masters & Bachelors Degree Certificates',
        uploadDate: '2018-01-08',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-024',
        type: 'Appointment Letter',
        title: 'TSC Institutional Head Appointment Letter',
        uploadDate: '2018-01-08',
        verificationStatus: 'Verified',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-002',
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 12,
      standardTarget: 14,
      status: 'Optimal',
      totalClassesAssigned: 6,
      totalStudentsReached: 184,
      notes: 'Reduced teaching load approved for Head of Institution administrative duties.',
    },
    appraisals: [
      {
        id: 'appr-020',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Exceeding Targets',
        scorePercentage: 96,
        appraiserName: 'Dr. K. Rotich',
        appraiserRole: 'Sub-County Director of Education',
        appraisalDate: '2024-04-10',
        targetsSet: 'Timely submission of termly broadsheets and 100% CBC transition rate.',
        competencyScores: {
          curriculumDelivery: 19,
          assessmentRubrics: 20,
          learnerProgress: 19,
          ictIntegration: 19,
          professionalEthics: 19,
        },
        recommendations: 'Exceptional institutional management and high academic standards.',
        status: 'Completed',
      },
    ],
    employeeNumber: 'EMP-003',
  },
  {
    id: 'tch-03',
    schoolId: 'sch-ngonyek-001',
    name: 'Ms. C. Wanjiru',
    email: 'wanjiru@ngonyek.ac.ke',
    role: 'Class Teacher (G7 S) / Science Specialist',
    classes: ['G7 S', 'G7 N', 'G8 S', 'G8 N', 'G9 S', 'G9 N'],
    subjects: ['Integrated Science', 'Agriculture'],
    allocations: [
      { className: 'G7 S', subjects: ['Integrated Science', 'Agriculture'] },
      { className: 'G7 N', subjects: ['Integrated Science', 'Agriculture'] },
      { className: 'G8 S', subjects: ['Integrated Science', 'Agriculture'] },
      { className: 'G8 N', subjects: ['Integrated Science', 'Agriculture'] },
      { className: 'G9 S', subjects: ['Integrated Science', 'Agriculture'] },
      { className: 'G9 N', subjects: ['Integrated Science', 'Agriculture'] },
    ],
    avatarHex: '#991B1B',
    tscNumber: 'TSC-729104',
    staffNumber: 'STF-2022-005',
    nationalId: '31092845',
    gender: 'Female',
    dateOfBirth: '1992-07-19',
    phoneNumber: '+254 733 445 566',
    physicalAddress: 'Cherangany Hills, Trans-Nzoia',
    emergencyContact: {
      name: 'Mr. Joseph Mwangi',
      phone: '+254 722 556 677',
      relationship: 'Father',
    },
    dateOfEmployment: '2022-09-01',
    designation: 'Class Teacher',
    department: 'Sciences',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Mrs. J. Barasa (Head of Institution)',
    qualification: 'B.Ed (Science - Biology & Agriculture)',
    academicQualifications: [
      {
        id: 'aq-030',
        degree: 'Bachelor of Education (Science - Biology & Agriculture)',
        institution: 'Moi University',
        year: 2016,
        gradeOrClass: 'Second Class Honours (Upper)',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-030',
        title: 'TSC Registered Teacher',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/729104',
        year: 2016,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Integrated Science', 'Agriculture'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [
      {
        id: 'pc-030',
        name: 'CEMASTEA Hands-on Science Experiments Certification',
        issuer: 'CEMASTEA',
        date: '2023-09-22',
        verified: true,
      },
    ],
    professionalDevelopmentRecords: [
      {
        id: 'cpd-030',
        moduleName: 'TPD Module 1: Comprehensive Science Inquiry Learning',
        provider: 'Mount Kenya University',
        completionDate: '2024-01-15',
        cpdPoints: 60,
      },
    ],
    trainingHistory: [],
    supportingDocuments: [
      {
        id: 'doc-031',
        type: 'Passport Photo',
        title: 'Passport Photo',
        uploadDate: '2022-09-01',
        verificationStatus: 'Verified',
      },
      {
        id: 'doc-032',
        type: 'National ID Copy',
        title: 'National Identity Card',
        uploadDate: '2022-09-01',
        verificationStatus: 'Verified',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-005',
    mfaEnabled: true,
    mfaMethod: 'SMS_OTP',
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 26,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 6,
      totalStudentsReached: 184,
    },
    appraisals: [
      {
        id: 'appr-030',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Exceeding Targets',
        scorePercentage: 86,
        appraiserName: 'Mrs. J. Barasa',
        appraiserRole: 'Head of Institution',
        appraisalDate: '2024-04-05',
        targetsSet: 'Establish school kitchen garden project for Agriculture assessment.',
        competencyScores: {
          curriculumDelivery: 18,
          assessmentRubrics: 17,
          learnerProgress: 17,
          ictIntegration: 17,
          professionalEthics: 17,
        },
        recommendations: 'Good practical learner involvement in agricultural science.',
        status: 'Completed',
      },
    ],
    employeeNumber: 'EMP-004',
  },
  {
    id: 'tch-04',
    schoolId: 'sch-ngonyek-001',
    name: 'Mr. P. Otieno',
    email: 'otieno@ngonyek.ac.ke',
    role: 'Class Teacher (G9 S) / Humanities Lead',
    classes: ['G7 S', 'G7 N', 'G8 S', 'G8 N', 'G9 S', 'G9 N'],
    subjects: ['Kiswahili', 'Social Studies', 'CRE'],
    allocations: [
      { className: 'G7 S', subjects: ['Kiswahili', 'Social Studies', 'CRE'] },
      { className: 'G7 N', subjects: ['Kiswahili', 'Social Studies', 'CRE'] },
      { className: 'G8 S', subjects: ['Kiswahili', 'CRE'] },
      { className: 'G8 N', subjects: ['Kiswahili', 'CRE'] },
      { className: 'G9 S', subjects: ['Kiswahili', 'CRE'] },
      { className: 'G9 N', subjects: ['Kiswahili', 'CRE', 'Social Studies'] },
    ],
    avatarHex: '#E11D48',
    tscNumber: 'TSC-819203',
    staffNumber: 'STF-2023-008',
    nationalId: '32910482',
    gender: 'Male',
    dateOfBirth: '1990-03-15',
    phoneNumber: '+254 720 987 654',
    physicalAddress: 'Kitale Town, Trans-Nzoia',
    emergencyContact: {
      name: 'Ms. Grace Otieno',
      phone: '+254 712 334 455',
      relationship: 'Sister',
    },
    dateOfEmployment: '2023-01-09',
    designation: 'Class Teacher',
    department: 'Humanities',
    employmentStatus: 'Permanent & Pensionable',
    reportingOfficer: 'Mrs. J. Barasa (Head of Institution)',
    qualification: 'B.Ed (Kiswahili & Religious Education)',
    academicQualifications: [
      {
        id: 'aq-040',
        degree: 'Bachelor of Education (Arts - Kiswahili & CRE)',
        institution: 'Maseno University',
        year: 2015,
        gradeOrClass: 'Second Class Honours (Upper)',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-040',
        title: 'TSC Registered Teacher',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/819203',
        year: 2015,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Kiswahili', 'CRE', 'Social Studies'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [],
    professionalDevelopmentRecords: [
      {
        id: 'cpd-040',
        moduleName: 'TPD Module 1: CBC Competencies & Language Development',
        provider: 'Kenyatta University',
        completionDate: '2023-10-30',
        cpdPoints: 60,
      },
    ],
    trainingHistory: [],
    supportingDocuments: [
      {
        id: 'doc-041',
        type: 'Passport Photo',
        title: 'Passport Photo',
        uploadDate: '2023-01-09',
        verificationStatus: 'Verified',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-004',
    mfaEnabled: false,
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 25,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 6,
      totalStudentsReached: 184,
    },
    appraisals: [
      {
        id: 'appr-040',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Meeting Targets',
        scorePercentage: 84,
        appraiserName: 'Mrs. J. Barasa',
        appraiserRole: 'Head of Institution',
        appraisalDate: '2024-04-05',
        targetsSet: 'Enhance Kiswahili spoken fluency and creative writing competencies in Grade 8.',
        competencyScores: {
          curriculumDelivery: 17,
          assessmentRubrics: 17,
          learnerProgress: 17,
          ictIntegration: 16,
          professionalEthics: 17,
        },
        recommendations: 'Consistent effort. Encourage participation in county Kiswahili symposiums.',
        status: 'Completed',
      },
    ],
    employeeNumber: 'EMP-005',
  },
  {
    id: 'tch-05',
    schoolId: 'sch-ngonyek-001',
    name: 'Madam E. Achieng',
    email: 'achieng@ngonyek.ac.ke',
    role: 'Creative Arts & Music Coordinator',
    classes: ['G7 S', 'G7 N', 'G8 S', 'G8 N', 'G9 S'],
    subjects: ['Creative Arts'],
    allocations: [
      { className: 'G7 S', subjects: ['Creative Arts'] },
      { className: 'G7 N', subjects: ['Creative Arts'] },
      { className: 'G8 S', subjects: ['Creative Arts'] },
      { className: 'G8 N', subjects: ['Creative Arts'] },
      { className: 'G9 S', subjects: ['Creative Arts'] },
    ],
    avatarHex: '#C026D3',
    tscNumber: 'TSC-945120',
    staffNumber: 'STF-2023-011',
    nationalId: '34819203',
    gender: 'Female',
    dateOfBirth: '1995-12-08',
    phoneNumber: '+254 715 654 321',
    physicalAddress: 'Cherangany, Trans-Nzoia',
    emergencyContact: {
      name: 'Mr. Peter Achieng',
      phone: '+254 722 889 900',
      relationship: 'Brother',
    },
    dateOfEmployment: '2023-05-02',
    designation: 'Teacher',
    department: 'Creative Arts & Sports',
    employmentStatus: 'Contract',
    reportingOfficer: 'Mrs. J. Barasa (Head of Institution)',
    qualification: 'Diploma in Education (Creative & Performing Arts)',
    academicQualifications: [
      {
        id: 'aq-050',
        degree: 'Diploma in Teacher Education (Music & Fine Arts)',
        institution: 'Kagumo Teachers Training College',
        year: 2018,
        gradeOrClass: 'Credit',
        verified: true,
      },
    ],
    professionalQualifications: [
      {
        id: 'pq-050',
        title: 'TSC Registered Educator',
        body: 'Teachers Service Commission Kenya',
        regNumber: 'TSC/945120',
        year: 2018,
        status: 'Verified',
      },
    ],
    teachingSubjects: ['Creative Arts'],
    teachingLevels: ['Grade 7', 'Grade 8', 'Grade 9'],
    professionalCertifications: [
      {
        id: 'pc-050',
        name: 'National Drama & Music Festival Adjudicator Accredited',
        issuer: 'Ministry of Education Kenya',
        date: '2023-06-18',
        verified: true,
      },
    ],
    professionalDevelopmentRecords: [],
    trainingHistory: [],
    supportingDocuments: [
      {
        id: 'doc-051',
        type: 'Passport Photo',
        title: 'Passport Photo',
        uploadDate: '2023-05-02',
        verificationStatus: 'Verified',
      },
    ],
    accountStatus: 'ACTIVE',
    userId: 'usr-006',
    mfaEnabled: false,
    passwordCreated: true,
    active: true,
    workload: {
      lessonsPerWeek: 20,
      standardTarget: 27,
      status: 'Optimal',
      totalClassesAssigned: 5,
      totalStudentsReached: 154,
    },
    appraisals: [
      {
        id: 'appr-050',
        term: 'Term 1',
        year: 2024,
        overallRating: 'Meeting Targets',
        scorePercentage: 85,
        appraiserName: 'Mrs. J. Barasa',
        appraiserRole: 'Head of Institution',
        appraisalDate: '2024-04-05',
        targetsSet: 'Prepare school choir and visual arts portfolio for County Competitions.',
        competencyScores: {
          curriculumDelivery: 17,
          assessmentRubrics: 17,
          learnerProgress: 17,
          ictIntegration: 17,
          professionalEthics: 17,
        },
        recommendations: 'Excellent student creative display and practical arts portfolio.',
        status: 'Completed',
      },
    ],
    employeeNumber: 'EMP-006',
  },
];

export const AVAILABLE_GRADES = [
  'G7',
  'G8',
  'G9',
];

export const AVAILABLE_CLASSES = [
  'G7 N',
  'G7 S',
  'G8 N',
  'G8 S',
  'G9 N',
  'G9 S',
];

export const AVAILABLE_YEARS = [
  2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
];

export function getAvailableTermsForYear(year: number): string[] {
  return [
    `Term 1, ${year}`,
    `Term 2, ${year}`,
    `Term 3, ${year}`,
  ];
}

export function getDefaultNextTermDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `5th August ${year}`;
  } else if (termName.includes('Term 2')) {
    return `6th January ${year + 1}`;
  } else if (termName.includes('Term 3')) {
    return `4th May ${year + 1}`;
  }
  return `5th August ${year}`;
}

export function getDefaultTermOpeningDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `6th January ${year}`;
  } else if (termName.includes('Term 2')) {
    return `6th May ${year}`;
  } else if (termName.includes('Term 3')) {
    return `2nd September ${year}`;
  }
  return `6th May ${year}`;
}

export function getDefaultTermClosingDate(termName: string, year: number): string {
  if (termName.includes('Term 1')) {
    return `4th April ${year}`;
  } else if (termName.includes('Term 2')) {
    return `1st August ${year}`;
  } else if (termName.includes('Term 3')) {
    return `28th November ${year}`;
  }
  return `1st August ${year}`;
}

export const AVAILABLE_TERMS = [
  'Term 1, 2026',
  'Term 2, 2026',
  'Term 3, 2026',
  'Term 1, 2027',
  'Term 2, 2027',
  'Term 3, 2027',
  'Term 1, 2028',
  'Term 2, 2028',
  'Term 3, 2028',
  'Term 1, 2029',
  'Term 2, 2029',
  'Term 3, 2029',
  'Term 1, 2030',
  'Term 2, 2030',
  'Term 3, 2030',
];

export const AVAILABLE_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Integrated Science',
  'Social Studies',
  'CRE',
  'Agriculture',
  'Pretechnical Studies',
  'Creative Arts',
];

export const AVAILABLE_ASSESSMENT_TYPES = [
  'Opener Exam',
  'Continuous Assessment (CAT)',
  'Mid Term Exam',
  'End Term Exam',
  'Practical / Project',
];

export interface GradeBand {
  min: number;
  max: number;
  grade: string;
  level: string;
  remarks: string;
}

export const CBC_GRADING_SCHEME: GradeBand[] = [
  { min: 90, max: 100, grade: 'EE1', level: 'Exceeding Expectations 1', remarks: 'Exceeding Expectations' },
  { min: 75, max: 89, grade: 'EE2', level: 'Exceeding Expectations 2', remarks: 'Exceeding Expectations' },
  { min: 58, max: 74, grade: 'ME1', level: 'Meeting Expectations 1', remarks: 'Meeting Expectations' },
  { min: 41, max: 57, grade: 'ME2', level: 'Meeting Expectations 2', remarks: 'Meeting Expectations' },
  { min: 31, max: 40, grade: 'AE1', level: 'Approaching Expectations 1', remarks: 'Approaching Expectations' },
  { min: 21, max: 30, grade: 'AE2', level: 'Approaching Expectations 2', remarks: 'Approaching Expectations' },
  { min: 11, max: 20, grade: 'BE1', level: 'Below Expectations 1', remarks: 'Below Expectations' },
  { min: 0, max: 10, grade: 'BE2', level: 'Below Expectations 2', remarks: 'Below Expectations' },
];

export function calculateGrade(score: number | null | undefined | string): { grade: string; remarks: string; level: string } {
  if (score === null || score === undefined || score === '' || score === '-') {
    return { grade: '-', remarks: '-', level: '-' };
  }
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  if (isNaN(numScore) || numScore < 0) {
    return { grade: '-', remarks: '-', level: '-' };
  }
  if (numScore >= 90) return { grade: 'EE1', remarks: 'Exceeding Expectations', level: 'Exceeding Expectations 1' };
  if (numScore >= 75) return { grade: 'EE2', remarks: 'Exceeding Expectations', level: 'Exceeding Expectations 2' };
  if (numScore >= 58) return { grade: 'ME1', remarks: 'Meeting Expectations', level: 'Meeting Expectations 1' };
  if (numScore >= 41) return { grade: 'ME2', remarks: 'Meeting Expectations', level: 'Meeting Expectations 2' };
  if (numScore >= 31) return { grade: 'AE1', remarks: 'Approaching Expectations', level: 'Approaching Expectations 1' };
  if (numScore >= 21) return { grade: 'AE2', remarks: 'Approaching Expectations', level: 'Approaching Expectations 2' };
  if (numScore >= 11) return { grade: 'BE1', remarks: 'Below Expectations', level: 'Below Expectations 1' };
  return { grade: 'BE2', remarks: 'Below Expectations', level: 'Below Expectations 2' };
}

export function calculateStudentAverage(subjects: { score: number | null | undefined }[]): {
  avgScore: number | null;
  overallGrade: string;
} {
  const assessed = subjects.filter(
    (s) => s.score !== null && s.score !== undefined && !isNaN(s.score) && s.score >= 0
  );
  if (assessed.length === 0) {
    return { avgScore: null, overallGrade: '-' };
  }
  const total = assessed.reduce((sum, item) => sum + (item.score as number), 0);
  const avg = Math.round(total / assessed.length);
  const { grade } = calculateGrade(avg);
  return { avgScore: avg, overallGrade: grade };
}

export const POPULAR_SCORE_BASES = [
  { value: 100, label: '/100 (Standard %)', shortLabel: '/100' },
  { value: 80, label: '/80 (End Term)', shortLabel: '/80' },
  { value: 50, label: '/50 (Midterm / Paper)', shortLabel: '/50' },
  { value: 30, label: '/30 (CAT / Project)', shortLabel: '/30' },
];

/**
 * Converts a raw score out of a given base into a percentage out of 100.
 * Examples:
 *  - 25 out of 30 => 83%
 *  - 33 out of 50 => 66%
 *  - 10 out of 50 => 20%
 *  - 64 out of 80 => 80%
 *  - 75 out of 100 => 75%
 */
export function convertRawScoreToPercentage(
  rawScore: number | string | null | undefined,
  outOf: number | string = 100
): number | null {
  if (rawScore === null || rawScore === undefined || rawScore === '' || rawScore === '-') {
    return null;
  }
  const raw = typeof rawScore === 'string' ? parseFloat(rawScore) : rawScore;
  const max = typeof outOf === 'string' ? parseFloat(outOf) : outOf;
  if (isNaN(raw) || isNaN(max) || max <= 0 || raw < 0) {
    return null;
  }
  const pct = (raw / max) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/**
 * Parses user input which can be:
 * - A single number: e.g. "75" -> raw: 75, outOf: 100, percentage: 75
 * - A fraction string: e.g. "33/50" -> raw: 33, outOf: 50, percentage: 66
 * - "25/30" -> raw: 25, outOf: 30, percentage: 83
 * - "64/80" -> raw: 64, outOf: 80, percentage: 80
 * - "10/50" -> raw: 10, outOf: 50, percentage: 20
 */
export function parseScoreString(
  input: string | number | null | undefined,
  defaultOutOf: number = 100
): {
  raw: number | null;
  outOf: number;
  percentage: number | null;
  isFraction: boolean;
} {
  if (input === null || input === undefined || input === '' || input === '-') {
    return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
  }

  if (typeof input === 'number') {
    if (isNaN(input) || input < 0) {
      return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
    }
    const pct = defaultOutOf === 100 ? Math.min(100, input) : convertRawScoreToPercentage(input, defaultOutOf);
    return { raw: input, outOf: defaultOutOf, percentage: pct, isFraction: false };
  }

  const str = input.trim();
  if (!str || str === '-') {
    return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
  }

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const raw = parseFloat(parts[0].trim());
      const max = parseFloat(parts[1].trim());
      if (!isNaN(raw) && !isNaN(max) && max > 0 && raw >= 0) {
        const pct = convertRawScoreToPercentage(raw, max);
        return { raw, outOf: max, percentage: pct, isFraction: true };
      }
    }
  }

  const parsed = parseFloat(str);
  if (!isNaN(parsed) && parsed >= 0) {
    const pct = defaultOutOf === 100 ? Math.min(100, Math.round(parsed)) : convertRawScoreToPercentage(parsed, defaultOutOf);
    return { raw: parsed, outOf: defaultOutOf, percentage: pct, isFraction: false };
  }

  return { raw: null, outOf: defaultOutOf, percentage: null, isFraction: false };
}

/**
 * Returns the ordinal suffix for a number (e.g. 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th").
 */
export function getRankSuffix(rank: number | null | undefined): string {
  if (!rank || rank <= 0) return '-';
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) return `${rank}st`;
  if (j === 2 && k !== 12) return `${rank}nd`;
  if (j === 3 && k !== 13) return `${rank}rd`;
  return `${rank}th`;
}

/**
 * Computes Grade and Stream rankings dynamically for an entire collection of students.
 * - Stream Ranking: Compares the student against peers in the exact same Stream / classArm (e.g., "G8 S" or "G7 N").
 * - Grade Ranking: Compares the student against all peers in the same Grade level (e.g., "G8" combining G8 S & G8 N).
 * 
 * Rules:
 * - Unassessed students (avgScore === null) receive position '-' and no numerical rank.
 * - Assessed students are ordered descending by avgScore.
 * - Tied scores share the same rank (standard 1224 competition ranking).
 * - Updates streamPosition, gradePosition, streamRank, gradeRank, and position.
 */
export function calculateStudentRankings(students: Student[]): Student[] {
  if (!students || students.length === 0) return [];

  // 1. Group by Stream (classArm)
  const streamMap = new Map<string, { rank: number | null; total: number; positionStr: string }>();
  const streamGroups = new Map<string, Student[]>();

  students.forEach((s) => {
    const list = streamGroups.get(s.classArm) || [];
    list.push(s);
    streamGroups.set(s.classArm, list);
  });

  streamGroups.forEach((streamList) => {
    const totalInStream = streamList.length;
    const assessed = streamList
      .filter((s) => s.avgScore !== null && s.avgScore !== undefined && !isNaN(s.avgScore))
      .sort((a, b) => (b.avgScore as number) - (a.avgScore as number));

    let currentRank = 1;
    for (let i = 0; i < assessed.length; i++) {
      if (i > 0 && (assessed[i].avgScore as number) < (assessed[i - 1].avgScore as number)) {
        currentRank = i + 1;
      }
      streamMap.set(assessed[i].id, {
        rank: currentRank,
        total: totalInStream,
        positionStr: `${currentRank}/${totalInStream}`,
      });
    }

    streamList
      .filter((s) => s.avgScore === null || s.avgScore === undefined || isNaN(s.avgScore))
      .forEach((s) => {
        streamMap.set(s.id, {
          rank: null,
          total: totalInStream,
          positionStr: '-',
        });
      });
  });

  // 2. Group by Grade (e.g. "G7", "G8", "G9")
  const gradeMap = new Map<string, { rank: number | null; total: number; positionStr: string }>();
  const gradeGroups = new Map<string, Student[]>();

  students.forEach((s) => {
    const effGrade = s.grade || (s.classArm ? s.classArm.split(' ')[0] : 'G8');
    const list = gradeGroups.get(effGrade) || [];
    list.push(s);
    gradeGroups.set(effGrade, list);
  });

  gradeGroups.forEach((gradeList) => {
    const totalInGrade = gradeList.length;
    const assessed = gradeList
      .filter((s) => s.avgScore !== null && s.avgScore !== undefined && !isNaN(s.avgScore))
      .sort((a, b) => (b.avgScore as number) - (a.avgScore as number));

    let currentRank = 1;
    for (let i = 0; i < assessed.length; i++) {
      if (i > 0 && (assessed[i].avgScore as number) < (assessed[i - 1].avgScore as number)) {
        currentRank = i + 1;
      }
      gradeMap.set(assessed[i].id, {
        rank: currentRank,
        total: totalInGrade,
        positionStr: `${currentRank}/${totalInGrade}`,
      });
    }

    gradeList
      .filter((s) => s.avgScore === null || s.avgScore === undefined || isNaN(s.avgScore))
      .forEach((s) => {
        gradeMap.set(s.id, {
          rank: null,
          total: totalInGrade,
          positionStr: '-',
        });
      });
  });

  return students.map((s) => {
    const sInfo = streamMap.get(s.id);
    const gInfo = gradeMap.get(s.id);

    const streamPosition = sInfo ? sInfo.positionStr : '-';
    const gradePosition = gInfo ? gInfo.positionStr : '-';
    const streamRank = sInfo ? sInfo.rank : null;
    const gradeRank = gInfo ? gInfo.rank : null;

    return {
      ...s,
      streamPosition,
      gradePosition,
      streamRank,
      gradeRank,
      position: streamPosition,
    };
  });
}

/**
 * Calculates the dynamic ranking for a single student against all other students in memory.
 */
export function calculateSingleStudentRanking(
  targetStudent: Student,
  allStudents: Student[]
): {
  streamPosition: string;
  gradePosition: string;
  streamRank: number | null;
  gradeRank: number | null;
  totalInStream: number;
  totalInGrade: number;
} {
  const merged = allStudents.some((s) => s.id === targetStudent.id)
    ? allStudents.map((s) => (s.id === targetStudent.id ? targetStudent : s))
    : [...allStudents, targetStudent];

  const ranked = calculateStudentRankings(merged);
  const found = ranked.find((s) => s.id === targetStudent.id);

  const streamCount = merged.filter((s) => s.classArm === targetStudent.classArm).length;
  const targetGrade = targetStudent.grade || targetStudent.classArm.split(' ')[0];
  const gradeCount = merged.filter(
    (s) => (s.grade || s.classArm.split(' ')[0]) === targetGrade
  ).length;

  return {
    streamPosition: found?.streamPosition || '-',
    gradePosition: found?.gradePosition || '-',
    streamRank: found?.streamRank ?? null,
    gradeRank: found?.gradeRank ?? null,
    totalInStream: streamCount,
    totalInGrade: gradeCount,
  };
}

/**
 * Computes teacher initials from a teacher's full name.
 * Examples:
 * - "Mr. Jotham Watila" -> "JW"
 * - "Jotham Watila" -> "JW"
 * - "Mr. O. Kinyanjui" -> "OK"
 * - "Mrs. J. Barasa" -> "JB"
 * - "Ms. C. Wanjiru" -> "CW"
 * - "Mr. P. Otieno" -> "PO"
 * - "Madam E. Achieng" -> "EA"
 */
export function getTeacherInitials(teacherName: string | undefined | null): string {
  if (!teacherName || !teacherName.trim()) return '--';

  // Strip honorific prefixes
  const clean = teacherName
    .replace(/^(Mr\.|Mrs\.|Ms\.|Miss|Dr\.|Prof\.|Madam|Tr\.|Teacher|Sir)\s+/i, '')
    .trim();

  // Split and clean punctuation
  const words = clean
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 0);

  if (words.length === 0) {
    return teacherName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'TR';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // First letter of first word and first letter of last word
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/**
 * Normalizes class strings for matching (e.g. "G8 S", "Grade 8 South", "8S", "G8 South")
 */
function normalizeClassKey(cls: string): string {
  if (!cls) return '';
  const upper = cls.toUpperCase().trim();
  // Extract number (7, 8, 9) and stream letter (S, N, E, W, etc.)
  const numMatch = upper.match(/(\d+)/);
  const streamMatch = upper.match(/(SOUTH|NORTH|EAST|WEST|[SNEW])/i);

  const num = numMatch ? numMatch[1] : '';
  let stream = '';
  if (streamMatch) {
    const raw = streamMatch[1].toUpperCase();
    if (raw.startsWith('S')) stream = 'S';
    else if (raw.startsWith('N')) stream = 'N';
    else if (raw.startsWith('E')) stream = 'E';
    else if (raw.startsWith('W')) stream = 'W';
    else stream = raw[0];
  }

  if (num && stream) {
    return `G${num} ${stream}`;
  }
  return upper;
}

/**
 * Resolves the assigned teacher and initials for a specific subject in a specific student's class.
 */
export function getTeacherForSubject(
  subjectName: string,
  classArm: string,
  teachersList: Teacher[] = INITIAL_TEACHERS
): { teacher: Teacher | null; initials: string; teacherName: string; role?: string } {
  const normTarget = normalizeClassKey(classArm);
  const gradePrefix = normTarget.split(' ')[0] || (classArm || '').trim().toUpperCase();

  const targetSub = (subjectName || '').toLowerCase().trim();

  // 1. Check allocations
  for (const t of teachersList) {
    if (t.allocations && t.allocations.length > 0) {
      const matchAlloc = t.allocations.find((a) => {
        const aNorm = normalizeClassKey(a.className || '');
        const classMatches =
          aNorm === normTarget ||
          (a.className || '').toUpperCase().trim() === (classArm || '').toUpperCase().trim() ||
          aNorm.startsWith(gradePrefix);

        const subMatches = (a.subjects || []).some(
          (s) => (s || '').toLowerCase().trim() === targetSub
        );

        return classMatches && subMatches;
      });

      if (matchAlloc) {
        return {
          teacher: t,
          initials: getTeacherInitials(t.name),
          teacherName: t.name,
          role: t.role,
        };
      }
    }
  }

  // 2. Check classes & subjects properties
  for (const t of teachersList) {
    const hasClass = (t.classes || []).some((c) => {
      const cNorm = normalizeClassKey(c);
      return cNorm === normTarget || cNorm.startsWith(gradePrefix);
    });

    const hasSubject = (t.subjects || []).some(
      (s) => (s || '').toLowerCase().trim() === targetSub
    );

    if (hasClass && hasSubject) {
      return {
        teacher: t,
        initials: getTeacherInitials(t.name),
        teacherName: t.name,
        role: t.role,
      };
    }
  }

  // 3. Any teacher assigned to this subject
  for (const t of teachersList) {
    const hasSubject = (t.subjects || []).some(
      (s) => (s || '').toLowerCase().trim() === targetSub
    );
    if (hasSubject) {
      return {
        teacher: t,
        initials: getTeacherInitials(t.name),
        teacherName: t.name,
        role: t.role,
      };
    }
  }

  // 4. Default Fallback Map
  const defaultSubjectTeachers: Record<string, { name: string; initials: string }> = {
    'Social Studies': { name: 'Mr. Jotham Watila', initials: 'JW' },
    'Pretechnical Studies': { name: 'Mr. Jotham Watila', initials: 'JW' },
    'Mathematics': { name: 'Mr. O. Kinyanjui', initials: 'OK' },
    'English': { name: 'Mrs. J. Barasa', initials: 'JB' },
    'Integrated Science': { name: 'Ms. C. Wanjiru', initials: 'CW' },
    'Agriculture': { name: 'Ms. C. Wanjiru', initials: 'CW' },
    'Kiswahili': { name: 'Mr. P. Otieno', initials: 'PO' },
    'CRE': { name: 'Mr. P. Otieno', initials: 'PO' },
    'Creative Arts': { name: 'Madam E. Achieng', initials: 'EA' },
  };

  const def = defaultSubjectTeachers[subjectName] || {
    name: 'Class Teacher',
    initials: 'TR',
  };

  return {
    teacher: null,
    initials: def.initials,
    teacherName: def.name,
  };
}

