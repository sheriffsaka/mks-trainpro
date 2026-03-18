import React from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle, Award } from 'lucide-react';

export const AccreditationsPage = () => {
  const accreditations = [
    {
      name: 'SAP Certified Partner',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80', // Placeholder
      description: 'Recognized as a provider of high-quality SAP training, aligned with global SAP standards.',
      fallback: 'SAP'
    },
    {
      name: 'ISTQB Accredited',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80', // Placeholder
      description: 'Our Software Testing courses are aligned with ISTQB standards, the world leader in software testing certification.',
      fallback: 'ISTQB'
    },
    {
      name: 'BCS Member',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=80', // Placeholder
      description: 'Member of The Chartered Institute for IT, committed to making IT good for society.',
      fallback: 'BCS'
    }
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
            Our Accreditations
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-200 max-w-3xl mx-auto"
          >
            MKS Consults Ltd is proud to be recognized by leading industry bodies, ensuring our training meets the highest standards of quality and compliance.
          </motion.p>
        </div>
      </section>

      {/* Accreditations Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {accreditations.map((acc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 text-center hover:shadow-xl transition-all"
              >
                <div className="bg-white w-32 h-32 rounded-3xl shadow-sm mx-auto mb-8 flex items-center justify-center p-4 overflow-hidden">
                  {acc.image ? (
                    <img src={acc.image} alt={acc.name} className="max-h-full w-auto object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-brand-blue">{acc.fallback}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{acc.name}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {acc.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Commitment to Quality</h2>
              <div className="space-y-6">
                {[
                  { title: 'Rigorous Standards', desc: 'All our courses are audited regularly to ensure they meet the latest industry requirements.', icon: Shield },
                  { title: 'Expert Trainers', desc: 'Our instructors are certified professionals with years of practical experience in their fields.', icon: Award },
                  { title: 'Verified Certificates', desc: 'Every certificate issued by MKS Consults is verifiable and recognized by employers.', icon: CheckCircle }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue shrink-0 h-fit">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-brand-blue rounded-[3rem] p-12 text-white relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-6">Need more information?</h3>
              <p className="text-slate-200 mb-10">If you require specific accreditation details for your organization, please get in touch with our compliance team.</p>
              <button className="bg-white text-brand-blue px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                Contact Compliance
              </button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
