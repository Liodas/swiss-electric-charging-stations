import React from 'react';
import { t } from '@/lib/i18n';

interface SearchBarProps {
  postalCode: string;
  error: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export default function SearchBar({
  postalCode,
  error,
  onInputChange,
  onSubmit,
  onClear
}: SearchBarProps) {
  return (
    <div className="text-center mb-8">
      <form onSubmit={onSubmit} className="mt-8 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="flex rounded-lg shadow-sm relative">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={postalCode}
                onChange={onInputChange}
                placeholder={t('search-bar-placeholder')}
                maxLength={4}
                className="w-full px-4 py-3 pr-10 rounded-l-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 transition-colors duration-200"
              />
              {postalCode && (
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  aria-label="Clear"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t('search-bar-search')}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
}