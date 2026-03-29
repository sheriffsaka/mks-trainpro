import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { 
  BookOpen, 
  Clock, 
  Award, 
  CreditCard, 
  Bell, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  ArrowRight,
  PlayCircle,
  FileQuestion,
  History,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  Loader2,
  Monitor,
  MapPin,
  Video,
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import { MOCK_ENROLLMENTS, MOCK_ANNOUNCEMENTS } from '../data/mockData';
import { adminService } from '../services/adminService';
import { progressService, ProgressData } from '../services/progressService';

export const DashboardPage = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>(MOCK_ANNOUNCEMENTS);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: ''
  });
  const [progressDetails, setProgressDetails] = useState<{[key: string]: ProgressData}>({});
  const [quizzesMap, setQuizzesMap] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        
        // Fetch base data
        const [enrollmentsData, announcementsRes, certificatesData, paymentsData] = await Promise.all([
          adminService.getUserEnrollments(user.id),
          adminService.getAnnouncements(),
          adminService.getUserCertificates(user.id),
          adminService.getUserPayments(user.id)
        ]);
        
        setEnrollments(enrollmentsData || []);
        setCertificates(certificatesData || []);
        setPayments(paymentsData || []);
        
        // Fetch schedules for enrolled courses
        if (enrollmentsData && enrollmentsData.length > 0) {
          const courseIds = enrollmentsData.map((e: any) => e.course_id);
          const schedulesData = await adminService.getSchedules();
          // Filter schedules for user's courses
          const userSchedules = (schedulesData || []).filter((s: any) => courseIds.includes(s.course_id));
          setSchedules(userSchedules);
        }
        
        // Fetch installments based on user's enrollments
        if (enrollmentsData && enrollmentsData.length > 0) {
          const userEnrollmentIds = enrollmentsData.map((e: any) => e.id);
          const installmentsData = await adminService.getUserInstallments(user.id, userEnrollmentIds);
          setInstallments(installmentsData || []);
        }

        // Fetch progress and quizzes for each enrollment
        const progressMap: {[key: string]: ProgressData} = {};
        const qMap: {[key: string]: any[]} = {};
        await Promise.all((enrollmentsData || []).map(async (e: any) => {
          const [progress, quizzes] = await Promise.all([
            progressService.calculateProgress(user.id, e.course_id),
            adminService.getQuizzesByCourse(e.course_id)
          ]);
          progressMap[e.course_id] = progress;
          qMap[e.course_id] = quizzes;
        }));
        setProgressDetails(progressMap);
        setQuizzesMap(qMap);

        if (announcementsRes && announcementsRes.length > 0) {
          setAnnouncements(announcementsRes);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.message?.includes('JWT') || err.status === 401) {
          // Session might be expired
          supabase.auth.signOut();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleDownloadCertificate = (courseTitle: string) => {
    alert(`Generating PDF Certificate for ${courseTitle}... This may take a moment for Standard members, but is instant for Platinum!`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading Invoice ${invoiceId} as PDF...`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  const stats = [
    { label: 'Active Courses', value: enrollments.filter(e => e.status === 'active').length, icon: <BookOpen size={24} />, color: 'bg-brand-blue/10 text-brand-blue' },
    { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, icon: <CheckCircle2 size={24} />, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Certificates', value: certificates.length, icon: <Award size={24} />, color: 'bg-brand-red/10 text-brand-red' },
    { label: 'Quiz Attempts', value: 0, icon: <FileQuestion size={24} />, color: 'bg-amber-100 text-amber-600' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-brand-blue/20">
                {profile?.full_name?.charAt(0) || (profile?.role === 'admin' ? 'A' : 'S')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome, {profile?.full_name?.split(' ')[0] || (profile?.role === 'admin' ? 'Admin' : 'Student')}!
                </h1>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <span className="flex items-center gap-1">
                    <UserIcon size={14} /> {profile?.role === 'admin' ? 'Admin' : 'Student'} ID: #{user.id.slice(0, 8)}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    profile?.role === 'admin' 
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                      : profile?.package_type === 'platinum' 
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {profile?.role === 'admin' ? 'Administrator' : `${profile?.package_type || 'Standard'} Member`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-red rounded-full border-2 border-white" />
              </button>
              <Link to="/courses" className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20">
                Enroll in New Course
              </Link>
            </div>
          </div>

          {/* Sub-navigation as Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
            {[
              { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
              { id: 'schedules', label: 'Class Schedule', icon: <Calendar size={20} /> },
              { id: 'quizzes', label: 'Quizzes', icon: <FileQuestion size={20} /> },
              { id: 'certificates', label: 'Certificates', icon: <Award size={20} /> },
              { id: 'billing', label: 'Billing & Invoices', icon: <CreditCard size={20} /> },
              { id: 'profile', label: 'Profile Settings', icon: <Settings size={20} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`${activeTab === tab.id ? 'text-white' : 'text-brand-blue'}`}>
                  {tab.icon}
                </div>
                <span className="text-xs font-bold text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid - Only show for My Courses tab */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'courses' && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Enrolled Courses</h2>
                    <div className="flex gap-2">
                      <button className="text-xs font-bold px-3 py-1 rounded-lg bg-brand-blue text-white">All</button>
                      <button className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">Active</button>
                      <button className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">Completed</button>
                    </div>
                  </div>
                  
                  {enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                          <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden shrink-0 relative">
                              <img src={enrollment.courses?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <PlayCircle className="text-white" size={48} />
                              </div>
                            </div>
                            <div className="flex-1 w-full">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest block">
                                      {enrollment.package_type} Package
                                    </span>
                                    {enrollment.status === 'pending' && (
                                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                        <Clock size={10} /> Pending Approval
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-slate-900 text-xl group-hover:text-brand-blue transition-colors">{enrollment.courses?.title}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  enrollment.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                                  enrollment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {enrollment.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-6 text-slate-400 text-xs mb-6">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} />
                                  <span>{enrollment.courses?.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileQuestion size={14} />
                                  <span>{quizzesMap[enrollment.course_id]?.length || 0} Quizzes</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Award size={14} />
                                  <span>Accredited</span>
                                </div>
                              </div>
                              
                              {/* Progress Section */}
                              <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                  <span className="text-slate-500">Overall Progress</span>
                                  <span className="text-brand-blue">{progressDetails[enrollment.course_id]?.overallProgress.toFixed(0) || enrollment.progress}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressDetails[enrollment.course_id]?.overallProgress || enrollment.progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-brand-blue rounded-full shadow-[0_0_10px_rgba(0,51,102,0.3)]" 
                                  />
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Attendance</p>
                                    <p className="text-sm font-bold text-slate-900">{progressDetails[enrollment.course_id]?.attendanceRate.toFixed(0) || 0}%</p>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assessments</p>
                                    <p className="text-sm font-bold text-slate-900">{progressDetails[enrollment.course_id]?.assessmentAverage.toFixed(0) || 0}%</p>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assignments</p>
                                    <p className="text-sm font-bold text-slate-900">{progressDetails[enrollment.course_id]?.assignmentsCompleted.toFixed(0) || 0}%</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {enrollment.status === 'active' ? (
                                <Link 
                                  to={`/courses/${enrollment.courses?.slug}/player`}
                                  className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-brand-blue transition-all shadow-lg shadow-slate-900/10"
                                >
                                  <ArrowRight size={24} />
                                </Link>
                              ) : (
                                <div className="bg-slate-100 text-slate-400 w-14 h-14 rounded-2xl flex items-center justify-center cursor-not-allowed" title="Pending Admin Approval">
                                  <Shield size={24} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <BookOpen className="text-slate-300" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">No courses yet</h3>
                      <p className="text-slate-500 mb-10 max-w-md mx-auto">You haven't enrolled in any courses. Start your learning journey today and transform your career!</p>
                      <Link to="/courses" className="inline-flex items-center gap-2 bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-xl shadow-brand-blue/20">
                        Explore Courses <ArrowRight size={20} />
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'schedules' && (
                <motion.div
                  key="schedules"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Class Schedule</h2>
                    <div className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold">
                      {schedules.length} Upcoming Classes
                    </div>
                  </div>

                  {schedules.length > 0 ? (
                    <div className="space-y-6">
                      {schedules.map((schedule) => {
                        const startDate = new Date(schedule.start_time);
                        const endDate = new Date(schedule.end_time);
                        const isToday = startDate.toDateString() === new Date().toDateString();

                        return (
                          <div key={schedule.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${isToday ? 'border-brand-blue ring-1 ring-brand-blue/20' : 'border-slate-100'}`}>
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                              <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-50 text-slate-400'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">{startDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
                                <span className="text-2xl font-black">{startDate.getDate()}</span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isToday ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {isToday ? 'LIVE TODAY' : 'UPCOMING'}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {schedule.courses?.title}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{schedule.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{schedule.description}</p>
                                
                                <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-400">
                                  <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-brand-blue" />
                                    <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <UserIcon size={14} className="text-brand-blue" />
                                    <span>Instructor: {schedule.profiles?.full_name || 'TBA'}</span>
                                  </div>
                                  {schedule.meeting_link && (
                                    <div className="flex items-center gap-2">
                                      <Video size={14} className="text-brand-red" />
                                      <span className="text-brand-red">Virtual Class</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="shrink-0 w-full md:w-auto">
                                {schedule.meeting_link ? (
                                  <a 
                                    href={schedule.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-blue/20"
                                  >
                                    <Video size={20} /> Join Class
                                  </a>
                                ) : (
                                  <div className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-bold border border-slate-100 flex items-center justify-center gap-2">
                                    <MapPin size={20} /> Physical Class
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center">
                      <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Calendar className="text-slate-300" size={48} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">No Scheduled Classes</h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                        There are no live or virtual classes scheduled for your enrolled courses at the moment. Check back later for updates from your instructors.
                      </p>
                      <Link to="/courses" className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-xl shadow-brand-blue/20">
                        Explore More Courses
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'quizzes' && (
                <motion.div
                  key="quizzes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Course Quizzes</h2>
                  {enrollments.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {enrollments.map((e) => (
                        <div key={e.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-start mb-6">
                            <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                              <FileQuestion className="text-amber-500" size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {quizzesMap[e.course_id]?.length || 0} Quizzes Available
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-2">{e.courses?.title}</h3>
                          <p className="text-xs text-slate-500 mb-6 line-clamp-2">
                            {quizzesMap[e.course_id]?.length > 0 
                              ? `You have ${quizzesMap[e.course_id].length} quizzes available for this course.`
                              : 'No quizzes available for this course yet.'}
                          </p>
                          {quizzesMap[e.course_id]?.length > 0 && e.status === 'active' ? (
                            <div className="space-y-2">
                              {quizzesMap[e.course_id].map((quiz) => (
                                <Link 
                                  key={quiz.id}
                                  to={`/courses/${e.courses?.slug}/quiz/${quiz.id}`}
                                  className="w-full bg-slate-50 text-slate-900 py-3 px-4 rounded-xl font-bold hover:bg-brand-blue hover:text-white transition-all flex items-center justify-between group"
                                >
                                  <span className="text-sm">{quiz.title}</span>
                                  <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                                </Link>
                              ))}
                            </div>
                          ) : e.status === 'pending' ? (
                            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                              <Clock size={16} /> Quizzes will be available after enrollment approval.
                            </div>
                          ) : (
                            <button 
                              disabled
                              className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed text-center block"
                            >
                              No Quizzes
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center">
                      <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <FileQuestion className="text-amber-500" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">No Quizzes Available</h3>
                      <p className="text-slate-500 mb-8 max-w-md mx-auto">Enroll in a course to access quizzes and assessments.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-slate-900">My Certificates</h2>
                  {certificates.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                          <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Award className="text-emerald-500" size={32} />
                          </div>
                          <h3 className="font-bold text-slate-900 mb-2">{cert.courses?.courses?.title || 'Course Certificate'}</h3>
                          <p className="text-xs text-slate-500 mb-6">Issued on {new Date(cert.issued_at).toLocaleDateString()}</p>
                          <a 
                            href={cert.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2"
                          >
                            <Download size={18} /> Download PDF
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center">
                      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Award className="text-emerald-500" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">No Certificates Yet</h3>
                      <p className="text-slate-500 mb-8 max-w-md mx-auto">Complete your courses and pass your final assessments to earn your accredited certificates.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Billing & Invoices</h2>
                  
                  {installments.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {installments.map((inst) => (
                        <div key={inst.id} className="bg-brand-blue/5 border border-brand-blue/10 p-6 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Installment Plan</p>
                              <h4 className="font-bold text-slate-900">{inst.enrollments?.courses?.title}</h4>
                            </div>
                            <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-1 rounded-lg">ACTIVE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance Due</p>
                              <p className="text-xl font-bold text-brand-red">£{(inst.total_amount - inst.paid_amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Next Payment</p>
                              <p className="text-sm font-bold text-slate-900">{new Date(inst.next_payment_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-blue" 
                              style={{ width: `${(inst.paid_amount / inst.total_amount) * 100}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[10px] text-slate-500 text-right font-bold">
                            {((inst.paid_amount / inst.total_amount) * 100).toFixed(0)}% Paid
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Total Outstanding</p>
                        <h3 className="text-3xl font-bold text-slate-900">
                          £{(
                            payments.filter(p => p.payment_status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0) +
                            installments.reduce((acc, curr) => acc + (curr.total_amount - curr.paid_amount), 0)
                          ).toFixed(2)}
                        </h3>
                      </div>
                      <Link to="/courses" className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all">
                        Make a Payment
                      </Link>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 mb-4">Recent Invoices</h4>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                            <tr>
                              <th className="px-6 py-4">Invoice #</th>
                              <th className="px-6 py-4">Course</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {payments.length > 0 ? payments.map((payment) => (
                              <tr key={payment.id} className="text-sm text-slate-600 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold">INV-{payment.id.slice(0, 8).toUpperCase()}</td>
                                <td className="px-6 py-4">{payment.enrollments?.courses?.title || 'Course Payment'}</td>
                                <td className="px-6 py-4">{new Date(payment.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">£{Number(payment.amount).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${
                                    payment.payment_status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 
                                    payment.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-brand-red/10 text-brand-red'
                                  }`}>
                                    {payment.payment_status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => handleDownloadInvoice(`INV-${payment.id.slice(0, 8).toUpperCase()}`)}
                                    className="text-brand-blue hover:text-brand-blue-hover"
                                  >
                                    <Download size={18} />
                                  </button>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                  No invoices found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-6 py-2 rounded-xl font-bold transition-all ${
                        isEditing ? 'bg-slate-100 text-slate-600' : 'bg-brand-blue text-white'
                      }`}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .update(editForm)
                          .eq('id', user.id);
                        
                        if (error) throw error;
                        alert('Profile updated successfully!');
                        setIsEditing(false);
                        // Refresh profile in store if needed, or rely on real-time if implemented
                        window.location.reload(); 
                      } catch (err) {
                        console.error('Error updating profile:', err);
                        alert('Failed to update profile. Please try again.');
                      }
                    }} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Full Name</label>
                          <input 
                            type="text"
                            disabled={!isEditing}
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Email Address</label>
                          <input 
                            type="email"
                            disabled
                            value={user.email}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Phone Number</label>
                          <input 
                            type="tel"
                            disabled={!isEditing}
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Membership Tier</label>
                          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-slate-900 capitalize">{profile?.package_type || 'Standard'}</span>
                            <Link to="/courses" className="text-brand-blue text-xs font-bold hover:underline">Upgrade</Link>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Address</label>
                        <textarea 
                          disabled={!isEditing}
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none disabled:opacity-60 resize-none"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex justify-end pt-4">
                          <button 
                            type="submit"
                            className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Account Security</h3>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-900">Change Password</p>
                        <p className="text-sm text-slate-500">Update your account password regularly to stay secure.</p>
                      </div>
                      <button className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-brand-blue transition-all">
                        Update Password
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Announcements & Balance */}
          <aside className="space-y-8">
            <div className="bg-brand-blue rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-8">Learning Support</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <AlertCircle className="text-brand-red" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">Outstanding Balance</p>
                      <p className="text-3xl font-bold">
                        £{(
                          payments.filter(p => p.payment_status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0) +
                          installments.reduce((acc, curr) => acc + (curr.total_amount - curr.paid_amount), 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {installments.length > 0 && (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Next Installment Due</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">{new Date(installments[0].next_payment_date).toLocaleDateString()}</span>
                        <span className="text-brand-red font-black">£{(installments[0].total_amount - installments[0].paid_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <button className="w-full bg-white text-brand-blue py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg">
                      <Download size={18} />
                      Download All Invoices
                    </button>
                    <button className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                      <History size={18} />
                      Payment History
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Announcements</h3>
                <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-1 rounded-lg">2 NEW</span>
              </div>
              <div className="space-y-8">
                {announcements.slice(0, 3).map((ann, i) => (
                  <div key={ann.id || i} className="group cursor-pointer">
                    <div className="flex gap-4 mb-2">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${ann.type === 'update' ? 'bg-brand-red' : 'bg-brand-blue'}`} />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{ann.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 line-clamp-2 mb-2">{ann.content || ann.desc}</p>
                    <p className="text-[10px] text-slate-400 ml-6 font-medium uppercase tracking-wider">
                      {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 text-brand-blue text-sm font-bold hover:underline flex items-center justify-center gap-2">
                View All Announcements <ChevronRight size={16} />
              </button>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Need Help?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Our dedicated support team is here to help you with any questions about your training.</p>
              <Link to="/contact" className="block w-full bg-brand-red text-white py-4 rounded-2xl font-bold text-center hover:bg-brand-red-hover transition-all shadow-lg shadow-brand-red/20">
                Contact Support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
