import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/endpoints';
import { User as UserIcon, GraduationCap, Building2, Calendar, Trash2, LogOut, Pencil, X, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStartYear, setEditStartYear] = useState('');
  const [editEndYear, setEditEndYear] = useState('');

  if (!user) return null;

  const startEdit = () => {
    setEditName(user.name);
    setEditStartYear(String(user.startYear));
    setEditEndYear(String(user.endYear));
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await userService.update({
        name: editName.trim(),
        startYear: parseInt(editStartYear),
        endYear: parseInt(editEndYear),
      } as any);
      await refreshUser();
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      logout();
      navigate('/');
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="mb-5 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">{success}</div>
      )}
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
      )}

      <div className="rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-sm overflow-hidden">
        {/* Avatar Header */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-8 py-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold bg-bg-dark/60 border border-white/15 rounded-xl px-3 py-1.5 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ) : (
              <h2 className="text-2xl font-bold">{user.name}</h2>
            )}
            <p className="text-text-secondary text-sm mt-1">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-dark/40 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-light" />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">College</p>
                <p className="text-sm font-medium text-text-primary">{user.college?.college_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-dark/40 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Course</p>
                <p className="text-sm font-medium text-text-primary">{user.course?.course}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-dark/40 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Duration</p>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editStartYear}
                      onChange={(e) => setEditStartYear(e.target.value)}
                      min={1900}
                      max={2100}
                      className="w-20 px-2 py-1 rounded-lg bg-bg-dark/60 border border-white/15 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <span className="text-text-muted">—</span>
                    <input
                      type="number"
                      value={editEndYear}
                      onChange={(e) => setEditEndYear(e.target.value)}
                      min={1900}
                      max={2100}
                      className="w-20 px-2 py-1 rounded-lg bg-bg-dark/60 border border-white/15 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-text-primary">{user.startYear} — {user.endYear}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-dark/40 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Member Since</p>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {editing && (
          <div className="px-8 pb-6 flex gap-3">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-secondary hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Actions */}
        {!editing && (
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? All your notes and data will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Account"
        danger
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
