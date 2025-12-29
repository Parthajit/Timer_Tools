import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Minus, Music } from 'lucide-react';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pulse, setPulse] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const scheduleNote = (time: number) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const envelope = audioCtxRef.current.createGain();

    osc.frequency.value = 880; // A5
    envelope.gain.value = 0.5;
    envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(envelope);
    envelope.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + 0.1);

    // Visual pulse on the main thread close to the audio trigger
    setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 100);
    }, (time - audioCtxRef.current.currentTime) * 1000);
  };

  const scheduler = () => {
    if (!audioCtxRef.current) return;
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      scheduleNote(nextNoteTimeRef.current);
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
    }
    timerRef.current = window.setTimeout(scheduler, 25);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      setIsPlaying(true);
      nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      scheduler();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl relative overflow-hidden">
        {/* Animated Background Pulse */}
        <div 
          className={`absolute inset-0 bg-blue-500/5 transition-opacity duration-300 ${pulse ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <Music className={`mx-auto mb-8 text-blue-500 transition-transform duration-100 ${pulse ? 'scale-125' : 'scale-100'}`} size={48} />
        
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">Beats Per Minute</h2>
        
        <div className="flex items-center justify-center gap-12 mb-16">
          <button 
            onClick={() => setBpm(Math.max(40, bpm - 1))}
            className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
          >
            <Minus size={24} />
          </button>
          
          <div className="relative group">
            <span className="text-9xl font-black text-white tabular-nums drop-shadow-2xl">
              {bpm}
            </span>
            <input 
              type="range" min="40" max="240" step="1" 
              value={bpm} 
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <button 
            onClick={() => setBpm(Math.min(240, bpm + 1))}
            className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
          >
            <Plus size={24} />
          </button>
        </div>

        <button 
          onClick={toggleMetronome}
          className={`w-full py-6 rounded-2xl font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl ${
            isPlaying 
            ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40'
          }`}
        >
          {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
          {isPlaying ? 'STOP' : 'START'}
        </button>
      </div>
    </div>
  );
};

export default Metronome;