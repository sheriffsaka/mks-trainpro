import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { motion } from 'motion/react';
import { Shield, FileText, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const LegalPage = () => {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  const getPageConfig = () => {
    switch (pathname) {
      case '/privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield size={48} className="text-brand-blue" />,
          content: settings.privacy_policy || '# Privacy Policy\n\nContent coming soon.'
        };
      case '/terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={48} className="text-brand-red" />,
          content: settings.terms_of_service || '# Terms of Service\n\nContent coming soon.'
        };
      case '/refund':
        return {
          title: 'Refund Policy',
          icon: <RefreshCcw size={48} className="text-emerald-500" />,
          content: settings.refund_policy || '# Refund Policy\n\nContent coming soon.'
        };
      default:
        return {
          title: 'Legal',
          icon: <Shield size={48} />,
          content: 'Content not found.'
        };
    }
  };

  const config = getPageConfig();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="p-12 text-center bg-slate-50 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg mb-6">
              {config.icon}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{config.title}</h1>
            <p className="mt-4 text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="p-12 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-blue prose-strong:text-slate-900">
            <ReactMarkdown>{config.content}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Support Footer */}
        <div className="mt-12 text-center p-8 bg-slate-100 rounded-3xl border border-white">
          <p className="text-slate-600 font-medium italic">
            If you have any questions regarding our {config.title.toLowerCase()}, please contact us at{' '}
            <a href={`mailto:${settings.support_email || 'support@mksconsultsltd.com'}`} className="text-brand-blue font-bold hover:underline">
              {settings.support_email || 'support@mksconsultsltd.com'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
