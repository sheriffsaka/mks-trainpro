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
  MessageSquare
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { progressService, AttendanceRecord, AssessmentRecord, AssignmentRecord } from '../services/progressService';
import { adminService } from '../services/adminService';
import { MOCK_COURSES } from '../data/mockData';

export const InstructorPage = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [courses, setCourses] = useState<any[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Attendance State
  const [selectedSession, setSelectedSession] = useState('Session 1');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'present' | 'absent'}>({});

  // Assessment State
  const [assessmentName, setAssessmentName] = useState('Module 1 Quiz');
  const [scores, setScores] = useState<{[key: string]: number}>({});

  // Assignment State
  const [assignmentName, setAssignmentName] = useState('Case Study Report');
  const [assignmentStatus, setAssignmentStatus] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await adminService.getCourses();
        if (data && data.length > 0) setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

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
      setStudents(data.map((e: any) => e.profiles));
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const records: AttendanceRecord[] = students.map(student => ({
        student_id: student.id,
        course_id: selectedCourse,
        session_id: selectedSession,
        date: new Date().toISOString().split('T')[0],
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
        student_id: student.id,
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
        student_id: studentId,
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Instructor Dashboard</h1>
              <p className="text-slate-500">Manage classroom attendance, assessments, and assignments.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="flex-1 md:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-8 mt-12 border-b border-slate-100">
            {[
              { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
              { id: 'assessments', label: 'Assessments', icon: <FileQuestion size={18} /> },
              { id: 'assignments', label: 'Assignments', icon: <FileText size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
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
        {!selectedCourse ? (
          <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="text-slate-300" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Course</h3>
            <p className="text-slate-500 max-w-md mx-auto">Please select a course from the dropdown above to manage student progress.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Mark Attendance</h3>
                        <p className="text-sm text-slate-500">Record student presence for today's session.</p>
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
                        <Save size={18} /> Save Attendance
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.full_name}</td>
                            <td className="px-6 py-4 text-slate-500">{student.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-4">
                                <button 
                                  onClick={() => setAttendanceData({...attendanceData, [student.id]: 'present'})}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    attendanceData[student.id] === 'present' 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  <CheckCircle2 size={16} /> Present
                                </button>
                                <button 
                                  onClick={() => setAttendanceData({...attendanceData, [student.id]: 'absent'})}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    attendanceData[student.id] === 'absent' 
                                      ? 'bg-brand-red/10 text-brand-red' 
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
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
              </motion.div>
            )}

            {activeTab === 'assessments' && (
              <motion.div
                key="assessments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <FileQuestion size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Record Assessment Scores</h3>
                        <p className="text-sm text-slate-500">Enter quiz or test results for each student.</p>
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
                        <Save size={18} /> Save Scores
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4 text-center">Score (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{student.full_name}</td>
                            <td className="px-6 py-4 text-slate-500">{student.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={scores[student.id] || ''}
                                  onChange={(e) => setScores({...scores, [student.id]: parseInt(e.target.value)})}
                                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center font-bold outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-blue/10 p-3 rounded-2xl text-brand-blue">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Review Assignments</h3>
                        <p className="text-sm text-slate-500">Approve or reject student coursework submissions.</p>
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
                          <th className="px-6 py-4">Feedback</th>
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
                            <td className="px-6 py-4">
                              <input 
                                type="text"
                                value={assignmentStatus[student.id]?.note || ''}
                                onChange={(e) => setAssignmentStatus({...assignmentStatus, [student.id]: {...assignmentStatus[student.id], note: e.target.value}})}
                                placeholder="Add feedback..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none"
                              />
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
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
