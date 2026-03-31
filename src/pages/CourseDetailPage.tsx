import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Clock, BookOpen, Award, CheckCircle2, Shield, Zap, ArrowRight, Loader2, MapPin, Video, Monitor, X, Copy, AlertCircle, Download, Building2, CreditCard } from 'lucide-react';
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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [existingEnrollment, setExistingEnrollment] = useState<any>(null);

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
          
          // Check for existing enrollment
          if (user) {
            const { data: enrollment } = await supabase
              .from('enrollments')
              .select('*, payments(*), installment_records(*)')
              .eq('course_id', courseRes.data.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            setExistingEnrollment(enrollment);
          }
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
  }, [slug, user]);

  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paypal'>('bank_transfer');

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

      if (!receiptFile && paymentMethod === 'bank_transfer') {
        throw new Error('Please upload your payment proof (receipt) before submitting.');
      }

      setUploading(true);
      
      let receiptUrl = '';
      if (receiptFile) {
        // Upload receipt
        receiptUrl = await adminService.uploadFile(receiptFile, 'payment-proofs', user.id);
      }

      let amountToPay = isPartPayment ? partPaymentAmount : totalPrice;
      
      // If user is paying balance for an existing installment enrollment
      if (existingEnrollment && existingEnrollment.installment_records?.[0]) {
        const record = existingEnrollment.installment_records[0];
        const balance = record.total_amount - record.paid_amount;
        if (!isPartPayment) {
          amountToPay = balance;
        }
      }

      if (existingEnrollment) {
        // 1. Create payment record for existing enrollment
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            enrollment_id: existingEnrollment.id,
            user_id: user.id,
            amount: amountToPay,
            payment_method: paymentMethod,
            payment_status: 'pending',
            is_installment: isPartPayment,
            receipt_url: receiptUrl
          });

        if (paymentError) {
          console.error('Payment Error:', paymentError);
          throw new Error(`Failed to create payment record: ${paymentError.message}`);
        }

        alert('Payment proof submitted! We will verify your payment and update your account shortly.');
      } else {
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
            payment_method: paymentMethod,
            payment_status: 'pending',
            is_installment: isPartPayment,
            receipt_url: receiptUrl
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
          }
        }

        alert('Enrollment request submitted! We will verify your payment and activate your course shortly.');
      }

      setShowCheckout(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Enrollment process error:', err);
      alert(err.message || 'Failed to submit enrollment request. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
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
                {existingEnrollment ? (
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center">
                    {existingEnrollment.status === 'active' ? (
                      <>
                        <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={32} />
                        <h4 className="font-bold mb-2 text-white">Already Enrolled</h4>
                        <p className="text-sm text-slate-400 mb-6">You have full access to this course.</p>
                        
                        {existingEnrollment.installment_records?.[0] && 
                         existingEnrollment.installment_records[0].paid_amount < existingEnrollment.installment_records[0].total_amount && (
                          <div className="mb-6 p-4 bg-brand-red/20 rounded-xl border border-brand-red/30">
                            <p className="text-[10px] font-bold text-brand-red uppercase mb-1">Balance Due</p>
                            <p className="text-xl font-bold text-white mb-4">£{(existingEnrollment.installment_records[0].total_amount - existingEnrollment.installment_records[0].paid_amount).toFixed(2)}</p>
                            <button 
                              onClick={() => handleEnrollClick(true)}
                              className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-hover transition-all"
                            >
                              Pay Balance
                            </button>
                          </div>
                        )}

                        <Link to={`/courses/${slug}/player`} className="block w-full bg-white text-brand-blue py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                          Go to Course Player
                        </Link>
                      </>
                    ) : (
                      <>
                        <Clock className="mx-auto mb-4 text-amber-400" size={32} />
                        <h4 className="font-bold mb-2 text-white">Enrollment Pending</h4>
                        <p className="text-sm text-slate-400 mb-6">We are currently verifying your payment proof.</p>
                        <button disabled className="w-full bg-white/20 text-white/50 py-4 rounded-2xl font-bold cursor-not-allowed">
                          Verification in Progress
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
                    Select Payment Method
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'bank_transfer' 
                          ? 'border-brand-blue bg-brand-blue/5' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        paymentMethod === 'bank_transfer' ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <span className={`text-sm font-bold ${paymentMethod === 'bank_transfer' ? 'text-brand-blue' : 'text-slate-600'}`}>
                        Bank Transfer
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'paypal' 
                          ? 'border-brand-blue bg-brand-blue/5' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        paymentMethod === 'paypal' ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <CreditCard size={20} />
                      </div>
                      <span className={`text-sm font-bold ${paymentMethod === 'paypal' ? 'text-brand-blue' : 'text-slate-600'}`}>
                        PayPal
                      </span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'bank_transfer' ? (
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

                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                      <AlertCircle className="text-amber-600 shrink-0" size={20} />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Please use your <strong>Full Name</strong> as the payment reference. Once transferred, please upload the proof of payment below.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Upload Payment Proof (Receipt)</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="hidden" 
                          id="receipt-upload"
                        />
                        <label 
                          htmlFor="receipt-upload"
                          className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${
                            receiptFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50'
                          }`}
                        >
                          {receiptFile ? (
                            <>
                              <CheckCircle2 className="text-emerald-500 mb-2" size={32} />
                              <p className="text-sm font-bold text-emerald-700">{receiptFile.name}</p>
                              <p className="text-xs text-emerald-600">Click to change file</p>
                            </>
                          ) : (
                            <>
                              <Download className="text-slate-400 mb-2 group-hover:text-brand-blue transition-colors" size={32} />
                              <p className="text-sm font-bold text-slate-600">Click to select receipt</p>
                              <p className="text-xs text-slate-400">JPG, PNG or PDF (Max 5MB)</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/10 flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">PayPal Payment</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Click the button below to pay securely via PayPal. After payment, click "Submit Enrollment Request" to notify us.
                        </p>
                      </div>
                      <a 
                        href={`https://www.paypal.com/paypalme/mksconsults/${(isPartPayment ? partPaymentAmount : totalPrice).toFixed(2)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#0070ba] text-white py-4 rounded-2xl font-bold hover:bg-[#005ea6] transition-all flex items-center justify-center gap-2"
                      >
                        Pay with PayPal
                        <ArrowRight size={20} />
                      </a>
                    </div>
                    
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Once you've completed the PayPal payment, click the button below to submit your enrollment request. We will verify the transaction using your email address.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleEnrollment}
                  disabled={loading || uploading}
                  className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading || uploading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Enrollment Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
