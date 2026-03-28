import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_COURSES, MOCK_FAQS, MOCK_ANNOUNCEMENTS, MOCK_QUIZZES, MOCK_CATEGORIES, MOCK_SITE_SETTINGS } from '../data/mockData';

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
    const fetchCount = async (table: string) => {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
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
        return data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      } catch (err) {
        console.error('Error fetching revenue:', err);
        return 0;
      }
    };

    try {
      const [coursesCount, announcementsCount, faqsCount, quizzesCount, enrollmentsCount, totalRevenue, studentsCount] = await Promise.all([
        fetchCount('courses'),
        fetchCount('announcements'),
        fetchCount('faqs'),
        fetchCount('quizzes'),
        fetchCount('enrollments'),
        fetchRevenue(),
        fetchCount('profiles')
      ]);

      return {
        coursesCount,
        announcementsCount,
        faqsCount,
        quizzesCount,
        enrollmentsCount,
        totalRevenue,
        studentsCount
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
        studentsCount: 0
      };
    }
  },

  async getRecentEnrollments(limit: number = 5) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles(*), courses(*)')
      .order('enrolled_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getRecentPayments(limit: number = 5) {
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
  }
};
