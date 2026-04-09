import React from 'react';
import { Award } from 'lucide-react';

interface CertificateTemplateProps {
  studentName: string;
  courseTitle: string;
  date: string;
  templateUrl?: string;
  certificateId?: string;
}

export const CertificateTemplate = ({ 
  studentName, 
  courseTitle, 
  date, 
  templateUrl, 
  certificateId 
}: CertificateTemplateProps) => {
  const displayId = certificateId || `MKS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  return (
    <div className="w-full overflow-hidden flex justify-center bg-slate-50/50 p-4 sm:p-8 rounded-3xl">
      <div 
        className="print-certificate w-full max-w-[1000px] aspect-[1.414/1] bg-white border-[12px] sm:border-[16px] border-brand-blue p-8 sm:p-16 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl"
        style={templateUrl ? { 
          backgroundImage: `url(${templateUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          border: 'none'
        } : {}}
      >
        {!templateUrl && (
          <>
            <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-brand-blue/5 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-brand-blue/5 rounded-tl-full" />
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 border-t-4 sm:border-t-8 border-r-4 sm:border-r-8 border-brand-blue/20 m-4 sm:m-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 border-b-4 sm:border-b-8 border-l-4 sm:border-l-8 border-brand-blue/20 m-4 sm:m-8" />
          </>
        )}
        
        <div className="space-y-4 sm:space-y-6 relative z-10 w-full">
          <div className="flex justify-center items-center gap-4 sm:gap-8 mb-2 sm:mb-4">
            <img 
              src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
              alt="MKS Logo" 
              className="h-12 sm:h-20 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="w-px h-10 sm:h-16 bg-slate-200" />
            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-brand-blue rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/30 rotate-3">
              <Award size={28} className="sm:w-11 sm:h-11" />
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-[0.1em] sm:tracking-[0.2em] uppercase">Certificate</h2>
            <p className="text-brand-blue font-bold tracking-[0.3em] sm:tracking-[0.5em] uppercase text-[10px] sm:text-sm">of Completion</p>
          </div>
          <p className="text-slate-400 font-medium italic text-sm sm:text-lg">This is to certify that</p>
        </div>

        <div className="space-y-2 sm:space-y-4 relative z-10 w-full px-4">
          <h1 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight border-b-2 sm:border-b-4 border-brand-blue inline-block px-4 sm:px-8 pb-1 sm:pb-2 break-words max-w-full">
            {studentName}
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-xl mt-4 sm:mt-6">has successfully completed the professional course</p>
          <h3 className="text-xl sm:text-3xl font-bold text-brand-blue uppercase tracking-wide px-4">{courseTitle}</h3>
        </div>

        <div className="w-full flex justify-between items-end relative z-10 px-4 sm:px-8">
          <div className="text-left space-y-1 sm:space-y-2">
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date Issued</p>
            <p className="text-sm sm:text-lg font-bold text-slate-900">{date}</p>
          </div>
          <div className="text-center space-y-2 sm:space-y-3 pb-1 sm:pb-2">
            <img 
              src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
              alt="Signature" 
              className="h-8 sm:h-12 w-auto object-contain mx-auto opacity-20 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="w-32 sm:w-48 h-px bg-slate-900 mx-auto" />
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Director of Studies</p>
          </div>
          <div className="text-right space-y-1 sm:space-y-2">
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certificate ID</p>
            <p className="text-[10px] sm:text-sm font-mono font-bold text-slate-900 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-slate-100">{displayId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
