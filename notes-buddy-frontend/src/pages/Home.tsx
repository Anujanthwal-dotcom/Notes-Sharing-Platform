import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, ArrowRight, Sparkles, Share2, Download, TrendingUp } from 'lucide-react';
import type { Analytics } from '../types';

export default function Home() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    analyticsService.get().then((res) => setAnalytics(res.data)).catch(() => {});
  }, []);

  // Redirect authenticated users away from landing page
  if (!isLoading && isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Your college notes, always within reach
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
              Share Notes,
              <br />
              <span className="bg-gradient-to-r from-primary-light via-secondary to-primary bg-clip-text text-transparent">
                Learn Together
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your notes, share with classmates, and access study materials from students at your college.
              The smart way to learn collaboratively.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-text-primary border border-white/15 rounded-xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface/80 to-surface-card/80 border border-white/10 p-8 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-light" />
                </div>
                <p className="text-4xl font-extrabold text-text-primary mb-1">
                  {analytics ? analytics.userCount.toLocaleString() : '—'}
                </p>
                <p className="text-sm font-medium text-text-secondary">Active Students</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface/80 to-surface-card/80 border border-white/10 p-8 backdrop-blur-sm hover:border-secondary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-4xl font-extrabold text-text-primary mb-1">
                  {analytics ? analytics.notesCount.toLocaleString() : '—'}
                </p>
                <p className="text-sm font-medium text-text-secondary">Notes Shared</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why NotesBuddy?</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">Everything you need to share and discover the best study notes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Share2 className="w-6 h-6" />, title: 'Share Instantly', desc: 'Upload your notes in PDF format and share them with your entire college in seconds.' },
              { icon: <Download className="w-6 h-6" />, title: 'Download Anytime', desc: 'Access notes from other students. Search by subject, semester, or topic.' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Stay Organized', desc: 'Filter notes by semester, course, and session. Find exactly what you need.' },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-gradient-to-br from-surface/50 to-surface-card/50 border border-white/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light mb-5 group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-muted text-sm">
          © {new Date().getFullYear()} NotesBuddy. Built for students, by a student.
        </div>
      </footer>
    </div>
  );
}
