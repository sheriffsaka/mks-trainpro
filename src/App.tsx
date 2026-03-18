import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Chatbot } from './components/Chatbot';
import { useAuthStore } from './store/authStore';
import { supabase } from './services/supabaseClient';
import { AuthPage } from './pages/AuthPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { CorporatePage } from './pages/CorporatePage';
import { AboutPage } from './pages/AboutPage';
import { AccreditationsPage } from './pages/AccreditationsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { InstructorPage } from './pages/InstructorPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { QuizPage } from './pages/QuizPage';
import { MOCK_COURSES, MOCK_FAQS } from './data/mockData';
import { GraduationCap, ArrowRight, CheckCircle2, Award, BookOpen, Users, Plus, Minus, Star, Quote, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { adminService } from './services/adminService';

const Home = () => {
  const { settings } = useSettings();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>(MOCK_FAQS);
  const [courses, setCourses] = useState<any[]>(MOCK_COURSES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faqData, courseData] = await Promise.all([
          adminService.getFAQs(),
          supabase.from('courses').select('*, categories(*)').eq('is_published', true).limit(6)
        ]);

        if (faqData && faqData.length > 0) {
          setFaqs(faqData);
        }
        if (courseData.data && courseData.data.length > 0) {
          setCourses(courseData.data);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
  }, []);

  const featuredCourses = courses.slice(0, 6);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <main className="overflow-hidden">
      <Hero />
      <motion.section 
        {...fadeIn}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Core Training Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Specialized training programs designed to meet industry standards and accelerate your career.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'SAP Training', desc: 'Comprehensive SAP ERP training from beginner to consultant level.', icon: '💻', slug: 'sap-training' },
              { title: 'Software Testing', desc: 'Master manual and automation testing with industry tools.', icon: '🧪', slug: 'software-testing' }
            ].map((cat, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-6">{cat.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.title}</h3>
                <p className="text-slate-600 mb-6">{cat.desc}</p>
                <Link 
                  to={`/courses?category=${cat.slug}`} 
                  className="text-brand-blue font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  View Courses <span className="text-lg">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Courses Section */}
      <motion.section 
        {...fadeIn}
        className="py-24 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Courses</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our most popular and highly-rated training programs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredCourses.map((course, i) => (
              <motion.div 
                key={`${course.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-blue flex items-center gap-1">
                    <Star size={12} className="fill-brand-blue" />
                    Featured
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-xs font-bold text-brand-red uppercase tracking-wider mb-2">
                    {course.categories.name}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-brand-blue font-black text-xl">
                      £{course.price_standard.toFixed(2)}
                    </div>
                    <Link 
                      to={`/courses/${course.slug}`}
                      className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-blue transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              View All Courses <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section 
        {...fadeIn}
        className="py-24 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Tech Training" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold text-slate-900">98% Success Rate</span>
                </div>
                <p className="text-slate-500 text-sm">Join thousands of students who have passed their exams with flying colors.</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8">{settings.about_title || 'Why MKS Consultants?'}</h2>
              <div className="space-y-8">
                {settings.about_content ? (
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {settings.about_content}
                  </div>
                ) : (
                  [
                    { title: 'Industry-Leading Expertise', desc: 'Our trainers are SAP and QA veterans with years of hands-on experience in global enterprises.', icon: <Award className="text-brand-blue" /> },
                    { title: 'Practical Learning', desc: 'We focus on real-world scenarios and hands-on projects to ensure you are job-ready.', icon: <BookOpen className="text-brand-blue" /> },
                    { title: 'Career Acceleration', desc: 'Our graduates work at top-tier companies. We provide CV support and interview prep.', icon: <Users className="text-brand-blue" /> },
                    { title: 'Flexible Delivery', desc: 'Choose between live online sessions or self-paced learning to fit your schedule.', icon: <GraduationCap className="text-brand-blue" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Silicon Valley Standard: Trusted By */}
      <motion.section 
        {...fadeIn}
        className="py-24 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Clients Marquee */}
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-12">Trusted by Leading Organizations</h2>
          </div>
        </div>

        {/* Infinite Marquee for Clients */}
        <div className="relative flex overflow-x-hidden group">
          <div className="flex py-12 whitespace-nowrap [animation:marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-16 md:gap-32 px-8 md:px-16">
                {[
                  'SAP SE',
                  'Accenture',
                  'Capgemini',
                  'Deloitte',
                  'IBM',
                  'Infosys',
                  'Tata Consultancy Services'
                ].map((client, j) => (
                  <div key={j} className="flex items-center gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue font-bold">
                      {client.charAt(0)}
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{client}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
          <Link to="/clients" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all group">
            View all client success stories <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        {...fadeIn}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Students Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Real stories from real students who have transformed their careers with our training.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "David Okoro",
                role: "SAP Consultant",
                text: "The SAP S/4HANA training at MKS Consults was a game-changer for my career. The hands-on projects and expert guidance helped me land a consultant role within months.",
                avatar: "https://i.pravatar.cc/150?u=david"
              },
              {
                name: "Linda Smith",
                role: "QA Engineer",
                text: "Excellent Software Testing course. The focus on automation tools like Selenium and Jira was exactly what I needed to upgrade my skills.",
                avatar: "https://i.pravatar.cc/150?u=linda"
              },
              {
                name: "James Wilson",
                role: "SAP End User",
                text: "I was new to SAP, but the beginner course was so well-structured that I felt confident using the system in my new job. Highly recommend MKS Consults!",
                avatar: "https://i.pravatar.cc/150?u=james"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative">
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-brand-blue text-brand-blue" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        {...fadeIn}
        className="py-24 bg-slate-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about our training programs and support.</p>
          </div>

          <div className="space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq, i) => (
                <div 
                  key={faq.id || i} 
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-900 pr-8">{faq.question}</span>
                    <div className={`shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                      {openFaq === i ? <Minus className="text-brand-red" size={20} /> : <Plus className="text-brand-blue" size={20} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500">No FAQs available at the moment.</p>
            )}
          </div>

          <div className="mt-12 p-8 bg-brand-blue/5 rounded-3xl border border-brand-blue/10 text-center">
            <p className="text-slate-700 font-medium mb-4">Still have questions?</p>
            <Link to="/contact" className="text-brand-blue font-bold hover:underline">
              Contact our support team →
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section 
        {...fadeIn}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-blue rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to start your professional journey?</h2>
                <p className="text-slate-200 text-lg mb-10">Join thousands of successful students who have transformed their careers with MKS Consults Ltd.</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="bg-white text-brand-blue px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg">Get Started Now</Link>
                  <Link to="/contact" className="bg-brand-red text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all border border-brand-red/30 shadow-lg">Contact Us</Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 w-full max-w-sm shadow-inner">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-medium">Standard Package</span>
                      <span className="font-bold">£199</span>
                    </div>
                    <div className="h-px bg-white/20" />
                    <div className="flex justify-between items-center text-white">
                      <span className="font-medium">Platinum Package</span>
                      <span className="font-bold">£299</span>
                    </div>
                    <div className="h-px bg-white/20" />
                    <p className="text-slate-300 text-sm italic">* Installment plans available from £50 deposit</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </motion.section>

      {/* Accreditations Section - Moved under CTA */}
      <motion.section 
        {...fadeIn}
        className="py-16 bg-slate-50 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Accredited & Recognized By</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {[
                { name: 'SAP Certified Partner', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80', label: 'SAP ERP Standards' },
                { name: 'ISTQB Accredited', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80', label: 'Software Testing' },
                { name: 'BCS Member', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=80', label: 'Chartered IT Institute' }
              ].map((acc, i) => (
                <Link key={i} to="/accreditations" className="flex flex-col items-center group">
                  <div className="h-12 md:h-16 flex items-center justify-center mb-2">
                    {acc.img ? (
                      <img src={acc.img} alt={acc.name} className="h-full w-auto object-contain" />
                    ) : (
                      <span className="text-2xl font-black text-slate-900">{acc.name}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-blue transition-colors uppercase tracking-widest">{acc.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
  </main>
);
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const { setUser, fetchProfile } = useAuthStore();
  const { settings } = useSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/accreditations" element={<AccreditationsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/register" element={<AuthPage type="register" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/instructor" element={<InstructorPage />} />
          <Route path="/courses/:slug/player" element={<CoursePlayerPage />} />
          <Route path="/courses/:slug/quiz/:quizId" element={<QuizPage />} />
        </Routes>
        <Chatbot />
        
        <footer className="bg-slate-950 text-slate-400 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
                    alt="MKS Logo" 
                    className="h-10 w-auto object-contain brightness-0 invert"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold text-2xl tracking-tight text-white">
                    {settings.site_name ? settings.site_name.toUpperCase() : 'MKS CONSULTS LIMITED'}
                  </span>
                </div>
                <p className="max-w-sm text-slate-500 leading-relaxed text-lg">
                  MKS Consults Ltd is a leading provider of professional training services, dedicated to excellence in SAP and Software Testing education.
                </p>
                {settings.office_address && (
                  <div className="mt-6 flex items-start gap-3 text-slate-500">
                    <MapPin size={20} className="shrink-0 text-brand-blue" />
                    <p className="text-sm">{settings.office_address}</p>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {settings.support_email && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail size={18} className="text-brand-blue" />
                      <a href={`mailto:${settings.support_email}`} className="text-sm hover:text-white transition-colors">{settings.support_email}</a>
                    </div>
                  )}
                  {settings.contact_number && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={18} className="text-brand-blue" />
                      <a href={`tel:${settings.contact_number}`} className="text-sm hover:text-white transition-colors">{settings.contact_number}</a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Quick Links</h4>
                <ul className="space-y-4">
                  <li><Link to="/courses" className="hover:text-brand-red transition-colors">All Courses</Link></li>
                  <li><Link to="/corporate" className="hover:text-brand-red transition-colors">Corporate Training</Link></li>
                  <li><Link to="/accreditations" className="hover:text-brand-red transition-colors">Accreditations</Link></li>
                  <li><Link to="/clients" className="hover:text-brand-red transition-colors">Our Clients</Link></li>
                  <li><Link to="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Legal</h4>
                <ul className="space-y-4">
                  <li><Link to="/privacy" className="hover:text-brand-red transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-brand-red transition-colors">Terms of Service</Link></li>
                  <li><Link to="/refund" className="hover:text-brand-red transition-colors">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
                  alt="MKS Logo" 
                  className="h-6 w-auto object-contain brightness-0 invert opacity-50"
                  referrerPolicy="no-referrer"
                />
                <p className="text-sm">© 2026 {settings.site_name || 'MKS Consults Ltd'}. All rights reserved.</p>
              </div>
              <div className="flex gap-6">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-brand-blue transition-all">
                    <Facebook size={20} />
                  </a>
                )}
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-brand-blue transition-all">
                    <Twitter size={20} />
                  </a>
                )}
                <a href="#" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-brand-blue transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-brand-blue transition-all">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
