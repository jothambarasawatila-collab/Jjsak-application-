import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Sparkles,
  Camera,
  Upload,
  GraduationCap,
  Award,
  Compass,
  Bell,
  Send,
  Printer,
  CreditCard,
  Layers,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Search,
  UserCheck,
  Lock,
  Database,
  Edit2,
  Clock,
} from 'lucide-react';
import { ActiveScreen, SchoolInfo, SchoolTenant, Student, Teacher, User } from '../types';

interface MasterArchitectureScreenProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  tenants: SchoolTenant[];
  currentUser?: User;
  onBack: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenDataEntryHub?: (initialMode?: 'individual' | 'register' | 'marks' | 'bulk' | 'photo') => void;
  onOpenCommunicationHub?: (initialTab?: 'teachers' | 'parents' | 'reports') => void;
  onOpenTeacherMarks?: (teacherId?: string, className?: string, subject?: string) => void;
  onOpenBulkUpload?: () => void;
}

interface ComponentClassification {
  id: string;
  name: string;
  statusText: string;
  category: 'Core Platform' | 'Core Data Entry' | 'Core Academic' | 'Core Communication' | 'Core Reporting' | 'Core User-Facing' | 'Core Business' | 'Core Governance';
  phase: string;
  description: string;
  actionScreen?: ActiveScreen;
  specialAction?: string;
  icon: React.FC<{ className?: string }>;
}

export const MasterArchitectureScreen: React.FC<MasterArchitectureScreenProps> = ({
  schoolInfo,
  students,
  teachers,
  tenants,
  currentUser,
  onBack,
  onNavigate,
  onOpenDataEntryHub,
  onOpenCommunicationHub,
  onOpenTeacherMarks,
  onOpenBulkUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'classification' | 'phases' | 'fleet'>('hierarchy');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedPhasePillar, setExpandedPhasePillar] = useState<string | null>('Pillar 1');

  // Exact 24 Components & Status from Final JJSAK Master Architecture
  const componentsList: ComponentClassification[] = [
    {
      id: 'cmp-01',
      name: 'School Registration',
      statusText: 'Core Platform Service',
      category: 'Core Platform',
      phase: 'Phase 1 - P1.1',
      description: 'Official school onboarding, MOE registration credentials, institutional crest and branding.',
      actionScreen: 'school_profile',
      icon: Building2,
    },
    {
      id: 'cmp-02',
      name: 'Data Entry',
      statusText: 'Core Platform Service',
      category: 'Core Platform',
      phase: 'Phase 2 - P2.1',
      description: 'Unified multi-channel data ingestion architecture supporting 5 specialized input pathways.',
      specialAction: 'data_entry_hub',
      icon: Edit2,
    },
    {
      id: 'cmp-03',
      name: 'Photograph Management',
      statusText: 'Core Data Entry Service',
      category: 'Core Data Entry',
      phase: 'Phase 3 - P3.1',
      description: 'Learner and teacher portrait capture, camera snapshot preview, photo badging, and avatar repository.',
      specialAction: 'photo_management',
      icon: Camera,
    },
    {
      id: 'cmp-04',
      name: 'Bulk Upload',
      statusText: 'Core Data Entry Service',
      category: 'Core Data Entry',
      phase: 'Phase 4 - P4.1',
      description: 'CSV and spreadsheet mass learner onboarding with field validation, duplicate detection, and schema mapping.',
      specialAction: 'bulk_upload',
      icon: Upload,
    },
    {
      id: 'cmp-05',
      name: 'Data Storage & Security',
      statusText: 'Core Platform Service',
      category: 'Core Platform',
      phase: 'Phase 5 - P1.10',
      description: 'AES-256-GCM encryption, 30-day recycle bin, session inactivity guard, and local/cloud storage persistence.',
      actionScreen: 'security_core',
      icon: Database,
    },
    {
      id: 'cmp-06',
      name: 'Identity & Access Management',
      statusText: 'Core Platform Service',
      category: 'Core Platform',
      phase: 'Phase 6 - P1.5',
      description: 'Multi-role RBAC matrix, JWT signed bearer tokens, MFA with SMS/Email OTP, and brute-force lockout.',
      actionScreen: 'security_core',
      icon: Lock,
    },
    {
      id: 'cmp-07',
      name: 'Audit & Compliance',
      statusText: 'Core Platform Service',
      category: 'Core Platform',
      phase: 'Phase 7 - P1.9',
      description: 'Immutable cryptographically chained audit trail, KDPA 2019 compliance rules, and MOE inspection readiness.',
      actionScreen: 'security_core',
      icon: ShieldCheck,
    },
    {
      id: 'cmp-07b',
      name: 'Academic Structure & Foundation',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 7 - Master Foundation',
      description: 'Curriculum frameworks, terms, grade streams, learning areas, teacher subject workloads, class teacher appointments, learner placement, and validation engine.',
      actionScreen: 'academic_structure_hub',
      icon: Layers,
    },
    {
      id: 'cmp-08',
      name: 'Learner Management',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 8 - P2.2',
      description: 'Comprehensive learner biodata, NEMIS/UPI tracking, special needs records, guardian links, and attendance.',
      actionScreen: 'students',
      icon: GraduationCap,
    },
    {
      id: 'cmp-09',
      name: 'Professional Records',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 9 - P2.3',
      description: 'Teacher TSC numbers, academic qualifications, teaching subject allocations, workload periods, and appraisals.',
      actionScreen: 'teachers',
      icon: Users,
    },
    {
      id: 'cmp-10',
      name: 'CBC/CBE Assessment',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 10 - P2.5',
      description: 'Formative/summative CBE scoring engine, raw score to 100% conversion, and EE/ME/AE/BE 8-sublevel evaluation.',
      actionScreen: 'assessments',
      icon: Award,
    },
    {
      id: 'cmp-11',
      name: 'Examination Management',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 11 - P2.7',
      description: 'Free automated test paper generator, KICD competence rubrics, marking schemes, and exam session supervision.',
      actionScreen: 'assessment_generator',
      icon: Sparkles,
    },
    {
      id: 'cmp-12',
      name: 'Class Timetable',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 12 - P2.8',
      description: 'Intelligent zero-clash weekly master schedule, class stream allocations, teacher period loads, and rooming.',
      actionScreen: 'timetabling',
      icon: Calendar,
    },
    {
      id: 'cmp-13',
      name: 'Assessment Timetable',
      statusText: 'Core Academic Module',
      category: 'Core Academic',
      phase: 'Phase 13 - P2.9',
      description: 'Dual timetable engine: scheduled exam sessions, invigilation duty allocations, and paper clash detection.',
      actionScreen: 'timetabling',
      icon: Clock,
    },
    {
      id: 'cmp-14',
      name: 'Pathway Finder',
      statusText: 'Core Strategic Academic Module',
      category: 'Core Academic',
      phase: 'Phase 14 - P2.11',
      description: 'Senior school pathway advisory: algorithmic matching for STEM, Social Sciences, Arts & Sports Science tracks.',
      actionScreen: 'pathways',
      icon: Compass,
    },
    {
      id: 'cmp-15',
      name: 'Communication & Reporting',
      statusText: 'Core Platform Service',
      category: 'Core Communication',
      phase: 'Phase 15 - P3.1',
      description: 'Dual-channel communication backbone connecting teachers, parents, guardians, sponsors, and school heads.',
      specialAction: 'communication_hub',
      icon: Bell,
    },
    {
      id: 'cmp-16',
      name: 'Teacher Notifications',
      statusText: 'Core Communication Service',
      category: 'Core Communication',
      phase: 'Phase 16 - P3.2',
      description: 'Staff broadcasts, assessment marks submission deadlines, duty alerts, and departmental notices.',
      specialAction: 'teacher_notifications',
      icon: Bell,
    },
    {
      id: 'cmp-17',
      name: 'Parent/Guardian/Sponsor Distribution',
      statusText: 'Core Communication Service',
      category: 'Core Communication',
      phase: 'Phase 17 - P3.3',
      description: 'Personalized SMS broadcasts, delivery receipts, term opening notices, fee alerts, and emergency contact alerts.',
      specialAction: 'parent_distribution',
      icon: Send,
    },
    {
      id: 'cmp-18',
      name: 'Report Download/Printing',
      statusText: 'Core Reporting Service',
      category: 'Core Reporting',
      phase: 'Phase 18 - P3.4',
      description: 'Official CBC report forms, class broadsheets, subject analysis printouts, and tamper-proof verification stamps.',
      actionScreen: 'reports_hub',
      icon: Printer,
    },
    {
      id: 'cmp-19',
      name: 'Admin Portal',
      statusText: 'Core User-Facing Component',
      category: 'Core User-Facing',
      phase: 'Phase 19 - P4.1',
      description: 'Executive management cockpit: analytics, fleet monitoring, subscription control, and institutional configuration.',
      actionScreen: 'home',
      icon: ShieldCheck,
    },
    {
      id: 'cmp-20',
      name: 'Teacher Portal',
      statusText: 'Core User-Facing Component',
      category: 'Core User-Facing',
      phase: 'Phase 20 - P4.2',
      description: 'Dedicated teacher workspace: subject marks entry, weekly timetable lessons, test paper maker, and student advice.',
      actionScreen: 'home',
      icon: Users,
    },
    {
      id: 'cmp-21',
      name: 'Learner Portal',
      statusText: 'Core User-Facing Component',
      category: 'Core User-Facing',
      phase: 'Phase 21 - P4.3',
      description: 'Student profile, CBE learning area breakdown, attendance progress, teacher remarks, and senior pathway trajectory.',
      actionScreen: 'home',
      icon: GraduationCap,
    },
    {
      id: 'cmp-22',
      name: 'Parent/Guardian/Sponsor Portal',
      statusText: 'Core User-Facing Component',
      category: 'Core User-Facing',
      phase: 'Phase 22 - P4.4',
      description: 'Child assessment monitoring, editable parent/guardian phone numbers, direct calling, and instant report card download.',
      actionScreen: 'home',
      icon: UserCheck,
    },
    {
      id: 'cmp-23',
      name: 'Subscription & Revenue',
      statusText: 'Core Business Service',
      category: 'Core Business',
      phase: 'Phase 23 - P5.1',
      description: 'Automated 1-term trial lifecycle, M-Pesa automated paybill activation, school licensing, and per-learner tiering.',
      actionScreen: 'subscription',
      icon: CreditCard,
    },
    {
      id: 'cmp-24',
      name: 'Owner Governance & Blueprint',
      statusText: 'Core Governance Service',
      category: 'Core Governance',
      phase: 'Phase 24-27 - P6.1',
      description: 'Master 27-Phase architectural oversight, multi-tenant fleet administration, compliance audits, and system roadmap.',
      actionScreen: 'security_core',
      icon: Layers,
    },
  ];

  const filteredComponents = componentsList.filter((c) => {
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.statusText && c.statusText.toLowerCase().includes(q)) ||
        (c.phase && c.phase.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleLaunchComponent = (cmp: ComponentClassification) => {
    if (cmp.specialAction === 'data_entry_hub') {
      if (onOpenDataEntryHub) onOpenDataEntryHub();
      return;
    }
    if (cmp.specialAction === 'photo_management') {
      if (onOpenDataEntryHub) onOpenDataEntryHub('photo');
      return;
    }
    if (cmp.specialAction === 'bulk_upload') {
      if (onOpenBulkUpload) onOpenBulkUpload();
      else if (onOpenDataEntryHub) onOpenDataEntryHub('bulk');
      return;
    }
    if (cmp.specialAction === 'marks_entry') {
      if (onOpenTeacherMarks) onOpenTeacherMarks();
      else onNavigate('assessments');
      return;
    }
    if (cmp.specialAction === 'communication_hub') {
      if (onOpenCommunicationHub) onOpenCommunicationHub();
      return;
    }
    if (cmp.specialAction === 'teacher_notifications') {
      if (onOpenCommunicationHub) onOpenCommunicationHub('teachers');
      return;
    }
    if (cmp.specialAction === 'parent_distribution') {
      if (onOpenCommunicationHub) onOpenCommunicationHub('parents');
      return;
    }
    if (cmp.actionScreen) {
      onNavigate(cmp.actionScreen);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24 select-none">
      {/* Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                  Master Specification
                </span>
                <span className="text-[10px] font-bold text-slate-400 truncate max-w-xs">
                  {schoolInfo.name} • {currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'System Governance'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight mt-0.5">
                FINAL JJSAK MASTER ARCHITECTURE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Print Architecture Blueprint"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Blueprint</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'hierarchy', label: '1. Master Hierarchy Tree', icon: Layers },
            { id: 'classification', label: '2. Component Status Matrix (24 Components)', icon: CheckCircle2 },
            { id: 'phases', label: '3. 27-Phase Implementation Tracker', icon: Sparkles },
            { id: 'fleet', label: '4. Tenants & System Governance', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#C51E28] text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex-1">
        
        {/* ======================================================== */}
        {/* TAB 1: MASTER HIERARCHY TREE */}
        {/* ======================================================== */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Introductory Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-800/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C51E28] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Refined 27-Phase Master Specification
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  In this master architecture, all features—including photograph-based data entry, class registers, mark lists, teacher accounts, CBC/CBE assessment generation, dual timetabling, pathway recommendations, portals, automated subscription, notifications, reporting, security, and owner governance—have explicit, non-optional architectural positions.
                </p>
              </div>
            </div>

            {/* Interactive Architecture Flowchart */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              
              {/* Level 1: SYSTEM OWNER & GOVERNANCE */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md p-3.5 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-700 text-white text-center shadow-lg border border-amber-500">
                  <div className="text-[10px] font-black tracking-wider uppercase text-amber-100">Level 1 • Core Governance Service</div>
                  <div className="text-sm sm:text-base font-black mt-0.5">SYSTEM OWNER &amp; GOVERNANCE</div>
                  <div className="text-[11px] text-amber-100 mt-0.5 font-medium">
                    Fleet Orchestration • KDPA Compliance • Security Master Keys • System Blueprint
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 2: CORE PLATFORM SERVICES */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg p-3.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 text-white text-center shadow-md border border-slate-700">
                  <div className="text-[10px] font-black tracking-wider uppercase text-red-400">Level 2 • Foundation Backbone</div>
                  <div className="text-sm sm:text-base font-black mt-0.5">CORE PLATFORM SERVICES</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    School Registration • Data Storage &amp; Security • Identity &amp; Access • Audit &amp; Compliance
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 3: DUAL PILLARS (CORE DATA ENTRY & IDENTITY/SECURITY) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Pillar Left: CORE DATA ENTRY (5 Modes) */}
                <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-600/50 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-black text-xs text-white">CORE DATA ENTRY</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        5 Ingestion Channels
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── Individual Entry</span>
                        <span className="text-[10px] text-slate-400">Single Learner Biodata</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── Register-Based Entry</span>
                        <span className="text-[10px] text-slate-400">Class Attendance Registers</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── Mark-List Entry</span>
                        <span className="text-[10px] text-slate-400">Fast Subject Score Sheets</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── Bulk Upload</span>
                        <span className="text-[10px] text-slate-400">CSV &amp; Excel Import</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">└── Photograph Management</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Webcam &amp; Image Capture</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDataEntryHub && onOpenDataEntryHub()}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>Launch Core Data Entry Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pillar Right: IDENTITY & SECURITY */}
                <div className="p-4 rounded-2xl bg-slate-900 border-2 border-red-600/50 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span className="font-black text-xs text-white">IDENTITY &amp; SECURITY</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                        Zero Trust • KDPA 2019
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── Multi-School Tenants</span>
                        <span className="text-[10px] text-slate-400">{tenants.length} Registered Schools</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── 8-Level RBAC Matrix</span>
                        <span className="text-[10px] text-slate-400">Granular Roles</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── JWT Signed Sessions</span>
                        <span className="text-[10px] text-slate-400">Cryptographic Auth</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">├── MFA (SMS/Email OTP)</span>
                        <span className="text-[10px] text-slate-400">Enforced on Admins</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">└── 30-Day Recycle Bin</span>
                        <span className="text-[10px] text-amber-400 font-bold">Two-Step Deletion Gate</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('security_core')}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <span>Open Security &amp; Tenants Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 4: CORE ACADEMIC SERVICES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-blue-600/50 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="font-black text-sm text-white block">CORE ACADEMIC SERVICES (PHASE 5)</span>
                      <span className="text-[10px] text-slate-400 font-medium">Assessment Engine, Grading Rules, Deadlines &amp; Lifecycle Hub</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('academic_hub')}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Launch Phase 5 Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigate('academic_hub')}
                    className="p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-left transition cursor-pointer col-span-2"
                  >
                    <div className="font-bold text-indigo-300 text-xs flex items-center justify-between">
                      <span>Phase 5 Operations &amp; Grading Hub</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-200">Active</span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Assessment Matrix • Grading Engine • Deadlines • Lifecycle • Compliance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('students')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Learner Management</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Biodata, UPI, Class Arms</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('teachers')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Professional Records</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">TSC, Qualifications, Allocations</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('analytics')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Academic Records</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Historical Scores &amp; Trends</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('assessments')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">CBC Assessment Engine</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">EE/ME/AE/BE Sublevels</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('assessment_generator')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Examination Management</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Free Paper &amp; Rubric Maker</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('timetabling')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Smart Class Timetable</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Zero-Clash Lesson Grid</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('timetabling')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">Assessment Timetable</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">Exam Sessions &amp; Invigilation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('pathways')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-white text-xs">CBC Pathway Finder</div>
                    <div className="text-[10px] text-blue-400 mt-0.5">STEM, Arts &amp; Social Tracks</div>
                  </button>
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 5: CORE COMMUNICATION & REPORTING */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-purple-600/50 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="font-black text-sm text-white block">CORE COMMUNICATION &amp; REPORTING</span>
                      <span className="text-[10px] text-slate-400 font-medium">Official Dispatch, SMS Gateway &amp; Printable Broadsheets</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCommunicationHub && onOpenCommunicationHub()}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Open Hub →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block">1. Teacher Alerts</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">Marks Deadlines</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block">2. Parent Notices</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">SMS Broadcasts</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block">3. Report Generation</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">Automated CBC Forms</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block">4. Distribution</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">Digital &amp; SMS Links</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block">5. Print &amp; Stamping</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">Official Seals &amp; QR</span>
                  </div>
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 6 & 7: SUBSCRIPTION, REVENUE & SCHOOL TENANTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-md">
                  <div className="text-[10px] font-black uppercase text-emerald-400">Level 6 • Core Business Service</div>
                  <div className="text-sm font-black text-white mt-0.5">SUBSCRIPTION &amp; REVENUE SERVICES</div>
                  <div className="text-xs text-slate-300 mt-1">
                    1-Term Automated Trial • M-Pesa Paybill / Till Direct Activation • Multi-Tier School Licensing
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('subscription')}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Manage Subscription</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-md">
                  <div className="text-[10px] font-black uppercase text-sky-400">Level 7 • Multi-School Fleet</div>
                  <div className="text-sm font-black text-white mt-0.5">SCHOOL TENANTS</div>
                  <div className="text-xs text-slate-300 mt-1">
                    Isolated School Namespaces • Single-Tenant Data Encryption • Cross-School Federation
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('school_profile')}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>School Tenant Profile</span>
                  </button>
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 -mt-2" />
              </div>

              {/* Level 8: USER PORTALS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-lg">
                <div className="text-center pb-3 border-b border-slate-800">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">Level 8 • Core User-Facing Components</div>
                  <div className="text-base font-black text-white mt-0.5">MULTI-ROLE USER PORTALS</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <ShieldCheck className="w-6 h-6 text-red-500 mx-auto mb-1.5" />
                    <div className="font-black text-xs text-white">Administrator</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Complete Oversight &amp; Audit</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                    <div className="font-black text-xs text-white">Teacher</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Marks &amp; Class Lessons</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <GraduationCap className="w-6 h-6 text-purple-500 mx-auto mb-1.5" />
                    <div className="font-black text-xs text-white">Learner</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Biodata &amp; Pathways</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <UserCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <div className="font-black text-xs text-white">Parent / Guardian / Sponsor</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Ward Report &amp; Alerts</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COMPONENT CLASSIFICATION STATUS MATRIX */}
        {/* ======================================================== */}
        {activeTab === 'classification' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search components or phases..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  'All',
                  'Core Platform',
                  'Core Data Entry',
                  'Core Academic',
                  'Core Communication',
                  'Core Reporting',
                  'Core User-Facing',
                  'Core Business',
                  'Core Governance',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-[#C51E28] text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-3 px-4">Component</th>
                      <th className="py-3 px-4">Architectural Classification</th>
                      <th className="py-3 px-4">Phase Code</th>
                      <th className="py-3 px-4">Functional Role &amp; Scope</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredComponents.map((cmp) => {
                      const Icon = cmp.icon;
                      return (
                        <tr key={cmp.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-black text-white text-xs">{cmp.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              cmp.statusText.includes('Platform')
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : cmp.statusText.includes('Data Entry')
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : cmp.statusText.includes('Academic')
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : cmp.statusText.includes('Communication')
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : cmp.statusText.includes('Reporting')
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : cmp.statusText.includes('Business')
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>{cmp.statusText}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-slate-400">
                            {cmp.phase}
                          </td>

                          <td className="py-3.5 px-4 text-slate-300 text-xs max-w-xs">
                            {cmp.description}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleLaunchComponent(cmp)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-[#C51E28] text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer border border-slate-700 hover:border-red-600"
                            >
                              <span>Open</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
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
        {/* TAB 3: 27-PHASE MASTER IMPLEMENTATION TRACKER */}
        {/* ======================================================== */}
        {activeTab === 'phases' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">
                  27-Phase Comprehensive Master Specification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organized into 6 Architectural Pillars with complete operational coverage across Kenya Junior School CBE.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-black">
                  27 / 27 Operational
                </span>
              </div>
            </div>

            {/* Pillars Accordion */}
            <div className="space-y-3">
              {[
                {
                  id: 'Pillar 1',
                  title: 'Pillar 1: System Owner & Platform Security Core (Phases 1 - 5)',
                  phases: [
                    'Phase 1: Multi-School Tenant Partitioning & Cross-Tenant Isolation',
                    'Phase 2: Role-Based Access Control (RBAC) Matrix (8 User Roles)',
                    'Phase 3: JWT Signed Authentication & Inactivity Session Guard (30 Min)',
                    'Phase 4: Multi-Factor Authentication (SMS & Email OTP Simulator)',
                    'Phase 5: Immutable Cryptographic Chained Audit Logging & KDPA 2019 Compliance',
                  ],
                  action: () => onNavigate('security_core'),
                  actionLabel: 'Inspect Security Core',
                },
                {
                  id: 'Pillar 2',
                  title: 'Pillar 2: Core Data Entry & Photograph Management (Phases 6 - 10)',
                  phases: [
                    'Phase 6: Individual Learner Entry & NEMIS UPI Identification',
                    'Phase 7: Register-Based Daily Attendance Entry & Mark-All-Present',
                    'Phase 8: Fast Interactive Mark-List Entry for Subject Teachers',
                    'Phase 9: Bulk CSV/Excel Learner Onboarding & Schema Validation',
                    'Phase 10: Photograph Capture, Webcam Snapshots & Official ID Badging',
                  ],
                  action: () => onOpenDataEntryHub && onOpenDataEntryHub(),
                  actionLabel: 'Launch Data Entry Hub',
                },
                {
                  id: 'Pillar 3',
                  title: 'Pillar 3: Core Academic & Assessment Engine (Phases 11 - 18)',
                  phases: [
                    'Phase 11: Learner Biodata, Guardian Contacts & Class Stream Allocation',
                    'Phase 12: Teacher Professional Records, TSC Credentials & Workload Monitoring',
                    'Phase 13: Continuous Academic Historical Records & Grade Trajectory Analytics',
                    'Phase 14: CBC/CBE Assessment Engine (EE1/EE2, ME1/ME2, AE1/AE2, BE1/BE2)',
                    'Phase 15: Examination Management & Free Test Paper Generator with KICD Rubrics',
                    'Phase 16: Smart Weekly Class Timetable with Zero-Clash Conflict Detection',
                    'Phase 17: Smart Assessment Timetable with Exam Slot & Invigilator Assignment',
                    'Phase 18: CBC Pathway Finder (STEM, Social Sciences, Arts & Sports Tracks)',
                  ],
                  action: () => onNavigate('analytics'),
                  actionLabel: 'View Academic Hub',
                },
                {
                  id: 'Pillar 4',
                  title: 'Pillar 4: Core Communication & Reporting (Phases 19 - 22)',
                  phases: [
                    'Phase 19: Staff & Teacher Notifications, Deadlines & Timetable Releases',
                    'Phase 20: Parent/Guardian/Sponsor SMS Broadcast Dispatcher with Delivery Receipts',
                    'Phase 21: Automated Single & Batch Report Form Generation with Pathway Advisories',
                    'Phase 22: High-Resolution PDF Download, Official Digital Stamp & QR Verification',
                  ],
                  action: () => onOpenCommunicationHub && onOpenCommunicationHub(),
                  actionLabel: 'Open Communication Hub',
                },
                {
                  id: 'Pillar 5',
                  title: 'Pillar 5: Subscription & Multi-Tenant Revenue Services (Phases 23 - 25)',
                  phases: [
                    'Phase 23: Automated 1-Term Free Trial Lifecycle Management',
                    'Phase 24: Direct M-Pesa Till & Paybill Instant Activation Integration',
                    'Phase 25: Per-Learner Tiered School Licensing & Automatic Receipt Issuance',
                  ],
                  action: () => onNavigate('subscription'),
                  actionLabel: 'Manage Licensing',
                },
                {
                  id: 'Pillar 6',
                  title: 'Pillar 6: User Portals & Owner Governance Blueprint (Phases 26 - 27)',
                  phases: [
                    'Phase 26: 4 Dedicated User Portals (Administrator, Teacher, Learner, Parent/Guardian/Sponsor)',
                    'Phase 27: System Owner Master Governance, Architecture Visualizer & Health Oversight',
                  ],
                  action: () => onNavigate('home'),
                  actionLabel: 'Return to Portals',
                },
              ].map((pillar) => {
                const isExpanded = expandedPhasePillar === pillar.id;
                return (
                  <div key={pillar.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <div
                      onClick={() => setExpandedPhasePillar(isExpanded ? null : pillar.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-white">{pillar.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            {pillar.phases.length} Phases • 100% Implemented
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-850 space-y-2 bg-slate-900/40">
                        <div className="space-y-1.5 mt-2">
                          {pillar.phases.map((ph, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-slate-200 font-medium">{ph}</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                                Verified
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={pillar.action}
                            className="px-3 py-1.5 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>{pillar.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TENANTS & SYSTEM GOVERNANCE */}
        {/* ======================================================== */}
        {activeTab === 'fleet' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* System Owner Governance Dashboard */}
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-white">System Owner Governance Fleet</h3>
                  <p className="text-xs text-slate-400">
                    Live operational metrics across active school tenants, storage encryption, and compliance.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                  Fleet Healthy
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active School Tenants</span>
                  <span className="text-xl font-black text-white block mt-0.5">{tenants.length} Schools</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">100% Isolated</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Learners</span>
                  <span className="text-xl font-black text-white block mt-0.5">{students.length} Learners</span>
                  <span className="text-[10px] text-blue-400 font-semibold">NEMIS Enrolled</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Staff</span>
                  <span className="text-xl font-black text-white block mt-0.5">{teachers.length} Teachers</span>
                  <span className="text-[10px] text-purple-400 font-semibold">TSC Allocated</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">KDPA Compliance</span>
                  <span className="text-xl font-black text-emerald-400 block mt-0.5">100% Pass</span>
                  <span className="text-[10px] text-slate-400 font-semibold">AES-256 Storage</span>
                </div>
              </div>

              {/* Registered School Tenants List */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Registered School Tenant Instances
                </h4>
                <div className="space-y-2">
                  {tenants.map((t) => (
                    <div
                      key={t.schoolId}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-950 text-red-400 flex items-center justify-center font-black text-xs border border-red-800">
                          {t.schoolCode.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{t.schoolName}</div>
                          <div className="text-[10px] text-slate-400">
                            Code: {t.schoolCode} • {t.address} • {t.phone}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
