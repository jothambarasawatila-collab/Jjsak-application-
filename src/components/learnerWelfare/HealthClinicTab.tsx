import React, { useState, useMemo } from 'react';
import {
  Heart,
  Activity,
  Plus,
  Search,
  ShieldCheck,
  AlertCircle,
  Hospital,
  Thermometer,
  Pill,
  X,
} from 'lucide-react';
import { Student, User as CurrentUser } from '../../types';
import {
  HealthIncidentRecord,
  HealthIncidentType,
  LearnerHealthProfile,
  BloodGroup,
} from '../../types/learnerWelfare';
import { AVAILABLE_CLASSES } from '../../data/mockData';

interface HealthClinicTabProps {
  students: Student[];
  currentUser?: CurrentUser;
  healthIncidents: HealthIncidentRecord[];
  healthProfiles: Record<string, LearnerHealthProfile>;
  onAddHealthIncident: (incident: HealthIncidentRecord) => void;
  onUpdateHealthProfile: (profile: LearnerHealthProfile) => void;
  onLogAudit?: (action: any, details: string, beforeVal?: string, afterVal?: string) => void;
}

const INCIDENT_TYPES: HealthIncidentType[] = [
  'Sickbay Visit',
  'Minor First Aid',
  'Sudden Illness',
  'Medical Emergency',
  'Hospital Referral',
  'Routine Health Check',
];

export const HealthClinicTab: React.FC<HealthClinicTabProps> = ({
  students,
  currentUser,
  healthIncidents,
  healthProfiles,
  onAddHealthIncident,
  onUpdateHealthProfile,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'profiles'>('incidents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<Student | null>(null);
  const [viewingIncident, setViewingIncident] = useState<HealthIncidentRecord | null>(null);

  // Health Incident Form State
  const [formStudentId, setFormStudentId] = useState('');
  const [formIncidentType, setFormIncidentType] = useState<HealthIncidentType>('Sickbay Visit');
  const [formSymptoms, setFormSymptoms] = useState('');
  const [formTemp, setFormTemp] = useState('37.0');
  const [formFirstAid, setFormFirstAid] = useState('');
  const [formMedication, setFormMedication] = useState('');
  const [formNurse, setFormNurse] = useState('Nurse Mary Chepkoech');
  const [formParentInformed, setFormParentInformed] = useState(true);
  const [formReferred, setFormReferred] = useState(false);
  const [formHospital, setFormHospital] = useState('Kitale County Referral Hospital');
  const [formOutcome, setFormOutcome] = useState('Discharged back to class after rest.');
  const [formFollowUp, setFormFollowUp] = useState(false);

  // Health Profile Edit State
  const [profileBloodGroup, setProfileBloodGroup] = useState<BloodGroup>('O+');
  const [profileAllergies, setProfileAllergies] = useState('');
  const [profileChronic, setProfileChronic] = useState('');
  const [profileMeds, setProfileMeds] = useState('');
  const [profileEmergencyNotes, setProfileEmergencyNotes] = useState('');
  const [profileHospital, setProfileHospital] = useState('');
  const [profileDoctorName, setProfileDoctorName] = useState('');
  const [profileDoctorPhone, setProfileDoctorPhone] = useState('');
  const [profileInsurance, setProfileInsurance] = useState('');

  // Stats
  const stats = useMemo(() => {
    const totalVisits = healthIncidents.length;
    const referrals = healthIncidents.filter((h) => h.referredToHospital).length;
    const allergiesCount = Object.values(healthProfiles).filter((p) => p.allergies?.length > 0).length;
    const chronicCount = Object.values(healthProfiles).filter((p) => p.chronicConditions?.length > 0).length;

    return { totalVisits, referrals, allergiesCount, chronicCount };
  }, [healthIncidents, healthProfiles]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return healthIncidents.filter((inc) => {
      const matchesSearch =
        inc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.admNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.firstAidGiven.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'All' || inc.className === selectedClass;
      const matchesType = selectedType === 'All' || inc.incidentType === selectedType;

      return matchesSearch && matchesClass && matchesType;
    });
  }, [healthIncidents, searchTerm, selectedClass, selectedType]);

  const handleOpenLogModal = () => {
    setFormStudentId(students[0]?.id || '');
    setFormIncidentType('Sickbay Visit');
    setFormSymptoms('');
    setFormTemp('37.2');
    setFormFirstAid('Rested in sickbay bed, vital signs checked');
    setFormMedication('');
    setFormNurse(currentUser?.fullName || 'School Nurse');
    setFormParentInformed(true);
    setFormReferred(false);
    setFormHospital('Kitale County Referral Hospital');
    setFormOutcome('Condition stabilized, returned to class.');
    setFormFollowUp(false);
    setShowLogModal(true);
  };

  const handleSaveHealthIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formStudentId);
    if (!student) return;

    const newInc: HealthIncidentRecord = {
      id: `health-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      className: `${student.grade} ${student.stream || student.classArm || ''}`.trim(),
      dateTime: new Date().toISOString(),
      incidentType: formIncidentType,
      symptoms: formSymptoms,
      temperatureCelsius: parseFloat(formTemp) || undefined,
      firstAidGiven: formFirstAid,
      medicationAdministered: formMedication || undefined,
      nurseOrAttendant: formNurse,
      parentInformed: formParentInformed,
      referredToHospital: formReferred,
      hospitalName: formReferred ? formHospital : undefined,
      outcome: formOutcome,
      followUpRequired: formFollowUp,
    };

    onAddHealthIncident(newInc);
    if (onLogAudit) {
      onLogAudit(
        'HEALTH_INCIDENT_RECORDED' as any,
        `Logged clinic event [${formIncidentType}] for ${student.name} (${student.admNo}): ${formSymptoms}. Hospital referral: ${formReferred ? 'Yes' : 'No'}.`
      );
    }

    setShowLogModal(false);
  };

  const handleOpenEditProfile = (student: Student) => {
    const existing = healthProfiles[student.id] || student.healthProfile;
    setShowEditProfileModal(student);
    setProfileBloodGroup(existing?.bloodGroup || 'O+');
    setProfileAllergies(existing?.allergies?.join(', ') || '');
    setProfileChronic(existing?.chronicConditions?.join(', ') || '');
    setProfileMeds(existing?.regularMedications?.join(', ') || '');
    setProfileEmergencyNotes(existing?.emergencyMedicalNotes || '');
    setProfileHospital(existing?.preferredHospital || 'Kitale County Referral');
    setProfileDoctorName(existing?.doctorName || '');
    setProfileDoctorPhone(existing?.doctorPhone || '');
    setProfileInsurance(existing?.nhifOrInsuranceNumber || 'SHA-Registered');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditProfileModal) return;

    const updatedProfile: LearnerHealthProfile = {
      studentId: showEditProfileModal.id,
      bloodGroup: profileBloodGroup,
      allergies: profileAllergies.split(',').map((s) => s.trim()).filter(Boolean),
      chronicConditions: profileChronic.split(',').map((s) => s.trim()).filter(Boolean),
      disabilities: showEditProfileModal.healthProfile?.disabilities || [],
      regularMedications: profileMeds.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyMedicalNotes: profileEmergencyNotes,
      preferredHospital: profileHospital,
      doctorName: profileDoctorName,
      doctorPhone: profileDoctorPhone,
      immunizationUpToDate: true,
      nhifOrInsuranceNumber: profileInsurance,
    };

    onUpdateHealthProfile(updatedProfile);
    if (onLogAudit) {
      onLogAudit(
        'HEALTH_PROFILE_UPDATED' as any,
        `Updated Medical Profile for ${showEditProfileModal.name} (${showEditProfileModal.admNo}). Blood Group: ${profileBloodGroup}.`
      );
    }

    setShowEditProfileModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinic &amp; Sickbay Logs</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.totalVisits}</p>
          <span className="text-[10px] text-slate-400 font-medium">Logged encounters</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-rose-200/80 shadow-xs bg-gradient-to-b from-rose-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Hospital Referrals</span>
            <Hospital className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-700 mt-1">{stats.referrals}</p>
          <span className="text-[10px] text-rose-600 font-medium">Specialist transfers</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Documented Allergies</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">{stats.allergiesCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Dietary &amp; medicinal</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Medical Privacy Guard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-emerald-700 mt-2">P6.6.2 Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">Role-protected health data</span>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('incidents')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Clinic &amp; Sickbay Visits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('profiles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'profiles'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Learner Health Cards &amp; Blood Groups</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenLogModal}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Log Clinic Visit</span>
        </button>
      </div>

      {/* Tab 1: Clinic & Sickbay Visits Log */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clinic logs by learner, symptoms, medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="All">All Classes</option>
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="All">All Incident Types</option>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Learner</th>
                    <th className="py-3 px-3">Encounter Type</th>
                    <th className="py-3 px-3">Symptoms / Temp</th>
                    <th className="py-3 px-3">First Aid &amp; Treatment</th>
                    <th className="py-3 px-3">Hospital Referral</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                        No medical clinic logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inc.studentName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{inc.admNo}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{inc.className}</span>
                            <span>•</span>
                            <span>{inc.dateTime.substring(0, 10)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {inc.incidentType}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-semibold text-slate-800 line-clamp-1">{inc.symptoms}</div>
                          {inc.temperatureCelsius && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Thermometer className="w-3 h-3 text-rose-500" />
                              <span>{inc.temperatureCelsius}°C</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="text-slate-700 line-clamp-1 font-medium">{inc.firstAidGiven}</div>
                          {inc.medicationAdministered && (
                            <div className="text-[10px] text-indigo-600 flex items-center gap-1 mt-0.5 font-semibold">
                              <Pill className="w-3 h-3" />
                              <span>{inc.medicationAdministered}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {inc.referredToHospital ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Hospital className="w-3 h-3" />
                              <span>{inc.hospitalName?.split(',')[0] || 'Referred'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Sickbay Only</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingIncident(inc)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                          >
                            Dossier
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Learner Health Cards & Blood Group Matrix */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => {
              const profile = healthProfiles[student.id] || student.healthProfile;
              const blood = profile?.bloodGroup || 'O+';
              const allergies = profile?.allergies || [];
              const chronic = profile?.chronicConditions || [];

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                        {student.avatarInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{student.name}</h4>
                        <div className="text-[11px] font-mono text-slate-500">
                          {student.admNo} • {student.grade} {student.stream || student.classArm || ''}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                      🩸 {blood}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Allergies:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {allergies.length > 0 ? (
                          allergies.map((alg, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              ⚠️ {alg}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None documented</span>
                        )}
                      </div>
                    </div>

                    {chronic.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chronic / Monitored:</span>
                        <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                          {chronic.join(', ')}
                        </div>
                      </div>
                    )}

                    {profile?.preferredHospital && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1">
                        <Hospital className="w-3 h-3 text-slate-400" />
                        <span>{profile.preferredHospital}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {profile?.nhifOrInsuranceNumber || 'SHA Insured'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditProfile(student)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition cursor-pointer"
                    >
                      Update Health Card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Card Edit Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Health Profile: {showEditProfileModal.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">P6.6.1 Learner Health Card</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={profileBloodGroup}
                    onChange={(e) => setProfileBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-rose-700"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SHA / Insurance No.</label>
                  <input
                    type="text"
                    value={profileInsurance}
                    onChange={(e) => setProfileInsurance(e.target.value)}
                    placeholder="SHA-xxxx"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={profileAllergies}
                  onChange={(e) => setProfileAllergies(e.target.value)}
                  placeholder="e.g. Peanuts, Penicillin, Dust Mites"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chronic Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={profileChronic}
                  onChange={(e) => setProfileChronic(e.target.value)}
                  placeholder="e.g. Asthma, Sickle Cell Trait, Epilepsy"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Emergency Medical Action Notes
                </label>
                <textarea
                  rows={2}
                  value={profileEmergencyNotes}
                  onChange={(e) => setProfileEmergencyNotes(e.target.value)}
                  placeholder="e.g. Epipen in school dispensary; avoid rigorous outdoor activity in dusty conditions"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Hospital</label>
                  <input
                    type="text"
                    value={profileHospital}
                    onChange={(e) => setProfileHospital(e.target.value)}
                    placeholder="Kitale Referral"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Doctor Phone</label>
                  <input
                    type="tel"
                    value={profileDoctorPhone}
                    onChange={(e) => setProfileDoctorPhone(e.target.value)}
                    placeholder="+254 7..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Save Health Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Clinic Visit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Sickbay / Clinic Visit</h3>
                <p className="text-xs text-slate-500 font-medium">P6.6.3 Health Incident Recording</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHealthIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Learner <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admNo}) — {s.grade} {s.stream || s.classArm || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Encounter Type</label>
                  <select
                    value={formIncidentType}
                    onChange={(e) => setFormIncidentType(e.target.value as HealthIncidentType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTemp}
                    onChange={(e) => setFormTemp(e.target.value)}
                    placeholder="37.0"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Observed Symptoms <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSymptoms}
                  onChange={(e) => setFormSymptoms(e.target.value)}
                  placeholder="e.g. Sharp stomach ache, dizziness, nausea"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  First Aid / Immediate Treatment Given <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formFirstAid}
                  onChange={(e) => setFormFirstAid(e.target.value)}
                  placeholder="Describe treatment given in sickbay..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Medication Administered</label>
                  <input
                    type="text"
                    value={formMedication}
                    onChange={(e) => setFormMedication(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Attending Nurse/Staff</label>
                  <input
                    type="text"
                    value={formNurse}
                    onChange={(e) => setFormNurse(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="refHosp"
                    checked={formReferred}
                    onChange={(e) => setFormReferred(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <label htmlFor="refHosp" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Refer Learner to External Hospital / Doctor
                  </label>
                </div>

                {formReferred && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Hospital Facility Name
                    </label>
                    <input
                      type="text"
                      value={formHospital}
                      onChange={(e) => setFormHospital(e.target.value)}
                      placeholder="Kitale County Referral Hospital"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Save Clinic Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Incident Dossier Modal */}
      {viewingIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{viewingIncident.studentName}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {viewingIncident.admNo} • {viewingIncident.className} • {viewingIncident.incidentType}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingIncident(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recorded At</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(viewingIncident.dateTime).toLocaleString('en-KE')}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Temperature</span>
                  <span className="font-bold text-slate-800">
                    {viewingIncident.temperatureCelsius ? `${viewingIncident.temperatureCelsius} °C` : 'Normal'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Symptoms Reported</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingIncident.symptoms}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">First Aid & Administered Treatment</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingIncident.firstAidGiven}</p>
                {viewingIncident.medicationAdministered && (
                  <p className="text-indigo-600 font-bold mt-1">Medication: {viewingIncident.medicationAdministered}</p>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Outcome & Hospital Referral</span>
                <p className="font-medium text-slate-700 mt-0.5">{viewingIncident.outcome}</p>
                {viewingIncident.referredToHospital && (
                  <p className="text-rose-600 font-bold mt-1">Referred to: {viewingIncident.hospitalName}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Attending Nurse: <strong className="text-slate-800">{viewingIncident.nurseOrAttendant}</strong></span>
                <span>Parent Informed: <strong className={viewingIncident.parentInformed ? 'text-emerald-700' : 'text-amber-700'}>{viewingIncident.parentInformed ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
