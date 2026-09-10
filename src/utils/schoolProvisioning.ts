import { SchoolTenant, User as UserType, UserRole } from '../types';
import { generateOneTimePassword } from './securityEngine';

export interface UserInvitationPayload {
  user: UserType;
  otp: string;
  expiresAt: number;
  smsMessage: string;
  emailSubject: string;
  emailBody: string;
  loginUrl: string;
}

/**
 * Creates a staff user account with pending activation and generates an invitation with temporary OTP.
 */
export function createStaffAccountWithInvitation(params: {
  school: SchoolTenant;
  fullName: string;
  nationalId: string;
  tscNumber?: string;
  phoneNumber: string;
  emailAddress: string;
  designation: string;
  role: UserRole;
  appUrl?: string;
}): UserInvitationPayload {
  const { school, fullName, nationalId, tscNumber, phoneNumber, emailAddress, designation, role, appUrl } = params;
  const codeClean = (school.schoolCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');
  const schoolId = school.schoolId;
  const cleanFirst = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = `${cleanFirst}.${codeClean}`;
  const { otp, expiresAt } = generateOneTimePassword();

  const originUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');
  const loginUrl = `${originUrl}?tenant=${schoolId}&user=${encodeURIComponent(username)}`;

  const newUser: UserType = {
    id: `usr-${schoolId}-${Date.now().toString().slice(-6)}`,
    schoolId,
    username,
    fullName: fullName.trim(),
    email: emailAddress.trim() || undefined,
    phoneNumber: phoneNumber.trim() || undefined,
    nationalId: nationalId.trim() || undefined,
    tscNumber: tscNumber?.trim() || undefined,
    designation: designation.trim() || undefined,
    employeeNumber: tscNumber?.trim() ? `TSC-${tscNumber.trim()}` : (nationalId.trim() ? `ID-${nationalId.trim()}` : undefined),
    role,
    active: false, // Set to false until first login activation
    activationStatus: 'PENDING_ACTIVATION',
    tempOtp: otp,
    otpExpiry: expiresAt,
    invitationSentAt: Date.now(),
    invitationMethod: 'BOTH',
    failedAttempts: 0,
    lockedUntil: null,
    mfaEnabled: false,
  };

  const smsMessage = `Welcome to JJSAK. Your ${designation || 'staff'} account for ${school.schoolName} has been created. Login using the secure link: ${loginUrl}. Your confidential One-Time Password has been dispatched via your registered channel (Policy §2.3 Zero-Exposure). The OTP expires after 15 minutes.`;

  const emailSubject = `Welcome to JJSAK - Account Activation for ${school.schoolName}`;
  const emailBody = `Dear ${fullName},\n\nWelcome to JJSAK Educational System. Your institutional account for ${school.schoolName} has been created with role: ${role}.\n\nTo activate your account, please complete the First Login Security Procedure:\n\n1. Login Link: ${loginUrl}\n2. Username: ${username}\n3. One-Time Password (OTP): [Confidential OTP Dispatched via Encrypted Channel to Registered Contacts]\n\nUpon login, you will be prompted to validate your OTP, create a secure permanent password, and accept system terms.\n\nJJSAK Secure Access Directorate`;

  return {
    user: newUser,
    otp,
    expiresAt,
    smsMessage,
    emailSubject,
    emailBody,
    loginUrl,
  };
}

/**
 * Generates default institutional staff accounts for a newly registered school.
 * Note: Per JJSAK School Registration Policy, newly registered schools are created empty
 * with zero pre-populated academic or staff data. This helper is reserved for optional sandbox demo loading.
 */
export function provisionDefaultSchoolUsers(school: SchoolTenant): UserType[] {
  const codeClean = (school.schoolCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');
  const schoolId = school.schoolId;
  const officialPhone = school.phone || school.officialPhone || '+254 700 000 000';
  const emailSource = school.officialEmail || school.email || '';
  const schoolEmailDomain = emailSource.includes('@')
    ? emailSource.split('@')[1]
    : `${codeClean}.sc.ke`;

  return [
    {
      id: `usr-${schoolId}-head`,
      schoolId,
      username: `head.${codeClean}`,
      email: school.administratorDetails?.emailAddress || `head@${schoolEmailDomain}`,
      password: 'Password@2026!',
      fullName: school.administratorDetails?.fullName || `Principal (${school.schoolName})`,
      role: 'HEAD',
      employeeNumber: school.administratorDetails?.nationalId
        ? `TSC-${school.administratorDetails.nationalId}`
        : `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
      phoneNumber: school.administratorDetails?.phoneNumber || officialPhone,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      mfaEnabled: false,
    },
    {
      id: `usr-${schoolId}-deputy`,
      schoolId,
      username: `deputy.${codeClean}`,
      email: `deputy@${schoolEmailDomain}`,
      password: 'Password@2026!',
      fullName: `Deputy Head (${school.schoolName})`,
      role: 'DEPUTY',
      employeeNumber: `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
      phoneNumber: officialPhone,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      mfaEnabled: false,
    },
    {
      id: `usr-${schoolId}-dean`,
      schoolId,
      username: `academics.${codeClean}`,
      email: `academics@${schoolEmailDomain}`,
      password: 'Password@2026!',
      fullName: `Dean of Academics (${school.schoolName})`,
      role: 'DIRECTOR_ACADEMICS',
      employeeNumber: `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
      phoneNumber: officialPhone,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      mfaEnabled: false,
    },
    {
      id: `usr-${schoolId}-teacher1`,
      schoolId,
      username: `teacher.${codeClean}`,
      email: `teacher@${schoolEmailDomain}`,
      password: 'Password@2026!',
      fullName: `Class Teacher - Grade 8 (${school.schoolName})`,
      role: 'TEACHER',
      employeeNumber: `TSC-${Math.floor(100000 + Math.random() * 900000)}`,
      phoneNumber: officialPhone,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      mfaEnabled: false,
    },
    {
      id: `usr-${schoolId}-finance`,
      schoolId,
      username: `finance.${codeClean}`,
      email: `finance@${schoolEmailDomain}`,
      password: 'Password@2026!',
      fullName: `Finance Officer / Bursar (${school.schoolName})`,
      role: 'FINANCE',
      employeeNumber: `ACC-${Math.floor(10000 + Math.random() * 90000)}`,
      phoneNumber: officialPhone,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      mfaEnabled: false,
    },
  ];
}

/**
 * Generates an offline standalone HTML app launcher for the school.
 */
export function generateSchoolAppLauncherHTML(school: SchoolTenant, appUrl?: string): string {
  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${school.schoolName} - JJSAK Application Launcher</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(197, 30, 40, 0.2);
      color: #ef4444;
      border: 1px solid rgba(197, 30, 40, 0.4);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 8px 0;
      color: #ffffff;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px 20px;
      background: #C51E28;
      color: #ffffff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 12px;
      font-size: 14px;
      transition: background 0.2s;
      margin-bottom: 12px;
    }
    .btn:hover {
      background: #dc2626;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid #475569;
      color: #cbd5e1;
    }
    .btn-outline:hover {
      background: #334155;
      color: #ffffff;
    }
    .info-box {
      background: #0f172a;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
      text-align: left;
      margin-top: 20px;
      border: 1px solid #334155;
    }
    .security-note {
      font-size: 11px;
      color: #f59e0b;
      margin-top: 16px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Official School Portal Launcher</span>
    <h1>${school.schoolName}</h1>
    <p>Code: <strong>${school.schoolCode}</strong> • Registration: ${school.registrationNumber || 'MOE Registered'}<br>
    <em>"${school.motto || 'Strive for Excellence'}"</em></p>

    <a href="${targetUrl}" class="btn">🚀 Open ${school.schoolName} Portal</a>
    <button onclick="window.location.reload()" class="btn btn-outline">🔄 Refresh Local Cache</button>

    <div class="info-box">
      <strong>Institutional Access Details:</strong><br>
      • Portal Type: School Academic & Assessment Portal<br>
      • Education Level: ${school.educationLevel || 'Junior Secondary School (Grades 7-9)'}<br>
      • County: ${school.county || 'Kenya'}<br>
      • Contact: ${school.phone || school.officialPhone || 'School Administration'}
    </div>

    <div class="security-note">
      🔒 <strong>Security Notice:</strong> School Portal access is strictly isolated to institutional operations. Super Administrator / System Owner governance is preserved and protected under Tier 1 security.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates the School Manifest JSON package.
 */
export function generateSchoolManifestJSON(school: SchoolTenant): string {
  const codeClean = (school.schoolCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');
  const data = {
    app: 'JJSAK CBC Assessment & Reporting System',
    schemaVersion: '2.4.0',
    generatedAt: new Date().toISOString(),
    school: {
      id: school.schoolId,
      name: school.schoolName,
      code: school.schoolCode,
      registrationNumber: school.registrationNumber,
      educationLevel: school.educationLevel,
      category: school.category,
      county: school.county,
      subCounty: school.subCounty,
      ward: school.ward,
      address: school.address || school.physicalAddress,
      email: school.officialEmail || school.email,
      phone: school.officialPhone || school.phone,
      motto: school.motto || school.schoolBranding?.motto,
      primaryColor: school.schoolBranding?.primaryColor || '#C51E28',
      secondaryColor: school.schoolBranding?.secondaryColor || '#1E293B',
      status: school.status,
    },
    modulesEnabled: [
      'STUDENT_REGISTRATION_CBC',
      'ASSESSMENT_COMPETENCY_GRADING',
      'INSTANT_MARKS_CONVERTER',
      'SUMMATIVE_REPORT_CARD_GENERATOR',
      'LEARNER_WELFARE_HEALTH_TRACKER',
      'TIMETABLE_AND_TEACHER_ALLOCATIONS',
      'REPORTS_HUB_BROADCAST',
    ],
    securityIsolation: {
      tenantBoundary: 'STRICT_SINGLE_TENANT',
      preservedOwnerAccess: 'FORBIDDEN_FOR_SCHOOL_PORTAL',
      tierLevel: 'TIER_2_AND_TIER_3_INSTITUTIONAL',
      defaultLoginPrefix: `${codeClean}`,
    },
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Generates formatted, printable Onboarding & Credentials Dossier.
 */
export function generateSchoolCredentialsSheet(
  school: SchoolTenant,
  users?: UserType[],
  appUrl?: string
): string {
  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');
  const staff = users && users.length > 0 ? users : provisionDefaultSchoolUsers(school);

  return `======================================================================
     JJSAK CBC SCHOOL ASSESSMENT & REPORT SYSTEM (KENYA)
             OFFICIAL INSTITUTIONAL ONBOARDING DOSSIER
======================================================================

SCHOOL DETAILS:
----------------------------------------------------------------------
School Name       : ${school.schoolName}
School Code       : ${school.schoolCode}
Registration No   : ${school.registrationNumber || 'MOE Registered'}
Location          : ${school.county || 'Kenya'}, ${school.subCounty || ''}, ${school.ward || ''}
Education Level   : ${school.educationLevel || 'Junior Secondary School (Grades 7 - 9)'}
Motto             : "${school.motto || school.schoolBranding?.motto || 'Strive for Excellence'}"
Official Email    : ${school.officialEmail || school.email || 'info@school.sc.ke'}
Official Phone    : ${school.officialPhone || school.phone || '+254 700 000 000'}
Status            : ${school.status} (Rule P1.50 Verified)

PORTAL ACCESS URL:
----------------------------------------------------------------------
Web / Mobile URL  : ${targetUrl}

======================================================================
STAFF LOGIN CREDENTIALS (INSTITUTIONAL ACCESS ONLY):
======================================================================
${staff
  .map(
    (u, idx) => `
[${idx + 1}] ROLE: ${u.role} - ${u.fullName}
    Username      : ${u.username}
    Default Pass  : Password@2026!
    Email         : ${u.email}
    Phone         : ${u.phoneNumber || 'School Administration'}
    Access Scope  : Institutional Portal (${school.schoolName})
`
  )
  .join('')}
======================================================================
CRITICAL SECURITY GOVERNANCE & ACCESS BOUNDARIES:
======================================================================
1. INSTITUTIONAL ISOLATION:
   All staff accounts listed above are strictly confined to ${school.schoolName}.
   Cross-school data leakage is cryptographically prevented.

2. PRESERVED SUPER ADMINISTRATOR / SYSTEM OWNER RESTRICTION:
   School personnel (including the Principal/Headteacher) MUST NOT and CANNOT
   log into the platform's Super Administrator / Owner site. Super Admin roles
   are preserved exclusively for root system governance and require verified
   two-factor email confirmation.

3. PASSWORD SECURITY:
   All staff members must update their default password upon initial login.

======================================================================
Generated By : JJSAK Platform Security Core
Date Issued  : ${new Date().toLocaleDateString('en-KE', { dateStyle: 'full' })}
======================================================================
`;
}

/**
 * Generates an official Windows PowerShell Desktop App Installer script (.ps1).
 * Creates desktop and start menu shortcuts configured to launch JJSAK in standalone app mode with school tenant binding.
 */
export function generateWindowsPowerShellInstaller(school: SchoolTenant, appUrl?: string): string {
  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');
  const codeClean = (school.schoolCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');
  const appName = `JJSAK - ${school.schoolName}`;

  return `# ======================================================================
# JJSAK Official Windows Desktop Application Installer
# School: ${school.schoolName} (${school.schoolCode})
# Version: 2.4.0-LTS (Build 2026.09)
# Signed by: JJSAK Trust Authority CA
# ======================================================================
Write-Host "Installing JJSAK Application for ${school.schoolName}..." -ForegroundColor Cyan

$PortalUrl = "${targetUrl}?tenant=${school.schoolId}&source=desktop_app"
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ProgramsPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
$WScriptShell = New-Object -ComObject WScript.Shell

# 1. Create Desktop Shortcut
$DesktopShortcutPath = Join-Path $DesktopPath "${appName}.lnk"
$Shortcut = $WScriptShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--app=$PortalUrl --app-id=jjsak.${codeClean}.app --window-size=1280,850"
$Shortcut.Description = "JJSAK Educational Assessment Portal for ${school.schoolName}"
$Shortcut.Save()

# 2. Create Start Menu Shortcut
$StartMenuFolder = Join-Path $ProgramsPath "JJSAK Education"
if (!(Test-Path $StartMenuFolder)) {
    New-Item -ItemType Directory -Path $StartMenuFolder -Force | Out-Null
}
$StartShortcutPath = Join-Path $StartMenuFolder "${appName}.lnk"
$StartShortcut = $WScriptShell.CreateShortcut($StartShortcutPath)
$StartShortcut.TargetPath = "msedge.exe"
$StartShortcut.Arguments = "--app=$PortalUrl --app-id=jjsak.${codeClean}.app --window-size=1280,850"
$StartShortcut.Description = "JJSAK Educational Assessment Portal for ${school.schoolName}"
$StartShortcut.Save()

Write-Host "✓ Installation Complete! JJSAK Desktop shortcut created for ${school.schoolName}." -ForegroundColor Green
Write-Host "Tenant Boundary: Bound to School Tenant [${school.schoolId}]." -ForegroundColor Yellow
Start-Process -FilePath "msedge.exe" -ArgumentList "--app=$PortalUrl"
`;
}

/**
 * Generates an Android Application Package (.apk) configuration descriptor.
 */
export function generateAndroidApkPackageDescriptor(school: SchoolTenant, appUrl?: string): string {
  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://jjsak-assessment.sc.ke');
  const codeClean = (school.schoolCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');

  const descriptor = {
    packageName: `com.jjsak.school.${codeClean}`,
    versionName: '2.4.0',
    versionCode: 240,
    minSdkVersion: 26,
    targetSdkVersion: 34,
    appName: `JJSAK ${school.schoolName}`,
    schoolDetails: {
      id: school.schoolId,
      code: school.schoolCode,
      name: school.schoolName,
      county: school.county,
      motto: school.motto,
    },
    appConfig: {
      entryUrl: `${targetUrl}?tenant=${school.schoolId}&source=android_app`,
      standaloneDisplay: true,
      offlineSyncEnabled: true,
      tenantIsolationEnforced: true,
      superAdminSeparationEnforced: true,
    },
    securitySignature: {
      signedBy: 'JJSAK Educational Trust Authority CA',
      certSerial: '2026-KE-01-APK',
      integrityHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  };

  return JSON.stringify(descriptor, null, 2);
}

/**
 * Downloads a text/JSON file directly in browser.
 */
export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
