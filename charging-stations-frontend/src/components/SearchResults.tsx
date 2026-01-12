import { Station, PaginatedResult } from '@/types/station';
import { t } from '@/lib/i18n';

interface SearchResultsProps {
  activePostalCode: string;
  isLoadingPostalCode: boolean;
  postalCodeError: string | null;
  paginationData: PaginatedResult<Station> | null;
  onPageChange: (page: number) => void;
  zoomToStation: (stationId: string) => void;
}

export default function SearchResultsResults({
  activePostalCode,
  isLoadingPostalCode,
  postalCodeError,
  paginationData,
  onPageChange,
  zoomToStation
}: SearchResultsProps) {
  if (!activePostalCode) {
    return null;
  }

  const stations = paginationData?.items || [];
  const hasStations = !isLoadingPostalCode && !postalCodeError && stations.length > 0;
  const isEmpty = !isLoadingPostalCode && !postalCodeError && stations.length === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-colors duration-200">
      
      {isLoadingPostalCode && (
        <div className="flex items-center space-x-2 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-300">{t('search-results-loading')}</span>
        </div>
      )}
      
      {postalCodeError && (
        <div className="text-red-500 dark:text-red-400 py-4">
          {postalCodeError}
        </div>
      )}
      
      {isEmpty && (
        <div className="text-gray-500 dark:text-gray-400 py-4">
          {t('search-results-empty')}
        </div>
      )}
      
      {hasStations && paginationData && (
        <div className="space-y-3">
          {/* Pagination Info */}
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex justify-between items-center">
            <span>
              {t('search-results-pagination-info',
                ((paginationData.page - 1) * paginationData.pageSize) + 1,
                Math.min(paginationData.page * paginationData.pageSize, paginationData.totalCount),
                paginationData.totalCount
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('search-results-pagination-page', 
                paginationData.page,
                paginationData.totalPages 
              )}
            </span>
          </div>
          
          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((station) => (
              <div 
                key={station.id}
                onClick={() => zoomToStation(station.id)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1 line-clamp-2">
                    {station.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {station.address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(paginationData.page - 1)}
                disabled={!paginationData.hasPreviousPage}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  paginationData.hasPreviousPage
                    ? 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                }`}
              >
                {t('search-results-pagination-previous')}
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                  let pageNum;
                  if (paginationData.totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    const start = Math.max(1, paginationData.page - 2);
                    const end = Math.min(paginationData.totalPages, start + 4);
                    pageNum = start + i;
                    if (pageNum > end) return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === paginationData.page
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700'
                          : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => onPageChange(paginationData.page + 1)}
                disabled={!paginationData.hasNextPage}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  paginationData.hasNextPage
                    ? 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                }`}
              >
                {t('search-results-pagination-next')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}