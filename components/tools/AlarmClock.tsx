import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Clock, Calendar, Music } from 'lucide-react';

interface Tone {
  id: string;
  name: string;
  url: string;
}

const TONES: Tone[] = [
  { id: 'beep', name: 'Classic Beep', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'digital', name: 'Digital Alarm', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
  { id: 'chime', name: 'Soft Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { id: 'alert', name: 'Electronic', url: 'https://assets.mixkit.co/active_storage/sfx/1001/1001-preview.mp3' },
];

interface Alarm {
  id: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  message: string;
  isEnabled: boolean;
  toneId: string;
}

const AlarmClock: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('timetools_alarms');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0].id);
  
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('timetools_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const seconds = now.getSeconds();

      if (seconds === 0) {
        const trigger = alarms.find(a => 
          a.isEnabled && 
          a.time === currentTime && 
          a.date === currentDate
        );
        if (trigger) {
          triggerAlarm(trigger);
        }
      }
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [alarms]);

  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarm(alarm);
    const tone = TONES.find(t => t.id === alarm.toneId) || TONES[0];
    
    if (audioRef.current) {
        audioRef.current.pause();
    }
    audioRef.current = new Audio(tone.url);
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.log("Audio play blocked", e));
  };

  const dismissAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Disable the alarm after it fires once
    if (ringingAlarm) {
        setAlarms(prev => prev.map(a => a.id === ringingAlarm.id ? { ...a, isEnabled: false } : a));
    }
    setRingingAlarm(null);
  };

  const addAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || !newDate) return;
    
    const alarm: Alarm = {
      id: crypto.randomUUID(),
      time: newTime,
      date: newDate,
      message: newMessage || 'Alarm',
      isEnabled: true,
      toneId: selectedTone
    };
    
    setAlarms([...alarms, alarm].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        return dateA - dateB;
    }));
    
    setNewTime('');
    setNewMessage('');
    // Reset date to today for next entry
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const getTimeRemaining = (alarm: Alarm) => {
    const now = new Date();
    const target = new Date(`${alarm.date}T${alarm.time}`);
    
    if (target <= now) return 'Passed';
    
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${mins}m`;
    
    return result;
  };

  const testTone = (toneUrl: string) => {
      const audio = new Audio(toneUrl);
      audio.play().then(() => {
          setTimeout(() => audio.pause(), 2000);
      }).catch(() => {});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Ringing Overlay */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="text-center max-w-md w-full">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-10 animate-pulse shadow-[0_0_80px_rgba(59,130,246,0.6)]">
              <Bell size={64} className="text-white animate-ring" />
            </div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tight">{ringingAlarm.message}</h2>
            <p className="text-2xl text-slate-400 mb-2">Scheduled for {ringingAlarm.time}</p>
            <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-12">{ringingAlarm.date}</p>
            <button 
              onClick={dismissAlarm}
              className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black text-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl hover:shadow-white/10"
            >
              STOP ALARM
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Alarms</h1>
        <p className="text-slate-400 text-lg">Never miss a deadline or a wake-up call.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Add Alarm Form */}
        <div className="lg:col-span-4">
          <form onSubmit={addAlarm} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sticky top-24 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Plus size={20} className="text-blue-400" />
              </div> 
              New Alarm
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="time" 
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Alarm Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(tone => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                          setSelectedTone(tone.id);
                          testTone(tone.url);
                      }}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                        selectedTone === tone.id 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="truncate">{tone.name}</span>
                      <Music size={14} className={selectedTone === tone.id ? 'opacity-100' : 'opacity-30'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Message</label>
                <input 
                  type="text"
                  placeholder="e.g. Morning Coffee"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-700" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 text-lg mt-4 active:scale-[0.98]"
              >
                Set Alarm
              </button>
            </div>
          </form>
        </div>

        {/* Alarms List */}
        <div className="lg:col-span-8">
          {alarms.length === 0 ? (
            <div className="h-full min-h-[400px] border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-700">
               <div className="p-8 bg-white/5 rounded-full mb-6">
                 <Clock size={64} className="opacity-20" />
               </div>
               <p className="text-xl font-medium">No alarms scheduled yet</p>
               <p className="text-sm mt-2 opacity-50">Create one on the left to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {alarms.map(alarm => {
                const isPassed = new Date(`${alarm.date}T${alarm.time}`) <= new Date();
                return (
                  <div 
                    key={alarm.id} 
                    className={`bg-white/5 border border-white/10 rounded-[2rem] p-8 transition-all group relative overflow-hidden ${
                      !alarm.isEnabled || isPassed ? 'opacity-50 grayscale-[0.5]' : 'hover:border-blue-500/50 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-blue-500/10'
                    }`}
                  >
                    {/* Visual Hint for Enabled status */}
                    {alarm.isEnabled && !isPassed && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                    )}

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={12} className="text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                {new Date(alarm.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <h4 className="text-4xl font-black text-white tabular-nums leading-none mb-3">{alarm.time}</h4>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                             <p className="text-slate-300 font-bold truncate max-w-[180px]">{alarm.message}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteAlarm(alarm.id)}
                        className="text-slate-600 hover:text-red-400 p-3 rounded-2xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isPassed ? 'text-slate-600' : 'text-blue-400'}`}>
                          {isPassed ? 'Expired' : `In ${getTimeRemaining(alarm)}`}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                            <Music size={10} className="text-slate-600" />
                            <span className="text-[10px] text-slate-500 font-medium">
                                {TONES.find(t => t.id === alarm.toneId)?.name}
                            </span>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          disabled={isPassed}
                          checked={alarm.isEnabled} 
                          onChange={() => setAlarms(alarms.map(a => a.id === alarm.id ? {...a, isEnabled: !a.isEnabled} : a))}
                          className="sr-only peer" 
                        />
                        <div className="w-12 h-7 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlarmClock;