import React, { useState } from 'react';
import { Layers, Users, Activity, CheckCircle, Search, Building2, Flame, ShieldAlert } from 'lucide-react';

interface DepartmentsModuleProps {
  isWhiteTheme: boolean;
}

const DEPARTMENTS_DATA = [
  {
    id: 'dept_neuroradiology',
    name: 'Neuroradiology Division',
    head: 'Dr. Sarah Chen, MD, FRCR',
    scanners: ['Siemens Magnetom Vida 3T MRI', 'GE Revolution CT'],
    staffCount: 8,
    activeScans: 4,
    turnaroundTime: '42 mins',
    accuracyRate: '98.4%',
    priority: 'HIGH',
    status: 'OPTIMAL'
  },
  {
    id: 'dept_trauma',
    name: 'Emergency & Trauma Radiology',
    head: 'Dr. Marcus Vance, MD, FACP',
    scanners: ['GE Optima Speed CT Scanner', 'Carestream DRX-Evolution X-Ray'],
    staffCount: 12,
    activeScans: 9,
    turnaroundTime: '15 mins',
    accuracyRate: '97.2%',
    priority: 'CRITICAL',
    status: 'HEAVY WORKLOAD'
  },
  {
    id: 'dept_cardiothoracic',
    name: 'Cardiothoracic Imaging Unit',
    head: 'Dr. Clara Rose, MD',
    scanners: ['Philips Spectral CT 7500', 'Siemens Altea 1.5T MRI'],
    staffCount: 6,
    activeScans: 3,
    turnaroundTime: '55 mins',
    accuracyRate: '96.8%',
    priority: 'HIGH',
    status: 'OPTIMAL'
  },
  {
    id: 'dept_musculoskeletal',
    name: 'Musculoskeletal & Sports Unit',
    head: 'Dr. David Beck, MD',
    scanners: ['GE Signa Pioneer 3T MRI', 'Fujifilm FDR D-EVO II X-Ray'],
    staffCount: 5,
    activeScans: 2,
    turnaroundTime: '38 mins',
    accuracyRate: '95.5%',
    priority: 'MEDIUM',
    status: 'OPTIMAL'
  },
  {
    id: 'dept_oncology',
    name: 'Oncology & Nuclear Medicine',
    head: 'Dr. Dev Roy, PhD',
    scanners: ['Siemens Biograph PET/CT', 'Varian Edge Linear Accelerator'],
    staffCount: 7,
    activeScans: 5,
    turnaroundTime: '65 mins',
    accuracyRate: '99.1%',
    priority: 'CRITICAL',
    status: 'HEAVY WORKLOAD'
  }
];

export default function DepartmentsModule({ isWhiteTheme }: DepartmentsModuleProps) {
  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(DEPARTMENTS_DATA[0].id);

  const filtered = DEPARTMENTS_DATA.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDept = DEPARTMENTS_DATA.find(d => d.id === selectedDeptId) || DEPARTMENTS_DATA[0];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            <Layers className="w-6 h-6 text-indigo-400" /> Medical & Radiology Departments
          </h2>
          <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure institutional division staffing, hardware utilization, and telemetry performance benchmarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Departments List */}
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isWhiteTheme 
                  ? 'bg-white border border-slate-200 text-slate-800' 
                  : 'bg-slate-900 border border-slate-800 text-white'
              }`}
            />
          </div>

          <div className="space-y-2.5">
            {filtered.map((dept) => {
              const isSelected = dept.id === selectedDeptId;
              const isHeavy = dept.status === 'HEAVY WORKLOAD';

              return (
                <div 
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative ${
                    isSelected
                      ? isWhiteTheme
                        ? 'bg-indigo-50 border-indigo-200 text-slate-900 shadow-sm'
                        : 'bg-indigo-950/40 border-indigo-700/50 text-white'
                      : isWhiteTheme
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{dept.name}</h4>
                      <p className={`text-[10px] mt-0.5 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                        Clinical Chief: {dept.head.split(',')[0]}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isHeavy 
                        ? 'bg-red-500/15 text-red-500 border border-red-500/20' 
                        : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {dept.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/10">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">Turnaround</p>
                      <p className="font-bold mt-0.5">{dept.turnaroundTime}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">Active Cases</p>
                      <p className="font-bold mt-0.5">{dept.activeScans}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold">Accuracy</p>
                      <p className="font-bold mt-0.5">{dept.accuracyRate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Division Diagnostics */}
        <div className="xl:col-span-2 space-y-4">
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${
            isWhiteTheme 
              ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <div className="flex justify-between items-center border-b border-slate-800/20 pb-4 mb-4 select-none">
              <div>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${
                  isWhiteTheme ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  Department Focus Area
                </span>
                <h3 className={`text-lg font-black mt-0.5 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  {selectedDept.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">PACS Routing Priority</span>
                <span className={`font-bold uppercase text-[11px] ${
                  selectedDept.priority === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                }`}>{selectedDept.priority}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telemetry metrics list */}
              <div className={`p-4 rounded-xl space-y-3.5 border ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Department Telemetry
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Clinical Chief</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedDept.head}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Assigned Staff Count</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedDept.staffCount} Radiologists & Techs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Average Turnaround Goal</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedDept.turnaroundTime} (Target Achieved)</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">Diagnostic Saliency Rating</span>
                    <span className="font-bold text-emerald-500">{selectedDept.accuracyRate} Concordance</span>
                  </div>
                </div>
              </div>

              {/* Hardware utilization */}
              <div className={`p-4 rounded-xl space-y-3.5 border ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> In-Service Modality Scanners
                </h4>
                <div className="space-y-2">
                  {selectedDept.scanners.map((scan, index) => (
                    <div 
                      key={index}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        isWhiteTheme ? 'bg-white border-slate-200/80 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{scan}</span>
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/15">
                        ONLINE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick staff shifts */}
            <div className="mt-6">
              <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">On-Duty Shift Rosters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num}
                    className={`p-3 rounded-xl border text-center ${
                      isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-850'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto mb-2 flex items-center justify-center font-bold text-white text-[10px]">
                      MD
                    </div>
                    <p className={`font-bold ${isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}`}>Staff Practitioner {num}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Shift: 08:00 - 18:00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
