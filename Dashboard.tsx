import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSessions, TimerSession } from '../utils/analytics';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  Clock, Activity, TrendingUp, 
  Timer, Watch, Hourglass, Calendar, ChevronRight, Download, History, Table as TableIcon, Layers, Sparkles
} from 'lucide-react';

type ToolType = 'all' | 'stopwatch' | 'countdown' | 'laptimer' | 'interval';
type RangeMode = 'week' | 'month' | 'all-time' | 'custom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<ToolType>('all');
  const [rangeMode, setRangeMode] = useState<RangeMode>('week');
  
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
        const data = await getSessions();
        setSessions(data);
    };
    loadData();
  }, [user]);

  const handlePresetChange = (mode: RangeMode) => {
    setRangeMode(mode);
    const end = new Date();
    let start = new Date();
    
    if (mode === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (mode === 'month') {
      start.setDate(end.getDate() - 30);
    } else if (mode === 'all-time') {
      if (sessions.length > 0) {
        // Find earliest session date
        const earliest = sessions.reduce((prev, curr) => 
          new Date(curr.started_at) < new Date(prev.started_at) ? curr : prev
        );
        start = new Date(earliest.started_at);
      } else {
        start = new Date(2020, 0, 1); // Fallback
      }
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
    const msKeys = ['averageLap', 'fastestLap', 'slowestLap', 'original_target', 'consistency', 'duration', 'total_time'];
    if (msKeys.includes(key) || key.toLowerCase().includes('lap')) {
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

    // Generate Performance Brief
    let brief = "Ready to start tracking? Complete a session to see your performance summary here.";
    if (totalCount > 0) {
      const topTool = Object.entries(toolUsage).sort((a,b) => b[1] - a[1])[0][0];
      const avgMs = totalDuration / totalCount;
      const hours = totalDuration / 3600000;
      
      const intensity = hours > 10 ? "High Intensity" : hours > 2 ? "Moderate" : "Light";
      brief = `You've had a ${intensity} period with ${totalCount} sessions. Your primary focus was the ${topTool}, averaging ${formatDurationHMS(avgMs)} per session.`;
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
    const headers = ["ID", "Date", "Time", "Tool", "Duration (ms)", "Duration (formatted)", "Metadata"];
    const rows = filteredSessions.map(s => {
      const date = new Date(s.started_at);
      return [s.id, date.toLocaleDateString(), date.toLocaleTimeString(), s.tool, s.duration, formatDurationHMS(s.duration), JSON.stringify(s.metadata || {}).replace(/"/g, '""')];
    });
    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `timer_data_${selectedTool}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return <div className="flex items-center justify-center h-[50vh]"><p className="text-slate-500">Please log in to view analytics.</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase italic">Analytics</h1>
          <p className="text-slate-400 font-medium tracking-wide">Historical insights and productivity tracking</p>
        </div>
        
        <div className="bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row gap-2">
          <div className="flex p-1 bg-black/20 rounded-2xl overflow-x-auto">
            <button onClick={() => handlePresetChange('week')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'week' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Week</button>
            <button onClick={() => handlePresetChange('month')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'month' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Month</button>
            <button onClick={() => handlePresetChange('all-time')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'all-time' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Beginning</button>
            <button onClick={() => setRangeMode('custom')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'custom' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Custom</button>
          </div>
          <div className="flex items-center gap-2 px-3 bg-slate-900/50 rounded-xl border border-white/5">
            <Calendar size={14} className="text-slate-500" />
            <input type="date" value={startDate} onChange={(e) => handleDateChange('start', e.target.value)} className="bg-transparent text-xs font-bold text-white outline-none w-28" />
            <span className="text-[10px] font-black text-slate-700">TO</span>
            <input type="date" value={endDate} onChange={(e) => handleDateChange('end', e.target.value)} className="bg-transparent text-xs font-bold text-white outline-none w-28" />
          </div>
        </div>
      </div>

      {/* Performance Brief Card */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={120} className="text-blue-400" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="p-4 bg-blue-500/30 rounded-2xl text-blue-300">
                  <Activity size={32} />
              </div>
              <div>
                  <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Performance Brief</h2>
                  <p className="text-2xl font-bold text-white leading-tight max-w-3xl">
                      {performanceBrief}
                  </p>
              </div>
          </div>
      </div>

      {/* Tool Selection Tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          <button onClick={() => setSelectedTool('all')} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 whitespace-nowrap border ${selectedTool === 'all' ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}>
              <Layers size={18} />
              <span>All Tools</span>
          </button>
          {(['stopwatch', 'countdown', 'laptimer', 'interval'] as ToolType[]).map(t => (
              <button key={t} onClick={() => setSelectedTool(t)} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 whitespace-nowrap border ${selectedTool === t ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}>
                  {t === 'stopwatch' && <Watch size={18} />}
                  {t === 'countdown' && <Timer size={18} />}
                  {t === 'laptimer' && <Hourglass size={18} />}
                  {t === 'interval' && <Activity size={18} />}
                  <span className="capitalize">{t === 'laptimer' ? 'Lap Timer' : t}</span>
              </button>
          ))}
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 group hover:border-blue-500/40 transition-all">
           <div className="flex justify-between items-start mb-4">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Completed Sessions</p>
               <TrendingUp size={16} className="text-blue-500" />
           </div>
           <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.totalSessions}</p>
         </div>
         <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 group hover:border-emerald-500/40 transition-all">
           <div className="flex justify-between items-start mb-4">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Time Active</p>
               <Clock size={16} className="text-emerald-500" />
           </div>
           <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.totalTime}</p>
         </div>
         <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 group hover:border-amber-500/40 transition-all">
           <div className="flex justify-between items-start mb-4">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Avg Efficiency</p>
               <Activity size={16} className="text-amber-500" />
           </div>
           <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.avgTime}</p>
         </div>
      </div>

      {/* Main Grid: Graph and Table */}
      <div className="space-y-12">
          {/* Trend Chart */}
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Focus Intensity Trend (Hours)</h2>
                  <div className={`px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 uppercase`}>{selectedTool} View</div>
              </div>
              <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderRadius: '20px', border: '1px solid #ffffff10'}} />
                          <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Master Table */}
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                        <History size={24} />
                      </div>
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Full Session Log</h2>
                  </div>
                  <button 
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <Download size={16} />
                    <span>Download (CSV)</span>
                  </button>
              </div>

              <div className="border border-white/5 rounded-[2rem] overflow-hidden bg-black/20">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Date & Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Tool</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Duration</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Specific Details (Seconds)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200">{new Date(session.started_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(session.started_at).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          {session.tool}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-white tabular-nums">
                                            {formatDurationHMS(session.duration)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(session.metadata || {}).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/40 border border-white/5 text-[9px] font-black text-slate-400 uppercase">
                                                    <span className="text-slate-500">{formatKey(key)}:</span>
                                                    <span className="text-blue-400">{formatDetailValue(key, val)}</span>
                                                </div>
                                            ))}
                                            {(!session.metadata || Object.keys(session.metadata).length === 0) && (
                                                <span className="text-[10px] text-slate-600 font-bold uppercase italic">Standard Run</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center text-slate-600">
                                        <TableIcon size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-black uppercase tracking-widest text-xs">No records found for this period</p>
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