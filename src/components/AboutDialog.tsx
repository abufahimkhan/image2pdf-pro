import { ShieldCheck, Laptop, Cpu, Keyboard, Layers, Info } from 'lucide-react';

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-905/75 dark:bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Floating Modal Content */}
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] shadow-2xl rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272a] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              <span>I2P</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#fafafa]">
                Image2PDF Pro Desktop
              </h3>
              <p className="text-[10px] text-indigo-700 dark:text-[#3b82f6] font-semibold font-mono tracking-wide">
                Desktop release • v2.4.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#18181b] cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Modules */}
        <div className="space-y-5">
          {/* 1. Tech specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-[#18181b] border border-slate-150 dark:border-[#27272a] rounded-xl flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-[#fafafa] uppercase tracking-wider">Rendering Engine</h4>
                <p className="text-[10px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">Local image preprocessing with optimized PDF output.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#18181b] border border-slate-150 dark:border-[#27272a] rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-[#fafafa] uppercase tracking-wider">Local Privacy</h4>
                <p className="text-[10px] text-slate-500 dark:text-[#a1a1aa] mt-0.5">Files stay on the device during conversion.</p>
              </div>
            </div>
          </div>

          {/* 2. Shortcuts list */}
          <div className="space-y-2.5 border-t border-slate-100 dark:border-[#27272a] pt-4">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-[#71717a] uppercase tracking-widest flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>Keyboard hotkey bindings</span>
            </h4>

            <div className="bg-slate-50 dark:bg-[#18181b]/50 border border-slate-150 dark:border-[#27272a] rounded-xl p-3 space-y-2 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-[#a1a1aa]">Select All Queue Items</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono font-bold bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-[#fafafa] shadow-sm">
                  Ctrl / ⌘ + A
                </kbd>
              </div>
              <div className="h-px bg-slate-150 dark:bg-[#27272a]" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-[#a1a1aa]">Delete Focused / Highlighted Items</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono font-bold bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-[#fafafa] shadow-sm">
                  Backspace / Del
                </kbd>
              </div>
              <div className="h-px bg-slate-150 dark:bg-[#27272a]" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-[#a1a1aa]">Shift Item Index Backward</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono font-bold bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-[#fafafa] shadow-sm">
                  Shift + [ (or PageUp)
                </kbd>
              </div>
              <div className="h-px bg-slate-150 dark:bg-[#27272a]" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-[#a1a1aa]">Shift Item Index Forward</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono font-bold bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-[#fafafa] shadow-sm">
                  Shift + ] (or PageDown)
                </kbd>
              </div>
            </div>
          </div>

          {/* 3. Specs Info */}
          <div className="bg-indigo-50/40 dark:bg-[#18181b]/40 border border-indigo-105/50 dark:border-[#27272a] rounded-xl p-3.5 flex gap-3 select-none">
            <Info className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-indigo-850 dark:text-[#fafafa] font-medium">Desktop Ready</p>
              <p className="text-[10px] text-indigo-650/80 dark:text-[#a1a1aa] mt-1 leading-relaxed">
                The app is set up for lightweight desktop deployment with Tauri. Run <code className="font-mono bg-indigo-100/60 dark:bg-[#09090b] border dark:border-[#27272a] p-0.5 px-1 rounded text-[9px] text-[#3b82f6]">npm run tauri build</code> locally to bundle native Windows `.exe` installers.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-3.5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-[#71717a]">Developed By</p>
            <a
              href="https://portfahimkhshanto.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] underline underline-offset-2"
            >
              Abu Fahim Khan | Frontend Architect
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-100 dark:border-[#27272a] pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl cursor-pointer shadow transition-all focus:outline-none"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
