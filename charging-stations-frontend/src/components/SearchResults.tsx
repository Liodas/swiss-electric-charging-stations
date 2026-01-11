import { Station } from '@/types/station';
import { t } from '@/lib/i18n';

interface SearchResultsProps {
  activePostalCode: string;
  isLoadingPostalCode: boolean;
  postalCodeError: string | null;
  postalCodeStations: Station[];
  zoomToStation: (stationId: string) => void;
}

export default function SearchResultsResults({
  activePostalCode,
  isLoadingPostalCode,
  postalCodeError,
  postalCodeStations,
  zoomToStation
}: SearchResultsProps) {
  if (!activePostalCode) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t('search-results-title', { count: parseInt(activePostalCode) })}
      </h3>
      
      {isLoadingPostalCode && (
        <div className="flex items-center space-x-2 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">{t('search-results-loading')}</span>
        </div>
      )}
      
      {!isLoadingPostalCode && !postalCodeError && postalCodeStations.length === 0 && (
        <div className="text-gray-500 py-4">
          {t('search-results-empty')}
        </div>
      )}
      
      {!isLoadingPostalCode && !postalCodeError && postalCodeStations.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            {t('search-results-count-message', { count: postalCodeStations.length })}
          </div>
          
          <div className="grid gap-3">
            {postalCodeStations.map((station) => (
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
        </div>
      )}
    </div>
  );
}