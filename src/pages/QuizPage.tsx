import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Loader2
} from 'lucide-react';

import { MOCK_QUIZZES } from '../data/mockData';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';

export const QuizPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizAndCheckEnrollment = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch quiz first to know which course it belongs to
        const quizzes = await adminService.getQuizzes();
        const foundQuiz = quizzes.find((q: any) => q.id === quizId);
        
        if (!foundQuiz) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }

        // Check enrollment
        const enrollments = await adminService.getUserEnrollments(user.id);
        const isEnrolled = enrollments.some((e: any) => e.course_id === foundQuiz.course_id && e.status === 'active');
        
        if (!isEnrolled) {
          setError('You are not enrolled in this course or your enrollment is pending approval.');
          setLoading(false);
          return;
        }

        setQuiz(foundQuiz);
      } catch (err: any) {
        console.error('Error in QuizPage:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndCheckEnrollment();
  }, [quizId, user, navigate]);

  useEffect(() => {
    if (isSubmitted || loading || !quiz) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, loading, quiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIdx
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correct_option) {
        correctCount++;
      }
    });
    return (correctCount / quiz.questions.length) * 100;
  };

  if (loading && !quiz) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-brand-blue" size={48} />
    </div>
  );

  if (!quiz || error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <AlertCircle size={48} className="mx-auto text-brand-red mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || 'Quiz Not Found'}</h2>
        <p className="text-slate-500 mb-6">
          {error ? 'Please ensure you are enrolled in this course and your enrollment is active.' : 'The quiz you are looking for does not exist or has been removed.'}
        </p>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-blue-hover transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const questions = quiz.questions;

  if (isSubmitted) {
    const score = calculateScore();
    const passed = score >= 80;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl overflow-hidden"
        >
          <div className={`p-12 text-center ${passed ? 'bg-emerald-500' : 'bg-brand-red'} text-white`}>
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              {passed ? <Award size={48} /> : <AlertCircle size={48} />}
            </div>
            <h2 className="text-4xl font-bold mb-2">{passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
            <p className="text-white/80 text-lg">
              {passed ? 'You have successfully passed this quiz.' : 'You did not reach the 80% passing score.'}
            </p>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="text-center">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Your Score</p>
                <p className={`text-5xl font-black ${passed ? 'text-emerald-600' : 'text-brand-red'}`}>{score}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Passing Score</p>
                <p className="text-5xl font-black text-slate-900">80%</p>
              </div>
            </div>

            <div className="space-y-4">
              {passed ? (
                <button 
                  onClick={() => navigate(`/courses/${slug}/player`)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-blue transition-all flex items-center justify-center gap-2"
                >
                  Continue to Next Module <ArrowRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers({});
                    setTimeLeft(1200);
                  }}
                  className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-red-hover transition-all"
                >
                  Retake Quiz
                </button>
              )}
              <button 
                onClick={() => navigate(`/courses/${slug}/player`)}
                className="w-full bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
              >
                Back to Course
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Module 1 Quiz</h1>
            <p className="text-slate-500 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeLeft < 300 ? 'bg-brand-red/10 text-brand-red animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button 
              onClick={handleSubmit}
              className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue-hover transition-all"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 rounded-full mb-12 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            className="h-full bg-brand-blue"
          />
        </div>

        {/* Question Area */}
        <div className="bg-white p-10 lg:p-16 rounded-[3rem] shadow-xl border border-slate-100 mb-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                {questions[currentQuestion].question}
              </h2>

              <div className="grid gap-4">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-6 rounded-2xl text-left border-2 transition-all flex items-center gap-4 group ${
                      selectedAnswers[currentQuestion] === idx
                        ? 'border-brand-blue bg-brand-blue/5'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                      selectedAnswers[currentQuestion] === idx
                        ? 'bg-brand-blue border-brand-blue text-white'
                        : 'border-slate-200 text-slate-400 group-hover:border-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium ${selectedAnswers[currentQuestion] === idx ? 'text-brand-blue' : 'text-slate-600'}`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${
                  currentQuestion === i ? 'w-8 bg-brand-blue' : selectedAnswers[i] !== undefined ? 'bg-brand-blue/40' : 'bg-slate-300'
                }`} 
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-blue transition-all shadow-lg"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={48} />
            <p className="text-slate-900 font-bold text-xl">Calculating your results...</p>
          </div>
        </div>
      )}
    </div>
  );
};
