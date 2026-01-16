
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ToolsDock from './components/ToolsDock';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Stopwatch from './components/tools/Stopwatch';
import Countdown from './components/tools/Countdown';
import IntervalTimer from './components/tools/IntervalTimer';
import DigitalClock from './components/tools/DigitalClock';
import AlarmClock from './components/tools/AlarmClock';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-inter">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/stopwatch" element={<Stopwatch key="stopwatch" mode="stopwatch" />} />
              <Route path="/countdown" element={<Countdown />} />
              <Route path="/laptimer" element={<Stopwatch key="laptimer" mode="laptimer" />} /> 
              <Route path="/interval" element={<IntervalTimer />} />
              <Route path="/clock" element={<DigitalClock />} />
              <Route path="/alarm" element={<AlarmClock />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <ToolsDock />
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
