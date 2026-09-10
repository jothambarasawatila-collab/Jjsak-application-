import React, { useState } from 'react';
import {
  UserPlus,
  User,
  Users,
  GraduationCap,
  HeartPulse,
  FolderArchive,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import {
  LearnerMasterDossier,
} from '../../types/learnerRegistration';
import { LearnerRegistrationTab } from './LearnerRegistrationTab';
import { LearnerMasterProfileTab } from './LearnerMasterProfileTab';
import { ParentGuardianManagementTab } from './ParentGuardianManagementTab';
import { AcademicPlacementTab } from './AcademicPlacementTab';
import { MedicalHealthRecordsTab } from './MedicalHealthRecordsTab';
import { LearnerDocumentsTab } from './LearnerDocumentsTab';
import {
  MOCK_LEARNER_DOSSIERS,
  INITIAL_ADMISSION_CONFIG,
} from '../../data/learnerRegistrationData';
import { AdmissionNumberGenerationConfig } from '../../types/learnerRegistration';

interface LearnerRegistrationMasterScreenProps {
  students?: any[];
  onLogAudit?: (action: any, details: string) => void;
}

export type Phase9SubTab =
  | 'DIRECTORY'
  | 'P9_1_REGISTRATION'
  | 'P9_2_PROFILE'
  | 'P9_3_PARENTS'
  | 'P9_4_PLACEMENT'
  | 'P9_5_MEDICAL'
  | 'P9_6_DOCUMENTS';

export const LearnerRegistrationMasterScreen: React.FC<
  LearnerRegistrationMasterScreenProps
> = ({ onLogAudit }) => {
  const [dossiers, setDossiers] =
    useState<LearnerMasterDossier[]>(MOCK_LEARNER_DOSSIERS);
  const [admissionConfig, setAdmissionConfig] =
    useState<AdmissionNumberGenerationConfig>(INITIAL_ADMISSION_CONFIG);
  const [selectedDossierId, setSelectedDossierId] = useState<string>(
    MOCK_LEARNER_DOSSIERS[0]?.id || ''
  );
  const [activeSubTab, setActiveSubTab] = useState<Phase9SubTab>('DIRECTORY');

  // Search & Filter state for Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const selectedDossier = React.useMemo(() => {
    return dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];
  }, [dossiers, selectedDossierId]);

  const handleRegisterNewLearner = (newDossier: LearnerMasterDossier) => {
    setDossiers((prev) => [newDossier, ...prev]);
    setSelectedDossierId(newDossier.id);
    setActiveSubTab('P9_2_PROFILE');
  };

  const handleUpdateDossier = (updated: LearnerMasterDossier) => {
    setDossiers((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const filteredDossiers = React.useMemo(() => {
    return dossiers.filter((d) => {
      const matchesSearch =
        `${d.firstName} ${d.lastName} ${d.admissionNumber} ${d.upiNumber} ${d.birthCertificateNumber}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || d.registrationStatus === statusFilter;
      const matchesGrade =
        gradeFilter === 'ALL' ||
        d.academicPlacement.enrolledGrade === gradeFilter;
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [dossiers, searchQuery, statusFilter, gradeFilter]);

  const handleNemisSyncAll = () => {
    setSyncFeedback('Transmitting batch dossier sync to MoE NEMIS 2.0 gateway...');
    setTimeout(() => {
      setSyncFeedback(
        `✓ All ${dossiers.length} learner master records reconciled with Ministry of Education National UPI Server!`
      );
      onLogAudit?.(
        'NEMIS_SYSTEM_SYNC',
        `Reconciled batch ${dossiers.length} learners with MoE NEMIS server.`
      );
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 1500);
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Admission No,NEMIS UPI,Full Name,Gender,Grade,Stream,Status,Birth Cert No,Primary Phone,Reg Status',
        ...dossiers.map(
          (d) =>
            `"${d.admissionNumber}","${d.upiNumber}","${d.firstName} ${d.lastName}","${d.gender}","${d.academicPlacement.enrolledGrade}","${d.academicPlacement.enrolledStream}","${d.profileStatus}","${d.birthCertificateNumber}","${d.parentsAndGuardians[0]?.primaryPhoneNumber || ''}","${d.registrationStatus}"`
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kenya_CBC_Learner_Roll_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="phase-9-learner-registration-hub">
      {/* Top Phase 9 Hub Navigation Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-black tracking-wider shadow-xs">
                PHASE 9
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Learner Registration &amp; Master Dossier Architecture
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              End-to-end statutory enrollment, CBC NEMIS UPI allocation, Guardian KYC, SNE health profiles, and digital student vaults.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Roll CSV
            </button>
            <button
              type="button"
              onClick={handleNemisSyncAll}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              MoE NEMIS Batch Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('P9_1_REGISTRATION')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Registration (P9.1)
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Sub-Module Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('DIRECTORY')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'DIRECTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Learners Directory &amp; Registrar Queue ({dossiers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('P9_1_REGISTRATION')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'P9_1_REGISTRATION'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>P9.1 Registration Wizard</span>
          </button>

          {/* Active Student Dependent Tabs */}
          {selectedDossier && (
            <>
              <div className="h-5 w-px bg-slate-200 shrink-0 mx-1" />

              <button
                type="button"
                onClick={() => setActiveSubTab('P9_2_PROFILE')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeSubTab === 'P9_2_PROFILE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>P9.2 Master Profile ({selectedDossier.firstName})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('P9_3_PARENTS')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeSubTab === 'P9_3_PARENTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>P9.3 Parents &amp; Guardians ({selectedDossier.parentsAndGuardians.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('P9_4_PLACEMENT')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeSubTab === 'P9_4_PLACEMENT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>P9.4 Academic Placement ({selectedDossier.academicPlacement.classCode})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('P9_5_MEDICAL')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeSubTab === 'P9_5_MEDICAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>P9.5 Health &amp; SNE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('P9_6_DOCUMENTS')}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeSubTab === 'P9_6_DOCUMENTS'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FolderArchive className="w-4 h-4" />
                <span>P9.6 Vault &amp; Documents ({selectedDossier.documents.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selected Student Active Bar (when viewing P9.2 - P9.6) */}
      {activeSubTab !== 'DIRECTORY' && activeSubTab !== 'P9_1_REGISTRATION' && selectedDossier && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-xs">
              {selectedDossier.avatarInitials}
            </div>
            <div>
              <span className="font-black text-sm">
                {selectedDossier.firstName} {selectedDossier.middleName ? `${selectedDossier.middleName} ` : ''}
                {selectedDossier.lastName}
              </span>
              <span className="text-slate-400 ml-2 font-mono">
                Adm: {selectedDossier.admissionNumber} • UPI: {selectedDossier.upiNumber} • {selectedDossier.academicPlacement.classCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Quick Switch Dossier:</span>
            <select
              value={selectedDossierId}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.admissionNumber} - {d.firstName} {d.lastName} ({d.academicPlacement.classCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SUBTAB 1: DIRECTORY & REGISTRAR QUEUE */}
      {activeSubTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Enrolled</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{dossiers.length}</div>
              <span className="text-[10px] text-emerald-600 font-bold">100% MoE Validated</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Grade 7 Entry</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {dossiers.filter((d) => d.academicPlacement.enrolledGrade === 'Grade 7').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Junior School Intake</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Grade 8 &amp; 9</span>
              <div className="text-2xl font-black text-purple-700 mt-1">
                {dossiers.filter((d) => d.academicPlacement.enrolledGrade !== 'Grade 7').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Continuing Streams</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Special Needs (SNE)</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {dossiers.filter((d) => (d.medicalHealthDossier?.hasSpecialNeeds || d.medicalDossier?.hasSpecialNeeds || d.medicalDossier?.disabilityAndAccommodations?.hasDisability)).length}
              </div>
              <span className="text-[10px] text-rose-600 font-bold">Accommodations Active</span>
            </div>
          </div>

          {/* Search, Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Adm No, UPI, Birth Cert..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ENROLLED">Enrolled (Approved)</option>
                <option value="REGISTRAR_APPROVED">Registrar Approved</option>
                <option value="BIOMETRICS_VERIFIED">Biometrics Verified</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Learner Master Record</th>
                    <th className="py-3.5 px-4">Adm &amp; MoE UPI</th>
                    <th className="py-3.5 px-4">Placement / Class</th>
                    <th className="py-3.5 px-4">Parent / Guardian</th>
                    <th className="py-3.5 px-4">Health / SNE</th>
                    <th className="py-3.5 px-4">Workflow Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDossiers.map((dossier) => {
                    const primaryParent = dossier.parentsAndGuardians[0];
                    return (
                      <tr
                        key={dossier.id}
                        onClick={() => {
                          setSelectedDossierId(dossier.id);
                        }}
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          selectedDossierId === dossier.id ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {dossier.avatarInitials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-xs block">
                                {dossier.firstName} {dossier.middleName ? `${dossier.middleName} ` : ''}
                                {dossier.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {dossier.gender} • Born: {dossier.dateOfBirth} ({dossier.countyOfBirth} Co.)
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-blue-700">{dossier.admissionNumber}</div>
                          <div className="font-mono text-[10px] text-slate-500">UPI: {dossier.upiNumber}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-purple-50 text-purple-800 border border-purple-100">
                            {dossier.academicPlacement.classCode}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {dossier.academicPlacement.learningPathway.split(' ')[0]} Track
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {primaryParent ? (
                            <div>
                              <span className="font-semibold text-slate-800 block">{primaryParent.fullName}</span>
                              <span className="font-mono text-[10px] text-slate-500">
                                {primaryParent.primaryPhoneNumber} ({primaryParent.relationship})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No guardian</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {(() => {
                            const med = dossier.medicalHealthDossier || dossier.medicalDossier;
                            const hasSne = med?.hasSpecialNeeds || med?.disabilityAndAccommodations?.hasDisability;
                            const allergyCount = (med?.knownAllergies?.length || med?.allergies?.length || 0);
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-mono font-bold text-[10px]">
                                  {med?.bloodGroup || 'O+'}
                                </span>
                                {hasSne && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                    SNE
                                  </span>
                                )}
                                {allergyCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                                    Allergy
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                              dossier.registrationStatus === 'ENROLLED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dossier.registrationStatus === 'REGISTRAR_APPROVED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {dossier.registrationStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDossierId(dossier.id);
                              setActiveSubTab('P9_2_PROFILE');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            Open Dossier
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

      {/* SUBTAB 2: P9.1 REGISTRATION WIZARD */}
      {activeSubTab === 'P9_1_REGISTRATION' && (
        <LearnerRegistrationTab
          dossiers={dossiers}
          admissionConfig={admissionConfig}
          onUpdateAdmissionConfig={setAdmissionConfig}
          onRegisterLearner={handleRegisterNewLearner}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}

      {/* SUBTAB 3: P9.2 MASTER PROFILE */}
      {activeSubTab === 'P9_2_PROFILE' && selectedDossier && (
        <LearnerMasterProfileTab
          selectedDossier={selectedDossier}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}

      {/* SUBTAB 4: P9.3 PARENTS & GUARDIANS */}
      {activeSubTab === 'P9_3_PARENTS' && selectedDossier && (
        <ParentGuardianManagementTab
          selectedDossier={selectedDossier}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}

      {/* SUBTAB 5: P9.4 ACADEMIC PLACEMENT */}
      {activeSubTab === 'P9_4_PLACEMENT' && selectedDossier && (
        <AcademicPlacementTab
          selectedDossier={selectedDossier}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}

      {/* SUBTAB 6: P9.5 MEDICAL & HEALTH */}
      {activeSubTab === 'P9_5_MEDICAL' && selectedDossier && (
        <MedicalHealthRecordsTab
          selectedDossier={selectedDossier}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}

      {/* SUBTAB 7: P9.6 DOCUMENTS MANAGEMENT */}
      {activeSubTab === 'P9_6_DOCUMENTS' && selectedDossier && (
        <LearnerDocumentsTab
          selectedDossier={selectedDossier}
          onUpdateDossier={handleUpdateDossier}
          onLogAudit={onLogAudit}
        />
      )}
    </div>
  );
};
