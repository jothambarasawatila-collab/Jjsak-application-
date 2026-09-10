import React, { useState } from 'react';
import {
  X,
  Bell,
  Send,
  Printer,
  Smartphone,
  CheckCircle2,
  Users,
  MessageSquare,
  Check,
} from 'lucide-react';
import { SchoolInfo, Student, Teacher, User } from '../types';
import { AVAILABLE_CLASSES } from '../data/mockData';

export type CommTab = 'teachers' | 'parents' | 'reports';

interface CommunicationHubModalProps {
  isOpen: boolean;
  initialTab?: CommTab;
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  currentUser?: User;
  onClose: () => void;
  onNavigateToReportsHub?: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const CommunicationHubModal: React.FC<CommunicationHubModalProps> = ({
  isOpen,
  initialTab = 'parents',
  schoolInfo,
  students,
  teachers,
  currentUser,
  onClose,
  onNavigateToReportsHub,
  onLogAudit,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<CommTab>(initialTab);

  // Teacher Notification State
  const [teacherAudience, setTeacherAudience] = useState<string>('All Teachers');
  const [teacherNoticeTitle, setTeacherNoticeTitle] = useState<string>('Term 2 Marks Entry Deadline Notice');
  const [teacherNoticeBody, setTeacherNoticeBody] = useState<string>(
    'Dear Colleagues, please ensure all CAT 2 and Mid-Term subject scores are entered in the JJSAK portal before Friday 5:00 PM to facilitate prompt report form compilation.'
  );
  const [teacherNoticeSuccess, setTeacherNoticeSuccess] = useState<boolean>(false);

  // Parent Notification State
  const [parentAudience, setParentAudience] = useState<string>('All Parents');
  const [selectedParentClass, setSelectedParentClass] = useState<string>('G8 S');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('reports_ready');
  const [customSmsText, setCustomSmsText] = useState<string>(
    'Dear Parent/Guardian, Term 2 CBC Report Cards for {SchoolName} are ready. Learner {LearnerName} ({AdmNo}) attained {OverallGrade}. School reopens on {TermOpeningDate}.'
  );
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [smsDeliveryStats, setSmsDeliveryStats] = useState<{
    sent: number;
    delivered: number;
    failed: number;
    timestamp: string;
  } | null>(null);

  // Quick SMS Templates
  const SMS_TEMPLATES = [
    {
      id: 'reports_ready',
      title: 'End of Term Reports Ready',
      text: 'Dear Parent/Guardian, Term 2 CBC Report Cards for {SchoolName} are ready. Learner {LearnerName} ({AdmNo}) attained {OverallGrade}. School reopens on {TermOpeningDate}.',
    },
    {
      id: 'term_reopening',
      title: 'Term 3 School Reopening Date',
      text: 'Dear Parent/Guardian of {LearnerName} ({AdmNo}), notice is hereby given that Term 3 commences promptly on {TermOpeningDate}. Please ensure all academic requirements are met.',
    },
    {
      id: 'academic_clinic',
      title: 'Academic Consultation Day',
      text: 'Dear Parent/Guardian, you are cordially invited to {SchoolName} for the Academic Clinic on Friday 9:00 AM to review {LearnerName}’s CBE competencies with class teachers.',
    },
    {
      id: 'fee_reminder',
      title: 'Fee Statement & Balance Notice',
      text: 'Dear Parent/Guardian of {LearnerName} ({AdmNo}), kindly clear any pending term balances prior to the opening date ({TermOpeningDate}) via School M-Pesa Paybill.',
    },
  ];

  // Dynamic preview text
  const previewStudent = students[0] || {
    name: 'Faith Chebet',
    admNo: 'ADM-2024-0012',
    overallGrade: 'EE2',
  };

  const formattedSmsPreview = customSmsText
    .replace(/{SchoolName}/g, schoolInfo.name)
    .replace(/{LearnerName}/g, previewStudent.name)
    .replace(/{AdmNo}/g, previewStudent.admNo)
    .replace(/{OverallGrade}/g, previewStudent.overallGrade || 'ME1')
    .replace(/{TermOpeningDate}/g, schoolInfo.nextTermOpenDate || '5th August 2026');

  // Handle Teacher Broadcast
  const handleSendTeacherNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNoticeTitle.trim() || !teacherNoticeBody.trim()) return;

    if (onLogAudit) {
      onLogAudit(
        'COMMUNICATION_BROADCAST',
        `Broadcast teacher notification "${teacherNoticeTitle}" sent to ${teacherAudience} by ${currentUser?.fullName || 'Administrator'}`
      );
    }

    setTeacherNoticeSuccess(true);
    setTimeout(() => {
      setTeacherNoticeSuccess(false);
    }, 3500);
  };

  // Handle Parent SMS Dispatch
  const handleDispatchSms = () => {
    setIsSendingSms(true);
    let count = students.length;
    if (parentAudience === 'class') {
      count = students.filter((s) => s.classArm === selectedParentClass).length;
    }

    setTimeout(() => {
      setIsSendingSms(false);
      const stats = {
        sent: count,
        delivered: count,
        failed: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSmsDeliveryStats(stats);

      if (onLogAudit) {
        onLogAudit(
          'SMS_DISPATCH_BATCH',
          `Dispatched ${count} personalized SMS notices to parents (${parentAudience} - ${schoolInfo.name})`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800">
                  Core Platform Service
                </span>
                <span className="text-[10px] text-slate-300 font-bold">Official Communication &amp; Reporting</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Communication &amp; Distribution Hub
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'parents', label: '1. Parent / Guardian SMS Gateway', icon: Smartphone },
            { id: 'teachers', label: '2. Teacher Staff Notifications', icon: Bell },
            { id: 'reports', label: '3. Report Distribution & Printing', icon: Printer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as CommTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800">
          
          {/* ======================================================== */}
          {/* TAB 1: PARENT / GUARDIAN SMS GATEWAY */}
          {/* ======================================================== */}
          {activeTab === 'parents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Column: Configuration */}
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
                  <Send className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Parent &amp; Guardian SMS Dispatch:</span>
                    <span className="ml-1 text-purple-800">
                      Dispatches personalized SMS broadcasts directly to fathers, mothers, guardians, and sponsors.
                    </span>
                  </div>
                </div>

                {smsDeliveryStats && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2 text-emerald-900 text-xs animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">SMS Broadcast Delivered Successfully!</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Sent: {smsDeliveryStats.sent} • Delivered: {smsDeliveryStats.delivered} (100%) • Time: {smsDeliveryStats.timestamp}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audience Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Audience
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setParentAudience('all')}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                        parentAudience === 'all'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <Users className="w-4 h-4 text-purple-600 mb-1" />
                      <div>All School Parents</div>
                      <span className="text-[10px] text-slate-500 font-normal">{students.length} Learners</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setParentAudience('class')}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                        parentAudience === 'class'
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-purple-600 mb-1" />
                      <div>Specific Class Parents</div>
                      <span className="text-[10px] text-slate-500 font-normal">Filter by Stream</span>
                    </button>
                  </div>

                  {parentAudience === 'class' && (
                    <div className="mt-2">
                      <select
                        value={selectedParentClass}
                        onChange={(e) => setSelectedParentClass(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none"
                      >
                        {AVAILABLE_CLASSES.map((c) => (
                          <option key={c} value={c}>{c} Parents</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preset Templates
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SMS_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(tmpl.id);
                          setCustomSmsText(tmpl.text);
                        }}
                        className={`p-2 rounded-xl text-left text-[11px] font-semibold border transition cursor-pointer ${
                          selectedTemplate === tmpl.id
                            ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SMS Text Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMS Message Content (Supports Variables)
                  </label>
                  <textarea
                    rows={4}
                    value={customSmsText}
                    onChange={(e) => setCustomSmsText(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Variables: &#123;LearnerName&#125;, &#123;AdmNo&#125;, &#123;OverallGrade&#125;, &#123;TermOpeningDate&#125;</span>
                    <span>{customSmsText.length} characters (1 SMS page)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDispatchSms}
                  disabled={isSendingSms}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingSms ? 'Dispatching Broadcast...' : 'Dispatch SMS to Parents Now'}</span>
                </button>
              </div>

              {/* Right Column: Smartphone SMS Bubble Preview */}
              <div className="bg-slate-100 border border-slate-300 rounded-3xl p-5 flex flex-col items-center">
                <div className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Live Smartphone SMS Recipient View</span>
                </div>

                {/* Realistic Phone Shell */}
                <div className="w-full max-w-[280px] bg-slate-950 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
                  {/* Phone Notch */}
                  <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-3" />

                  {/* SMS Thread Screen */}
                  <div className="bg-slate-900 rounded-2xl p-3 min-h-[300px] flex flex-col justify-between text-white text-xs">
                    <div>
                      {/* Sender Header */}
                      <div className="text-center pb-2 border-b border-slate-800 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto text-xs font-black">
                          {schoolInfo.logoInitial || 'NJS'}
                        </div>
                        <div className="font-bold text-xs mt-1">{schoolInfo.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">SMS GATEWAY • VERIFIED</div>
                      </div>

                      {/* SMS Chat Bubble */}
                      <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-xs shadow-md text-xs leading-relaxed">
                        <p>{formattedSmsPreview}</p>
                        <div className="text-[9px] text-purple-200 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                          <span>Just now</span>
                          <Check className="w-3 h-3 text-purple-200" />
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-slate-800">
                      Official Kenya MOE Registered SMS Channel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TEACHER STAFF NOTIFICATIONS */}
          {/* ======================================================== */}
          {activeTab === 'teachers' && (
            <form onSubmit={handleSendTeacherNotice} className="space-y-4 max-w-xl mx-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Staff &amp; Teacher Communication:</span>
                  <span className="ml-1 text-blue-800">
                    Send internal notices, marks entry deadline alerts, and duty timetable reminders.
                  </span>
                </div>
              </div>

              {teacherNoticeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Notification broadcasted to all {teacherAudience}!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Group
                </label>
                <select
                  value={teacherAudience}
                  onChange={(e) => setTeacherAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="All Teachers">All Teachers ({teachers.length} Staff)</option>
                  <option value="Science Department">Science &amp; Agriculture Department</option>
                  <option value="Humanities Department">Humanities &amp; Languages Department</option>
                  <option value="Class Teachers">Class Teachers Only (G7 - G9)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={teacherNoticeTitle}
                  onChange={(e) => setTeacherNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={teacherNoticeBody}
                  onChange={(e) => setTeacherNoticeBody(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Bell className="w-4 h-4" />
                <span>Broadcast Notice to Staff</span>
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REPORT DISTRIBUTION & PRINTING */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4 text-center py-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
                <Printer className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Official CBE Reports Hub &amp; Print Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate official CBC/CBE Learner Progress Reports, complete with official digital seal stamp, head of institution signature, QR verification, class broadsheets, and subject performance analysis.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Reporting Term:</span>
                  <span className="font-bold text-slate-800">{schoolInfo.term}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Enrolled Students:</span>
                  <span className="font-bold text-slate-800">{students.length} Learners</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Print Modes:</span>
                  <span className="font-bold text-slate-800">Progress Report, Broadsheet, Subject Analysis</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToReportsHub) onNavigateToReportsHub();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#C51E28] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Open Official Reports &amp; Printing Hub</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
