import React, { useState, useEffect } from 'react';
import { LaunchFlowStage } from '../../types/launchFlow';
import { SchoolTenant, SchoolStatus, User as UserType, JWTSession, SchoolSubscription } from '../../types';
import { SchoolNotRegisteredScreen } from './SchoolNotRegisteredScreen';
import { OwnerSchoolManagementScreen } from './OwnerSchoolManagementScreen';
import { OrganizationalProfileScreen } from './OrganizationalProfileScreen';
import { JJSAKLoginScreen } from './JJSAKLoginScreen';

interface JJSAKLaunchFlowManagerProps {
  tenants: SchoolTenant[];
  users: UserType[];
  currentUser?: UserType;
  activeTenantId: string;
  subscription?: SchoolSubscription;
  onUpdateTenants: (tenants: SchoolTenant[]) => void;
  onSelectTenant: (tenantId: string) => void;
  onLoginSuccess: (user: UserType, jwtSession: JWTSession) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
  onLogAudit: (action: any, details: string) => void;
  children: React.ReactNode;
}

export const JJSAKLaunchFlowManager: React.FC<JJSAKLaunchFlowManagerProps> = ({
  tenants,
  users,
  currentUser,
  activeTenantId,
  subscription,
  onUpdateTenants,
  onSelectTenant,
  onLoginSuccess,
  onUpdateUser,
  onLogAudit,
  children,
}) => {
  // Determine initial launch stage based on active schools presence and authentication status
  const [stage, setStage] = useState<LaunchFlowStage>(() => {
    if (currentUser) {
      return 'LAUNCH_COMPLETE';
    }
    const hasActiveSchool = tenants.some((t) => t.status === 'ACTIVE');
    if (!hasActiveSchool) {
      return 'STAGE_2_NO_SCHOOL_REGISTERED';
    }
    // If active school exists, per workflow rule, start by presenting profile/login
    return 'STAGE_5_ORGANIZATIONAL_PROFILE';
  });

  useEffect(() => {
    if (currentUser) {
      setStage('LAUNCH_COMPLETE');
    }
  }, [currentUser]);

  const [activeOwnerUser, setActiveOwnerUser] = useState<UserType>(() => {
    return users.find((u) => u.role === 'SYSTEM_ADMIN' || u.role === 'SUPER_ADMIN') || users[0];
  });

  // Stage 2 -> Stage 3: Owner Login
  const handleOwnerLogin = (username: string, password: string): boolean => {
    const inputUname = (username || '').trim().toLowerCase();
    const inputCompact = inputUname.replace(/\s+/g, '');
    const cleanDigits = inputUname.replace(/[^0-9+]/g, '');

    const owner = users.find(
      (u) =>
        (u.role === 'SYSTEM_ADMIN' || u.role === 'SUPER_ADMIN') &&
        (
          (u.username || '').toLowerCase() === inputUname ||
          (u.username || '').toLowerCase().replace(/\s+/g, '') === inputCompact ||
          (u.email || '').toLowerCase() === inputUname ||
          (u.fullName || '').toLowerCase() === inputUname ||
          inputUname === 'admin' ||
          inputUname === 'jotham' ||
          (cleanDigits.length >= 6 && (u.phoneNumber || '').replace(/[^0-9+]/g, '').includes(cleanDigits))
        )
    );

    const isPasswordValid = Boolean(owner && owner.password && password === owner.password);

    if (owner && isPasswordValid) {
      setActiveOwnerUser(owner);
      onLogAudit('LOGIN', `System Owner / Super Administrator ${owner.fullName} authenticated to Owner Console.`);
      setStage('STAGE_3_OWNER_DASHBOARD');
      return true;
    }
    return false;
  };

  // Quick Install Sample School (Ngonyek Junior)
  const handleQuickInstallSampleSchool = () => {
    const sampleSchool: SchoolTenant = {
      schoolId: 'sch-ngonyek-001',
      schoolCode: 'NJS-30200',
      schoolName: 'Ngonyek Junior School',
      schoolType: 'Private',
      category: 'JUNIOR',
      registrationNumber: 'MOE/PRI/30200',
      educationLevel: 'Junior School (Grade 7 - 9)',
      country: 'Kenya',
      county: 'Trans Nzoia',
      subCounty: 'Kiminini',
      ward: 'Sirende',
      physicalAddress: 'P.O. Box 450 - 30200, Kitale',
      postalAddress: 'P.O. Box 450 - 30200, Kitale',
      address: 'P.O. Box 450 - 30200, Kitale, Kiminini Sub-County',
      phone: '+254 722 345 678',
      officialPhone: '+254 722 345 678',
      email: 'info@ngonyekjuniorschool.sc.ke',
      officialEmail: 'info@ngonyekjuniorschool.sc.ke',
      motto: 'Every Learner Matters, Every Achievement Counts',
      status: 'ACTIVE', // Activated
      createdAt: '2024-01-10',
    };

    const updated = [sampleSchool, ...tenants.filter((t) => t.schoolId !== sampleSchool.schoolId)];
    onUpdateTenants(updated);
    onSelectTenant(sampleSchool.schoolId);
    onLogAudit('RECORD_CREATE', `Owner registered & activated sample school [${sampleSchool.schoolName}].`);
    setStage('STAGE_5_ORGANIZATIONAL_PROFILE');
  };

  // Owner adds new school
  const handleAddSchool = (newSchool: SchoolTenant) => {
    const updated = [...tenants, newSchool];
    onUpdateTenants(updated);
    onLogAudit('RECORD_CREATE', `Owner created new school registration [${newSchool.schoolName}].`);
  };

  // Owner updates school status (PENDING, ACTIVE, SUSPENDED, DISABLED)
  const handleUpdateSchoolStatus = (schoolId: string, newStatus: SchoolStatus) => {
    const updated = tenants.map((t) => (t.schoolId === schoolId ? { ...t, status: newStatus } : t));
    onUpdateTenants(updated);
    onLogAudit('RECORD_EDIT', `School [${schoolId}] status transitioned to ${newStatus}.`);
  };

  // Owner activates school and immediately transitions to Stage 5 (Display JJSAK Profile)
  const handleActivateAndProceedToProfile = (school: SchoolTenant) => {
    const updated = tenants.map((t) => (t.schoolId === school.schoolId ? { ...t, status: 'ACTIVE' as SchoolStatus } : t));
    onUpdateTenants(updated);
    onSelectTenant(school.schoolId);
    onLogAudit('RECORD_EDIT', `Owner ACTIVATED school [${school.schoolName}] and launched Stage 5 JJSAK Organizational Profile.`);
    setStage('STAGE_5_ORGANIZATIONAL_PROFILE');
  };

  // Stage 5 Continue -> Stage 6 Login Screen
  const handleContinueToLogin = () => {
    setStage('STAGE_6_LOGIN_SCREEN');
  };

  // Stage 6 Login Success -> Enter Main Application
  const handleUserLoginSuccess = (user: UserType, jwt: JWTSession) => {
    onLoginSuccess(user, jwt);
    setStage('LAUNCH_COMPLETE');
  };

  // If Launch is complete, render the active JJSAK application dashboard
  if (stage === 'LAUNCH_COMPLETE') {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950">
      {/* STAGE 2: NO SCHOOL REGISTERED */}
      {stage === 'STAGE_2_NO_SCHOOL_REGISTERED' && (
        <SchoolNotRegisteredScreen
          onOwnerLogin={handleOwnerLogin}
          onQuickInstallSampleSchool={handleQuickInstallSampleSchool}
          onOpenOwnerAuth={() => setStage('STAGE_3_OWNER_LOGIN')}
        />
      )}

      {/* STAGE 3 & 4: OWNER DASHBOARD, REGISTRATION & ACTIVATION */}
      {(stage === 'STAGE_3_OWNER_DASHBOARD' || stage === 'STAGE_3_CREATE_SCHOOL' || stage === 'STAGE_4_VERIFICATION_ACTIVATION') && (
        <OwnerSchoolManagementScreen
          currentUser={activeOwnerUser}
          schools={tenants}
          onAddSchool={handleAddSchool}
          onUpdateSchoolStatus={handleUpdateSchoolStatus}
          onActivateAndProceedToProfile={handleActivateAndProceedToProfile}
          onLogoutToLockScreen={() => setStage('STAGE_2_NO_SCHOOL_REGISTERED')}
          onLogAudit={onLogAudit}
        />
      )}

      {/* STAGE 5: JJSAK ORGANIZATIONAL PROFILE */}
      {stage === 'STAGE_5_ORGANIZATIONAL_PROFILE' && (
        <OrganizationalProfileScreen
          onContinueToLogin={handleContinueToLogin}
        />
      )}

      {/* STAGE 6 & 7: JJSAK LOGIN SCREEN & SECURITY VALIDATION */}
      {stage === 'STAGE_6_LOGIN_SCREEN' && (
        <JJSAKLoginScreen
          users={users}
          tenants={tenants}
          activeTenantId={activeTenantId}
          subscription={subscription}
          onSelectTenant={onSelectTenant}
          onLoginSuccess={handleUserLoginSuccess}
          onUpdateUser={onUpdateUser}
          onViewOrganizationalProfile={() => setStage('STAGE_5_ORGANIZATIONAL_PROFILE')}
          onOpenOwnerConsole={() => setStage('STAGE_3_OWNER_DASHBOARD')}
          onLogAudit={onLogAudit}
        />
      )}
    </div>
  );
};
