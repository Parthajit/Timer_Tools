
import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, Heart } from 'lucide-react';
import { TOOLS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-24 sm:pb-12 relative overflow-hidden">
      {/* Decorative Gradient Overlay */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-blue-600/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <Timer size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Timer</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm">
              Professional timing solutions designed for precision and productivity. Empowering users to master their time through clean tools and deep analytics.
            </p>
          </div>

          {/* Quick Tools */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Available Tools</h3>
            <ul className="grid grid-cols-2 gap-4">
              {TOOLS.map(tool => (
                <li key={tool.id}>
                  <Link to={tool.path} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Platform</h3>
            <ul className="grid grid-cols-2 gap-4">
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Analytics</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Timer. Built for Performance.
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-black uppercase tracking-tighter">
            <span>Crafted with</span>
            <Heart size={10} className="text-red-500 fill-red-500" />
            <span>by Timer Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
