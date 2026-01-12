import { Station } from '@/types/station';
import { t } from '@/lib/i18n';

interface StationPopupProps {
  isOpen: boolean;
  isLoading: boolean;
  station: Station | null;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function StationPopup({ 
  isOpen, 
  isLoading, 
  station, 
  position, 
  onClose 
}: StationPopupProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 w-72 max-w-[85vw] transition-colors duration-200" 
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 300),
        top: Math.max(position.y - 10, 10),
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto'
      }}
    >
      <div className="p-2 relative">
        <div className="flex justify-between items-start mb-1">
          {station ? (
            <p className="text-gray-900 dark:text-gray-100 font-medium text-sm pr-2 leading-tight">{station.name}</p>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none flex-shrink-0 -mt-1 transition-colors duration-200"
            aria-label="Close popup"
          >
            ×
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">{t('website-loading')}</span>
          </div>
        ) : station ? (
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-tight flex-1">{station.address}</p>
              {station.isOpen24Hours && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-green-500 text-white ml-2 flex-shrink-0">
                  24/7
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
            {t('map-station-popup-error')}
          </div>
        )}
      </div>
    </div>
  );
}