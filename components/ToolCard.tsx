
import React from 'react';
// Fix: Ensuring Link is correctly imported as a named export from react-router-dom
import { Link } from 'react-router-dom';
import { ToolConfig } from '../types';

interface ToolCardProps {
  tool: ToolConfig;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const Icon = tool.icon;

  return (
    <Link 
      to={tool.path}
      className="group relative h-full block p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 shadow-sm backdrop-blur-sm"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:shadow-blue-500/20 transition-all border border-white/5`}>
        <Icon className="text-blue-400 w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={2} />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">
        {tool.name}
      </h3>
      
      <p className="text-slate-400 leading-relaxed font-medium text-sm">
        {tool.description}
      </p>
    </Link>
  );
};

export default ToolCard;
