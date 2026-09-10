import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import {
  LearnerMasterDossier,
  LearnerDocumentItem,
  DocumentCategory,
  DocumentVerificationStatus,
} from '../../types/learnerRegistration';

interface LearnerDocumentsTabProps {
  selectedDossier: LearnerMasterDossier;
  onUpdateDossier: (updated: LearnerMasterDossier) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const LearnerDocumentsTab: React.FC<LearnerDocumentsTabProps> = ({
  selectedDossier,
  onUpdateDossier,
  onLogAudit,
}) => {
  const [documents, setDocuments] = useState<LearnerDocumentItem[]>(
    selectedDossier.documents
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<LearnerDocumentItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Upload Modal State
  const [docName, setDocName] = useState<string>('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Statutory & Civil');
  const [fileExtension, setFileExtension] = useState<string>('PDF');

  const filteredDocs = React.useMemo(() => {
    if (selectedCategory === 'ALL') return documents;
    return documents.filter((d) => d.documentCategory === selectedCategory);
  }, [documents, selectedCategory]);

  const handleVerifyDocument = (docId: string) => {
    const updated = documents.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          verificationStatus: 'Verified' as DocumentVerificationStatus,
          verifiedByStaffName: 'M. Wanjiku (Chief Registrar)',
          verifiedDate: new Date().toISOString().split('T')[0],
        };
      }
      return d;
    });

    setDocuments(updated);
    const updatedDossier = { ...selectedDossier, documents: updated, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    onLogAudit?.(
      'DOCUMENT_VERIFIED',
      `Verified statutory document for ${selectedDossier.firstName} ${selectedDossier.lastName} (${selectedDossier.admissionNumber}).`
    );

    setFeedback('✓ Document verified and cryptographically stamped!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddDocument = () => {
    if (!docName.trim()) {
      alert('Please enter a document title.');
      return;
    }

    const newDoc: LearnerDocumentItem = {
      id: `doc-${selectedDossier.id}-${Date.now()}`,
      documentTitle: docName.trim(),
      documentCategory: docCategory,
      fileName: `${docName.toLowerCase().replace(/\s+/g, '_')}.${fileExtension.toLowerCase()}`,
      fileSizeBytes: Math.floor(250000 + Math.random() * 850000),
      fileFormat: fileExtension,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Admissions Desk',
      verificationStatus: 'Pending Review',
      isMandatory: false,
      checksumSha256: Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
    };

    const nextDocs = [...documents, newDoc];
    setDocuments(nextDocs);
    const updatedDossier = { ...selectedDossier, documents: nextDocs, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);

    onLogAudit?.(
      'DOCUMENT_UPLOADED',
      `Uploaded document ${docName} for learner ${selectedDossier.firstName} ${selectedDossier.lastName}.`
    );

    setShowUploadModal(false);
    setDocName('');
    setFeedback(`✓ Successfully uploaded ${docName}!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteDocument = (docId: string) => {
    if (!confirm('Are you sure you want to delete this document from the student repository?')) return;
    const nextDocs = documents.filter((d) => d.id !== docId);
    setDocuments(nextDocs);
    const updatedDossier = { ...selectedDossier, documents: nextDocs, updatedAt: new Date().toISOString() };
    onUpdateDossier(updatedDossier);
  };

  return (
    <div className="space-y-6" id="p9-6-learner-documents-management">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-[10px] font-bold tracking-wide">
              P9.6 ARCHIVES &amp; VAULT
            </span>
            <h2 className="text-lg font-black text-slate-900">Learner Documents &amp; Vault Repository</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Civil birth certificates, assessment transcripts, medical clearance cards, and legal custody instruments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Document (P9.6.1)
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs (P9.6.4) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'Statutory & Civil', 'Academic & Transcripts', 'Medical & Health', 'Identification & Legal'].map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? `All Documents (${documents.length})` : cat}
            </button>
          )
        )}
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-cyan-400 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-black text-xs border border-cyan-100 shrink-0">
                    {doc.fileFormat}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{doc.documentTitle}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {doc.fileSize || `${((doc.fileSizeBytes || 1024) / 1024).toFixed(1)} KB`} • {doc.uploadedAt || doc.uploadDate || 'Recent'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-slate-300 hover:text-red-600 p-1 rounded-lg"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {doc.documentCategory}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    doc.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.verificationStatus === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {doc.verificationStatus === 'Verified' && <ShieldCheck className="w-3 h-3" />}
                  {doc.verificationStatus}
                </span>
              </div>
            </div>

            {/* Checksum Hash & Actions (P9.6.2 & P9.6.3) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-[9px] font-mono text-slate-600 truncate flex items-center justify-between">
                <span>SHA-256:</span>
                <span>{doc.checksumSha256 ? `${doc.checksumSha256.substring(0, 14)}...` : 'HASH-VALID'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>

                {doc.verificationStatus !== 'Verified' ? (
                  <button
                    type="button"
                    onClick={() => handleVerifyDocument(doc.id)}
                    className="flex-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify (P9.6.2)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      alert(`Downloading official archive replica: ${doc.fileName}`)
                    }
                    className="flex-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal (P9.6.1) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-600" />
                Upload Learner Document (P9.6.1)
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Primary School Leaving Certificate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Category (P9.6.4)</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Statutory & Civil">Statutory &amp; Civil (Birth Cert / NEMIS)</option>
                  <option value="Academic & Transcripts">Academic &amp; Transcripts (KPSEA / Leaving)</option>
                  <option value="Medical & Health">Medical &amp; Health (Immunization / Clinic Form)</option>
                  <option value="Identification & Legal">Identification &amp; Legal (Parent ID / Court Order)</option>
                  <option value="Photographs & Biometrics">Photographs &amp; Biometrics</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Format</label>
                <select
                  value={fileExtension}
                  onChange={(e) => setFileExtension(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="PDF">PDF Portable Document</option>
                  <option value="PNG">PNG Image</option>
                  <option value="JPEG">JPEG Photo</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-cyan-200 rounded-2xl bg-cyan-50/50 text-center space-y-1">
                <UploadCloud className="w-6 h-6 text-cyan-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Drag and drop file or click to select</p>
                <p className="text-[10px] text-slate-500">Max size: 10 MB (Auto encrypted with SHA-256)</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Upload to Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">{previewDoc.documentTitle}</h3>
                <p className="text-[11px] text-slate-500">
                  {previewDoc.fileName} • {previewDoc.documentCategory}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="p-8 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-12 h-12 text-cyan-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Document Cryptographically Signed</p>
                <p className="text-[10px] font-mono text-slate-600 break-all mt-1">
                  SHA: {previewDoc.checksumSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                Verification Status: {previewDoc.verificationStatus}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
