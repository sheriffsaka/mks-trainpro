import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Search, 
  BookOpen, 
  FileText, 
  FileQuestion,
  ChevronRight,
  Filter,
  AlertCircle,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
  X,
  Loader2,
  Megaphone,
  Clock,
  ExternalLink,
  Download,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { progressService, AttendanceRecord, AssessmentRecord, AssignmentRecord } from '../services/progressService';
import { adminService } from '../services/adminService';
import { ProfileTab } from '../components/ProfileTab';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const InstructorPage = () => {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('attendance');
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'course' | 'schedule' | 'announcement' | 'material' | 'bulk-quiz' | 'quiz'>('course');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalSubTab, setModalSubTab] = useState<'general' | 'curriculum'>('general');
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [bulkQuizText, setBulkQuizText] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Attendance State
  const [selectedSession, setSelectedSession] = useState('Session 1');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'present' | 'absent'}>({});

  // Assessment State
  const [assessmentName, setAssessmentName] = useState('Module 1 Quiz');
  const [scores, setScores] = useState<{[key: string]: number}>({});

  // Assignment State
  const [assignmentName, setAssignmentName] = useState('Case Study Report');
  const [assignmentStatus, setAssignmentStatus] = useState<{[key: string]: any}>({});

  // Schedules, Announcements & Materials State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        adminService.getCourses(user?.id),
        adminService.getCategories()
      ]);
      setCourses(coursesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules') fetchSchedules();
    if (activeTab === 'announcements') fetchAnnouncements();
    if (activeTab === 'courses') fetchInitialData();
    if (activeTab === 'materials') fetchMaterials();
    if (activeTab === 'quizzes') fetchQuizzes();
  }, [activeTab]);

  useEffect(() => {
    if (selectedCourse && (activeTab === 'attendance' || activeTab === 'assessments' || activeTab === 'assignments' || activeTab === 'materials' || activeTab === 'quizzes')) {
      fetchStudents();
      if (activeTab === 'materials') fetchMaterials();
      if (activeTab === 'quizzes') fetchQuizzes();
    }
  }, [selectedCourse, activeTab]);

  const fetchQuizzes = async () => {
    try {
      const data = await adminService.getQuizzesByCourse(selectedCourse);
      setQuizzes(data || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await adminService.getCourseMaterials(selectedCourse || undefined, user?.id);
      setMaterials(data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setStudents([
          { id: '1', full_name: 'John Doe', email: 'john@example.com' },
          { id: '2', full_name: 'Mary Smith', email: 'mary@example.com' },
          { id: '3', full_name: 'Ali Khan', email: 'ali@example.com' }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles(*)')
        .eq('course_id', selectedCourse);
      
      if (error) throw error;
      setStudents(data.map((e: any) => e.profiles).filter(Boolean));
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await adminService.getSchedules();
      setSchedules(data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await adminService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const records: AttendanceRecord[] = students.map(student => ({
        user_id: student.id,
        course_id: selectedCourse,
        session_id: selectedSession,
        session_date: new Date().toISOString().split('T')[0],
        status: attendanceData[student.id] || 'absent'
      }));
      await progressService.markAttendance(records);
      alert('Attendance saved successfully!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Failed to save attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScores = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const records: AssessmentRecord[] = students.map(student => ({
        user_id: student.id,
        course_id: selectedCourse,
        assessment_name: assessmentName,
        score: scores[student.id] || 0,
        max_score: 100,
        date_recorded: new Date().toISOString()
      }));
      await progressService.recordAssessment(records);
      alert('Scores recorded successfully!');
    } catch (err) {
      console.error('Error recording scores:', err);
      alert('Failed to record scores.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (studentId: string, status: any, note: string) => {
    if (!selectedCourse) return;
    try {
      await progressService.updateAssignmentStatus({
        user_id: studentId,
        course_id: selectedCourse,
        assignment_name: assignmentName,
        status,
        instructor_note: note
      });
      alert('Assignment status updated!');
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      instructor_id: (await supabase.auth.getUser()).data.user?.id,
      modules: courseModules,
    };

    try {
      if (editingItem) {
        await adminService.updateCourse(editingItem.id, courseData);
        alert('Course updated!');
      } else {
        await adminService.createCourse(courseData);
        alert('Course created!');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      alert('Error saving course');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scheduleData = {
      course_id: formData.get('course_id'),
      title: formData.get('title'),
      description: formData.get('description'),
      meeting_link: formData.get('meeting_link'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
    };

    try {
      if (editingItem) {
        await adminService.updateSchedule(editingItem.id, scheduleData);
      } else {
        await adminService.createSchedule(scheduleData);
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const announcementData = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      created_by: (await supabase.auth.getUser()).data.user?.id
    };

    try {
      if (editingItem) {
        await adminService.updateAnnouncement(editingItem.id, announcementData);
      } else {
        await adminService.createAnnouncement(announcementData);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkQuizUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const quizTitle = formData.get('quiz_title') as string;
    const passingScore = parseInt(formData.get('passing_score') as string) || 70;

    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    if (!quizTitle) {
      alert('Please provide a quiz title');
      return;
    }
    if (!bulkQuizText.trim()) return;

    try {
      setIsBulkUploading(true);
      // Format: Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D)
      const lines = bulkQuizText.split('\n').filter(line => line.trim());
      const questions = lines.map(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 6) return null;
        
        const [question, a, b, c, d, correct] = parts;
        return {
          question,
          options: [a, b, c, d],
          correct_option: ['A', 'B', 'C', 'D'].indexOf(correct.toUpperCase())
        };
      }).filter((q): q is any => q !== null && q.question && q.options.every(o => o) && q.correct_option !== -1);

      if (questions.length === 0) {
        alert('No valid questions found. Format: Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D)');
        return;
      }

      const quizData = {
        course_id: selectedCourse,
        title: quizTitle,
        description: `Bulk uploaded quiz with ${questions.length} questions.`,
        questions: questions,
        passing_score: passingScore
      };

      await adminService.createQuiz(quizData);
      alert(`Successfully created quiz "${quizTitle}" with ${questions.length} questions`);
      setBulkQuizText('');
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      console.error('Error uploading bulk quizzes:', err);
      alert('Failed to upload quizzes');
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    if (quizQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const quizData = {
      course_id: selectedCourse,
      title: formData.get('title'),
      description: formData.get('description'),
      passing_score: parseInt(formData.get('passing_score') as string) || 70,
      questions: quizQuestions,
    };

    try {
      if (editingItem) {
        await adminService.updateQuiz(editingItem.id, quizData);
      } else {
        await adminService.createQuiz(quizData);
      }
      alert(`Quiz ${editingItem ? 'updated' : 'created'} successfully!`);
      setIsModalOpen(false);
      setEditingItem(null);
      setQuizQuestions([]);
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      alert(`Failed to save quiz: ${error.message || 'Unknown error'}`);
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correct_option: 0 }]);
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...quizQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizQuestions(newQuestions);
  };

  const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...quizQuestions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizQuestions(newQuestions);
  };

  const removeQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleMaterialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to add materials.');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const materialData = {
      course_id: formData.get('course_id'),
      title: formData.get('title'),
      description: formData.get('description'),
      file_url: formData.get('file_url'),
      type: formData.get('type'),
      instructor_id: user.id
    };

    try {
      if (editingItem) {
        await adminService.updateCourseMaterial(editingItem.id, materialData);
        alert('Material updated successfully!');
      } else {
        const result = await adminService.createCourseMaterial(materialData);
        if (result) {
          alert('Material added successfully!');
        } else {
          alert('Failed to add material. Please try again.');
        }
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      console.error('Error saving material:', err);
      alert('Error saving material. Please check your connection and try again.');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await adminService.deleteCourseMaterial(id);
      fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  const addModule = () => {
    setCourseModules([...courseModules, { title: 'New Module', lessons: [] }]);
  };

  const updateModuleTitle = (index: number, title: string) => {
    const newModules = [...courseModules];
    newModules[index].title = title;
    setCourseModules(newModules);
  };

  const deleteModule = (index: number) => {
    setCourseModules(courseModules.filter((_, i) => i !== index));
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...courseModules];
    newModules[moduleIndex].lessons.push({ title: 'New Lesson', type: 'video', duration: '10:00', content: '' });
    setCourseModules(newModules);
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: any) => {
    const newModules = [...courseModules];
    newModules[moduleIndex].lessons[lessonIndex] = { ...newModules[moduleIndex].lessons[lessonIndex], ...updates };
    setCourseModules(newModules);
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...courseModules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_: any, i: number) => i !== lessonIndex);
    setCourseModules(newModules);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Instructor Dashboard</h1>
              <p className="text-slate-500">Manage courses, students, and schedules.</p>
            </div>
          </div>

          <div className="flex gap-8 mt-12 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
              { id: 'assessments', label: 'Assessments', icon: <FileQuestion size={18} /> },
              { id: 'quizzes', label: 'Quizzes', icon: <FileQuestion size={18} /> },
              { id: 'assignments', label: 'Assignments', icon: <FileText size={18} /> },
              { id: 'materials', label: 'Course Materials', icon: <BookOpen size={18} /> },
              { id: 'courses', label: 'My Courses', icon: <BookOpen size={18} /> },
              { id: 'schedules', label: 'Class Schedules', icon: <Clock size={18} /> },
              { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
              { id: 'profile', label: 'My Profile', icon: <UserIcon size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Selection for Student-related tabs */}
        {(activeTab === 'attendance' || activeTab === 'assessments' || activeTab === 'assignments' || activeTab === 'materials' || activeTab === 'quizzes') && (
          <div className="mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                <Filter size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Filter by Course</h4>
                <p className="text-xs text-slate-500">Select a course to manage its students.</p>
              </div>
            </div>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'materials' && (
            <motion.div key="materials" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Course Materials</h2>
                <button 
                  onClick={() => {
                    setModalType('material');
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  <Plus size={20} />
                  Add Material
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${
                        material.type === 'pdf' ? 'bg-red-50 text-red-600' :
                        material.type === 'video' ? 'bg-blue-50 text-blue-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {material.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setModalType('material');
                            setEditingItem(material);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{material.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{material.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                      <a 
                        href={material.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-blue hover:text-brand-blue/80 font-bold text-sm flex items-center gap-1"
                      >
                        View <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="col-span-full bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
                    <BookOpen className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-500">No materials found for this course.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {!selectedCourse ? (
                <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
                  <BookOpen className="text-slate-300 mx-auto mb-8" size={40} />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Course</h3>
                  <p className="text-slate-500">Please select a course to mark attendance.</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Mark Attendance</h3>
                        <p className="text-sm text-slate-500">Today: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <select 
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                      >
                        {['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleSaveAttendance}
                        disabled={loading}
                        className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue-hover transition-all flex items-center gap-2"
                      >
                        <Save size={18} /> Save
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.full_name}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-4">
                                <button 
                                  onClick={() => setAttendanceData({...attendanceData, [student.id]: 'present'})}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    attendanceData[student.id] === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  <CheckCircle2 size={16} /> Present
                                </button>
                                <button 
                                  onClick={() => setAttendanceData({...attendanceData, [student.id]: 'absent'})}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    attendanceData[student.id] === 'absent' ? 'bg-brand-red/10 text-brand-red' : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  <XCircle size={16} /> Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'assessments' && (
            <motion.div key="assessments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {!selectedCourse ? (
                <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
                  <FileQuestion className="text-slate-300 mx-auto mb-8" size={40} />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Course</h3>
                  <p className="text-slate-500">Please select a course to record scores.</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <FileQuestion size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Record Scores</h3>
                        <p className="text-sm text-slate-500">Enter assessment results.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text"
                        value={assessmentName}
                        onChange={(e) => setAssessmentName(e.target.value)}
                        placeholder="Assessment Name"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none"
                      />
                      <button 
                        onClick={handleSaveScores}
                        disabled={loading}
                        className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue-hover transition-all flex items-center gap-2"
                      >
                        <Save size={18} /> Save
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4 text-center">Score (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.full_name}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={scores[student.id] || ''}
                                  onChange={(e) => setScores({...scores, [student.id]: parseInt(e.target.value)})}
                                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center font-bold outline-none"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div key="assignments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {!selectedCourse ? (
                <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
                  <FileText className="text-slate-300 mx-auto mb-8" size={40} />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Course</h3>
                  <p className="text-slate-500">Please select a course to review assignments.</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Review Assignments</h3>
                        <p className="text-sm text-slate-500">Manage student submissions.</p>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={assignmentName}
                      onChange={(e) => setAssignmentName(e.target.value)}
                      placeholder="Assignment Name"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none w-full md:w-64"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.full_name}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={assignmentStatus[student.id]?.status || 'pending'}
                                onChange={(e) => setAssignmentStatus({...assignmentStatus, [student.id]: {...assignmentStatus[student.id], status: e.target.value}})}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleUpdateAssignment(student.id, assignmentStatus[student.id]?.status || 'pending', assignmentStatus[student.id]?.note || '')}
                                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-blue transition-all"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Manage Courses</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setModalType('bulk-quiz');
                      setIsModalOpen(true);
                    }}
                    className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <FileQuestion size={20} /> Bulk Quiz Upload
                  </button>
                  <button 
                    onClick={() => { 
                      setEditingItem(null); 
                      setCourseModules([]);
                      setCourseMaterials([]);
                      setModalSubTab('general');
                      setModalType('course'); 
                      setIsModalOpen(true); 
                    }}
                    className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
                  >
                    <Plus size={20} /> Add New Course
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={course.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                  onClick={async () => { 
                    setEditingItem(course); 
                    setCourseModules(course.modules || []);
                    setModalSubTab('general');
                    setModalType('course'); 
                    setIsModalOpen(true); 
                    
                    // Fetch materials for this course
                    try {
                      const materials = await adminService.getCourseMaterials(course.id);
                      setCourseMaterials(materials || []);
                    } catch (err) {
                      console.error('Error fetching course materials:', err);
                    }
                  }} 
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-slate-600 hover:text-brand-blue transition-colors"
                >
                          <Edit size={16} />
                        </button>
                        <button onClick={async () => { if(confirm('Delete course?')) { await adminService.deleteCourse(course.id); fetchInitialData(); } }} className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-slate-600 hover:text-brand-red transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-2 block">{course.categories?.name}</span>
                      <h4 className="font-bold text-slate-900 mb-2">{course.title}</h4>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${course.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm font-bold text-slate-900">£{course.price_standard}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'schedules' && (
            <motion.div key="schedules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Class Schedules</h3>
                <button 
                  onClick={() => { setEditingItem(null); setModalType('schedule'); setIsModalOpen(true); }}
                  className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
                >
                  <Plus size={20} /> Schedule Class
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(schedule); setModalType('schedule'); setIsModalOpen(true); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-blue transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={async () => { if(confirm('Delete schedule?')) { await adminService.deleteSchedule(schedule.id); fetchSchedules(); } }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-red transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{schedule.title}</h4>
                        <p className="text-xs text-slate-500">{schedule.courses?.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} />
                        <span>{new Date(schedule.start_time).toLocaleString()}</span>
                      </div>
                      {schedule.meeting_link && (
                        <a href={schedule.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-blue font-bold hover:underline">
                          <ExternalLink size={14} /> Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Announcements</h3>
                <button 
                  onClick={() => { setEditingItem(null); setModalType('announcement'); setIsModalOpen(true); }}
                  className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
                >
                  <Plus size={20} /> New Announcement
                </button>
              </div>
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start justify-between group">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-2xl ${
                        announcement.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                        announcement.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-blue/10 text-brand-blue'
                      }`}>
                        <Megaphone size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{announcement.title}</h4>
                        <p className="text-sm text-slate-500">{announcement.content}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">{new Date(announcement.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(announcement); setModalType('announcement'); setIsModalOpen(true); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-blue transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={async () => { if(confirm('Delete announcement?')) { await adminService.deleteAnnouncement(announcement.id); fetchAnnouncements(); } }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-red transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'quizzes' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Course Quizzes</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setModalType('bulk-quiz'); setIsModalOpen(true); }}
                    className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <Upload size={20} /> Bulk Upload
                  </button>
                  <button 
                    onClick={() => { setEditingItem(null); setQuizQuestions([]); setModalType('quiz'); setIsModalOpen(true); }}
                    className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-all"
                  >
                    <Plus size={20} /> New Quiz
                  </button>
                </div>
              </div>

              {!selectedCourse ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Course</h3>
                  <p className="text-slate-500">Please select a course from the dropdown above to manage its quizzes.</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Quizzes Yet</h3>
                  <p className="text-slate-500">Create your first quiz or upload in bulk to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                          <FileQuestion size={24} />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { 
                              setEditingItem(quiz); 
                              setQuizQuestions(quiz.questions || []);
                              setModalType('quiz'); 
                              setIsModalOpen(true); 
                            }} 
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-blue transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={async () => { 
                              if(confirm('Delete this quiz?')) { 
                                await adminService.deleteQuiz(quiz.id); 
                                fetchQuizzes(); 
                              } 
                            }} 
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-red transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{quiz.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{quiz.description || 'No description provided.'}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          Pass: {quiz.passing_score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab />
          )}
        </AnimatePresence>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? `Edit ${modalType}` : `New ${modalType}`}
      >
        {modalType === 'material' && (
          <form onSubmit={handleMaterialSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Course</label>
                <select 
                  name="course_id" 
                  required
                  defaultValue={editingItem?.course_id || selectedCourse}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Material Type</label>
                <select 
                  name="type" 
                  required
                  defaultValue={editingItem?.type || 'pdf'}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video Lecture</option>
                  <option value="document">Word/Text Document</option>
                  <option value="link">External Link</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input 
                name="title" 
                type="text" 
                required 
                defaultValue={editingItem?.title}
                placeholder="e.g. Introduction to SAP Module 1"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea 
                name="description" 
                rows={3}
                defaultValue={editingItem?.description}
                placeholder="Briefly describe what this material covers..."
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">File URL / Link</label>
              <input 
                name="file_url" 
                type="text" 
                required 
                defaultValue={editingItem?.file_url}
                placeholder="https://..."
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 rounded-2xl font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-4 rounded-2xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                {editingItem ? 'Update Material' : 'Add Material'}
              </button>
            </div>
          </form>
        )}

        {modalType === 'course' && (
          <form onSubmit={handleCourseSubmit} className="flex flex-col h-full">
            <div className="flex gap-4 border-b border-slate-100 pb-4 mb-8 shrink-0">
              <button 
                onClick={() => setModalSubTab('general')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalSubTab === 'general' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                General Info
              </button>
              <button 
                onClick={() => setModalSubTab('curriculum')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalSubTab === 'curriculum' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Curriculum
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className={modalSubTab === 'general' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                    <input name="title" type="text" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select name="category_id" defaultValue={editingItem?.category_id} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Standard Price (£)</label>
                      <input name="price_standard" type="number" defaultValue={editingItem?.price_standard} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Platinum Price (£)</label>
                      <input name="price_platinum" type="number" defaultValue={editingItem?.price_platinum} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                    <input name="image_url" type="text" defaultValue={editingItem?.image_url} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Course Mode</label>
                    <select name="mode" defaultValue={editingItem?.mode || 'vod'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="virtual">Virtual</option>
                      <option value="vod">VOD</option>
                      <option value="physical">Physical</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <input name="is_published" type="checkbox" defaultChecked={editingItem?.is_published} className="w-5 h-5 text-brand-blue rounded border-slate-300" />
                    <span className="text-sm font-bold text-slate-900">Publish Immediately</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea name="description" rows={4} defaultValue={editingItem?.description} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
                </div>
                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-slate-600">Cancel</button>
                    <button type="submit" className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold">Save Course</button>
                  </div>
                </div>
              </div>

              <div className={modalSubTab === 'curriculum' ? 'block' : 'hidden'}>
                <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-slate-900">Course Modules</h4>
                  <button 
                    onClick={addModule}
                    className="text-brand-blue font-bold flex items-center gap-2 hover:bg-brand-blue/5 px-4 py-2 rounded-xl transition-all"
                  >
                    <Plus size={18} /> Add Module
                  </button>
                </div>

                <div className="space-y-6">
                  {courseModules.map((module, mIdx) => (
                    <div key={mIdx} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 mr-4">
                          <input 
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                            className="w-full bg-transparent text-lg font-bold text-slate-900 border-b border-transparent focus:border-brand-blue outline-none py-1"
                            placeholder="Module Title"
                          />
                        </div>
                        <button 
                          onClick={() => deleteModule(mIdx)}
                          className="p-2 text-slate-400 hover:text-brand-red transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {module.lessons.map((lesson: any, lIdx: number) => (
                          <div key={lIdx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 group">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              {lesson.type === 'video' ? <Play size={14} /> : lesson.type === 'quiz' ? <FileQuestion size={14} /> : <FileText size={14} />}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input 
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(mIdx, lIdx, { title: e.target.value })}
                                className="text-sm font-bold text-slate-900 outline-none border-b border-transparent focus:border-brand-blue py-1"
                                placeholder="Lesson Title"
                              />
                              <select 
                                value={lesson.type}
                                onChange={(e) => updateLesson(mIdx, lIdx, { type: e.target.value })}
                                className="text-xs text-slate-500 bg-transparent outline-none"
                              >
                                <option value="video">Video</option>
                                <option value="reading">Reading</option>
                                <option value="quiz">Quiz</option>
                              </select>
                              <select 
                                value={lesson.content || ''}
                                onChange={(e) => {
                                  const material = courseMaterials.find(m => m.file_url === e.target.value);
                                  if (material) {
                                    updateLesson(mIdx, lIdx, { 
                                      content: material.file_url,
                                      title: lesson.title === 'New Lesson' ? material.title : lesson.title,
                                      type: material.type === 'video' ? 'video' : 'reading'
                                    });
                                  } else {
                                    updateLesson(mIdx, lIdx, { content: e.target.value });
                                  }
                                }}
                                className="text-xs text-slate-500 bg-transparent outline-none"
                              >
                                <option value="">Select Material</option>
                                {courseMaterials.map(m => (
                                  <option key={m.id} value={m.file_url}>{m.title}</option>
                                ))}
                                <option value="custom">Custom URL...</option>
                              </select>
                              <input 
                                type="text"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(mIdx, lIdx, { duration: e.target.value })}
                                className="text-xs text-slate-500 outline-none border-b border-transparent focus:border-brand-blue py-1"
                                placeholder="Duration (e.g. 10:00)"
                              />
                            </div>
                            {lesson.content && lesson.content !== 'custom' && (
                              <div className="text-[10px] text-brand-blue font-bold truncate max-w-[100px]">
                                {lesson.content}
                              </div>
                            )}
                            {lesson.content === 'custom' && (
                              <input 
                                type="text"
                                onChange={(e) => updateLesson(mIdx, lIdx, { content: e.target.value })}
                                className="text-xs text-slate-500 outline-none border-b border-brand-blue py-1 w-32"
                                placeholder="Enter URL"
                              />
                            )}
                            <button 
                              onClick={() => deleteLesson(mIdx, lIdx)}
                              className="p-2 text-slate-300 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addLesson(mIdx)}
                          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-bold hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Add Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                  <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setModalSubTab('general')}
                      className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Back to General Info
                    </button>
                    <button 
                      type="submit"
                      className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
                    >
                      <Save size={20} /> Save All Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {modalType === 'schedule' && (
          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Course</label>
              <select name="course_id" defaultValue={editingItem?.course_id} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
              <input name="title" type="text" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                <input name="start_time" type="datetime-local" defaultValue={editingItem?.start_time?.slice(0, 16)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                <input name="end_time" type="datetime-local" defaultValue={editingItem?.end_time?.slice(0, 16)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Link</label>
              <input name="meeting_link" type="url" defaultValue={editingItem?.meeting_link} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-slate-600">Cancel</button>
              <button type="submit" className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold">Save Schedule</button>
            </div>
          </form>
        )}

        {modalType === 'announcement' && (
          <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
              <input name="title" type="text" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
              <select name="type" defaultValue={editingItem?.type || 'info'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
              <textarea name="content" rows={4} defaultValue={editingItem?.content} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-slate-600">Cancel</button>
              <button type="submit" className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold">Post Announcement</button>
            </div>
          </form>
        )}

        {modalType === 'quiz' && (
          <form onSubmit={handleQuizSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
                <input name="title" type="text" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Passing Score (%)</label>
                <input name="passing_score" type="number" defaultValue={editingItem?.passing_score || 70} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Questions ({quizQuestions.length})</h4>
                <button type="button" onClick={addQuizQuestion} className="text-brand-blue text-sm font-bold flex items-center gap-1">
                  <Plus size={16} /> Add Question
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 relative">
                    <button 
                      type="button" 
                      onClick={() => removeQuizQuestion(qIdx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-brand-red transition-colors"
                    >
                      <X size={18} />
                    </button>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question {qIdx + 1}</label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={(e) => updateQuizQuestion(qIdx, 'question', e.target.value)}
                        placeholder="Enter your question here"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`correct-${qIdx}`}
                            checked={q.correct_option === oIdx}
                            onChange={() => updateQuizQuestion(qIdx, 'correct_option', oIdx)}
                          />
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => updateQuizOption(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-slate-600">Cancel</button>
              <button type="submit" className="bg-brand-blue text-white px-10 py-3 rounded-xl font-bold">
                {editingItem ? 'Update Quiz' : 'Create Quiz'}
              </button>
            </div>
          </form>
        )}

        {modalType === 'bulk-quiz' && (
          <form onSubmit={handleBulkQuizUpload} className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                <AlertCircle size={16} /> Bulk Upload Format (CSV)
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Each line should be: <code className="bg-white/50 px-1 rounded">Question, Option A, Option B, Option C, Option D, Correct (A/B/C/D)</code>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
                <input name="quiz_title" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Passing Score (%)</label>
                <input name="passing_score" type="number" defaultValue={70} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Data (CSV Format)</label>
              <textarea 
                required
                rows={10}
                value={bulkQuizText}
                onChange={(e) => setBulkQuizText(e.target.value)}
                placeholder="What is SAP?, Systems Applications and Products, Software and Programs, System and Process, None, A"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={isBulkUploading}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isBulkUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Create Quiz from CSV
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
