
import React from 'react';
// Fix: Ensuring Link and useLocation are correctly imported as named exports from react-router-dom
import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants';

const ToolsDock: React.FC = () => {
  const location = useLocation();
  
  // Hide dock on Home and Login pages to keep them focused
  const isToolPage = TOOLS.some(tool => location.pathname === tool.path);
  if (!isToolPage && location.pathname !== '/dashboard') return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-fit">
      <nav className="flex items-center gap-2 p-2 bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = location.pathname === tool.path;
          
          return (
            <div key={tool.id} className="relative group">
              <Link
                to={tool.path}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
                {tool.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default ToolsDock;
