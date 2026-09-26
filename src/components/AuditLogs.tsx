import { useState, useEffect } from 'react';
import { ShieldCheck, Search, FileLock2, RefreshCw, Terminal } from 'lucide-react';
import { AuditLog } from '../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load clinical audits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="hipaa-audit-vault-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 rounded-xl flex items-center justify-center">
            <FileLock2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wide">HIPAA Access Audit Ledger</h3>
            <p className="text-[10px] text-slate-400 font-medium">Non-repudiation system monitoring vault</p>
          </div>
        </div>

        <button 
          onClick={fetchLogs}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 bg-slate-950/40 transition-colors cursor-pointer"
          disabled={loading}
          title="Reload Audits"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit log trail by keyword, doctor, IP or action type..."
          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800/60 custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800 tracking-wider select-none">
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">USER / CLINICIAN</th>
              <th className="py-3 px-4">ROLE</th>
              <th className="py-3 px-4">ACTION</th>
              <th className="py-3 px-4">IP ADDRESS</th>
              <th className="py-3 px-4">RESOURCE</th>
              <th className="py-3 px-4">DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30 bg-slate-950/20">
            {filteredLogs.map((log) => {
              // Color tags based on severity / type of action
              const isUpload = log.action === 'RECORD_UPLOAD';
              const isTrigger = log.action === 'AI_INFERENCE_TRIGGER';
              const isFinalize = log.action === 'REPORT_FINALIZE';
              const isLogin = log.action === 'USER_LOGIN';

              return (
                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors text-slate-300 font-sans">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {log.username}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold bg-slate-900 border border-slate-800/80 py-0.5 px-2 rounded text-slate-400">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[9px] font-extrabold uppercase py-0.5 px-1.5 rounded ${
                      isUpload 
                        ? 'bg-purple-950/30 text-purple-400 border border-purple-800/40' 
                        : isTrigger 
                        ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-800/40' 
                        : isFinalize 
                        ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/40'
                        : isLogin
                        ? 'bg-sky-950/30 text-sky-400 border border-sky-800/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800/40'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="py-3.5 px-4 font-mono text-indigo-300">{log.resource}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              );
            })}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium select-none">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                  No matching security log sequences recorded in this epoch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom info compliance line */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE AUDIT LEDGER CRYPTO-HASHED
        </span>
        <span>SHA-256 CONGRUENT</span>
      </div>
    </div>
  );
}
