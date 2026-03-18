import React from 'react';
import { Shield, Target, Heart, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

export const AboutPage = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-brand-blue py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 max-w-3xl">
            {settings.about_title || 'Empowering Your Career in'} <br />
            <span className="text-brand-red">SAP & Software Testing.</span>
          </h1>
          <p className="text-slate-200 text-xl max-w-2xl leading-relaxed">
            {settings.about_content || 'MKS Consults Ltd is a premier training provider dedicated to bridging the gap between academic knowledge and industry requirements in the tech sector.'}
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Information Section - Moved up */}
      <section className="py-24 bg-slate-50 text-slate-900 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-slate-900">About MKS Consults Ltd</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                MKS Consults Ltd is a leading IT training and consultancy firm based in the United Kingdom. We specialize in providing high-end training solutions for SAP ERP and Software Testing.
              </p>
              <p>
                With a team of industry experts and a commitment to excellence, we have helped hundreds of professionals transition into rewarding careers in the technology sector. Our curriculum is designed to be practical, hands-on, and aligned with current market demands.
              </p>
            </div>
          </div>
        </div>
        {/* Subtle decorative background element */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl" />
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="bg-brand-blue/5 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Target className="text-brand-blue" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                To provide accessible, high-quality technical training that empowers individuals to achieve their professional goals and meet the evolving needs of the global tech industry.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-brand-red/5 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Shield className="text-brand-red" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Vision</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                To be the global leader in SAP and Software Testing education, recognized for our innovative teaching methods and the exceptional quality of our graduates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Services</h2>
            <p className="text-slate-500">Specialized training and career development solutions.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'SAP Training', desc: 'From basic navigation to advanced module configuration and consulting.', icon: <Award className="text-brand-blue" /> },
              { title: 'Software Testing', desc: 'Comprehensive manual and automation testing programs using industry-standard tools.', icon: <Shield className="text-brand-blue" /> }
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Excellence', desc: 'We strive for the highest standards in our curriculum and student support.', icon: <Award className="text-brand-blue" /> },
              { title: 'Integrity', desc: 'We operate with transparency and honesty in all our professional relationships.', icon: <Shield className="text-brand-blue" /> },
              { title: 'Compassion', desc: 'We understand the human element in care training and reflect it in our approach.', icon: <Heart className="text-brand-red" /> }
            ].map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Leadership</h2>
            <p className="text-slate-500">Expert professionals dedicated to your success.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: 'Sarah Johnson', role: 'Head of Healthcare Training', img: 'https://i.pravatar.cc/300?u=sarah' },
              { name: 'David Miller', role: 'SIA Compliance Director', img: 'https://i.pravatar.cc/300?u=david' },
              { name: 'Emma Williams', role: 'Student Success Manager', img: 'https://i.pravatar.cc/300?u=emma' }
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className="aspect-square rounded-[3rem] overflow-hidden mb-6 relative">
                  <img src={member.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={member.name} />
                  <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-brand-red font-semibold text-sm uppercase tracking-wider">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Ready to start your journey?</h2>
            <div className="flex justify-center gap-4">
              <Link to="/courses" className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all flex items-center gap-2">
                Explore Courses <ArrowRight size={20} />
              </Link>
              <a href="mailto:info@mksconsultsltd.com" className="bg-white/10 border border-white/20 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
