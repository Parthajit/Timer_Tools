import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ToolsDock from './components/ToolsDock';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stopwatch from './components/tools/Stopwatch';
import Countdown from './components/tools/Countdown';
import IntervalTimer from './components/tools/IntervalTimer';
import DigitalClock from './components/tools/DigitalClock';
import { AuthProvider } from './contexts/AuthContext';

const PlaceholderTool = ({ name }: { name: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{name}</h2>
        <p className="text-slate-400">This tool is currently under development.</p>
        <div className="mt-8 p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500 max-w-md backdrop-blur-sm">
            Feature coming soon. <br/> Try the <strong>Stopwatch</strong>, <strong>Countdown</strong>, or <strong>Interval Timer</strong>.
        </div>
    </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
          <Header />
          
          <main className="flex-grow pb-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/stopwatch" element={<Stopwatch key="stopwatch" mode="stopwatch" />} />
              <Route path="/countdown" element={<Countdown />} />
              
              <Route path="/laptimer" element={<Stopwatch key="laptimer" mode="laptimer" />} /> 
              
              <Route path="/interval" element={<IntervalTimer />} />
              <Route path="/clock" element={<DigitalClock />} />
              
              <Route path="/alarm" element={<PlaceholderTool name="Alarm Clock" />} />
              <Route path="/metronome" element={<PlaceholderTool name="Metronome" />} />
              <Route path="/chess" element={<PlaceholderTool name="Chess Clock" />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <ToolsDock />
          
          <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5">
              &copy; {new Date().getFullYear()} Timer. All rights reserved.
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;