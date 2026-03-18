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
  Image as ImageIcon,
  ChevronRight,
  Download
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { MOCK_COURSES, MOCK_CATEGORIES, MOCK_FAQS, MOCK_ANNOUNCEMENTS, MOCK_QUIZZES } from '../data/mockData';

import { adminService } from '../services/adminService';
import { progressService } from '../services/progressService';
import { Award } from 'lucide-react';

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

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => (
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
          className="flex-1 px-6 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red-hover transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </Modal>
);

const OverviewTab = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback stats for presentation
        setStats({
          coursesCount: MOCK_COURSES.length,
          announcementsCount: MOCK_ANNOUNCEMENTS.length,
          faqsCount: MOCK_FAQS.length,
          quizzesCount: MOCK_QUIZZES.length
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '£45,230', trend: '+12.5%', icon: <DollarSign className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Total Students', value: '1,284', trend: '+8.2%', icon: <Users className="text-brand-blue" />, bg: 'bg-brand-blue/5' },
          { label: 'Active Courses', value: stats?.coursesCount || MOCK_COURSES.length, trend: '+2', icon: <BookOpen className="text-brand-red" />, bg: 'bg-brand-red/5' },
          { label: 'Pending Payments', value: '£1,250', trend: '-5%', icon: <CreditCard className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Total Quizzes', value: stats?.quizzesCount || MOCK_QUIZZES.length, trend: '+4', icon: <FileQuestion className="text-indigo-600" />, bg: 'bg-indigo-50' },
          { label: 'Announcements', value: stats?.announcementsCount || MOCK_ANNOUNCEMENTS.length, trend: 'Active', icon: <Megaphone className="text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Pass Rate', value: '94.2%', trend: '+1.5%', icon: <CheckCircle2 className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'New Signups', value: '48', trend: '+12', icon: <UserPlus className="text-blue-600" />, bg: 'bg-blue-50' }
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
            <p className="text-xl font-bold text-slate-900">24.8%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Course Completion</p>
            <p className="text-xl font-bold text-slate-900">82%</p>
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
                {[
                  { name: 'John Doe', email: 'john@example.com', course: 'Level 3 Adult Care', date: '2 mins ago', status: 'Paid' },
                  { name: 'Jane Smith', email: 'jane@example.com', course: 'SIA Door Supervisor', date: '1 hour ago', status: 'Pending' },
                  { name: 'Robert Brown', email: 'robert@example.com', course: 'Functional Skills English', date: '3 hours ago', status: 'Paid' },
                  { name: 'Alice Wilson', email: 'alice@example.com', course: 'Level 5 Leadership', date: '5 hours ago', status: 'Paid' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{row.name}</p>
                          <p className="text-xs text-slate-500">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{row.course}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                        row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
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
        </div>
      </div>
    </div>
  );
};

const CoursesTab = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminService.getCourses();
      if (data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses(MOCK_COURSES);
      }
    } catch (err) {
      setCourses(MOCK_COURSES);
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
    const courseData = {
      title: formData.get('title'),
      category_id: formData.get('category_id'),
      price_standard: parseFloat(formData.get('price_standard') as string),
      price_platinum: parseFloat(formData.get('price_platinum') as string),
      image_url: formData.get('image_url'),
      description: formData.get('description'),
      duration: formData.get('duration'),
      is_published: formData.get('is_published') === 'on',
    };

    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, courseData);
      } else {
        await adminService.createCourse(courseData);
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      console.error('Error saving course:', err);
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
                        {MOCK_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Image URL</label>
                      <div className="flex gap-4">
                        <input 
                          name="image_url"
                          type="text" 
                          defaultValue={editingCourse?.image_url}
                          placeholder="https://..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                          <ImageIcon size={20} />
                        </button>
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

const PaymentsTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
        <h3 className="text-3xl font-bold text-slate-900">£45,230.00</h3>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-slate-500 text-sm font-medium mb-1">Pending Deposits</p>
        <h3 className="text-3xl font-bold text-amber-600">£1,250.00</h3>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-slate-500 text-sm font-medium mb-1">Refunds (30d)</p>
        <h3 className="text-3xl font-bold text-brand-red">£150.00</h3>
      </div>
    </div>

    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Transaction History</h3>
        <div className="flex gap-2">
          <button className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">All</button>
          <button className="bg-white text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">Successful</button>
          <button className="bg-white text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">Failed</button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
            <th className="px-8 py-5 font-bold">Transaction ID</th>
            <th className="px-8 py-5 font-bold">Student</th>
            <th className="px-8 py-5 font-bold">Course</th>
            <th className="px-8 py-5 font-bold">Amount</th>
            <th className="px-8 py-5 font-bold">Status</th>
            <th className="px-8 py-5 font-bold text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[
            { id: 'TXN-98231', student: 'John Doe', course: 'Level 3 Adult Care', amount: '£50.00', status: 'Success', date: 'Mar 01, 2026' },
            { id: 'TXN-98232', student: 'Jane Smith', course: 'SIA Door Supervisor', amount: '£299.00', status: 'Success', date: 'Mar 01, 2026' },
            { id: 'TXN-98233', student: 'Robert Brown', course: 'Functional Skills English', amount: '£50.00', status: 'Failed', date: 'Feb 28, 2026' },
          ].map((txn) => (
            <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5 font-mono text-xs font-bold text-slate-500">{txn.id}</td>
              <td className="px-8 py-5 font-bold text-slate-900">{txn.student}</td>
              <td className="px-8 py-5 text-sm text-slate-600">{txn.course}</td>
              <td className="px-8 py-5 font-bold text-slate-900">{txn.amount}</td>
              <td className="px-8 py-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  txn.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-red/10 text-brand-red'
                }`}>
                  {txn.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right text-sm text-slate-500">{txn.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const QuizzesTab = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

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
      if (data && data.length > 0) {
        setQuizzes(data);
      } else {
        setQuizzes(MOCK_QUIZZES);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes(MOCK_QUIZZES);
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
      }
      setIsModalOpen(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Manage Quizzes</h3>
        <button 
          onClick={() => { setEditingQuiz(null); setIsModalOpen(true); }}
          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
        >
          <Plus size={20} /> Create New Quiz
        </button>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Course ID</label>
              <input 
                name="course_id"
                type="text" 
                defaultValue={editingQuiz?.course_id}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g. level-3-adult-care"
              />
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
      if (data && data.length > 0) {
        setAnnouncements(data);
      } else {
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
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
      target: formData.get('target'),
      status: formData.get('status'),
      type: formData.get('type'),
    };

    try {
      if (editingAnn) {
        await adminService.updateAnnouncement(editingAnn.id, annData);
      } else {
        await adminService.createAnnouncement(annData);
      }
      setIsModalOpen(false);
      setEditingAnn(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      // Mock save for presentation
      if (editingAnn) {
        setAnnouncements(prev => prev.map(a => a.id === editingAnn.id ? { ...a, ...annData } : a));
      } else {
        setAnnouncements(prev => [{ id: `a-${Date.now()}`, ...annData, created_at: new Date().toISOString() }, ...prev]);
      }
      setIsModalOpen(false);
      setEditingAnn(null);
    }
  };

  const handleDelete = async () => {
    if (!annToDelete) return;
    try {
      await adminService.deleteAnnouncement(annToDelete);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      // Mock delete for presentation
      setAnnouncements(prev => prev.filter(a => a.id !== annToDelete));
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
                  ann.type === 'Alert' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'
                }`}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{ann.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="font-medium">Target: {ann.target}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  ann.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ann.status}
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
              <select name="target" defaultValue={editingAnn?.target || 'All Users'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>All Users</option>
                <option>All Students</option>
                <option>Platinum Members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
              <select name="type" defaultValue={editingAnn?.type || 'Update'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>Update</option>
                <option>Info</option>
                <option>Alert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
            <select name="status" defaultValue={editingAnn?.status || 'Active'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option>Active</option>
              <option>Expired</option>
            </select>
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

const ReportsTab = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
            <TrendingUp size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Monthly Growth</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">+24.5%</p>
        <p className="text-xs text-slate-500 mt-2">Compared to last month</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Completion Rate</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">78.2%</p>
        <p className="text-xs text-slate-500 mt-2">Average across all courses</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-red/5 rounded-2xl text-brand-red">
            <Users size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Active Students</h4>
        </div>
        <p className="text-3xl font-bold text-slate-900">1,452</p>
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
        {[45, 60, 55, 85, 70, 95].map((val, i) => (
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

const CMSTab = () => {
  const [settings, setSettings] = useState<any>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<any>(null);

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
      if (faqsData && faqsData.length > 0) {
        setFaqs(faqsData);
      } else {
        setFaqs(MOCK_FAQS);
      }
    } catch (error) {
      console.error('Error fetching CMS data:', error);
      setFaqs(MOCK_FAQS);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: string) => {
    try {
      await adminService.updateSetting(key, value);
      setSettings({ ...settings, [key]: value });
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      // Mock update for presentation
      setSettings({ ...settings, [key]: value });
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
    } catch (error) {
      console.error('Error saving FAQ:', error);
      // Mock save for presentation
      if (editingFaq) {
        setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...faqData } : f));
      } else {
        setFaqs(prev => [{ id: `f-${Date.now()}`, ...faqData }, ...prev]);
      }
      setIsFaqModalOpen(false);
      setEditingFaq(null);
    }
  };

  const handleFaqDelete = async () => {
    if (!faqToDelete) return;
    try {
      await adminService.deleteFAQ(faqToDelete);
      fetchCMSData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      // Mock delete for presentation
      setFaqs(prev => prev.filter(f => f.id !== faqToDelete));
    }
  };

  if (loading) return <div className="text-center py-20">Loading CMS...</div>;

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Site Settings */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
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
  const [loading, setLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await adminService.getCourses();
      if (data) setCourses(data);
      else setCourses(MOCK_COURSES);
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
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('*, profiles(*)')
        .eq('course_id', selectedCourse);
      
      if (enrollments) {
        setStudents(enrollments.map((e: any) => e.profiles));
        
        // Calculate progress for each student
        const map: {[key: string]: any} = {};
        await Promise.all(enrollments.map(async (e: any) => {
          const progress = await progressService.calculateProgress(e.user_id, selectedCourse);
          map[e.user_id] = progress;
        }));
        setProgressMap(map);
      } else {
        // Mock data
        const mockStudents = [
          { id: '1', full_name: 'John Doe', email: 'john@example.com' },
          { id: '2', full_name: 'Mary Smith', email: 'mary@example.com' },
          { id: '3', full_name: 'Ali Khan', email: 'ali@example.com' }
        ];
        setStudents(mockStudents);
        const map: {[key: string]: any} = {
          '1': { attendanceRate: 80, assessmentAverage: 75, assignmentsCompleted: 100, overallProgress: 82, isEligibleForCertificate: true },
          '2': { attendanceRate: 40, assessmentAverage: 50, assignmentsCompleted: 33, overallProgress: 42, isEligibleForCertificate: false },
          '3': { attendanceRate: 100, assessmentAverage: 95, assignmentsCompleted: 100, overallProgress: 98, isEligibleForCertificate: true }
        };
        setProgressMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentId: string) => {
    try {
      await progressService.issueCertificate(studentId, selectedCourse);
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

export const AdminPage = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = profile?.role === 'admin' || user?.email === 'sheriffdeenalade@gmail.com';

  useEffect(() => {
    if (user && !isAdmin && profile) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, profile, navigate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <FileQuestion size={20} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'cms', label: 'CMS', icon: <Settings size={20} /> }
  ];

  if (!user || !isAdmin) {
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
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">System Admin</p>
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
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'courses' && <CoursesTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'progress' && <ProgressTab />}
            {activeTab === 'quizzes' && <QuizzesTab />}
            {activeTab === 'announcements' && <AnnouncementsTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'cms' && <CMSTab />}
            
            {/* Placeholder for other tabs */}
            {!['overview', 'courses', 'users', 'payments', 'quizzes', 'announcements', 'reports', 'cms'].includes(activeTab) && (
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
      </main>
    </div>
  );
};
