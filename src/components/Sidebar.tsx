import { UserRole } from '../types';
import { 
  LayoutDashboard, Users, Image as ImageIcon, Upload, Brain, Activity, 
  AlertTriangle, FileText, ShieldAlert, LogOut
} from 'lucide-react';
import { DEMO_USERS } from '../data';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: typeof DEMO_USERS[0];
  onUserChange: (user: typeof DEMO_USERS[0]) => void;
  onLogout: () => void;
  isWhiteTheme?: boolean;
}

export default function Sidebar({ 
  currentTab, 
  onTabChange, 
  currentUser, 
  onUserChange, 
  onLogout,
  isWhiteTheme = false
}: SidebarProps) {

  // Streamlined navigation items focused ONLY on Radiologist and Patient workflows
  const menuItems = currentUser.role === UserRole.RADIOLOGIST ? [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'medical-images', label: 'PACS Workstation', icon: ImageIcon },
    { id: 'upload-scan', label: 'Upload DICOM Study', icon: Upload },
    { id: 'emergency-queue', label: 'Emergency Queue', icon: AlertTriangle },
    { id: 'reports', label: 'Diagnostic Reports', icon: FileText },
    { id: 'settings', label: 'HIPAA Audit Vault', icon: ShieldAlert },
  ] : [
    { id: 'reports', label: 'My Reports', icon: FileText },
  ];

  return (
    <aside 
      id="sidebar-container" 
      className={`w-72 border-r backdrop-blur-xl flex flex-col h-screen select-none z-30 transition-all duration-300 ${
        isWhiteTheme 
          ? 'bg-white border-slate-200 text-slate-700 shadow-sm' 
          : 'bg-slate-950/80 border-slate-800/60 text-slate-300'
      }`}
    >
      {/* Platform Title */}
      <div className={`p-6 border-b flex items-center gap-3 ${
        isWhiteTheme ? 'border-slate-100' : 'border-slate-800/60'
      }`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Brain className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className={`font-bold tracking-wide text-lg leading-none ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>MedVision AI</h1>
          <span className={`text-[10px] font-semibold tracking-wider uppercase ${
            isWhiteTheme ? 'text-indigo-600' : 'text-indigo-400'
          }`}>Enterprise PACS</span>
        </div>
      </div>

      {/* Quick Role Switcher for Demo / Clinical Testing */}
      <div className={`mx-4 my-4 p-3 rounded-xl border transition-all duration-300 ${
        isWhiteTheme ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/50 border-slate-800/50'
      }`}>
        <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 flex items-center gap-1 ${
          isWhiteTheme ? 'text-indigo-600' : 'text-indigo-400'
        }`}>
          <ShieldAlert className={`w-3 h-3 ${isWhiteTheme ? 'text-purple-600' : 'text-purple-400'}`} /> Clinical Role Switcher
        </label>
        <select 
          value={currentUser.id}
          onChange={(e) => {
            const selected = DEMO_USERS.find(u => u.id === e.target.value);
            if (selected) onUserChange(selected);
          }}
          className={`w-full text-xs rounded-lg py-1.5 px-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-300 ${
            isWhiteTheme ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-950 border border-slate-800 text-white'
          }`}
        >
          {DEMO_USERS.map((user) => (
            <option key={user.id} value={user.id}>
              {user.role} ({user.username.replace('dr_', 'Dr. ')})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2 custom-scrollbar">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left group ${
                isActive 
                  ? isWhiteTheme
                    ? 'bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-700/50 text-white shadow-md shadow-indigo-900/20' 
                  : isWhiteTheme
                    ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                    : 'hover:bg-slate-900/50 hover:text-white border border-transparent'
              }`}
            >
              <IconComponent className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                isActive 
                  ? isWhiteTheme ? 'text-indigo-600' : 'text-indigo-400' 
                  : isWhiteTheme ? 'text-slate-400 group-hover:text-indigo-600' : 'text-slate-400 group-hover:text-indigo-400'
              }`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className={`ml-auto w-1.5 h-1.5 rounded-full animate-ping ${
                  isWhiteTheme ? 'bg-indigo-600' : 'bg-indigo-400'
                }`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Clinician Profile Footer */}
      <div className={`p-4 border-t flex items-center gap-3.5 transition-all duration-300 ${
        isWhiteTheme ? 'border-slate-100 bg-slate-50' : 'border-slate-800/60 bg-slate-950/40'
      }`}>
        <img 
          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full border border-indigo-500/30 object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate leading-tight ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            {currentUser.username.replace('dr_', 'Dr. ').replace('_', ' ')}
          </p>
          <p className={`text-[11px] truncate mt-0.5 uppercase tracking-wide ${
            isWhiteTheme ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {currentUser.role.replace('_', ' ')}
          </p>
        </div>
        <button 
          onClick={onLogout}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isWhiteTheme 
              ? 'hover:bg-red-50 hover:text-red-600 text-slate-400' 
              : 'hover:bg-red-950/30 hover:text-red-400 text-slate-400'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
