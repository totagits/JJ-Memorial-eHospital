import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ShieldCheck, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in J & J Memorial UI:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  private handleGoHome = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-rose-500/20">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-700/80 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                    DIAGNOSTIC RECOVERY MODE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">J & J Memorial e-Hospital</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  System Self-Healing & Diagnostic Console
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  The application encountered an unexpected runtime state. Your clinical data in the central database is secure. You can safely reload or reset your browser cache below.
                </p>
              </div>
            </div>

            {/* Error Diagnostics Box */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Exception Trace</span>
                <span className="text-rose-400">Crash Shield Active</span>
              </div>
              <p className="text-rose-300 font-bold break-words">
                {this.state.error?.name || 'RuntimeError'}: {this.state.error?.message || 'Unknown render exception'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap bg-slate-900/50 p-2 rounded border border-slate-800">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto flex-1 bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Clears corrupted localStorage keys, unregisters service workers, and restores clean state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache & Storage</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                HMIS / EMR Vault Protected
              </span>
              <span>Monrovia, Liberia</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
