import { useState, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { noteService } from '../services/endpoints';
import type { Note } from '../types';
import { Upload as UploadIcon, FileText, X, Loader2, Check, Hash, BookOpen, Calendar, LinkIcon, Copy } from 'lucide-react';

export default function UploadNote() {
  const [file, setFile] = useState<File | null>(null);
  const [semester, setSemester] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedNote, setUploadedNote] = useState<Note | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    } else {
      setError('Only PDF files are allowed.');
    }
  };

  const getShareableLink = (noteId: number) =>
    `${window.location.origin}/note/download/${noteId}`;

  const copyLink = (noteId: number) => {
    navigator.clipboard.writeText(getShareableLink(noteId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);
    formData.append('topic', topic);
    formData.append('subject', subject);
    formData.append('session', session);

    try {
      const res = await noteService.upload(formData);
      setUploadedNote(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (uploadedNote) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-sm p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Note Uploaded!</h2>
          <p className="text-text-secondary text-sm mb-6">
            <strong className="text-text-primary">{uploadedNote.topic}</strong> — {uploadedNote.subject}
          </p>

          {/* Shareable Link */}
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3 flex items-center justify-center gap-1.5">
              <LinkIcon className="w-4 h-4" /> Shareable Download Link
            </p>
            <div className="flex items-center gap-2 bg-bg-dark/60 border border-white/10 rounded-xl p-3">
              <input
                type="text"
                readOnly
                value={getShareableLink(uploadedNote.id)}
                className="flex-1 bg-transparent text-sm text-text-primary font-mono truncate focus:outline-none"
              />
              <button
                onClick={() => copyLink(uploadedNote.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-success/20 text-success'
                    : 'bg-primary/10 text-primary-light hover:bg-primary/20'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setUploadedNote(null);
                setFile(null);
                setSemester('');
                setTopic('');
                setSubject('');
                setSession('');
              }}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
            >
              Upload Another
            </button>
            <Link
              to="/my-notes"
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all text-center"
            >
              View My Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Note</h1>
        <p className="text-text-secondary">Share your study material with fellow students</p>
      </div>

      <div className="rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-sm p-8">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragActive ? 'border-primary bg-primary/5' : file ? 'border-success/30 bg-success/5' : 'border-white/15 hover:border-primary/30 hover:bg-white/2'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-success" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-2 w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-1">Drag & drop your PDF here, or click to browse</p>
                <p className="text-xs text-text-muted">Max file size: 10MB</p>
              </>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject</div>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Data Structures"
                className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="Binary Trees"
                className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Semester</div>
              </label>
              <input
                type="number"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                min={1}
                max={11}
                placeholder="3"
                className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Session</div>
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                required
                placeholder="2024-25"
                className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-text-muted">
            Your course will be automatically assigned from your profile.
          </p>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5" />}
            {loading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
