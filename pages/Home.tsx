
import React from 'react';
// Fix: Ensuring Link is correctly imported as a named export from react-router-dom
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Hero Section */}
      <div className="text-center mb-24 max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-8xl font-bold mb-8 tracking-tighter drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-indigo-600">
          Timer
        </h1>
        <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10">
          Professional, free timing tools for everyone. Track your productivity and history on your personalized Dashboard.
        </p>
        
        {!user && (
           <Link 
             to="/login"
             className="inline-block text-base font-medium text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-500/30 hover:border-blue-400 pb-0.5"
           >
             Log in to see your performance analytics
           </Link>
        )}
      </div>

      {/* Tools Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-10 text-center">All Available Tools</h2>
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
