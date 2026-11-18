import { Moon, Sun } from 'lucide-react';
import { useIsDark, useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// A compact theme control for unauthenticated pages, where the account theme menu is unavailable.
// The existing 'oi.theme' preference and system theme support remain unchanged.
export function ThemeToggle({ className }: { className?: string }) {
  const [, setTheme] = useTheme();
  const dark = useIsDark();
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted shadow-card transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  );
}
