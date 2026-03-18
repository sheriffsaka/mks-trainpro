import React from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle, Award } from 'lucide-react';

export const AccreditationsPage = () => {
  const accreditations = [
    {
      name: 'AoHT Member',
      image: 'https://res.cloudinary.com/di7okmjsx/image/upload/v1773223814/AoHT-Logo_u8w7tq.jpg', // Placeholder or actual if known
      description: 'Association of Healthcare Trainers member, ensuring the highest standards in healthcare education.',
      fallback: 'AoHT'
    },
    {
      name: 'Highfield Qualifications',
      image: 'https://res.cloudinary.com/di7okmjsx/image/upload/v1773223819/highfield-Logo_y12uxf.jpg',
      description: 'Approved centre for Highfield Qualifications, a global leader in compliance and work-based learning.',
      fallback: 'Highfield'
    },
    {
      name: 'Care Quality Commission',
      image: 'https://res.cloudinary.com/di7okmjsx/image/upload/v1773223819/traiing_course_fabncl.jpg',
      description: 'Aligned with CQC standards to provide training that meets regulatory requirements for care providers.',
      fallback: 'CQC'
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
            Thames Support UK is proud to be recognized by leading industry bodies, ensuring our training meets the highest standards of quality and compliance.
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
                  { title: 'Verified Certificates', desc: 'Every certificate issued by Thames Support is verifiable and recognized by employers.', icon: CheckCircle }
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
