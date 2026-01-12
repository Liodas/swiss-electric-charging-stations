import React, { useState, lazy, Suspense } from 'react';
import { Station, PaginatedResult } from '@/types/station';
import { apiClient } from '@/lib/api-client';
import SearchResults from '@/components/SearchResults';
import SearchBar from '@/components/SearchBar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { t } from '@/lib/i18n';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useTheme } from '@/lib/theme';

const ChargingStationsMap = lazy(() => import('@/components/ChargingStationsMap'));

function App() {
  const { theme } = useTheme();
  useDocumentTitle();
  const [postalCode, setPostalCode] = useState('');
  const [activePostalCode, setActivePostalCode] = useState('');
  const [error, setError] = useState('');
  
  const [paginationData, setPaginationData] = useState<PaginatedResult<Station> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<{ zoomToStation: (stationId: string) => void } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Swiss postal code (4 digits)
    const trimmed = postalCode.trim();
    if (!/^\d{4}$/.test(trimmed)) {
      setError('Please enter a valid Swiss postal code (4 digits)');
      return;
    }
    
    setError('');
    setActivePostalCode(trimmed);
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and max 4 characters
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setPostalCode(value);
      setError('');
    }
  };

  // Fetch stations by postal code
  React.useEffect(() => {
    if (!activePostalCode) {
      setPaginationData(null);
      return;
    }

    const fetchStationsByPostalCode = async () => {
      try {
        setIsLoadingPostalCode(true);
        setPostalCodeError(null);
        
        const response = await apiClient.getStationsByPostalCode(activePostalCode, currentPage, 9);
        setPaginationData(response);
      } catch (err) {
        setPostalCodeError('Failed to load stations for postal code');
        console.error('Error fetching stations by postal code:', err);
        setPaginationData(null);
      } finally {
        setIsLoadingPostalCode(false);
      }
    };

    fetchStationsByPostalCode();
  }, [activePostalCode, currentPage]);

  const zoomToStation = (stationId: string) => {
    if (mapRef) {
      mapRef.zoomToStation(stationId);
    }
  };

  const handlePageChange = (newPage: number) => {    setCurrentPage(newPage);  };  const handleClear = () => {
    setActivePostalCode('');
    setPostalCode('');
    setError('');
    setPaginationData(null);
    setCurrentPage(1);
    setPostalCodeError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {t('webpage-title')}
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <Suspense fallback={
            <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-colors duration-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-300">{t('website-loading')}</span>
              </div>
            </div>
          }>
            <ChargingStationsMap postalCode={activePostalCode} onMapRef={setMapRef} />
          </Suspense>
        </div>

        <SearchBar
          postalCode={postalCode}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleSearch}
          onClear={handleClear}
        />

        <SearchResults
          activePostalCode={activePostalCode}
          isLoadingPostalCode={isLoadingPostalCode}
          postalCodeError={postalCodeError}
          paginationData={paginationData}
          onPageChange={handlePageChange}
          zoomToStation={zoomToStation}
        />
      </main>
    </div>
  );
}

export default App;
