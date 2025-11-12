import React from 'react';

export function BookingResult({ bookResult, stage, onStartRide, riding }) {
  if (!bookResult || bookResult.error) {
    return null;
  }

  return (
    <div className="mt-6 p-6 rounded-lg bg-blue-50 border border-blue-200">
      <h3 className="font-bold mb-2 text-blue-900 text-lg flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Taxi Booked!
      </h3>
      <div className="space-y-2 text-sm mb-4">
        <p className="text-blue-700">
          Taxi is moving to your pickup location
        </p>
        <p className="text-gray-700">
          <strong>From:</strong> ({bookResult.movedFrom.x}, {bookResult.movedFrom.y})
          {' → '}
          <strong>To:</strong> ({bookResult.movedTo.x}, {bookResult.movedTo.y})
        </p>
        <p className="text-gray-700">
          <strong>Distance:</strong> {bookResult.distance} units
        </p>
        <p className="text-gray-700">
          <strong>Arrival Time:</strong> {bookResult.time.toFixed(2)} minutes
        </p>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            Tree updated: Height={bookResult.treeHeight}, Size={bookResult.treeSize}
          </p>
        </div>
      </div>

      {stage === 'booked' && (
        <button
          onClick={onStartRide}
          disabled={riding}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
            riding
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {riding ? 'Starting ride...' : 'Start Ride to Destination'}
        </button>
      )}
    </div>
  );
}