import { useEffect, useState, type FormEvent } from 'react';
import { noteService } from '../services/endpoints';
import type { Note } from '../types';
import { Download, Trash2, Loader2, Hash, GraduationCap, Calendar, FileText, Pencil, X, Check, BookOpen, LinkIcon } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [editTarget, setEditTarget] = useState<Note | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Edit form state
  const [editSemester, setEditSemester] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editSession, setEditSession] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    setLoading(true);
    noteService.getMyNotes()
      .then((res) => setNotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getShareableLink = (noteId: number) =>
    `${window.location.origin}/note/download/${noteId}`;

  const copyLink = (noteId: number) => {
    navigator.clipboard.writeText(getShareableLink(noteId));
    setCopiedId(noteId);
    setTimeout(() => setCopiedId(null), 2000);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await noteService.delete(deleteTarget.id);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    } catch { /* ignore */ }
    setDeleting(null);
    setDeleteTarget(null);
  };

  const openEdit = (note: Note) => {
    setEditTarget(note);
    setEditSemester(String(note.semester));
    setEditSubject(note.subject);
    setEditTopic(note.topic);
    setEditSession(note.session);
    setEditError('');
  };

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    setEditSaving(true);
    try {
      await noteService.update(editTarget.id, {
        semester: parseInt(editSemester),
        subject: editSubject.trim(),
        topic: editTopic.trim(),
        session: editSession.trim(),
      } as any);
      const res = await noteService.getMyNotes();
      setNotes(res.data);
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update note.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Notes</h1>
          <p className="text-text-secondary text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-secondary mb-2">No notes uploaded yet</h3>
          <p className="text-text-muted text-sm">Start sharing your notes with others!</p>
        </div>
      ) : (
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
                <div className="flex gap-1.5 ml-3 shrink-0">
                  <button
                    onClick={() => openEdit(note)}
                    className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center hover:bg-accent/20 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyLink(note.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      copiedId === note.id
                        ? 'bg-success/20 text-success'
                        : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                    }`}
                    title={copiedId === note.id ? 'Copied!' : 'Copy shareable link'}
                  >
                    {copiedId === note.id ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary-light flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(note)}
                    className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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

              <div className="pt-3 border-t border-white/5 text-xs text-text-muted">
                Uploaded {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Note"
        message={
          <>
            Are you sure you want to delete <strong className="text-text-primary">{deleteTarget?.topic}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        danger
        loading={deleting === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Edit Note Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
            onClick={() => !editSaving && setEditTarget(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-white/10 shadow-2xl shadow-black/40 animate-[scaleIn_200ms_ease-out]">
            <button
              onClick={() => setEditTarget(null)}
              disabled={editSaving}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Edit Note</h3>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{editError}</div>
              )}

              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject</span>
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Semester</span>
                    </label>
                    <input
                      type="number"
                      value={editSemester}
                      onChange={(e) => setEditSemester(e.target.value)}
                      required
                      min={1}
                      max={11}
                      className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Session</span>
                    </label>
                    <input
                      type="text"
                      value={editSession}
                      onChange={(e) => setEditSession(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    disabled={editSaving}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-text-secondary hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
