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
        growth
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
        fetchGrowth()
      ]);

      return {
        coursesCount,
        announcementsCount,
        faqsCount,
        quizzesCount,
        enrollmentsCount,
        totalRevenue,
        studentsCount,
        passRate: passRate.toFixed(1),
        completionRate: completionRate.toFixed(1),
        growth: growth.toFixed(1),
        newSignups: studentsCount // For now, use total students as new signups placeholder
      };
    } catch (error: any) {
      console.error('Error in getStats:', error);
      return {
        coursesCount: 0,
        announcementsCount: 0,
        faqsCount: 0,
        quizzesCount: 0,
        enrollmentsCount: 0,
        totalRevenue: 0,
        studentsCount: 0,
        passRate: 0,
        completionRate: 0,
        growth: 0,
        newSignups: 0
      };
    }
  },

  async getRecentEnrollments(limit: number = 5) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.slice(0, limit);
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles(*), courses(*)')
      .order('enrolled_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getAllEnrollments() {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS;
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        profiles(*),
        courses(*),
        payments(*)
      `)
      .order('enrolled_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getEnrollmentsForCertificates() {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.filter(e => e.status === 'active' || e.status === 'completed');
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles(*), courses(*), certificates(*)')
      .in('status', ['active', 'completed'])
      .order('enrolled_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllPayments() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(*), enrollments(*, courses(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getEnrollmentsByCourse(courseId: string) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS.filter(e => e.course_id === courseId);
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles(*)')
      .eq('course_id', courseId);
    if (error) throw error;
    return data;
  },

  async getUserEnrollments(userId: string) {
    if (!isSupabaseConfigured) return MOCK_ENROLLMENTS;
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async getUserCertificates(userId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('certificates')
      .select('*, courses:enrollment_id(courses(*))')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async getUserPayments(userId: string) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*, enrollments(*, courses(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserInstallments(userId: string, enrollmentIds: string[]) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('installment_records')
      .select('*, enrollments(*, courses(*))')
      .eq('status', 'active')
      .in('enrollment_id', enrollmentIds);
    if (error) throw error;
    return data;
  },

  async getRecentPayments(limit: number = 5) {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(*), enrollments(*, courses(*))')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  // Installments
  async getInstallments() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('installment_records')
      .select('*, enrollments(*, profiles(*), courses(*))')
      .order('next_payment_date', { ascending: true });
    if (error) throw error;
    return data;
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

  // File Uploads
  async uploadFile(file: File, bucket: string = 'training-assets') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || (uploadError as any).status === 404) {
          throw new Error(`Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard under Storage.`);
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Seed Data
  async seedDatabase() {
    // Categories
    const { data: existingCats } = await supabase.from('categories').select('id');
    if (!existingCats || existingCats.length === 0) {
      const { data: cats } = await supabase.from('categories').insert(
        MOCK_CATEGORIES.map(({ id, ...rest }) => rest)
      ).select();
      
      if (cats) {
        // Courses
        const { data: existingCourses } = await supabase.from('courses').select('id');
        if (!existingCourses || existingCourses.length === 0) {
          await supabase.from('courses').insert(
            MOCK_COURSES.map(({ id, category_id, categories, ...rest }) => ({
              ...rest,
              category_id: cats.find(c => c.slug === (categories as any).slug)?.id
            }))
          );
        }
      }
    }

    // FAQs
    const { data: existingFaqs } = await supabase.from('faqs').select('id');
    if (!existingFaqs || existingFaqs.length === 0) {
      await supabase.from('faqs').insert(
        MOCK_FAQS.map(({ id, ...rest }) => rest)
      );
    }

    // Announcements
    const { data: existingAnnouncements } = await supabase.from('announcements').select('id');
    if (!existingAnnouncements || existingAnnouncements.length === 0) {
      await supabase.from('announcements').insert(
        MOCK_ANNOUNCEMENTS.map(({ id, ...rest }) => rest)
      );
    }

    // Quizzes
    const { data: existingQuizzes } = await supabase.from('quizzes').select('id');
    if (!existingQuizzes || existingQuizzes.length === 0) {
      const { data: dbCourses } = await supabase.from('courses').select('id, slug');
      if (dbCourses) {
        await supabase.from('quizzes').insert(
          MOCK_QUIZZES.map(({ id, course_id, ...rest }) => ({
            ...rest,
            course_id: dbCourses.find(c => c.slug === course_id)?.id
          }))
        );
      }
    }

    // Site Settings
    const { data: existingSettings } = await supabase.from('site_settings').select('key');
    if (!existingSettings || existingSettings.length === 0) {
      await supabase.from('site_settings').insert(MOCK_SITE_SETTINGS);
    }

    // Enrollments & Payments
    const { data: existingEnrollments } = await supabase.from('enrollments').select('id');
    if (!existingEnrollments || existingEnrollments.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbCourses } = await supabase.from('courses').select('id').limit(2);
        if (dbCourses && dbCourses.length > 0) {
          // Create a few mock enrollments for the current user
          const enrollmentsToInsert = dbCourses.map(course => ({
            user_id: user.id,
            course_id: course.id,
            status: 'active',
            payment_status: 'paid',
            enrolled_at: new Date().toISOString()
          }));

          const { data: insertedEnrollments } = await supabase.from('enrollments').insert(enrollmentsToInsert).select();

          if (insertedEnrollments) {
            // Create corresponding payments
            const paymentsToInsert = insertedEnrollments.map(enrollment => ({
              user_id: user.id,
              enrollment_id: enrollment.id,
              amount: 450,
              currency: 'GBP',
              payment_method: 'bank_transfer',
              payment_status: 'succeeded',
              transaction_id: `seed_${Math.random().toString(36).substring(7)}`
            }));
            await supabase.from('payments').insert(paymentsToInsert);
          }
        }
      }
    }
  }
};
