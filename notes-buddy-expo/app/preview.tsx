import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { File as ExpoFile } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { downloadNotePdf } from '@/services/download';

export default function PreviewScreen() {
  const { id, title, subject } = useLocalSearchParams<{
    id: string;
    title: string;
    subject: string;
  }>();
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPdf();
  }, []);

  const loadPdf = async () => {
    setLoading(true);
    setError('');
    try {
      const uri = await downloadNotePdf({ id: Number(id), topic: title || 'preview' });
      if (uri) {
        setFileUri(uri);
        // On Android, read file as base64 for WebView rendering
        if (Platform.OS === 'android') {
          const file = new ExpoFile(uri);
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          setPdfBase64(btoa(binary));
        }
      } else {
        setError('Failed to load the note. Please try again.');
      }
    } catch {
      setError('Failed to load the note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!fileUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  };

  const getPdfHtml = (base64Data: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0e1a; overflow-x: hidden; }
        canvas { display: block; margin: 8px auto; max-width: 100%; }
        #loading { color: #a0a0b0; text-align: center; padding: 40px; font-family: sans-serif; }
        #error { color: #ef4444; text-align: center; padding: 40px; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="loading">Rendering PDF...</div>
      <div id="pages"></div>
      <div id="error" style="display:none"></div>
      <script>
        async function renderPDF() {
          try {
            const pdfData = atob('${base64Data}');
            const bytes = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) bytes[i] = pdfData.charCodeAt(i);

            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
            document.getElementById('loading').style.display = 'none';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const scale = (window.innerWidth - 16) / page.getViewport({ scale: 1 }).width;
              const viewport = page.getViewport({ scale: Math.max(scale, 1) });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              document.getElementById('pages').appendChild(canvas);
              await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            }
          } catch (e) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = 'Failed to render PDF: ' + e.message;
          }
        }
        renderPDF();
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || 'Preview'}
          </Text>
          {subject ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subject}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          disabled={!fileUri}
        >
          <Ionicons
            name="share-outline"
            size={20}
            color={fileUri ? Colors.dark.primaryLight : Colors.dark.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.dark.danger} />
          </View>
          <Text style={styles.errorTitle}>Unable to load</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPdf}>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === 'android' && pdfBase64 ? (
        <WebView
          source={{ html: getPdfHtml(pdfBase64) }}
          style={styles.webview}
          originWhitelist={['*']}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          javaScriptEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
          )}
        />
      ) : fileUri ? (
        <WebView
          source={{ uri: fileUri }}
          style={styles.webview}
          originWhitelist={['*']}
          allowFileAccess
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.lg,
  },
  errorIcon: { marginBottom: Spacing.lg },
  errorTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  webviewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
});
