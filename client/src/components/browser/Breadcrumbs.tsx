import { CaretRight, House } from '@phosphor-icons/react';
import { useBrowserStore, useBreadcrumbs } from '../../store/browserStore';

export function Breadcrumbs() {
  const { setPrefix } = useBrowserStore();
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 px-4 py-3 text-sm overflow-x-auto">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.prefix} className="flex items-center gap-1 flex-shrink-0">
          {index > 0 && (
            <CaretRight
              size={14}
              className="text-text-secondary-light dark:text-text-secondary-dark"
            />
          )}
          <button
            onClick={() => setPrefix(crumb.prefix)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors ${
              index === breadcrumbs.length - 1
                ? 'font-medium text-accent-light dark:text-accent-dark'
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }`}
          >
            {index === 0 && <House size={16} weight="duotone" />}
            <span>{crumb.name}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
