import React from 'react';

export function RideResult({ rideResult, onBookAnother }) {
  if (!rideResult || rideResult.error) {
    return null;
  }

  return (
    <div className="mt-6 p-6 rounded-lg bg-green-50 border-2 border-green-300 shadow-lg">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-3">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <h3 className="font-bold text-2xl text-green-900 mb-1">
          Destination Reached!
        </h3>
        <p className="text-green-700 font-medium text-lg">
          You have arrived safely at your destination
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Trip Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Route:</span>
            <span className="text-gray-900 font-medium">
              ({rideResult.movedFrom.x}, {rideResult.movedFrom.y}) → ({rideResult.movedTo.x}, {rideResult.movedTo.y})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Distance:</span>
            <span className="text-gray-900 font-medium">{rideResult.distance} units</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Duration:</span>
            <span className="text-gray-900 font-medium">{rideResult.time.toFixed(2)} minutes</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Dynamic KD-Tree: Height={rideResult.treeHeight}, Size={rideResult.treeSize} nodes
          </p>
        </div>
      </div>

      <button
        onClick={onBookAnother}
        className="w-full py-3 px-6 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-700"
      >
        Book Another Ride
      </button>
    </div>
  );
}