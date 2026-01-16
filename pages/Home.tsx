import React from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { useAuth } from '../contexts/AuthContext';
import Stopwatch from '../components/tools/Stopwatch';
import Countdown from '../components/tools/Countdown';
import { Zap, Activity, MousePointer2 } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-8xl font-black mb-8 tracking-tighter drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-indigo-600 uppercase italic">
          Timer
        </h1>
        <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto mb-10">
          Professional, free timing tools for everyone. Track your productivity and focus with deep performance analytics.
        </p>
        
        {!user && (
           <Link 
             to="/login"
             className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20 bg-blue-500/5 px-6 py-3 rounded-2xl hover:bg-blue-500/10"
           >
             <Zap size={16} />
             Log in for performance analytics
           </Link>
        )}
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
            <Activity size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Instant Stopwatch</span>
          </div>
          <Stopwatch mode="stopwatch" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <MousePointer2 size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Quick Countdown</span>
          </div>
          <Countdown />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Advanced Timing Suite</h2>
          <span className="text-[10px] font-bold text-slate-700 uppercase">Select a specialized tool</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
        </div>
      </div>
    </main>
  );
};

export default Home;