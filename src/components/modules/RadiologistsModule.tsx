import React, { useState } from 'react';
import { UserSquare2, Award, Mail, Phone, Briefcase, BarChart, ShieldAlert, Heart, Activity } from 'lucide-react';

interface RadiologistsModuleProps {
  isWhiteTheme: boolean;
}

const RADIOLOGISTS_DATA = [
  {
    id: 'rad_01',
    name: 'Dr. Sarah Chen, MD, FRCR',
    role: 'Chief of Neuroradiology',
    email: 'sarah.chen@medvision.org',
    phone: '+1 (555) 321-9876',
    specialty: 'Neuroradiology, Functional Neuroimaging',
    workload: 'Moderate',
    activeCases: 4,
    signOffTime: '42m avg',
    accuracy: '98.4%',
    status: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'rad_02',
    name: 'Dr. Marcus Vance, MD, FACP',
    role: 'Emergency Trauma Chief',
    email: 'm.vance@medvision.org',
    phone: '+1 (555) 123-9876',
    specialty: 'Emergency Radiology, Chest CT',
    workload: 'Heavy',
    activeCases: 9,
    signOffTime: '15m avg',
    accuracy: '97.2%',
    status: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'rad_03',
    name: 'Dr. David Beck, MD',
    role: 'Musculoskeletal Radiologist',
    email: 'd.beck@medvision.org',
    phone: '+1 (555) 765-9876',
    specialty: 'MSK, Sports Injury Imaging',
    workload: 'Light',
    activeCases: 2,
    signOffTime: '38m avg',
    accuracy: '95.5%',
    status: 'OFFLINE',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'rad_04',
    name: 'Dr. Clara Rose, MD',
    role: 'Cardiothoracic Specialist',
    email: 'clara.rose@admin-medvision.org',
    phone: '+1 (555) 987-1234',
    specialty: 'High-Resolution Chest CT, Cardiac MRI',
    workload: 'Moderate',
    activeCases: 3,
    signOffTime: '55m avg',
    accuracy: '96.8%',
    status: 'ONLINE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  }
];

export default function RadiologistsModule({ isWhiteTheme }: RadiologistsModuleProps) {
  const [selectedId, setSelectedId] = useState(RADIOLOGISTS_DATA[0].id);

  const selectedRad = RADIOLOGISTS_DATA.find(r => r.id === selectedId) || RADIOLOGISTS_DATA[0];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none">
        <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
          isWhiteTheme ? 'text-slate-900' : 'text-white'
        }`}>
          <UserSquare2 className="w-6 h-6 text-indigo-400" /> Radiologists Directory & Workload
        </h2>
        <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
          Review diagnostic accuracy, case queues, live activity indicators, and professional contact registries.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Radiologists List Column */}
        <div className="space-y-2.5">
          {RADIOLOGISTS_DATA.map((rad) => {
            const isSelected = rad.id === selectedId;
            const isOnline = rad.status === 'ONLINE';

            return (
              <div
                key={rad.id}
                onClick={() => setSelectedId(rad.id)}
                className={`p-4 rounded-xl border flex gap-4 cursor-pointer transition-all ${
                  isSelected
                    ? isWhiteTheme
                      ? 'bg-indigo-50 border-indigo-200 text-slate-900 shadow-sm'
                      : 'bg-indigo-950/40 border-indigo-700/50 text-white'
                    : isWhiteTheme
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <img 
                  src={rad.avatar} 
                  alt={rad.name} 
                  className="w-12 h-12 rounded-full border border-indigo-500/20 object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm truncate">{rad.name.split(',')[0]}</h4>
                    <span className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                    }`} />
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                    {rad.role}
                  </p>
                  
                  <div className="flex gap-4 mt-2.5 text-[10px] text-slate-500 font-semibold uppercase">
                    <span>Cases: <strong className={isWhiteTheme ? 'text-slate-800' : 'text-white'}>{rad.activeCases}</strong></span>
                    <span>Acc: <strong className="text-emerald-500">{rad.accuracy}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Radiologist Details View Column */}
        <div className="xl:col-span-2">
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${
            isWhiteTheme 
              ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-800/10 pb-5 mb-5">
              <img 
                src={selectedRad.avatar} 
                alt={selectedRad.name} 
                className="w-20 h-20 rounded-2xl border border-indigo-500/30 object-cover"
              />
              
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                    {selectedRad.name}
                  </h3>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    selectedRad.status === 'ONLINE'
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 animate-pulse'
                      : 'bg-slate-500/15 text-slate-500 border border-slate-500/20'
                  }`}>
                    {selectedRad.status}
                  </span>
                </div>

                <p className="text-indigo-400 font-semibold text-xs">{selectedRad.role}</p>
                <p className="text-slate-500 leading-relaxed text-[11px]">Specialization: {selectedRad.specialty}</p>
              </div>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Queue Workload</p>
                <p className={`text-xl font-black mt-1 ${
                  selectedRad.workload === 'Heavy' ? 'text-amber-500' : 'text-indigo-400'
                }`}>{selectedRad.workload}</p>
                <p className="text-[10px] text-slate-500 mt-1">Pending scan review backlog</p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Turnaround Latency</p>
                <p className={`text-xl font-black mt-1 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  {selectedRad.signOffTime}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">SLA sign-off from ingest</p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Diagnostic Concordance</p>
                <p className="text-xl font-black mt-1 text-emerald-500">{selectedRad.accuracy}</p>
                <p className="text-[10px] text-slate-500 mt-1">Concurrence with AI benchmarks</p>
              </div>
            </div>

            {/* Core credentials info */}
            <div className="mt-6 space-y-3">
              <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Registrar Contact Credentials</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-3.5 ${
                  isWhiteTheme ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/20 border-slate-850'
                }`}>
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Corporate Mail</p>
                    <p className={`font-semibold ${isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}`}>{selectedRad.email}</p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3.5 ${
                  isWhiteTheme ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/20 border-slate-850'
                }`}>
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Pager/Phone</p>
                    <p className={`font-semibold ${isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}`}>{selectedRad.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
