import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { noteService } from '@/services/endpoints';
import type { Note } from '@/types';

export default function UploadScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [semester, setSemester] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedNote, setUploadedNote] = useState<Note | null>(null);
  const [copied, setCopied] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setFile(result.assets[0]);
        setError('');
      }
    } catch {
      setError('Failed to pick file.');
    }
  };

  const getShareableLink = (noteId: number) =>
    `https://srv1470984.hstgr.cloud/note/download/${noteId}`;

  const copyLink = async (noteId: number) => {
    await Clipboard.setStringAsync(getShareableLink(noteId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a PDF file.'); return; }
    if (!subject.trim() || !topic.trim() || !semester || !session.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/pdf',
    } as any);
    formData.append('semester', semester);
    formData.append('topic', topic.trim());
    formData.append('subject', subject.trim());
    formData.append('session', session.trim());

    try {
      const res = await noteService.upload(formData);
      setUploadedNote(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUploadedNote(null);
    setFile(null);
    setSemester('');
    setTopic('');
    setSubject('');
    setSession('');
    setCopied(false);
  };

  if (uploadedNote) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.dark.success} />
            </View>
            <Text style={styles.successTitle}>Note Uploaded!</Text>
            <Text style={styles.successSubtitle}>
              <Text style={{ color: Colors.dark.text, fontWeight: '600' }}>{uploadedNote.topic}</Text> — {uploadedNote.subject}
            </Text>

            {/* Shareable Link */}
            <View style={styles.linkSection}>
              <View style={styles.linkHeader}>
                <Ionicons name="link-outline" size={16} color={Colors.dark.textSecondary} />
                <Text style={styles.linkLabel}>Shareable Download Link</Text>
              </View>
              <View style={styles.linkRow}>
                <Text style={styles.linkText} numberOfLines={1}>{getShareableLink(uploadedNote.id)}</Text>
                <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnCopied]} onPress={() => copyLink(uploadedNote.id)}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={copied ? Colors.dark.success : Colors.dark.primaryLight} />
                  <Text style={[styles.copyBtnText, copied && { color: Colors.dark.success }]}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}>
                <Text style={styles.secondaryBtnText}>Upload Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Upload Note</Text>
          <Text style={styles.subtitle}>Share your study material with fellow students</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* File Picker */}
          <TouchableOpacity style={[styles.dropZone, file && styles.dropZoneActive]} onPress={pickFile} activeOpacity={0.7}>
            {file ? (
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={32} color={Colors.dark.success} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : 'PDF'}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => setFile(null)}>
                  <Ionicons name="close" size={16} color={Colors.dark.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color={Colors.dark.textMuted} />
                <Text style={styles.dropText}>Tap to select a PDF file</Text>
                <Text style={styles.dropHint}>Max file size: 10MB</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Metadata Fields */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>
                <Ionicons name="book-outline" size={13} color={Colors.dark.textSecondary} /> Subject
              </Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Data Structures"
                placeholderTextColor={Colors.dark.textMuted}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Topic</Text>
              <TextInput
                style={styles.input}
                value={topic}
                onChangeText={setTopic}
                placeholder="Binary Trees"
                placeholderTextColor={Colors.dark.textMuted}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>
                <Ionicons name="layers-outline" size={13} color={Colors.dark.textSecondary} /> Semester
              </Text>
              <TextInput
                style={styles.input}
                value={semester}
                onChangeText={setSemester}
                placeholder="3"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={13} color={Colors.dark.textSecondary} /> Session
              </Text>
              <TextInput
                style={styles.input}
                value={session}
                onChangeText={setSession}
                placeholder="2024-25"
                placeholderTextColor={Colors.dark.textMuted}
              />
            </View>
          </View>

          <Text style={styles.autoNote}>Your course will be automatically assigned from your profile.</Text>

          <TouchableOpacity
            style={[styles.primaryBtn, (loading || !file) && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading || !file}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>{loading ? 'Uploading...' : 'Upload Note'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  successScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
  headerSection: { paddingTop: 60, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.dark.textSecondary },
  card: {
    borderRadius: BorderRadius.xl, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xxl,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.dark.danger, fontSize: FontSize.sm },
  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.dark.borderLight,
    borderRadius: BorderRadius.lg, padding: Spacing.xxxl,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  dropZoneActive: { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  dropText: { fontSize: FontSize.sm, color: Colors.dark.textSecondary, marginTop: Spacing.md },
  dropHint: { fontSize: FontSize.xs, color: Colors.dark.textMuted, marginTop: Spacing.xs },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%' },
  fileDetails: { flex: 1 },
  fileName: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.text },
  fileSize: { fontSize: FontSize.xs, color: Colors.dark.textMuted },
  removeBtn: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center',
  },
  fieldRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  fieldHalf: { flex: 1 },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary, marginBottom: Spacing.sm },
  input: {
    height: 50, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.lg, color: Colors.dark.text, fontSize: FontSize.md,
  },
  autoNote: { fontSize: FontSize.xs, color: Colors.dark.textMuted, marginBottom: Spacing.lg },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dark.primary, borderRadius: BorderRadius.md, paddingVertical: 15,
    shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  successIcon: { alignItems: 'center', marginBottom: Spacing.lg },
  successTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.dark.text, textAlign: 'center', marginBottom: Spacing.sm },
  successSubtitle: { fontSize: FontSize.sm, color: Colors.dark.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  linkSection: { marginBottom: Spacing.xxl },
  linkHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  linkLabel: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  linkText: { flex: 1, fontSize: FontSize.sm, color: Colors.dark.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm, backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  copyBtnCopied: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  copyBtnText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.dark.primaryLight },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  secondaryBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary },
});
