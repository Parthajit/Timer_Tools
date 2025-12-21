
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Zap, Shield, Crown } from 'lucide-react';
// Fix: Ensuring useNavigate is correctly imported as a named export from react-router-dom
import { useNavigate } from 'react-router-dom';

const Subscription: React.FC = () => {
  const { user, startTrial, upgradeSubscription } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    upgradeSubscription();
    navigate('/dashboard');
  };

  const handleTrial = () => {
    startTrial();
    navigate('/dashboard');
  };

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Log in to view plans</h2>
            <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">Log In</button>
        </div>
    );
  }

  const isPro = user.plan === 'pro';
  const isTrial = user.plan === 'trial';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Upgrade your productivity</h1>
        <p className="text-xl text-slate-500">
          Get advanced analytics, unlimited history, and premium tools.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Shine effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 rounded-[2rem] blur opacity-25"></div>
        
        <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-500 uppercase tracking-wider">Pro Plan</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">$50</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                <Crown size={28} />
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited timer history',
                'Advanced performance analytics',
                'Custom themes & backgrounds',
                'Priority support',
                'Ad-free experience'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              {isPro ? (
                 <div className="w-full bg-green-100 text-green-700 py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <Check size={20} /> Active Plan
                 </div>
              ) : (
                <>
                  <button
                    onClick={handleSubscribe}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    Subscribe Now
                  </button>
                  
                  {!isTrial && (
                      <button
                        onClick={handleTrial}
                        className="w-full bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Zap size={20} className="text-amber-500" />
                        Start 3-Day Free Trial
                      </button>
                  )}
                  {isTrial && (
                      <div className="text-center text-sm font-medium text-amber-600 py-2">
                          Trial Active. Ends {new Date(user.trialEndDate!).toLocaleDateString()}.
                      </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="bg-slate-50 px-8 py-4 text-center text-sm text-slate-500 border-t border-slate-100 flex items-center justify-center gap-2">
            <Shield size={14} /> Secure payment via Stripe
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
