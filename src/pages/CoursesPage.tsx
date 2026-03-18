import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Search, Filter, Clock, BookOpen, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import { MOCK_COURSES } from '../data/mockData';

export const CoursesPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, categories(*)')
          .eq('is_published', true);
        
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          // Fallback to mock data if DB is empty or fails
          setCourses(MOCK_COURSES);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || c.categories?.slug === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Professional Training Courses</h1>
          <p className="text-slate-500 text-lg max-w-2xl">Browse our catalog of professional courses in SAP and Software Testing.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-blue outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {['all', 'sap-training', 'software-testing'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      category === cat 
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/10' 
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-80 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                  <Link 
                    key={course.id} 
                    to={`/courses/${course.slug}`}
                    className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.image_url || `https://picsum.photos/seed/${course.id}/800/450`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={course.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-brand-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {course.categories?.name || 'Training'}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-slate-400 text-xs mb-8">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{course.duration || 'Flexible'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={14} />
                          <span>{course.format || 'Online'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award size={14} />
                          <span>Accredited</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium">Starting from</span>
                          <span className="text-2xl font-bold text-slate-900">£{course.price_standard}</span>
                        </div>
                        <div className="bg-slate-50 text-slate-900 p-3 rounded-2xl group-hover:bg-brand-blue group-hover:text-white transition-all">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-500">No courses found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
