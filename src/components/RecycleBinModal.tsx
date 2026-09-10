import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X,
  CheckCircle2,
  FileText,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { RecycleBinItem, UserRole } from '../types';
import { canPerformPermanentDelete } from '../utils/securityEngine';

interface RecycleBinModalProps {
  isOpen: boolean;
  items: RecycleBinItem[];
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onRestore: (item: RecycleBinItem) => void;
  onPermanentPurge: (item: RecycleBinItem, reason: string) => void;
  onEmptyBin?: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  items,
  currentUserRole,
  currentUserName,
  onClose,
  onRestore,
  onPermanentPurge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Purge confirmation dialog state
  const [itemToPurge, setItemToPurge] = useState<RecycleBinItem | null>(null);
  const [purgeReason, setPurgeReason] = useState('');
  const [purgeConfirmationText, setPurgeConfirmationText] = useState('');

  if (!isOpen) return null;

  const canPurge = canPerformPermanentDelete(currentUserRole);

  const filteredItems = items.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.itemTitle && item.itemTitle.toLowerCase().includes(q)) ||
      (item.deletedBy && item.deletedBy.toLowerCase().includes(q)) ||
      (item.reason && item.reason.toLowerCase().includes(q));
    const matchesType = filterType === 'ALL' || item.itemType === filterType;
    return matchesSearch && matchesType;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Learner Record':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Assessment Record':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'Teacher Profile':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  const getDaysRemaining = (purgeDeadline: number) => {
    const diffMs = purgeDeadline - Date.now();
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  };

  const handleConfirmPurge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToPurge) return;
    if (purgeConfirmationText !== 'PERMANENTLY DELETE') return;
    if (purgeReason.trim().length < 10) return;

    onPermanentPurge(itemToPurge, purgeReason.trim());
    setItemToPurge(null);
    setPurgeReason('');
    setPurgeConfirmationText('');
  };

  return (
    <div
      id="recycle-bin-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-[#C51E28] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Trash2 className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
                JJSAK Recovery Window • Code P2.10
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                30-Day Recycle Bin &amp; Deletion Guard
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 px-5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Records are safely preserved for <strong>30 days</strong> before permanent system purging.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
            {items.length} item{items.length !== 1 ? 's' : ''} in recovery
          </span>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deleted records by title, reason, or actor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C51E28]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-bold focus:outline-none focus:border-[#C51E28]"
            >
              <option value="ALL">All Record Types</option>
              <option value="Learner Record">Learner Records</option>
              <option value="Assessment Record">Assessment Records</option>
              <option value="Teacher Profile">Teacher Profiles</option>
            </select>
          </div>
        </div>

        {/* Item List */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 stroke-[1.5]" />
              <h4 className="text-sm font-bold text-slate-700">Recycle Bin is Empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No active soft-deleted records currently pending recovery or purge.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const daysLeft = getDaysRemaining(item.purgeDeadline);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {getItemIcon(item.itemType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{item.itemTitle}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.itemType}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {daysLeft} days until purge
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        Deleted by <strong className="text-slate-700">{item.deletedBy}</strong> ({item.deletedByRole}) on{' '}
                        {new Date(item.deletedAt).toLocaleDateString()} at{' '}
                        {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5 bg-red-50/60 px-2 py-1 rounded-lg border border-red-100 inline-block font-mono">
                        Reason: {item.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onRestore(item)}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Record</span>
                    </button>

                    {canPurge ? (
                      <button
                        type="button"
                        onClick={() => setItemToPurge(item)}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge Now</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic px-2">
                        Purge requires Head/Admin privilege
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Active User: <strong className="text-slate-800">{currentUserName}</strong> ({currentUserRole})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Recycle Bin
          </button>
        </div>
      </div>

      {/* Code P2.10 Permanent Purge Double-Confirmation Submodal */}
      {itemToPurge && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-500 p-6 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                  Code P2.10 • Irreversible Purge Gate
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  Permanently Purge Record?
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to permanently purge <strong className="text-slate-900">{itemToPurge.itemTitle}</strong> ({itemToPurge.itemType}). This action completely erases the record and cannot be undone.
            </p>

            <form onSubmit={handleConfirmPurge} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandatory Purge Reason (Min. 10 chars):
                </label>
                <textarea
                  rows={2}
                  value={purgeReason}
                  onChange={(e) => setPurgeReason(e.target.value)}
                  placeholder="e.g. Duplicate erroneous profile confirmed by Board of Management"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-red-600 font-black">PERMANENTLY DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={purgeConfirmationText}
                  onChange={(e) => setPurgeConfirmationText(e.target.value)}
                  placeholder="PERMANENTLY DELETE"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setItemToPurge(null);
                    setPurgeReason('');
                    setPurgeConfirmationText('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purgeConfirmationText !== 'PERMANENTLY DELETE' || purgeReason.trim().length < 10}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    purgeConfirmationText === 'PERMANENTLY DELETE' && purgeReason.trim().length >= 10
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Forever</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
