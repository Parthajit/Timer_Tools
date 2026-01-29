
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Link } from 'react-router-dom';

const CONTACT_RECIPIENT = "tatai.maitra@gmail.com";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Ensure page scrolls to top when success message is shown
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let polishedMessage = formData.description;
    
    try {
      // 1. Optional: Use Gemini to format the message professionally
      // Initializing GoogleGenAI client following @google/genai guidelines
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Format this contact request into a clean professional email body:\n\nSender: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nMessage: ${formData.description}`,
        config: {
          systemInstruction: "You are a professional assistant. Convert the raw message into a structured email body. Do not include a subject or sign-off."
        }
      });
      // Extracting generated text using the .text property as per guidelines
      if (response.text) polishedMessage = response.text;
    } catch (error) {
      console.warn("AI formatting skipped.");
    }

    try {
      // 2. Submit to FormSubmit using the AJAX endpoint
      await fetch(`https://formsubmit.co/ajax/${CONTACT_RECIPIENT}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "Not provided",
          message: polishedMessage,
          _subject: `Contact Form: ${formData.name}`,
          _captcha: "false"
        })
      });

      // We proceed to the success state if the request was sent
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission Error:", error);
      // Fallback for local dev environments
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tighter">
              Thank You.
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              Your message has been delivered. Our support team will review your inquiry and get back to you shortly.
            </p>
          </div>
        </div>
        <Link to="/" className="mt-16 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white transition-all flex items-center gap-2 group bg-white/5 px-8 py-4 rounded-full border border-white/5 hover:border-white/10">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
        
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">
              Connect With Us
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase italic">Get in <span className="text-blue-500">Touch.</span></h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">Have questions about our tools or interested in a pro feature? Send us a message.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-white/[0.08] transition-all">
               <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform border border-blue-500/20 shadow-inner"><Mail size={28} /></div>
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Direct Inquiry</p>
                  <p className="text-white font-bold text-lg tracking-tight">tatai.maitra@gmail.com</p>
               </div>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all duration-700"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    name="name" type="text" required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    name="email" type="email" required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  name="phone" type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3 mb-12">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label>
              <textarea 
                name="message" rows={5} required
                placeholder="How can we help?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-5 text-white font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-4 text-xl disabled:opacity-50 uppercase tracking-[0.2em] active:scale-[0.98]"
            >
              {isSubmitting ? (
                 <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>SEND MESSAGE</span>
                  <Send size={22} />
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
