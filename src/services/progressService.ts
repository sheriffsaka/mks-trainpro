import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AttendanceRecord {
  id?: string;
  user_id: string;
  course_id: string;
  session_id: string;
  session_date: string;
  status: 'present' | 'absent' | 'late';
  created_at?: string;
}

export interface AssessmentRecord {
  id?: string;
  user_id: string;
  course_id: string;
  assessment_name: string;
  score: number;
  max_score: number;
  date_recorded: string;
}

export interface AssignmentRecord {
  id?: string;
  user_id: string;
  course_id: string;
  assignment_name: string;
  status: 'submitted' | 'pending' | 'approved' | 'rejected';
  instructor_note?: string;
  updated_at?: string;
}

export interface ProgressData {
  attendanceRate: number;
  assessmentAverage: number;
  assignmentsCompleted: number;
  overallProgress: number;
  isEligibleForCertificate: boolean;
}

export const progressService = {
  // Attendance
  async markAttendance(records: AttendanceRecord[]) {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'user_id,course_id,session_id' });
    if (error) throw error;
    return data;
  },

  async getAttendance(courseId: string, sessionId?: string) {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('course_id', courseId);
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Assessments
  async recordAssessment(records: AssessmentRecord[]) {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('assessments')
      .upsert(records, { onConflict: 'user_id,course_id,assessment_name' });
    if (error) throw error;
    return data;
  },

  async getAssessments(courseId: string, userId?: string) {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('assessments')
      .select('*')
      .eq('course_id', courseId);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Assignments
  async updateAssignmentStatus(record: AssignmentRecord) {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('assignments')
      .upsert([record], { onConflict: 'user_id,course_id,assignment_name' });
    if (error) throw error;
    return data;
  },

  async getAssignments(courseId: string, userId?: string) {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('assignments')
      .select('*')
      .eq('course_id', courseId);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Progress Calculation
  async calculateProgress(userId: string, courseId: string): Promise<ProgressData> {
    if (!isSupabaseConfigured) {
      return {
        attendanceRate: 80,
        assessmentAverage: 75,
        assignmentsCompleted: 100,
        overallProgress: 82,
        isEligibleForCertificate: true
      };
    }

    const [attendance, assessments, assignments] = await Promise.all([
      this.getAttendance(courseId),
      this.getAssessments(courseId, userId),
      this.getAssignments(courseId, userId)
    ]);

    // Filter attendance for this student
    const studentAttendance = attendance.filter((a: any) => a.user_id === userId);
    const totalSessions = 5; // This should ideally come from course_sessions table
    const attendanceRate = totalSessions > 0 ? (studentAttendance.filter((a: any) => a.status === 'present').length / totalSessions) * 100 : 0;

    const assessmentAverage = assessments.length > 0 
      ? (assessments.reduce((acc: number, curr: any) => acc + (curr.score / curr.max_score), 0) / assessments.length) * 100 
      : 0;

    const totalAssignments = 3; // Should come from course config
    const approvedAssignments = assignments.filter((a: any) => a.status === 'approved').length;
    const assignmentsCompleted = totalAssignments > 0 ? (approvedAssignments / totalAssignments) * 100 : 0;

    const overallProgress = (0.4 * attendanceRate) + (0.4 * assessmentAverage) + (0.2 * assignmentsCompleted);

    const isEligibleForCertificate = 
      attendanceRate >= 70 && 
      assessmentAverage >= 60 && 
      approvedAssignments === totalAssignments;

    return {
      attendanceRate,
      assessmentAverage,
      assignmentsCompleted,
      overallProgress,
      isEligibleForCertificate
    };
  },

  // Certificates
  async issueCertificate(enrollmentId: string, userId: string) {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        enrollment_id: enrollmentId,
        user_id: userId,
        issued_at: new Date().toISOString(),
        certificate_url: `/verify/cert-${enrollmentId.substring(0, 8)}`
      }]);
    if (error) throw error;
    return data;
  },

  async markEnrollmentCompleted(enrollmentId: string) {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status: 'completed' })
      .eq('id', enrollmentId);
    if (error) throw error;
    return data;
  }
};
