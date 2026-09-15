import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useId,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options?: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string | number) => void;
  name?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  id?: string;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      placeholder = 'Select an option...',
      options,
      value,
      defaultValue,
      onChange,
      onValueChange,
      name,
      disabled = false,
      containerClassName = 'w-full',
      className = '',
      size = 'md',
      icon,
      id,
      children,
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | number>(
      defaultValue ?? (options && options.length > 0 ? options[0].value : '')
    );
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [openUpward, setOpenUpward] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listboxRef = useRef<HTMLDivElement>(null);

    // Merge internal and external refs
    const setRefs = (element: HTMLButtonElement | null) => {
      triggerRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
      }
    };

    // Determine controlled vs uncontrolled value
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // Parse options from either `options` prop or child <option> elements
    const parsedOptions: SelectOption[] = useMemo(() => {
      if (options) return options;
      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          const childProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
          opts.push({
            value: childProps.value as string | number,
            label: childProps.children?.toString() || childProps.value?.toString() || '',
            disabled: childProps.disabled,
          });
        }
      });
      return opts;
    }, [options, children]);

    // Find the currently selected option object
    const selectedOption = parsedOptions.find(
      (opt) => String(opt.value) === String(currentValue)
    );

    // Check position to flip upward if near viewport bottom
    useEffect(() => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 220 && spaceAbove > 220) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
      }
    }, [isOpen]);

    // Click outside to close dropdown
    useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(e: MouseEvent | TouchEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, [isOpen]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
        const items = listboxRef.current.querySelectorAll('[role="option"]');
        const highlightedEl = items[highlightedIndex] as HTMLElement | undefined;
        if (highlightedEl) {
          highlightedEl.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [highlightedIndex, isOpen]);

    // Update highlighted index when opening
    useEffect(() => {
      if (isOpen) {
        const index = parsedOptions.findIndex(
          (opt) => String(opt.value) === String(currentValue)
        );
        setHighlightedIndex(index >= 0 ? index : 0);
      }
    }, [isOpen, currentValue, parsedOptions]);

    const handleSelect = (val: string | number) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      setIsOpen(false);

      if (onChange) {
        onChange({
          target: {
            value: String(val),
            name,
          },
        });
      }

      onValueChange?.(val);
      triggerRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next < parsedOptions.length ? next : 0;
          });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next >= 0 ? next : parsedOptions.length - 1;
          });
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && parsedOptions[highlightedIndex]) {
          const opt = parsedOptions[highlightedIndex];
          if (!opt.disabled) {
            handleSelect(opt.value);
          }
        } else {
          setIsOpen(true);
        }
      } else if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      } else if (e.key === 'Tab') {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    const sizeStyles: Record<string, string> = {
      sm: 'py-1.5 px-2.5 text-xs rounded-lg min-h-[34px]',
      md: 'py-2 px-3 text-sm sm:text-xs rounded-xl min-h-[40px] sm:min-h-[38px]',
      lg: 'py-2.5 px-3.5 text-base sm:text-sm rounded-xl min-h-[46px] sm:min-h-[42px]',
    };

    const chevronSizeStyles: Record<string, string> = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-4.5 h-4.5',
    };

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider cursor-pointer"
          >
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Hidden input for standard form integration */}
          {name && (
            <input
              type="hidden"
              name={name}
              value={currentValue ?? ''}
              disabled={disabled}
            />
          )}

          {/* Trigger button */}
          <button
            type="button"
            id={selectId}
            ref={setRefs}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={`w-full flex items-center justify-between gap-2 text-left bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-zinc-900 shadow-2xs touch-manipulation select-none ${
              error
                ? 'border-rose-400 dark:border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : isOpen
                ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-zinc-900'
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            } ${sizeStyles[size] || sizeStyles.md} ${className}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {icon && (
                <span className="text-slate-400 dark:text-zinc-500 shrink-0">
                  {icon}
                </span>
              )}

              {selectedOption?.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}

              <span
                className={`truncate ${
                  selectedOption
                    ? 'text-slate-900 dark:text-zinc-100'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>

            <ChevronDown
              className={`shrink-0 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
              } ${chevronSizeStyles[size] || chevronSizeStyles.md}`}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {isOpen && (
            <div
              ref={listboxRef}
              role="listbox"
              tabIndex={-1}
              className={`absolute z-50 left-0 right-0 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 overscroll-contain ${
                openUpward
                  ? 'bottom-full mb-1.5 origin-bottom'
                  : 'top-full mt-1.5 origin-top'
              }`}
            >
              {parsedOptions.length === 0 ? (
                <div className="py-3 px-2 text-center text-xs text-slate-400 dark:text-zinc-500">
                  No options available
                </div>
              ) : (
                parsedOptions.map((opt, idx) => {
                  const isSelected = String(currentValue) === String(opt.value);
                  const isHighlighted = highlightedIndex === idx;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => !opt.disabled && handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left select-none ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600'
                          : isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{opt.label}</span>
                          {opt.description && (
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
