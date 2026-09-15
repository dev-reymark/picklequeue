import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider cursor-pointer"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
