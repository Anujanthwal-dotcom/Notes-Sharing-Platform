import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { noteService } from '../services/endpoints';
import { Loader2, Download, AlertTriangle } from 'lucide-react';

export default function NoteDownload() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(true);

  useEffect(() => {
    if (!id) { setError('Invalid note link.'); setDownloading(false); return; }

    const noteId = parseInt(id);
    if (isNaN(noteId)) { setError('Invalid note ID.'); setDownloading(false); return; }

    noteService.download(noteId)
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `note-${noteId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloading(false);
      })
      .catch(() => {
        setError('Note not found or you need to be logged in to download.');
        setDownloading(false);
      });
  }, [id]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {downloading ? (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Downloading...</h2>
          <p className="text-text-secondary text-sm">Your note will download automatically.</p>
        </>
      ) : error ? (
        <>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/15 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold mb-2">Download Failed</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Sign In to Download
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-success/15 flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold mb-2">Download Complete</h2>
          <p className="text-text-secondary text-sm">Your note has been downloaded successfully.</p>
        </>
      )}
    </div>
  );
}
