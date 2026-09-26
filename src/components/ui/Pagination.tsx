"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Select } from "./Select";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  showFirstLast?: boolean;
  siblingCount?: number;
  itemName?: string;
  className?: string;
}

const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | string)[] => {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  showPageSizeSelector = true,
  showItemCount = true,
  showFirstLast = true,
  siblingCount = 1,
  itemName = "players",
  className = "",
}) => {
  const pages = getPaginationRange(currentPage, totalPages, siblingCount);

  const startItem =
    totalItems === undefined || totalItems === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;
  const endItem =
    totalItems === undefined
      ? 0
      : Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-zinc-400">
        {showItemCount && totalItems !== undefined && (
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {totalItems}
            </span>{" "}
            {itemName}
          </div>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <div className="w-20">
              <Select
                size="sm"
                value={pageSize}
                onValueChange={(val) => {
                  onPageSizeChange(Number(val));
                  onPageChange(1);
                }}
                options={pageSizeOptions.map((opt) => ({
                  value: opt,
                  label: String(opt),
                }))}
                containerClassName="w-full"
                className="py-1 px-2.5 text-xs min-h-[30px]"
              />
            </div>
          </div>
        )}
      </div>

      <nav
        aria-label="Pagination Navigation"
        className="flex items-center gap-1"
      >
        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            aria-label="Go to first page"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((page, index) => {
            if (typeof page === "string") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 dark:text-zinc-600 select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold text-xs transition ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {showFirstLast && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Go to last page"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </nav>
    </div>
  );
};
