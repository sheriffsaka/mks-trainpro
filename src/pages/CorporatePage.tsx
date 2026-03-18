import React from 'react';
import { motion } from 'motion/react';
import { Shield, Users, BarChart3, Globe, CheckCircle2, ArrowRight, Mail, Phone } from 'lucide-react';

export const CorporatePage = () => {
  const benefits = [
    {
      title: 'Bulk Enrollment Discounts',
      description: 'Save up to 40% when enrolling 10 or more staff members in our accredited courses.',
      icon: <Users className="text-brand-blue" size={32} />
    },
    {
      title: 'Dedicated Admin Portal',
      description: 'Track staff progress, download certificates, and manage invoices from a single dashboard.',
      icon: <BarChart3 className="text-brand-blue" size={32} />
    },
    {
      title: 'Custom Training Solutions',
      description: 'We can tailor our training modules to meet your specific organizational requirements.',
      icon: <Shield className="text-brand-blue" size={32} />
    },
    {
      title: 'Compliance Tracking',
      description: 'Automated reminders for certificate renewals to ensure your team stays compliant.',
      icon: <CheckCircle2 className="text-brand-blue" size={32} />
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-blue py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover" 
            alt="Corporate Training" 
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-brand-red text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                For Organizations
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Empower Your Team with <span className="text-brand-red">Accredited</span> Training
              </h1>
              <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                Scalable training solutions for SAP, Software Testing, and professional services. 
                Trusted by leading organizations to maintain excellence and innovation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-brand-red text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-red-hover transition-all shadow-xl shadow-brand-red/20 flex items-center gap-2">
                  Request a Quote <ArrowRight size={20} />
                </button>
                <button className="bg-white/10 border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                  Download Brochure
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose MKS Consults for Your Team?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              We provide more than just training. We provide a comprehensive workforce development partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-blue rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-20 text-white">
              <h2 className="text-4xl font-bold mb-8">Get a Tailored Proposal</h2>
              <p className="text-slate-300 mb-12 text-lg">
                Tell us about your team's training needs, and our corporate accounts manager will get back to you within 24 hours with a customized plan.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Mail className="text-brand-red" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Email Us</p>
                    <p className="text-xl font-bold">corporate@mksconsultsltd.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Phone className="text-brand-red" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Call Us</p>
                    <p className="text-xl font-bold">020 8123 4567</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 bg-white p-12 lg:p-20">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" placeholder="Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                  <input type="email" className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Team Size</label>
                  <select className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all">
                    <option>1-10 Employees</option>
                    <option>11-50 Employees</option>
                    <option>51-200 Employees</option>
                    <option>200+ Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                  <textarea rows={4} className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" placeholder="Tell us about your training requirements..."></textarea>
                </div>
                <button className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-blue-hover transition-all shadow-xl shadow-brand-blue/20">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
