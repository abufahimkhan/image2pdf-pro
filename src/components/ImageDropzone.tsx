import { useState, useRef, DragEvent, ClipboardEvent, ChangeEvent } from 'react';
import { UploadCloud, Image, FolderOpen, AlertCircle } from 'lucide-react';
import { usePDFStore } from '../store';

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'tif'];

export default function ImageDropzone() {
  const { addImages } = usePDFStore();
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse folder and file drops recursively
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    setErrorText(null);

    const items = e.dataTransfer.items;

    if (items) {
      const traverseFileTree = (item: any): Promise<File[]> => {
        return new Promise((resolve) => {
          if (item.isFile) {
            item.file((file: File) => {
              const ext = file.name.split('.').pop()?.toLowerCase();
              if (ext && ACCEPTED_EXTENSIONS.includes(ext)) {
                resolve([file]);
              } else {
                resolve([]);
              }
            });
          } else if (item.isDirectory) {
            const dirReader = item.createReader();
            dirReader.readEntries(async (entries: any[]) => {
              const filePromises = entries.map((entry) => traverseFileTree(entry));
              const filesArrays = await Promise.all(filePromises);
              resolve(filesArrays.flat());
            });
          } else {
            resolve([]);
          }
        });
      };

      const promises: Promise<File[]>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          promises.push(traverseFileTree(item));
        }
      }

      const results = await Promise.all(promises);
      const flattened = results.flat();
      if (flattened.length > 0) {
        addImages(flattened);
      } else {
        setErrorText('No compatible image files found in the dropped target.');
      }
    } else {
      // Fallback
      const files = Array.from(e.dataTransfer.files) as File[];
      const filtered = files.filter((file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext && ACCEPTED_EXTENSIONS.includes(ext);
      });

      if (filtered.length > 0) {
        addImages(filtered);
      } else {
        setErrorText('No compatible image files found.');
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorText(null);
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      addImages(files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Support clipboard pasting
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }

    if (pastedFiles.length > 0) {
      addImages(pastedFiles);
    }
  };

  return (
    <div
      id="image-dropzone-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
      className={`min-h-[360px] cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 mb-2 focus:outline-none transition-all duration-300 relative ${
        isDragActive
          ? 'border-blue-500 bg-blue-500/10 dark:border-[#3b82f6] dark:bg-[#1e293b]/30 scale-[0.99] shadow-inner'
          : 'border-slate-300 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/20 hover:border-slate-400 dark:hover:border-[#3f3f46] hover:bg-slate-100/30 dark:hover:bg-[#18181b]/40'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center max-w-lg text-center pointer-events-none select-none">
        {/* Animated Stack Visualization */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-indigo-100 dark:bg-[#27272a] rounded-xl rotate-[-12deg] translate-y-1 transform transition-all group-hover:rotate-[-20deg] group-hover:scale-105 duration-350" />
          <div className="absolute w-12 h-12 bg-sky-100 dark:bg-[#18181b] rounded-xl rotate-[6deg] translate-x-2 transform transition-all group-hover:rotate-[15deg] group-hover:scale-105 duration-350 border dark:border-[#27272a]" />
          <div className="relative w-12 h-12 bg-gradient-to-tr from-[#3b82f6] to-blue-700 text-white shadow-md rounded-xl flex items-center justify-center transform transition-all group-hover:scale-110 duration-350">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-[#fafafa] mb-1 group-hover:text-blue-600 dark:group-hover:text-[#3b82f6] transition-colors">
          Drag & drop images or folders here
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mb-6 max-w-sm">
          Supports JPEG, PNG, WEBP, BMP, and TIFF formats. Paste images directly (Ctrl + V) from your clipboard.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          className="pointer-events-auto cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#18181b] text-slate-700 dark:text-[#fafafa] font-medium text-xs rounded-xl shadow-sm border border-slate-200 dark:border-[#27272a] hover:bg-slate-50 dark:hover:bg-[#27272a] hover:dark:border-[#3f3f46] transition-all duration-250 active:scale-[0.98]"
        >
          <FolderOpen className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
          <span>Browse Files</span>
        </button>

        {errorText && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/35 border border-rose-100 dark:border-rose-900/40 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
