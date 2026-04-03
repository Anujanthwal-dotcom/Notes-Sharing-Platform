import { useEffect, useState } from 'react';
import { adminService } from '../services/endpoints';
import type { Analytics } from '../types';
import { Shield, Users, BookOpen, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Admin() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminService.getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReset = async () => {
    setResetting(true);
    setMessage('');
    try {
      const res = await adminService.resetApplication();
      setMessage(res.data.message);
      setShowConfirm(false);
      const fresh = await adminService.getAnalytics();
      setAnalytics(fresh.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Reset failed.');
    }
    setResetting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-danger flex items-center justify-center shadow-lg shadow-accent/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-text-secondary text-sm">Manage your NotesBuddy instance</p>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-surface/70 to-surface-card/70 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-light" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total Users</span>
          </div>
          <p className="text-4xl font-extrabold">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-text-muted" /> : analytics?.userCount.toLocaleString() || '0'}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-surface/70 to-surface-card/70 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total Notes</span>
          </div>
          <p className="text-4xl font-extrabold">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-text-muted" /> : analytics?.notesCount.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-danger/20 bg-danger/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-danger" />
          <h2 className="text-lg font-bold text-danger">Danger Zone</h2>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          Resetting the application will permanently delete all users, notes, colleges, and storage files. This cannot be undone.
        </p>

        {message && (
          <div className="mb-4 p-4 rounded-xl bg-surface/60 border border-white/10 text-sm text-text-primary">{message}</div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Reset Application
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        open={showConfirm}
        title="Reset Application"
        message="This will permanently delete ALL users, notes, colleges, courses, and storage files. This action is irreversible."
        confirmLabel="Yes, Reset Everything"
        danger
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
