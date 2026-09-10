import React, { useState } from 'react';
import {
  X,
  Send,
  Download,
  MessageSquare,
  Share2,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../../types';
import { ReportTemplateType, ReportDistributionBatch } from '../../types/reporting';
import { INITIAL_DISTRIBUTION_BATCHES } from '../../data/reportingEngine';

interface ReportDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolInfo?: any;
  activeTemplate: ReportTemplateType;
  onLogAudit?: (action: any, details: string) => void;
}

export const ReportDistributionModal: React.FC<ReportDistributionModalProps> = ({
  isOpen,
  onClose,
  students,
  activeTemplate,
  onLogAudit,
}) => {
  const [selectedCohort, setSelectedCohort] = useState<string>('Grade 8 (All Streams)');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['PDF_PRINT', 'PARENT_PORTAL']);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [batches, setBatches] = useState<ReportDistributionBatch[]>(INITIAL_DISTRIBUTION_BATCHES);

  if (!isOpen) return null;

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleStartDispatch = () => {
    if (selectedChannels.length === 0) return;
    setIsDispatching(true);
    setDispatchSuccess(false);

    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSuccess(true);

      const newBatch: ReportDistributionBatch = {
        id: `batch-${Date.now().toString().slice(-4)}`,
        batchName: `${selectedCohort} - ${activeTemplate.replace(/_/g, ' ').toUpperCase()}`,
        reportType: activeTemplate,
        targetCohort: selectedCohort,
        totalRecipients: students.length,
        channelsSelected: selectedChannels as any,
        status: 'COMPLETED',
        dispatchedCount: students.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        initiatedBy: 'Prof. Jotham Barasa',
      };

      setBatches([newBatch, ...batches]);
      onLogAudit?.(
        'REPORT_DISTRIBUTION_BATCH_COMPLETED',
        `Dispatched ${students.length} reports for ${selectedCohort} via channels: ${selectedChannels.join(', ')}.`
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Send className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                P8.10 Report Multi-Channel Distribution Engine
              </h2>
              <p className="text-xs text-indigo-200">
                Bulk PDF compilation, SMS alerts, WhatsApp links, and Parent Portal syncing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Target Cohort Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Target Learner Cohort</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Grade 7 (All Streams)">Grade 7 (All Streams) - 88 Learners</option>
              <option value="Grade 8 (All Streams)">Grade 8 (All Streams) - 92 Learners</option>
              <option value="Grade 9 (All Streams)">Grade 9 (All Streams) - 60 Learners</option>
              <option value="Whole School Cohort">Whole Junior Secondary School - 240 Learners</option>
            </select>
          </div>

          {/* Channels Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Choose Transmission Channels (Select Multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'PDF_PRINT', title: 'High-Res Vector PDF', desc: 'Compiled ZIP archive with print-ready reports', icon: Download },
                { id: 'PARENT_PORTAL', title: 'Parent Portal Publish', desc: 'Instant access on parent dashboard with student PIN', icon: Globe },
                { id: 'SMS_ALERT', title: 'SMS Result Blast', desc: 'Summarized mean grade + direct download secure URL', icon: MessageSquare },
                { id: 'WHATSAPP_LINK', title: 'WhatsApp Direct Share', desc: 'Encrypted document delivery to parent contact numbers', icon: Share2 },
              ].map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block font-bold text-xs">{channel.title}</strong>
                      <p className="text-[11px] opacity-80 mt-0.5">{channel.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dispatch Progress State */}
          {dispatchSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Distribution Batch Successfully Completed!</strong>
                <span className="text-[11px] text-emerald-800">
                  Reports for {selectedCohort} compiled and dispatched across {selectedChannels.length} channels.
                </span>
              </div>
            </div>
          )}

          {/* Recent Batches History */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider block">
              Recent Dispatches
            </span>
            <div className="space-y-2">
              {batches.slice(0, 3).map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="font-bold text-slate-900">{b.batchName}</strong>
                    <span className="text-[10px] text-slate-500 block">
                      {b.timestamp} • Dispatched: {b.dispatchedCount} / {b.totalRecipients}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleStartDispatch}
            disabled={isDispatching || selectedChannels.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            {isDispatching ? 'Dispatching Cohort Reports...' : 'Execute Batch Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
};
