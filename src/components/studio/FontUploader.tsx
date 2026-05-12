import { useRef, useState, useEffect, DragEvent } from 'react';
import { Upload, Trash2, Type, AlertCircle, CheckCircle2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { FontFile } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

// Format from file extension
function detectFormat(name: string): FontFile['format'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'woff2') return 'woff2';
  if (ext === 'woff')  return 'woff';
  if (ext === 'otf')   return 'opentype';
  return 'truetype';
}

// Inject @font-face rules for a list of FontFile objects
export function injectFontFaces(fonts: FontFile[]) {
  let style = document.getElementById('dss-custom-fonts') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'dss-custom-fonts';
    document.head.appendChild(style);
  }
  style.textContent = fonts
    .map(f => `@font-face {
  font-family: '${f.familyName}';
  src: url('${f.dataUrl}') format('${f.format}');
  font-weight: ${f.weight};
  font-style: ${f.style};
}`)
    .join('\n');
}

interface Props {
  dsId: string;
  fonts: FontFile[];
  onAdd: (font: FontFile) => void;
  onRemove: (fontId: string) => void;
  readOnly?: boolean;
}

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

export function FontUploader({ dsId, fonts, onAdd, onRemove, readOnly }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  // Per-file naming form: fileId → familyName
  const [pending, setPending] = useState<{ file: File; id: string; familyName: string; weight: number; style: 'normal' | 'italic' } | null>(null);

  // Re-inject faces whenever font list changes (e.g. after load / add / remove)
  useEffect(() => { injectFontFaces(fonts); }, [fonts]);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext ?? '')) {
      setError('Unsupported format. Please upload .ttf, .otf, .woff or .woff2');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large (max 3 MB). This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }
    setError('');
    const guessedName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setPending({ file, id: uuid(), familyName: guessedName, weight: 400, style: 'normal' });
  }

  async function confirmUpload() {
    if (!pending) return;
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(pending.file);
      const font: FontFile = {
        id: pending.id,
        familyName: pending.familyName.trim() || pending.file.name,
        fileName: pending.file.name,
        format: detectFormat(pending.file.name),
        dataUrl,
        weight: pending.weight,
        style: pending.style,
        uploadedAt: new Date().toISOString(),
      };
      onAdd(font);
      setPending(null);
    } catch {
      setError('Failed to read font file.');
    }
    setUploading(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Existing fonts */}
      {fonts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {fonts.map(f => (
            <div
              key={f.id}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-700"
            >
              <div
                className="flex-1 min-w-0"
                style={{ fontFamily: `'${f.familyName}', sans-serif` }}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {f.familyName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {f.fileName} · {f.weight} · {f.style}
                </p>
              </div>
              {/* Live font preview */}
              <span
                className="text-xs text-gray-500 hidden sm:block"
                style={{ fontFamily: `'${f.familyName}', sans-serif`, fontSize: 13 }}
              >
                AaBbCc 123
              </span>
              {!readOnly && (
                <button
                  onClick={() => onRemove(f.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remove font"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending confirmation form */}
      {pending && (
        <div className="border border-brand-400/50 bg-brand-50 dark:bg-brand-500/10 rounded-lg p-3 flex flex-col gap-2.5">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
            <Type size={12} /> Configure font — {pending.file.name}
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400">Font family name (CSS)</label>
            <input
              type="text"
              value={pending.familyName}
              onChange={e => setPending(p => p ? { ...p, familyName: e.target.value } : p)}
              placeholder="e.g. My Brand Sans"
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-brand-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Weight</label>
              <select
                value={pending.weight}
                onChange={e => setPending(p => p ? { ...p, weight: Number(e.target.value) } : p)}
                className="px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none"
              >
                {[100,200,300,400,500,600,700,800,900].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Style</label>
              <select
                value={pending.style}
                onChange={e => setPending(p => p ? { ...p, style: e.target.value as 'normal' | 'italic' } : p)}
                className="px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="primary" loading={uploading} onClick={confirmUpload}
              icon={<CheckCircle2 size={12} />}>
              Add Font
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Drop zone (shown when no pending) */}
      {!pending && !readOnly && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            dragging
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
          )}
        >
          <Upload size={18} className={cn('transition-colors', dragging ? 'text-brand-500' : 'text-gray-400')} />
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Drop font file or <span className="text-brand-600 dark:text-brand-400">click to browse</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">.ttf · .otf · .woff · .woff2 &nbsp;(max 3 MB)</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
