import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { CertificateTemplate } from '../components/CertificateTemplate';
import { Loader2, Download, ArrowLeft, Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const CertificatePage = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch active template
        const { data: templates } = await supabase
          .from('certificate_templates')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();
        
        setActiveTemplate(templates);

        // The ID might be prefixed with 'cert-'
        const actualId = certificateId.startsWith('cert-') 
          ? certificateId.replace('cert-', '') 
          : certificateId;

        console.log('Fetching certificate for ID:', actualId);

        // Try exact match first
        const { data: exactData, error: exactError } = await supabase
          .from('certificates')
          .select('*, enrollments(*, profiles(*), courses(*))')
          .or(`id.eq.${actualId},enrollment_id.eq.${actualId}`)
          .maybeSingle();

        if (exactData) {
          setCertificateData(exactData);
        } else if (actualId.length >= 8) {
          // Fallback to prefix search if no exact match and ID is long enough
          const { data: allCerts, error: allError } = await supabase
            .from('certificates')
            .select('*, enrollments(*, profiles(*), courses(*))');
          
          if (allError) throw allError;
          
          const match = allCerts?.find(c => 
            c.id.toLowerCase().startsWith(actualId.toLowerCase()) || 
            c.enrollment_id.toLowerCase().startsWith(actualId.toLowerCase())
          );
          
          if (match) {
            setCertificateData(match);
          } else {
            setError('Certificate not found. Please verify the ID and try again.');
          }
        } else {
          setError('Certificate not found. Please verify the ID and try again.');
        }
      } catch (err: any) {
        console.error('Error fetching certificate:', err);
        setError('Failed to load certificate. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
          <p className="text-slate-500 font-medium">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-brand-red" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Certificate Not Found</h1>
          <p className="text-slate-500 mb-8">{error || 'The certificate you are looking for does not exist or has been revoked.'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const studentName = certificateData.enrollments?.profiles?.full_name || 'Student';
  const courseTitle = certificateData.enrollments?.courses?.title || 'Professional Course';
  const date = new Date(certificateData.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const displayId = `MKS-${certificateData.enrollment_id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - Hidden on print */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Verified Certificate</h1>
              <p className="text-slate-500 text-sm">This certificate is authentic and verified by MKS Consults Ltd.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button 
              onClick={handlePrint}
              className="px-8 py-3 rounded-2xl bg-brand-blue text-white font-bold hover:bg-brand-blue-hover transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
            >
              <Printer size={18} /> Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden print:p-0 print:shadow-none print:border-none print:rounded-none"
        >
          <CertificateTemplate 
            studentName={studentName}
            courseTitle={courseTitle}
            date={date}
            templateUrl={activeTemplate?.image_url}
            certificateId={displayId}
          />
        </motion.div>

        {/* Verification Footer - Hidden on print */}
        <div className="mt-12 text-center space-y-4 print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
            <ShieldCheck size={16} /> Secure Verification System
          </div>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            MKS Consults Ltd verifies that the individual named above has successfully completed all requirements for the specified course.
          </p>
        </div>
      </div>
    </div>
  );
};
