import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { noteService } from '@/services/endpoints';
import { downloadAndShareNote } from '@/services/download';
import { useAuth } from '@/context/AuthContext';
import type { Note } from '@/types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    noteService
      .getCollegeNotes()
      .then((res) => setNotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (note: Note) => {
    setDownloading(note.id);
    await downloadAndShareNote(note);
    setDownloading(null);
  };

  const openPreview = (note: Note) => {
    router.push({ pathname: '/preview' as any, params: { id: String(note.id), title: note.topic, subject: note.subject } });
  };

  const renderNote = ({ item: note }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTopic} numberOfLines={1}>{note.topic}</Text>
          <Text style={styles.noteSubject} numberOfLines={1}>{note.subject}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => openPreview(note)}
          >
            <Ionicons name="eye-outline" size={18} color={Colors.dark.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => handleDownload(note)}
            disabled={downloading === note.id}
          >
            {downloading === note.id ? (
              <ActivityIndicator size="small" color={Colors.dark.primaryLight} />
            ) : (
              <Ionicons name="download-outline" size={18} color={Colors.dark.primaryLight} />
            )}
          </TouchableOpacity>
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

      {note.college && (
        <View style={styles.collegeLine}>
          <Ionicons name="business-outline" size={12} color={Colors.dark.textMuted} />
          <Text style={styles.collegeText}>{note.college.college_name}</Text>
        </View>
      )}

      <View style={styles.dateLine}>
        <Text style={styles.dateText}>
          {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>
          Welcome, <Text style={styles.userName}>{user?.name}</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Notes shared by students at <Text style={styles.collegeName}>{user?.college?.college_name}</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="book-outline" size={32} color={Colors.dark.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to upload notes for your college!</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  headerSection: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
  greeting: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.xs },
  userName: { color: Colors.dark.primaryLight },
  headerSubtitle: { fontSize: FontSize.md, color: Colors.dark.textSecondary },
  collegeName: { color: Colors.dark.text, fontWeight: '500' },
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
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  noteInfo: { flex: 1, marginRight: Spacing.md },
  noteTopic: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark.text, marginBottom: 2 },
  noteSubject: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  previewBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  downloadBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm, backgroundColor: Colors.dark.white05,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.dark.textSecondary },
  collegeLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collegeText: { fontSize: FontSize.xs, color: Colors.dark.textMuted },
  dateLine: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.dark.white05 },
  dateText: { fontSize: FontSize.xs, color: Colors.dark.textMuted },
});
