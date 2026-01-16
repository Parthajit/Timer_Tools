import React from 'react';
import { Target, Lightbulb, Users, BarChart3, ShieldCheck } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
      <div className="text-center mb-24">
        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
          Helping People Use Time <br /> <span className="text-blue-500">More Effectively.</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
          We are dedicated to building reliable online timer tools combined with <b>performance analytics</b> that help users understand and improve how they use their time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
        <div>
          <h2 className="text-3xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
             <Target className="text-blue-500" /> OUR PURPOSE
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Timers are often treated as basic utilities. We believe they should be <b>powerful productivity tools</b>. That belief inspired us to create a platform where time tracking meets insight, consistency, and measurable progress.
          </p>
          <div className="space-y-4">
            {[
              { text: 'Accurate timing tools', icon: <ShieldCheck size={18} /> },
              { text: 'Clear performance data', icon: <BarChart3 size={18} /> },
              { text: 'Long-term progress tracking', icon: <Target size={18} /> },
              { text: 'A distraction-free experience', icon: <Lightbulb size={18} /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all">
                <div className="text-blue-500">{item.icon}</div>
                <span className="text-white font-bold tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-white/10 rounded-[3rem] p-10 flex flex-col justify-center">
          <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4">The Vision</h2>
          <blockquote className="text-2xl font-black text-white leading-tight italic">
            "We don’t just help you track time — we help you improve how you use it."
          </blockquote>
        </div>
      </div>

      <div className="mb-32">
        <h2 className="text-3xl font-black text-white mb-12 tracking-tight text-center">WHAT WE PROVIDE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Full Timer Suite</h3>
              <p className="text-slate-400 text-sm">A full suite of <b>professional-grade</b> timer tools designed for high-precision tasks.</p>
           </div>
           <div className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Personalized Dashboard</h3>
              <p className="text-slate-400 text-sm">Deep insights into your habits through <b>performance analytics</b> and history tracking.</p>
           </div>
           <div className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Weekly/Monthly Reports</h3>
              <p className="text-slate-400 text-sm">Understand long-term trends with <b>detailed usage reports</b> generated automatically.</p>
           </div>
           <div className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Continuous Improvements</h3>
              <p className="text-slate-400 text-sm">A platform that evolves <b>based on user needs</b> and modern productivity research.</p>
           </div>
        </div>
      </div>

      <div className="text-center p-12 bg-white/5 rounded-[3rem] border border-white/10">
        <h2 className="text-3xl font-black text-white mb-6">Built with the User in Mind</h2>
        <p className="text-slate-400 leading-relaxed font-medium mb-0">
          We focus on <b>simplicity, accuracy, and reliability</b>. Every feature is designed to support long-term improvement, whether you’re managing daily tasks or structured training sessions.
        </p>
      </div>
    </div>
  );
};

export default About;