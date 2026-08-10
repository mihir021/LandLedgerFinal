/**
 * DocumentUploader — drag-drop file upload zone with preview list
 */
import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function DocumentUploader({ onFilesChange, maxFiles = 5, accept = '.pdf,.jpg,.jpeg,.png' }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const newFiles = Array.from(incoming)
      .slice(0, maxFiles - files.length)
      .map(f => ({ file: f, id: Math.random().toString(36).slice(2), name: f.name, size: f.size, status: 'ready' }));
    const updated = [...files, ...newFiles];
    setFiles(updated);
    onFilesChange?.(updated.map(f => f.file));
  };

  const removeFile = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated.map(f => f.file));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all p-8 text-center ${
          dragging
            ? 'border-blue-800 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload className={`h-6 w-6 ${dragging ? 'text-blue-700' : 'text-gray-500'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">PDF, JPG, PNG — up to {maxFiles} files</p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 ll-card px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <FileText className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
              </div>
              {f.status === 'ready'
                ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              }
              <button
                onClick={() => removeFile(f.id)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
