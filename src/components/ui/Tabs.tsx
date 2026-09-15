import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  orientation?: 'horizontal' | 'vertical' | 'responsive';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  orientation = 'responsive',
  className = '',
}) => {
  // 'responsive' displays horizontal scrolling pills on mobile (< md), and vertical sidebar on desktop (>= md)
  const containerOrientation =
    orientation === 'horizontal'
      ? 'flex flex-row overflow-x-auto border-b border-slate-200 dark:border-zinc-800 p-2 gap-1.5'
      : orientation === 'vertical'
      ? 'flex flex-col border-r border-slate-200 dark:border-zinc-800 p-2 gap-1 w-52 shrink-0'
      : 'flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto w-full md:w-52 bg-slate-50 dark:bg-zinc-950/70 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 p-2 gap-1 shrink-0';

  const buttonOrientation =
    orientation === 'horizontal'
      ? 'whitespace-nowrap shrink-0'
      : orientation === 'vertical'
      ? 'w-full text-left'
      : 'whitespace-nowrap shrink-0 md:shrink md:w-full text-left';

  return (
    <div className={`${containerOrientation} ${className}`}>
      {items.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${buttonOrientation} ${
              isActive
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs border border-slate-200 dark:border-zinc-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-auto shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
