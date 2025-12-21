import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSessions, TimerSession } from '../utils/analytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Clock, Activity, TrendingUp, 
  Timer, Watch, Hourglass, Filter
} from 'lucide-react';

type ToolType = 'stopwatch' | 'countdown' | 'laptimer' | 'interval';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<ToolType>('stopwatch');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [sessions, setSessions] = useState<TimerSession[]>([]);

  // Load data asynchronously
  useEffect(() => {
    const loadData = async () => {
        const data = await getSessions();
        setSessions(data);
    };
    loadData();
  }, [user]);

  // 1. Filter Sessions based on selection
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const rangeDays = viewMode === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeDays);

    return sessions
        .filter(s => s.tool === selectedTool)
        .filter(s => new Date(s.started_at) >= startDate)
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }, [sessions, selectedTool, viewMode]);

  // Helper for HMS format
  const formatDurationHMS = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  // 2. Aggregate Data for Charts & Stats
  const { chartData, stats, insight } = useMemo(() => {
    // Generate buckets (days)
    const now = new Date();
    const rangeDays = viewMode === 'week' ? 7 : 30;
    const daysMap = new Map();
    
    // Initialize map
    for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        daysMap.set(dateKey, {
            date: dateKey,
            displayDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            count: 0,
            duration: 0,
            completed: 0,
            pauses: 0,
            avgLap: 0,
            consistency: 0,
            rounds: 0,
            lapCount: 0
        });
    }

    let totalDuration = 0;
    let totalCount = 0;
    let totalCompleted = 0;
    let totalPauses = 0;
    let totalLaps = 0;
    let consistencySum = 0;
    let avgLapSum = 0;
    let totalRounds = 0;

    // Fill map with data
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
                if (meta.completed) {
                    entry.completed += 1;
                    totalCompleted += 1;
                }
                entry.pauses += (meta.pauses || 0);
                totalPauses += (meta.pauses || 0);
            }
            if (selectedTool === 'laptimer') {
                const laps = meta.lapCount || 0;
                entry.lapCount += laps;
                totalLaps += laps;
                entry.avgLap += (meta.averageLap || 0); 
                entry.consistency += (meta.consistency || 0);
                avgLapSum += (meta.averageLap || 0);
                consistencySum += (meta.consistency || 0);
            }
            if (selectedTool === 'interval') {
                entry.rounds += (meta.rounds_completed || 0);
                totalRounds += (meta.rounds_completed || 0);
            }
        }
    });

    // Format for Recharts
    const data = Array.from(daysMap.values()).map(day => {
        return {
            name: day.displayDate,
            sessions: day.count,
            minutes: parseFloat((day.duration / 60000).toFixed(1)),
            hours: parseFloat((day.duration / 3600000).toFixed(2)),
            conversionRate: day.count > 0 ? parseFloat(((day.completed / day.count) * 100).toFixed(1)) : 0,
            avgPauses: day.count > 0 ? parseFloat((day.pauses / day.count).toFixed(1)) : 0,
            avgLapSeconds: day.count > 0 ? parseFloat((day.avgLap / day.count / 1000).toFixed(2)) : 0,
            consistencyScore: day.count > 0 ? parseFloat((day.consistency / day.count / 1000).toFixed(2)) : 0,
            totalRounds: day.rounds
        };
    });

    // Calculate Stats
    const totalTimeFormatted = formatDurationHMS(totalDuration);
    
    const statsObj = {
        totalSessions: totalCount,
        totalTimeFormatted,
        metric1: { label: '', value: '' },
        metric2: { label: '', value: '' },
        metric3: { label: '', value: '' }
    };

    let insightText = "Start tracking your time to see insights here.";
    if (totalCount > 0) {
        insightText = `You've logged ${totalCount} sessions totaling ${totalTimeFormatted} in the last ${rangeDays} days.`;
    }

    if (selectedTool === 'stopwatch') {
        statsObj.metric1 = { label: 'Total Frequency', value: totalCount.toString() };
        statsObj.metric2 = { label: 'Accumulated Time', value: totalTimeFormatted };
        
        const avgDuration = totalCount > 0 ? totalDuration / totalCount : 0;
        statsObj.metric3 = { label: 'Avg Duration', value: formatDurationHMS(avgDuration) };
        
        if (totalCount > 5) insightText += " Excellent consistency!";
    } else if (selectedTool === 'countdown') {
        const cr = totalCount > 0 ? ((totalCompleted / totalCount) * 100).toFixed(1) : '0';
        const ctr = totalCount > 0 ? (totalPauses / totalCount).toFixed(1) : '0';
        statsObj.metric1 = { label: 'Completion Rate', value: `${cr}%` }; 
        statsObj.metric2 = { label: 'Avg Interruptions', value: ctr };
        statsObj.metric3 = { label: 'Total Focused Time', value: totalTimeFormatted };
        if (parseFloat(cr) > 80) insightText = "Your completion rate is outstanding. Great focus!";
        else if (parseFloat(cr) < 50 && totalCount > 0) insightText = "Try to minimize interruptions to boost your completion rate.";
    } else if (selectedTool === 'laptimer') {
        const avgL = totalCount > 0 ? (avgLapSum / totalCount) : 0;
        const cons = totalCount > 0 ? (consistencySum / totalCount) : 0;
        statsObj.metric1 = { label: 'Avg Lap Time', value: formatDurationHMS(avgL) };
        statsObj.metric2 = { label: 'Consistency Score', value: formatDurationHMS(cons) };
        statsObj.metric3 = { label: 'Total Laps', value: totalLaps.toString() };
        insightText = `You've recorded ${totalLaps} laps. A lower consistency score means steadier pacing.`;
    } else if (selectedTool === 'interval') {
        statsObj.metric1 = { label: 'Total Rounds', value: totalRounds.toString() };
        statsObj.metric2 = { label: 'Workouts', value: totalCount.toString() };
        statsObj.metric3 = { label: 'Active Time', value: totalTimeFormatted };
        insightText = `You've powered through ${totalRounds} rounds. Keep pushing your limits!`;
    }

    return { chartData: data, stats: statsObj, insight: insightText };
  }, [filteredSessions, selectedTool, viewMode]);

  if (!user) {
      return (
          <div className="flex items-center justify-center h-[50vh]">
              <p className="text-slate-500">Please log in to view analytics.</p>
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Deep dive into your timing habits.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                {(['stopwatch', 'countdown', 'laptimer', 'interval'] as ToolType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setSelectedTool(t)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex items-center gap-2 ${selectedTool === t ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        {t === 'stopwatch' && <Watch size={14} />}
                        {t === 'countdown' && <Timer size={14} />}
                        {t === 'laptimer' && <Hourglass size={14} />}
                        {t === 'interval' && <Activity size={14} />}
                        <span className="hidden sm:inline">{t === 'laptimer' ? 'Lap Timer' : t}</span>
                    </button>
                ))}
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-sm">
                <button 
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'week' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Week
                </button>
                <button 
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'month' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Month
                </button>
            </div>
        </div>
      </div>

      {/* Insight Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Activity size={24} />
          </div>
          <div>
              <h3 className="text-lg font-semibold text-white mb-1">Performance Insight</h3>
              <p className="text-slate-300">{insight}</p>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/10">
             <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                     <Activity size={20} />
                 </div>
                 <p className="text-sm font-medium text-slate-400">{stats.metric1.label}</p>
             </div>
             <p className="text-3xl font-bold text-white tabular-nums">{stats.metric1.value}</p>
         </div>

         <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/10">
             <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                     <TrendingUp size={20} />
                 </div>
                 <p className="text-sm font-medium text-slate-400">{stats.metric2.label}</p>
             </div>
             <p className="text-3xl font-bold text-white tabular-nums">{stats.metric2.value}</p>
         </div>
         
         <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/10">
             <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                     <Clock size={20} />
                 </div>
                 <p className="text-sm font-medium text-slate-400">{stats.metric3.label}</p>
             </div>
             <p className="text-3xl font-bold text-white tabular-nums">{stats.metric3.value}</p>
         </div>
      </div>

      {/* Dynamic Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
         {/* Main Chart 1 */}
         <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-white/10">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Filter size={18} className="text-slate-500" />
                {selectedTool === 'stopwatch' && 'Accumulated Duration (Hours)'}
                {selectedTool === 'countdown' && 'Completion Rate (%)'}
                {selectedTool === 'laptimer' && 'Performance: Avg Lap Time (s)'}
                {selectedTool === 'interval' && 'Rounds Completed'}
            </h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {selectedTool === 'stopwatch' && (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                    {selectedTool === 'countdown' && (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Bar dataKey="conversionRate" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                    {selectedTool === 'laptimer' && (
                        <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Line type="monotone" dataKey="avgLapSeconds" stroke="#8b5cf6" strokeWidth={3} dot={{r:4, fill:'#8b5cf6'}} />
                        </LineChart>
                    )}
                    {selectedTool === 'interval' && (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Bar dataKey="totalRounds" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
         </div>

         {/* Main Chart 2 */}
         <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-white/10">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-500" />
                {selectedTool === 'stopwatch' && 'Frequency (Session Count)'}
                {selectedTool === 'countdown' && 'Avg Interruptions'}
                {selectedTool === 'laptimer' && 'Consistency (Lower is Better)'}
                {selectedTool === 'interval' && 'Active Minutes'}
            </h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {selectedTool === 'stopwatch' && (
                        <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill:'#3b82f6'}} />
                        </LineChart>
                    )}
                    {selectedTool === 'countdown' && (
                         <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Line type="monotone" dataKey="avgPauses" stroke="#22c55e" strokeWidth={3} dot={{r:4, fill:'#22c55e'}} />
                        </LineChart>
                    )}
                    {selectedTool === 'laptimer' && (
                        <AreaChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Area type="monotone" dataKey="consistencyScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                        </AreaChart>
                    )}
                    {selectedTool === 'interval' && (
                        <AreaChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Area type="monotone" dataKey="minutes" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;