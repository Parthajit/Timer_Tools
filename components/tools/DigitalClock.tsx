import React, { useState, useEffect } from 'react';
import { Globe, Clock as ClockIcon, Settings2 } from 'lucide-react';

const COMMON_TIMEZONES = [
  { label: 'Local Time', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
];

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(() => {
    const saved = localStorage.getItem('clock_format_24');
    return saved === 'true';
  });
  const [selectedTz, setSelectedTz] = useState(() => {
    return localStorage.getItem('clock_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('clock_format_24', is24Hour.toString());
    localStorage.setItem('clock_timezone', selectedTz);
  }, [is24Hour, selectedTz]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      timeZone: selectedTz,
      hour12: !is24Hour,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      timeZone: selectedTz,
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="text-center mb-16 relative">
        <h1 className="text-[14vw] sm:text-9xl md:text-[14rem] font-black text-white tabular-nums leading-none tracking-tighter drop-shadow-[0_0_80px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in duration-700">
          {formatTime(time)}
        </h1>
        <p className="text-xl sm:text-3xl text-slate-400 mt-8 font-medium tracking-wide flex items-center justify-center gap-4">
          <div className="p-1 bg-blue-500/20 rounded-lg"><Globe size={28} className="text-blue-500" /></div>
          {formatDate(time)}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-10 shadow-2xl">
        {/* Timezone Selector */}
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600/20 text-blue-400 rounded-2xl shadow-inner">
            <Globe size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">Selected Region</span>
            <select 
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="bg-transparent text-white font-black text-lg outline-none cursor-pointer hover:text-blue-400 transition-colors border-none p-0 appearance-none focus:ring-0"
            >
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value} className="bg-slate-900 text-white">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-px h-12 bg-white/10 hidden sm:block"></div>

        {/* Format Toggle */}
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl shadow-inner">
            <Settings2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">Clock Format</span>
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setIs24Hour(false)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${!is24Hour ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                12H
              </button>
              <button 
                onClick={() => setIs24Hour(true)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${is24Hour ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                24H
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detail hint */}
      <div className="mt-12 flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
        <ClockIcon size={14} className="text-blue-500" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedTz.replace('_', ' ')} (GMT{time.getTimezoneOffset() > 0 ? '-' : '+'}{Math.abs(time.getTimezoneOffset()/60)})</span>
      </div>
    </div>
  );
};

export default DigitalClock;