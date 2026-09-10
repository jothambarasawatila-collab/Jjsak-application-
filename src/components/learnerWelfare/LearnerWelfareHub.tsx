import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  ShieldAlert,
  HeartPulse,
  HeartHandshake,
  ArrowRightLeft,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Student, User } from '../../types';
import {
  ClassAttendanceRegister,
  CounselingSession,
  DisciplineIncident,
  Grade9GraduationRecord,
  HealthIncidentRecord,
  LearnerHealthProfile,
  ParentCommunicationRecord,
  TransferInRecord,
  TransferOutRecord,
  VulnerableLearnerRecord,
} from '../../types/learnerWelfare';
import { LearnerProfileMasterTab } from './LearnerProfileMasterTab';
import { DailyAttendanceRegisterTab } from './DailyAttendanceRegisterTab';
import { DisciplineBehaviorTab } from './DisciplineBehaviorTab';
import { HealthClinicTab } from './HealthClinicTab';
import { GuidanceCounselingWelfareTab } from './GuidanceCounselingWelfareTab';
import { TransfersExitsGraduationTab } from './TransfersExitsGraduationTab';
import { ParentEngagementAuditTab } from './ParentEngagementAuditTab';

export type LearnerWelfareTabKey =
  | 'profiles'
  | 'attendance'
  | 'discipline'
  | 'health'
  | 'counseling'
  | 'transfers'
  | 'parent_audit';

interface LearnerWelfareHubProps {
  students: Student[];
  currentUser?: User;
  onAddStudent?: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;

  // Phase 6 Data collections & updaters
  attendanceRegisters: ClassAttendanceRegister[];
  onSaveAttendanceRegister: (register: ClassAttendanceRegister) => void;

  disciplineIncidents: DisciplineIncident[];
  onAddDisciplineIncident: (incident: DisciplineIncident) => void;
  onUpdateDisciplineIncident: (incident: DisciplineIncident) => void;

  healthIncidents: HealthIncidentRecord[];
  healthProfiles: Record<string, LearnerHealthProfile>;
  onAddHealthIncident: (incident: HealthIncidentRecord) => void;
  onUpdateHealthProfile: (profile: LearnerHealthProfile) => void;

  counselingSessions: CounselingSession[];
  vulnerableLearners: VulnerableLearnerRecord[];
  onAddCounselingSession: (session: CounselingSession) => void;
  onAddVulnerableLearner: (record: VulnerableLearnerRecord) => void;
  onUpdateVulnerableLearner: (record: VulnerableLearnerRecord) => void;

  transfersOut: TransferOutRecord[];
  transfersIn: TransferInRecord[];
  graduations: Grade9GraduationRecord[];
  onProcessTransferOut: (record: TransferOutRecord) => void;
  onProcessTransferIn: (record: TransferInRecord) => void;
  onGraduateGrade9: (record: Grade9GraduationRecord) => void;

  communications: ParentCommunicationRecord[];
  onSendParentNotice: (record: ParentCommunicationRecord) => void;

  auditLogs: Array<{
    id: string;
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
    beforeVal?: string;
    afterVal?: string;
  }>;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

export const LearnerWelfareHub: React.FC<LearnerWelfareHubProps> = ({
  students,
  currentUser,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  attendanceRegisters,
  onSaveAttendanceRegister,
  disciplineIncidents,
  onAddDisciplineIncident,
  onUpdateDisciplineIncident,
  healthIncidents,
  healthProfiles,
  onAddHealthIncident,
  onUpdateHealthProfile,
  counselingSessions,
  vulnerableLearners,
  onAddCounselingSession,
  onAddVulnerableLearner,
  onUpdateVulnerableLearner,
  transfersOut,
  transfersIn,
  graduations,
  onProcessTransferOut,
  onProcessTransferIn,
  onGraduateGrade9,
  communications,
  onSendParentNotice,
  auditLogs,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<LearnerWelfareTabKey>('profiles');

  const tabs = [
    {
      key: 'profiles' as const,
      label: 'P6.1 & P6.2 Profiles & Intake',
      icon: Users,
      badge: students.length,
    },
    {
      key: 'attendance' as const,
      label: 'P6.3 & P6.4 Attendance & Roll',
      icon: CalendarCheck,
      badge: 'Daily',
    },
    {
      key: 'discipline' as const,
      label: 'P6.5 Discipline & Merits',
      icon: ShieldAlert,
      badge: disciplineIncidents.length,
    },
    {
      key: 'health' as const,
      label: 'P6.6 Health & Sickbay',
      icon: HeartPulse,
      badge: healthIncidents.length,
    },
    {
      key: 'counseling' as const,
      label: 'P6.7 Guidance & Welfare',
      icon: HeartHandshake,
      badge: vulnerableLearners.length,
    },
    {
      key: 'transfers' as const,
      label: 'P6.8 Transfers & Exit',
      icon: ArrowRightLeft,
      badge: transfersOut.length + graduations.length,
    },
    {
      key: 'parent_audit' as const,
      label: 'P6.9 & P6.10 Notices & Audit',
      icon: MessageSquare,
      badge: auditLogs.length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 6 Master Framework
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active &amp; Compliant
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Learner Management, Attendance, Discipline, Health &amp; Student Welfare
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Complete post-admission lifecycle governing student profiles, daily roll registers,
              restorative discipline, clinic encounters, OVC welfare, transfers, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto bg-slate-800/80 p-2 rounded-2xl border border-slate-700/60">
            <div className="text-right px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Learners</span>
              <span className="text-lg font-black text-white font-mono">
                {students.filter((s) => s.enrollmentStatus !== 'Transferred Out' && s.enrollmentStatus !== 'Graduated').length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800 pt-4 text-xs font-bold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'profiles' && (
        <LearnerProfileMasterTab
          students={students}
          currentUser={currentUser}
          onAddStudent={onAddStudent || (() => {})}
          onUpdateStudent={onUpdateStudent || (() => {})}
          onDeleteStudent={onDeleteStudent || (() => {})}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'attendance' && (
        <DailyAttendanceRegisterTab
          students={students}
          currentUser={currentUser}
          attendanceRegisters={attendanceRegisters}
          onSaveRegister={onSaveAttendanceRegister}
          onSendParentNotice={onSendParentNotice}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'discipline' && (
        <DisciplineBehaviorTab
          students={students}
          currentUser={currentUser}
          incidents={disciplineIncidents}
          onAddIncident={onAddDisciplineIncident}
          onUpdateIncident={onUpdateDisciplineIncident}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'health' && (
        <HealthClinicTab
          students={students}
          currentUser={currentUser}
          healthIncidents={healthIncidents}
          healthProfiles={healthProfiles}
          onAddHealthIncident={onAddHealthIncident}
          onUpdateHealthProfile={onUpdateHealthProfile}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'counseling' && (
        <GuidanceCounselingWelfareTab
          students={students}
          currentUser={currentUser}
          counselingSessions={counselingSessions}
          vulnerableLearners={vulnerableLearners}
          onAddCounselingSession={onAddCounselingSession}
          onAddVulnerableLearner={onAddVulnerableLearner}
          onUpdateVulnerableLearner={onUpdateVulnerableLearner}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'transfers' && (
        <TransfersExitsGraduationTab
          students={students}
          currentUser={currentUser}
          transfersOut={transfersOut}
          transfersIn={transfersIn}
          graduations={graduations}
          onProcessTransferOut={onProcessTransferOut}
          onProcessTransferIn={onProcessTransferIn}
          onGraduateGrade9={onGraduateGrade9}
          onLogAudit={onLogAudit}
        />
      )}

      {activeTab === 'parent_audit' && (
        <ParentEngagementAuditTab
          students={students}
          currentUser={currentUser}
          communications={communications}
          auditLogs={auditLogs}
          onSendMessage={onSendParentNotice}
          onLogAudit={onLogAudit}
        />
      )}
    </div>
  );
};
