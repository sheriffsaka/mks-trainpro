import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Award, Users, Play, Pause, ChevronLeft, ChevronRight, X, Maximize2, Search, MapPin, Volume2, VolumeX, Star, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

const PiPModal = ({ onClose, videoUrl }: { onClose: () => void, videoUrl: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed bottom-8 right-8 z-[9999] w-[400px] aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
    >
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-slate-950/80 to-transparent z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
          Picture in Picture • Sound On
        </span>
        <button 
          onClick={onClose}
          className="p-1.5 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
        >
          <X size={14} />
        </button>
      </div>
      <video 
        src={videoUrl}
        autoPlay
        muted={false}
        controls
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};

export const Hero = () => {
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPiPModalOpen, setIsPiPModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const slides = [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80',
      title: 'SAP Training',
      subtitle: 'Beginner to Advanced Consultant',
      price: 'Starting from £500',
      badge: 'Professional Certification'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80',
      title: 'Software Testing',
      subtitle: 'Manual & Automation Mastery',
      price: 'Starting from £450',
      badge: 'Industry Standard'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80',
      title: 'Corporate Training',
      subtitle: 'Custom Solutions for Teams',
      price: 'Contact for Quote',
      badge: 'Enterprise Grade'
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Auto-advance logic
    if (slides[currentSlide].type === 'image') {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentSlide]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.error("Video replay failed:", err));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [currentSlide]);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src={settings.hero_bg_url || "https://res.cloudinary.com/di7okmjsx/image/upload/v1773223819/traiing_course_fabncl.jpg"} 
          className="w-full h-full object-cover opacity-30"
          alt="Hero Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck className="text-brand-blue" size={16} />
              <span className="text-brand-blue text-xs font-semibold uppercase tracking-wider">Accredited Training Provider</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-8">
              {settings.hero_headline || 'Empowering the Next Generation of Professionals.'}
            </h1>
            
            {/* Search Bar - Removed as per request */}
            
            <div className="flex flex-wrap gap-4 mb-10">
              {['SAP Training', 'Software Testing', 'Corporate Solutions'].map((tag) => (
                <button key={tag} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all">
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-emerald-400 text-emerald-400" />)}
                </div>
                <span className="text-white text-sm font-bold">Google Reviews</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                <span className="text-white text-sm font-bold">Secure Enrollment</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/courses" 
                className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/10 group"
              >
                Explore Courses
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link 
                to="/corporate"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                Corporate Training
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">15k+</span>
                <span className="text-sm text-slate-400">Students Enrolled</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">98%</span>
                <span className="text-sm text-slate-400">Pass Rate</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-8 h-8 rounded-full border-2 border-slate-900" alt="Student" />
                  ))}
                </div>
                <span className="text-sm text-slate-400">Join our community</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative group/slider"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] bg-slate-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {slides[currentSlide].type === 'video' ? (
                    <div 
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => togglePlay()}
                    >
                      <video 
                        ref={videoRef}
                        src={slides[currentSlide].url}
                        autoPlay 
                        muted={isMuted}
                        playsInline
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-cover"
                      />
                      {/* Centered Play Button - Only show when paused */}
                      <AnimatePresence>
                        {!isPlaying && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                          >
                            <div className="bg-brand-blue/90 backdrop-blur-md text-white p-10 rounded-full border-4 border-white/20 shadow-2xl">
                              <Play size={56} fill="currentColor" className="ml-2" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Controls Overlay */}
                      <div className="absolute bottom-32 right-8 flex flex-col gap-4 z-40">
                        <button 
                          onClick={handleReplay}
                          className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full border border-white/20 hover:bg-white/30 transition-all"
                          title="Replay"
                        >
                          <RotateCcw size={24} />
                        </button>
                        <button 
                          onClick={toggleMute}
                          className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full border border-white/20 hover:bg-white/30 transition-all"
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                          }}
                          className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full border border-white/20 hover:bg-white/30 transition-all"
                          title={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={slides[currentSlide].url} 
                      className="w-full h-full object-cover"
                      alt={slides[currentSlide].title}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                    <div className="inline-block bg-brand-red text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                      {slides[currentSlide].badge}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        <Award className="text-brand-red" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-2xl">{slides[currentSlide].title}</h3>
                        <p className="text-slate-300 text-sm">{slides[currentSlide].subtitle}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pointer-events-auto">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Starting from</span>
                        <span className="text-white font-bold text-2xl">{slides[currentSlide].price}</span>
                      </div>
                      <Link 
                        to="/courses" 
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-red hover:text-white transition-all"
                      >
                        Enroll Now <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between opacity-0 group-hover/slider:opacity-100 transition-opacity z-30">
                <button 
                  onClick={prevSlide}
                  className="bg-white/10 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="bg-white/10 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute top-8 right-8 flex gap-2 z-30">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === i ? 'w-8 bg-brand-red' : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </section>
      
      <AnimatePresence>
        {isPiPModalOpen && (
          <PiPModal 
            onClose={() => setIsPiPModalOpen(false)} 
            videoUrl={slides[0].url} 
          />
        )}
      </AnimatePresence>
    </>
  );
};
