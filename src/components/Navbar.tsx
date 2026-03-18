import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Navbar = () => {
  const { user, profile, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isAdmin = profile?.role === 'admin' || user?.email === 'sheriffdeenalade@gmail.com';
  const isInstructor = profile?.role === 'instructor' || isAdmin;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
              alt="MKS Logo" 
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="hidden sm:block font-bold text-xl tracking-tight text-slate-900">
              MKS CONSULTS <span className="text-brand-blue">LIMITED</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/courses" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Courses</Link>
            <Link to="/corporate" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Corporate</Link>
            <Link to="/accreditations" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Accreditations</Link>
            <Link to="/clients" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Clients</Link>
            <Link to="/about" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">About</Link>
            
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                {isAdmin && (
                  <Link to="/admin" className="text-brand-blue font-bold text-sm hover:underline flex items-center gap-1">
                    <LayoutDashboard size={16} />
                    Admin
                  </Link>
                )}
                {isInstructor && (
                  <Link to="/instructor" className="text-brand-red font-bold text-sm hover:underline flex items-center gap-1">
                    <GraduationCap size={16} />
                    Instructor
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-brand-blue transition-colors">
                  <div className="w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold text-xs">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium">{profile?.full_name || 'My Account'}</span>
                </Link>
                <button onClick={signOut} className="text-slate-400 hover:text-brand-red transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-brand-blue font-medium">Login</Link>
                <Link to="/register" className="bg-brand-blue text-white px-5 py-2 rounded-xl font-medium hover:bg-brand-blue-hover transition-all shadow-sm">
                  Enroll Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <Link to="/courses" className="block text-slate-600 font-medium">Courses</Link>
          <Link to="/corporate" className="block text-slate-600 font-medium">Corporate</Link>
          <Link to="/accreditations" className="block text-slate-600 font-medium">Accreditations</Link>
          <Link to="/clients" className="block text-slate-600 font-medium">Clients</Link>
          <Link to="/about" className="block text-slate-600 font-medium">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-slate-600 font-medium">Dashboard</Link>
              <button onClick={signOut} className="block text-brand-red font-medium">Sign Out</button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/login" className="block text-center py-2 text-slate-600 font-medium">Login</Link>
              <Link to="/register" className="block text-center py-3 bg-brand-blue text-white rounded-xl font-medium">Enroll Now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
