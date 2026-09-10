import React, { useState } from 'react';
import {
  X,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  LearningSpaceRoom,
  RoomAllocationConflict,
} from '../../types/streamTimetableGovernance';
import { streamTimetableGovernanceService } from '../../services/streamTimetableGovernanceService';
import { TimetableLesson } from '../../types/timetable';
import { User } from '../../types';

interface RoomConflictManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: TimetableLesson[];
  currentUser?: User;
  onResolveConflict?: (lessonId: string, newRoomName: string) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const RoomConflictManagerModal: React.FC<RoomConflictManagerModalProps> = ({
  isOpen,
  onClose,
  lessons,
  currentUser,
  onResolveConflict,
  onLogAudit,
}) => {
  const [spaces, setSpaces] = useState<LearningSpaceRoom[]>(() =>
    streamTimetableGovernanceService.getLearningSpaces()
  );

  const [activeSubTab, setActiveSubTab] = useState<'CONFLICTS' | 'ROOMS' | 'RESERVATIONS'>('CONFLICTS');
  const [searchQuery, setSearchQuery] = useState('');

  // Reservation form states
  const [selectedRoomForReserve, setSelectedRoomForReserve] = useState(spaces[0]?.id || '');
  const [reservationReason, setReservationReason] = useState('KJSEA National Trial Practical Exam');
  const [reservationDate, setReservationDate] = useState('2026-07-28');
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([3, 4, 5]);

  if (!isOpen) return null;

  // Real-time room conflict detection (§11)
  const roomConflicts: RoomAllocationConflict[] = streamTimetableGovernanceService.detectRoomConflicts(lessons);

  const handleReserveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const room = spaces.find((s) => s.id === selectedRoomForReserve);
    if (!room) return;

    streamTimetableGovernanceService.reserveRoom(
      room.id,
      reservationReason,
      reservationDate,
      selectedPeriods,
      currentUser?.fullName || 'Director of Academics'
    );

    const updated = streamTimetableGovernanceService.getLearningSpaces();
    setSpaces(updated);

    if (onLogAudit) {
      onLogAudit(
        'ROOM_RESERVED',
        `Director of Academics reserved ${room.name} on ${reservationDate} for ${reservationReason}.`
      );
    }
    alert(`Room ${room.name} reserved successfully. It is now blocked from routine lesson allocation.`);
  };

  const handleReleaseReservation = (roomId: string, roomName: string) => {
    if (confirm(`Release reservation on ${roomName}?`)) {
      streamTimetableGovernanceService.releaseRoomReservation(roomId);
      const updated = streamTimetableGovernanceService.getLearningSpaces();
      setSpaces(updated);

      if (onLogAudit) {
        onLogAudit('ROOM_RESERVATION_RELEASED', `Director of Academics released reservation on ${roomName}.`);
      }
    }
  };

  const handleApplyAlternativeRoom = (
    conflict: RoomAllocationConflict,
    altRoomName: string
  ) => {
    // Find the affected second lesson to move to the alternative room
    const targetLesson = lessons.find(
      (l) =>
        l.room?.toLowerCase() === conflict.roomName.toLowerCase() &&
        l.day === conflict.day &&
        l.periodNumber === conflict.periodNumber &&
        l.className === conflict.conflictingClasses[1]
    );

    if (targetLesson && onResolveConflict) {
      onResolveConflict(targetLesson.id, altRoomName);
      if (onLogAudit) {
        onLogAudit(
          'ROOM_CONFLICT_RESOLVED',
          `Director of Academics resolved conflict in ${conflict.roomName} by reallocating ${targetLesson.className} (${targetLesson.subject}) to ${altRoomName}.`
        );
      }
      alert(`Conflict resolved! Reallocated ${targetLesson.className} to ${altRoomName}.`);
    } else {
      alert(`Please manually assign ${conflict.conflictingClasses[1]} to ${altRoomName} in the edit modal.`);
    }
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="room-conflict-manager-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Learning Spaces &amp; Room Conflict Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-800 uppercase">
                  Requirement §11
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Science Labs, Computer Labs, Workshops, Examination Halls, Classrooms &amp; Zero Room Overlap
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 py-2 bg-slate-850 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('CONFLICTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'CONFLICTS'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Room Conflicts ({roomConflicts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ROOMS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'ROOMS'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>All Learning Spaces ({spaces.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('RESERVATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'RESERVATIONS'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Room Reservations &amp; Events</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeSubTab === 'CONFLICTS' && (
            <div className="space-y-4">
              {roomConflicts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-850/60 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Zero Room Allocation Conflicts</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      No classroom, laboratory, workshop, or specialized facility is assigned to more than one class, teacher, or activity during the same lesson period (§11).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <strong>CRITICAL VALIDATION BLOCK:</strong> Timetable publication is locked until all {roomConflicts.length} room collision(s) are resolved (§11 &amp; §5).
                    </div>
                  </div>

                  {roomConflicts.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-850 border border-red-800/70 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800">
                            {c.day} • Period {c.periodNumber}
                          </span>
                          <strong className="text-sm font-bold text-white">{c.roomName}</strong>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 uppercase">
                          Double-Booked Space
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{c.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                        <div>
                          <span>Conflicting Streams: </span>
                          <strong className="text-white">{c.conflictingClasses.join(', ')}</strong>
                        </div>
                        <div>
                          <span>Conflicting Subjects: </span>
                          <strong className="text-white">{c.conflictingSubjects.join(', ')}</strong>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {c.alternativeAvailableRooms.length > 0 && (
                        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Suggested Available Alternatives:</span>
                            <div className="flex gap-1.5">
                              {c.alternativeAvailableRooms.map((alt) => (
                                <button
                                  key={alt}
                                  type="button"
                                  onClick={() => handleApplyAlternativeRoom(c, alt)}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-700 text-slate-200 border border-slate-700 text-[10px] font-semibold transition cursor-pointer"
                                >
                                  Reallocate to {alt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'ROOMS' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search labs, workshops, classrooms, halls..."
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              {/* Grid of rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSpaces.map((space) => (
                  <div
                    key={space.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-red-400" />
                        <h4 className="text-xs font-bold text-white">{space.name}</h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          space.isReserved
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {space.isReserved ? 'Reserved' : 'Available'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Facility Type:</span>
                        <strong className="text-slate-200">{space.type}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Capacity:</span>
                        <strong className="text-amber-400">{space.capacity} learners</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Location:</span>
                        <span className="text-slate-300 truncate max-w-[180px]">{space.location}</span>
                      </div>
                    </div>

                    {space.isReserved && space.reservationReason && (
                      <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300 mt-2">
                        🔒 {space.reservationReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'RESERVATIONS' && (
            <div className="space-y-6">
              {/* Reserve Room Form */}
              <form
                onSubmit={handleReserveRoom}
                className="p-5 rounded-xl bg-slate-850 border border-slate-800 space-y-4"
              >
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Reserve Learning Space / Facility for Institutional Event (§11)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Select Facility</label>
                    <select
                      value={selectedRoomForReserve}
                      onChange={(e) => setSelectedRoomForReserve(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                    >
                      {spaces.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Reservation Reason</label>
                    <input
                      type="text"
                      required
                      value={reservationReason}
                      onChange={(e) => setReservationReason(e.target.value)}
                      placeholder="e.g. KJSEA Mocks, General Assembly, Science Contest"
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Event Date</label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-755 rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Reserved Periods</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            if (selectedPeriods.includes(p)) {
                              setSelectedPeriods(selectedPeriods.filter((x) => x !== p));
                            } else {
                              setSelectedPeriods([...selectedPeriods, p].sort((a, b) => a - b));
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            selectedPeriods.includes(p)
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-750'
                          }`}
                        >
                          P{p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    Reserved facilities are automatically blocked from regular teaching timetable slots.
                  </span>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#C51E28] hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Reservation</span>
                  </button>
                </div>
              </form>

              {/* Reserved Rooms List */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-850">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-300">
                  Currently Locked Facility Reservations
                </div>
                <div className="divide-y divide-slate-800">
                  {spaces.filter((s) => s.isReserved).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No specialized rooms are currently under exclusive reservation.
                    </div>
                  ) : (
                    spaces
                      .filter((s) => s.isReserved)
                      .map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <strong className="text-white">{res.name}</strong>
                            <div className="text-[11px] text-amber-400 mt-0.5">
                              {res.reservationReason}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Date: {res.reservationDate || 'All Term'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReleaseReservation(res.id, res.name)}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Release
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Automated room conflict validation ensures zero double-booking across all learning spaces (§11).
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close Room Hub
          </button>
        </div>
      </div>
    </div>
  );
};
