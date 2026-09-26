import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users, ClipboardList, CheckCircle, Sliders, PlayCircle } from 'lucide-react';

interface AppointmentsModuleProps {
  isWhiteTheme: boolean;
}

interface Appointment {
  id: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  dateTime: string;
  room: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_01',
    patientName: 'Eleanor Vance',
    modality: 'MRI',
    bodyPart: 'Brain',
    dateTime: '2026-07-21T09:30:00',
    room: 'MRI Suite A (3T)',
    status: 'Scheduled'
  },
  {
    id: 'appt_02',
    patientName: 'Henry Higgins',
    modality: 'CT Scan',
    bodyPart: 'Chest',
    dateTime: '2026-07-21T11:15:00',
    room: 'CT Scanner Suite 1',
    status: 'In Progress'
  },
  {
    id: 'appt_03',
    patientName: 'Arthur Dent',
    modality: 'X-Ray',
    bodyPart: 'Knee',
    dateTime: '2026-07-21T14:00:00',
    room: 'X-Ray Bay B',
    status: 'Scheduled'
  },
  {
    id: 'appt_04',
    patientName: 'Ford Prefect',
    modality: 'Ultrasound',
    bodyPart: 'Abdomen',
    dateTime: '2026-07-22T08:45:00',
    room: 'Sonography Room 3',
    status: 'Scheduled'
  },
  {
    id: 'appt_05',
    patientName: 'Tricia McMillan',
    modality: 'Mammography',
    bodyPart: 'Breast',
    dateTime: '2026-07-22T10:30:00',
    room: 'Mammography Center A',
    status: 'Completed'
  }
];

export default function AppointmentsModule({ isWhiteTheme }: AppointmentsModuleProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Appointment Form States
  const [isAdding, setIsAdding] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [modality, setModality] = useState('MRI');
  const [bodyPart, setBodyPart] = useState('');
  const [date, setDate] = useState('2026-07-21');
  const [time, setTime] = useState('09:00');
  const [room, setRoom] = useState('MRI Suite A (3T)');

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !bodyPart) return;

    const newAppt: Appointment = {
      id: `appt_${Date.now()}`,
      patientName,
      modality,
      bodyPart,
      dateTime: `${date}T${time}:00`,
      room,
      status: 'Scheduled'
    };

    setAppointments([newAppt, ...appointments]);
    setPatientName('');
    setBodyPart('');
    setIsAdding(false);
  };

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filtered = appointments.filter(appt => {
    if (filterStatus === 'all') return true;
    return appt.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header and Call-to-action */}
      <div className="select-none flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            <Calendar className="w-6 h-6 text-indigo-400" /> Patient Radiology Scheduling
          </h2>
          <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            Book, manage, and track real-time study slots, scan suite allocations, and patient intakes.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Close Scheduler' : 'Book Appointment'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Scheduler Form Drawer Column */}
        {isAdding && (
          <div className="xl:col-span-4 animate-slide-in">
            <div className={`p-5 rounded-2xl border ${
              isWhiteTheme ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}>
              <h3 className={`font-extrabold text-sm border-b pb-2 mb-4 flex items-center gap-2 ${
                isWhiteTheme ? 'text-slate-900 border-slate-100' : 'text-white border-slate-800/60'
              }`}>
                <ClipboardList className="w-4 h-4 text-indigo-400" /> Schedule Radiology Slot
              </h3>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Patient Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`w-full text-xs rounded-xl px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Study Modality</label>
                    <select
                      value={modality}
                      onChange={(e) => {
                        setModality(e.target.value);
                        if (e.target.value === 'MRI') setRoom('MRI Suite A (3T)');
                        else if (e.target.value === 'CT Scan') setRoom('CT Scanner Suite 1');
                        else if (e.target.value === 'X-Ray') setRoom('X-Ray Bay B');
                        else if (e.target.value === 'Ultrasound') setRoom('Sonography Room 3');
                        else if (e.target.value === 'Mammography') setRoom('Mammography Center A');
                      }}
                      className={`w-full text-xs rounded-xl px-2.5 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-850' : 'bg-slate-950 border border-slate-800 text-white'
                      }`}
                    >
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="Mammography">Mammography</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Body region</label>
                    <input 
                      type="text" 
                      required
                      value={bodyPart}
                      onChange={(e) => setBodyPart(e.target.value)}
                      placeholder="e.g. Spine, Knee"
                      className={`w-full text-xs rounded-xl px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-850' : 'bg-slate-950 border border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Time slot</label>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-850' : 'bg-slate-950 border border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Machine / Suite</label>
                  <input 
                    type="text" 
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isWhiteTheme ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-xl transition-all cursor-pointer mt-4"
                >
                  Schedule Appointment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Main List Column */}
        <div className={isAdding ? 'xl:col-span-8 space-y-4' : 'xl:col-span-12 space-y-4'}>
          {/* List Filters */}
          <div className="flex gap-2 pb-2 overflow-x-auto select-none custom-scrollbar">
            {['all', 'Scheduled', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer capitalize ${
                  filterStatus === status
                    ? isWhiteTheme
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                      : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-400'
                    : isWhiteTheme
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* List display */}
          <div className="space-y-2.5">
            {filtered.map((appt) => {
              const apptDate = new Date(appt.dateTime);
              const formattedDate = apptDate.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
              });
              const formattedTime = apptDate.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div 
                  key={appt.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isWhiteTheme 
                      ? 'bg-white border-slate-200/80 hover:bg-slate-50/50 text-slate-800' 
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/60'
                    }`}>
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    
                    <div>
                      <h4 className={`font-bold text-sm ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{appt.patientName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <strong className="text-indigo-400">{appt.modality}</strong> ({appt.bodyPart}) • {appt.room}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800/10 pt-3.5 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className={`font-bold ${isWhiteTheme ? 'text-slate-800' : 'text-slate-300'}`}>{formattedDate}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formattedTime}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        appt.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                          : appt.status === 'In Progress'
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/20 animate-pulse'
                          : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {appt.status}
                      </span>

                      {appt.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'In Progress')}
                          className="p-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-600/20 text-indigo-400 transition-all cursor-pointer"
                          title="Start Procedure"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}

                      {appt.status === 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'Completed')}
                          className="p-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-600/20 text-emerald-400 transition-all cursor-pointer"
                          title="Complete Procedure"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                No appointments matched the selection.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
