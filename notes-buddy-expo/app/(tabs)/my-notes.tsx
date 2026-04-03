import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { noteService } from '@/services/endpoints';
import { downloadAndShareNote } from '@/services/download';
import type { Note } from '@/types';

export default function MyNotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Edit modal state
  const [editNote, setEditNote] = useState<Note | null>(null);
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
    `https://srv1470984.hstgr.cloud/note/download/${noteId}`;

  const copyLink = async (noteId: number) => {
    await Clipboard.setStringAsync(getShareableLink(noteId));
    setCopiedId(noteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (note: Note) => {
    setDownloading(note.id);
    await downloadAndShareNote(note);
    setDownloading(null);
  };

  const handleDelete = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.topic}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(note.id);
            try {
              await noteService.delete(note.id);
              setNotes((prev) => prev.filter((n) => n.id !== note.id));
            } catch {
              Alert.alert('Error', 'Failed to delete the note.');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setEditSemester(String(note.semester));
    setEditSubject(note.subject);
    setEditTopic(note.topic);
    setEditSession(note.session);
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editNote) return;
    setEditError('');
    setEditSaving(true);
    try {
      await noteService.update(editNote.id, {
        semester: parseInt(editSemester),
        subject: editSubject.trim(),
        topic: editTopic.trim(),
        session: editSession.trim(),
      } as any);
      fetchNotes();
      setEditNote(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update note.');
    } finally {
      setEditSaving(false);
    }
  };

  const renderNote = ({ item: note }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTopic} numberOfLines={1}>{note.topic}</Text>
          <Text style={styles.noteSubject} numberOfLines={1}>{note.subject}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <Ionicons name="layers-outline" size={12} color={Colors.dark.textSecondary} />
          <Text style={styles.tagText}>Sem {note.semester}</Text>
        </View>
        {note.course && (
          <View style={styles.tag}>
            <Ionicons name="school-outline" size={12} color={Colors.dark.textSecondary} />
            <Text style={styles.tagText}>{note.course.course}</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Ionicons name="calendar-outline" size={12} color={Colors.dark.textSecondary} />
          <Text style={styles.tagText}>{note.session}</Text>
        </View>
      </View>

      <View style={styles.dateLine}>
        <Text style={styles.dateText}>
          Uploaded {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPreview]}
          onPress={() => router.push({ pathname: '/preview' as any, params: { id: String(note.id), title: note.topic, subject: note.subject } })}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.dark.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(note)}>
          <Ionicons name="pencil-outline" size={16} color={Colors.dark.primaryLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, copiedId === note.id && styles.actionBtnSuccess]}
          onPress={() => copyLink(note.id)}
        >
          <Ionicons
            name={copiedId === note.id ? 'checkmark' : 'link-outline'}
            size={16}
            color={copiedId === note.id ? Colors.dark.success : Colors.dark.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDownload(note)}
          disabled={downloading === note.id}
        >
          {downloading === note.id ? (
            <ActivityIndicator size="small" color={Colors.dark.primaryLight} />
          ) : (
            <Ionicons name="download-outline" size={16} color={Colors.dark.primaryLight} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => handleDelete(note)}
          disabled={deleting === note.id}
        >
          {deleting === note.id ? (
            <ActivityIndicator size="small" color={Colors.dark.danger} />
          ) : (
            <Ionicons name="trash-outline" size={16} color={Colors.dark.danger} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>My Notes</Text>
        <Text style={styles.subtitle}>{notes.length} note{notes.length !== 1 ? 's' : ''} uploaded</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-text-outline" size={32} color={Colors.dark.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No notes uploaded yet</Text>
          <Text style={styles.emptySubtitle}>Start sharing your notes with others!</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editNote} transparent animationType="fade" onRequestClose={() => setEditNote(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="pencil" size={20} color={Colors.dark.accent} />
              </View>
              <Text style={styles.modalTitle}>Edit Note</Text>
              <TouchableOpacity onPress={() => setEditNote(null)} disabled={editSaving} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            </View>

            {editError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput style={styles.input} value={editSubject} onChangeText={setEditSubject} placeholderTextColor={Colors.dark.textMuted} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Topic</Text>
              <TextInput style={styles.input} value={editTopic} onChangeText={setEditTopic} placeholderTextColor={Colors.dark.textMuted} />
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Semester</Text>
                <TextInput style={styles.input} value={editSemester} onChangeText={setEditSemester} keyboardType="number-pad" maxLength={2} placeholderTextColor={Colors.dark.textMuted} />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Session</Text>
                <TextInput style={styles.input} value={editSession} onChangeText={setEditSession} placeholderTextColor={Colors.dark.textMuted} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditNote(null)} disabled={editSaving}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, editSaving && styles.disabledBtn]}
                onPress={handleEditSave}
                disabled={editSaving}
              >
                {editSaving ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark" size={18} color="#fff" />}
                <Text style={styles.primaryBtnText}>{editSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  headerSection: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: BorderRadius.lg, backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.dark.textSecondary, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.dark.textMuted },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  noteCard: {
    borderRadius: BorderRadius.lg, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  noteInfo: { flex: 1 },
  noteTopic: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark.text, marginBottom: 2 },
  noteSubject: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm, backgroundColor: Colors.dark.white05,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.dark.textSecondary },
  dateLine: { paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.dark.white05, marginBottom: Spacing.md },
  dateText: { fontSize: FontSize.xs, color: Colors.dark.textMuted },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.white05, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  actionBtnDanger: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  actionBtnPreview: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: Spacing.xl },
  modalCard: {
    borderRadius: BorderRadius.xl, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xxl,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  modalIconWrap: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  modalTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.dark.text },
  modalCloseBtn: { padding: Spacing.sm },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.dark.danger, fontSize: FontSize.sm },
  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary, marginBottom: Spacing.sm },
  input: {
    height: 50, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.lg, color: Colors.dark.text, fontSize: FontSize.md,
  },
  fieldRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  fieldHalf: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dark.primary, borderRadius: BorderRadius.md, paddingVertical: 13,
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },
  secondaryBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
});
