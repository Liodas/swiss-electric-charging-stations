import { useState, lazy, Suspense } from 'react';

const ChargingStationsMap = lazy(() => import('@/components/ChargingStationsMap'));

function App() {

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
      </main>
    </div>
  );
}

export default App;
