import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Settings, Play, Pause, Swords, Hash } from 'lucide-react';
import { logSession } from '../../utils/analytics';

type Player = 1 | 2;

const ChessClock: React.FC = () => {
  const [time1, setTime1] = useState(300); // Seconds
  const [time2, setTime2] = useState(300);
  const [moves1, setMoves1] = useState(0);
  const [moves2, setMoves2] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(0);

  const presets = [
    { name: '1m | Bullet', time: 60, inc: 0 },
    { name: '3m | Blitz', time: 180, inc: 0 },
    { name: '3m+2s | Blitz', time: 180, inc: 2 },
    { name: '5m | Blitz', time: 300, inc: 0 },
    { name: '10m | Rapid', time: 600, inc: 0 },
  ];

  useEffect(() => {
    if (activePlayer !== null && !isPaused && !winner) {
      if (sessionStartRef.current === 0) sessionStartRef.current = Date.now();
      
      timerRef.current = window.setInterval(() => {
        if (activePlayer === 1) {
          setTime1(t => {
            if (t <= 0) {
                handleGameOver(2);
                return 0;
            }
            return t - 1;
          });
        } else {
          setTime2(t => {
            if (t <= 0) {
                handleGameOver(1);
                return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activePlayer, isPaused, winner]);

  const handleGameOver = (winningPlayer: Player) => {
      setActivePlayer(null);
      setWinner(winningPlayer);
      if (sessionStartRef.current > 0) {
          logSession('chess', Date.now() - sessionStartRef.current, { result: `player_${winningPlayer}_won` });
          sessionStartRef.current = 0;
      }
  };

  const handleTap = (player: Player) => {
    if (isPaused || winner) return;
    
    // Start game if not started
    if (activePlayer === null) {
        setActivePlayer(player === 1 ? 2 : 1);
        if (player === 1) setMoves1(m => m + 1);
        else setMoves2(m => m + 1);
        return;
    }

    // Switch turns
    if (activePlayer === player) {
      if (player === 1) {
          setTime1(t => t + increment);
          setMoves1(m => m + 1);
          setActivePlayer(2);
      } else {
          setTime2(t => t + increment);
          setMoves2(m => m + 1);
          setActivePlayer(1);
      }
    }
  };

  const resetClock = (t: number = 300, i: number = 0) => {
    if (activePlayer !== null) {
         logSession('chess', Date.now() - sessionStartRef.current, { result: 'reset' });
    }
    setTime1(t);
    setTime2(t);
    setMoves1(0);
    setMoves2(0);
    setIncrement(i);
    setActivePlayer(null);
    setIsPaused(false);
    setShowSettings(false);
    setWinner(null);
    sessionStartRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full flex flex-col p-2 sm:p-4 gap-2 bg-slate-950 overflow-hidden">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <Settings className="text-blue-500" /> Game Controls
            </h2>
            <div className="grid grid-cols-1 gap-3 mb-10">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Presets</label>
              {presets.map(p => (
                <button 
                  key={p.name}
                  onClick={() => resetClock(p.time, p.inc)}
                  className="bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 p-4 rounded-2xl text-left text-white font-bold transition-all flex justify-between items-center group"
                >
                  <span>{p.name}</span>
                  <Swords size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 font-bold hover:text-white hover:bg-white/10 transition-all"
            >
              Back to Game
            </button>
          </div>
        </div>
      )}

      {/* Player 2 Button (Top) */}
      <button 
        onClick={() => handleTap(2)}
        disabled={winner !== null || (activePlayer === 1)}
        className={`flex-[1.5] rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden transition-all duration-500 border-4 sm:border-8 ${
          activePlayer === 2 
          ? 'bg-blue-600 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.3)]' 
          : winner === 2 
            ? 'bg-green-600 border-green-400'
            : 'bg-slate-900 border-slate-800'
        } ${activePlayer === 1 ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center rotate-180">
          <div className="text-center">
             <div className="flex items-center justify-center gap-4 mb-4 opacity-40">
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full">
                    <Hash size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-white tabular-nums">{moves2}</span>
                </div>
                {activePlayer === 2 && (
                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                )}
             </div>
            <span className="text-8xl sm:text-[10rem] md:text-[12rem] font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
              {formatTime(time2)}
            </span>
            {winner === 2 && <p className="mt-4 text-2xl font-black text-white uppercase tracking-widest animate-bounce">Winner</p>}
            {winner === 1 && <p className="mt-4 text-2xl font-black text-white/50 uppercase tracking-widest">Time Out</p>}
          </div>
        </div>
      </button>

      {/* Modern Control Bar */}
      <div className="flex items-center justify-between gap-3 px-2 py-1 max-w-xl mx-auto w-full">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-4 bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-2xl border border-white/5 transition-all active:scale-90"
          title="Settings"
        >
          <Settings size={22} />
        </button>
        
        <div className="flex-1 flex items-center justify-center gap-2">
            <button 
                onClick={() => setIsPaused(!isPaused)}
                disabled={activePlayer === null || winner !== null}
                className={`flex-1 max-w-[200px] h-14 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 ${
                    isPaused 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-white/10 text-slate-300 border border-white/5 hover:bg-white/20'
                }`}
            >
                {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                {isPaused ? "RESUME" : "PAUSE"}
            </button>
        </div>

        <button 
          onClick={() => resetClock(300, 0)}
          className="p-4 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl border border-white/5 transition-all active:scale-90"
          title="Reset Game"
        >
          <RotateCcw size={22} />
        </button>
      </div>

      {/* Player 1 Button (Bottom) */}
      <button 
        onClick={() => handleTap(1)}
        disabled={winner !== null || (activePlayer === 2)}
        className={`flex-[1.5] rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden transition-all duration-500 border-4 sm:border-8 ${
          activePlayer === 1 
          ? 'bg-blue-600 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.3)]' 
          : winner === 1 
            ? 'bg-green-600 border-green-400'
            : 'bg-slate-900 border-slate-800'
        } ${activePlayer === 2 ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
             <div className="flex items-center justify-center gap-4 mb-4 opacity-40">
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full">
                    <Hash size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-white tabular-nums">{moves1}</span>
                </div>
                {activePlayer === 1 && (
                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                )}
             </div>
            <span className="text-8xl sm:text-[10rem] md:text-[12rem] font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
              {formatTime(time1)}
            </span>
            {winner === 1 && <p className="mt-4 text-2xl font-black text-white uppercase tracking-widest animate-bounce">Winner</p>}
            {winner === 2 && <p className="mt-4 text-2xl font-black text-white/50 uppercase tracking-widest">Time Out</p>}
          </div>
        </div>
        {activePlayer === null && !winner && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-pulse">
            <span className="text-sm sm:text-lg font-black text-white/40 uppercase tracking-[0.3em]">Tap to start</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChessClock;