import React from 'react';

export function TaxiResult({ result, stage, onBookTaxi, booking }) {
  if (!result || result.error || !result.nearestTaxi) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Show all 5 nearest taxis */}
      {result.nearestTaxis && result.nearestTaxis.length > 0 && (
        <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
          <h3 className="font-bold mb-4 text-gray-900 text-lg">
            5 Nearest Taxis Found
          </h3>
          <div className="space-y-3">
            {result.nearestTaxis.map((taxi, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-green-50 border-2 border-green-300' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      index === 0 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      #{taxi.rank}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      Taxi at ({taxi.location.x}, {taxi.location.y})
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">
                      SHORTEST PATH
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Direct:</span> {taxi.euclideanDistance.toFixed(2)} units
                  </div>
                  <div>
                    <span className="font-medium">Road:</span> {taxi.graphDistance.toFixed(2)} units
                  </div>
                  <div>
                    <span className="font-medium">ETA:</span> {taxi.estimatedTime.toFixed(2)} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected taxi (shortest path) */}
      <div className="p-6 rounded-lg bg-green-50 border-2 border-green-400">
        <h3 className="font-bold mb-4 text-green-900 text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Selected Taxi (Shortest Path)
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Taxi at ({result.nearestTaxi.location.x}, {result.nearestTaxi.location.y})
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available
            </span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Direct Distance: {result.nearestTaxi.euclideanDistance.toFixed(2)} units</p>
            <p>Road Distance: {result.nearestTaxi.graphDistance.toFixed(2)} units</p>
            <p className="font-medium text-gray-900">
              ETA: {result.nearestTaxi.estimatedTime.toFixed(2)} minutes
            </p>
          </div>
        </div>

        {stage === 'search' && (
          <button
            onClick={onBookTaxi}
            disabled={booking}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
              booking
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {booking ? 'Booking...' : 'Book This Taxi'}
          </button>
        )}
      </div>
    </div>
  );
}