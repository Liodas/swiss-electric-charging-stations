import { useState, lazy, Suspense } from 'react';

const ChargingStationsMap = lazy(() => import('@/components/ChargingStationsMap'));

function App() {
  const [postalCode, setPostalCode] = useState('');
  const [activePostalCode, setActivePostalCode] = useState('');
  const [error, setError] = useState('');

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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and max 4 characters
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setPostalCode(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Swiss EV Charging Stations
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Suspense fallback={
            <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading map...</span>
              </div>
            </div>
          }>
            <ChargingStationsMap postalCode={activePostalCode} />
          </Suspense>
        </div>

        <div className="text-center mb-8">

          {/* Search Section */}
          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
            <div className="space-y-2">
              <div className="flex rounded-lg shadow-sm relative">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter postal code (e.g., 3011)"
                    maxLength={4}
                    className="w-full px-4 py-3 pr-10 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                  />
                  {postalCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePostalCode('');
                        setPostalCode('');
                        setError('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                  Search
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
