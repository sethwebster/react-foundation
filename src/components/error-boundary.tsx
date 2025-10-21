"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
          <div className="mb-6 text-6xl">⚠️</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Something went wrong</h2>
          <p className="mb-6 max-w-md text-sm text-white/70">
            {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="rounded-full border border-white/25 bg-slate-950/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-sky-300 hover:via-indigo-400 hover:to-purple-400"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
