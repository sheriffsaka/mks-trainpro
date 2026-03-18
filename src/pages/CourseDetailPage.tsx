import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Clock, BookOpen, Award, CheckCircle2, Shield, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import { MOCK_COURSES } from '../data/mockData';

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'platinum'>('standard');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, categories(*)')
          .eq('slug', slug)
          .single();
        
        if (data) {
          setCourse(data);
        } else {
          // Fallback to mock data
          const mock = MOCK_COURSES.find(c => c.slug === slug);
          setCourse(mock || null);
        }
      } catch (err) {
        const mock = MOCK_COURSES.find(c => c.slug === slug);
        setCourse(mock || null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const handleEnroll = async (isInstallment: boolean) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          packageType: selectedPackage,
          isInstallment,
          userId: user.id,
          userEmail: user.email
        })
      });

      const { id } = await response.json();
      // In a real app, you'd use Stripe.js to redirect
      // window.location.href = `https://checkout.stripe.com/pay/${id}`;
      alert(`Redirecting to Stripe Checkout for ${selectedPackage} package... (Mocked)`);
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-brand-blue py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={course.image_url || `https://picsum.photos/seed/${course.id}/1920/1080`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-block bg-brand-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            {course.categories?.name}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 max-w-4xl">{course.title}</h1>
          
          <div className="flex flex-wrap gap-8 text-slate-300">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-brand-red" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-brand-red" />
              <span>{course.format}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={20} className="text-brand-red" />
              <span>Accredited Certification</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Overview</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{course.overview || course.description}</p>
            </section>

            <section className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[2rem]">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="text-brand-blue" size={20} />
                  Who It's For
                </h3>
                <ul className="space-y-3">
                  {(course.who_it_is_for || ['Aspiring professionals', 'Career changers']).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                      <CheckCircle2 size={16} className="text-brand-blue mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem]">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="text-brand-blue" size={20} />
                  Learning Outcomes
                </h3>
                <ul className="space-y-3">
                  {(course.learning_outcomes || ['Industry knowledge', 'Practical skills']).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                      <CheckCircle2 size={16} className="text-brand-blue mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Package Comparison */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Choose Your Package</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { 
                    id: 'standard', 
                    name: 'Standard', 
                    price: course.price_standard,
                    features: ['Training Access', 'Course Materials', 'Standard Certification']
                  },
                  { 
                    id: 'platinum', 
                    name: 'Platinum', 
                    price: course.price_platinum,
                    features: ['Everything in Standard', 'Priority Support', 'Free Retake', 'Career Guidance', 'CV Review', 'Priority Certificate Processing']
                  }
                ].map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id as any)}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative ${
                      selectedPackage === pkg.id 
                        ? 'border-brand-blue bg-brand-blue/5' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    {pkg.id === 'platinum' && (
                      <div className="absolute -top-3 right-8 bg-brand-red text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-slate-900 mb-6">£{pkg.price}</div>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={16} className="text-brand-blue" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-3 rounded-xl font-bold text-center transition-all ${
                      selectedPackage === pkg.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Checkout */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-blue rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Enrollment Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-400">
                  <span>Course</span>
                  <span className="text-white text-right ml-4">{course.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Package</span>
                  <span className="text-white capitalize">{selectedPackage}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Price</span>
                  <span className="text-3xl font-bold">£{selectedPackage === 'platinum' ? course.price_platinum : course.price_standard}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleEnroll(false)}
                  className="w-full bg-brand-red py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
                >
                  Pay Full Amount
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => handleEnroll(true)}
                  className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  Pay £50 Deposit
                </button>
              </div>
              
              <p className="mt-6 text-center text-xs text-slate-400">
                Secure payment powered by Stripe & PayPal.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
