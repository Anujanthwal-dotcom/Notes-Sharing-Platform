import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { searchService } from '@/services/endpoints';
import { downloadAndShareNote } from '@/services/download';
import type { Note, SearchMeta } from '@/types';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState('');
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    searchService.getHistory().then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  const doSearch = async (p = 1) => {
    setLoading(true);
    setHasSearched(true);
    const params: Record<string, string | number> = { page: p, limit: 10 };
    if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
    if (semester) params.semester = parseInt(semester);
    if (subject) params.subject = subject;
    if (session) params.session = session;

    try {
      const res = await searchService.search(params);
      setNotes(res.data.data);
      setMeta(res.data.meta);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    setLoading(true);
    setHasSearched(true);
    searchService.search({ searchTerm: term, page: 1, limit: 10 })
      .then((res) => { setNotes(res.data.data); setMeta(res.data.meta); setPage(1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Search Notes</Text>
        <Text style={styles.subtitle}>Find notes by subject, topic, semester, and more</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={20} color={Colors.dark.textMuted} style={{ marginRight: Spacing.md }} />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by subject or topic..."
              placeholderTextColor={Colors.dark.textMuted}
              returnKeyType="search"
              onSubmitEditing={() => doSearch(1)}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={18} color={showFilters ? Colors.dark.primaryLight : Colors.dark.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => doSearch(1)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                value={semester}
                onChangeText={setSemester}
                placeholder="Semester"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={styles.filterInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor={Colors.dark.textMuted}
              />
            </View>
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                value={session}
                onChangeText={setSession}
                placeholder="Session (2024-25)"
                placeholderTextColor={Colors.dark.textMuted}
              />
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setSemester(''); setSubject(''); setSession(''); }}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.dark.primaryLight} />
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Search History */}
      {!hasSearched && history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Ionicons name="time-outline" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.historyLabel}>Recent Searches</Text>
          </View>
          <View style={styles.historyTags}>
            {history.map((h, i) => (
              <TouchableOpacity key={i} style={styles.historyTag} onPress={() => handleHistoryClick(h)}>
                <Text style={styles.historyTagText}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : hasSearched && notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={Colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>Try different keywords or filters</Text>
        </View>
      ) : (
        <>
          {meta && (
            <Text style={styles.resultCount}>{meta.total} result{meta.total !== 1 ? 's' : ''} found</Text>
          )}
          <FlatList
            data={notes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNote}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              meta && meta.lastPage > 1 ? (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                    onPress={() => doSearch(page - 1)}
                    disabled={page <= 1}
                  >
                    <Ionicons name="chevron-back" size={16} color={page <= 1 ? Colors.dark.textMuted : Colors.dark.textSecondary} />
                    <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>Prev</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>Page {page} of {meta.lastPage}</Text>
                  <TouchableOpacity
                    style={[styles.pageBtn, page >= meta.lastPage && styles.pageBtnDisabled]}
                    onPress={() => doSearch(page + 1)}
                    disabled={page >= meta.lastPage}
                  >
                    <Text style={[styles.pageBtnText, page >= meta.lastPage && styles.pageBtnTextDisabled]}>Next</Text>
                    <Ionicons name="chevron-forward" size={16} color={page >= meta.lastPage ? Colors.dark.textMuted : Colors.dark.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  headerSection: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.dark.textSecondary },
  searchCard: {
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.lg, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 46,
  },
  searchInput: { flex: 1, color: Colors.dark.text, fontSize: FontSize.md },
  filterBtn: {
    width: 46, height: 46, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' },
  searchBtn: {
    width: 46, height: 46, borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primary, alignItems: 'center', justifyContent: 'center',
  },
  filtersContainer: { marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.dark.white05 },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  filterInput: {
    flex: 1, height: 42, borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.md, color: Colors.dark.text, fontSize: FontSize.sm,
  },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingHorizontal: Spacing.lg, height: 42, borderRadius: BorderRadius.sm,
  },
  clearBtnText: { fontSize: FontSize.xs, color: Colors.dark.primaryLight },
  historySection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  historyLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
  historyTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  historyTag: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.dark.surfaceCard,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  historyTagText: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.dark.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.dark.textMuted },
  resultCount: { fontSize: FontSize.sm, color: Colors.dark.textMuted, paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  noteCard: {
    borderRadius: BorderRadius.lg, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  noteInfo: { flex: 1, marginRight: Spacing.md },
  noteTopic: { fontSize: FontSize.md, fontWeight: '600', color: Colors.dark.text, marginBottom: 2 },
  noteSubject: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  previewBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center',
  },
  downloadBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm, backgroundColor: Colors.dark.white05,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.dark.textSecondary },
  collegeLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collegeText: { fontSize: FontSize.xs, color: Colors.dark.textMuted },
  pagination: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, paddingVertical: Spacing.xl,
  },
  pageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.dark.border,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  pageBtnTextDisabled: { color: Colors.dark.textMuted },
  pageInfo: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
});
