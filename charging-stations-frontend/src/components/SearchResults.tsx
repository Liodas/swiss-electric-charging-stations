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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t('search-results-title', parseInt(activePostalCode))}
      </h3>
      
      {isLoadingPostalCode && (
        <div className="flex items-center space-x-2 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">{t('search-results-loading')}</span>
        </div>
      )}
      
      {postalCodeError && (
        <div className="text-red-500 py-4">
          {postalCodeError}
        </div>
      )}
      
      {isEmpty && (
        <div className="text-gray-500 py-4">
          {t('search-results-empty')}
        </div>
      )}
      
      {hasStations && paginationData && (
        <div className="space-y-3">
          {/* Pagination Info */}
          <div className="text-sm text-gray-600 mb-3 flex justify-between items-center">
            <span>
              {t('search-results-pagination-info',
                ((paginationData.page - 1) * paginationData.pageSize) + 1,
                Math.min(paginationData.page * paginationData.pageSize, paginationData.totalCount),
                paginationData.totalCount
              )}
            </span>
            <span className="text-xs text-gray-500">
              {t('search-results-pagination-page', 
                paginationData.page,
                paginationData.totalPages 
              )}
            </span>
          </div>
          
          {/* Stations Grid */}
          <div className="grid gap-3">
            {stations.map((station) => (
              <div 
                key={station.id}
                onClick={() => zoomToStation(station.id)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {station.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {station.address}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4 border-t border-gray-200">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(paginationData.page - 1)}
                disabled={!paginationData.hasPreviousPage}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  paginationData.hasPreviousPage
                    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
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
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
                    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
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