import { File as ExpoFile, Paths } from 'expo-file-system';
// @ts-ignore – accessing the native module's static method
import ExpoFileSystem from 'expo-file-system/src/ExpoFileSystem';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import type { Note } from '@/types';

const API_BASE = 'https://srv1470984.hstgr.cloud';

/**
 * Downloads a note PDF using the native expo-file-system downloader.
 * Returns the local file URI on success, or null on failure.
 */
export async function downloadNotePdf(note: { id: number; topic?: string }): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('nb_access_token');
    const fileName = `${(note.topic || 'note').replace(/[^a-zA-Z0-9_\-. ]/g, '_')}_${note.id}.pdf`;
    const destFile = new ExpoFile(Paths.cache, fileName);

    const url = `${API_BASE}/note/download/${note.id}`;
    await ExpoFileSystem.downloadFileAsync(url, destFile, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });

    return destFile.uri;
  } catch (err) {
    console.error('Download failed:', err);
    return null;
  }
}

/**
 * Downloads a note and opens the share sheet.
 */
export async function downloadAndShareNote(note: { id: number; topic?: string }): Promise<void> {
  const uri = await downloadNotePdf(note);
  if (!uri) {
    Alert.alert('Error', 'Failed to download the note. Please try again.');
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  } else {
    Alert.alert('Downloaded', 'File has been downloaded.');
  }
}
