import React from 'react';
import { Building, Server, HardDrive, Cpu, AlertCircle, Radio, Activity } from 'lucide-react';

interface HospitalsModuleProps {
  isWhiteTheme: boolean;
}

const INSTITUTIONS = [
  {
    id: 'inst_st_marys',
    name: 'St. Mary’s Enterprise Hospital',
    location: 'Main Campus (Block A-C)',
    ipAddress: '192.168.10.15:4006',
    storageUsed: 412.5,
    maxStorage: 1024,
    latency: '14ms',
    bandwidth: '10 Gbps',
    status: 'ACTIVE NODE',
    scannersOnline: 5
  },
  {
    id: 'inst_memorial',
    name: 'Memorial Outpatient Clinic',
    location: 'East Annex Diagnostic Center',
    ipAddress: '192.168.20.12:4006',
    storageUsed: 120.4,
    maxStorage: 512,
    latency: '28ms',
    bandwidth: '1 Gbps',
    status: 'ACTIVE NODE',
    scannersOnline: 2
  },
  {
    id: 'inst_oncology_research',
    name: 'Global Oncology Research Lab',
    location: 'Science Research Park, Tower 3',
    ipAddress: '172.16.50.8:4006',
    storageUsed: 854.1,
    maxStorage: 2048,
    latency: '45ms',
    bandwidth: '10 Gbps',
    status: 'SYNCHRONIZING',
    scannersOnline: 3
  }
];

export default function HospitalsModule({ isWhiteTheme }: HospitalsModuleProps) {
  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none">
        <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
          isWhiteTheme ? 'text-slate-900' : 'text-white'
        }`}>
          <Building className="w-6 h-6 text-indigo-400" /> Enterprise Hospital Nodes & PACS Clusters
        </h2>
        <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
          Monitor multi-facility PACS storage arrays, listener IP gateways, and cross-institutional network synchronization status.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {INSTITUTIONS.map((inst) => {
          const storagePercentage = Math.round((inst.storageUsed / inst.maxStorage) * 100);
          const isSyncing = inst.status === 'SYNCHRONIZING';

          return (
            <div 
              key={inst.id}
              className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-full ${
                isWhiteTheme 
                  ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              {/* Top border strobe */}
              <span className={`absolute left-0 top-0 right-0 h-1 ${
                isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'
              }`} />

              <div>
                <div className="flex justify-between items-start mb-3 select-none">
                  <div>
                    <h3 className={`font-black text-sm ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{inst.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{inst.location}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase py-0.5 px-2 rounded border ${
                    isSyncing 
                      ? 'bg-amber-500/15 text-amber-500 border-amber-500/20' 
                      : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {inst.status}
                  </span>
                </div>

                {/* DICOM listener parameters */}
                <div className={`p-3 rounded-xl border space-y-2 mb-5 ${
                  isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
                }`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" /> AE Title / Listener Port
                    </span>
                    <span className="font-mono text-indigo-400 font-semibold">{inst.ipAddress}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" /> Latency Rate
                    </span>
                    <span className="font-mono font-bold text-emerald-500">{inst.latency}</span>
                  </div>
                </div>

                {/* Storage arrays utilization meter */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-[10px] font-bold uppercase select-none">
                    <span className="text-slate-500 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" /> Array Storage
                    </span>
                    <span className={isWhiteTheme ? 'text-slate-800' : 'text-slate-300'}>{storagePercentage}% ({inst.storageUsed} GB / {inst.maxStorage} GB)</span>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div className={`h-2 rounded-full w-full overflow-hidden ${
                    isWhiteTheme ? 'bg-slate-100' : 'bg-slate-950'
                  }`}>
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        storagePercentage > 80 ? 'from-amber-500 to-red-500' : 'from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hardware resources summary row */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/10 text-center text-[10px] select-none font-semibold uppercase text-slate-500">
                <div className={`p-2 rounded-xl border ${
                  isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-850'
                }`}>
                  <span className="block text-[9px]">Ingest Bandwidth</span>
                  <strong className={`block text-xs mt-0.5 ${isWhiteTheme ? 'text-slate-800' : 'text-white'}`}>{inst.bandwidth}</strong>
                </div>
                <div className={`p-2 rounded-xl border ${
                  isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-850'
                }`}>
                  <span className="block text-[9px]">Scanners Online</span>
                  <strong className={`block text-xs mt-0.5 ${isWhiteTheme ? 'text-slate-800' : 'text-white'}`}>{inst.scannersOnline} units</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
