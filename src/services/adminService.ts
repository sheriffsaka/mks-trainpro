import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_COURSES, MOCK_FAQS, MOCK_ANNOUNCEMENTS, MOCK_QUIZZES } from '../data/mockData';

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
  }
};
