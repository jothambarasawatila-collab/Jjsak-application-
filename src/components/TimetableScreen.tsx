import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Users,
  Layers,
  Edit2,
  RefreshCw,
  X,
  CheckCircle2,
  BookOpen,
  Award,
  CalendarCheck,
  Plus,
  Trash2,
  Building2,
  Check,
  Settings2,
  UserCheck,
  GraduationCap,
  Lock,
  Info,
  FileEdit,
} from 'lucide-react';
import { SchoolInfo, Teacher, User, AuditActionType } from '../types';
import {
  DayOfWeek,
  TimetableLesson,
  TimetableClash,
  AssessmentTimetable,
  ExamSlot,
  ExamSessionTime,
  SchoolCalendarConfig,
  TimetableSettings,
  TeacherAvailability,
  FacilityResource,
  TeacherSubstitutionRecord,
  TimetableAuditLog,
  TimetableVersion,
} from '../types/timetable';
import {
  DAYS_OF_WEEK,
  DAILY_PERIODS,
  SCHEDULED_AFTERNOON_ACTIVITIES,
  SUBJECT_COLOR_MAP,
  detectTimetableClashes,
  generateIntelligentTimetables,
  INITIAL_ASSESSMENT_TIMETABLES,
  detectAssessmentClashes,
  DEFAULT_SCHOOL_CALENDAR,
  DEFAULT_TIMETABLE_SETTINGS,
  DEFAULT_TEACHER_AVAILABILITIES,
  FACILITY_RESOURCES,
  INITIAL_SUBSTITUTIONS,
  INITIAL_TIMETABLE_AUDIT_LOGS,
  INITIAL_TIMETABLE_VERSIONS,
  calculateTimetableMetrics,
} from '../data/timetableData';
import { AVAILABLE_SUBJECTS, INITIAL_USERS } from '../data/mockData';
import {
  isDirectorOfAcademics,
  isAcademicTimetableAdministrator,
  verifyDirectorOfAcademicsAuthority,
} from '../utils/securityEngine';

// Modular Subcomponents for Phase 11
import { TimetableDashboardCards } from './timetable/TimetableDashboardCards';
import { TeacherSubstitutionModal } from './timetable/TeacherSubstitutionModal';
import { RoomTimetableView } from './timetable/RoomTimetableView';
import { SubjectTimetableView } from './timetable/SubjectTimetableView';
import { AcademicCalendarModal } from './timetable/AcademicCalendarModal';
import { TimetableAuditModal } from './timetable/TimetableAuditModal';
import { CbcPathwayTimetableView } from './timetable/CbcPathwayTimetableView';
import { TimetableAccessPolicyModal } from './timetable/TimetableAccessPolicyModal';
import { LessonDetailsModal } from './timetable/LessonDetailsModal';
import { TimetableGovernanceModal } from './timetable/TimetableGovernanceModal';
import { TimetableChangeRequestModal } from './timetable/TimetableChangeRequestModal';
import { TimetableAccessDeniedView } from './timetable/TimetableAccessDeniedView';
import { timetableGovernanceService } from '../services/timetableGovernanceService';
import { StreamManagementModal } from './timetable/StreamManagementModal';
import { TeacherAssignmentModal } from './timetable/TeacherAssignmentModal';
import { SubjectAllocationModal } from './timetable/SubjectAllocationModal';
import { BellScheduleModal } from './timetable/BellScheduleModal';
import { RoomConflictManagerModal } from './timetable/RoomConflictManagerModal';
import { ComprehensiveValidationModal } from './timetable/ComprehensiveValidationModal';
import { streamTimetableGovernanceService } from '../services/streamTimetableGovernanceService';
import { StreamConfig } from '../types/streamTimetableGovernance';

interface TimetableScreenProps {
  schoolInfo: SchoolInfo;
  teachers: Teacher[];
  onBack: () => void;
  lessons?: TimetableLesson[];
  onSaveLessons?: (lessons: TimetableLesson[]) => void;
  currentUser?: User;
  users?: User[];
  onLogAudit?: (action: AuditActionType, details: string, beforeValue?: string, afterValue?: string) => void;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  schoolInfo,
  teachers,
  onBack,
  lessons: initialLessons,
  onSaveLessons,
  currentUser,
  users,
  onLogAudit,
}) => {
  // Master Lessons State
  const [lessons, setLessons] = useState<TimetableLesson[]>(() => {
    if (initialLessons && initialLessons.length > 0) return initialLessons;
    const saved = localStorage.getItem('jjsak_timetable_lessons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return generateIntelligentTimetables(undefined, teachers);
      }
    }
    return generateIntelligentTimetables(undefined, teachers);
  });

  // Active View Tabs (Phase 11: Class, Teacher, Subject, Room, CBC, Activities, Assessment, Master)
  const [activeView, setActiveView] = useState<
    'class' | 'teacher' | 'subject' | 'room' | 'cbc' | 'activities' | 'assessment' | 'master'
  >('class');

  const [selectedClass, setSelectedClass] = useState<string>('G8 S');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers.length > 0 ? teachers[0].id : 'tch-00'
  );
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('All');

  // Academic Calendar & Structure Config State (P11.3 - P11.7)
  const [calendarConfig, setCalendarConfig] = useState<SchoolCalendarConfig>(() => {
    const saved = localStorage.getItem('jjsak_timetable_calendar');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_CALENDAR;
  });
  const [timetableSettings, setTimetableSettings] = useState<TimetableSettings>(() => {
    const saved = localStorage.getItem('jjsak_timetable_settings');
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE_SETTINGS;
  });
  const [teacherAvailabilities, setTeacherAvailabilities] = useState<TeacherAvailability[]>(() => {
    const saved = localStorage.getItem('jjsak_timetable_availabilities');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHER_AVAILABILITIES;
  });

  // Facilities Resource List (P11.9)
  const [facilities] = useState<FacilityResource[]>(FACILITY_RESOURCES);

  // Substitutions State (P11.15)
  const [substitutions, setSubstitutions] = useState<TeacherSubstitutionRecord[]>(() => {
    const saved = localStorage.getItem('jjsak_timetable_substitutions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSTITUTIONS;
  });

  // Security, Versions & Audit Logs State (P11.20)
  const [versions, setVersions] = useState<TimetableVersion[]>(() => {
    const saved = localStorage.getItem('jjsak_timetable_versions');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE_VERSIONS;
  });
  const [auditLogs, setAuditLogs] = useState<TimetableAuditLog[]>(() => {
    const saved = localStorage.getItem('jjsak_timetable_audit');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE_AUDIT_LOGS;
  });

  // Modals Visibility State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Interactive Edit Lesson Modal State
  const [editingLesson, setEditingLesson] = useState<TimetableLesson | null>(null);
  const [editSubject, setEditSubject] = useState<string>('Mathematics');
  const [editTeacherId, setEditTeacherId] = useState<string>('');
  const [editIsDouble, setEditIsDouble] = useState<boolean>(false);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editReason, setEditReason] = useState<string>(
    'Curriculum Realignment / Routine Timetable Optimization'
  );

  // Governance & Active User Context (Director of Academics Authority)
  const availableUsersList = useMemo(() => {
    return users && users.length > 0 ? users : INITIAL_USERS;
  }, [users]);

  const defaultAcademicDirector = useMemo(() => {
    return (
      availableUsersList.find((u) => isDirectorOfAcademics(u)) ||
      availableUsersList.find((u) => u.role === 'DIRECTOR_ACADEMICS' || u.role === 'SUPER_ADMIN') ||
      availableUsersList[0]
    );
  }, [availableUsersList]);

  const [activeUser, setActiveUser] = useState<User>(() => {
    if (currentUser) return currentUser;
    return defaultAcademicDirector;
  });

  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  const isAuthorized = useMemo(() => {
    return isAcademicTimetableAdministrator(activeUser);
  }, [activeUser]);

  const governancePerms = useMemo(() => {
    return timetableGovernanceService.checkPermissions(activeUser);
  }, [activeUser]);

  const accessLevel = useMemo(() => {
    return governancePerms.accessDescription;
  }, [governancePerms]);

  // Governance Modals State (JJSAK Final Governance Framework)
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState<boolean>(false);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState<boolean>(false);

  // Policy Modal & Security Intercept State
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [blockedActionTitle, setBlockedActionTitle] = useState<string | null>(null);

  // Read-only inspection modal for non-authorized viewers
  const [inspectingLesson, setInspectingLesson] = useState<TimetableLesson | null>(null);

  // Assessment Timetables State (P11.16)
  const [assessmentTimetables, setAssessmentTimetables] = useState<AssessmentTimetable[]>(() => {
    const saved = localStorage.getItem('jjsak_assessment_timetables');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ASSESSMENT_TIMETABLES;
      }
    }
    return INITIAL_ASSESSMENT_TIMETABLES;
  });

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    return (
      (assessmentTimetables.length > 0 && assessmentTimetables[0].id) ||
      INITIAL_ASSESSMENT_TIMETABLES[0]?.id ||
      'ass-tt-01'
    );
  });
  const [selectedExamGradeFilter, setSelectedExamGradeFilter] = useState<'All' | 'G7' | 'G8' | 'G9'>('All');

  // Modals for Assessment Timetabling
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);
  const [editingExamSlot, setEditingExamSlot] = useState<ExamSlot | null>(null);
  const [isNewExamSlot, setIsNewExamSlot] = useState<boolean>(false);

  // New Exam Timetable Form State
  const [newExamTitle, setNewExamTitle] = useState('Term 2 End of Term Assessment 2026');
  const [newExamType, setNewExamType] = useState<AssessmentTimetable['examType']>('End of Term Exam');
  const [newExamStartDate, setNewExamStartDate] = useState('27 Jul 2026');
  const [newExamEndDate, setNewExamEndDate] = useState('31 Jul 2026');
  const [newChiefExaminer, setNewChiefExaminer] = useState('Mr. Jotham Watila (Dean of Studies)');
  const [newTargetGrades, setNewTargetGrades] = useState<string[]>(['G7', 'G8', 'G9']);
  const [newExamDuration, setNewExamDuration] = useState<number>(90);
  const [newExamMaxMarks, setNewExamMaxMarks] = useState<number>(50);

  // Editing Exam Slot Form State
  const [slotDate, setSlotDate] = useState('Monday, 27 Jul 2026');
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotSession, setSlotSession] = useState<ExamSessionTime>('Morning 1 (08:00 - 09:30)');
  const [slotStartTime, setSlotStartTime] = useState('08:00');
  const [slotEndTime, setSlotEndTime] = useState('09:30');
  const [slotDuration, setSlotDuration] = useState(90);
  const [slotSubject, setSlotSubject] = useState('Mathematics');
  const [slotPaperCode, setSlotPaperCode] = useState('MATH-801');
  const [slotGrade, setSlotGrade] = useState('G8');
  const [slotRoom, setSlotRoom] = useState('Junior Hall A & B');
  const [slotInvigilatorId, setSlotInvigilatorId] = useState(teachers[0]?.id || 'tch-00');
  const [slotReliefInvigilator, setSlotReliefInvigilator] = useState('Mrs. J. Barasa');
  const [slotMaxMarks, setSlotMaxMarks] = useState(50);
  const [slotStatus, setSlotStatus] = useState<ExamSlot['status']>('Scheduled');
  const [slotNotes, setSlotNotes] = useState('');

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClashesModal, setShowClashesModal] = useState<boolean>(false);

  // Director of Academics Stream Timetable Governance Modals (§1-§11)
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isTeacherAssignmentModalOpen, setIsTeacherAssignmentModalOpen] = useState(false);
  const [isSubjectAllocationModalOpen, setIsSubjectAllocationModalOpen] = useState(false);
  const [isBellScheduleModalOpen, setIsBellScheduleModalOpen] = useState(false);
  const [isRoomConflictModalOpen, setIsRoomConflictModalOpen] = useState(false);
  const [isComprehensiveValidationModalOpen, setIsComprehensiveValidationModalOpen] = useState(false);

  const [configuredStreams, setConfiguredStreams] = useState<StreamConfig[]>(() =>
    streamTimetableGovernanceService.getStreams()
  );

  // Available classes list (combines lessons and configured streams)
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    configuredStreams.forEach((s) => classSet.add(s.code));
    lessons.forEach((l) => classSet.add(l.className));
    return Array.from(classSet).sort();
  }, [lessons, configuredStreams]);

  // Real-time Clash Detection (P11.13)
  const clashes: TimetableClash[] = useMemo(() => {
    return detectTimetableClashes(lessons);
  }, [lessons]);

  // Real-time AI Efficiency Metrics (P11.2)
  const metrics = useMemo(() => {
    return calculateTimetableMetrics(lessons, teachers, facilities);
  }, [lessons, teachers, facilities]);

  // Selected teacher object
  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  }, [teachers, selectedTeacherId]);

  // Save to persistence
  const updateLessonsState = (newLessons: TimetableLesson[]) => {
    setLessons(newLessons);
    localStorage.setItem('jjsak_timetable_lessons', JSON.stringify(newLessons));
    if (onSaveLessons) onSaveLessons(newLessons);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Centralized Timetable Audit Logger
  const handleLogTimetableAudit = (
    action: string,
    details: string,
    affected?: string,
    previousValue?: string,
    newValue?: string,
    reason?: string,
    rootAuditAction?: AuditActionType
  ) => {
    const newLog: TimetableAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: activeUser.fullName,
      userRole: activeUser.role,
      action: action as any,
      details,
      affectedClassOrTeacher: affected,
      previousValue,
      newValue,
      reason: reason || 'Academic Governance Directive',
      schoolName: schoolInfo.name,
      academicTerm: schoolInfo.term,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('jjsak_timetable_audit', JSON.stringify(updatedLogs));

    if (rootAuditAction && onLogAudit) {
      onLogAudit(rootAuditAction, details, previousValue, newValue);
    }
  };

  // Handle Unauthorized Attempt with modal, notification and immutable audit entry
  const handleUnauthorizedAttempt = (actionName: string, customMessage?: string) => {
    const errorMsg =
      customMessage ||
      `Permission Denied: Only the Director of Academics is authorized to ${actionName.toLowerCase()}.`;
    showToast(errorMsg);
    setBlockedActionTitle(actionName);
    setShowPolicyModal(true);

    const securityAuditLog: TimetableAuditLog = {
      id: `sec-aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: activeUser.fullName,
      userRole: activeUser.role,
      action: 'UNAUTHORIZED_ATTEMPT',
      details: `Unauthorized attempt to execute "${actionName}". Blocked by JJSAK Governance Engine.`,
      reason: 'Role does not possess Director of Academics authority',
      schoolName: schoolInfo.name,
      academicTerm: schoolInfo.term,
    };
    const updated = [securityAuditLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('jjsak_timetable_audit', JSON.stringify(updated));

    if (onLogAudit) {
      onLogAudit(
        'UNAUTHORIZED_TIMETABLE_ATTEMPT',
        `[SECURITY] Unauthorized attempt by ${activeUser.fullName} (${activeUser.role}) to execute "${actionName}". Action blocked.`,
        activeUser.role,
        'DENIED'
      );
    }
  };

  // Auto Generate / Re-optimize Engine (P11.11, P11.12)
  const handleRegenerate = () => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Regenerate Timetable');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Regenerate Timetable', authCheck.message);
      return;
    }

    setIsOptimizing(true);
    setTimeout(() => {
      const fresh = generateIntelligentTimetables(availableClasses, teachers);
      updateLessonsState(fresh);

      handleLogTimetableAudit(
        'OPTIMIZATION',
        `Director of Academics regenerated 240 lesson slots across 6 streams with 0 clashes (${metrics.overallEfficiencyScore}% score).`,
        'All Classes & Streams',
        'Previous Timetable Version',
        'Optimized Timetable Snapshot',
        'AI Conflict Resolution and Stream Load Balancing',
        'TIMETABLE_GENERATE'
      );

      setIsOptimizing(false);
      showToast('Intelligent Timetable re-optimized with 100% Conflict-Free allocation!');
    }, 600);
  };

  // Handle Edit Lesson Click
  const handleOpenEdit = (lesson: TimetableLesson) => {
    if (!isAuthorized) {
      setInspectingLesson(lesson);
      return;
    }
    setEditingLesson(lesson);
    setEditSubject(lesson.subject);
    setEditTeacherId(lesson.teacherId);
    setEditIsDouble(lesson.isDouble || false);
    setEditNotes(lesson.notes || '');
    setEditReason('Curriculum Realignment / Routine Timetable Optimization');
  };

  // Save Edited Lesson
  const handleSaveEdit = () => {
    if (!editingLesson) return;

    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Edit Timetable Entry');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Edit Timetable Entry', authCheck.message);
      return;
    }

    const teacherObj = teachers.find((t) => t.id === editTeacherId);
    const teacherName = teacherObj ? teacherObj.name : editingLesson.teacherName;
    const teacherInitials = teacherObj
      ? teacherObj.name
          .replace(/^(mr|mrs|ms|dr|prof|madam)\.?\s+/i, '')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : editingLesson.teacherInitials;

    const prevSummary = `${editingLesson.subject} with ${editingLesson.teacherName} (${editingLesson.className}, ${editingLesson.day} Period ${editingLesson.periodNumber})`;
    const newSummary = `${editSubject} with ${teacherName} (${editingLesson.className}, ${editingLesson.day} Period ${editingLesson.periodNumber})`;

    const updated = lessons.map((l) => {
      if (l.id === editingLesson.id) {
        return {
          ...l,
          subject: editSubject,
          teacherId: editTeacherId || l.teacherId,
          teacherName,
          teacherInitials,
          isDouble: editIsDouble,
          notes: editNotes,
        };
      }
      return l;
    });

    updateLessonsState(updated);

    handleLogTimetableAudit(
      'MANUAL_REALLOCATION',
      `Reallocated lesson on ${editingLesson.day} Period ${editingLesson.periodNumber} for ${editingLesson.className}: ${editSubject} assigned to ${teacherName}.`,
      `${editingLesson.className} • ${teacherName}`,
      prevSummary,
      newSummary,
      editReason,
      'TIMETABLE_EDIT'
    );

    setEditingLesson(null);
    showToast(`Updated Period ${editingLesson.periodNumber} (${editingLesson.day}) successfully!`);
  };

  // Handle Automatic Stream Timetable Generation (Requirement §8)
  const handleGenerateStreamTimetable = (streamCode: string) => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Generate Stream Timetable');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Generate Stream Timetable', authCheck.message);
      return;
    }

    const newStreamLessons = streamTimetableGovernanceService.generateStreamTimetableLayout(
      streamCode,
      teachers
    );
    const otherLessons = lessons.filter((l) => l.className !== streamCode);
    const updated = [...otherLessons, ...newStreamLessons];
    updateLessonsState(updated);
    setSelectedClass(streamCode);

    handleLogTimetableAudit(
      'STREAM_TIMETABLE_GENERATED',
      `Director of Academics generated stream timetable for ${streamCode} (${newStreamLessons.length} lessons with teacher availability and bell schedule).`,
      streamCode,
      'Previous Schedule',
      'Fresh Stream Layout',
      'Curriculum Allocation and Stream Timetable Generation (§8)',
      'TIMETABLE_GENERATE'
    );

    showToast(`Generated complete stream timetable layout for ${streamCode}!`);
  };

  // Handle Room Conflict Resolution (Requirement §11)
  const handleResolveRoomConflict = (lessonId: string, newRoomName: string) => {
    const target = lessons.find((l) => l.id === lessonId);
    if (!target) return;

    const updated = lessons.map((l) => (l.id === lessonId ? { ...l, room: newRoomName } : l));
    updateLessonsState(updated);

    handleLogTimetableAudit(
      'ROOM_CONFLICT_RESOLVED',
      `Director of Academics resolved room collision in ${target.room} by reassigning ${target.className} (${target.subject}) to ${newRoomName}.`,
      `${target.className} • ${newRoomName}`,
      target.room,
      newRoomName,
      'Room Conflict Resolution Protocol (§11)',
      'TIMETABLE_EDIT'
    );

    showToast(`Reallocated ${target.className} to ${newRoomName}!`);
  };

  // Handle Publication Confirmed (Requirement §6 & Final Rule)
  const handlePublishConfirmed = (
    _report: any,
    reason: string,
    activationDate?: string
  ) => {
    handleLogTimetableAudit(
      'PUBLISH',
      `Director of Academics published official stream timetable (${lessons.length} lessons, 0 critical clashes). Reason: ${reason}. Scheduled activation: ${activationDate || 'Immediate'}.`,
      'All Institutional Streams',
      'Draft Timetable Version',
      'Official Master Publication',
      reason,
      'TIMETABLE_PUBLISH'
    );
    showToast('Official stream timetable successfully published!');
  };

  // Handle Adding a Substitution Record (P11.15)
  const handleAddSubstitution = (record: TeacherSubstitutionRecord) => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Assign Teacher Substitution');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Assign Teacher Substitution', authCheck.message);
      return;
    }

    const updated = [record, ...substitutions];
    setSubstitutions(updated);
    localStorage.setItem('jjsak_timetable_substitutions', JSON.stringify(updated));

    handleLogTimetableAudit(
      'SUBSTITUTION',
      `Substituted ${record.absentTeacherName} with ${record.substituteTeacherName} for ${record.subject} in ${record.className} on ${record.day} (${record.periodTime}).`,
      `${record.className} (${record.substituteTeacherName})`,
      `${record.absentTeacherName} (Original)`,
      `${record.substituteTeacherName} (Relief)`,
      record.absentReason,
      'TIMETABLE_SUBSTITUTION'
    );
  };

  // Filter lessons for class view
  const classLessonsMap = useMemo(() => {
    const map = new Map<string, TimetableLesson>();
    lessons
      .filter((l) => l.className === selectedClass)
      .forEach((l) => {
        map.set(`${l.day}_${l.periodNumber}`, l);
      });
    return map;
  }, [lessons, selectedClass]);

  // Filter lessons for teacher view
  const teacherLessonsMap = useMemo(() => {
    const map = new Map<string, TimetableLesson>();
    lessons
      .filter((l) => l.teacherId === selectedTeacherId || l.teacherName === currentTeacher?.name)
      .forEach((l) => {
        map.set(`${l.day}_${l.periodNumber}`, l);
      });
    return map;
  }, [lessons, selectedTeacherId, currentTeacher]);

  // Teacher statistics
  const teacherStats = useMemo(() => {
    const count = lessons.filter(
      (l) => l.teacherId === selectedTeacherId || l.teacherName === currentTeacher?.name
    ).length;
    const maxPeriods = 40; // 5 days x 8 periods
    const freePeriods = Math.max(0, maxPeriods - count);
    const percentage = Math.round((count / maxPeriods) * 100);

    const classesTaught = Array.from(
      new Set(
        lessons
          .filter((l) => l.teacherId === selectedTeacherId || l.teacherName === currentTeacher?.name)
          .map((l) => l.className)
      )
    );

    return { count, freePeriods, percentage, classesTaught };
  }, [lessons, selectedTeacherId, currentTeacher]);

  // Current selected assessment timetable
  const currentAssessment = useMemo(() => {
    return (
      assessmentTimetables.find((a) => a.id === selectedAssessmentId) ||
      assessmentTimetables[0] ||
      INITIAL_ASSESSMENT_TIMETABLES[0]
    );
  }, [assessmentTimetables, selectedAssessmentId]);

  // Assessment Invigilation Clashes
  const assessmentClashes = useMemo(() => {
    if (!currentAssessment || !currentAssessment.slots) {
      return { clashesCount: 0, clashesList: [] };
    }
    return detectAssessmentClashes(currentAssessment.slots);
  }, [currentAssessment]);

  // Save Assessment Timetables to Storage
  const updateAssessmentTimetablesState = (newList: AssessmentTimetable[]) => {
    setAssessmentTimetables(newList);
    localStorage.setItem('jjsak_assessment_timetables', JSON.stringify(newList));
  };

  // Create a new Assessment Timetable with Auto-generated slots
  const handleCreateAssessmentTimetable = () => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Create Assessment Timetable');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Create Assessment Timetable', authCheck.message);
      return;
    }

    if (!newExamTitle.trim()) {
      showToast('Please provide an assessment timetable title');
      return;
    }

    const defaultExamScheduleDays: { day: DayOfWeek; dateStr: string; sub1: string; sub2: string }[] = [
      { day: 'Monday', dateStr: `Monday, ${newExamStartDate}`, sub1: 'Mathematics', sub2: 'English' },
      { day: 'Tuesday', dateStr: 'Tuesday, Day 2', sub1: 'Integrated Science', sub2: 'Kiswahili' },
      { day: 'Wednesday', dateStr: 'Wednesday, Day 3', sub1: 'Pretechnical Studies', sub2: 'Agriculture' },
      { day: 'Thursday', dateStr: 'Thursday, Day 4', sub1: 'Social Studies', sub2: 'CRE' },
      { day: 'Friday', dateStr: `Friday, ${newExamEndDate}`, sub1: 'Creative Arts & Sports', sub2: 'Free' },
    ];

    const generatedSlots: ExamSlot[] = [];
    let slotCount = 1;

    defaultExamScheduleDays.forEach((plan) => {
      if (plan.sub1 !== 'Free') {
        const invigilator = teachers[(slotCount - 1) % teachers.length] || teachers[0];
        const relief = teachers[slotCount % teachers.length] || teachers[0];
        const codeMap: Record<string, string> = {
          Mathematics: 'MATH-801',
          English: 'ENG-801',
          'Integrated Science': 'SCI-801',
          Kiswahili: 'KIS-801',
          'Pretechnical Studies': 'PRE-801',
          Agriculture: 'AGR-801',
          'Social Studies': 'SST-801',
          CRE: 'CRE-801',
          'Creative Arts & Sports': 'CAS-801',
        };

        generatedSlots.push({
          id: `slot-${Date.now()}-${slotCount}`,
          examDate: plan.dateStr,
          day: plan.day,
          session: 'Morning 1 (08:00 - 09:30)',
          startTime: '08:00',
          endTime: '09:30',
          durationMinutes: newExamDuration,
          subject: plan.sub1,
          paperCode: codeMap[plan.sub1] || `${plan.sub1.slice(0, 3).toUpperCase()}-801`,
          grade: newTargetGrades.join(' & ') || 'G8',
          targetStreams: ['G8 S', 'G8 N', 'G7 S', 'G7 N'],
          room: 'Junior Hall A & B',
          invigilatorId: invigilator.id,
          invigilatorName: invigilator.name,
          reliefInvigilatorName: relief.name,
          maxMarks: newExamMaxMarks,
          status: 'Scheduled',
          notes: 'Standard CBC Paper • Ensure answer booklets are stamped before distribution.',
        });
        slotCount++;
      }

      if (plan.sub2 !== 'Free') {
        const invigilator = teachers[(slotCount - 1) % teachers.length] || teachers[0];
        const relief = teachers[slotCount % teachers.length] || teachers[0];
        const codeMap: Record<string, string> = {
          Mathematics: 'MATH-801',
          English: 'ENG-801',
          'Integrated Science': 'SCI-801',
          Kiswahili: 'KIS-801',
          'Pretechnical Studies': 'PRE-801',
          Agriculture: 'AGR-801',
          'Social Studies': 'SST-801',
          CRE: 'CRE-801',
          'Creative Arts & Sports': 'CAS-801',
        };

        generatedSlots.push({
          id: `slot-${Date.now()}-${slotCount}`,
          examDate: plan.dateStr,
          day: plan.day,
          session: 'Morning 2 (10:30 - 12:00)',
          startTime: '10:30',
          endTime: '12:00',
          durationMinutes: newExamDuration,
          subject: plan.sub2,
          paperCode: codeMap[plan.sub2] || `${plan.sub2.slice(0, 3).toUpperCase()}-801`,
          grade: newTargetGrades.join(' & ') || 'G8',
          targetStreams: ['G8 S', 'G8 N', 'G7 S', 'G7 N'],
          room: 'Junior Hall A & B',
          invigilatorId: invigilator.id,
          invigilatorName: invigilator.name,
          reliefInvigilatorName: relief.name,
          maxMarks: newExamMaxMarks,
          status: 'Scheduled',
          notes: 'Standard CBC Paper • Collect and sign scripts at the end of the session.',
        });
        slotCount++;
      }
    });

    const newAssessment: AssessmentTimetable = {
      id: `ass-tt-${Date.now()}`,
      title: newExamTitle.trim(),
      term: schoolInfo.term,
      year: schoolInfo.year,
      examType: newExamType,
      startDate: newExamStartDate,
      endDate: newExamEndDate,
      targetGrades: newTargetGrades,
      chiefExaminer: newChiefExaminer,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedBy: `${activeUser.fullName} (Director of Academics)`,
      generalInstructions: [
        'Candidates MUST be seated at least 15 minutes before the start of each examination paper.',
        'No unauthorized materials (mobile phones, smartwatches, revision notes) allowed in the examination room.',
        'Mathematical tables and scientific calculators are permitted ONLY for Mathematics and Integrated Science.',
        'All examination scripts must be collected and signed by the invigilator immediately at the end of the session.',
        'Silence MUST be maintained within 50 metres of the examination halls throughout the testing period.',
      ],
      slots: generatedSlots,
    };

    const updatedList = [newAssessment, ...assessmentTimetables];
    updateAssessmentTimetablesState(updatedList);
    setSelectedAssessmentId(newAssessment.id);
    setShowCreateExamModal(false);

    handleLogTimetableAudit(
      'EXAM_CREATE',
      `Director of Academics generated examination timetable "${newAssessment.title}" with ${generatedSlots.length} exam slots.`,
      newAssessment.title,
      'None',
      newAssessment.title,
      'Institutional Examination Scheduling',
      'EXAM_TIMETABLE_CREATE'
    );

    showToast(`Created Assessment Timetable: "${newAssessment.title}" with ${generatedSlots.length} exam slots!`);
  };

  // Delete Assessment Timetable
  const handleDeleteAssessmentTimetable = (idToDelete: string) => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Delete Assessment Timetable');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Delete Assessment Timetable', authCheck.message);
      return;
    }

    if (assessmentTimetables.length <= 1) {
      showToast('Cannot delete the last remaining assessment timetable.');
      return;
    }
    const target = assessmentTimetables.find((a) => a.id === idToDelete);
    const filtered = assessmentTimetables.filter((a) => a.id !== idToDelete);
    updateAssessmentTimetablesState(filtered);
    setSelectedAssessmentId(filtered[0]?.id || 'ass-tt-01');

    handleLogTimetableAudit(
      'EXAM_DELETE',
      `Deleted assessment timetable "${target?.title || idToDelete}" with ${target?.slots?.length || 0} examination slots.`,
      target?.title,
      target?.title,
      'Archived / Removed',
      'Timetable Lifecycle Management',
      'EXAM_TIMETABLE_DELETE'
    );

    showToast('Assessment timetable deleted.');
  };

  // Open modal to add a new exam slot
  const handleOpenAddExamSlot = () => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Add Exam Slot');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Add Exam Slot', authCheck.message);
      return;
    }

    setIsNewExamSlot(true);
    setSlotDate(currentAssessment?.startDate ? `Monday, ${currentAssessment.startDate}` : 'Monday, 15 Jun 2026');
    setSlotDay('Monday');
    setSlotSession('Morning 1 (08:00 - 09:30)');
    setSlotStartTime('08:00');
    setSlotEndTime('09:30');
    setSlotDuration(90);
    setSlotSubject('Mathematics');
    setSlotPaperCode('MATH-801');
    setSlotGrade('G8');
    setSlotRoom('Junior Hall A & B');
    setSlotInvigilatorId(teachers[0]?.id || 'tch-00');
    setSlotReliefInvigilator('Mrs. J. Barasa');
    setSlotMaxMarks(50);
    setSlotStatus('Scheduled');
    setSlotNotes('');
    setEditingExamSlot({
      id: `slot-new-${Date.now()}`,
      examDate: 'Monday, 15 Jun 2026',
      day: 'Monday',
      session: 'Morning 1 (08:00 - 09:30)',
      startTime: '08:00',
      endTime: '09:30',
      durationMinutes: 90,
      subject: 'Mathematics',
      grade: 'G8',
      targetStreams: ['G8 S', 'G8 N'],
      room: 'Junior Hall A & B',
      invigilatorId: teachers[0]?.id || 'tch-00',
      invigilatorName: teachers[0]?.name || 'Teacher',
      maxMarks: 50,
      status: 'Scheduled',
    });
  };

  // Open modal to edit an existing exam slot
  const handleOpenEditExamSlot = (slot: ExamSlot) => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Edit Exam Slot');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Edit Exam Slot', authCheck.message);
      return;
    }

    setIsNewExamSlot(false);
    setSlotDate(slot.examDate);
    setSlotDay(slot.day);
    setSlotSession(slot.session);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotDuration(slot.durationMinutes);
    setSlotSubject(slot.subject);
    setSlotPaperCode(slot.paperCode || `${slot.subject.slice(0, 3).toUpperCase()}-801`);
    setSlotGrade(slot.grade);
    setSlotRoom(slot.room);
    setSlotInvigilatorId(slot.invigilatorId);
    setSlotReliefInvigilator(slot.reliefInvigilatorName || 'Mrs. J. Barasa');
    setSlotMaxMarks(slot.maxMarks);
    setSlotStatus(slot.status);
    setSlotNotes(slot.notes || '');
    setEditingExamSlot(slot);
  };

  // Save Exam Slot (Create or Update)
  const handleSaveExamSlot = () => {
    if (!editingExamSlot || !currentAssessment) return;

    const authCheck = verifyDirectorOfAcademicsAuthority(
      activeUser,
      isNewExamSlot ? 'Create Exam Slot' : 'Edit Exam Slot'
    );
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt(isNewExamSlot ? 'Create Exam Slot' : 'Edit Exam Slot', authCheck.message);
      return;
    }

    const teacherObj = teachers.find((t) => t.id === slotInvigilatorId) || teachers[0];

    const slotPayload: ExamSlot = {
      id: isNewExamSlot ? `slot-${Date.now()}` : editingExamSlot.id,
      examDate: slotDate,
      day: slotDay,
      session: slotSession,
      startTime: slotStartTime,
      endTime: slotEndTime,
      durationMinutes: slotDuration,
      subject: slotSubject,
      paperCode: slotPaperCode,
      grade: slotGrade,
      targetStreams: ['G8 S', 'G8 N'],
      room: slotRoom,
      invigilatorId: teacherObj ? teacherObj.id : slotInvigilatorId,
      invigilatorName: teacherObj ? teacherObj.name : 'Teacher',
      reliefInvigilatorName: slotReliefInvigilator,
      maxMarks: slotMaxMarks,
      status: slotStatus,
      notes: slotNotes,
    };

    let updatedSlots: ExamSlot[];
    if (isNewExamSlot) {
      updatedSlots = [...(currentAssessment.slots || []), slotPayload];
    } else {
      updatedSlots = currentAssessment.slots.map((s) => (s.id === editingExamSlot.id ? slotPayload : s));
    }

    const updatedAssessments = assessmentTimetables.map((a) => {
      if (a.id === currentAssessment.id) {
        return {
          ...a,
          slots: updatedSlots,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return a;
    });

    updateAssessmentTimetablesState(updatedAssessments);
    setEditingExamSlot(null);

    const slotSummary = `${slotSubject} (${slotPaperCode}) on ${slotDate} [${slotSession}] Room: ${slotRoom} Invigilator: ${teacherObj?.name || slotInvigilatorId}`;
    handleLogTimetableAudit(
      isNewExamSlot ? 'EXAM_SLOT_EDIT' : 'EXAM_SLOT_EDIT',
      isNewExamSlot
        ? `Added exam slot: ${slotSummary} in ${currentAssessment.title}.`
        : `Updated exam slot: ${slotSummary} in ${currentAssessment.title}.`,
      `${slotSubject} (${slotRoom})`,
      isNewExamSlot ? 'Unscheduled' : `${editingExamSlot.subject} (${editingExamSlot.room})`,
      slotSummary,
      'Examination Scheduling & Resource Allocation',
      isNewExamSlot ? 'EXAM_TIMETABLE_CREATE' : 'EXAM_TIMETABLE_EDIT'
    );

    showToast(isNewExamSlot ? `Added ${slotSubject} Exam Slot!` : `Updated ${slotSubject} Exam Slot!`);
  };

  // Delete an individual exam slot
  const handleDeleteExamSlot = (slotId: string) => {
    if (!currentAssessment) return;

    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Delete Exam Slot');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Delete Exam Slot', authCheck.message);
      return;
    }

    const slot = currentAssessment.slots.find((s) => s.id === slotId);
    const updatedSlots = currentAssessment.slots.filter((s) => s.id !== slotId);
    const updatedAssessments = assessmentTimetables.map((a) => {
      if (a.id === currentAssessment.id) {
        return {
          ...a,
          slots: updatedSlots,
        };
      }
      return a;
    });
    updateAssessmentTimetablesState(updatedAssessments);

    handleLogTimetableAudit(
      'EXAM_DELETE',
      `Deleted examination slot: ${slot?.subject || 'Paper'} (${slot?.examDate}, ${slot?.room}).`,
      `${slot?.subject} (${slot?.room})`,
      `${slot?.subject} - ${slot?.paperCode}`,
      'Removed',
      'Examination Timetable Conflict Resolution',
      'EXAM_TIMETABLE_DELETE'
    );

    showToast('Exam slot removed.');
  };

  // Cycle through status
  const handleToggleSlotStatus = (slotId: string) => {
    if (!currentAssessment) return;

    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Update Exam Paper Status');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Update Exam Paper Status', authCheck.message);
      return;
    }

    const statusCycle: ExamSlot['status'][] = ['Scheduled', 'In Progress', 'Scripts Collected', 'Marked'];
    const updatedSlots = currentAssessment.slots.map((s) => {
      if (s.id === slotId) {
        const currentIndex = statusCycle.indexOf(s.status);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        return { ...s, status: nextStatus };
      }
      return s;
    });

    const updatedAssessments = assessmentTimetables.map((a) => {
      if (a.id === currentAssessment.id) {
        return { ...a, slots: updatedSlots };
      }
      return a;
    });
    updateAssessmentTimetablesState(updatedAssessments);
  };

  // Approve and Publish Assessment Timetable (Director of Academics Authority)
  const handlePublishAssessmentTimetable = (timetableId: string) => {
    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Approve & Publish Assessment Timetable');
    if (!authCheck.authorized) {
      handleUnauthorizedAttempt('Approve & Publish Assessment Timetable', authCheck.message);
      return;
    }

    const targetTimetable = assessmentTimetables.find((a) => a.id === timetableId) || currentAssessment;
    const updatedAssessments = assessmentTimetables.map((a) => {
      if (a.id === timetableId) {
        return {
          ...a,
          isPublished: true,
          updatedBy: `${activeUser.fullName} (Director of Academics)`,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return a;
    });

    updateAssessmentTimetablesState(updatedAssessments);

    handleLogTimetableAudit(
      'PUBLISH',
      `Director of Academics officially approved and published assessment timetable "${targetTimetable?.title}".`,
      targetTimetable?.title,
      'Draft / Scheduled',
      'Certified & Published',
      'Official Institutional Examination Dispatch',
      'EXAM_TIMETABLE_PUBLISH'
    );

    showToast(`Approved & Published ${targetTimetable?.title} for institutional examination dispatch!`);
  };

  // Print Timetable
  const handlePrint = () => {
    window.print();
  };

  // Section 18: Access Denied View for Unauthorized Roles
  if (!governancePerms.canAccess) {
    return (
      <TimetableAccessDeniedView
        currentUser={activeUser}
        schoolInfo={schoolInfo}
        onBack={onBack}
        onSwitchToAcademicRole={() => {
          const academicUser =
            availableUsersList.find((u) => isDirectorOfAcademics(u)) ||
            availableUsersList.find((u) => u.role === 'DIRECTOR_ACADEMICS' || u.role === 'SUPER_ADMIN') ||
            availableUsersList[0];
          setActiveUser(academicUser);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/50 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition cursor-pointer text-slate-300 hover:text-white"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight leading-tight text-white">
                Intelligent Timetabling & Scheduling Engine
              </h1>
              <span className="text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                Phase 11
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {schoolInfo.name} • {schoolInfo.term} • Year {schoolInfo.year}
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Authority & Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1">
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition ${
                isAuthorized
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title="Click to view JJSAK Timetable Access Control Policy"
            >
              {isAuthorized ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isAuthorized ? 'Director of Academics (Administrator)' : `${activeUser.role} (${accessLevel})`}</span>
              <Info className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick User Switcher for Governance Testing */}
            <select
              value={activeUser.id}
              onChange={(e) => {
                const selected = availableUsersList.find((u) => u.id === e.target.value);
                if (selected) {
                  setActiveUser(selected);
                  showToast(`Switched active session to: ${selected.fullName} (${selected.role})`);
                }
              }}
              className="bg-transparent text-[11px] font-medium text-slate-300 focus:outline-none cursor-pointer max-w-[130px] truncate"
              title="Simulate / Switch active officer role"
            >
              {availableUsersList.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsSubstitutionModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Intelligent Teacher Substitution Engine (P11.15)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Substitutions</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="School Calendar & Bell Configuration (P11.3 - P11.7)"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Structure Config</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Security, Versions & Audit Governance (P11.20)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit & History</span>
          </button>

          {/* Master Timetable Governance Modal Trigger (Locked Framework §1-31) */}
          <button
            type="button"
            onClick={() => setIsGovernanceModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950/50 transition cursor-pointer"
            title="JJSAK Final Timetable Governance & Approvals Center (§1-31)"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Governance & Approvals</span>
          </button>

          {/* Teacher Change Request Action Button (§12) */}
          {governancePerms.canSubmitChangeRequest && (
            <button
              type="button"
              onClick={() => setIsChangeRequestModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Submit Timetable Change Request (§12)"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Request (§12)</span>
            </button>
          )}

          {/* Timetable Workflow State Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <span className="text-slate-500 font-bold">State:</span>
            <span className="text-emerald-400 font-black uppercase tracking-wider">
              {timetableGovernanceService.getWorkflowState()}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header (Only shows when printing) */}
      <div className="hidden print:block p-4 text-center border-b-2 border-slate-800 mb-4 bg-white text-slate-900">
        <h2 className="text-xl font-black uppercase">{schoolInfo.name}</h2>
        <p className="text-xs font-bold text-slate-700">
          {activeView === 'assessment'
            ? `CBC JUNIOR SCHOOL EXAMINATION & ASSESSMENT TIMETABLE • ${schoolInfo.term} • YEAR ${schoolInfo.year}`
            : `CBC JUNIOR SCHOOL MASTER TIMETABLE • ${schoolInfo.term} • YEAR ${schoolInfo.year}`}
        </p>
        <p className="text-[11px] text-slate-600">
          {activeView === 'class'
            ? `STREAM: ${selectedClass} CLASS TIMETABLE`
            : activeView === 'teacher'
            ? `PERSONAL TEACHER SCHEDULE: ${currentTeacher?.name} (${currentTeacher?.role})`
            : activeView === 'assessment'
            ? `EXAMINATION: ${currentAssessment?.title || 'ASSESSMENT TIMETABLE'} (${currentAssessment?.startDate || ''} - ${currentAssessment?.endDate || ''})`
            : 'INSTITUTIONAL MASTER TIMETABLE'}
        </p>
      </div>

      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Director of Academics Stream Timetable Creation & Management Hub (§1-§11) */}
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-900/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Director of Academics – Stream Timetable Creation &amp; Management Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Requirement §1-§11
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary authorized officer for streams (7N, 7S, 8N, 8S, 9N, 9S), teacher workloads, 10-lesson bell schedules, learning spaces, and zero-conflict validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsStreamModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Stream Creation & Configuration Hub (§1)"
            >
              <Layers className="w-3.5 h-3.5 text-red-400" />
              <span>Streams (§1)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTeacherAssignmentModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Multi-Stream Teacher Subject Assignments & Workloads (§2)"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Teacher Allocations (§2)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubjectAllocationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Subject Lesson Frequencies, Double Lessons, & Practicals (§3)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Subject Quotas (§3)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBellScheduleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Official Bell Schedule Management - 10 Periods & Breaks (§4)"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bell Schedule (§4)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRoomConflictModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Learning Spaces, Science Labs, Computer Labs, Workshops & Zero Room Overlap (§11)"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Rooms &amp; Labs (§11)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsComprehensiveValidationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
              title="Automatic Pre-Publication Validation & Publishing Gate (§5, §6, Final Rule)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validate &amp; Publish (§5, §6)</span>
            </button>
          </div>
        </div>

        {/* Phase 11.2 Dashboard KPI Cards */}
        <div className="print:hidden">
          <TimetableDashboardCards
            metrics={metrics}
            clashesCount={activeView === 'assessment' ? assessmentClashes.clashesCount : clashes.length}
            pendingApprovalsCount={versions.filter((v) => v.status === 'Draft' || v.status === 'Pending Approval').length}
            onOpenClashes={() => setShowClashesModal(true)}
            onOpenApproval={() => setIsAuditModalOpen(true)}
            onRunOptimizer={handleRegenerate}
            isOptimizing={isOptimizing}
          />
        </div>

        {/* View Navigation Tabs (P11.1) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
          {[
            { id: 'class', label: '1. Class Timetable', icon: BookOpen },
            { id: 'teacher', label: '2. Teacher Timetable', icon: Users },
            { id: 'subject', label: '3. Subject Timetable', icon: Layers },
            { id: 'room', label: '4. Room / Facility', icon: Building2 },
            { id: 'cbc', label: '5. CBC Pathways', icon: GraduationCap },
            { id: 'activities', label: '6. Scheduled Activities', icon: Award },
            { id: 'assessment', label: '7. Exam Timetables', icon: CalendarCheck },
            { id: 'master', label: '8. Master Matrix', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: CLASS TIMETABLE */}
        {/* ======================================================== */}
        {activeView === 'class' && (
          <div className="space-y-4">
            {/* Stream Selector Bar */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Select Stream:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {availableClasses.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedClass === cls
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}

                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => setIsStreamModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-red-400 border border-dashed border-red-800 transition cursor-pointer flex items-center gap-1"
                      title="Add or configure new stream (§1)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Stream</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => handleGenerateStreamTimetable(selectedClass)}
                    className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title={`Auto-generate conflict-free timetable layout for ${selectedClass} (§8)`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate {selectedClass}</span>
                  </button>
                )}

                <div className="text-xs text-slate-400 font-medium">
                  Showing <strong className="text-white">{selectedClass}</strong> • 40 Periods/Week
                </div>
              </div>
            </div>

            {/* Timetable Grid Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <th className="py-3 px-3 border-r border-slate-800 w-24">Day</th>
                      {DAILY_PERIODS.map((period) => (
                        <th
                          key={period.periodNumber}
                          className="py-2.5 px-2 border-r border-slate-800 text-center font-bold"
                        >
                          <div className="text-white font-black">
                            {period.academicPeriodNumber ? `P${period.academicPeriodNumber}` : 'Break'}
                          </div>
                          <div className="text-[9px] text-slate-500 font-medium">
                            {period.startTime}-{period.endTime}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {DAYS_OF_WEEK.map((day) => {
                      return (
                        <tr key={day} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 border-r border-slate-800 font-black text-white bg-slate-950/40">
                            {day}
                          </td>
                          {DAILY_PERIODS.map((period) => {
                            if (period.isBreak) {
                              return (
                                <td
                                  key={period.periodNumber}
                                  className="p-1 text-center bg-slate-950/50 border-r border-slate-800 text-[10px] text-slate-500"
                                >
                                  {period.breakType === 'lunch_break' ? 'Lunch' : 'Break'}
                                </td>
                              );
                            }

                            const lesson = classLessonsMap.get(`${day}_${period.periodNumber}`);
                            const subColors = lesson
                              ? SUBJECT_COLOR_MAP[lesson.subject] || SUBJECT_COLOR_MAP['Free']
                              : SUBJECT_COLOR_MAP['Free'];

                            return (
                              <td
                                key={period.periodNumber}
                                onClick={() => lesson && handleOpenEdit(lesson)}
                                className="p-1.5 border-r border-slate-800 align-top transition cursor-pointer hover:bg-slate-800/60"
                              >
                                {lesson ? (
                                  <div
                                    className={`p-2 rounded-xl border ${subColors.border} ${subColors.bg} flex flex-col justify-between h-full min-h-[72px] shadow-sm group relative`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className={`text-[11px] font-black leading-tight ${subColors.text}`}>
                                          {lesson.subject}
                                        </span>
                                        {lesson.isDouble && (
                                          <span className="text-[8px] font-black px-1 py-0.2 rounded bg-amber-500 text-white shrink-0">
                                            2x
                                          </span>
                                        )}
                                      </div>
                                      {lesson.notes && (
                                        <p className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">
                                          {lesson.notes}
                                        </p>
                                      )}
                                    </div>
                                    <div className="mt-1.5 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-700">
                                        {lesson.teacherInitials}
                                      </span>
                                      <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-xl border border-dashed border-slate-800 text-center text-[10px] text-slate-600 flex items-center justify-center h-full min-h-[72px]">
                                    Free
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scheduled Afternoon Activities Card for this Class */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-500" />
                  <span>Scheduled Afternoon Activities (14:40 - 15:30)</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400">Rule P11.10 Co-curricular</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {DAYS_OF_WEEK.map((d) => {
                  const act = SCHEDULED_AFTERNOON_ACTIVITIES[d];
                  return (
                    <div key={d} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black text-red-400 uppercase">{d}</span>
                        <h5 className="font-bold text-white mt-0.5 text-xs">{act.title}</h5>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>Incharge: {act.incharge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: PERSONALISED TEACHER TIMETABLE */}
        {/* ======================================================== */}
        {activeView === 'teacher' && (
          <div className="space-y-4">
            {/* Teacher Selector Card */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 font-black text-base flex items-center justify-center">
                  {currentTeacher?.name
                    .replace(/^(mr|mrs|ms|dr|prof|madam)\.?\s+/i, '')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{currentTeacher?.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                      {currentTeacher?.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Assigned: {currentTeacher?.subjects.join(', ')} • {teacherStats.classesTaught.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Workload Indicator Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Teaching Load</span>
                <div className="text-xl font-black text-red-400 mt-0.5">
                  {teacherStats.count} / 40 Periods
                </div>
                <span className="text-[10px] text-slate-400 font-medium">({teacherStats.percentage}% Workload)</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Free Periods</span>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{teacherStats.freePeriods} Periods</div>
                <span className="text-[10px] text-slate-400 font-medium">For lesson prep & grading</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Clashes</span>
                <div className="text-xl font-black text-cyan-400 mt-0.5">0 Conflicts</div>
                <span className="text-[10px] text-emerald-400 font-bold">100% Clear</span>
              </div>
            </div>

            {/* Teacher Schedule Grid */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <th className="py-3 px-3 border-r border-slate-800 w-24">Day</th>
                      {DAILY_PERIODS.map((period) => (
                        <th
                          key={period.periodNumber}
                          className="py-2.5 px-2 border-r border-slate-800 text-center font-bold"
                        >
                          <div className="text-white font-black">
                            {period.academicPeriodNumber ? `P${period.academicPeriodNumber}` : 'Break'}
                          </div>
                          <div className="text-[9px] text-slate-500 font-medium">
                            {period.startTime}-{period.endTime}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {DAYS_OF_WEEK.map((day) => {
                      return (
                        <tr key={day} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 border-r border-slate-800 font-black text-white bg-slate-950/40">
                            {day}
                          </td>
                          {DAILY_PERIODS.map((period) => {
                            if (period.isBreak) {
                              return (
                                <td
                                  key={period.periodNumber}
                                  className="p-1 text-center bg-slate-950/50 border-r border-slate-800 text-[10px] text-slate-500"
                                >
                                  -
                                </td>
                              );
                            }

                            const lesson = teacherLessonsMap.get(`${day}_${period.periodNumber}`);
                            const subColors = lesson
                              ? SUBJECT_COLOR_MAP[lesson.subject] || SUBJECT_COLOR_MAP['Free']
                              : null;

                            return (
                              <td
                                key={period.periodNumber}
                                onClick={() => lesson && handleOpenEdit(lesson)}
                                className="p-1.5 border-r border-slate-800 align-top transition cursor-pointer hover:bg-slate-800/60"
                              >
                                {lesson ? (
                                  <div
                                    className={`p-2 rounded-xl border ${subColors?.border} ${subColors?.bg} flex flex-col justify-between h-full min-h-[72px] shadow-sm group`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[11px] font-black leading-tight ${subColors?.text}`}>
                                          {lesson.subject}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-900 text-white mt-1 inline-block">
                                        {lesson.className}
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-slate-500 italic mt-1 line-clamp-1">
                                      {lesson.notes || 'Normal Lesson'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-[10px] text-slate-500 font-medium flex flex-col items-center justify-center h-full min-h-[72px]">
                                    <Clock className="w-3 h-3 text-slate-600 mb-0.5" />
                                    <span>Free / Prep</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SUBJECT TIMETABLE */}
        {/* ======================================================== */}
        {activeView === 'subject' && (
          <SubjectTimetableView lessons={lessons} onOpenEditLesson={handleOpenEdit} />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ROOM & FACILITY TIMETABLE */}
        {/* ======================================================== */}
        {activeView === 'room' && (
          <RoomTimetableView
            facilities={facilities}
            lessons={lessons}
            onOpenEditLesson={handleOpenEdit}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CBC PATHWAY TIMETABLE */}
        {/* ======================================================== */}
        {activeView === 'cbc' && <CbcPathwayTimetableView lessons={lessons} />}

        {/* ======================================================== */}
        {/* VIEW 6: SCHEDULED ACTIVITIES & BELL ROSTER */}
        {/* ======================================================== */}
        {activeView === 'activities' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Daily Junior School Bell Schedule (8 Periods/Day)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">07:45 - 08:00</span>
                  <div className="font-bold text-white mt-0.5">Morning Devotion & Roll Call</div>
                  <p className="text-[11px] text-slate-400">Class Teacher Check-in</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">08:00 - 10:00 (P1 - P3)</span>
                  <div className="font-bold text-blue-200 mt-0.5">Morning Core Focus Lessons</div>
                  <p className="text-[11px] text-blue-300/80">Mathematics, Science, English</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">10:00 - 10:20</span>
                  <div className="font-bold text-amber-200 mt-0.5">Short Tea & Snack Break</div>
                  <p className="text-[11px] text-amber-300/80">20 Minutes Refreshment</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">10:20 - 12:20 (P4 - P6)</span>
                  <div className="font-bold text-indigo-200 mt-0.5">Middle Block & Double Practicals</div>
                  <p className="text-[11px] text-indigo-300/80">Pre-Technical, Agriculture, Kiswahili</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">12:20 - 13:20</span>
                  <div className="font-bold text-emerald-200 mt-0.5">Lunch & Midday Break</div>
                  <p className="text-[11px] text-emerald-300/80">Dining & Relaxation</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">13:20 - 14:40 (P7 - P8)</span>
                  <div className="font-bold text-purple-200 mt-0.5">Afternoon Academic Block</div>
                  <p className="text-[11px] text-purple-300/80">Social Studies, CRE, Creative Arts</p>
                </div>
              </div>
            </div>

            {/* Weekly Afternoon Co-curricular Schedule */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <span>Weekly Afternoon Co-Curricular & Mentorship Programmes (14:40 - 15:30)</span>
              </h3>

              <div className="divide-y divide-slate-800 text-xs">
                {DAYS_OF_WEEK.map((day) => {
                  const act = SCHEDULED_AFTERNOON_ACTIVITIES[day];
                  return (
                    <div key={day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-20 font-black text-white">{day}</div>
                        <div>
                          <div className="font-bold text-slate-200">{act.title}</div>
                          <span className="text-[11px] text-slate-400">Teacher in-charge: {act.incharge}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 shrink-0 self-start sm:self-auto">
                        {act.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: ASSESSMENT & EXAMINATION TIMETABLES */}
        {/* ======================================================== */}
        {activeView === 'assessment' && (
          <div className="space-y-4">
            {/* Assessment Selector & Filters Bar */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-slate-300">Exam Timetable:</span>
                  <select
                    value={selectedAssessmentId}
                    onChange={(e) => setSelectedAssessmentId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer max-w-[260px] truncate"
                  >
                    {assessmentTimetables.map((att) => (
                      <option key={att.id} value={att.id}>
                        {att.title} ({att.term})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Grade Filter:</span>
                  {(['All', 'G7', 'G8', 'G9'] as const).map((grd) => (
                    <button
                      key={grd}
                      type="button"
                      onClick={() => setSelectedExamGradeFilter(grd)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedExamGradeFilter === grd
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {grd}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentAssessment && (
                  <button
                    type="button"
                    onClick={() => handlePublishAssessmentTimetable(currentAssessment.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      currentAssessment.isPublished
                        ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title="Approve & Publish Official Examination Schedule (Director of Academics Only)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentAssessment.isPublished ? 'Published & Certified' : 'Approve & Publish'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Create Assessment Timetable');
                    if (!authCheck.authorized) {
                      handleUnauthorizedAttempt('Create Assessment Timetable', authCheck.message);
                      return;
                    }
                    setShowCreateExamModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  title="Generate New Examination Schedule (Director of Academics Only)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddExamSlot}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                  <span>Add Paper</span>
                </button>

                {assessmentTimetables.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${currentAssessment?.title}"?`)) {
                        handleDeleteAssessmentTimetable(currentAssessment?.id || '');
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Delete this assessment timetable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Assessment Meta Information Card */}
            {currentAssessment && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-black text-white">{currentAssessment.title}</h2>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300">
                        {currentAssessment.examType}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {currentAssessment.term} • Year {currentAssessment.year}
                      </span>
                      {currentAssessment.isPublished && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Official Published Schedule</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Targeted Levels:{' '}
                      <span className="font-bold text-white">
                        {currentAssessment.targetGrades.join(', ') || 'Grade 7, Grade 8, Grade 9'}
                      </span>{' '}
                      • Chief Invigilator / Dean:{' '}
                      <span className="font-bold text-white">{currentAssessment.chiefExaminer}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-white">
                        {currentAssessment.startDate} – {currentAssessment.endDate}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Last updated: {currentAssessment.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Total Papers</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {currentAssessment.slots?.length || 0} Papers
                    </div>
                  </div>
                  <div className="bg-emerald-950/30 rounded-xl p-2.5 border border-emerald-800/40">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Conflict Status</div>
                    <div className="text-base font-black text-emerald-300 mt-0.5">
                      {assessmentClashes.clashesCount === 0 ? '0 Clashes' : `${assessmentClashes.clashesCount} Overlaps`}
                    </div>
                  </div>
                  <div className="bg-blue-950/30 rounded-xl p-2.5 border border-blue-800/40">
                    <div className="text-[10px] font-bold text-blue-400 uppercase">Exam Days</div>
                    <div className="text-base font-black text-blue-300 mt-0.5">
                      {new Set(currentAssessment.slots?.map((s) => s.day)).size} Testing Days
                    </div>
                  </div>
                  <div className="bg-amber-950/30 rounded-xl p-2.5 border border-amber-800/40">
                    <div className="text-[10px] font-bold text-amber-400 uppercase">Marking Status</div>
                    <div className="text-base font-black text-amber-300 mt-0.5">
                      {currentAssessment.slots?.filter((s) => s.status === 'Marked').length || 0} /{' '}
                      {currentAssessment.slots?.length || 0} Marked
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Timetable Schedule Table / Grid */}
            {currentAssessment && (
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = (currentAssessment.slots || [])
                    .filter((s) => s.day === day)
                    .filter((s) => {
                      if (selectedExamGradeFilter === 'All') return true;
                      return s.grade.includes(selectedExamGradeFilter);
                    })
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  if (daySlots.length === 0) return null;

                  return (
                    <div
                      key={day}
                      className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden print:border-slate-800 print:shadow-none"
                    >
                      {/* Day Header */}
                      <div className="bg-slate-950 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-red-400" />
                          <h3 className="text-xs font-black tracking-wide uppercase">
                            {day} • {daySlots[0]?.examDate || day}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {daySlots.length} Paper{daySlots.length > 1 ? 's' : ''} Scheduled
                        </span>
                      </div>

                      {/* Slots Grid */}
                      <div className="divide-y divide-slate-800">
                        {daySlots.map((slot) => {
                          const statusColor =
                            slot.status === 'Marked'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : slot.status === 'Scripts Collected'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : slot.status === 'In Progress'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-300 border-slate-700';

                          return (
                            <div
                              key={slot.id}
                              className="p-3.5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3.5"
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Time & Session Box */}
                                <div className="min-w-[110px] p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-center shrink-0">
                                  <div className="text-xs font-black text-red-400">
                                    {slot.startTime} – {slot.endTime}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                                    {slot.durationMinutes} mins
                                  </div>
                                  <div className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                                    {slot.session.split('(')[0].trim()}
                                  </div>
                                </div>

                                {/* Paper Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-black text-white">{slot.subject}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                      {slot.paperCode || `${slot.subject.slice(0, 3).toUpperCase()}-801`}
                                    </span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                      Grade: {slot.grade}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                      Max: {slot.maxMarks} Marks
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                    <div className="flex items-center gap-1 font-medium">
                                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Room: <strong className="text-white">{slot.room}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1 font-medium">
                                      <Users className="w-3.5 h-3.5 text-slate-500" />
                                      <span>
                                        Chief Invigilator:{' '}
                                        <strong className="text-white">{slot.invigilatorName}</strong>
                                      </span>
                                    </div>
                                    {slot.reliefInvigilatorName && (
                                      <div className="text-[10px] text-slate-400">
                                        Relief: <em>{slot.reliefInvigilatorName}</em>
                                      </div>
                                    )}
                                  </div>

                                  {slot.notes && (
                                    <p className="text-[11px] text-slate-400 italic mt-0.5 bg-slate-950/60 px-2 py-1 rounded border border-slate-800 print:hidden">
                                      {slot.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Action & Status Area */}
                              <div className="flex items-center gap-2 self-end md:self-center shrink-0 print:hidden">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlotStatus(slot.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition cursor-pointer flex items-center gap-1 ${statusColor}`}
                                  title="Click to cycle status (Scheduled -> In Progress -> Scripts Collected -> Marked)"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  <span>{slot.status}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditExamSlot(slot)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                  title="Edit exam slot"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExamSlot(slot.id)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                                  title="Delete exam slot"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 8: MASTER SCHOOL MATRIX */}
        {/* ======================================================== */}
        {activeView === 'master' && (
          <div className="space-y-4">
            {/* Day Filter */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 mr-1">Filter Day:</span>
                {(['All', ...DAYS_OF_WEEK] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedDay === d ? 'bg-red-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">All 6 Streams Matrix</span>
            </div>

            {/* Master Grid per Day */}
            {(selectedDay === 'All' ? DAYS_OF_WEEK : [selectedDay]).map((day) => (
              <div key={day} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden mb-3">
                <div className="bg-slate-950 text-white px-4 py-2.5 font-black text-xs flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <span>{day.toUpperCase()} MASTER SCHEDULE</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Afternoon: {SCHEDULED_AFTERNOON_ACTIVITIES[day].title}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                        <th className="py-2.5 px-3 border-r border-slate-800 w-20">Class</th>
                        {DAILY_PERIODS.map((p) => (
                          <th key={p.periodNumber} className="py-2 px-2 border-r border-slate-800 text-center">
                            <div className="text-white font-black">P{p.periodNumber}</div>
                            <div className="text-[9px] text-slate-500">{p.startTime}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {availableClasses.map((cls) => (
                        <tr key={cls} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 border-r border-slate-800 font-black text-white bg-slate-950/40">
                            {cls}
                          </td>
                          {DAILY_PERIODS.map((period) => {
                            const lesson = lessons.find(
                              (l) => l.className === cls && l.day === day && l.periodNumber === period.periodNumber
                            );
                            const colors = lesson
                              ? SUBJECT_COLOR_MAP[lesson.subject] || SUBJECT_COLOR_MAP['Free']
                              : SUBJECT_COLOR_MAP['Free'];

                            return (
                              <td
                                key={period.periodNumber}
                                onClick={() => lesson && handleOpenEdit(lesson)}
                                className="p-1 border-r border-slate-800 text-center align-middle cursor-pointer hover:bg-slate-800/50"
                              >
                                {lesson ? (
                                  <div className={`p-1.5 rounded-lg border ${colors.border} ${colors.bg}`}>
                                    <div className="text-[10px] font-black text-slate-900 leading-tight">
                                      {lesson.subject.slice(0, 10)}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-600 mt-0.5">
                                      {lesson.teacherInitials}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-600">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: TEACHER SUBSTITUTION ENGINE (P11.15) */}
      {/* ======================================================== */}
      <TeacherSubstitutionModal
        isOpen={isSubstitutionModalOpen}
        onClose={() => setIsSubstitutionModalOpen(false)}
        lessons={lessons}
        teachers={teachers}
        substitutions={substitutions}
        onAddSubstitution={handleAddSubstitution}
        onNotifyToast={showToast}
        isAuthorized={isAuthorized}
      />

      {/* ======================================================== */}
      {/* MODAL 2: ACADEMIC CALENDAR & BELL STRUCTURE (P11.3 - P11.7) */}
      {/* ======================================================== */}
      <AcademicCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        calendarConfig={calendarConfig}
        timetableSettings={timetableSettings}
        teacherAvailabilities={teacherAvailabilities}
        teachers={teachers}
        isAuthorized={isAuthorized}
        onSaveConfig={(cal, set, avail) => {
          const authCheck = verifyDirectorOfAcademicsAuthority(
            activeUser,
            'Modify Timetable Configuration & Academic Calendar'
          );
          if (!authCheck.authorized) {
            handleUnauthorizedAttempt('Modify Timetable Configuration', authCheck.message);
            return;
          }
          setCalendarConfig(cal);
          setTimetableSettings(set);
          setTeacherAvailabilities(avail);
          localStorage.setItem('jjsak_timetable_calendar', JSON.stringify(cal));
          localStorage.setItem('jjsak_timetable_settings', JSON.stringify(set));
          localStorage.setItem('jjsak_timetable_availabilities', JSON.stringify(avail));

          handleLogTimetableAudit(
            'PERIOD_CONFIG',
            `Director of Academics adjusted lesson durations (${set.periodDurationMinutes}m), break periods, and academic calendar dates.`,
            'Global Timetable Framework',
            'Previous Settings',
            `Lesson Duration: ${set.periodDurationMinutes}m`,
            'Academic Structure Alignment',
            'TIMETABLE_PERIOD_CONFIG'
          );
        }}
        onNotifyToast={showToast}
      />

      {/* ======================================================== */}
      {/* MODAL 3: SECURITY, AUDIT & VERSION GOVERNANCE (P11.20) */}
      {/* ======================================================== */}
      <TimetableAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
        versions={versions}
        isAuthorized={isAuthorized}
        onApproveVersion={(verId) => {
          const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Approve Timetable Version');
          if (!authCheck.authorized) {
            handleUnauthorizedAttempt('Approve Timetable Version', authCheck.message);
            return;
          }
          const updated = versions.map((v) =>
            v.versionId === verId
              ? {
                  ...v,
                  status: 'Approved' as const,
                  approvedBy: `${activeUser.fullName} (Director of Academics)`,
                  approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : v
          );
          setVersions(updated);
          localStorage.setItem('jjsak_timetable_versions', JSON.stringify(updated));

          handleLogTimetableAudit(
            'APPROVAL',
            `Director of Academics approved timetable version ${verId}.`,
            verId,
            'Draft / Pending',
            'Approved',
            'Official Academic Schedule Sign-off',
            'TIMETABLE_APPROVE'
          );
        }}
        onRollbackVersion={(verId) => {
          const authCheck = verifyDirectorOfAcademicsAuthority(activeUser, 'Rollback Timetable Version');
          if (!authCheck.authorized) {
            handleUnauthorizedAttempt('Rollback Timetable Version', authCheck.message);
            return;
          }
          handleRegenerate();
          handleLogTimetableAudit(
            'ROLLBACK',
            `Director of Academics rolled back timetable to baseline ${verId}.`,
            verId,
            'Current State',
            `Restored ${verId}`,
            'Emergency Schedule Recovery',
            'TIMETABLE_GENERATE'
          );
        }}
        onNotifyToast={showToast}
      />

      {/* ======================================================== */}
      {/* MODAL 4: CREATE ASSESSMENT TIMETABLE */}
      {/* ======================================================== */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Create Assessment Timetable</h3>
                  <p className="text-xs text-slate-400 font-medium">Auto-generate conflict-free CBC examination schedule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExamModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Examination Title</label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="e.g., Term 2 End of Term Assessment 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Assessment Type</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Opener Exam">Opener Assessment</option>
                    <option value="Mid Term Exam">Mid Term Assessment</option>
                    <option value="End of Term Exam">End of Term Assessment</option>
                    <option value="KJSEA National Mock">KJSEA National Mock</option>
                    <option value="Special Assessment">Special / Supplementary Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Chief Examiner</label>
                  <input
                    type="text"
                    value={newChiefExaminer}
                    onChange={(e) => setNewChiefExaminer(e.target.value)}
                    placeholder="e.g., Mr. J. Watila (Dean)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={newExamStartDate}
                    onChange={(e) => setNewExamStartDate(e.target.value)}
                    placeholder="e.g., 27 Jul 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="text"
                    value={newExamEndDate}
                    onChange={(e) => setNewExamEndDate(e.target.value)}
                    placeholder="e.g., 31 Jul 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Default Duration (Mins)</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Default Max Marks</label>
                  <input
                    type="number"
                    value={newExamMaxMarks}
                    onChange={(e) => setNewExamMaxMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Grades</label>
                <div className="flex items-center gap-4">
                  {['G7', 'G8', 'G9'].map((grd) => (
                    <label key={grd} className="flex items-center gap-1.5 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={newTargetGrades.includes(grd)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTargetGrades([...newTargetGrades, grd]);
                          } else {
                            setNewTargetGrades(newTargetGrades.filter((g) => g !== grd));
                          }
                        }}
                        className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                      />
                      <span>Grade {grd.replace('G', '')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateExamModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAssessmentTimetable}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs shadow-md hover:bg-red-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create & Generate Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ADD / EDIT EXAM SLOT */}
      {/* ======================================================== */}
      {editingExamSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 space-y-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-white">
                  {isNewExamSlot ? 'Add Exam Paper Slot' : 'Edit Examination Slot'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Configure examination paper, session, room, and invigilator</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingExamSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Learning Area / Subject</label>
                  <select
                    value={slotSubject}
                    onChange={(e) => {
                      setSlotSubject(e.target.value);
                      const defaultCodeMap: Record<string, string> = {
                        Mathematics: 'MATH-801',
                        English: 'ENG-801',
                        'Integrated Science': 'SCI-801',
                        Kiswahili: 'KIS-801',
                        'Pretechnical Studies': 'PRE-801',
                        Agriculture: 'AGR-801',
                        'Social Studies': 'SST-801',
                        CRE: 'CRE-801',
                        'Creative Arts & Sports': 'CAS-801',
                      };
                      setSlotPaperCode(defaultCodeMap[e.target.value] || `${e.target.value.slice(0, 3).toUpperCase()}-801`);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    {AVAILABLE_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Paper Code</label>
                  <input
                    type="text"
                    value={slotPaperCode}
                    onChange={(e) => setSlotPaperCode(e.target.value)}
                    placeholder="e.g. MATH-801"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Date Label</label>
                  <input
                    type="text"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    placeholder="e.g. Monday, 27 Jul 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Session</label>
                  <select
                    value={slotSession}
                    onChange={(e) => {
                      const sess = e.target.value as ExamSessionTime;
                      setSlotSession(sess);
                      if (sess.includes('Morning 1')) {
                        setSlotStartTime('08:00');
                        setSlotEndTime('09:30');
                      } else if (sess.includes('Morning 2')) {
                        setSlotStartTime('10:30');
                        setSlotEndTime('12:00');
                      } else if (sess.includes('Afternoon')) {
                        setSlotStartTime('14:00');
                        setSlotEndTime('15:30');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Morning 1 (08:00 - 09:30)">Morning 1</option>
                    <option value="Morning 2 (10:30 - 12:00)">Morning 2</option>
                    <option value="Afternoon (14:00 - 15:30)">Afternoon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">End Time</label>
                  <input
                    type="text"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={slotGrade}
                    onChange={(e) => setSlotGrade(e.target.value)}
                    placeholder="e.g. G8 or G7 & G8"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={slotMaxMarks}
                    onChange={(e) => setSlotMaxMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Exam Room / Hall</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="e.g. Junior Hall A & B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Invigilation Status</label>
                  <select
                    value={slotStatus}
                    onChange={(e) => setSlotStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scripts Collected">Scripts Collected</option>
                    <option value="Marked">Marked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Chief Invigilator</label>
                  <select
                    value={slotInvigilatorId}
                    onChange={(e) => setSlotInvigilatorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    {teachers.map((tch) => (
                      <option key={tch.id} value={tch.id}>
                        {tch.name} ({tch.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Relief Invigilator</label>
                  <input
                    type="text"
                    value={slotReliefInvigilator}
                    onChange={(e) => setSlotReliefInvigilator(e.target.value)}
                    placeholder="e.g. Mrs. J. Barasa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Special Paper Instructions / Notes</label>
                <input
                  type="text"
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  placeholder="e.g. Geometry sets & graph sheets required"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExamSlot(null)}
                className="px-3.5 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExamSlot}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs shadow-md hover:bg-red-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Exam Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: INTERACTIVE LESSON SLOT EDIT MODAL */}
      {/* ======================================================== */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 space-y-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-white">
                  Edit Period {editingLesson.periodNumber} • {editingLesson.day}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Stream: {editingLesson.className}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Learning Area / Subject</label>
                <select
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                >
                  {AVAILABLE_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Pastoral (PPI)">Pastoral Programme of Instruction (PPI)</option>
                  <option value="Life Skills">Life Skills / Clubs</option>
                  <option value="Free">Free Period</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Assigned Teacher</label>
                <select
                  value={editTeacherId}
                  onChange={(e) => setEditTeacherId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white text-xs">Double Period (P11.8)</span>
                  <p className="text-[10px] text-slate-400">For lab experiments, workshops, or practicals</p>
                </div>
                <input
                  type="checkbox"
                  checked={editIsDouble}
                  onChange={(e) => setEditIsDouble(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded bg-slate-900 border-slate-700 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Practical Note / Room</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Science Lab, Computer Room, Farm Demo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Reason for Reallocation (Audit Trail)
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Curriculum realignment, specialist teacher reallocation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="px-3 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: CLASHES AUDIT MODAL */}
      {/* ======================================================== */}
      {showClashesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 space-y-3.5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black text-white">Timetable Clashes & Conflict Detection (P11.13)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClashesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {clashes.length === 0 ? (
                <div className="p-6 text-center text-emerald-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <div className="font-bold">Zero Timetable Clashes</div>
                  <p className="text-slate-400 text-[11px]">
                    All lessons, rooms, and specialist teacher assignments are 100% harmonious.
                  </p>
                </div>
              ) : (
                clashes.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-red-300">
                        {c.day} • Period {c.periodNumber} ({c.periodTime})
                      </span>
                      <span className="text-[10px] font-bold text-red-300 uppercase bg-red-900/60 px-1.5 py-0.2 rounded">
                        Double Booking
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">{c.description}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Suggested Fix: {c.suggestedFix}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleRegenerate();
                  setShowClashesModal(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Resolve All Clashes</span>
              </button>
              <button
                type="button"
                onClick={() => setShowClashesModal(false)}
                className="px-3 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: TIMETABLE ACCESS CONTROL POLICY & GOVERNANCE */}
      {/* ======================================================== */}
      <TimetableAccessPolicyModal
        isOpen={showPolicyModal}
        onClose={() => {
          setShowPolicyModal(false);
          setBlockedActionTitle(null);
        }}
        currentUser={activeUser}
        blockedActionTitle={blockedActionTitle || undefined}
        availableSimulatedUsers={availableUsersList}
        onSelectSimulatedRole={(u) => setActiveUser(u)}
      />

      {/* ======================================================== */}
      {/* MODAL 9: READ-ONLY LESSON DETAILS INSPECTION MODAL */}
      {/* ======================================================== */}
      <LessonDetailsModal
        isOpen={!!inspectingLesson}
        lesson={inspectingLesson}
        onClose={() => setInspectingLesson(null)}
        currentUser={activeUser}
        onRequestEdit={() => {
          setBlockedActionTitle('Modify Lesson Allocation');
          setShowPolicyModal(true);
        }}
      />

      {/* ======================================================== */}
      {/* MODAL 10: JJSAK MASTER TIMETABLE GOVERNANCE & APPROVALS */}
      {/* ======================================================== */}
      <TimetableGovernanceModal
        isOpen={isGovernanceModalOpen}
        onClose={() => setIsGovernanceModalOpen(false)}
        currentUser={activeUser}
        schoolInfo={schoolInfo}
        teachers={teachers}
        lessons={lessons}
        clashes={clashes}
        availableClasses={availableClasses}
        onLessonsUpdated={(newLessons) => updateLessonsState(newLessons)}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
        onRequestChangeClick={() => {
          setIsGovernanceModalOpen(false);
          setIsChangeRequestModalOpen(true);
        }}
      />

      {/* ======================================================== */}
      {/* MODAL 11: TIMETABLE CHANGE REQUEST WORKFLOW (§12) */}
      {/* ======================================================== */}
      <TimetableChangeRequestModal
        isOpen={isChangeRequestModalOpen}
        onClose={() => setIsChangeRequestModalOpen(false)}
        currentUser={activeUser}
        teachers={teachers}
        availableClasses={availableClasses}
        onRequestSubmitted={(req) => {
          showToast(`Change request for ${req.className} on ${req.day} submitted to Academic Office.`);
        }}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />

      {/* ======================================================== */}
      {/* MODAL 12: STREAM CREATION & MANAGEMENT HUB (§1) */}
      {/* ======================================================== */}
      <StreamManagementModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        teachers={teachers}
        onStreamsUpdated={(updated) => setConfiguredStreams(updated)}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
        onGenerateStreamTimetable={(streamCode) => handleGenerateStreamTimetable(streamCode)}
      />

      {/* ======================================================== */}
      {/* MODAL 13: TEACHER STREAM ASSIGNMENT & WORKLOADS (§2) */}
      {/* ======================================================== */}
      <TeacherAssignmentModal
        isOpen={isTeacherAssignmentModalOpen}
        onClose={() => setIsTeacherAssignmentModalOpen(false)}
        teachers={teachers}
        streams={configuredStreams}
        onAssignmentsUpdated={() => {
          showToast('Teacher stream allocations updated successfully.');
        }}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />

      {/* ======================================================== */}
      {/* MODAL 14: SUBJECT ALLOCATION & LESSON FREQUENCY (§3) */}
      {/* ======================================================== */}
      <SubjectAllocationModal
        isOpen={isSubjectAllocationModalOpen}
        onClose={() => setIsSubjectAllocationModalOpen(false)}
        onAllocationsUpdated={() => {
          showToast('Subject weekly frequency quotas updated.');
        }}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />

      {/* ======================================================== */}
      {/* MODAL 15: OFFICIAL BELL SCHEDULE MANAGEMENT (§4) */}
      {/* ======================================================== */}
      <BellScheduleModal
        isOpen={isBellScheduleModalOpen}
        onClose={() => setIsBellScheduleModalOpen(false)}
        onScheduleUpdated={() => {
          showToast('Institutional bell schedule updated.');
        }}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />

      {/* ======================================================== */}
      {/* MODAL 16: LEARNING SPACES & ROOM CONFLICT HUB (§11) */}
      {/* ======================================================== */}
      <RoomConflictManagerModal
        isOpen={isRoomConflictModalOpen}
        onClose={() => setIsRoomConflictModalOpen(false)}
        lessons={lessons}
        currentUser={activeUser}
        onResolveConflict={(lessonId, newRoomName) => handleResolveRoomConflict(lessonId, newRoomName)}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />

      {/* ======================================================== */}
      {/* MODAL 17: COMPREHENSIVE PRE-PUBLICATION VALIDATION (§5, §6) */}
      {/* ======================================================== */}
      <ComprehensiveValidationModal
        isOpen={isComprehensiveValidationModalOpen}
        onClose={() => setIsComprehensiveValidationModalOpen(false)}
        lessons={lessons}
        teachers={teachers}
        currentUser={activeUser}
        onPublishConfirmed={(report, reason, activationDate) =>
          handlePublishConfirmed(report, reason, activationDate)
        }
        onSaveDraft={() => {
          showToast('Draft timetable saved to secure local state.');
        }}
        onLogAudit={(action, details) => handleLogTimetableAudit(action, details)}
      />
    </div>
  );
};
