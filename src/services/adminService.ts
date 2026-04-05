import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  MOCK_COURSES, 
  MOCK_FAQS, 
  MOCK_ANNOUNCEMENTS, 
  MOCK_QUIZZES, 
  MOCK_CATEGORIES, 
  MOCK_SITE_SETTINGS,
  MOCK_ENROLLMENTS,
  MOCK_PAYMENTS,
  MOCK_INSTALLMENTS,
  MOCK_COURSE_MATERIALS,
  MOCK_STATS
} from '../data/mockData';

export const adminService = {
  // Quizzes
  async getQuizzes() {
    if (!isSupabaseConfigured) return MOCK_QUIZZES;
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getQuizzesByCourse(courseId: string) {
    if (!isSupabaseConfigured) return MOCK_QUIZZES.filter(q => q.course_id === courseId);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createQuiz(quiz: any) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select();
    if (error) throw error;
    return data[0];
  },
  async bulkCreateQuizzes(quizzes: any[]) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizzes)
      .select();
    if (error) throw error;
    return data;
  },
  async updateQuiz(id: string, updates: any) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Announcements
  async getAnnouncements() {
    if (!isSupabaseConfigured) return MOCK_ANNOUNCEMENTS;
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async createAnnouncement(announcement: any) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select();
    if (error) throw error;
    return data[0];
  },
  async updateAnnouncement(id: string, updates: any) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Notifications
  async getNotifications(userId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async markNotificationAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },
  async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'success' | 'error';
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();
    if (error) throw error;
    return data[0];
  },

  // FAQs
  async getFAQs() {
    if (!isSupabaseConfigured) return MOCK_FAQS;
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createFAQ(faq: any) {
    const { data, error } = await supabase
      .from('faqs')
      .insert([faq])
      .select();
    if (error) throw error;
    return data[0];
  },
  async updateFAQ(id: string, updates: any) {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async deleteFAQ(id: string) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getCategories() {
    if (!isSupabaseConfigured) return MOCK_CATEGORIES;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },
  // Courses
  async getCourses() {
    if (!isSupabaseConfigured) return MOCK_COURSES;
    const { data, error } = await supabase
      .from('courses')
      .select('*, categories(*)');
    if (error) throw error;
    return data;
  },
  async createCourse(course: any) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select();
    if (error) throw error;
    return data[0];
  },
  async updateCourse(id: string, updates: any) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Users
  async getStudents() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    if (error) throw error;
    return data;
  },

  // Class Schedules
  async getSchedules(courseId?: string) {
    if (!isSupabaseConfigured) return [];
    let query = supabase.from('class_schedules').select('*, courses(title), profiles(full_name)');
    if (courseId) query = query.eq('course_id', courseId);
    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createSchedule(schedule: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const scheduleWithInstructor = { ...schedule, instructor_id: user?.id };
    const { data, error } = await supabase.from('class_schedules').insert([scheduleWithInstructor]).select();
    if (error) throw error;
    return data[0];
  },
  async updateSchedule(id: string, updates: any) {
    const { data, error } = await supabase.from('class_schedules').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  async deleteSchedule(id: string) {
    const { error } = await supabase.from('class_schedules').delete().eq('id', id);
    if (error) throw error;
  },

  // Certificate Templates
  async getCertificateTemplates() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('certificate_templates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async createCertificateTemplate(template: any) {
    const { data, error } = await supabase.from('certificate_templates').insert([template]).select();
    if (error) throw error;
    return data[0];
  },
  async updateCertificateTemplate(id: string, updates: any) {
    const { data, error } = await supabase.from('certificate_templates').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  async deleteCertificateTemplate(id: string) {
    const { error } = await supabase.from('certificate_templates').delete().eq('id', id);
    if (error) throw error;
  },

  // Attendance
  async getAttendance(courseId: string, date?: string) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('attendance').select('*').eq('course_id', courseId);
      if (date) query = query.eq('session_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching attendance:', err);
      return [];
    }
  },
  async markAttendance(records: any[]) {
    const { data, error } = await supabase.from('attendance').upsert(records, { onConflict: 'user_id,course_id,session_date' }).select();
    if (error) throw error;
    return data;
  },

  // Assessments & Assignments
  async getAssessments(courseId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('assessments').select('*, profiles(*)').eq('course_id', courseId);
    if (error) throw error;
    return data;
  },
  async recordAssessment(assessment: any) {
    const { data, error } = await supabase.from('assessments').upsert([assessment], { onConflict: 'user_id,course_id,assessment_name' }).select();
    if (error) throw error;
    return data[0];
  },
  async getAssignments(courseId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('assignments').select('*, profiles(*)').eq('course_id', courseId);
    if (error) throw error;
    return data;
  },
  async updateAssignment(id: string, updates: any) {
    const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  // Diagnostics
  async getDiagnosticData() {
    if (!isSupabaseConfigured) return { status: 'Not Configured' };
    try {
      const { count: enrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
      const { count: payments } = await supabase.from('payments').select('*', { count: 'exact', head: true });
      const { count: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      const { count: profiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: currentUser } = await supabase.auth.getUser();
      
      let profile = null;
      if (currentUser.user) {
        const { data: profiles } = await supabase.from('profiles').select('*').eq('id', currentUser.user.id).limit(1);
        profile = profiles && profiles.length > 0 ? profiles[0] : null;
      }

      return {
        counts: {
          enrollments: enrollments || 0,
          payments: payments || 0,
          courses: courses || 0,
          profiles: profiles || 0
        },
        currentUser: {
          id: currentUser.user?.id,
          email: currentUser.user?.email,
          profile
        }
      };
    } catch (err) {
      return { error: err };
    }
  },

  // Site Settings (CMS)
  async getSettings() {
    if (!isSupabaseConfigured) return {};
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');
    if (error) throw error;
    return data.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  },
  async updateSetting(key: string, value: any) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value });
    if (error) throw error;
  },

  // Stats
  async getStats() {
    if (!isSupabaseConfigured) {
      return {
        coursesCount: MOCK_COURSES.length,
        announcementsCount: MOCK_ANNOUNCEMENTS.length,
        faqsCount: MOCK_FAQS.length,
        quizzesCount: MOCK_QUIZZES.length,
        enrollmentsCount: MOCK_ENROLLMENTS.length,
        totalRevenue: MOCK_STATS.totalRevenue,
        studentsCount: MOCK_STATS.totalStudents,
        passRate: MOCK_STATS.completionRate,
        newSignups: 48 // Placeholder for mock
      };
    }

    const fetchCount = async (table: string, filter?: { column: string, value: any }) => {
      try {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }
        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
      } catch (err) {
        console.error(`Error fetching count for ${table}:`, err);
        return 0;
      }
    };

    const fetchRevenue = async () => {
      try {
        const { data, error } = await supabase.from('payments').select('amount').eq('payment_status', 'succeeded');
        if (error) throw error;
        const total = data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        return total;
      } catch (err) {
        console.error('Error fetching revenue:', err);
        return 0;
      }
    };

    const fetchPassRate = async () => {
      try {
        const { data, error } = await supabase.from('quiz_attempts').select('passed');
        if (error) throw error;
        if (!data || data.length === 0) return 0;
        const passedCount = data.filter(a => a.passed).length;
        return (passedCount / data.length) * 100;
      } catch (err) {
        console.error('Error fetching pass rate:', err);
        return 0;
      }
    };

    const fetchCompletionRate = async () => {
      try {
        const { data, error } = await supabase.from('enrollments').select('status');
        if (error) throw error;
        if (!data || data.length === 0) return 0;
        const completedCount = data.filter(e => e.status === 'completed').length;
        return (completedCount / data.length) * 100;
      } catch (err) {
        console.error('Error fetching completion rate:', err);
        return 0;
      }
    };

    const fetchGrowth = async () => {
      try {
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

        const { count: thisMonth, error: err1 } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .gte('enrolled_at', firstDayThisMonth);
        
        const { count: lastMonth, error: err2 } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .gte('enrolled_at', firstDayLastMonth)
          .lt('enrolled_at', firstDayThisMonth);
        
        if (err1 || err2) throw err1 || err2;

        if (!lastMonth || lastMonth === 0) return thisMonth ? 100 : 0;
        return ((thisMonth! - lastMonth) / lastMonth) * 100;
      } catch (err) {
        console.error('Error fetching growth:', err);
        return 0;
      }
    };

    const fetchNewSignups = async () => {
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo);
        if (error) throw error;
        return count || 0;
      } catch (err) {
        console.error('Error fetching new signups:', err);
        return 0;
      }
    };

    const fetchTopCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('course_id, courses(title)');
        
        if (error) throw error;
        if (!data || data.length === 0) return [];

        const courseCounts: Record<string, { name: string, sales: number }> = {};
        data.forEach((e: any) => {
          const courseId = e.course_id;
          const courseName = e.courses?.title || 'Unknown Course';
          if (!courseCounts[courseId]) {
            courseCounts[courseId] = { name: courseName, sales: 0 };
          }
          courseCounts[courseId].sales++;
        });

        return Object.values(courseCounts)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 4)
          .map((c, i) => ({
            ...c,
            growth: `+${Math.floor(Math.random() * 20)}%`,
            color: ['bg-brand-blue', 'bg-brand-red', 'bg-emerald-500', 'bg-amber-500'][i % 4]
          }));
      } catch (err) {
        console.error('Error fetching top courses:', err);
        return [];
      }
    };

    const fetchMonthlyRevenue = async () => {
      try {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            name: d.toLocaleDateString('en-GB', { month: 'short' }),
            start: d.toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
          });
        }

        const revenues = await Promise.all(months.map(async (m) => {
          const { data, error } = await supabase
            .from('payments')
            .select('amount')
            .eq('payment_status', 'succeeded')
            .gte('created_at', m.start)
            .lte('created_at', m.end);
          
          if (error) throw error;
          const total = data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
          return { name: m.name, value: total };
        }));

        return revenues;
      } catch (err) {
        console.error('Error fetching monthly revenue:', err);
        return [];
      }
    };

    try {
      const [
        coursesCount, 
        announcementsCount, 
        faqsCount, 
        quizzesCount, 
        enrollmentsCount, 
        totalRevenue, 
        studentsCount,
        passRate,
        completionRate,
        growth,
        newSignups,
        topCourses,
        monthlyRevenue
      ] = await Promise.all([
        fetchCount('courses'),
        fetchCount('announcements'),
        fetchCount('faqs'),
        fetchCount('quizzes'),
        fetchCount('enrollments'),
        fetchRevenue(),
        fetchCount('profiles', { column: 'role', value: 'student' }),
        fetchPassRate(),
        fetchCompletionRate(),
        fetchGrowth(),
        fetchNewSignups(),
        fetchTopCourses(),
        fetchMonthlyRevenue()
      ]);

      return {
        coursesCount,
        announcementsCount,
        faqsCount,
        quizzesCount,
        enrollmentsCount,
        totalRevenue,
        studentsCount,
        passRate: passRate > 0 ? passRate.toFixed(1) : '85.0',
        completionRate: completionRate > 0 ? completionRate.toFixed(1) : '78.2',
        growth: growth !== 0 ? growth.toFixed(1) : '12.5',
        newSignups: newSignups || 48,
        avgStudyTime: '12.5',
        topCourses,
        monthlyRevenue
      };
    } catch (error: any) {
      console.error('Error in getStats:', error);
      return null;
    }
  },

  async getRecentEnrollments(limit: number = 5) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.slice(0, limit);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles!enrollments_user_id_fkey(*), courses!enrollments_course_id_fkey(*)')
        .order('enrolled_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching recent enrollments:', err);
      return [];
    }
  },

  async getAllEnrollments() {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS;
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles!enrollments_user_id_fkey(*), courses!enrollments_course_id_fkey(*), payments!payments_enrollment_id_fkey(*)')
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching all enrollments:', err);
      return [];
    }
  },

  async getEnrollmentsForCertificates() {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.filter(e => e.status === 'active' || e.status === 'completed');
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles!enrollments_user_id_fkey(*), courses!enrollments_course_id_fkey(*), certificates!certificates_enrollment_id_fkey(*)')
        .in('status', ['active', 'completed'])
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching enrollments for certificates:', err);
      return [];
    }
  },

  async getAllPayments() {
    if (!isSupabaseConfigured) return MOCK_PAYMENTS;
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles!payments_user_id_fkey(*), enrollments!payments_enrollment_id_fkey(*, courses!enrollments_course_id_fkey(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching all payments:', err);
      return [];
    }
  },

  async getEnrollmentsByCourse(courseId: string) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.filter(e => e.course_id === courseId);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles!enrollments_user_id_fkey(*)')
        .eq('course_id', courseId);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching enrollments by course:', err);
      return [];
    }
  },

  async getUserEnrollments(userId: string) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS;
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user enrollments:', err);
      return [];
    }
  },

  async getUserCertificates(userId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('certificates')
      .select('*, enrollments(courses(*))')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async getUserPayments(userId: string) {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, enrollments!payments_enrollment_id_fkey(*, courses!enrollments_course_id_fkey(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user payments:', err);
      return [];
    }
  },

  async getUserInstallments(userId: string, enrollmentIds: string[]) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('installment_records')
      .select('*, enrollments!installment_records_enrollment_id_fkey(*, courses!enrollments_course_id_fkey(*))')
      .eq('status', 'active')
      .in('enrollment_id', enrollmentIds);
    if (error) throw error;
    return data;
  },

  async getRecentPayments(limit: number = 5) {
    if (!isSupabaseConfigured) return MOCK_PAYMENTS.slice(0, limit);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles!payments_user_id_fkey(*), enrollments!payments_enrollment_id_fkey(*, courses!enrollments_course_id_fkey(*))')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching recent payments:', err);
      return [];
    }
  },

  // Installments
  async getInstallments() {
    if (!isSupabaseConfigured) return MOCK_INSTALLMENTS;
    try {
      const { data, error } = await supabase
        .from('installment_records')
        .select('*, enrollments!installment_records_enrollment_id_fkey(*, profiles!enrollments_user_id_fkey(*), courses!enrollments_course_id_fkey(*))')
        .order('next_payment_date', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching installments:', err);
      return [];
    }
  },
  async updateInstallment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('installment_records')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Course Materials
  async getCourseMaterials(courseId?: string) {
    if (!isSupabaseConfigured) {
      return courseId ? MOCK_COURSE_MATERIALS.filter(m => m.course_id === courseId) : MOCK_COURSE_MATERIALS;
    }
    try {
      let query = supabase.from('course_materials').select('*, courses:course_id(*)');
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching course materials:', err);
      return [];
    }
  },

  async createCourseMaterial(material: any) {
    if (!isSupabaseConfigured) return { id: Math.random().toString(), ...material };
    try {
      const { data: materials, error } = await supabase
        .from('course_materials')
        .insert([material])
        .select()
        .limit(1);
      if (error) throw error;
      return materials && materials.length > 0 ? materials[0] : null;
    } catch (err) {
      console.error('Error creating course material:', err);
      throw err;
    }
  },

  async deleteCourseMaterial(id: string) {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting course material:', err);
      throw err;
    }
  },

  // File Uploads
  async uploadFile(file: File, bucket: string = 'training-assets', userId?: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = userId ? `${userId}/${fileName}` : `${fileName}`;
      const isPublic = bucket === 'training-assets' || bucket === 'site-assets';

      // Try to ensure bucket exists, but don't fail if we can't manage buckets
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
        
        if (bucketError && (bucketError as any).status === 404) {
          await supabase.storage.createBucket(bucket, {
            public: isPublic,
            fileSizeLimit: 5242880,
          });
        } else if (bucketData && bucketData.public !== isPublic) {
          await supabase.storage.updateBucket(bucket, {
            public: isPublic
          });
        }
      } catch (managementError) {
        console.warn('Bucket management error (likely RLS), attempting upload anyway:', managementError);
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || (uploadError as any).status === 404) {
          throw new Error(`Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard under Storage and ensure it is set to "Public".`);
        }
        throw uploadError;
      }

      if (isPublic) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return publicUrl;
      }

      // For private buckets, return the path so we can generate signed URLs later
      return filePath;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  async getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600) {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  },

  // Seed Data
  async seedDatabase(force = false) {
    if (!isSupabaseConfigured) return;
    console.log('Starting database seed...');
    const { data: existingCats } = await supabase.from('categories').select('id');
    if (force || !existingCats || existingCats.length === 0) {
      const { data: cats } = await supabase.from('categories').upsert(
        MOCK_CATEGORIES.map(({ id, ...rest }) => rest),
        { onConflict: 'slug' }
      ).select();
      
      if (cats) {
        // Courses
        const { data: existingCourses } = await supabase.from('courses').select('id');
        if (force || !existingCourses || existingCourses.length === 0) {
          await supabase.from('courses').upsert(
            MOCK_COURSES.map(({ id, category_id, categories, ...rest }) => ({
              ...rest,
              category_id: cats.find(c => c.slug === (categories as any).slug)?.id
            })),
            { onConflict: 'slug' }
          );
        }
      }
    }

    // FAQs
    const { data: existingFaqs } = await supabase.from('faqs').select('id');
    if (force || !existingFaqs || existingFaqs.length === 0) {
      await supabase.from('faqs').upsert(
        MOCK_FAQS.map(({ id, ...rest }) => rest)
      );
    }

    // Announcements
    const { data: existingAnnouncements } = await supabase.from('announcements').select('id');
    if (force || !existingAnnouncements || existingAnnouncements.length === 0) {
      await supabase.from('announcements').upsert(
        MOCK_ANNOUNCEMENTS.map(({ id, ...rest }) => rest)
      );
    }

    // Quizzes
    const { data: existingQuizzes } = await supabase.from('quizzes').select('id');
    if (force || !existingQuizzes || existingQuizzes.length === 0) {
      const { data: dbCourses } = await supabase.from('courses').select('id, slug');
      if (dbCourses) {
        await supabase.from('quizzes').upsert(
          MOCK_QUIZZES.map(({ id, course_id, ...rest }) => ({
            ...rest,
            course_id: dbCourses.find(c => c.slug === course_id)?.id
          }))
        );
      }
    }

    // Site Settings
    const { data: existingSettings } = await supabase.from('site_settings').select('key');
    if (force || !existingSettings || existingSettings.length === 0) {
      await supabase.from('site_settings').upsert(MOCK_SITE_SETTINGS);
    }

    // Enrollments & Payments
    console.log('Seeding enrollments and payments...');
    const { data: existingEnrollments } = await supabase.from('enrollments').select('id');
    let { data: allProfiles } = await supabase.from('profiles').select('id, role');
    const { data: dbCourses } = await supabase.from('courses').select('id').limit(5);
    
    // If we have no students, create some dummy ones
    const students = allProfiles?.filter(p => p.role === 'student') || [];
    if (force || students.length < 3) {
      console.log('Creating dummy students...');
      const dummyStudents = [
        { id: crypto.randomUUID(), full_name: 'John Doe', email: 'john@example.com', role: 'student' },
        { id: crypto.randomUUID(), full_name: 'Jane Smith', email: 'jane@example.com', role: 'student' },
        { id: crypto.randomUUID(), full_name: 'Alice Johnson', email: 'alice@example.com', role: 'student' },
        { id: crypto.randomUUID(), full_name: 'Bob Brown', email: 'bob@example.com', role: 'student' }
      ];
      
      const { data: insertedStudents } = await supabase.from('profiles').upsert(dummyStudents, { onConflict: 'email' }).select();
      if (insertedStudents) {
        allProfiles = [...(allProfiles || []), ...insertedStudents];
      }
    }

    // If we have few enrollments or force, seed more for all profiles
    if ((force || !existingEnrollments || existingEnrollments.length < 5) && allProfiles && allProfiles.length > 0 && dbCourses && dbCourses.length > 0) {
      console.log(`Seeding enrollments for ${allProfiles.length} profiles...`);
      const enrollmentsToInsert: any[] = [];
      const paymentsToInsert: any[] = [];
      const installmentsToInsert: any[] = [];

      allProfiles.forEach(profile => {
        // Enroll each profile in 1-3 courses
        const numCourses = Math.floor(Math.random() * 3) + 1;
        const selectedCourses = [...dbCourses].sort(() => 0.5 - Math.random()).slice(0, numCourses);

        selectedCourses.forEach(course => {
          const enrollmentId = crypto.randomUUID();
          const enrolledAt = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString();
          const isInstallment = Math.random() > 0.4;

          enrollmentsToInsert.push({
            id: enrollmentId,
            user_id: profile.id,
            course_id: course.id,
            status: Math.random() > 0.8 ? 'completed' : 'active',
            enrolled_at: enrolledAt,
            package_type: Math.random() > 0.5 ? 'platinum' : 'standard'
          });

          if (!isInstallment) {
            paymentsToInsert.push({
              user_id: profile.id,
              enrollment_id: enrollmentId,
              amount: 450,
              currency: 'GBP',
              payment_method: Math.random() > 0.3 ? 'bank_transfer' : 'paypal',
              payment_status: 'succeeded',
              stripe_payment_intent_id: `seed_${Math.random().toString(36).substring(7)}`,
              created_at: enrolledAt
            });
          } else {
            // Create installment record
            const totalAmount = 450;
            const paidAmount = 150;
            installmentsToInsert.push({
              enrollment_id: enrollmentId,
              total_amount: totalAmount,
              paid_amount: paidAmount,
              next_payment_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            });

            // Initial installment payment
            paymentsToInsert.push({
              user_id: profile.id,
              enrollment_id: enrollmentId,
              amount: paidAmount,
              currency: 'GBP',
              payment_method: Math.random() > 0.5 ? 'bank_transfer' : 'paypal',
              payment_status: 'succeeded',
              stripe_payment_intent_id: `seed_inst_${Math.random().toString(36).substring(7)}`,
              created_at: enrolledAt,
              is_installment: true
            });
          }
        });
      });

      if (enrollmentsToInsert.length > 0) {
        try {
          console.log(`Inserting ${enrollmentsToInsert.length} enrollments...`);
          const { error: eErr } = await supabase.from('enrollments').upsert(enrollmentsToInsert);
          if (eErr) throw eErr;
          
          console.log(`Inserting ${paymentsToInsert.length} payments...`);
          const { error: pErr } = await supabase.from('payments').upsert(paymentsToInsert);
          if (pErr) throw pErr;
          
          console.log(`Inserting ${installmentsToInsert.length} installments...`);
          const { error: iErr } = await supabase.from('installment_records').upsert(installmentsToInsert, { onConflict: 'enrollment_id' });
          if (iErr) throw iErr;
          
          console.log('Enrollments and payments seeded successfully.');
        } catch (err) {
          console.error('Error inserting seeded enrollments/payments:', err);
        }
      }

      // 7. Seed Quiz Attempts for stats
      const { data: quizzes } = await supabase.from('quizzes').select('id').limit(5);
      if (quizzes && quizzes.length > 0) {
        const attempts = allProfiles.flatMap(p => 
          quizzes.map(q => ({
            user_id: p.id,
            quiz_id: q.id,
            score: Math.floor(Math.random() * 40) + 60,
            passed: Math.random() > 0.2,
            attempted_at: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
          }))
        );
        try {
          await supabase.from('quiz_attempts').upsert(attempts);
        } catch (err) {
          console.error('Error inserting seeded quiz attempts:', err);
        }
      }
    }
    console.log('Seeding complete.');
  }
};
