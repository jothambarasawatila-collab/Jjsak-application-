import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Phone,
  Mail,
  Home,
  ShieldCheck,
  KeyRound,
  Send,
  CheckCircle2,
  Trash2,
  Smartphone,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  ParentGuardianProfile,
  CommunicationChannel,
} from '../../types/learnerRegistration';

interface ParentGuardianManagementTabProps {
  selectedDossier: LearnerMasterDossier;
  onUpdateDossier: (updated: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const ParentGuardianManagementTab: React.FC<ParentGuardianManagementTabProps> = ({
  selectedDossier,
  onUpdateDossier,
  onLogAudit,
}) => {
  const [parents, setParents] = useState<ParentGuardianProfile[]>(
    selectedDossier.parentsAndGuardians
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setParents(selectedDossier.parentsAndGuardians);
  }, [selectedDossier]);

  // New Parent Form State
  const [relType, setRelType] = useState<any>('Mother');
  const [fullName, setFullName] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [phone1, setPhone1] = useState<string>('');
  const [phone2, setPhone2] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [address, setAddress] = useState<string>('Kilimani, Nairobi');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [emergencyPriority, setEmergencyPriority] = useState<1 | 2 | 3>(2);
  const [authorizedPickup, setAuthorizedPickup] = useState<boolean>(true);
  const [legalCustody, setLegalCustody] = useState<boolean>(true);
  const [commChannel, setCommChannel] = useState<CommunicationChannel>('SMS');
  const [languagePref, setLanguagePref] = useState<'English' | 'Kiswahili' | 'Both'>('English');

  const handleToggleVerification = (parentId: string) => {
    const updated = parents.map((p) => {
      if (p.id === parentId) {
        const nextState = !p.isVerified;
        return {
          ...p,
          isVerified: nextState,
          verifiedDate: nextState ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return p;
    });

    setParents(updated);
    const updatedDossier = { ...selectedDossier, parentsAndGuardians: updated, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    onLogAudit?.(
      'PARENT_GUARDIAN_VERIFIED',
      `Toggled KYC verification for guardian on dossier ${selectedDossier.admissionNumber}.`
    );

    setActionFeedback('✓ Parent / Guardian verification status updated.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSendPortalInvite = (parent: ParentGuardianProfile) => {
    onLogAudit?.(
      'PARENT_PORTAL_INVITE_SENT',
      `Dispatched Parent Portal access credentials (${parent.parentPortalAccessCode}) via ${parent.preferredCommunicationChannel} to ${parent.primaryPhoneNumber}.`
    );

    setActionFeedback(
      `✓ Portal invitation & PIN (${parent.parentPortalAccessCode}) sent to ${parent.fullName} via ${parent.preferredCommunicationChannel}!`
    );
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleResetPortalCode = (parentId: string) => {
    const newCode = `PORTAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = parents.map((p) => {
      if (p.id === parentId) {
        return {
          ...p,
          parentPortalAccessCode: newCode,
        };
      }
      return p;
    });

    setParents(updated);
    const updatedDossier = { ...selectedDossier, parentsAndGuardians: updated, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    setActionFeedback(`✓ Reset parent portal access code to: ${newCode}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAddNewParent = () => {
    if (!fullName.trim() || !phone1.trim()) {
      alert('Full Name and Primary Phone are required.');
      return;
    }

    const newId = `pg-${selectedDossier.id}-${Date.now()}`;
    const newProfile: ParentGuardianProfile = {
      id: newId,
      learnerId: selectedDossier.id,
      relationship: relType,
      fullName: fullName.trim(),
      nationalIdNumber: nationalId.trim() || '24000000',
      primaryPhoneNumber: phone1.trim(),
      secondaryPhoneNumber: phone2.trim() || undefined,
      emailAddress: email.trim() || undefined,
      occupation: occupation.trim() || 'Employed',
      residentialAddress: address.trim(),
      county: selectedDossier.countyOfBirth,
      subCounty: selectedDossier.subCountyOfBirth,
      isPrimaryContact: isPrimary,
      emergencyPriorityOrder: emergencyPriority,
      authorizedForPickup: authorizedPickup,
      legalCustodyHolder: legalCustody,
      parentPortalAccessCode: `PORTAL-${Math.floor(1000 + Math.random() * 9000)}`,
      portalAccountActivated: false,
      preferredCommunicationChannel: commChannel,
      preferredLanguage: languagePref,
      isVerified: true,
      verifiedDate: new Date().toISOString().split('T')[0],
    };

    const nextParents = [...parents, newProfile];
    setParents(nextParents);
    const updatedDossier = { ...selectedDossier, parentsAndGuardians: nextParents, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    onLogAudit?.(
      'PARENT_GUARDIAN_REGISTERED',
      `Registered new ${relType}: ${fullName} for learner ${selectedDossier.firstName} ${selectedDossier.lastName}.`
    );

    setShowAddModal(false);
    setFullName('');
    setPhone1('');
    setPhone2('');
    setEmail('');
    setNationalId('');
    setActionFeedback(`✓ Successfully added ${fullName} (${relType})!`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleDeleteParent = (parentId: string) => {
    if (parents.length <= 1) {
      alert('A learner must retain at least one registered parent or legal guardian on record.');
      return;
    }
    if (!confirm('Are you sure you want to remove this parent/guardian record?')) return;

    const nextParents = parents.filter((p) => p.id !== parentId);
    setParents(nextParents);
    const updatedDossier = { ...selectedDossier, parentsAndGuardians: nextParents, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    setActionFeedback('✓ Parent / Guardian record removed.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6" id="p9-3-parent-guardian-management">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide">
              P9.3 GUARDIANS &amp; PORTAL
            </span>
            <h2 className="text-lg font-black text-slate-900">Parent &amp; Guardian Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered parents, legal guardians, emergency priority hierarchy, authorized pickup permissions, and parent portal keys.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Guardian (P9.3.2)
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* List of Registered Parents / Guardians */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parents.map((parent) => (
          <div
            key={parent.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-emerald-300 transition"
          >
            {/* Header: Name, Relationship & Verification Stamp */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{parent.fullName}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-100">
                    {parent.relationship}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{parent.occupation}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleVerification(parent.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    parent.isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                  title="Click to toggle KYC National ID Verification"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {parent.isVerified ? 'KYC Verified' : 'Unverified'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteParent(parent.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Remove Guardian"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Statutory Details: Phone, Email, National ID, Address */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Primary Phone (P9.3.3):
                </span>
                <span className="font-mono font-bold text-slate-900">{parent.primaryPhoneNumber}</span>
              </div>

              {parent.secondaryPhoneNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    Alternative Phone:
                  </span>
                  <span className="font-mono font-medium text-slate-700">{parent.secondaryPhoneNumber}</span>
                </div>
              )}

              {parent.emailAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    Email Address:
                  </span>
                  <span className="font-medium text-slate-800">{parent.emailAddress}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Home className="w-3 h-3 text-slate-400" />
                  Residence Address:
                </span>
                <span className="font-medium text-slate-800 text-right">{parent.residentialAddress}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">National ID / Passport:</span>
                <span className="font-mono font-bold text-slate-800">{parent.nationalIdNumber}</span>
              </div>
            </div>

            {/* Badges & Relationship Permissions (P9.3.4 & P9.3.5) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  parent.isPrimaryContact ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Priority {parent.emergencyPriorityOrder} Contact
              </span>

              {parent.legalCustodyHolder && (
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                  Legal Custody Holder
                </span>
              )}

              {parent.authorizedForPickup && (
                <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800">
                  Authorized Pickup Person
                </span>
              )}

              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                Channel: {parent.preferredCommunicationChannel}
              </span>
            </div>

            {/* Parent Portal Linkage (P9.3.6) */}
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-indigo-600" />
                  Parent Portal Access Key (P9.3.6)
                </span>
                <div className="font-mono font-black text-sm text-indigo-900 mt-0.5">
                  {parent.parentPortalAccessCode}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleResetPortalCode(parent.id)}
                  className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Reset PIN
                </button>
                <button
                  type="button"
                  onClick={() => handleSendPortalInvite(parent)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  Send SMS Key
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Guardian / Parent (P9.3.1 & P9.3.2) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Register Parent or Legal Guardian (P9.3.1 &amp; P9.3.2)
                </h3>
                <p className="text-xs text-slate-500">
                  For learner: {selectedDossier.firstName} {selectedDossier.lastName} ({selectedDossier.admissionNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Relationship Type</label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Foster Parent">Foster Parent</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Next of Kin">Next of Kin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">National ID / Passport *</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. 24891022"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Grace C. Kiprono"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Phone Number *</label>
                  <input
                    type="text"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="e.g. +254 722 884 102"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. grace.kiprono@email.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupation / Employer</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. University Lecturer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Elgon View Estate, House 42"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emergency Priority (P9.3.5)</label>
                  <select
                    value={emergencyPriority}
                    onChange={(e) => setEmergencyPriority(parseInt(e.target.value) as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value={1}>1st Call (Immediate Primary)</option>
                    <option value={2}>2nd Call (Secondary Contact)</option>
                    <option value={3}>3rd Call (Emergency Alternate)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Communication Channel (P9.3.7)</label>
                  <select
                    value={commChannel}
                    onChange={(e) => setCommChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="SMS">SMS Instant Text</option>
                    <option value="WhatsApp">WhatsApp Encrypted</option>
                    <option value="Email">Email Statement</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Language Preference</label>
                  <select
                    value={languagePref}
                    onChange={(e) => setLanguagePref(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="English">English</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Both">Both (Bilingual)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Primary Contact (P9.3.4)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorizedPickup}
                    onChange={(e) => setAuthorizedPickup(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Authorized for Pickup</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalCustody}
                    onChange={(e) => setLegalCustody(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Legal Custody Holder</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewParent}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Register Guardian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
