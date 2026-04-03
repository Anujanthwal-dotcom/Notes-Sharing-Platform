import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { userService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All your notes and data will be permanently removed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              await logout();
            } catch {
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Profile</Text>
        {!editing && (
          <TouchableOpacity style={styles.editHeaderBtn} onPress={startEdit}>
            <Ionicons name="pencil-outline" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.editHeaderBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {/* Avatar Header */}
        <View style={styles.avatarHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.avatarInfo}>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
              />
            ) : (
              <Text style={styles.userName}>{user.name}</Text>
            )}
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Detail Cards */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons name="business-outline" size={20} color={Colors.dark.primaryLight} />
            </View>
            <View>
              <Text style={styles.detailLabel}>College</Text>
              <Text style={styles.detailValue}>{user.college?.college_name}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="school-outline" size={20} color={Colors.dark.secondary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Course</Text>
              <Text style={styles.detailValue}>{user.course?.course}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.dark.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Duration</Text>
              {editing ? (
                <View style={styles.yearRow}>
                  <TextInput
                    style={styles.yearInput}
                    value={editStartYear}
                    onChangeText={setEditStartYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  <Text style={styles.yearDash}>—</Text>
                  <TextInput
                    style={styles.yearInput}
                    value={editEndYear}
                    onChangeText={setEditEndYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>{user.startYear} — {user.endYear}</Text>
              )}
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="person-outline" size={20} color={Colors.dark.success} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Edit Actions */}
        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={cancelEdit} disabled={saving}>
              <Ionicons name="close" size={16} color={Colors.dark.textSecondary} />
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, saving && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark" size={16} color="#fff" />}
              <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Actions */}
        {!editing && (
          <View style={styles.accountActions}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={Colors.dark.textSecondary} />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={18} color={Colors.dark.danger} />
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  headerSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: Spacing.lg,
  },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text },
  editHeaderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.dark.border,
  },
  editHeaderBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  successText: { color: Colors.dark.success, fontSize: FontSize.sm },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.dark.danger, fontSize: FontSize.sm },
  card: {
    borderRadius: BorderRadius.xl, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, overflow: 'hidden',
  },
  avatarHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xl,
    padding: Spacing.xxl,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  avatar: {
    width: 72, height: 72, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  avatarInfo: { flex: 1 },
  userName: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text },
  userEmail: { fontSize: FontSize.sm, color: Colors.dark.textSecondary, marginTop: 2 },
  nameInput: {
    fontSize: FontSize.xl, fontWeight: '700',
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.borderLight,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    color: Colors.dark.text,
  },
  detailsGrid: { padding: Spacing.xxl, gap: Spacing.lg },
  detailCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(10, 14, 26, 0.4)', borderWidth: 1, borderColor: Colors.dark.white05,
  },
  detailIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontSize: FontSize.xs, color: Colors.dark.textMuted, marginBottom: 2 },
  detailValue: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.text },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  yearInput: {
    width: 64, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.sm, backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderWidth: 1, borderColor: Colors.dark.borderLight,
    fontSize: FontSize.sm, color: Colors.dark.text, textAlign: 'center',
  },
  yearDash: { color: Colors.dark.textMuted },
  editActions: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl },
  accountActions: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dark.primary, borderRadius: BorderRadius.md, paddingVertical: 14,
    shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: 14, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: 14, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  logoutBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: 14, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  deleteBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.danger },
});
