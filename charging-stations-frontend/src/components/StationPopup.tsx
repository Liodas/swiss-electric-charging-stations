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
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 z-20 w-72 max-w-[85vw]" 
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 300),
        top: Math.max(position.y - 10, 10),
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto'
      }}
    >
      <div className="p-3 relative">
        <div className="flex justify-between items-center mb-2">
          {station ? (
            <p className="text-gray-900 font-medium text-sm pr-2">{station.name}</p>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
            aria-label="Close popup"
          >
            ×
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 text-sm">{t('website-loading')}</span>
          </div>
        ) : station ? (
          <div className="space-y-2">
            <div>
              <p className="text-gray-600 text-sm">{station.address}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-gray-500 text-sm">
            {t('map-station-popup-error')}
          </div>
        )}
        
        {/* 24/7 Badge in bottom right corner */}
        {station && station.isOpen24Hours && (
          <div className="absolute bottom-1 right-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-green-500 text-white">
              24/7
            </span>
          </div>
        )}
      </div>
    </div>
  );
}