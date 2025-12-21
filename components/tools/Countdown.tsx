import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { logSession } from '../../utils/analytics';

const Countdown: React.FC = () => {
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);
  
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauses, setPauses] = useState(0);
  
  // To track usage: store the initial timestamp when start is clicked
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const startTimer = () => {
    const total = inputH * 3600 + inputM * 60 + inputS;
    if (total === 0) return;
    
    setTotalSeconds(total);
    setTimeLeft(total);
    setIsActive(true);
    setIsPaused(false);
    setPauses(0);
    startTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setPauses(prev => prev + 1);
    logElapsed(false);
    startTimeRef.current = 0; // reset start time so we don't double count if resumed
  };

  const resumeTimer = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const logElapsed = (completed: boolean) => {
      if (startTimeRef.current > 0) {
          const elapsed = Date.now() - startTimeRef.current;
          logSession('countdown', elapsed, {
              completed: completed,
              pauses: pauses, // Count of interactions
              target_duration: totalSeconds * 1000
          });
      }
  }

  const resetTimer = () => {
    logElapsed(false);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(0);
    startTimeRef.current = 0;
    setPauses(0);
  };

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
           if (prev <= 1) {
             // Timer finished
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
             audio.play().catch(() => console.log('Audio autoplay blocked'));
             setIsActive(false);
             logElapsed(true); // Log final chunk as completed
             return 0;
           }
           return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  // Clean up on unmount
  useEffect(() => {
      return () => {
          if (isActive && !isPaused) logElapsed(false);
      }
  }, [isActive, isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return (
        <div className="text-6xl sm:text-8xl font-bold tracking-tight text-white tabular-nums">
            {h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}
            {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
    );
  };

  // Input view
  if (!isActive && timeLeft === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-green-900/10 w-full text-center border border-white/10">
           <h2 className="text-2xl font-semibold text-slate-300 mb-8">Set Countdown</h2>
           
           <div className="flex gap-4 justify-center items-end mb-12">
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hours</label>
                 <input 
                    type="number" min="0" max="99" 
                    value={inputH} 
                    onChange={(e) => setInputH(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 h-24 text-4xl text-center bg-slate-800/50 border-2 border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all text-white font-bold"
                 />
              </div>
              <span className="text-4xl font-bold text-slate-600 mb-6">:</span>
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minutes</label>
                 <input 
                    type="number" min="0" max="59" 
                    value={inputM} 
                    onChange={(e) => setInputM(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-24 h-24 text-4xl text-center bg-slate-800/50 border-2 border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all text-white font-bold"
                 />
              </div>
              <span className="text-4xl font-bold text-slate-600 mb-6">:</span>
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seconds</label>
                 <input 
                    type="number" min="0" max="59" 
                    value={inputS} 
                    onChange={(e) => setInputS(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-24 h-24 text-4xl text-center bg-slate-800/50 border-2 border-slate-700 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all text-white font-bold"
                 />
              </div>
           </div>

           <button 
              onClick={startTimer}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white w-full max-w-xs mx-auto py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-green-900/30"
            >
              <Play fill="currentColor" size={20} /> Start Timer
            </button>
        </div>
      </div>
    );
  }

  // Active view
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-green-900/10 w-full text-center border border-white/10 relative overflow-hidden">
        {/* Progress Bar background */}
        <div className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(34,197,94,0.5)]" style={{ width: `${100 - progress}%` }}></div>

        <h2 className="text-2xl font-semibold text-slate-300 mb-8">Timer</h2>
        
        <div className="mb-12">
            {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 justify-center">
          {isPaused ? (
             <button 
             onClick={resumeTimer}
             className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-green-900/30"
           >
             <Play fill="currentColor" size={20} /> Resume
           </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 border border-white/10"
            >
              <Pause fill="currentColor" size={20} /> Pause
            </button>
          )}

          <button 
            onClick={resetTimer}
            className="flex items-center gap-2 bg-white/10 text-slate-300 hover:bg-white/20 border border-white/5 px-6 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            <RotateCcw size={20} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Countdown;