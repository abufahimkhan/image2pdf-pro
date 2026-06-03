import { Sun, Moon, Laptop, History, HelpCircle } from 'lucide-react';
import { usePDFStore } from '../store';
import { useEffect } from 'react';

export default function TitleBar({ onShowAbout, onShowHistory }: { onShowAbout: () => void; onShowHistory: () => void }) {
  const { theme, setTheme, recentConversions } = usePDFStore();

  // Apply theme class and react to OS changes while in system mode.
  useEffect(() => {
    const root = globalThis.document.documentElement;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const useDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      root.classList.toggle('dark', useDark);
    };

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  return (
    <header className="h-14 border-b border-slate-200/80 dark:border-[#27272a] bg-white dark:bg-[#09090b] backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none gap-2">
      {/* Visual Window Controls & Branding */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mock macOS Window traffic lights */}
        <div className="hidden sm:flex items-center gap-1.5 group">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-[#27272a]" />

        {/* Application Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-indigo-550 dark:text-[#a1a1aa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="font-semibold text-slate-800 dark:text-[#fafafa] tracking-tight text-sm truncate">Image2PDF Pro</span>
          <span className="hidden md:inline text-[10px] select-none uppercase font-bold tracking-widest bg-indigo-50 dark:bg-[#18181b] text-indigo-600 dark:text-[#a1a1aa] px-1.5 py-0.5 rounded border border-indigo-100 dark:border-[#27272a]">
            Document
          </span>
        </div>
      </div>

      {/* Titlebar Action Center */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Conversion History Button */}
        <button
          onClick={onShowHistory}
          className="relative p-2 rounded-lg text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#fafafa] hover:bg-slate-50 dark:hover:bg-[#18181b] transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Conversion History"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          {recentConversions.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-[#3b82f6] text-white rounded-full flex items-center justify-center animate-pulse">
              {recentConversions.length}
            </span>
          )}
        </button>

        {/* Info/Help Button */}
        <button
          onClick={onShowAbout}
          className="p-2 rounded-lg text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#fafafa] hover:bg-slate-50 dark:hover:bg-[#18181b] transition-all cursor-pointer"
          title="About Application"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-[#27272a]" />

        {/* Theme Settings Selector */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-[#18181b] p-1 rounded-lg border border-slate-200/50 dark:border-[#27272a]">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${theme === 'light'
              ? 'bg-white dark:bg-[#27272a] shadow-sm text-slate-800 dark:text-[#fafafa]'
              : 'text-slate-400 dark:text-[#a1a1aa]/60 hover:text-slate-600 dark:hover:text-[#fafafa]'
              }`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${theme === 'dark'
              ? 'bg-white dark:bg-[#27272a] shadow-sm text-slate-800 dark:text-[#fafafa]'
              : 'text-slate-400 dark:text-[#a1a1aa]/60 hover:text-slate-600 dark:hover:text-[#fafafa]'
              }`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${theme === 'system'
              ? 'bg-white dark:bg-[#27272a] shadow-sm text-slate-800 dark:text-[#fafafa]'
              : 'text-slate-400 dark:text-[#a1a1aa]/60 hover:text-slate-600 dark:hover:text-[#fafafa]'
              }`}
            title="System Preference"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
