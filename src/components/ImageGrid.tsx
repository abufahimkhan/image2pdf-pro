import { useState, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { Trash2, GripHorizontal, ArrowLeftRight, Check, Sparkles, FolderUp, RefreshCw, Layers } from 'lucide-react';
import { usePDFStore } from '../store';
import { ImageFile } from '../types';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function ImageGrid() {
  const { images, removeImage, reorderImages, moveImage, clearImages, addImages } = usePDFStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update focusId if previous focus target is removed
  useEffect(() => {
    if (images.length === 0) {
      setSelectedIds(new Set());
      setFocusId(null);
    } else if (focusId && !images.some((img) => img.id === focusId)) {
      setFocusId(images[0].id);
    }
  }, [images, focusId]);

  // Click handler supporting multi-selection
  const handleItemClick = (e: MouseEvent, id: string, index: number) => {
    e.stopPropagation();
    setFocusId(id);

    const newSelected = new Set(selectedIds);
    if (e.shiftKey && focusId) {
      // Range select
      const prevIdx = images.findIndex((img) => img.id === focusId);
      const start = Math.min(prevIdx, index);
      const end = Math.max(prevIdx, index);
      for (let i = start; i <= end; i++) {
        newSelected.add(images[i].id);
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle single selection
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
    } else {
      // Single selection
      newSelected.clear();
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Keyboard Navigation: arrows logic and shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (images.length === 0) return;

    const currentIndex = images.findIndex((img) => img.id === focusId);
    if (currentIndex === -1) {
      setFocusId(images[0].id);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.min(currentIndex + 1, images.length - 1);
      const targetId = images[nextIdx].id;
      setFocusId(targetId);

      if (!e.shiftKey) {
        setSelectedIds(new Set([targetId]));
      } else {
        const nextSet = new Set(selectedIds);
        nextSet.add(targetId);
        setSelectedIds(nextSet);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = Math.max(currentIndex - 1, 0);
      const targetId = images[prevIdx].id;
      setFocusId(targetId);

      if (!e.shiftKey) {
        setSelectedIds(new Set([targetId]));
      } else {
        const nextSet = new Set(selectedIds);
        nextSet.add(targetId);
        setSelectedIds(nextSet);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (selectedIds.size > 0) {
        selectedIds.forEach((id) => removeImage(id));
        setSelectedIds(new Set());
      } else if (focusId) {
        removeImage(focusId);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      setSelectedIds(new Set(images.map((img) => img.id)));
    } else if (e.shiftKey && (e.key === ']' || e.key === 'PageDown')) {
      // Reorder items via keyboard
      e.preventDefault();
      if (focusId && currentIndex < images.length - 1) {
        moveImage(focusId, 'down');
      }
    } else if (e.shiftKey && (e.key === '[' || e.key === 'PageUp')) {
      e.preventDefault();
      if (focusId && currentIndex > 0) {
        moveImage(focusId, 'up');
      }
    }
  };

  // Drag and Drop
  const handleDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // To support Firefox
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderImages(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveSelected = (e: MouseEvent) => {
    e.stopPropagation();
    selectedIds.forEach((id) => removeImage(id));
    setSelectedIds(new Set());
  };

  const totalSize = images.reduce((acc, img) => acc + img.size, 0);

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-[#09090b]/50 border border-slate-200/80 dark:border-[#27272a] rounded-2xl p-5 shadow-sm"
      onKeyDown={handleKeyDown}
      onClick={clearSelection}
    >
      {/* Dynamic Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-[#27272a] pb-4 mb-4 select-none">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-500 dark:text-[#a1a1aa]" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#fafafa]">
            Image Assembly Queue
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-[#a1a1aa] font-bold border border-slate-200/50 dark:border-[#27272a]">
            {images.length} {images.length === 1 ? 'Image' : 'Images'}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ({formatBytes(totalSize)})
          </span>
        </div>

        {/* Queue Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleRemoveSelected}
              className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#18181b] border border-rose-150/40 dark:border-[#ef4444]/30 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Selected ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              clearImages();
              setSelectedIds(new Set());
            }}
            disabled={images.length === 0}
            className="text-xs text-slate-600 dark:text-[#a1a1aa] hover:bg-slate-150/50 dark:hover:bg-[#18181b] border border-slate-250 dark:border-[#27272a] px-3 py-1.5 rounded-lg hover:text-slate-950 dark:hover:text-[#fafafa] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Grid Canvas Workspace */}
      <div
        tabIndex={0}
        className="flex-1 overflow-y-auto min-h-[300px] outline-none rounded-xl relative focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/30 transition-all"
        style={{ contentVisibility: 'auto' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
          {images.map((img, index) => {
            const isSelected = selectedIds.has(img.id);
            const isFocused = focusId === img.id;
            const isDragging = draggedIndex === index;

            return (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={(e) => handleItemClick(e, img.id, index)}
                className={`relative group h-[190px] border rounded-xl overflow-hidden transition-all duration-200 select-none cursor-pointer flex flex-col justify-between ${
                  isDragging ? 'opacity-30 border-blue-500 scale-95 shadow-lg' : ''
                } ${
                  isSelected
                    ? 'border-[#3b82f6] ring-2 ring-blue-500/15 dark:ring-[#3b82f6]/30 shadow-md bg-blue-50/10 dark:bg-[#1e293b]/50'
                    : 'border-slate-200 dark:border-[#27272a] bg-slate-50/40 dark:bg-[#18181b]/30 hover:border-slate-350 dark:hover:border-[#3f3f46] hover:shadow-sm hover:dark:bg-[#18181b]'
                } ${
                  isFocused ? 'ring-2 ring-blue-500/40 dark:ring-[#3b82f6]/50 border-blue-500 dark:border-[#3b82f6]' : ''
                }`}
              >
                {/* Image Wrap */}
                <div className="relative flex-1 bg-slate-100 dark:bg-[#09090b] overflow-hidden flex items-center justify-center p-2 border-b border-slate-100 dark:border-[#27272a]">
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain rounded-md shadow-sm filter group-hover:brightness-[1.02] transform transition-transform group-hover:scale-[1.03] duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Batch Selector Badge */}
                  <div
                    className={`absolute top-2 left-2 w-5 h-5 rounded-md border text-[10px] flex items-center justify-center font-extrabold transition-all ${
                      isSelected
                        ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                        : 'bg-white/80 dark:bg-[#18181b]/80 text-slate-500 dark:text-[#a1a1aa] border-slate-300 dark:border-[#27272a] opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : index + 1}
                  </div>

                  {/* Drag Handle Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="p-1 px-1.5 bg-white/90 dark:bg-[#18181b]/90 hover:bg-white dark:hover:bg-[#27272a] text-slate-600 dark:text-[#a1a1aa] rounded-md shadow-sm border border-slate-200/80 dark:border-[#27272a] cursor-grab active:cursor-grabbing"
                      title="Drag to Sort"
                    >
                      <GripHorizontal className="w-3.5 h-3.5" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="p-1 bg-rose-50 hover:bg-rose-100 dark:bg-[#ef4444] dark:hover:bg-red-600 text-rose-600 dark:text-white rounded-md border border-rose-100/50 dark:border-[#ef4444] shadow-sm transition-all cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Resolution Format Sticker Tag */}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono tracking-wide px-1.5 py-0.5 rounded-sm bg-black/60 text-white font-medium select-none">
                    {img.name.split('.').pop()?.toUpperCase() || 'IMG'}
                  </span>
                </div>

                {/* Card Info Drawer */}
                <div className="p-2.5 bg-white dark:bg-[#18181b]">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#fafafa] truncate cursor-help" title={img.name}>
                    {img.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 select-none font-mono text-[10px] text-slate-500 dark:text-[#71717a]">
                    <span>{img.resolution}</span>
                    <span>{formatBytes(img.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Footer Indicators */}
      <div className="mt-2.5 border-t border-slate-100 dark:border-[#27272a] pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded font-sans bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-[#71717a]">Ctrl + A</kbd> Select All
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded font-sans bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-[#71717a]">Del</kbd> Delete Selected
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded font-sans bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-[#71717a]">Shift + [ / ]</kbd> Move Queue Item
          </span>
        </div>
        <div className="hidden md:block">
          <span>Sort layouts by Dragging and Dropping thumbnails</span>
        </div>
      </div>
    </div>
  );
}
