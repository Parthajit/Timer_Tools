import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSessions, TimerSession } from '../utils/analytics';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  Clock, Activity, TrendingUp, 
  Timer, Watch, Hourglass, Calendar, Download, History, Table as TableIcon, Layers, Sparkles, Zap,
  Lock, AlertCircle
} from 'lucide-react';

type ToolType = 'all' | 'stopwatch' | 'countdown' | 'laptimer' | 'interval';
type RangeMode = 'all-time' | 'week' | 'month' | 'custom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<ToolType>('all');
  const [rangeMode, setRangeMode] = useState<RangeMode>('week');
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [sessions, setSessions] = useState<TimerSession[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const data = await getSessions();
        setSessions(data);
      } catch (err: any) {
        if (err.message?.includes('permissions')) {
          setError("Limited access to database. Showing local history only.");
        } else {
          setError("Sync error. Please try logging in again.");
        }
        console.error("Dashboard data load error:", err);
      }
    };
    loadData();
  }, [user]);

  const handlePresetChange = (mode: RangeMode) => {
    setRangeMode(mode);
    const end = new Date();
    let start = new Date();
    
    if (mode === 'all-time') {
      if (sessions.length > 0) {
        const earliest = sessions.reduce((prev, curr) => 
          new Date(curr.started_at) < new Date(prev.started_at) ? curr : prev
        );
        start = new Date(earliest.started_at);
      } else {
        start = new Date(2020, 0, 1);
      }
    } else if (mode === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (mode === 'month') {
      start.setDate(end.getDate() - 30);
    } else return;
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setRangeMode('custom');
    if (type === 'start') setStartDate(value);
    else setEndDate(value);
  };

  const filteredSessions = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return sessions
        .filter(s => selectedTool === 'all' || s.tool === selectedTool)
        .filter(s => {
            const sessionDate = new Date(s.started_at);
            return sessionDate >= start && sessionDate <= end;
        })
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }, [sessions, selectedTool, startDate, endDate]);

  const formatDurationHMS = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const formatDetailValue = (key: string, value: any) => {
    if (typeof value !== 'number') {
        if (value === true) return 'Yes';
        if (value === false) return 'No';
        return String(value);
    }
    const countKeys = ['lapCount', 'rounds_completed', 'pauses', 'rounds'];
    if (countKeys.includes(key)) return value.toString();
    
    const msKeys = ['averageLap', 'fastestLap', 'slowestLap', 'original_target', 'consistency', 'duration', 'total_time', 'target_duration'];
    if (msKeys.includes(key) || key.toLowerCase().includes('lap') || key.toLowerCase().includes('time')) {
        return `${(value / 1000).toFixed(2)}s`;
    }
    return `${value.toFixed(2)}s`;
  };

  const { chartData, stats, performanceBrief } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysMap = new Map();
    const tempDate = new Date(start);
    while (tempDate <= end) {
        const dateKey = tempDate.toISOString().split('T')[0];
        daysMap.set(dateKey, { date: dateKey, displayDate: tempDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), count: 0, duration: 0 });
        tempDate.setDate(tempDate.getDate() + 1);
    }

    let totalDuration = 0, totalCount = 0;
    const toolUsage: Record<string, number> = {};

    filteredSessions.forEach(s => {
        const dateKey = s.started_at.split('T')[0];
        if (daysMap.has(dateKey)) {
            const entry = daysMap.get(dateKey);
            entry.count += 1; 
            entry.duration += s.duration; 
            totalDuration += s.duration; 
            totalCount += 1;
            toolUsage[s.tool] = (toolUsage[s.tool] || 0) + 1;
        }
    });

    let brief = "Ready to analyze your habits? Log some sessions to see your summary.";
    if (totalCount > 0) {
      const topTool = Object.entries(toolUsage).sort((a,b) => b[1] - a[1])[0][0];
      const avgMs = totalDuration / totalCount;
      const hours = totalDuration / 3600000;
      
      const intensity = hours > 10 ? "extremely high" : hours > 2 ? "moderate" : "light";
      brief = `Performance Snapshot: You've maintained ${intensity} focus with ${totalCount} sessions. The ${topTool} is your primary tool, averaging ${formatDurationHMS(avgMs)} per focus block.`;
    }

    const data = Array.from(daysMap.values()).map(day => ({ 
      name: day.displayDate, 
      sessions: day.count, 
      hours: parseFloat((day.duration / 3600000).toFixed(2)) 
    }));

    const statsObj = { 
      totalSessions: totalCount, 
      totalTime: formatDurationHMS(totalDuration),
      avgTime: formatDurationHMS(totalCount > 0 ? totalDuration / totalCount : 0)
    };

    return { chartData: data, stats: statsObj, performanceBrief: brief };
  }, [filteredSessions, startDate, endDate]);

  const handleDownloadExcel = () => {
    if (filteredSessions.length === 0) return;
    const headers = ["Date", "Time", "Tool", "Duration (formatted)", "Metadata"];
    const rows = filteredSessions.map(s => {
      const date = new Date(s.started_at);
      return [date.toLocaleDateString(), date.toLocaleTimeString(), s.tool, formatDurationHMS(s.duration), JSON.stringify(s.metadata || {}).replace(/"/g, '""')];
    });
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `focus_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-6">
      <div className="p-8 bg-white/5 rounded-full border border-white/5 shadow-2xl">
        <Lock size={64} className="opacity-20" />
      </div>
      <div className="text-center">
        <p className="font-black uppercase tracking-[0.4em] text-sm mb-2 text-white">Private Dashboard</p>
        <p className="text-xs font-medium max-w-xs mx-auto text-slate-500">Log in to sync your timing history across devices and view performance analytics.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with improved range selection */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase italic">Analytics</h1>
          <p className="text-slate-400 font-medium tracking-wide">Historical productivity trends & performance summaries</p>
        </div>
        
        <div className="bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row gap-2">
          <div className="flex p-1 bg-black/20 rounded-2xl overflow-x-auto scrollbar-hide">
             <button onClick={() => handlePresetChange('all-time')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${rangeMode === 'all-time' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>From Beginning</button>
             <button onClick={() => handlePresetChange('week')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${rangeMode === 'week' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Last 7 Days</button>
             <button onClick={() => handlePresetChange('month')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${rangeMode === 'month' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Last 30 Days</button>
          </div>
          <div className="flex items-center gap-2 px-3 bg-slate-900/50 rounded-xl border border-white/5">
            <Calendar size={14} className="text-slate-500" />
            <input type="date" value={startDate} onChange={(e) => handleDateChange('start', e.target.value)} className="bg-transparent text-[10px] font-bold text-white outline-none w-24" />
            <span className="text-[9px] font-black text-slate-700">TO</span>
            <input type="date" value={endDate} onChange={(e) => handleDateChange('end', e.target.value)} className="bg-transparent text-[10px] font-bold text-white outline-none w-24" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Performance Brief Card */}
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 mb-12 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
              <Sparkles size={240} />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-5 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-inner">
                  <Zap size={32} />
              </div>
              <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Performance Summary</h3>
                  <p className="text-2xl font-bold text-white leading-relaxed max-w-5xl">
                      {performanceBrief}
                  </p>
              </div>
          </div>
      </div>

      {/* Tool Tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          <button onClick={() => setSelectedTool('all')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 whitespace-nowrap border uppercase tracking-widest ${selectedTool === 'all' ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'}`}>
              <Layers size={16} />
              <span>Overall</span>
          </button>
          {(['stopwatch', 'countdown', 'laptimer', 'interval'] as ToolType[]).map(t => (
              <button key={t} onClick={() => setSelectedTool(t)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 whitespace-nowrap border uppercase tracking-widest ${selectedTool === t ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'}`}>
                  {t === 'stopwatch' && <Watch size={16} />}
                  {t === 'countdown' && <Timer size={16} />}
                  {t === 'laptimer' && <Hourglass size={16} />}
                  {t === 'interval' && <Activity size={16} />}
                  <span>{t === 'laptimer' ? 'Lap Timer' : t}</span>
              </button>
          ))}
      </div>

      {/* Primary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-blue-500/30 transition-all group">
           <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sessions Completed</p>
               <TrendingUp size={16} className="text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-6xl font-black text-white tabular-nums tracking-tighter">{stats.totalSessions}</p>
         </div>
         <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-emerald-500/30 transition-all group">
           <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Active Focus</p>
               <Clock size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-6xl font-black text-white tabular-nums tracking-tighter">{stats.totalTime}</p>
         </div>
         <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-amber-500/30 transition-all group">
           <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Block</p>
               <Activity size={16} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-6xl font-black text-white tabular-nums tracking-tighter">{stats.avgTime}</p>
         </div>
      </div>

      <div className="space-y-12">
          {/* Trend Chart */}
          <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Intensity Trend (Hours)</h2>
                  <div className="px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-black border border-blue-500/20 uppercase tracking-[0.3em]">{selectedTool} View</div>
              </div>
              <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderRadius: '24px', border: '1px solid #ffffff10', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}} />
                          <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                  <div className="flex items-center gap-5">
                      <div className="p-4 bg-emerald-500/10 rounded-3xl text-emerald-500 border border-emerald-500/20 shadow-inner">
                        <History size={28} />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Focus Log</h2>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{filteredSessions.length} sessions in view</p>
                      </div>
                  </div>
                  <button 
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10"
                  >
                    <Download size={16} />
                    <span>Export Analysis</span>
                  </button>
              </div>

              <div className="border border-white/5 rounded-[2.5rem] overflow-hidden bg-black/40">
                <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="sticky top-0 bg-slate-900 z-10 shadow-2xl">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">App</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">Duration</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">Specific Metrics (Seconds)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200">{new Date(session.started_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{new Date(session.started_at).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                          {session.tool}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                            <span className="text-base font-black text-white tabular-nums tracking-tight">
                                                {formatDurationHMS(session.duration)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-wrap gap-2.5">
                                            {Object.entries(session.metadata || {}).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/40 border border-white/5 text-[9px] font-black text-slate-400 uppercase">
                                                    <span className="text-slate-600 font-bold">{formatKey(key)}:</span>
                                                    <span className="text-blue-400">{formatDetailValue(key, val)}</span>
                                                </div>
                                            ))}
                                            {(!session.metadata || Object.keys(session.metadata).length === 0) && (
                                                <span className="text-[10px] text-slate-700 font-bold uppercase italic tracking-widest">Minimal Data</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-52 text-center">
                                        <div className="max-w-xs mx-auto opacity-10">
                                            <TableIcon size={80} className="mx-auto mb-8" />
                                            <p className="font-black uppercase tracking-[0.5em] text-xs">History Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;