import type { Icon } from '@phosphor-icons/react';

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
}

export function EmptyState({ icon: IconComponent, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <IconComponent
        size={48}
        weight="duotone"
        className="text-text-secondary-light dark:text-text-secondary-dark mb-4"
      />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
        {description}
      </p>
    </div>
  );
}
