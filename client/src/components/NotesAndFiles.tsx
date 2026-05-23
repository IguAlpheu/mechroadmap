import { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Plus } from 'lucide-react';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  data: string; // Base64 encoded file data
}

interface NotesAndFilesProps {
  goalId: string;
}

export default function NotesAndFiles({ goalId }: NotesAndFilesProps) {
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const notesKey = `notes-${goalId}`;
  const filesKey = `files-${goalId}`;

  // Load notes and files from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(notesKey) || '';
    setNotes(savedNotes);

    const savedFiles = localStorage.getItem(filesKey);
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (e) {
        console.error('Error loading files:', e);
      }
    }

    setIsLoading(false);
  }, [goalId, notesKey, filesKey]);

  // Save notes to localStorage
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem(notesKey, newNotes);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        const newFile: StoredFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toLocaleString(),
          data: fileData,
        };

        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        localStorage.setItem(filesKey, JSON.stringify(updatedFiles));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem(filesKey, JSON.stringify(updatedFiles));
  };

  // Download file
  const handleDownloadFile = (file: StoredFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="text-white/60">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notes Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Notes</h3>
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Write your notes here... (automatically saved)"
          className="w-full h-40 p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-smooth resize-none"
        />
        <p className="text-xs text-white/40">
          {notes.length} characters • Auto-saved to browser storage
        </p>
      </div>

      {/* Files Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Files</h3>
        </div>

        {/* Upload Area */}
        <label className="block">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 hover:bg-white/5 transition-smooth cursor-pointer">
            <Plus className="w-6 h-6 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/60">Click to upload files</p>
            <p className="text-xs text-white/40 mt-1">
              PDFs, images, documents, etc.
            </p>
          </div>
        </label>

        {/* Files List */}
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="mission-card rounded-lg p-4 flex items-center justify-between hover:bg-white/5 transition-smooth"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {formatFileSize(file.size)} • {file.uploadedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-smooth"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mission-card rounded-lg p-6 text-center">
            <FileText className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/60">No files uploaded yet</p>
          </div>
        )}

        <p className="text-xs text-white/40">
          Files are stored in your browser's local storage (max ~5-10MB per goal)
        </p>
      </div>
    </div>
  );
}
