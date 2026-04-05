import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  FileQuestion, 
  Menu, 
  X,
  Award,
  ArrowLeft,
  Loader2,
  Shield
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { MOCK_COURSES } from '../data/mockData';

export const CoursePlayerPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        
        if (courseError) throw courseError;
        
        let finalCourse = courseData;

        // Fallback to mock if not found in DB
        if (!finalCourse) {
          const mock = MOCK_COURSES.find(c => c.slug === slug);
          if (mock) {
            finalCourse = mock;
          } else {
            setError('Course not found. Please check the URL or return to the dashboard.');
            setLoading(false);
            return;
          }
        }

        setCourse(finalCourse);

        // 2. Verify enrollment and payment status (skip for admins)
        if (!isAdmin && finalCourse.id) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id, status, user_id, course_id')
            .eq('course_id', finalCourse.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (enrollmentError) {
            console.error('Enrollment verification error:', enrollmentError);
            throw enrollmentError;
          }

          if (!enrollmentData) {
            setError('You are not enrolled in this course. Please enroll first to gain access.');
            setLoading(false);
            return;
          }

          if (enrollmentData.status !== 'active' && enrollmentData.status !== 'completed') {
            setError(`Your enrollment status is "${enrollmentData.status}". Access is only granted to active enrollments. Please wait for administrator approval if you recently made a payment.`);
            setLoading(false);
            return;
          }
        }

      } catch (err: any) {
        console.error('Error fetching course or verifying enrollment:', err);
        setError(err.message || 'An unexpected error occurred while loading the course.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, user, profile, navigate, isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-brand-red" size={40} /></div>;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-2xl">
          <div className="bg-brand-red/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="text-brand-red" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {error}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            {isAdmin && (
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4">
                Admin Note: You are seeing this because of a system error or missing course data.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!course) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Course not found</div>;

  // Mock modules if not present
  const modules = course.modules || [
    {
      title: 'Course Introduction',
      lessons: [
        { 
          title: 'Welcome & Overview', 
          type: 'video', 
          duration: 'Intro', 
          completed: true,
          content: course.overview || 'Welcome to this course. We are excited to have you here.'
        },
        { 
          title: 'Course Description', 
          type: 'reading', 
          duration: '5 mins', 
          completed: false,
          content: course.description || 'This course covers everything you need to know about the subject.'
        },
      ]
    },
    {
      title: 'Learning Materials',
      lessons: [
        { 
          title: 'Resource Guide', 
          type: 'reading', 
          duration: '10 mins', 
          completed: false,
          content: 'Please check the downloadable resources for this course.'
        }
      ]
    }
  ];

  const currentLesson = modules[activeModule].lessons[activeLesson];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-slate-900 border-r border-white/5 flex flex-col h-full relative z-20"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={18} />
                <span className="text-sm font-bold">Back to Dashboard</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h1 className="text-lg font-bold line-clamp-2 mb-2">{course.title}</h1>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-red w-1/3" />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">35% Complete</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {modules.map((module: any, mIdx: number) => (
                <div key={mIdx} className="border-b border-white/5">
                  <button 
                    className="w-full p-6 text-left hover:bg-white/5 transition-colors flex justify-between items-center group"
                    onClick={() => setActiveModule(mIdx)}
                  >
                    <div>
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mb-1">Module {mIdx + 1}</p>
                      <h3 className={`font-bold text-sm ${activeModule === mIdx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {module.title}
                      </h3>
                    </div>
                    <ChevronRight size={16} className={`transition-transform ${activeModule === mIdx ? 'rotate-90 text-brand-red' : 'text-slate-600'}`} />
                  </button>

                  <AnimatePresence>
                    {activeModule === mIdx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/20"
                      >
                        {module.lessons.map((lesson: any, lIdx: number) => (
                          <button
                            key={lIdx}
                            onClick={() => setActiveLesson(lIdx)}
                            className={`w-full p-4 pl-8 text-left flex items-center gap-4 hover:bg-white/5 transition-colors ${
                              activeModule === mIdx && activeLesson === lIdx ? 'bg-brand-red/10 border-l-4 border-brand-red' : ''
                            }`}
                          >
                            <div className={`shrink-0 ${lesson.completed ? 'text-emerald-500' : 'text-slate-600'}`}>
                              {lesson.completed ? <CheckCircle2 size={18} /> : (
                                lesson.type === 'video' ? <Play size={18} /> : 
                                lesson.type === 'quiz' ? <FileQuestion size={18} /> : <FileText size={18} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs font-medium ${activeModule === mIdx && activeLesson === lIdx ? 'text-white' : 'text-slate-400'}`}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-slate-600 font-bold">{lesson.duration}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Player Area */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>Next:</span>
              <span className="text-white">Safety Protocols</span>
            </div>
            <button className="bg-brand-red text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-red-hover transition-all">
              Complete & Next
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-5xl mx-auto">
            {currentLesson.type === 'video' ? (
              <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative group">
                {course.video_url ? (
                  <video 
                    src={course.video_url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <img 
                      src={course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80`} 
                      className="w-full h-full object-cover opacity-40" 
                      alt="Video Placeholder" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center shadow-2xl shadow-brand-red/40 hover:scale-110 transition-transform">
                        <Play size={40} fill="white" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : currentLesson.type === 'reading' ? (
              <div className="bg-slate-900 p-12 rounded-[3rem] border border-white/5 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">{currentLesson.title}</h2>
                <div className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed">
                  {currentLesson.content ? (
                    <p>{currentLesson.content}</p>
                  ) : (
                    <>
                      <p>Welcome to this lesson on {course.title}. In this section, we will explore the core concepts and practical applications of the subject matter.</p>
                      <p>As you progress through the course, remember that consistent practice and review are key to mastering these skills. Use the resources provided, including the downloadable documents and quizzes, to reinforce your learning.</p>
                    </>
                  )}
                  
                  {course.document_url && (
                    <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="bg-brand-red/20 p-4 rounded-2xl">
                          <FileText className="text-brand-red" size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">Course Material & Resources</p>
                          <p className="text-sm text-slate-500">Download the PDF guide for this module</p>
                        </div>
                      </div>
                      <a 
                        href={course.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-brand-red hover:text-white transition-all shadow-xl"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : currentLesson.type === 'quiz' ? (
              <div className="bg-slate-900 p-12 rounded-[3rem] border border-white/5 text-center max-w-2xl mx-auto">
                <div className="bg-brand-red/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FileQuestion className="text-brand-red" size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-4">{currentLesson.title}</h2>
                <p className="text-slate-400 mb-10 leading-relaxed">
                  This quiz covers the material from the previous lessons. You need 80% to pass and move to the next module.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Questions</p>
                    <p className="text-xl font-bold">15</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Time Limit</p>
                    <p className="text-xl font-bold">20 Mins</p>
                  </div>
                </div>
                <Link 
                  to={`/courses/${slug}/quiz/1`}
                  className="inline-flex items-center gap-2 bg-brand-red text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all shadow-xl shadow-brand-red/20"
                >
                  Start Quiz <ArrowRight size={20} />
                </Link>
              </div>
            ) : (
              <div className="bg-white text-slate-900 p-12 lg:p-20 rounded-[3rem] shadow-2xl prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-8">{currentLesson.title}</h1>
                <p className="text-lg leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <h2 className="text-2xl font-bold mt-12 mb-6">Key Concepts</h2>
                <ul className="space-y-4 mb-12">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-blue mt-1 shrink-0" size={20} />
                    <span>Understanding the SAP ERP ecosystem and business processes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-blue mt-1 shrink-0" size={20} />
                    <span>Identifying key testing phases in the software development lifecycle.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-blue mt-1 shrink-0" size={20} />
                    <span>Implementing best practices for SAP implementation and QA automation.</span>
                  </li>
                </ul>
                <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-brand-blue italic text-slate-600">
                  "Expertise in SAP and Software Testing is the foundation of digital transformation in modern enterprises."
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (activeLesson > 0) setActiveLesson(activeLesson - 1);
                  else if (activeModule > 0) {
                    setActiveModule(activeModule - 1);
                    setActiveLesson(modules[activeModule - 1].lessons.length - 1);
                  }
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"
              >
                <ChevronLeft size={20} />
                Previous Lesson
              </button>
              <button 
                onClick={() => {
                  if (activeLesson < modules[activeModule].lessons.length - 1) setActiveLesson(activeLesson + 1);
                  else if (activeModule < modules.length - 1) {
                    setActiveModule(activeModule + 1);
                    setActiveLesson(0);
                  }
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"
              >
                Next Lesson
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
