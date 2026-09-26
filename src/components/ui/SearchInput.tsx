"use client";

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      onClear,
      placeholder = "Search...",
      size = "sm",
      disabled = false,
      containerClassName = "w-full",
      className = "",
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleClear = () => {
      if (disabled) return;

      onValueChange?.("");
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      onClear?.();
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value) {
        e.preventDefault();
        handleClear();
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const sizeStyles = {
      sm: "py-1.5 pl-8.5 pr-8 text-xs min-h-[34px]",
      md: "py-2 pl-9 pr-9 text-sm sm:text-xs min-h-[40px] sm:min-h-[38px]",
      lg: "py-2.5 pl-10 pr-10 text-base sm:text-sm min-h-[46px] sm:min-h-[42px]",
    };

    const searchIconSizes = {
      sm: "w-3.5 h-3.5 left-2.5",
      md: "w-4 h-4 left-3",
      lg: "w-4.5 h-4.5 left-3.5",
    };

    return (
      <div className={`relative flex items-center ${containerClassName}`}>
        <Search
          className={`absolute text-slate-400 dark:text-zinc-500 pointer-events-none transition-colors ${searchIconSizes[size]}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 transition-all focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${className}`}
          {...props}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export const SearchField = SearchInput;
