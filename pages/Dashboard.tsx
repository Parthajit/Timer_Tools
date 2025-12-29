import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSessions, TimerSession } from '../utils/analytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Clock, Activity, TrendingUp, 
  Timer, Watch, Hourglass, Calendar, Settings2, ChevronRight
} from 'lucide-react';

type ToolType = 'stopwatch' | 'countdown' | 'laptimer' | 'interval' | 'chess';
type RangeMode = 'week' | 'month' | 'custom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<ToolType>('stopwatch');
  const [rangeMode, setRangeMode] = useState<RangeMode>('week');
  
  // Date states
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
    const start = new Date();
    
    if (mode === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (mode === 'month') {
      start.setDate(end.getDate() - 30);
    } else {
      return; // Custom doesn't auto-update start/end
    }
    
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
        .filter(s => s.tool === selectedTool)
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
    return `${hours} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  const { chartData, stats, insight } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysMap = new Map();
    
    const tempDate = new Date(start);
    while (tempDate <= end) {
        const dateKey = tempDate.toISOString().split('T')[0];
        daysMap.set(dateKey, {
            date: dateKey,
            displayDate: tempDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            count: 0,
            duration: 0,
            completed: 0,
            pauses: 0,
            avgLap: 0,
            consistency: 0,
            rounds: 0,
            lapCount: 0
        });
        tempDate.setDate(tempDate.getDate() + 1);
    }

    let totalDuration = 0;
    let totalCount = 0;
    let totalCompleted = 0;
    let totalPauses = 0;
    let totalLaps = 0;
    let consistencySum = 0;
    let avgLapSum = 0;
    let totalRounds = 0;

    filteredSessions.forEach(s => {
        const dateKey = s.started_at.split('T')[0];
        if (daysMap.has(dateKey)) {
            const entry = daysMap.get(dateKey);
            entry.count += 1;
            entry.duration += s.duration;
            totalDuration += s.duration;
            totalCount += 1;
            const meta = s.metadata || {};
            if (selectedTool === 'countdown') {
                if (meta.completed) { entry.completed += 1; totalCompleted += 1; }
                entry.pauses += (meta.pauses || 0); totalPauses += (meta.pauses || 0);
            }
            if (selectedTool === 'laptimer') {
                const laps = meta.lapCount || 0; entry.lapCount += laps; totalLaps += laps;
                entry.avgLap += (meta.averageLap || 0); entry.consistency += (meta.consistency || 0);
                avgLapSum += (meta.averageLap || 0); consistencySum += (meta.consistency || 0);
            }
            if (selectedTool === 'interval') { entry.rounds += (meta.rounds_completed || 0); totalRounds += (meta.rounds_completed || 0); }
        }
    });

    const data = Array.from(daysMap.values()).map(day => ({
        name: day.displayDate,
        sessions: day.count,
        hours: parseFloat((day.duration / 3600000).toFixed(2)),
        conversionRate: day.count > 0 ? parseFloat(((day.completed / day.count) * 100).toFixed(1)) : 0,
        avgLapSeconds: day.count > 0 ? parseFloat((day.avgLap / day.count / 1000).toFixed(2)) : 0,
        totalRounds: day.rounds
    }));

    const totalTimeFormatted = formatDurationHMS(totalDuration);
    const statsObj = {
        totalSessions: totalCount,
        totalTimeFormatted,
        metric1: { label: '', value: '' },
        metric2: { label: '', value: '' },
        metric3: { label: '', value: '' }
    };

    if (selectedTool === 'stopwatch') {
        statsObj.metric1 = { label: 'Total Frequency', value: totalCount.toString() };
        statsObj.metric2 = { label: 'Accumulated Time', value: totalTimeFormatted };
        statsObj.metric3 = { label: 'Avg Duration', value: formatDurationHMS(totalCount > 0 ? totalDuration / totalCount : 0) };
    } else if (selectedTool === 'countdown') {
        statsObj.metric1 = { label: 'Completion Rate', value: `${totalCount > 0 ? ((totalCompleted / totalCount) * 100).toFixed(1) : '0'}%` }; 
        statsObj.metric2 = { label: 'Avg Interruptions', value: totalCount > 0 ? (totalPauses / totalCount).toFixed(1) : '0' };
        statsObj.metric3 = { label: 'Focused Time', value: totalTimeFormatted };
    } else if (selectedTool === 'laptimer') {
        statsObj.metric1 = { label: 'Avg Lap Time', value: formatDurationHMS(totalCount > 0 ? avgLapSum / totalCount : 0) };
        statsObj.metric2 = { label: 'Consistency', value: formatDurationHMS(totalCount > 0 ? consistencySum / totalCount : 0) };
        statsObj.metric3 = { label: 'Total Laps', value: totalLaps.toString() };
    } else if (selectedTool === 'interval') {
        statsObj.metric1 = { label: 'Total Rounds', value: totalRounds.toString() };
        statsObj.metric2 = { label: 'Workouts', value: totalCount.toString() };
        statsObj.metric3 = { label: 'Active Time', value: totalTimeFormatted };
    } else if (selectedTool === 'chess') {
        statsObj.metric1 = { label: 'Games Played', value: totalCount.toString() };
        statsObj.metric2 = { label: 'Total Playtime', value: totalTimeFormatted };
        statsObj.metric3 = { label: 'Avg Game Length', value: formatDurationHMS(totalCount > 0 ? totalDuration / totalCount : 0) };
    }

    return { chartData: data, stats: statsObj, insight: totalCount > 0 ? `You've logged ${totalCount} sessions totaling ${totalTimeFormatted}.` : "No sessions found for this range." };
  }, [filteredSessions, selectedTool, startDate, endDate]);

  if (!user) return <div className="flex items-center justify-center h-[50vh]"><p className="text-slate-500">Please log in to view analytics.</p></div>;

  const modeStyles = {
    week: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500',
    month: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-500',
    custom: 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border-violet-500'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">Analytics</h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-400">Viewing performance for </p>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              rangeMode === 'week' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              rangeMode === 'month' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              'bg-violet-500/10 text-violet-400 border-violet-500/20'
            }`}>
              {rangeMode}
            </span>
          </div>
        </div>
        
        {/* Advanced Filter Console */}
        <div className="bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row gap-2">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-black/20 rounded-2xl">
            <button 
              onClick={() => handlePresetChange('week')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'week' ? modeStyles.week : 'text-slate-500 hover:text-white'}`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => handlePresetChange('month')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'month' ? modeStyles.month : 'text-slate-500 hover:text-white'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setRangeMode('custom')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${rangeMode === 'custom' ? modeStyles.custom : 'text-slate-500 hover:text-white'}`}
            >
              Custom
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 px-3 rounded-xl border border-white/5">
              <Calendar size={14} className="text-slate-500" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none w-28"
              />
              <span className="text-[10px] font-black text-slate-700">TO</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selector Dock */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {(['stopwatch', 'countdown', 'laptimer', 'interval', 'chess'] as ToolType[]).map(t => (
              <button
                  key={t}
                  onClick={() => setSelectedTool(t)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 whitespace-nowrap border ${selectedTool === t ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}
              >
                  {t === 'stopwatch' && <Watch size={18} />}
                  {t === 'countdown' && <Timer size={18} />}
                  {t === 'laptimer' && <Hourglass size={18} />}
                  {t === 'interval' && <Activity size={18} />}
                  {t === 'chess' && <Settings2 size={18} />}
                  <span className="capitalize">{t === 'laptimer' ? 'Lap Timer' : t}</span>
              </button>
          ))}
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         {[stats.metric1, stats.metric2, stats.metric3].map((m, i) => (
           <div key={i} className="group bg-white/5 hover:bg-white/[0.08] backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:border-blue-500/30 transition-all">
             <div className="flex items-center justify-between mb-4">
                 <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{m.label || 'Activity'}</p>
                 <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
             </div>
             <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{m.value || '0'}</p>
           </div>
         ))}
      </div>

      {/* Visualization Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         <div className="xl:col-span-8 bg-white/5 backdrop-blur-md p-8 rounded-[3rem] border border-white/10">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Activity</h2>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${rangeMode === 'week' ? 'bg-blue-500' : rangeMode === 'month' ? 'bg-emerald-500' : 'bg-violet-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-500">{rangeMode.toUpperCase()} VIEW</span>
                </div>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {selectedTool === 'stopwatch' || selectedTool === 'chess' ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                            <Tooltip cursor={{fill: '#ffffff03'}} contentStyle={{backgroundColor: '#020617', borderRadius: '20px', border: '1px solid #ffffff10'}} itemStyle={{color: '#3b82f6', fontWeight: 900}} />
                            <Bar dataKey="hours" fill={rangeMode === 'week' ? '#3b82f6' : rangeMode === 'month' ? '#10b981' : '#8b5cf6'} radius={[10, 10, 0, 0]} />
                        </BarChart>
                    ) : (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={rangeMode === 'week' ? '#3b82f6' : '#10b981'} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                            <Tooltip contentStyle={{backgroundColor: '#020617', borderRadius: '20px', border: '1px solid #ffffff10'}} />
                            <Area type="monotone" dataKey="sessions" stroke={rangeMode === 'week' ? '#3b82f6' : '#10b981'} strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
         </div>

         <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-[2.5rem] border border-white/10 flex-1">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Engagement Insight</h3>
                <p className="text-slate-300 leading-relaxed font-medium">
                    {insight} 
                    <br /><br />
                    Consistency is key to reaching your goals. Try to log at least one session every day to maintain your streak.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Total Sessions</p>
                        <p className="text-2xl font-black text-white">{stats.totalSessions}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center">
                        <TrendingUp size={16} className="text-blue-500" />
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
