import React from 'react';
import { ScrollText } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-blue-600/20 text-blue-500 rounded-2xl">
          <ScrollText size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Terms & Conditions</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Last Updated: December 2025</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 sm:p-16 space-y-12">
        <p className="text-slate-300 font-medium leading-relaxed italic border-l-4 border-blue-500 pl-6">
          By accessing or using this website and its services, you agree to comply with the following Terms and Conditions. Please review them carefully.
        </p>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">01.</span> AGREEMENT TO TERMS
          </h2>
          <p className="text-slate-400 leading-relaxed">
            By using our website, you confirm that you have read, understood, and accepted these Terms and Conditions. If you do not agree, you must <b>discontinue use</b> of the website immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">02.</span> SERVICES PROVIDED
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            We offer online timing tools including stopwatch, countdown timer, interval timer, lap timer, alarm clock, and digital clock, along with optional user dashboards and performance analytics.
          </p>
          <p className="text-slate-400 font-bold">All services are provided for general informational and personal use only.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">03.</span> USER ACCOUNTS
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Access to analytics and performance tracking features may require account registration. You are <b>solely responsible</b> for maintaining the confidentiality of your account credentials and for all activities conducted under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">04.</span> PERFORMANCE DATA AND ANALYTICS
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Analytics are generated based on tool usage and are intended to help users track historical performance trends. While we strive for accuracy, <b>we do not guarantee</b> that analytics are error-free or suitable for professional, medical, or competitive decision-making.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">05.</span> ACCEPTABLE USE
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Users agree not to misuse the website, interfere with its operation, or use the services for any <b>unlawful or harmful</b> purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">06.</span> INTELLECTUAL PROPERTY RIGHTS
          </h2>
          <p className="text-slate-400 leading-relaxed">
            All content, tools, software, branding, and design elements on this website are the <b>exclusive intellectual property</b> of the website owner and are protected by applicable laws. Unauthorized reproduction or distribution is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
             <span className="text-blue-500">07.</span> LIMITATION OF LIABILITY
          </h2>
          <p className="text-slate-400 leading-relaxed">
            We are <b>not liable</b> for any direct, indirect, or incidental damages resulting from the use or inability to use our services, including data loss or performance-related outcomes.
          </p>
        </section>

        <section className="pt-8 border-t border-white/5">
          <p className="text-sm text-slate-500 font-medium">
            For questions regarding these Terms and Conditions, please contact us through the website’s official support channels.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;