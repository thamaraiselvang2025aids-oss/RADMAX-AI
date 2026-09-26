import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { MOCK_STATS } from '../../data';

interface AnalyticsModuleProps {
  isWhiteTheme: boolean;
}

export default function AnalyticsModule({ isWhiteTheme }: AnalyticsModuleProps) {
  const [selectedRange, setSelectedRange] = useState('7d');

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#ef4444', '#10b981'];

  // format disease data for Pie chart
  const diseaseData = MOCK_STATS.diseaseDistribution.map((d, index) => ({
    name: d.disease.replace(' (Glioma)', ''),
    value: d.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Platform Diagnostics & Analytics
          </h2>
          <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            High-fidelity visual dashboards showing scan registries, MONAI AI consensus matches, and clinical workflow metrics.
          </p>
        </div>

        <div className="flex gap-2">
          {['7d', '30d', 'ytd'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                selectedRange === range
                  ? isWhiteTheme
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-400'
                  : isWhiteTheme
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Chart 1: Study Volumes vs. AI Concordance */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isWhiteTheme ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-4 select-none">
            <h3 className={`font-black text-sm ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
              Scan Ingestion & AI Agreement Rates
            </h3>
            <span className="text-[10px] text-slate-500">Monthly breakdown (YTD)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_STATS.scansByMonth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAgreed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isWhiteTheme ? '#f1f5f9' : '#1e293b'} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isWhiteTheme ? '#ffffff' : '#0f172a',
                    borderColor: isWhiteTheme ? '#e2e8f0' : '#334155',
                    borderRadius: '12px',
                    color: isWhiteTheme ? '#0f172a' : '#f8fafc'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" name="Total PACS Studies" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                <Area type="monotone" name="AI-Doctor Agreement" dataKey="aiAgreed" stroke="#10b981" fillOpacity={1} fill="url(#colorAgreed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Diagnostic Disease Distribution */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isWhiteTheme ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-4 select-none">
            <h3 className={`font-black text-sm ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
              Pathological Study Demographics
            </h3>
            <span className="text-[10px] text-slate-500">Distribution of detected lesions</span>
          </div>

          <div className="h-64 w-full flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isWhiteTheme ? '#ffffff' : '#0f172a',
                      borderColor: isWhiteTheme ? '#e2e8f0' : '#334155',
                      borderRadius: '12px',
                      color: isWhiteTheme ? '#0f172a' : '#f8fafc'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legends list */}
            <div className="flex-1 space-y-1.5 w-full select-none">
              {diseaseData.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className={isWhiteTheme ? 'text-slate-700' : 'text-slate-400'}>{d.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{d.value} scans</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
