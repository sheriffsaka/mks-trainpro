import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md w-full bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-2xl">
            <div className="bg-brand-red/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="text-brand-red" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-brand-red mb-2 font-bold">Error Details:</p>
                <p className="text-[10px] font-mono text-slate-500">{this.state.error?.message}</p>
                <p className="text-[10px] font-mono text-slate-600 mt-2 whitespace-pre">{this.state.error?.stack}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
