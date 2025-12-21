import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { logSession } from '../../utils/analytics';

type TimerState = 'idle' | 'work' | 'rest' | 'finished';

const IntervalTimer: React.FC = () => {
  const [workDuration, setWorkDuration] = useState(20);
  const [restDuration, setRestDuration] = useState(10);
  const [rounds, setRounds] = useState(8);
  
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(0);

  useEffect(() => {
    if (timerState !== 'idle' && timerState !== 'finished' && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, isPaused]); 

  // Effect to handle phase transition when time hits 0
  useEffect(() => {
      if (timeLeft === 0 && (timerState === 'work' || timerState === 'rest')) {
          handlePhaseChange();
      }
  }, [timeLeft, timerState]);

  const playSound = (type: 'work' | 'rest' | 'finished') => {
    // Simple beeps
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'work') {
        osc.frequency.value = 880; // High pitch
    } else if (type === 'rest') {
        osc.frequency.value = 440; // Low pitch
    } else {
        osc.frequency.value = 1200; // Finish
    }
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  };

  const handlePhaseChange = () => {
    if (timerState === 'work') {
      if (currentRound >= rounds) {
        finishWorkout();
        return;
      }
      setTimerState('rest');
      setTimeLeft(restDuration);
      playSound('rest');
    } else if (timerState === 'rest') {
      setCurrentRound((prev) => prev + 1);
      setTimerState('work');
      setTimeLeft(workDuration);
      playSound('work');
    }
  };

  const finishWorkout = () => {
      setTimerState('finished');
      playSound('finished');
      
      // Calculate total duration
      if (sessionStartRef.current > 0) {
          const duration = Date.now() - sessionStartRef.current;
          // Log specific metadata for analytics
          logSession('interval', duration, {
              rounds_completed: rounds,
              work_setting: workDuration,
              rest_setting: restDuration,
              completed: true
          });
          sessionStartRef.current = 0;
      }
  };

  const startTimer = () => {
    setTimerState('work');
    setTimeLeft(workDuration);
    setCurrentRound(1);
    setIsPaused(false);
    playSound('work');
    sessionStartRef.current = Date.now();
  };

  const togglePause = () => setIsPaused(!isPaused);

  const resetTimer = () => {
    // If we reset mid-workout, log what was done so far
    if ((timerState === 'work' || timerState === 'rest') && sessionStartRef.current > 0) {
         const duration = Date.now() - sessionStartRef.current;
         logSession('interval', duration, {
            rounds_completed: currentRound - 1, // approximate
            work_setting: workDuration,
            rest_setting: restDuration,
            completed: false
        });
    }

    setTimerState('idle');
    setIsPaused(false);
    setCurrentRound(1);
    setTimeLeft(workDuration);
    sessionStartRef.current = 0;
  };

  if (timerState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-orange-900/10 w-full border border-white/10">
           <div className="text-center mb-8">
             <Activity className="w-12 h-12 text-orange-500 mx-auto mb-4" />
             <h2 className="text-2xl font-semibold text-slate-300">Interval Settings</h2>
           </div>
           
           <div className="grid grid-cols-3 gap-6 mb-10 text-center">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Work (s)</label>
                <input 
                  type="number" value={workDuration} onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                  className="w-full text-3xl font-bold text-white text-center bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Rest (s)</label>
                <input 
                  type="number" value={restDuration} onChange={(e) => setRestDuration(parseInt(e.target.value))}
                  className="w-full text-3xl font-bold text-white text-center bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Rounds</label>
                <input 
                  type="number" value={rounds} onChange={(e) => setRounds(parseInt(e.target.value))}
                  className="w-full text-3xl font-bold text-white text-center bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 focus:border-orange-500 focus:outline-none"
                />
              </div>
           </div>

           <button 
              onClick={startTimer}
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white w-full py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-orange-900/30"
            >
              <Play fill="currentColor" size={20} /> Start Workout
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 px-4 transition-colors duration-500`}>
      <div className={`bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full text-center border ${timerState === 'work' ? 'border-orange-500/30 shadow-orange-900/20' : 'border-blue-500/30 shadow-blue-900/20'}`}>
        
        <div className="flex justify-between items-center mb-8 px-4">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                Round {currentRound} / {rounds}
            </div>
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${timerState === 'work' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {timerState === 'finished' ? 'Done' : timerState}
            </div>
        </div>
        
        <div className={`text-9xl font-bold mb-12 tabular-nums ${timerState === 'work' ? 'text-orange-500' : 'text-blue-500'}`}>
            {timerState === 'finished' ? '✓' : timeLeft}
        </div>

        <div className="flex gap-4 justify-center">
            {timerState !== 'finished' && (
                <button 
                    onClick={togglePause}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 border border-white/10"
                >
                    {isPaused ? <Play fill="currentColor" size={20} /> : <Pause fill="currentColor" size={20} />}
                    {isPaused ? "Resume" : "Pause"}
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

export default IntervalTimer;