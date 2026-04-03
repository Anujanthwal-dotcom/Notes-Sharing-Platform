import { useEffect, useState } from 'react';
import { noteService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';
import { BookOpen, Download, Calendar, Hash, GraduationCap, Building2, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noteService.getCollegeNotes()
      .then((res) => setNotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="text-text-secondary">
          Notes shared by students at <span className="text-text-primary font-medium">{user?.college?.college_name}</span>
        </p>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-secondary mb-2">No notes yet</h3>
          <p className="text-text-muted text-sm">Be the first to upload notes for your college!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-2xl bg-gradient-to-br from-surface/70 to-surface-card/70 border border-white/8 hover:border-primary/25 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5"
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

              <div className="flex flex-wrap gap-2 mb-4">
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

              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-text-muted">
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
