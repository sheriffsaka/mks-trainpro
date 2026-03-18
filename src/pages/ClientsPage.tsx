import React from 'react';
import { motion } from 'motion/react';
import { Building2, Users, Briefcase, Quote } from 'lucide-react';

export const ClientsPage = () => {
  const clients = [
    { name: 'Royal Borough of Greenwich', type: 'Local Authority', fallback: 'Greenwich' },
    { name: 'London Borough of Bexley', type: 'Local Authority', fallback: 'Bexley' },
    { name: 'Lewisham Council', type: 'Local Authority', fallback: 'Lewisham' },
    { name: 'NHS Trusts', type: 'Healthcare', fallback: 'NHS' },
    { name: 'Private Care Groups', type: 'Healthcare', fallback: 'Care Groups' },
    { name: 'Security Agencies', type: 'Security', fallback: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-brand-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Our Clients & Partners
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-200 max-w-3xl mx-auto"
          >
            We work with leading local authorities, healthcare providers, and security firms across the UK to deliver world-class training.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Clients', value: '200+', icon: Building2 },
              { label: 'Students Trained', value: '15k+', icon: Users },
              { label: 'Corporate Partners', value: '50+', icon: Briefcase },
              { label: 'Success Rate', value: '98%', icon: Quote }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-brand-blue">
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Organizations</h2>
            <p className="text-slate-600">A selection of the public and private sector organizations we support.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {clients.map((client, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="bg-slate-50 h-24 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-blue/5 transition-colors">
                  <span className="text-lg font-bold text-slate-400 group-hover:text-brand-blue transition-colors">
                    {client.fallback}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{client.type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-brand-blue text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="mx-auto mb-8 text-brand-red opacity-50" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight">
              "Thames Support UK has been instrumental in upskilling our workforce. Their blended learning approach and expert trainers have significantly improved our service quality."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full" />
              <div className="text-left">
                <div className="font-bold">Director of Operations</div>
                <div className="text-slate-300 text-sm">Leading Healthcare Provider</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-white rounded-full" />
        </div>
      </section>
    </div>
  );
};
