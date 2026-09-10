import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Utensils,
  ShieldPlus,
  Accessibility,
  Edit2,
  Save,
  CheckCircle2,
  FileHeart,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  MedicalHealthDossier,
  MedicalConditionEntry,
  SpecialNeedCategory,
} from '../../types/learnerRegistration';

interface MedicalHealthRecordsTabProps {
  selectedDossier: LearnerMasterDossier;
  onUpdateDossier: (updated: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const MedicalHealthRecordsTab: React.FC<MedicalHealthRecordsTabProps> = ({
  selectedDossier,
  onUpdateDossier,
  onLogAudit,
}) => {
  const currentMedical: MedicalHealthDossier =
    selectedDossier.medicalHealthDossier || selectedDossier.medicalDossier || {
      bloodGroup: 'O+',
      fitForPhysicalEducation: true,
      knownAllergies: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      hasSpecialNeeds: false,
    };

  const [medical, setMedical] = useState<MedicalHealthDossier>(currentMedical);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [bloodGroup, setBloodGroup] = useState<any>(currentMedical.bloodGroup || 'O+');
  const [fitForSports, setFitForSports] = useState<boolean>(currentMedical.fitForPhysicalEducation ?? true);
  const [allergies, setAllergies] = useState<string[]>(currentMedical.knownAllergies || []);
  const [dietary, setDietary] = useState<string[]>(currentMedical.dietaryRestrictions || []);
  const [conditions, setConditions] = useState<MedicalConditionEntry[]>(currentMedical.medicalConditions || []);
  const [hasSNE, setHasSNE] = useState<boolean>(currentMedical.hasSpecialNeeds || false);
  const [sneCategory, setSneCategory] = useState<SpecialNeedCategory>((currentMedical.specialNeedCategory as SpecialNeedCategory) || 'None');
  const [sneAccommodations, setSneAccommodations] = useState<string>(
    currentMedical.specialNeedAccommodations || ''
  );
  const [insuranceProvider, setInsuranceProvider] = useState<string>(
    currentMedical.insuranceProvider || ''
  );
  const [insurancePolicyNo, setInsurancePolicyNo] = useState<string>(
    currentMedical.insurancePolicyNumber || ''
  );
  const [shaMemberNo, setShaMemberNo] = useState<string>(currentMedical.shaMemberNumber || '');
  const [doctorName, setDoctorName] = useState<string>(currentMedical.primaryDoctorName || '');
  const [doctorPhone, setDoctorPhone] = useState<string>(currentMedical.primaryDoctorPhone || '');
  const [hospital, setHospital] = useState<string>(currentMedical.preferredHospital || '');
  const [emergencyPhone, setEmergencyPhone] = useState<string>(
    currentMedical.emergencyHospitalPhone || ''
  );

  useEffect(() => {
    const med = selectedDossier.medicalHealthDossier || selectedDossier.medicalDossier || {
      bloodGroup: 'O+',
      fitForPhysicalEducation: true,
      knownAllergies: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      hasSpecialNeeds: false,
    };
    setMedical(med);
    setBloodGroup(med.bloodGroup || 'O+');
    setFitForSports(med.fitForPhysicalEducation ?? true);
    setAllergies(med.knownAllergies || []);
    setDietary(med.dietaryRestrictions || []);
    setConditions(med.medicalConditions || []);
    setHasSNE(med.hasSpecialNeeds || false);
    setSneCategory((med.specialNeedCategory as SpecialNeedCategory) || 'None');
    setSneAccommodations(med.specialNeedAccommodations || '');
    setInsuranceProvider(med.insuranceProvider || '');
    setInsurancePolicyNo(med.insurancePolicyNumber || '');
    setShaMemberNo(med.shaMemberNumber || '');
    setDoctorName(med.primaryDoctorName || '');
    setDoctorPhone(med.primaryDoctorPhone || '');
    setHospital(med.preferredHospital || '');
    setEmergencyPhone(med.emergencyHospitalPhone || '');
  }, [selectedDossier]);

  // Temporary inputs
  const [newAllergy, setNewAllergy] = useState<string>('');
  const [newDiet, setNewDiet] = useState<string>('');
  const [newCondName, setNewCondName] = useState<string>('');
  const [newCondSev, setNewCondSev] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [newCondPlan, setNewCondPlan] = useState<string>('');

  const handleSave = () => {
    const updatedMedical: MedicalHealthDossier = {
      ...medical,
      bloodGroup,
      fitForPhysicalEducation: fitForSports,
      knownAllergies: allergies,
      dietaryRestrictions: dietary,
      medicalConditions: conditions,
      hasSpecialNeeds: hasSNE,
      specialNeedCategory: sneCategory,
      specialNeedAccommodations: sneAccommodations || undefined,
      insuranceProvider: insuranceProvider || undefined,
      insurancePolicyNumber: insurancePolicyNo || undefined,
      shaMemberNumber: shaMemberNo || undefined,
      primaryDoctorName: doctorName || undefined,
      primaryDoctorPhone: doctorPhone || undefined,
      preferredHospital: hospital || undefined,
      emergencyHospitalPhone: emergencyPhone || undefined,
    };

    const updatedDossier: LearnerMasterDossier = {
      ...selectedDossier,
      medicalDossier: updatedMedical,
      medicalHealthDossier: updatedMedical,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);
    onLogAudit?.(
      'LEARNER_HEALTH_RECORD_UPDATED',
      `Updated P9.5 Medical & Health Records for ${selectedDossier.firstName} ${selectedDossier.lastName}.`
    );

    setIsEditing(false);
    setFeedback('✓ Medical & Health Records updated successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setAllergies([...allergies, newAllergy.trim()]);
    setNewAllergy('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergies(allergies.filter((_, i) => i !== idx));
  };

  const handleAddDietary = () => {
    if (!newDiet.trim()) return;
    setDietary([...dietary, newDiet.trim()]);
    setNewDiet('');
  };

  const handleRemoveDietary = (idx: number) => {
    setDietary(dietary.filter((_, i) => i !== idx));
  };

  const handleAddCondition = () => {
    if (!newCondName.trim()) return;
    const entry: MedicalConditionEntry = {
      conditionName: newCondName.trim(),
      severityLevel: newCondSev,
      managementPlan: newCondPlan.trim() || 'Monitor closely and notify clinic.',
    };
    setConditions([...conditions, entry]);
    setNewCondName('');
    setNewCondPlan('');
  };

  const handleRemoveCondition = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6" id="p9-5-medical-health-records">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold tracking-wide">
              P9.5 MEDICAL &amp; HEALTH
            </span>
            <h2 className="text-lg font-black text-slate-900">Medical, Allergy &amp; SNE Health Dossier</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical conditions, severe allergies, special needs educational accommodations, SHA insurance, and emergency hospital protocols.
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Health Record
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Health Record
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: 4 Clinical Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Vitals & Blood Group & Sports Fitness (P9.5.1) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            P9.5.1 Baseline Vitals &amp; Sports Clearance
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                disabled={!isEditing}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold font-mono text-rose-800"
              >
                <option value="O+">O+ (Universal Donor)</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+ (Universal Recipient)</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown / Pending Lab</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Physical Education</label>
              <div className="mt-1">
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={fitForSports}
                      onChange={(e) => setFitForSports(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    Fit for Full PE &amp; Games
                  </label>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      medical.fitForPhysicalEducation
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {medical.fitForPhysicalEducation ? '✓ Cleared for Sports' : '⚠ Restricted Physical Activity'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Allergies & Dietary List (P9.5.3 & P9.5.4) */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>Known Allergies (P9.5.3)</span>
                <span className="text-[10px] text-rose-600 font-bold">{allergies.length} Logged</span>
              </label>

              <div className="mt-1 flex flex-wrap gap-1.5">
                {allergies.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No known allergies on file.</span>
                ) : (
                  allergies.map((all, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {all}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(i)}
                          className="ml-1 text-rose-500 hover:text-rose-900"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy (e.g. Peanut / Penicillin)"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Dietary (P9.5.4) */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Dietary Restrictions (P9.5.4)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {dietary.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Standard Boarding / Dining Diet</span>
                ) : (
                  dietary.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <Utensils className="w-3 h-3 text-amber-600" />
                      {d}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDietary(i)}
                          className="ml-1 text-amber-600 hover:text-amber-900"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newDiet}
                    onChange={(e) => setNewDiet(e.target.value)}
                    placeholder="Add dietary note (e.g. Halal / Lactose Intolerant)"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddDietary}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Chronic Conditions & Management Protocol (P9.5.2) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <FileHeart className="w-4 h-4 text-purple-600" />
              P9.5.2 Chronic Medical Conditions
            </h3>
            <span className="text-[10px] font-bold text-purple-700">
              {conditions.length} Active Protocol(s)
            </span>
          </div>

          <div className="space-y-3">
            {conditions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                No chronic medical conditions registered for this learner.
              </div>
            ) : (
              conditions.map((cond, i) => {
                const sev = (cond.severityLevel || cond.severity || 'Moderate');
                return (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{cond.conditionName}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            sev === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : sev === 'Severe'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {String(sev).toUpperCase()}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      <strong className="text-slate-800">Action Plan:</strong> {cond.managementPlan || cond.managementProtocol || 'Monitor closely.'}
                    </p>
                  </div>
                );
              })
            )}

            {isEditing && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2 text-xs">
                <span className="font-bold text-purple-900 block">Add Condition:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCondName}
                    onChange={(e) => setNewCondName(e.target.value)}
                    placeholder="Condition name (e.g. Asthma)"
                    className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                  />
                  <select
                    value={newCondSev}
                    onChange={(e) => setNewCondSev(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newCondPlan}
                  onChange={(e) => setNewCondPlan(e.target.value)}
                  placeholder="Management protocol (e.g. Keep Inhaler in dispensary)"
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                >
                  Add Condition Protocol
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: SNE Accommodations (P9.5.5) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Accessibility className="w-4 h-4 text-blue-600" />
            P9.5.5 Special Needs Education (SNE) Accommodations
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">SNE Category</label>
              <select
                value={sneCategory}
                disabled={!isEditing}
                onChange={(e) => {
                  setSneCategory(e.target.value as any);
                  setHasSNE(e.target.value !== 'None');
                }}
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="None">None (Standard Mainstream Track)</option>
                <option value="Visual Impairment">Visual Impairment (Braille/Large Print)</option>
                <option value="Hearing Impairment">Hearing Impairment (Sign Language)</option>
                <option value="Physical / Mobility">Physical / Mobility (Ramp / Ground Floor)</option>
                <option value="Speech and Language">Speech and Language</option>
                <option value="Intellectual / Neurodivergent">Intellectual / Neurodivergent</option>
                <option value="Multiple Disabilities">Multiple Disabilities</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Classroom &amp; Examination Accommodations
              </label>
              <textarea
                value={sneAccommodations}
                disabled={!isEditing}
                rows={3}
                onChange={(e) => setSneAccommodations(e.target.value)}
                placeholder="e.g. Front row seating near blackboard; 25% extra examination time."
                className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Insurance & Emergency Hospital Protocol (P9.5.6 & P9.5.7) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldPlus className="w-4 h-4 text-emerald-600" />
            P9.5.6 &amp; P9.5.7 Medical Insurance &amp; Emergency Hospital
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Social Health Authority (SHA) No
                </label>
                <input
                  type="text"
                  value={shaMemberNo}
                  disabled={!isEditing}
                  onChange={(e) => setShaMemberNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Private Insurer</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  disabled={!isEditing}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Designated Emergency Hospital
                </label>
                <input
                  type="text"
                  value={hospital}
                  disabled={!isEditing}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  24/7 Ambulance Hotline
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  disabled={!isEditing}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl font-mono font-bold text-rose-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
