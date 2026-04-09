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
    <div 
      className="print-certificate w-full aspect-[1.414/1] bg-white border-[16px] border-brand-blue p-16 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl"
      style={templateUrl ? { 
        backgroundImage: `url(${templateUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        border: 'none'
      } : {}}
    >
      {!templateUrl && (
        <>
          <div className="absolute top-0 left-0 w-48 h-48 bg-brand-blue/5 rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-tl-full" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-brand-blue/20 m-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-brand-blue/20 m-8" />
        </>
      )}
      
      <div className="space-y-6 relative z-10 w-full">
        <div className="flex justify-center items-center gap-8 mb-4">
          <img 
            src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
            alt="MKS Logo" 
            className="h-20 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="w-px h-16 bg-slate-200" />
          <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-blue/30 rotate-3">
            <Award size={44} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-[0.2em] uppercase">Certificate</h2>
          <p className="text-brand-blue font-bold tracking-[0.5em] uppercase text-sm">of Completion</p>
        </div>
        <p className="text-slate-400 font-medium italic text-lg">This is to certify that</p>
      </div>

      <div className="space-y-4 relative z-10 w-full">
        <h1 className="text-6xl font-black text-slate-900 tracking-tight border-b-4 border-brand-blue inline-block px-8 pb-2">{studentName}</h1>
        <p className="text-slate-500 font-medium text-xl mt-6">has successfully completed the professional course</p>
        <h3 className="text-3xl font-bold text-brand-blue uppercase tracking-wide">{courseTitle}</h3>
      </div>

      <div className="w-full flex justify-between items-end relative z-10 px-4">
        <div className="text-left space-y-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date Issued</p>
          <p className="text-lg font-bold text-slate-900">{date}</p>
        </div>
        <div className="text-center space-y-3 pb-2">
          <img 
            src="https://res.cloudinary.com/di7okmjsx/image/upload/v1773824665/mkslogo1_svink2.png" 
            alt="Signature" 
            className="h-12 w-auto object-contain mx-auto opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="w-48 h-px bg-slate-900 mx-auto" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Director of Studies</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certificate ID</p>
          <p className="text-sm font-mono font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{displayId}</p>
        </div>
      </div>
    </div>
  );
};
