
import React, { useState } from 'react';
// Fix: Ensuring useNavigate is correctly imported from react-router-dom
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Timer, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    
    try {
      if (mode === 'forgot') {
        if (!email) return;
        await resetPassword(email);
        setStatusMsg({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
        // Stay on page to show success message
      } else {
        if (!email || !password) return;
        
        if (mode === 'login') {
          await login(email, password);
        } else {
          await signup(email, password);
        }
        navigate('/'); // Redirect to Home
      }
    } catch (error: any) {
      console.error("Authentication error:", error.code, error.message);
      let errorText = 'Action failed. Please check your credentials.';
      
      // Handle Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorText = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorText = 'Email already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        errorText = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorText = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorText = 'Too many failed attempts. Please try again later.';
      }
      
      setStatusMsg({ text: errorText, type: 'error' });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10 border border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 mb-6 border border-white/10">
            <Timer size={32} strokeWidth={2.5} className="drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="text-slate-400 mt-2">
            {mode === 'login' && 'Enter your details to access your tools.'}
            {mode === 'signup' && 'Start your journey with Timer today.'}
            {mode === 'forgot' && 'Enter your email to receive reset instructions.'}
          </p>
        </div>

        {statusMsg && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {statusMsg.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-600"
              placeholder="you@example.com"
            />
          </div>
          
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                {mode === 'login' && (
                    <button 
                        type="button"
                        onClick={() => { setMode('forgot'); setStatusMsg(null); }}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                        Forgot Password?
                    </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/20"
          >
            {mode === 'login' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'forgot' && 'Send Reset Link'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-slate-400">
          {mode === 'login' && (
              <>
                Don't have an account?
                <button 
                    type="button"
                    onClick={() => { setMode('signup'); setStatusMsg(null); }}
                    className="text-blue-400 font-medium cursor-pointer hover:text-blue-300 ml-1"
                >
                    Sign up for free
                </button>
              </>
          )}
          {mode === 'signup' && (
              <>
                Already have an account?
                <button 
                    type="button"
                    onClick={() => { setMode('login'); setStatusMsg(null); }}
                    className="text-blue-400 font-medium cursor-pointer hover:text-blue-300 ml-1"
                >
                    Sign in
                </button>
              </>
          )}
          {mode === 'forgot' && (
              <button 
                  type="button"
                  onClick={() => { setMode('login'); setStatusMsg(null); }}
                  className="text-blue-400 font-medium cursor-pointer hover:text-blue-300 ml-1"
              >
                  Back to Sign In
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
