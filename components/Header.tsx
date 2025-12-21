import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Timer, User as UserIcon, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group select-none">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-900/20 group-hover:shadow-blue-600/40 transition-all duration-300 group-hover:-translate-y-0.5 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Timer size={22} strokeWidth={2.5} className="relative z-10 drop-shadow-sm" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:from-blue-200 group-hover:to-white transition-all tracking-tight">
                Timer
              </span>
            </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 border ${
                    location.pathname === '/dashboard' 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20' 
                    : 'bg-white/10 text-slate-100 hover:bg-white/20 border-white/10'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white outline-none">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500 group-hover:border-blue-500 transition-colors">
                      <UserIcon size={16} />
                    </div>
                  </button>
                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-xl border border-white/10 py-1 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <LogIn size={14} className="rotate-180" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/20"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;