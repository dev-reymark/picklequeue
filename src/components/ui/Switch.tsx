import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`flex items-center justify-between gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      <div
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};
