import { useState, useEffect, type FormEvent } from 'react';
import { searchService, noteService } from '../services/endpoints';
import type { Note, SearchMeta } from '../types';
import { Search as SearchIcon, Download, Filter, X, Loader2, Clock, ChevronLeft, ChevronRight, Hash, GraduationCap, Calendar, Building2 } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState('');
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    searchService.getHistory().then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  const doSearch = async (p = 1) => {
    setLoading(true);
    setHasSearched(true);
    const params: Record<string, string | number> = { page: p, limit: 10 };
    if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
    if (semester) params.semester = parseInt(semester);
    if (course) params.course = course;
    if (subject) params.subject = subject;
    if (session) params.session = session;

    try {
      const res = await searchService.search(params);
      setNotes(res.data.data);
      setMeta(res.data.meta);
      setPage(p);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    // auto-search
    setLoading(true);
    setHasSearched(true);
    searchService.search({ searchTerm: term, page: 1, limit: 10 })
      .then((res) => { setNotes(res.data.data); setMeta(res.data.meta); setPage(1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDownload = async (note: Note) => {
    try {
      const res = await noteService.download(note.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.topic || 'note'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const clearFilters = () => {
    setSemester('');
    setCourse('');
    setSubject('');
    setSession('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Notes</h1>
        <p className="text-text-secondary">Find notes by subject, topic, semester, and more</p>
      </div>

      {/* Search Form */}
      <div className="rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by subject or topic..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3.5 rounded-xl border transition-colors flex items-center gap-2 text-sm font-medium ${
                showFilters ? 'bg-primary/10 border-primary/30 text-primary-light' : 'border-white/10 text-text-secondary hover:bg-white/5'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-secondary">Advanced Filters</span>
                <button type="button" onClick={clearFilters} className="text-xs text-primary-light hover:text-primary flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="number"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Semester"
                  min={1}
                  max={11}
                  className="px-3 py-2.5 rounded-lg bg-bg-dark/60 border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Course"
                  className="px-3 py-2.5 rounded-lg bg-bg-dark/60 border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="px-3 py-2.5 rounded-lg bg-bg-dark/60 border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  placeholder="Session (2024-25)"
                  className="px-3 py-2.5 rounded-lg bg-bg-dark/60 border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Search History */}
      {!hasSearched && history.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(h)}
                className="px-3.5 py-1.5 rounded-full bg-surface-card/60 border border-white/8 text-sm text-text-secondary hover:text-text-primary hover:border-primary/30 transition-all"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : hasSearched && notes.length === 0 ? (
        <div className="text-center py-20">
          <SearchIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-secondary mb-2">No results found</h3>
          <p className="text-text-muted text-sm">Try different keywords or filters</p>
        </div>
      ) : (
        <>
          {meta && (
            <p className="text-sm text-text-muted mb-4">{meta.total} result{meta.total !== 1 ? 's' : ''} found</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group rounded-2xl bg-gradient-to-br from-surface/70 to-surface-card/70 border border-white/8 hover:border-primary/25 p-6 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary truncate mb-1">{note.topic}</h3>
                    <p className="text-sm text-text-secondary truncate">{note.subject}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(note)}
                    className="ml-3 w-10 h-10 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
                    title="Download"
                  >
                    <Download className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-text-secondary">
                    <Hash className="w-3 h-3" /> Sem {note.semester}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-text-secondary">
                  <GraduationCap className="w-3 h-3" /> {note.course?.course}
                </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-text-secondary">
                    <Calendar className="w-3 h-3" /> {note.session}
                  </span>
                </div>

                {note.college && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Building2 className="w-3 h-3" />
                    {note.college.college_name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.lastPage > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-text-secondary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-text-secondary">
                Page {page} of {meta.lastPage}
              </span>
              <button
                onClick={() => doSearch(page + 1)}
                disabled={page >= meta.lastPage}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-text-secondary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
