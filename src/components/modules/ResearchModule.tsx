import React, { useState } from 'react';
import { FlaskConical, Download, Users, Lock, CheckCircle, Database, Search } from 'lucide-react';

interface ResearchModuleProps {
  isWhiteTheme: boolean;
}

interface Cohort {
  id: string;
  name: string;
  registeredPatients: number;
  status: 'ACTIVE RECRUITING' | 'COMPLETED PHASE I' | 'DATA COMPILATION';
  leadInvestigator: string;
  modalityRequired: string;
  ethicsApprovalId: string;
}

const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'COH_9921',
    name: 'Glioma Volumetric Progression & Survival Cohort',
    registeredPatients: 14,
    status: 'ACTIVE RECRUITING',
    leadInvestigator: 'Dr. Sarah Chen, MD, PhD',
    modalityRequired: 'MRI (T1/T2/FLAIR)',
    ethicsApprovalId: 'IRB-2026-NEURO-992'
  },
  {
    id: 'COH_1054',
    name: 'Acute Pulmonary Lobar Density & Consolidation Metrics',
    registeredPatients: 45,
    status: 'COMPLETED PHASE I',
    leadInvestigator: 'Dr. Marcus Vance, MD',
    modalityRequired: 'CT Scan (Chest Axial)',
    ethicsApprovalId: 'IRB-2025-PULM-105'
  },
  {
    id: 'COH_8842',
    name: 'Mammographic Calcification Microtexture Classifier Phase II',
    registeredPatients: 28,
    status: 'ACTIVE RECRUITING',
    leadInvestigator: 'Dr. Dev Roy, PhD',
    modalityRequired: 'Mammography (L-CC/MLO)',
    ethicsApprovalId: 'IRB-2026-ONCO-884'
  }
];

export default function ResearchModule({ isWhiteTheme }: ResearchModuleProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>(INITIAL_COHORTS);
  const [search, setSearch] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExportMetadata = (cohortId: string) => {
    setExportingId(cohortId);
    setTimeout(() => {
      setExportingId(null);
      alert(`Anonymized DICOM Metadata for cohort ${cohortId} exported successfully under HIPAA Safe Harbor de-identification rules.`);
    }, 1500);
  };

  const filtered = cohorts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.leadInvestigator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            <FlaskConical className="w-6 h-6 text-indigo-400" /> Clinical Research Cohorts & HIPAA Exports
          </h2>
          <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            Track clinical trial registries, compile double-blind cohort statistics, and download anonymized metadata datasets securely.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trial cohorts..."
            className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              isWhiteTheme ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-800 text-white'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cohort) => {
            const isRecruiting = cohort.status === 'ACTIVE RECRUITING';

            return (
              <div
                key={cohort.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between h-full ${
                  isWhiteTheme 
                    ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3 select-none">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 font-mono block">{cohort.id}</span>
                      <h3 className={`font-black text-sm mt-0.5 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{cohort.name}</h3>
                    </div>
                    <span className={`text-[9px] font-black uppercase py-0.5 px-2 rounded border whitespace-nowrap ${
                      isRecruiting 
                        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' 
                        : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {cohort.status}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border space-y-2.5 mb-5 text-[11px] ${
                    isWhiteTheme ? 'bg-slate-50 border-slate-200/85' : 'bg-slate-950/40 border-slate-800/45'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lead Investigator</span>
                      <strong className={isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}>{cohort.leadInvestigator}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Modality Constraint</span>
                      <strong className={isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}>{cohort.modalityRequired}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ethical IRB Approval</span>
                      <strong className="font-mono text-indigo-400">{cohort.ethicsApprovalId}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/10 gap-3.5 select-none">
                  <span className="text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" /> {cohort.registeredPatients} patients linked
                  </span>

                  <button
                    onClick={() => handleExportMetadata(cohort.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    disabled={exportingId === cohort.id}
                  >
                    {exportingId === cohort.id ? (
                      <>De-identifying DICOMs...</>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> HIPAA Export
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
