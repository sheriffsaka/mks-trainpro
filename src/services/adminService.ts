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
    const [courses, announcements, faqs, quizzes] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
      supabase.from('faqs').select('*', { count: 'exact', head: true }),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    ]);

    return {
      coursesCount: courses.count || 0,
      announcementsCount: announcements.count || 0,
      faqsCount: faqs.count || 0,
      quizzesCount: quizzes.count || 0,
    };
  },

  // File Uploads
  async uploadFile(file: File, bucket: string = 'training-assets') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
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
