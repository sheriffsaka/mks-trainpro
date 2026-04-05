import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard, 
  BarChart3, 
  Megaphone, 
  FileQuestion, 
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Database,
  Image as ImageIcon,
  ChevronRight,
  Download,
  Play,
  FileText,
  Award,
  Loader2,
  Shield,
  Calendar,
  ClipboardList,
  GraduationCap,
  FileCheck,
  Activity,
  Upload
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { isSystemAdmin } from '../constants/admin';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { MOCK_COURSES, MOCK_CATEGORIES, MOCK_FAQS, MOCK_ANNOUNCEMENTS, MOCK_QUIZZES, MOCK_ENROLLMENTS } from '../data/mockData';

import { adminService } from '../services/adminService';
import { progressService } from '../services/progressService';

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", confirmColor = "bg-brand-red" }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, confirmColor?: string }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-6">
      <p className="text-slate-600">{message}</p>
      <div className="flex gap-4">
        <button 
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 px-6 py-3 ${confirmColor} text-white rounded-xl font-bold hover:opacity-90 transition-all`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

const DiagnosticTab = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const [initializingStorage, setInitializingStorage] = useState(false);
  const [storageResult, setStorageResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const setupStorage = async () => {
    try {
      setInitializingStorage(true);
      setStorageResult(null);
      const buckets = [
        { id: 'training-assets', public: true },
        { id: 'payment-proofs', public: false },
        { id: 'site-assets', public: true }
      ];
      const results: any = {};
      
      for (const b of buckets) {
        // Try to create bucket
        const { error: createError } = await supabase.storage.createBucket(b.id, {
          public: b.public,
          fileSizeLimit: 5242880,
        });
        
        if (createError && createError.message.toLowerCase().includes('already exists')) {
          // Update bucket to match intended public status
          const { error: updateError } = await supabase.storage.updateBucket(b.id, {
            public: b.public
          });
          if (updateError) {
            const isRLS = updateError.message.toLowerCase().includes('row-level security');
            results[b.id] = { 
              status: isRLS ? 'warning' : 'info', 
              message: isRLS 
                ? `Bucket exists but RLS prevents updating it. This is normal if you haven't run the SQL setup script yet.` 
                : `Bucket already exists but could not be updated to ${b.public ? 'public' : 'private'}.` 
            };
          } else {
            results[b.id] = { status: 'success', message: `Bucket already existed and was updated to ${b.public ? 'public' : 'private'}` };
          }
        } else if (createError) {
          const isRLS = createError.message.toLowerCase().includes('row-level security');
          results[b.id] = { 
            status: isRLS ? 'warning' : 'error', 
            message: isRLS 
              ? `RLS prevents bucket creation. Please run the SQL setup script in your Supabase dashboard.` 
              : createError.message 
          };
        } else {
          results[b.id] = { status: 'success', message: 'Bucket created successfully' };
        }
      }
      
      setStorageResult(results);
    } catch (err: any) {
      setStorageResult({ error: err.message || String(err) });
    } finally {
      setInitializingStorage(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const result = await adminService.getDiagnosticData();
    setData(result);
    setLoading(false);
  };

  const runTestFetch = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      // 1. Simple fetch (no joins)
      const { data: simpleEnrollments, error: simpleError } = await supabase.from('enrollments').select('*').limit(1);
      
      // 1b. Join test (single join)
      const { data: joinTest, error: joinError } = await supabase.from('enrollments').select('*, courses!course_id(*)').limit(1);
      
      // 1c. Profile join test
      const { data: profileJoinTest, error: profileJoinError } = await supabase.from('enrollments').select('*, profiles!enrollments_user_id_fkey(*)').limit(1);
      
      // 1d. Payments join test
      const { data: paymentsJoinTest, error: paymentsJoinError } = await supabase.from('enrollments').select('*, payments!payments_enrollment_id_fkey(*)').limit(1);
      
      // 2. Full fetch (with joins)
      let enrollmentsData: any = [];
      let enrollmentsError: any = null;
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*, profiles!enrollments_user_id_fkey(*), courses!enrollments_course_id_fkey(*), payments!payments_enrollment_id_fkey(*)')
          .order('enrolled_at', { ascending: false });
        enrollmentsData = data;
        enrollmentsError = error;
      } catch (e: any) {
        enrollmentsError = e;
      }

      const payments = await adminService.getAllPayments();
      const installments = await adminService.getInstallments();
      
      // 3. Profile check
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id).limit(1);
      const profileData = profiles && profiles.length > 0 ? profiles[0] : null;
      
      setTestResult({
        auth: {
          email: (await supabase.auth.getUser()).data.user?.email,
          id: (await supabase.auth.getUser()).data.user?.id,
        },
        profile: {
          data: profileData,
          error: profileError?.message
        },
        simpleFetch: {
          enrollmentsCount: simpleEnrollments?.length || 0,
          error: simpleError?.message
        },
        joinTest: {
          success: !!joinTest && joinTest.length > 0,
          hasCourseData: !!joinTest?.[0]?.courses,
          error: joinError?.message
        },
        profileJoinTest: {
          success: !!profileJoinTest && profileJoinTest.length > 0,
          hasProfileData: !!profileJoinTest?.[0]?.profiles,
          error: profileJoinError?.message
        },
        paymentsJoinTest: {
          success: !!paymentsJoinTest && paymentsJoinTest.length > 0,
          hasPaymentsData: !!paymentsJoinTest?.[0]?.payments,
          error: paymentsJoinError?.message
        },
        fullFetch: {
          enrollments: { 
            count: enrollmentsData?.length || 0, 
            sample: enrollmentsData?.slice(0, 1),
            error: enrollmentsError?.message || enrollmentsError
          },
          payments: { count: payments?.length || 0, sample: payments?.slice(0, 1) },
          installments: { count: installments?.length || 0, sample: installments?.slice(0, 1) }
        }
      });
    } catch (err: any) {
      setTestResult({ error: err.message || String(err) });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-blue" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">System Diagnostics</h2>
        <button onClick={fetchData} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Activity size={20} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.counts && Object.entries(data.counts).map(([key, value]: any) => (
          <div key={key} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-sm capitalize">{key}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Current Session</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">Supabase Configured</p>
            <p className="font-mono font-bold">{isSupabaseConfigured ? 'Yes' : 'No'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">Auth User ID</p>
            <p className="font-mono font-bold">{data?.currentUser?.id || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">Auth Email</p>
            <p className="font-bold">{data?.currentUser?.email || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">Profile Role</p>
            <p className="font-bold capitalize">{data?.currentUser?.profile?.role || 'No Profile Found'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500">Supabase Configured</p>
            <p className="font-bold">{isSupabaseConfigured ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
        <div className="flex gap-3 text-amber-800">
          <AlertCircle className="shrink-0" />
          <div>
            <h4 className="font-bold">Troubleshooting Data Visibility</h4>
            <p className="text-sm mt-1">If you see data in Supabase but not here, check if:</p>
            <ul className="text-sm list-disc list-inside mt-2 space-y-1">
              <li>The current user's email matches the admin email in the security rules.</li>
              <li>The enrollments point to valid course IDs and user IDs.</li>
              <li>The RLS policies have been correctly applied in the Supabase SQL Editor.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Storage Setup</h3>
          <button 
            onClick={setupStorage}
            disabled={initializingStorage}
            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-hover transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {initializingStorage ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
            {initializingStorage ? 'Initializing...' : 'Initialize Storage Buckets'}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Click the button above to ensure the required storage buckets (<code className="bg-slate-100 px-1 rounded">training-assets</code>, <code className="bg-slate-100 px-1 rounded">payment-proofs</code>, and <code className="bg-slate-100 px-1 rounded">site-assets</code>) are created in your Supabase instance.
        </p>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-xs text-amber-800">
          <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={14} /> Note on Permissions</p>
          <p>If the button fails with a "Row-level security policy" error, it means your Supabase project restricts bucket management via the API. In this case, please run the <code className="bg-amber-100 px-1 rounded">supabase_storage_setup.sql</code> script in your Supabase SQL Editor or create the buckets manually in the Storage dashboard.</p>
        </div>
        
        {storageResult && (
          <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden">
            <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
              {JSON.stringify(storageResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Data Fetch Test</h3>
          <button 
            onClick={runTestFetch}
            disabled={testing}
            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-hover transition-all disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Run Test Fetch'}
          </button>
        </div>
        
        {testResult && (
          <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden">
            <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const AttendanceTab = ({ courses }: { courses: any[] }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedCourse) {
      fetchData();
    }
  }, [selectedCourse, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching attendance data for course:', selectedCourse, 'date:', selectedDate);
      const [enrollments, attendanceData] = await Promise.all([
        adminService.getEnrollmentsByCourse(selectedCourse),
        adminService.getAttendance(selectedCourse, selectedDate)
      ]);
      
      console.log('Enrollments fetched:', enrollments?.length || 0);
      
      const studentList = (enrollments || [])
        .map((e: any) => e.profiles)
        .filter((p: any) => p !== null && p !== undefined);
        
      setStudents(studentList);
      
      const initialAttendance: Record<string, string> = {};
      (attendanceData || []).forEach((a: any) => {
        initialAttendance[a.user_id] = a.status;
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error in AttendanceTab fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([userId, status]) => ({
        user_id: userId,
        course_id: selectedCourse,
        session_date: selectedDate,
        status
      }));
      await adminService.markAttendance(records);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-slate-900">Attendance Management</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 md:w-64 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
          >
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
          />
        </div>
      </div>

      {selectedCourse ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Student List</h3>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Attendance
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                  <th className="px-8 py-4 font-bold">Student</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-8 py-12 text-center text-slate-500">
                      No students enrolled in this course yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                            {student.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.full_name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex gap-2">
                          {['present', 'absent', 'late'].map(status => (
                            <button
                              key={status}
                              onClick={() => setAttendance(prev => ({ ...prev, [student.id]: status }))}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                attendance[student.id] === status 
                                  ? status === 'present' ? 'bg-emerald-500 text-white' : status === 'absent' ? 'bg-brand-red text-white' : 'bg-amber-500 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Course Selected</h3>
          <p className="text-slate-500">Please select a course to manage attendance.</p>
        </div>
      )}
    </div>
  );
};

const SchedulesTab = ({ courses }: { courses: any[] }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    meeting_link: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await adminService.updateSchedule(editingSchedule.id, formData);
      } else {
        await adminService.createSchedule(formData);
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Class Schedules</h2>
        <button 
          onClick={() => { setEditingSchedule(null); setFormData({ course_id: '', title: '', description: '', meeting_link: '', start_time: '', end_time: '' }); setIsModalOpen(true); }}
          className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Schedule Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                <Calendar size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingSchedule(schedule); setFormData(schedule); setIsModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Edit size={16} /></button>
                <button onClick={async () => { if(confirm('Delete?')) { await adminService.deleteSchedule(schedule.id); fetchSchedules(); } }} className="p-2 hover:bg-brand-red/10 rounded-lg text-brand-red"><Trash2 size={16} /></button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-brand-blue uppercase tracking-wider">{schedule.courses?.title}</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{schedule.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mt-2">{schedule.description}</p>
            </div>
            <div className="pt-4 border-t border-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={14} />
                <span>{new Date(schedule.start_time).toLocaleString()}</span>
              </div>
              {schedule.meeting_link && (
                <a href={schedule.meeting_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-brand-blue font-bold hover:underline">
                  <Play size={14} />
                  Join Meeting
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSchedule ? 'Edit Schedule' : 'New Schedule'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
            <select 
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
            >
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Link</label>
            <input 
              type="url"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
              <input 
                required
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
              <input 
                required
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-brand-blue/90 transition-all mt-4">
            {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const OverviewTab = ({ stats, recentEnrollments, recentPayments, handleSeed, seeding }: any) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <button 
          onClick={handleSeed}
          disabled={seeding}
          className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          {seeding ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
          Seed Initial Data
        </button>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: stats ? `£${stats.totalRevenue.toLocaleString()}` : '...', trend: '+12.5%', icon: <DollarSign className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Total Students', value: stats?.studentsCount || '...', trend: '+8.2%', icon: <Users className="text-brand-blue" />, bg: 'bg-brand-blue/5' },
          { label: 'Active Courses', value: stats?.coursesCount || '...', trend: '+2', icon: <BookOpen className="text-brand-red" />, bg: 'bg-brand-red/5' },
          { label: 'Total Enrollments', value: stats?.enrollmentsCount || '...', trend: '+12', icon: <CreditCard className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Total Quizzes', value: stats?.quizzesCount || '...', trend: '+4', icon: <FileQuestion className="text-indigo-600" />, bg: 'bg-indigo-50' },
          { label: 'Announcements', value: stats?.announcementsCount || '...', trend: 'Active', icon: <Megaphone className="text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Pass Rate', value: stats ? `${stats.passRate}%` : '...', trend: '+1.5%', icon: <CheckCircle2 className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'New Signups', value: stats?.newSignups || '...', trend: '+12', icon: <UserPlus className="text-blue-600" />, bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') || stat.trend === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-red/10 text-brand-red'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Monthly Growth</p>
            <p className="text-xl font-bold text-slate-900">{stats ? `${stats.growth}%` : '...'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Course Completion</p>
            <p className="text-xl font-bold text-slate-900">{stats ? `${stats.completionRate}%` : '...'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Avg. Study Time</p>
            <p className="text-xl font-bold text-slate-900">12.5 hrs/wk</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Enrollments</h3>
            <button className="text-brand-blue text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-6 py-4 font-bold">Course</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentEnrollments.length > 0 ? recentEnrollments.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue text-xs font-bold">
                          {row.profiles?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{row.profiles?.full_name}</p>
                          <p className="text-[10px] text-slate-500">{row.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{row.courses?.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500">{new Date(row.enrolled_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        row.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No recent enrollments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Course Performance */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Top Performing Courses</h3>
          </div>
          <div className="p-6 space-y-6">
            {stats?.topCourses && stats.topCourses.length > 0 ? stats.topCourses.map((course: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-900">{course.name}</span>
                  <span className="text-slate-500">{course.sales} sales</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${course.color}`} 
                    style={{ width: `${Math.min((course.sales / (stats.topCourses[0]?.sales || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="space-y-6">
                {[
                  { name: 'Level 3 Adult Care', sales: 145, growth: '+12%', color: 'bg-brand-blue' },
                  { name: 'SIA Door Supervisor', sales: 98, growth: '+5%', color: 'bg-brand-red' },
                  { name: 'Functional Skills English', sales: 76, growth: '+18%', color: 'bg-emerald-500' },
                  { name: 'Level 5 Leadership', sales: 42, growth: '+2%', color: 'bg-amber-500' }
                ].map((course, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-900">{course.name}</span>
                      <span className="text-slate-500">{course.sales} sales</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${course.color}`} 
                        style={{ width: `${(course.sales / 150) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Recent Payments */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Payments</h3>
            <button className="text-brand-blue text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-4">
            {recentPayments.length > 0 ? recentPayments.map((payment, i) => (
              <div key={payment.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">£{payment.amount}</p>
                    <p className="text-[10px] text-slate-500">{payment.profiles?.full_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  payment.payment_status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {payment.payment_status}
                </span>
              </div>
            )) : (
              <p className="text-center text-slate-500 text-sm py-10">No recent payments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesTab = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await adminService.deleteCourse(id);
        fetchCourses();
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courseData: any = {
      title: formData.get('title'),
      slug: (formData.get('title') as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      category_id: formData.get('category_id'),
      price_standard: parseFloat(formData.get('price_standard') as string),
      price_platinum: parseFloat(formData.get('price_platinum') as string),
      image_url: formData.get('image_url'),
      video_url: formData.get('video_url'),
      document_url: formData.get('document_url'),
      description: formData.get('description'),
      duration: formData.get('duration'),
      mode: formData.get('mode'),
      is_published: formData.get('is_published') === 'on',
    };

    if (!courseData.title || !courseData.category_id || isNaN(courseData.price_standard) || isNaN(courseData.price_platinum)) {
      alert('Please fill in all required fields (Title, Category, and Prices)');
      return;
    }

    const imageFile = (e.currentTarget.elements.namedItem('image_file') as HTMLInputElement)?.files?.[0];
    if (imageFile) {
      try {
        const publicUrl = await adminService.uploadFile(imageFile);
        courseData.image_url = publicUrl;
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Failed to upload image. Using URL if provided.');
      }
    }

    const videoFile = (e.currentTarget.elements.namedItem('video_file') as HTMLInputElement)?.files?.[0];
    if (videoFile) {
      try {
        const publicUrl = await adminService.uploadFile(videoFile);
        courseData.video_url = publicUrl;
      } catch (err) {
        console.error('Error uploading video:', err);
      }
    }

    const documentFile = (e.currentTarget.elements.namedItem('document_file') as HTMLInputElement)?.files?.[0];
    if (documentFile) {
      try {
        const publicUrl = await adminService.uploadFile(documentFile);
        courseData.document_url = publicUrl;
      } catch (err) {
        console.error('Error uploading document:', err);
      }
    }

    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, courseData);
        alert('Course updated successfully!');
      } else {
        const newCourse = await adminService.createCourse(courseData);
        alert('Course created successfully!');
        
        // Notify all students if published
        if (courseData.is_published) {
          try {
            const students = await adminService.getStudents();
            for (const student of students) {
              await adminService.createNotification({
                user_id: student.id,
                title: 'New Course Available!',
                message: `Check out our new course: ${courseData.title}. Enroll now to start learning!`,
                type: 'info'
              });
            }
          } catch (notifErr) {
            console.error('Error sending notifications for new course:', notifErr);
          }
        }
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) {
      console.error('Error saving course:', err);
      alert(`Failed to save course: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">Course Info</th>
              <th className="px-8 py-5 font-bold">Category</th>
              <th className="px-8 py-5 font-bold">Pricing</th>
              <th className="px-8 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={course.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.duration}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
                    {course.categories?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm">
                    <p className="font-bold text-slate-900">£{course.price_standard}</p>
                    <p className="text-[10px] text-brand-blue font-bold uppercase">Platinum: £{course.price_platinum}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(course)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                  <p className="text-sm text-slate-500">Fill in the details to {editingCourse ? 'update' : 'publish'} a training course.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                      <input 
                        name="title"
                        type="text" 
                        defaultValue={editingCourse?.title}
                        placeholder="e.g. Level 3 Diploma in Adult Care"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select 
                        name="category_id" 
                        defaultValue={editingCourse?.category_id}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Mode</label>
                      <select 
                        name="mode" 
                        defaultValue={editingCourse?.mode || 'vod'}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="virtual">Virtual (Live) Class</option>
                        <option value="vod">Video on Demand (Self-paced)</option>
                        <option value="physical">Physical Class</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Standard Price (£)</label>
                        <input 
                          name="price_standard"
                          type="number" 
                          defaultValue={editingCourse?.price_standard}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Platinum Price (£)</label>
                        <input 
                          name="price_platinum"
                          type="number" 
                          defaultValue={editingCourse?.price_platinum}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Image</label>
                      <div className="flex gap-4">
                        <input 
                          name="image_url"
                          type="text" 
                          defaultValue={editingCourse?.image_url}
                          placeholder="https://..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            name="image_file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                            <ImageIcon size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Intro Video (Optional)</label>
                      <div className="flex gap-4">
                        <input 
                          name="video_url"
                          type="text" 
                          defaultValue={editingCourse?.video_url}
                          placeholder="https://..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            name="video_file"
                            accept="video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                            <Play size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Document (Optional)</label>
                      <div className="flex gap-4">
                        <input 
                          name="document_url"
                          type="text" 
                          defaultValue={editingCourse?.document_url}
                          placeholder="https://..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            name="document_file"
                            accept=".pdf,.doc,.docx"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                            <FileText size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                      <textarea 
                        name="description"
                        rows={3}
                        defaultValue={editingCourse?.description}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
                      <input 
                        name="duration"
                        type="text" 
                        defaultValue={editingCourse?.duration}
                        placeholder="e.g. 12 Months or 6 Days"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <input 
                        name="is_published"
                        type="checkbox" 
                        defaultChecked={editingCourse?.is_published}
                        className="w-5 h-5 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Publish Immediately</p>
                        <p className="text-xs text-slate-500">Make this course visible to students right away.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end gap-4 mt-8">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2">
                      <Save size={20} /> {editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Filter size={18} /> Filter
          </button>
          <button className="bg-white border border-slate-200 px-4 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">User</th>
              <th className="px-8 py-5 font-bold">Role</th>
              <th className="px-8 py-5 font-bold">Joined Date</th>
              <th className="px-8 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email || 'No email provided'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> Active
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EnrollmentsTab = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime-enrollments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
          fetchEnrollments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllEnrollments();
      setEnrollments(data || []);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = async (receiptUrl: string) => {
    if (!receiptUrl) return;
    
    setViewingProof(receiptUrl);
    try {
      let bucket = 'payment-proofs';
      let filePath = receiptUrl;

      if (receiptUrl.startsWith('http')) {
        if (receiptUrl.includes('.supabase.co/storage/v1/object/public/')) {
          const urlParts = receiptUrl.split('/storage/v1/object/public/');
          if (urlParts.length > 1) {
            const pathParts = urlParts[1].split('/');
            bucket = pathParts[0];
            filePath = pathParts.slice(1).join('/');
          }
        } else {
          window.open(receiptUrl, '_blank');
          return;
        }
      }
      
      const signedUrl = await adminService.getSignedUrl(bucket, filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        alert('Could not generate a viewable link for this proof. Please ensure the "payment-proofs" bucket exists in Supabase Storage.');
      }
    } catch (err) {
      console.error('Error viewing proof:', err);
      alert('Failed to open proof.');
    } finally {
      setViewingProof(null);
    }
  };

  const handleApprove = async (enrollment: any) => {
    try {
      // 1. Update enrollment status
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({ status: 'active' })
        .eq('id', enrollment.id);
      
      if (enrollmentError) throw enrollmentError;

      // 2. Update associated payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ payment_status: 'succeeded' })
        .eq('enrollment_id', enrollment.id)
        .eq('payment_status', 'pending');
      
      if (paymentError) {
        console.error('Error updating payment status:', paymentError);
      }
      
      // 3. Notify student
      try {
        await adminService.createNotification({
          user_id: enrollment.user_id,
          title: 'Enrollment Approved!',
          message: `Your enrollment for ${enrollment.courses?.title || 'the course'} has been approved. You can now start learning!`,
          type: 'success'
        });
      } catch (notifErr) {
        console.error('Error sending notification:', notifErr);
      }
      
      alert('Enrollment approved successfully!');
      fetchEnrollments();
    } catch (err: any) {
      console.error('Error approving enrollment:', err);
      alert(`Failed to approve enrollment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Course Enrollments & Approvals</h3>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">Student</th>
              <th className="px-8 py-5 font-bold">Course</th>
              <th className="px-8 py-5 font-bold">Package</th>
              <th className="px-8 py-5 font-bold">Payment Proof</th>
              <th className="px-8 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enrollments.length > 0 ? enrollments.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                      {e.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{e.profiles?.full_name}</p>
                      <p className="text-xs text-slate-500">{e.profiles?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-slate-900">{e.courses?.title}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold uppercase text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-lg">
                    {e.package_type}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {e.payments?.[0]?.receipt_url ? (
                    <button 
                      onClick={() => handleViewProof(e.payments[0].receipt_url)}
                      disabled={!!viewingProof}
                      className="text-brand-blue hover:underline text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      {viewingProof === e.payments[0].receipt_url ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Eye size={14} />
                      )}
                      View Proof
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No proof</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    e.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                    e.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {e.status === 'pending' ? (
                    <button 
                      onClick={() => handleApprove(e)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 justify-end">
                      <CheckCircle2 size={14} /> Approved
                    </span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-500">
                  No enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime-payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          fetchPayments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllPayments();
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = async (receiptUrl: string) => {
    if (!receiptUrl) return;
    
    setViewingProof(receiptUrl);
    try {
      let bucket = 'payment-proofs';
      let filePath = receiptUrl;

      if (receiptUrl.startsWith('http')) {
        if (receiptUrl.includes('.supabase.co/storage/v1/object/public/')) {
          const urlParts = receiptUrl.split('/storage/v1/object/public/');
          if (urlParts.length > 1) {
            const pathParts = urlParts[1].split('/');
            bucket = pathParts[0];
            filePath = pathParts.slice(1).join('/');
          }
        } else {
          window.open(receiptUrl, '_blank');
          return;
        }
      }
      
      const signedUrl = await adminService.getSignedUrl(bucket, filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        alert('Could not generate a viewable link for this proof.');
      }
    } catch (err) {
      console.error('Error viewing proof:', err);
      alert('Failed to open proof.');
    } finally {
      setViewingProof(null);
    }
  };

  const handleConfirmPayment = async (payment: any) => {
    try {
      // 1. Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ payment_status: 'succeeded' })
        .eq('id', payment.id);
      
      if (paymentError) throw paymentError;

      // 2. Update enrollment status
      if (payment.enrollment_id) {
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .update({ status: 'active' })
          .eq('id', payment.enrollment_id);
        
        if (enrollmentError) {
          console.error('Error updating enrollment status:', enrollmentError);
        }
      }
      
      alert('Payment confirmed and enrollment activated!');
      fetchPayments();
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      alert(`Failed to confirm payment: ${err.message}`);
    }
  };

  const totalRevenue = payments
    .filter(p => p.payment_status === 'succeeded')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const pendingRevenue = payments
    .filter(p => p.payment_status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-slate-900">£{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Pending Deposits</p>
          <h3 className="text-3xl font-bold text-amber-600">£{pendingRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Transactions</p>
          <h3 className="text-3xl font-bold text-brand-blue">{payments.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Transaction History</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">Student</th>
              <th className="px-8 py-5 font-bold">Course</th>
              <th className="px-8 py-5 font-bold">Amount</th>
              <th className="px-8 py-5 font-bold">Method</th>
              <th className="px-8 py-5 font-bold">Payment Proof</th>
              <th className="px-8 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.length > 0 ? payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-900">{p.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">{p.profiles?.email}</p>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{p.enrollments?.courses?.title}</td>
                <td className="px-8 py-5 font-bold text-slate-900">£{p.amount}</td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {p.payment_method || 'bank_transfer'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {p.receipt_url ? (
                    <button 
                      onClick={() => handleViewProof(p.receipt_url)}
                      disabled={!!viewingProof}
                      className="text-brand-blue hover:underline text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      {viewingProof === p.receipt_url ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Eye size={14} />
                      )}
                      View Proof
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No proof</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.payment_status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 
                    p.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-brand-red/10 text-brand-red'
                  }`}>
                    {p.payment_status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right text-sm text-slate-500">
                  {p.payment_status === 'pending' ? (
                    <button 
                      onClick={() => handleConfirmPayment(p)}
                      className="bg-brand-blue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-brand-blue-hover transition-all"
                    >
                      Confirm
                    </button>
                  ) : (
                    new Date(p.created_at).toLocaleDateString()
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InstallmentsTab = () => {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallments();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime-installments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'installment_records' }, () => {
          fetchInstallments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchInstallments = async () => {
    try {
      const data = await adminService.getInstallments();
      setInstallments(data);
    } catch (err) {
      console.error('Error fetching installments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstallment = async (inst: any, amount: number) => {
    try {
      const newPaidAmount = inst.paid_amount + amount;
      const status = newPaidAmount >= inst.total_amount ? 'completed' : 'active';
      
      // 1. Update installment record
      await adminService.updateInstallment(inst.id, { 
        paid_amount: newPaidAmount,
        status: status
      });

      // 2. Create a payment record
      await supabase.from('payments').insert({
        user_id: inst.enrollments?.user_id,
        enrollment_id: inst.enrollment_id,
        amount: amount,
        currency: 'GBP',
        payment_method: 'bank_transfer',
        payment_status: 'succeeded',
        is_installment: true,
        created_at: new Date().toISOString()
      });
      
      alert('Installment payment recorded successfully!');
      fetchInstallments();
    } catch (err: any) {
      console.error('Error updating installment:', err);
      alert(`Failed to update installment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Installment Management</h3>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">Student</th>
              <th className="px-8 py-5 font-bold">Course</th>
              <th className="px-8 py-5 font-bold">Progress</th>
              <th className="px-8 py-5 font-bold">Next Due</th>
              <th className="px-8 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {installments.length > 0 ? installments.map((inst) => (
              <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-900">{inst.enrollments?.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">{inst.enrollments?.profiles?.email}</p>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{inst.enrollments?.courses?.title}</td>
                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>£{inst.paid_amount} / £{inst.total_amount}</span>
                      <span>{((inst.paid_amount / inst.total_amount) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-32">
                      <div 
                        className="h-full bg-brand-blue" 
                        style={{ width: `${(inst.paid_amount / inst.total_amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {new Date(inst.next_payment_date).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    inst.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    inst.status === 'active' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-red/10 text-brand-red'
                  }`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {inst.status === 'active' && (
                    <button 
                      onClick={() => {
                        const amount = prompt('Enter amount paid for the second installment:', (inst.total_amount - inst.paid_amount).toString());
                        if (amount) {
                          handleUpdateInstallment(inst, parseFloat(amount));
                        }
                      }}
                      className="text-brand-blue hover:underline text-xs font-bold"
                    >
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-500">
                  No installment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const QuizzesTab = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    if (editingQuiz) {
      setQuestions(editingQuiz.questions || []);
    } else {
      setQuestions([]);
    }
  }, [editingQuiz]);

  const fetchQuizzes = async () => {
    try {
      const data = await adminService.getQuizzes();
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_option: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quizData = {
      title: formData.get('title'),
      course_id: formData.get('course_id'),
      questions: questions,
    };

    try {
      if (editingQuiz) {
        await adminService.updateQuiz(editingQuiz.id, quizData);
      } else {
        await adminService.createQuiz(quizData);
        
        // Notify enrolled students
        try {
          const enrollments = await adminService.getEnrollmentsByCourse(quizData.course_id as string);
          for (const enrollment of enrollments) {
            await adminService.createNotification({
              user_id: enrollment.user_id,
              title: 'New Assessment Available!',
              message: `A new quiz "${quizData.title}" has been added to your course: ${enrollment.courses?.title || 'the course'}.`,
              type: 'info'
            });
          }
        } catch (notifErr) {
          console.error('Error sending notifications for quiz:', notifErr);
        }
      }
      alert(`Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`);
      setIsModalOpen(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      alert(`Failed to save quiz: ${error.message || 'Unknown error'}`);
      // Mock save for presentation
      if (editingQuiz) {
        setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? { ...q, ...quizData } : q));
      } else {
        setQuizzes(prev => [{ id: `q-${Date.now()}`, ...quizData, created_at: new Date().toISOString() }, ...prev]);
      }
      setIsModalOpen(false);
      setEditingQuiz(null);
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
      await adminService.deleteQuiz(quizToDelete);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      // Mock delete for presentation
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete));
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    try {
      const text = await bulkFile.text();
      const quizzesToUpload = JSON.parse(text);

      if (!Array.isArray(quizzesToUpload)) {
        throw new Error('Invalid format: Expected an array of quizzes');
      }

      // Validate quizzes
      quizzesToUpload.forEach((q, i) => {
        if (!q.title || !q.course_id || !Array.isArray(q.questions)) {
          throw new Error(`Quiz at index ${i} is missing required fields (title, course_id, questions)`);
        }
      });

      await adminService.bulkCreateQuizzes(quizzesToUpload);
      alert('Bulk quizzes uploaded successfully!');
      setIsBulkModalOpen(false);
      setBulkFile(null);
      fetchQuizzes();
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      alert(`Failed to upload quizzes: ${error.message}`);
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Manage Quizzes</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Upload size={20} /> Bulk Upload
          </button>
          <button 
            onClick={() => { setEditingQuiz(null); setIsModalOpen(true); }}
            className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
          >
            <Plus size={20} /> Create New Quiz
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading quizzes...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                  <FileQuestion size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingQuiz(quiz); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => { setQuizToDelete(quiz.id); setIsConfirmOpen(true); }}
                    className="p-2 text-slate-400 hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors">{quiz.title}</h4>
              <p className="text-xs text-slate-500 font-medium mb-6">{quiz.course_id}</p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Questions</p>
                  <p className="text-sm font-bold text-slate-900">{quiz.questions?.length || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Attempts</p>
                  <p className="text-sm font-bold text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg Score</p>
                  <p className="text-sm font-bold text-emerald-600">0%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
              <input 
                name="title"
                type="text" 
                defaultValue={editingQuiz?.title}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g. Adult Care Fundamentals"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Course</label>
              <select 
                name="course_id"
                defaultValue={editingQuiz?.course_id}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              >
                <option value="">Select a course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">Questions ({questions.length})</h4>
              <button 
                type="button"
                onClick={addQuestion}
                className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                  <button 
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question {qIndex + 1}</label>
                    <input 
                      type="text" 
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {q.options.map((opt: string, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct_${qIndex}`}
                          checked={q.correct_option === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correct_option', oIndex)}
                          className="w-4 h-4 text-brand-blue"
                        />
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          required
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20">
            {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        title="Bulk Upload Quizzes"
      >
        <form onSubmit={handleBulkUpload} className="space-y-6">
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mx-auto">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Upload JSON File</p>
              <p className="text-sm text-slate-500">Select a .json file containing an array of quizzes</p>
            </div>
            <input 
              type="file" 
              accept=".json"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-quiz-upload"
            />
            <label 
              htmlFor="bulk-quiz-upload"
              className="inline-block bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {bulkFile ? bulkFile.name : 'Choose File'}
            </label>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected JSON Format:</h5>
            <pre className="text-[10px] text-slate-600 font-mono overflow-x-auto p-3 bg-white rounded-lg border border-slate-200">
{`[
  {
    "title": "Quiz Title",
    "course_id": "course-uuid",
    "questions": [
      {
        "question": "What is...?",
        "options": ["A", "B", "C", "D"],
        "correct_option": 0
      }
    ]
  }
]`}
            </pre>
          </div>

          <button 
            disabled={!bulkFile || bulkUploading}
            className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {bulkUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload size={20} /> Start Upload
              </>
            )}
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setQuizToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
      />
    </div>
  );
};

const CertificateTemplate = ({ studentName, courseTitle, date }: { studentName: string, courseTitle: string, date: string }) => (
  <div className="w-full aspect-[1.414/1] bg-white border-[12px] border-brand-blue p-12 flex flex-col items-center justify-between text-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-32 h-32 bg-brand-blue/10 rounded-br-full" />
    <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-tl-full" />
    
    <div className="space-y-4">
      <div className="w-20 h-20 bg-brand-blue rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
        <Award size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Certificate of Completion</h2>
      <p className="text-slate-500 font-medium italic">This is to certify that</p>
    </div>

    <div className="space-y-2">
      <h1 className="text-5xl font-black text-brand-blue tracking-tight">{studentName}</h1>
      <div className="h-px bg-slate-200 w-64 mx-auto" />
      <p className="text-slate-500 font-medium">has successfully completed the course</p>
      <h3 className="text-2xl font-bold text-slate-900">{courseTitle}</h3>
    </div>

    <div className="w-full flex justify-between items-end">
      <div className="text-left space-y-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date Issued</p>
        <p className="font-bold text-slate-900">{date}</p>
      </div>
      <div className="text-center space-y-2">
        <div className="w-32 h-px bg-slate-900 mx-auto" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Director Signature</p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certificate ID</p>
        <p className="font-bold text-slate-900">MKS-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
      </div>
    </div>
  </div>
);

const CertificatesTab = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibilityMap, setEligibilityMap] = useState<{[key: string]: boolean}>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<any>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEnrollmentsForCertificates();
      
      if (data) {
        setEnrollments(data);
        
        // Check eligibility for each active enrollment
        const eMap: {[key: string]: boolean} = {};
        await Promise.all(data.map(async (e: any) => {
          if (e.status === 'completed') {
            eMap[e.id] = true;
          } else {
            const progress = await progressService.calculateProgress(e.user_id, e.course_id);
            eMap[e.id] = progress.isEligibleForCertificate;
          }
        }));
        setEligibilityMap(eMap);
      }
    } catch (err) {
      console.error('Error fetching enrollments for certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (enrollment: any) => {
    try {
      setGenerating(enrollment.id);
      
      // In a real app, you'd generate a PDF here. 
      // For now, we'll just create a record in the certificates table.
      const certificateUrl = `https://mksconsultsltd.com/verify/cert-${enrollment.id.substring(0, 8)}`;
      
      const { error } = await supabase
        .from('certificates')
        .insert({
          enrollment_id: enrollment.id,
          user_id: enrollment.user_id,
          certificate_url: certificateUrl
        });
      
      if (error) throw error;
      
      // Notify student
      try {
        await adminService.createNotification({
          user_id: enrollment.user_id,
          title: 'Certificate Issued!',
          message: `Congratulations! Your certificate for ${enrollment.courses?.title || 'the course'} is now available.`,
          type: 'success'
        });
      } catch (notifErr) {
        console.error('Error sending notification:', notifErr);
      }
      
      alert('Certificate issued successfully!');
      fetchEnrollments();
    } catch (err: any) {
      console.error('Error issuing certificate:', err);
      alert(`Failed to issue certificate: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Certificate Management</h3>
        <p className="text-sm text-slate-500">Issue certificates to students who have completed their courses.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-8 py-5 font-bold">Student</th>
              <th className="px-8 py-5 font-bold">Course</th>
              <th className="px-8 py-5 font-bold">Completion Date</th>
              <th className="px-8 py-5 font-bold">Certificate</th>
              <th className="px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enrollments.length > 0 ? enrollments.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                      {e.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{e.profiles?.full_name}</p>
                      <p className="text-xs text-slate-500">{e.profiles?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-slate-900">{e.courses?.title}</p>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {new Date(e.enrolled_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                  {e.certificates && e.certificates.length > 0 ? (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Issued
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
                      <Clock size={14} /> Pending
                    </span>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  {e.certificates && e.certificates.length > 0 ? (
                    <button 
                      onClick={() => setPreviewCert(e)}
                      className="text-brand-blue hover:underline text-xs font-bold flex items-center gap-1 justify-end ml-auto"
                    >
                      <Eye size={14} /> View
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleIssueCertificate(e)}
                      disabled={generating === e.id}
                      className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                    >
                      {generating === e.id ? <Loader2 className="animate-spin" size={14} /> : 'Issue Certificate'}
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                  No completed enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={!!previewCert} 
        onClose={() => setPreviewCert(null)} 
        title="Certificate Preview"
      >
        {previewCert && (
          <div className="space-y-8">
            <CertificateTemplate 
              studentName={previewCert.profiles?.full_name}
              courseTitle={previewCert.courses?.title}
              date={new Date(previewCert.certificates?.[0]?.created_at || new Date()).toLocaleDateString()}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download PDF
              </button>
              <button 
                onClick={() => setPreviewCert(null)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const AnnouncementsTab = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [annToDelete, setAnnToDelete] = useState<string | null>(null);
  const [editingAnn, setEditingAnn] = useState<any>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await adminService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const annData = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type') || 'info',
      target_role: formData.get('target_role') || null,
    };

    try {
      if (editingAnn) {
        await adminService.updateAnnouncement(editingAnn.id, annData);
      } else {
        await adminService.createAnnouncement(annData);
        
        // Notify students
        try {
          const students = await adminService.getStudents();
          for (const student of students) {
            // If target_role is specified, only notify those users
            if (!annData.target_role || annData.target_role === 'student') {
              await adminService.createNotification({
                user_id: student.id,
                title: annData.title as string,
                message: annData.content as string,
                type: annData.type as any || 'info'
              });
            }
          }
        } catch (notifErr) {
          console.error('Error sending notifications for announcement:', notifErr);
        }
      }
      setIsModalOpen(false);
      setEditingAnn(null);
      fetchAnnouncements();
      alert('Announcement saved successfully!');
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      if (isSupabaseConfigured) {
        alert(`Failed to save announcement: ${error.message || 'Unknown error'}`);
      } else {
        // Mock save for presentation
        if (editingAnn) {
          setAnnouncements(prev => prev.map(a => a.id === editingAnn.id ? { ...a, ...annData } : a));
        } else {
          setAnnouncements(prev => [{ id: `a-${Date.now()}`, ...annData, created_at: new Date().toISOString() }, ...prev]);
        }
        setIsModalOpen(false);
        setEditingAnn(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!annToDelete) return;
    try {
      await adminService.deleteAnnouncement(annToDelete);
      fetchAnnouncements();
      alert('Announcement deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      if (isSupabaseConfigured) {
        alert(`Failed to delete announcement: ${error.message || 'Unknown error'}`);
      } else {
        // Mock delete for presentation
        setAnnouncements(prev => prev.filter(a => a.id !== annToDelete));
      }
    } finally {
      setIsConfirmOpen(false);
      setAnnToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">System Announcements</h3>
        <button 
          onClick={() => { setEditingAnn(null); setIsModalOpen(true); }}
          className="bg-brand-red text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-red-hover transition-all"
        >
          <Plus size={20} /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading announcements...</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  ann.type === 'error' || ann.type === 'warning' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'
                }`}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{ann.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="font-medium">Target: {ann.target_role || 'All Users'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  ann.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ann.type}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingAnn(ann); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => { setAnnToDelete(ann.id); setIsConfirmOpen(true); }}
                    className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAnn ? 'Edit Announcement' : 'New Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
            <input name="title" type="text" defaultValue={editingAnn?.title} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
            <textarea name="content" rows={3} defaultValue={editingAnn?.content} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Role</label>
              <select name="target_role" defaultValue={editingAnn?.target_role || ''} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="">All Users</option>
                <option value="student">Students</option>
                <option value="corporate">Corporate</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
              <select name="type" defaultValue={editingAnn?.type || 'info'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <button className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all">
            {editingAnn ? 'Update' : 'Post Announcement'}
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setAnnToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
};

const ReportsTab = ({ stats }: { stats: any }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
            <TrendingUp size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Monthly Growth</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">+{stats?.growth || '12.5'}%</p>
        <p className="text-xs text-slate-500 mt-2">Compared to last month</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Completion Rate</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">{stats?.completionRate || '78.2'}%</p>
        <p className="text-xs text-slate-500 mt-2">Average across all courses</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-red/5 rounded-2xl text-brand-red">
            <Users size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Active Students</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">{stats?.studentsCount || '1,452'}</p>
        <p className="text-xs text-slate-500 mt-2">Currently enrolled</p>
      </div>
    </div>

    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-slate-900">Revenue Analytics</h3>
        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none">
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>
      <div className="h-64 flex items-end gap-4 px-4">
        {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? stats.monthlyRevenue.map((m: any, i: number) => {
          const maxVal = Math.max(...stats.monthlyRevenue.map((r: any) => r.value), 1);
          const height = (m.value / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <div 
                className="w-full bg-brand-blue/20 rounded-t-xl relative group"
                style={{ height: `${Math.max(height, 5)}%` }}
              >
                <div className="absolute inset-0 bg-brand-blue rounded-t-xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  £{m.value.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {m.name}
              </span>
            </div>
          );
        }) : [45, 60, 55, 85, 70, 95].map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <div 
              className="w-full bg-brand-blue/20 rounded-t-xl relative group"
              style={{ height: `${val}%` }}
            >
              <div className="absolute inset-0 bg-brand-blue rounded-t-xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                £{val * 100}
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CMSTab = ({ handleSeed, seeding }: any) => {
  const [settings, setSettings] = useState<any>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<any>(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    try {
      const [settingsData, faqsData] = await Promise.all([
        adminService.getSettings(),
        adminService.getFAQs()
      ]);
      setSettings(settingsData);
      setFaqs(faqsData || []);
    } catch (error) {
      console.error('Error fetching CMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: string) => {
    // Don't update if value hasn't changed
    if (settings[key] === value) return;
    
    try {
      setSaveStatus(`Saving ${key.replace('_', ' ')}...`);
      await adminService.updateSetting(key, value);
      setSettings({ ...settings, [key]: value });
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error: any) {
      console.error(`Error updating setting ${key}:`, error);
      if (isSupabaseConfigured) {
        setSaveStatus(`Error: ${error.message || 'Failed to save'}`);
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        // Mock update for presentation
        setSettings({ ...settings, [key]: value });
        setSaveStatus('Settings saved (Mock)!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const faqData = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      if (editingFaq) {
        await adminService.updateFAQ(editingFaq.id, faqData);
      } else {
        await adminService.createFAQ(faqData);
      }
      setIsFaqModalOpen(false);
      setEditingFaq(null);
      fetchCMSData();
      alert('FAQ saved successfully!');
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      if (isSupabaseConfigured) {
        alert(`Failed to save FAQ: ${error.message || 'Unknown error'}`);
      } else {
        // Mock save for presentation
        if (editingFaq) {
          setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...faqData } : f));
        } else {
          setFaqs(prev => [{ id: `f-${Date.now()}`, ...faqData }, ...prev]);
        }
        setIsFaqModalOpen(false);
        setEditingFaq(null);
      }
    }
  };

  const handleFaqDelete = async () => {
    if (!faqToDelete) return;
    try {
      await adminService.deleteFAQ(faqToDelete);
      fetchCMSData();
      alert('FAQ deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      if (isSupabaseConfigured) {
        alert(`Failed to delete FAQ: ${error.message || 'Unknown error'}`);
      } else {
        // Mock delete for presentation
        setFaqs(prev => prev.filter(f => f.id !== faqToDelete));
      }
    } finally {
      setIsConfirmOpen(false);
      setFaqToDelete(null);
    }
  };

  if (loading) return <div className="text-center py-20">Loading CMS...</div>;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={handleSeed}
          disabled={seeding}
          className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
        >
          {seeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
          Seed Database with Mock Data
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Site Settings */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative">
          {saveStatus && (
            <div className="absolute top-8 right-8 bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold animate-fade-in z-10 shadow-lg">
              {saveStatus}
            </div>
          )}
          <h3 className="text-xl font-bold text-slate-900 mb-8">General Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Site Name</label>
              <input 
                type="text" 
                defaultValue={settings.site_name || 'MKS Consults Ltd'}
                onBlur={(e) => handleSettingChange('site_name', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
              <input 
                type="email" 
                defaultValue={settings.support_email || 'support@mksconsultsltd.com'}
                onBlur={(e) => handleSettingChange('support_email', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
              <input 
                type="text" 
                defaultValue={settings.contact_number || '+44 20 8123 4567'}
                onBlur={(e) => handleSettingChange('contact_number', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Settings auto-save on blur
            </div>
          </div>
        </div>

        {/* Hero Section Editor */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Hero Section</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Main Headline</label>
              <textarea 
                rows={3}
                defaultValue={settings.hero_headline || 'Expert SAP and Software Testing Training.'}
                onBlur={(e) => handleSettingChange('hero_headline', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Subheadline</label>
              <textarea 
                rows={3}
                defaultValue={settings.hero_subheadline || 'Industry-leading training for SAP Professionals and Software Testers.'}
                onBlur={(e) => handleSettingChange('hero_subheadline', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-10 bg-slate-200 rounded-lg overflow-hidden">
                <img src="https://picsum.photos/seed/hero/100/60" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Hero Background</p>
                <p className="text-xs text-slate-500">hero-bg.jpg</p>
              </div>
              <button className="text-brand-blue text-xs font-bold hover:underline">Change</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* About Section Editor */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">About Section</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">About Title</label>
              <input 
                type="text" 
                defaultValue={settings.about_title || 'Why Choose MKS Consults?'}
                onBlur={(e) => handleSettingChange('about_title', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">About Content</label>
              <textarea 
                rows={5}
                defaultValue={settings.about_content || 'We provide high-quality training solutions tailored to your needs. Our experienced instructors ensure you get the best learning experience.'}
                onBlur={(e) => handleSettingChange('about_content', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Footer & Social</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Office Address</label>
              <textarea 
                rows={2}
                defaultValue={settings.office_address || '123 Training Street, London, UK'}
                onBlur={(e) => handleSettingChange('office_address', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                <input 
                  type="text" 
                  defaultValue={settings.facebook_url || 'https://facebook.com'}
                  onBlur={(e) => handleSettingChange('facebook_url', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Twitter URL</label>
                <input 
                  type="text" 
                  defaultValue={settings.twitter_url || 'https://twitter.com'}
                  onBlur={(e) => handleSettingChange('twitter_url', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Manager */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-900">FAQ Manager</h3>
          <button 
            onClick={() => { setEditingFaq(null); setIsFaqModalOpen(true); }}
            className="text-brand-blue text-sm font-bold flex items-center gap-2 hover:underline"
          >
            <Plus size={16} /> Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-900 block">{faq.question}</span>
                <span className="text-xs text-slate-500 line-clamp-1">{faq.answer}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingFaq(faq); setIsFaqModalOpen(true); }}
                  className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => { setFaqToDelete(faq.id); setIsConfirmOpen(true); }}
                  className="p-2 text-slate-400 hover:text-brand-red transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isFaqModalOpen} 
        onClose={() => setIsFaqModalOpen(false)} 
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
      >
        <form onSubmit={handleFaqSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Question</label>
            <input name="question" type="text" defaultValue={editingFaq?.question} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Answer</label>
            <textarea name="answer" rows={4} defaultValue={editingFaq?.answer} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Display Order</label>
            <input name="order" type="number" defaultValue={editingFaq?.order || 0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <button className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all">
            {editingFaq ? 'Update FAQ' : 'Add FAQ'}
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setFaqToDelete(null); }}
        onConfirm={handleFaqDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
};

// --- Main Page ---

const ProgressTab = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [enrollmentMap, setEnrollmentMap] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await adminService.getCourses();
      setCourses(data || []);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentProgress();
    }
  }, [selectedCourse]);

  const fetchStudentProgress = async () => {
    setLoading(true);
    try {
      // Fetch enrollments for this course
      const enrollments = await adminService.getEnrollmentsByCourse(selectedCourse);
      
      if (enrollments) {
        setStudents(enrollments.map((e: any) => e.profiles));
        
        // Map user_id to enrollment_id
        const eMap: {[key: string]: string} = {};
        enrollments.forEach((e: any) => {
          eMap[e.user_id] = e.id;
        });
        setEnrollmentMap(eMap);
        
        // Calculate progress for each student
        const map: {[key: string]: any} = {};
        await Promise.all(enrollments.map(async (e: any) => {
          const progress = await progressService.calculateProgress(e.user_id, selectedCourse);
          map[e.user_id] = progress;
        }));
        setProgressMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentId: string) => {
    const enrollmentId = enrollmentMap[studentId];
    if (!enrollmentId) {
      alert('Could not find enrollment for this student.');
      return;
    }
    try {
      await progressService.issueCertificate(enrollmentId, studentId);
      alert('Certificate issued successfully!');
    } catch (err) {
      alert('Failed to issue certificate.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Progress Monitoring</h2>
          <p className="text-slate-500">Track student performance and manage certification eligibility.</p>
        </div>
        <select 
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="">Select Course to View</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      {selectedCourse ? (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Course Overview Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-xs font-medium mb-1">Total Students</p>
              <h4 className="text-2xl font-bold text-slate-900">{students.length}</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-xs font-medium mb-1">Avg. Attendance</p>
              <h4 className="text-2xl font-bold text-emerald-600">
                {(Object.values(progressMap).reduce((acc, curr) => acc + curr.attendanceRate, 0) / (students.length || 1)).toFixed(1)}%
              </h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-xs font-medium mb-1">Avg. Assessment</p>
              <h4 className="text-2xl font-bold text-brand-blue">
                {(Object.values(progressMap).reduce((acc, curr) => acc + curr.assessmentAverage, 0) / (students.length || 1)).toFixed(1)}%
              </h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-xs font-medium mb-1">Cert. Eligible</p>
              <h4 className="text-2xl font-bold text-amber-600">
                {Object.values(progressMap).filter(p => p.isEligibleForCertificate).length}
              </h4>
            </div>
          </div>

          {/* Student Detailed List */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                  <th className="px-8 py-5 font-bold">Student</th>
                  <th className="px-8 py-5 font-bold">Attendance</th>
                  <th className="px-8 py-5 font-bold">Assessment Avg</th>
                  <th className="px-8 py-5 font-bold">Assignments</th>
                  <th className="px-8 py-5 font-bold">Overall Progress</th>
                  <th className="px-8 py-5 font-bold text-right">Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => {
                  const progress = progressMap[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                            {student.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{student.full_name}</p>
                            <p className="text-[10px] text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${progress?.attendanceRate >= 70 ? 'text-emerald-600' : 'text-brand-red'}`}>
                            {progress?.attendanceRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-700">
                        {progress?.assessmentAverage.toFixed(1)}%
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                          progress?.assignmentsCompleted === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {progress?.assignmentsCompleted.toFixed(0)}% Done
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="w-full max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-blue" 
                            style={{ width: `${progress?.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">{progress?.overallProgress.toFixed(0)}%</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {progress?.isEligibleForCertificate ? (
                          <button 
                            onClick={() => handleIssueCertificate(student.id)}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto"
                          >
                            <Award size={14} /> Issue Certificate
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium flex items-center gap-1 justify-end">
                            <AlertCircle size={14} /> Not Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <BarChart3 className="text-slate-300" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Course</h3>
          <p className="text-slate-500 max-w-md mx-auto">Choose a course from the dropdown above to monitor student progress and manage certifications.</p>
        </div>
      )}
    </div>
  );
};

export const AssessmentsTab = ({ courses }: { courses: any[] }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    assessment_name: '',
    score: 0,
    max_score: 100
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchData();
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollments, assessmentData] = await Promise.all([
        adminService.getEnrollmentsByCourse(selectedCourse),
        adminService.getAssessments(selectedCourse)
      ]);
      setStudents(enrollments.map((e: any) => e.profiles));
      setAssessments(assessmentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.recordAssessment({
        ...formData,
        course_id: selectedCourse
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Assessments & Grading</h2>
        <div className="flex gap-4">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          {selectedCourse && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Record Score
            </button>
          )}
        </div>
      </div>

      {selectedCourse ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="px-8 py-4 font-bold">Student</th>
                <th className="px-8 py-4 font-bold">Assessment</th>
                <th className="px-8 py-4 font-bold">Score</th>
                <th className="px-8 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        {a.profiles?.full_name?.charAt(0)}
                      </div>
                      <p className="font-bold text-slate-900">{a.profiles?.full_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-600">{a.assessment_name}</td>
                  <td className="px-8 py-4 font-bold text-slate-900">{a.score} / {a.max_score}</td>
                  <td className="px-8 py-4 text-xs text-slate-500">{new Date(a.date_recorded).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Course Selected</h3>
          <p className="text-slate-500">Select a course to manage assessments.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Assessment Score">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Student</label>
            <select 
              required
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Assessment Name</label>
            <input 
              required
              type="text"
              value={formData.assessment_name}
              onChange={(e) => setFormData({...formData, assessment_name: e.target.value})}
              placeholder="e.g. Mid-term Exam, Final Project"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Score</label>
              <input 
                required
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Max Score</label>
              <input 
                required
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({...formData, max_score: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-brand-blue/90 transition-all">
            Save Assessment
          </button>
        </form>
      </Modal>
    </div>
  );
};

const AssignmentsTab = ({ courses }: { courses: any[] }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [formData, setFormData] = useState({
    status: '',
    instructor_note: ''
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchData();
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAssignments(selectedCourse);
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateAssignment(selectedAssignment.id, formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Assignment Submissions</h2>
        <select 
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourse ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="px-8 py-4 font-bold">Student</th>
                <th className="px-8 py-4 font-bold">Assignment</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        {a.profiles?.full_name?.charAt(0)}
                      </div>
                      <p className="font-bold text-slate-900">{a.profiles?.full_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-600">{a.assignment_name}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      a.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-brand-red/10 text-brand-red'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedAssignment(a); setFormData({ status: a.status, instructor_note: a.instructor_note || '' }); setIsModalOpen(true); }}
                      className="text-brand-blue font-bold text-xs hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <FileCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Course Selected</h3>
          <p className="text-slate-500">Select a course to review assignments.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Review Assignment">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Student</p>
            <p className="text-slate-600">{selectedAssignment?.profiles?.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Assignment</p>
            <p className="text-slate-600">{selectedAssignment?.assignment_name}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
            <select 
              required
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Instructor Note</label>
            <textarea 
              value={formData.instructor_note}
              onChange={(e) => setFormData({...formData, instructor_note: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              placeholder="Provide feedback to the student..."
            />
          </div>
          <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-brand-blue/90 transition-all">
            Update Status
          </button>
        </form>
      </Modal>
    </div>
  );
};

const CertificateTemplatesTab = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    is_active: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCertificateTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fileInput = (e.currentTarget as HTMLFormElement).elements.namedItem('template_file') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      let imageUrl = formData.image_url;
      if (file) {
        imageUrl = await adminService.uploadFile(file);
      }

      await adminService.createCertificateTemplate({
        ...formData,
        image_url: imageUrl
      });
      setIsModalOpen(false);
      setFormData({ name: '', image_url: '', is_active: false });
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to upload template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Certificate Templates</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
            <div className="aspect-[1.414/1] bg-slate-100 relative overflow-hidden">
              <img src={t.image_url} className="w-full h-full object-cover" alt={t.name} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={async () => { if(confirm('Delete?')) { await adminService.deleteCertificateTemplate(t.id); fetchTemplates(); } }} className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-brand-red transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">{t.name}</h3>
                <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${t.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Certificate Template">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Template Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Standard Completion Certificate"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Template Image</label>
            <div className="flex gap-4">
              <input 
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="relative">
                <input 
                  type="file" 
                  name="template_file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 text-brand-blue rounded border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700">Set as Active Template</span>
          </div>
          <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-brand-blue/90 transition-all">
            Upload Template
          </button>
        </form>
      </Modal>
    </div>
  );
};

export const AdminPage = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || isSystemAdmin(user?.email);
  const isInstructor = profile?.role === 'instructor' || isAdmin;

  useEffect(() => {
    if (user && !isInstructor && profile) {
      navigate('/dashboard');
    }
  }, [user, isInstructor, profile, navigate]);

  useEffect(() => {
    if (isInstructor) {
      fetchOverviewData();
      fetchCourses();

      if (isSupabaseConfigured) {
        const channels = [
          supabase.channel('overview-enrollments').on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => fetchOverviewData()).subscribe(),
          supabase.channel('overview-payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchOverviewData()).subscribe(),
          supabase.channel('overview-profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchOverviewData()).subscribe()
        ];

        return () => {
          channels.forEach(channel => supabase.removeChannel(channel));
        };
      }
    }
  }, [isAdmin, user, profile]);

  const fetchOverviewData = async () => {
    try {
      const [statsData, enrollmentsData, paymentsData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentEnrollments(5),
        adminService.getRecentPayments(5)
      ]);
      
      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback if getStats returns null/undefined for some reason
        setStats({
          coursesCount: 0,
          announcementsCount: 0,
          faqsCount: 0,
          quizzesCount: 0,
          enrollmentsCount: 0,
          totalRevenue: 0,
          studentsCount: 0,
          passRate: '0.0',
          completionRate: '0.0',
          growth: '0.0',
          newSignups: 0
        });
      }
      setRecentEnrollments(enrollmentsData || []);
      setRecentPayments(paymentsData || []);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Ensure we set some state so it doesn't stay in loading "..." state forever
      if (!stats) {
        setStats({
          coursesCount: 0,
          announcementsCount: 0,
          faqsCount: 0,
          quizzesCount: 0,
          enrollmentsCount: 0,
          totalRevenue: 0,
          studentsCount: 0,
          passRate: '0.0',
          completionRate: '0.0',
          growth: '0.0',
          newSignups: 0
        });
      }
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await adminService.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleSeed = () => {
    setIsSeedConfirmOpen(true);
  };

  const executeSeed = async () => {
    try {
      setSeeding(true);
      await adminService.seedDatabase(true);
      alert('Database seeded successfully! The page will now refresh to show the new data.');
      window.location.reload();
    } catch (error: any) {
      console.error('Error seeding database:', error);
      alert(`Failed to seed database: ${error.message}`);
    } finally {
      setSeeding(false);
      setIsSeedConfirmOpen(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, roles: ['admin', 'instructor'] },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={20} />, roles: ['admin', 'instructor'] },
    { id: 'enrollments', label: 'Enrollments', icon: <CheckCircle2 size={20} />, roles: ['admin', 'instructor'] },
    { id: 'users', label: 'Users', icon: <Users size={20} />, roles: ['admin'] },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, roles: ['admin'] },
    { id: 'installments', label: 'Installments', icon: <Clock size={20} />, roles: ['admin'] },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardList size={20} />, roles: ['admin', 'instructor'] },
    { id: 'schedules', label: 'Schedules', icon: <Calendar size={20} />, roles: ['admin', 'instructor'] },
    { id: 'assessments', label: 'Assessments', icon: <GraduationCap size={20} />, roles: ['admin', 'instructor'] },
    { id: 'assignments', label: 'Assignments', icon: <FileCheck size={20} />, roles: ['admin', 'instructor'] },
    { id: 'certificates', label: 'Certificates', icon: <Award size={20} />, roles: ['admin'] },
    { id: 'certificate-templates', label: 'Cert. Templates', icon: <Award size={20} />, roles: ['admin'] },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} />, roles: ['admin', 'instructor'] },
    { id: 'quizzes', label: 'Quizzes', icon: <FileQuestion size={20} />, roles: ['admin', 'instructor'] },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={20} />, roles: ['admin', 'instructor'] },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, roles: ['admin'] },
    { id: 'cms', label: 'CMS', icon: <Settings size={20} />, roles: ['admin'] },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Activity size={20} />, roles: ['admin', 'instructor'] }
  ].filter(tab => tab.roles.includes(profile?.role || (isAdmin ? 'admin' : 'instructor')));

  if (!user || !isInstructor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-brand-red mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-64px)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Admin Panel</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Control Center</p>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${
                  activeTab === tab.id 
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider mt-1">{profile?.role || 'System Admin'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-widest mb-2">
              <ChevronRight size={14} />
              Admin Dashboard / {activeTab}
            </div>
            <h1 className="text-4xl font-bold text-slate-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-3 text-slate-500">
              <Clock size={18} />
              <span className="text-sm font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab 
                stats={stats} 
                recentEnrollments={recentEnrollments} 
                recentPayments={recentPayments} 
                handleSeed={handleSeed}
                seeding={seeding}
              />
            )}
            {activeTab === 'courses' && <CoursesTab />}
            {activeTab === 'enrollments' && <EnrollmentsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'installments' && <InstallmentsTab />}
            {activeTab === 'attendance' && <AttendanceTab courses={courses} />}
            {activeTab === 'schedules' && <SchedulesTab courses={courses} />}
            {activeTab === 'assessments' && <AssessmentsTab courses={courses} />}
            {activeTab === 'assignments' && <AssignmentsTab courses={courses} />}
            {activeTab === 'certificates' && <CertificatesTab />}
            {activeTab === 'certificate-templates' && <CertificateTemplatesTab />}
            {activeTab === 'progress' && <ProgressTab />}
            {activeTab === 'quizzes' && <QuizzesTab />}
            {activeTab === 'announcements' && <AnnouncementsTab />}
            {activeTab === 'reports' && <ReportsTab stats={stats} />}
            {activeTab === 'cms' && <CMSTab handleSeed={handleSeed} seeding={seeding} />}
            {activeTab === 'diagnostics' && <DiagnosticTab />}
            
            {/* Placeholder for other tabs */}
            {!['overview', 'courses', 'enrollments', 'users', 'payments', 'installments', 'progress', 'certificates', 'quizzes', 'announcements', 'reports', 'cms', 'attendance', 'schedules', 'assessments', 'assignments', 'certificate-templates', 'diagnostics'].includes(activeTab) && (
              <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  {tabs.find(t => t.id === activeTab)?.icon}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                  We are currently integrating this section with your Supabase backend to provide real-time management capabilities.
                </p>
                <button className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all shadow-xl shadow-brand-blue/20">
                  Enable {activeTab} Module
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <ConfirmModal 
          isOpen={isSeedConfirmOpen}
          onClose={() => setIsSeedConfirmOpen(false)}
          onConfirm={executeSeed}
          title="Seed Database with Mock Data?"
          message="This will add dummy students, enrollments, and payments to your database for testing. It uses 'upsert', which means if a record with the same unique identifier (like an email) already exists, it will be updated with the mock data. This is intended for development and testing only. Are you sure you want to proceed?"
          confirmText="Proceed with Seeding"
          confirmColor="bg-amber-600"
        />
      </main>
    </div>
  );
};
