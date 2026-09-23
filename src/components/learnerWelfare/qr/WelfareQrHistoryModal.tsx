import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  Search,
  ArrowUpDown,
  Download,
  Printer,
  HeartPulse,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Send,
  QrCode,
  ChevronDown,
  ChevronUp,
  User,
  SlidersHorizontal,
  Building2,
  Activity,
  Pill,
} from 'lucide-react';
import { WelfareEventCheckInRecord, WelfareCheckInStatus, LearnerHealthProfile } from '../../../types/learnerWelfare';
import { Student } from '../../../types';

interface WelfareQrHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIns: WelfareEventCheckInRecord[];
  students?: Student[];
  healthProfiles?: Record<string, LearnerHealthProfile>;
  onOpenStudentPass?: (studentId: string) => void;
  onUpdateStatus?: (record: WelfareEventCheckInRecord, newStatus: WelfareCheckInStatus) => void;
}

type SortField = 'timestamp' | 'studentName' | 'admNo' | 'eventType' | 'temperature';
type SortOrder = 'asc' | 'desc';
type TimeFilter = 'all' | 'today' | 'week' | 'month';

export const WelfareQrHistoryModal: React.FC<WelfareQrHistoryModalProps> = ({
  isOpen,
  onClose,
  checkIns,
  students = [],
  healthProfiles = {},
  onOpenStudentPass,
  onUpdateStatus,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  // Sort State (Default: timestamp newest first)
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Expanded Row ID for deep encounter inspection
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // View Mode: detailed list vs compact table
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  // Statistics calculation
  const stats = useMemo(() => {
    const total = checkIns.length;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayCount = checkIns.filter((c) => c.timestamp.startsWith(todayStr)).length;
    const sickbayCount = checkIns.filter(
      (c) => c.status === 'Admitted to Sickbay' || c.status === 'Under Observation'
    ).length;
    const feverCount = checkIns.filter((c) => (c.temperatureCelsius ?? 0) > 37.5).length;
    const hospitalReferrals = checkIns.filter(
      (c) => c.status === 'Referred to Hospital' || c.eventType === 'Emergency Medical Check-in'
    ).length;
    const parentAlertedCount = checkIns.filter((c) => c.parentNotified).length;

    return {
      total,
      todayCount,
      sickbayCount,
      feverCount,
      hospitalReferrals,
      parentAlertedCount,
    };
  }, [checkIns]);

  // Filter and Sort Logic
  const processedRecords = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = todayStart - 30 * 24 * 60 * 60 * 1000;

    // 1. Filter
    const filtered = checkIns.filter((record) => {
      // Search matches name, ADM, class, symptoms, first aid, notes, station, attendant
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        record.studentName.toLowerCase().includes(searchLower) ||
        record.admNo.toLowerCase().includes(searchLower) ||
        record.className.toLowerCase().includes(searchLower) ||
        (record.symptomsOrReason && record.symptomsOrReason.toLowerCase().includes(searchLower)) ||
        (record.firstAidOrAction && record.firstAidOrAction.toLowerCase().includes(searchLower)) ||
        (record.medicationGiven && record.medicationGiven.toLowerCase().includes(searchLower)) ||
        (record.checkedInBy && record.checkedInBy.toLowerCase().includes(searchLower)) ||
        (record.station && record.station.toLowerCase().includes(searchLower));

      // Event type
      const matchesEvent =
        eventTypeFilter === 'All' || record.eventType === eventTypeFilter;

      // Status
      const matchesStatus =
        statusFilter === 'All' || record.status === statusFilter;

      // Time Filter
      const recordTime = new Date(record.timestamp).getTime();
      let matchesTime = true;
      if (timeFilter === 'today') {
        matchesTime = recordTime >= todayStart;
      } else if (timeFilter === 'week') {
        matchesTime = recordTime >= weekAgo;
      } else if (timeFilter === 'month') {
        matchesTime = recordTime >= monthAgo;
      }

      return matchesSearch && matchesEvent && matchesStatus && matchesTime;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        comparison = timeA - timeB;
      } else if (sortField === 'studentName') {
        comparison = a.studentName.localeCompare(b.studentName);
      } else if (sortField === 'admNo') {
        comparison = a.admNo.localeCompare(b.admNo);
      } else if (sortField === 'eventType') {
        comparison = a.eventType.localeCompare(b.eventType);
      } else if (sortField === 'temperature') {
        const tempA = a.temperatureCelsius ?? 0;
        const tempB = b.temperatureCelsius ?? 0;
        comparison = tempA - tempB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [checkIns, searchTerm, eventTypeFilter, statusFilter, timeFilter, sortField, sortOrder]);

  // Toggle sort order or field
  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for newly selected fields
    }
  };

  // Download CSV of current list of records for the selected event / filters
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Timestamp (ISO)',
      'Formatted Date',
      'Formatted Time',
      'Admission No',
      'Student Name',
      'Class / Stream',
      'Gender',
      'Event Type',
      'Station',
      'Temperature (°C)',
      'Blood Group',
      'Allergies',
      'Chief Complaint / Reason',
      'First Aid / Action Taken',
      'Medication Given',
      'Status',
      'Attending Officer',
      'Parent Notified',
      'Clinical Notes',
    ];

    const rows = processedRecords.map((c) => {
      const dt = new Date(c.timestamp);
      return [
        c.id,
        c.timestamp,
        `"${dt.toLocaleDateString('en-KE', { dateStyle: 'medium' })}"`,
        `"${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}"`,
        c.admNo,
        `"${(c.studentName || '').replace(/"/g, '""')}"`,
        `"${(c.className || '').replace(/"/g, '""')}"`,
        c.gender || '',
        `"${(c.eventType || '').replace(/"/g, '""')}"`,
        `"${(c.station || '').replace(/"/g, '""')}"`,
        c.temperatureCelsius ?? '',
        c.bloodGroup || '',
        `"${(c.allergies || []).join('; ').replace(/"/g, '""')}"`,
        `"${(c.symptomsOrReason || '').replace(/"/g, '""')}"`,
        `"${(c.firstAidOrAction || '').replace(/"/g, '""')}"`,
        `"${(c.medicationGiven || '').replace(/"/g, '""')}"`,
        `"${(c.status || '').replace(/"/g, '""')}"`,
        `"${(c.checkedInBy || '').replace(/"/g, '""')}"`,
        c.parentNotified ? 'Yes' : 'No',
        `"${(c.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const eventSlug =
      eventTypeFilter === 'All'
        ? 'All_Events'
        : eventTypeFilter.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `JJSAK_QR_CheckIn_${eventSlug}_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Print Specific CSS Style Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-history-container, #printable-qr-history-container * {
            visibility: visible;
          }
          #printable-qr-history-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 10px !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-qr-history-container"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 bg-slate-900/95 no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  QR Welfare Event Check-In History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Sorted Audit Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete chronological record of student clinic visits, routine wellness screenings, deworming, and welfare intakes with full event details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Detailed Ledger
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compact Table
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={
                eventTypeFilter === 'All'
                  ? 'Download CSV of all check-in records'
                  : `Download CSV records for selected event: ${eventTypeFilter}`
              }
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow"
              title="Print current ledger"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Counters Bar (No Print) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 sm:px-6 bg-slate-950/60 border-b border-slate-800/80 text-xs no-print">
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Check-ins</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-white font-mono">{stats.total}</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Today's Encounters</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-emerald-400 font-mono">{stats.todayCount}</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Active in Sickbay</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-amber-400 font-mono">{stats.sickbayCount}</span>
              <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Fever Vitals (&gt;37.5°C)</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-rose-400 font-mono">{stats.feverCount}</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Hospital Referrals</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-red-400 font-mono">{stats.hospitalReferrals}</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Guardians Alerted</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-black text-blue-400 font-mono">{stats.parentAlertedCount}</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filter and Sorting Control Toolbar (No Print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-3 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, ADM, symptoms, drug, staff..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Event Type Filter */}
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Event Types</option>
                <option value="Sickbay Visit & Triage">Sickbay Visit &amp; Triage</option>
                <option value="Routine Health Screening">Routine Health Screening</option>
                <option value="Deworming & Immunization">Deworming &amp; Immunization</option>
                <option value="Guidance & Counseling Intake">Guidance &amp; Counseling Intake</option>
                <option value="Nutrition & Feeding Program">Nutrition &amp; Feeding Program</option>
                <option value="Sports & Physical Health Clearance">Sports Health Clearance</option>
                <option value="Emergency Medical Check-in">Emergency Medical Check-in</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Admitted to Sickbay">Admitted to Sickbay</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Treated & Returned to Class">Treated &amp; Returned to Class</option>
                <option value="Referred to Hospital">Referred to Hospital</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>

              {/* Time Window Filter */}
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                    timeFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('today')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                    timeFilter === 'today' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('week')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                    timeFilter === 'week' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('month')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                    timeFilter === 'month' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

          </div>

          {/* Active Sort Indicators & Quick Sort Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <SlidersHorizontal className="w-3 h-3" />
                Sort History By:
              </span>

              {/* Timestamp Sort */}
              <button
                type="button"
                onClick={() => handleSortToggle('timestamp')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  sortField === 'timestamp'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Timestamp</span>
                {sortField === 'timestamp' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>

              {/* Student Name Sort */}
              <button
                type="button"
                onClick={() => handleSortToggle('studentName')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  sortField === 'studentName'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Student Name</span>
                {sortField === 'studentName' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>

              {/* Admission No Sort */}
              <button
                type="button"
                onClick={() => handleSortToggle('admNo')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  sortField === 'admNo'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Admission No</span>
                {sortField === 'admNo' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>

              {/* Event Type Sort */}
              <button
                type="button"
                onClick={() => handleSortToggle('eventType')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  sortField === 'eventType'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Event Type</span>
                {sortField === 'eventType' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>

              {/* Temperature Sort */}
              <button
                type="button"
                onClick={() => handleSortToggle('temperature')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  sortField === 'temperature'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Temperature</span>
                {sortField === 'temperature' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Displaying <strong className="text-white font-bold">{processedRecords.length}</strong> of {checkIns.length} records
                {eventTypeFilter !== 'All' && (
                  <span className="ml-1 text-indigo-300 font-semibold">({eventTypeFilter})</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={processedRecords.length === 0}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                title={
                  eventTypeFilter === 'All'
                    ? 'Download CSV of current records'
                    : `Download CSV for selected event: ${eventTypeFilter}`
                }
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body / History Presentation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Print Header (Only appears on printed sheets) */}
          <div className="hidden print:block mb-4 text-black border-b border-black pb-2">
            <h1 className="text-lg font-black uppercase">JJSAK Comprehensive School</h1>
            <h2 className="text-sm font-bold">QR Welfare Event Check-In History &amp; Clinical Encounter Ledger</h2>
            <p className="text-xs">Generated on: {new Date().toLocaleString()} | Filter: {eventTypeFilter} | Status: {statusFilter}</p>
          </div>

          {processedRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-200">No Check-in History Matches Current Filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Try clearing your search query or selecting "All Event Types" and "All Time" to view full student check-in records.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setEventTypeFilter('All');
                  setStatusFilter('All');
                  setTimeFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Reset Filter Criteria
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* DETAILED LIST LEDGER VIEW */
            <div className="space-y-3">
              {processedRecords.map((record) => {
                const isExpanded = expandedId === record.id;
                const dt = new Date(record.timestamp);
                const isFever = (record.temperatureCelsius ?? 0) > 37.5;
                const healthProfile = healthProfiles[record.studentId];

                // Badge color based on status
                const getStatusColor = (status: WelfareCheckInStatus) => {
                  switch (status) {
                    case 'Completed':
                    case 'Treated & Returned to Class':
                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    case 'Admitted to Sickbay':
                      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                    case 'Under Observation':
                      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    case 'Referred to Hospital':
                      return 'bg-red-500/20 text-red-300 border-red-500/40';
                    default:
                      return 'bg-slate-700 text-slate-300 border-slate-600';
                  }
                };

                return (
                  <div
                    key={record.id}
                    className={`rounded-2xl border transition overflow-hidden ${
                      isExpanded
                        ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg'
                        : 'bg-slate-850 bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    {/* Main Row summary */}
                    <div
                      className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      {/* Left: Timestamp & Student Identification */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Student Avatar / Initials */}
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-black text-indigo-300 text-sm shrink-0">
                          {record.studentName.charAt(0)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-white">
                              {record.studentName}
                            </h4>
                            <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-800/60">
                              {record.admNo}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-lg">
                              {record.className}
                            </span>
                          </div>

                          {/* Timestamp Details */}
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <strong>
                                {dt.toLocaleDateString('en-KE', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </strong>
                              <span>•</span>
                              <span>
                                {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </span>

                            {record.station && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Building2 className="w-3 h-3 text-slate-500" />
                                {record.station}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Event Type & Primary Clinical Reason */}
                      <div className="flex-1 lg:max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                            {record.eventType}
                          </span>

                          {record.temperatureCelsius && (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 ${
                                isFever
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <Thermometer className="w-2.5 h-2.5" />
                              {record.temperatureCelsius}°C
                              {isFever && <span className="text-[9px] font-black uppercase">Fever</span>}
                            </span>
                          )}

                          {record.bloodGroup && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                              <Droplet className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                              {record.bloodGroup}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-medium line-clamp-1">
                          {record.symptomsOrReason || 'Check-in encounter documented.'}
                        </p>
                      </div>

                      {/* Right: Status, Parent Dispatch & Action Controls */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getStatusColor(
                              record.status
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {record.status}
                          </span>

                          {record.parentNotified ? (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Parent Alert Sent
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 block mt-1">
                              Parent not alerted
                            </span>
                          )}
                        </div>

                        <div className="p-1 text-slate-400 hover:text-white">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED 360° ENCOUNTER DETAILS */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-700/60 bg-slate-900/60 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          
                          {/* Col 1: Symptoms & Clinical Findings */}
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                              Chief Complaint / Symptoms
                            </h5>
                            <p className="text-slate-200 leading-relaxed">
                              {record.symptomsOrReason || 'Routine scheduled welfare encounter.'}
                            </p>
                            {record.allergies && record.allergies.length > 0 && (
                              <div className="pt-1 text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Known Allergens: {record.allergies.join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 2: First Aid, Treatment & Medication */}
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5 text-indigo-400" />
                              Action &amp; Medication Given
                            </h5>
                            <p className="text-slate-200 leading-relaxed">
                              {record.firstAidOrAction || 'Assessed and vitals recorded.'}
                            </p>
                            {record.medicationGiven && (
                              <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-[10px]">
                                Rx: {record.medicationGiven}
                              </span>
                            )}
                          </div>

                          {/* Col 3: Attendant & Disposition Notes */}
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                            <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-emerald-400" />
                              Attendant &amp; Emergency Contact
                            </h5>
                            <div className="text-slate-300 space-y-0.5 text-[11px]">
                              <div>
                                <span className="text-slate-500">Logged By: </span>
                                <strong className="text-white">{record.checkedInBy}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">Station: </span>
                                <span>{record.station || 'Health Kiosk'}</span>
                              </div>
                              {(() => {
                                const matchingStudent = students.find(
                                  (s) => s.id === record.studentId || s.admNo === record.admNo
                                );
                                const phone = matchingStudent?.parentPhone || matchingStudent?.emergencyPhone;
                                const guardian = matchingStudent?.parentName || matchingStudent?.guardianName || 'Guardian';
                                return (
                                  <>
                                    {phone && (
                                      <div className="pt-0.5 text-emerald-400">
                                        <span className="text-slate-500">Guardian: </span>
                                        <span>
                                          {guardian} ({phone})
                                        </span>
                                      </div>
                                    )}
                                    {healthProfile?.doctorPhone && (
                                      <div className="pt-0.5 text-sky-400">
                                        <span className="text-slate-500">Doctor: </span>
                                        <span>
                                          {healthProfile.doctorName || 'Assigned'} ({healthProfile.doctorPhone})
                                        </span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                              {record.notes && (
                                <div className="pt-1 text-slate-400 italic">
                                  "{record.notes}"
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Bottom Actions inside Expanded Encounter */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                          <div className="flex items-center gap-2">
                            {onUpdateStatus && record.status === 'Admitted to Sickbay' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(record, 'Treated & Returned to Class');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                              >
                                Discharge Back to Class
                              </button>
                            )}

                            {onUpdateStatus && record.status === 'Under Observation' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(record, 'Completed');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                              >
                                Mark Observation Completed
                              </button>
                            )}
                          </div>

                          {onOpenStudentPass && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenStudentPass(record.studentId);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View Student QR Health Pass</span>
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT TABLE VIEW */
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-white transition"
                        onClick={() => handleSortToggle('timestamp')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Timestamp</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-white transition"
                        onClick={() => handleSortToggle('studentName')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Learner</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-white transition"
                        onClick={() => handleSortToggle('admNo')}
                      >
                        <div className="flex items-center gap-1">
                          <span>ADM No</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-white transition"
                        onClick={() => handleSortToggle('eventType')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Event Type</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-white transition"
                        onClick={() => handleSortToggle('temperature')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Temp</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-3">Symptoms / Chief Note</th>
                      <th className="py-3 px-3">Action / Medication</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Officer</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60">
                    {processedRecords.map((record) => {
                      const dt = new Date(record.timestamp);
                      const isFever = (record.temperatureCelsius ?? 0) > 37.5;

                      return (
                        <tr key={record.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-300">
                            {dt.toLocaleDateString('en-KE', { month: 'numeric', day: 'numeric' })}{' '}
                            <span className="text-slate-400">
                              {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                            {record.studentName}
                            <span className="text-[10px] text-slate-400 font-normal block">
                              {record.className}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-indigo-400 font-bold whitespace-nowrap">
                            {record.admNo}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {record.eventType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {record.temperatureCelsius ? (
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isFever ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {record.temperatureCelsius}°C
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-300">
                            {record.symptomsOrReason || 'Standard triage'}
                          </td>

                          <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-300">
                            {record.firstAidOrAction || 'Evaluated'}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                record.status === 'Completed' ||
                                record.status === 'Treated & Returned to Class'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : record.status === 'Admitted to Sickbay'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : record.status === 'Referred to Hospital'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                            {record.checkedInBy}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {onOpenStudentPass && (
                              <button
                                type="button"
                                onClick={() => onOpenStudentPass(record.studentId)}
                                className="p-1 rounded text-slate-400 hover:text-emerald-400 transition"
                                title="View Student QR Pass"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer (No Print) */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable CBC Clinical Event Ledger • Synchronized with Ministry &amp; School Sickbay Standards</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Close History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
