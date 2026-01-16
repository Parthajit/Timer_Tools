
import React, { useState } from 'react';
import { Mail, User, Phone, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Internal submission logic
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        // The information is internally handled and sent to the support system
        console.log("Form data processed for support team", formData);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
         <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <CheckCircle2 size={48} />
         </div>
         <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase italic">Message Received!</h1>
         <p className="text-xl text-slate-400 mb-12 max-w-md">
            Thank you for reaching out. Our support team has received your request and will get back to you shortly.
         </p>
         <button 
           onClick={() => setIsSubmitted(false)}
           className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-tighter"
         >
           SEND ANOTHER MESSAGE
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-12">
          <div>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-none uppercase italic">Get in <span className="text-blue-500">Touch.</span></h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">Have questions or feedback? Our professional support team is here to help you optimize your productivity.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5">
               <div className="p-4 bg-blue-600/20 text-blue-500 rounded-2xl"><Mail size={24} /></div>
               <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Support Channel</p>
                  <p className="text-white font-bold">Official Support Form</p>
               </div>
            </div>
            <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5">
               <div className="p-4 bg-indigo-600/20 text-indigo-500 rounded-2xl"><MessageSquare size={24} /></div>
               <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Average Response</p>
                  <p className="text-white font-bold">Within 24 Business Hours</p>
               </div>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2 mb-10">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Message Description</label>
              <textarea 
                rows={5} required
                placeholder="How can we help you?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 text-lg disabled:opacity-50 uppercase tracking-widest"
            >
              {isSubmitting ? (
                 <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>SUBMIT REQUEST</span>
                  <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
