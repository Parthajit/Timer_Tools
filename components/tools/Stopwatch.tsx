import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { logSession } from '../../utils/analytics';

interface StopwatchProps {
  mode?: 'stopwatch' | 'laptimer';
}

const Stopwatch: React.FC<StopwatchProps> = ({ mode = 'stopwatch' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Time in milliseconds
  const [laps, setLaps] = useState<number[]>([]);
  
  // Refs for logic and logging
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const lapsRef = useRef<number[]>([]); // Mirror state for access in effects

  // Sync ref with state
  useEffect(() => {
    lapsRef.current = laps;
  }, [laps]);

  const calculateAnalytics = (splitTimes: number[]) => {
      if (splitTimes.length === 0) return {};
      
      // splitTimes are total elapsed times [lap3_end, lap2_end, lap1_end]
      // We need to convert these to individual lap durations
      const reversedSplits = [...splitTimes].reverse(); // [lap1_end, lap2_end, lap3_end]
      const lapDurations: number[] = reversedSplits.map((split, i) => {
          if (i === 0) return split;
          return split - reversedSplits[i - 1];
      });
      
      const sum = lapDurations.reduce((a, b) => a + b, 0);
      const avg = sum / lapDurations.length;
      
      // Calculate Standard Deviation of the individual lap durations
      const variance = lapDurations.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lapDurations.length;
      const consistency = Math.sqrt(variance);

      return {
          lapCount: lapDurations.length,
          averageLap: avg,
          consistency: consistency,
          fastestLap: Math.min(...lapDurations),
          slowestLap: Math.max(...lapDurations)
      };
  };

  const animate = (timestamp: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = timestamp - previousTimeRef.current;
      setTime((prevTime) => prevTime + deltaTime);
    }
    previousTimeRef.current = timestamp;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = performance.now();
      sessionStartRef.current = Date.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Log session when stopped
      if (sessionStartRef.current > 0) {
          const duration = Date.now() - sessionStartRef.current;
          const metadata = mode === 'laptimer' ? calculateAnalytics(lapsRef.current) : {};
          
          logSession(mode, duration, metadata);
          sessionStartRef.current = 0;
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Cleanup log if unmounting while running
      if (isRunning && sessionStartRef.current > 0) {
          const duration = Date.now() - sessionStartRef.current;
          const metadata = mode === 'laptimer' ? calculateAnalytics(lapsRef.current) : {};
          logSession(mode, duration, metadata);
      }
    };
  }, [isRunning, mode]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    lapsRef.current = [];
  };

  const handleLap = () => {
    setLaps((prev) => [time, ...prev]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return (
      <div className="flex items-baseline justify-center tabular-nums text-white">
        <span className="text-6xl sm:text-8xl font-bold tracking-tight">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-3xl sm:text-5xl font-medium text-slate-500 ml-2">
          .{milliseconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-black/20 w-full text-center border border-white/10">
        <h2 className="text-2xl font-semibold text-slate-300 mb-8 tracking-wide">{mode === 'laptimer' ? 'Lap Timer' : 'Stopwatch'}</h2>
        
        <div className="mb-12">
          {formatTime(time)}
        </div>

        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-blue-900/30"
            >
              <Play fill="currentColor" size={20} /> Start
            </button>
          ) : (
            <button 
              onClick={handleStop}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-95 border border-white/10"
            >
              <Pause fill="currentColor" size={20} /> Stop
            </button>
          )}

          {mode === 'laptimer' && (
              <button 
                onClick={handleLap}
                disabled={!isRunning && time === 0}
                className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20 px-6 py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flag size={20} /> Lap
              </button>
          )}

          <button 
            onClick={handleReset}
            disabled={time === 0}
            className="flex items-center gap-2 bg-white/10 text-slate-300 hover:bg-white/20 border border-white/5 px-6 py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={20} /> Reset
          </button>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="mt-8 w-full max-w-md">
           <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 overflow-hidden">
             <div className="px-6 py-4 bg-white/5 border-b border-white/10 font-medium text-slate-400 flex justify-between">
                <span>Lap</span>
                <span>Split Time</span>
             </div>
             <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {laps.map((lapTime, index) => {
                  const lapNum = laps.length - index;
                  const ms = Math.floor((lapTime % 1000) / 10);
                  const s = Math.floor((lapTime / 1000) % 60);
                  const m = Math.floor(lapTime / 60000);
                  return (
                    <div key={index} className="px-6 py-3 flex justify-between border-b border-white/5 last:border-0 text-slate-300 tabular-nums hover:bg-white/5 transition-colors">
                      <span className="font-semibold text-slate-500">#{lapNum}</span>
                      <span>
                        {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}.{ms.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )
                })}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;