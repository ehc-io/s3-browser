import { HardDrives, Sun, Moon, Desktop } from '@phosphor-icons/react';
import { useBrowserStore } from '../../store/browserStore';

export function Header() {
  const { theme, toggleTheme } = useBrowserStore();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Desktop;
  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 bg-surface-secondary dark:bg-dark-secondary border-b border-border-light dark:border-border-dark">
      <div className="flex items-center gap-2">
        <HardDrives size={24} className="text-accent-light dark:text-accent-dark" weight="duotone" />
        <h1 className="text-lg font-semibold">S3 Browser</h1>
      </div>

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors"
        title={`Theme: ${themeLabel}`}
      >
        <ThemeIcon size={20} weight="duotone" />
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {themeLabel}
        </span>
      </button>
    </header>
  );
}
