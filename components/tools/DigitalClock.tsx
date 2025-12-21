import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };
  
  const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
            <h1 className="text-[15vw] sm:text-9xl font-bold text-white tabular-nums leading-none tracking-tighter drop-shadow-2xl">
                {formatTime(time)}
            </h1>
            <p className="text-xl sm:text-3xl text-slate-400 mt-6 font-medium tracking-wide">
                {formatDate(time)}
            </p>
        </div>
    </div>
  );
};

export default DigitalClock;