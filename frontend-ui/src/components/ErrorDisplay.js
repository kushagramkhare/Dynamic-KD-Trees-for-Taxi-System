import React from 'react';

export function ErrorDisplay({ result, bookResult, rideResult }) {
  const error = result?.error || bookResult?.error || rideResult?.error;
  
  if (!error) {
    return null;
  }

  return (
    <div className="mt-6 p-6 rounded-lg bg-red-50 border border-red-200">
      <h3 className="font-semibold mb-2 text-red-900 text-lg">Error</h3>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  );
}