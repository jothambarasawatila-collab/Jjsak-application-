import React, { useState } from 'react';
import {
  User,
  Camera,
  MapPin,
  Globe,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Save,
  Fingerprint,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  NationalityCategory,
} from '../../types/learnerRegistration';
import { LearnerEnrollmentStatus } from '../../types/learnerWelfare';
import { KENYA_COUNTIES } from '../../data/learnerRegistrationData';

interface LearnerMasterProfileTabProps {
  selectedDossier: LearnerMasterDossier;
  onUpdateDossier: (updated: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const LearnerMasterProfileTab: React.FC<LearnerMasterProfileTabProps> = ({
  selectedDossier,
  onUpdateDossier,
  onLogAudit,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState<string>(selectedDossier.firstName);
  const [middleName, setMiddleName] = useState<string>(selectedDossier.middleName || '');
  const [lastName, setLastName] = useState<string>(selectedDossier.lastName);
  const [preferredName, setPreferredName] = useState<string>(selectedDossier.preferredName || '');
  const [gender, setGender] = useState<'Male' | 'Female'>(selectedDossier.gender);
  const [dateOfBirth, setDateOfBirth] = useState<string>(selectedDossier.dateOfBirth);
  const [countyOfBirth, setCountyOfBirth] = useState<string>(selectedDossier.countyOfBirth);
  const [subCountyOfBirth, setSubCountyOfBirth] = useState<string>(selectedDossier.subCountyOfBirth);
  const [birthPlace, setBirthPlace] = useState<string>(selectedDossier.birthPlace);
  const [nationalityCategory, setNationalityCategory] = useState<NationalityCategory>(
    selectedDossier.nationalityCategory
  );
  const [nationalityCountry, setNationalityCountry] = useState<string>(selectedDossier.nationalityCountry);
  const [birthCertificateNumber, setBirthCertificateNumber] = useState<string>(
    selectedDossier.birthCertificateNumber
  );
  const [birthCertEntryNumber, setBirthCertEntryNumber] = useState<string>(
    selectedDossier.birthCertEntryNumber || ''
  );
  const [passportOrAlienId, setPassportOrAlienId] = useState<string>(
    selectedDossier.passportOrAlienId || ''
  );
  const [profileStatus, setProfileStatus] = useState<LearnerEnrollmentStatus>(
    selectedDossier.profileStatus
  );
  const [statusChangeReason, setStatusChangeReason] = useState<string>(
    selectedDossier.statusChangeReason || ''
  );
  const [isCapturingPhoto, setIsCapturingPhoto] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(selectedDossier.photoUrl);

  // Age calculation
  const calculatedAge = React.useMemo(() => {
    if (!dateOfBirth) return selectedDossier.calculatedAge;
    const birthYear = new Date(dateOfBirth).getFullYear();
    return 2026 - birthYear;
  }, [dateOfBirth, selectedDossier.calculatedAge]);

  const handleSaveProfile = () => {
    const updated: LearnerMasterDossier = {
      ...selectedDossier,
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      preferredName: preferredName.trim() || firstName.trim(),
      gender,
      dateOfBirth,
      calculatedAge,
      countyOfBirth,
      subCountyOfBirth,
      birthPlace,
      nationalityCategory,
      nationalityCountry,
      birthCertificateNumber,
      birthCertEntryNumber: birthCertEntryNumber || undefined,
      passportOrAlienId: passportOrAlienId || undefined,
      profileStatus,
      statusChangeReason: statusChangeReason || undefined,
      photoUrl: photoPreview,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updated);
    onLogAudit?.(
      'LEARNER_MASTER_PROFILE_UPDATED',
      `Updated P9.2 Master Profile for ${firstName} ${lastName} (${selectedDossier.admissionNumber}).`
    );

    setIsEditing(false);
    setSaveFeedback('✓ Master Profile successfully updated and stamped in record!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleSimulatePhotoSnapshot = () => {
    setIsCapturingPhoto(true);
    setTimeout(() => {
      // Create SVG data URL photo avatar simulation
      const avatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232563EB"/><circle cx="100" cy="80" r="40" fill="%23FFFFFF"/><path d="M40 180 C40 130, 160 130, 160 180 Z" fill="%23FFFFFF"/></svg>`;
      setPhotoPreview(avatarSvg);
      setIsCapturingPhoto(false);
    }, 1000);
  };

  return (
    <div className="space-y-6" id="p9-2-learner-master-profile">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold tracking-wide">
              P9.2 MASTER PROFILE
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Learner Master Biodata &amp; Identity Record
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal identity, official birth registry details, citizenship, photograph badging, and lifecycle status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Biodata
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
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Main Grid: Left Portrait Badge & Identity / Right Master Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Student Portrait & Identification Badge (P9.2.6 & P9.2.7) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative group mb-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={selectedDossier.firstName}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
                  {selectedDossier.avatarInitials}
                </div>
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleSimulatePhotoSnapshot}
                  disabled={isCapturingPhoto}
                  className="absolute bottom-1 right-1 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl shadow-lg cursor-pointer"
                  title="Capture webcam snapshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <h3 className="text-base font-black text-slate-900">
              {selectedDossier.firstName} {selectedDossier.middleName ? `${selectedDossier.middleName} ` : ''}
              {selectedDossier.lastName}
            </h3>
            <p className="text-xs font-bold text-indigo-700 mt-0.5">
              {selectedDossier.academicPlacement.enrolledGrade} • {selectedDossier.academicPlacement.enrolledStream} Stream
            </p>

            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              STATUS: {profileStatus.toUpperCase()}
            </div>
          </div>

          {/* Identification Summary Table (P9.2.7) */}
          <div className="space-y-2.5 text-xs">
            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              Statutory Identifiers (P9.2.7)
            </h4>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Admission No:</span>
              <span className="font-mono font-bold text-blue-700">{selectedDossier.admissionNumber}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">MoE NEMIS UPI:</span>
              <span className="font-mono font-bold text-indigo-700">{selectedDossier.upiNumber}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Birth Cert No:</span>
              <span className="font-mono font-bold text-slate-800">
                {selectedDossier.birthCertificateNumber}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Assessment Index:</span>
              <span className="font-mono font-bold text-slate-800">
                {selectedDossier.assessmentIndexNumber || '08219001/001'}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Tamper Proof Hash */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase">
              <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
              Integrity Seal &amp; Biometric Hash
            </div>
            <p className="font-mono text-[9px] text-slate-600 break-all mt-1">
              {selectedDossier.tamperProofHash}
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Full Master Profile Details (P9.2.1 - P9.2.8) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information (P9.2.1) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              P9.2.1 Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  disabled={!isEditing}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  disabled={!isEditing}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Last Name / Surname</label>
                <input
                  type="text"
                  value={lastName}
                  disabled={!isEditing}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Preferred Name</label>
                <input
                  type="text"
                  value={preferredName}
                  disabled={!isEditing}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Gender (P9.2.3)</label>
                <select
                  value={gender}
                  disabled={!isEditing}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">
                  Date of Birth (Age: {calculatedAge} yrs)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  disabled={!isEditing}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Birth & County Details (P9.2.2) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              P9.2.2 Birth Registry &amp; County Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">County of Birth</label>
                <select
                  value={countyOfBirth}
                  disabled={!isEditing}
                  onChange={(e) => setCountyOfBirth(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c} County
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Sub-County of Birth</label>
                <input
                  type="text"
                  value={subCountyOfBirth}
                  disabled={!isEditing}
                  onChange={(e) => setSubCountyOfBirth(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Birth Facility / Hospital</label>
                <input
                  type="text"
                  value={birthPlace}
                  disabled={!isEditing}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Nationality & Official Documents (P9.2.4 & P9.2.5) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-purple-600" />
              P9.2.4 &amp; P9.2.5 Citizenship, Nationality &amp; Certificate Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Citizenship Category</label>
                <select
                  value={nationalityCategory}
                  disabled={!isEditing}
                  onChange={(e) => setNationalityCategory(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900 font-medium"
                >
                  <option value="Kenyan Citizen">Kenyan Citizen</option>
                  <option value="East African Community">East African Community</option>
                  <option value="Foreign Expatriate / Resident">Foreign Expatriate / Resident</option>
                  <option value="Refugee / Special Pass">Refugee / Special Pass</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Country of Origin</label>
                <input
                  type="text"
                  value={nationalityCountry}
                  disabled={!isEditing}
                  onChange={(e) => setNationalityCountry(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Birth Cert Number *</label>
                <input
                  type="text"
                  value={birthCertificateNumber}
                  disabled={!isEditing}
                  onChange={(e) => setBirthCertificateNumber(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Civil Entry Number</label>
                <input
                  type="text"
                  value={birthCertEntryNumber}
                  disabled={!isEditing}
                  onChange={(e) => setBirthCertEntryNumber(e.target.value)}
                  placeholder="e.g. E-44910"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Passport / Alien ID (if non-citizen)</label>
                <input
                  type="text"
                  value={passportOrAlienId}
                  disabled={!isEditing}
                  onChange={(e) => setPassportOrAlienId(e.target.value)}
                  placeholder="e.g. K2981044"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Profile Status Management (P9.2.8) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              P9.2.8 Learner Profile Status Lifecycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Lifecycle Status</label>
                <select
                  value={profileStatus}
                  disabled={!isEditing}
                  onChange={(e) => setProfileStatus(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 font-bold text-slate-900"
                >
                  <option value="Active">Active (On Active Roll)</option>
                  <option value="Pending Admission">Pending Admission</option>
                  <option value="Transferred Out">Transferred Out</option>
                  <option value="Graduated">Graduated (Completed Grade 9)</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Status Change Note / Remark</label>
                <input
                  type="text"
                  value={statusChangeReason}
                  disabled={!isEditing}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="e.g. Regular annual enrollment"
                  className="mt-1 w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100/70 rounded-xl text-xs border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
