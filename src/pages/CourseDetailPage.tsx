import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Clock, BookOpen, Award, CheckCircle2, Shield, Zap, ArrowRight, Loader2, MapPin, Video, Monitor, X, Copy, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/adminService';
import { motion, AnimatePresence } from 'motion/react';

import { MOCK_COURSES } from '../data/mockData';

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'platinum'>('standard');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPartPayment, setIsPartPayment] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, settingsRes] = await Promise.all([
          supabase
            .from('courses')
            .select('*, categories(*)')
            .eq('slug', slug)
            .single(),
          adminService.getSettings()
        ]);
        
        if (courseRes.data) {
          setCourse(courseRes.data);
        } else {
          const mock = MOCK_COURSES.find(c => c.slug === slug);
          setCourse(mock || null);
        }
        setSettings(settingsRes);
      } catch (err) {
        const mock = MOCK_COURSES.find(c => c.slug === slug);
        setCourse(mock || null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleEnrollClick = (partPayment: boolean) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsPartPayment(partPayment);
    setShowCheckout(true);
  };

  const handleEnrollment = async () => {
    if (!user || !course) return;

    try {
      setLoading(true);
      
      // Validate course ID is a real UUID (not a mock ID like '1', '2')
      if (!course.id || course.id.length < 30) {
        throw new Error('This course is not yet available for enrollment in the database. Please try a different course or contact support.');
      }

      const amountToPay = isPartPayment ? partPaymentAmount : totalPrice;

      // 1. Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          package_type: selectedPackage,
          status: 'pending'
        })
        .select()
        .single();

      if (enrollmentError) {
        console.error('Enrollment Error:', enrollmentError);
        throw new Error(`Failed to create enrollment: ${enrollmentError.message}`);
      }

      // 2. Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          enrollment_id: enrollment.id,
          user_id: user.id,
          amount: amountToPay,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          is_installment: isPartPayment
        });

      if (paymentError) {
        console.error('Payment Error:', paymentError);
        throw new Error(`Failed to create payment record: ${paymentError.message}`);
      }

      // 3. If part payment, create installment record
      if (isPartPayment) {
        const { error: installmentError } = await supabase
          .from('installment_records')
          .insert({
            enrollment_id: enrollment.id,
            total_amount: totalPrice,
            paid_amount: partPaymentAmount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
            status: 'active'
          });
        
        if (installmentError) {
          console.error('Installment Error:', installmentError);
          // We don't throw here to avoid failing the whole process if only installment record fails
        }
      }

      alert('Enrollment request submitted! We will verify your payment and activate your course shortly.');
      setShowCheckout(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Enrollment process error:', err);
      alert(err.message || 'Failed to submit enrollment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'virtual': return <Monitor size={20} className="text-brand-red" />;
      case 'physical': return <MapPin size={20} className="text-brand-red" />;
      case 'vod': return <Video size={20} className="text-brand-red" />;
      default: return <BookOpen size={20} className="text-brand-red" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'virtual': return 'Virtual (Live) Class';
      case 'physical': return 'Physical Class';
      case 'vod': return 'Video on Demand (Self-paced)';
      default: return mode;
    }
  };

  const totalPrice = selectedPackage === 'platinum' ? course?.price_platinum : course?.price_standard;
  const partPaymentAmount = totalPrice / 2;

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
              {getModeIcon(course.mode)}
              <span>{getModeLabel(course.mode)}</span>
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

            {course.video_url && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Preview</h2>
                <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
                  <video 
                    src={course.video_url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
              </section>
            )}

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
                  onClick={() => handleEnrollClick(false)}
                  className="w-full bg-brand-red py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
                >
                  Pay Full Amount (£{totalPrice})
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => handleEnrollClick(true)}
                  className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  Pay in 2 Installments (£{partPaymentAmount.toFixed(2)} each)
                </button>
              </div>
              
              <p className="mt-6 text-center text-xs text-slate-400">
                Secure payment via Bank Transfer.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-bold text-slate-900">Checkout</h3>
                <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Course</span>
                    <span className="font-bold text-slate-900">{course.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Payment Type</span>
                    <span className="font-bold text-slate-900">{isPartPayment ? 'Part Payment (1st Installment)' : 'Full Payment'}</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 font-bold">Amount to Pay</span>
                    <span className="text-2xl font-bold text-brand-blue">£{(isPartPayment ? partPaymentAmount : totalPrice).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="text-brand-blue" size={18} />
                    Bank Transfer Details
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Bank Name', value: settings.bank_name || 'Barclays Bank' },
                      { label: 'Account Name', value: settings.account_name || 'MKS Consults Ltd' },
                      { label: 'Account Number', value: settings.account_number || '12345678' },
                      { label: 'Sort Code', value: settings.sort_code || '20-30-40' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="font-bold text-slate-900">{item.value}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(item.value);
                            alert(`${item.label} copied!`);
                          }}
                          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Please use your <strong>Full Name</strong> as the payment reference. Once transferred, please send the proof of payment to <strong>{settings.support_email || 'support@mksconsultsltd.com'}</strong>.
                  </p>
                </div>

                <button 
                  onClick={handleEnrollment}
                  disabled={loading}
                  className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'I Have Made the Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
