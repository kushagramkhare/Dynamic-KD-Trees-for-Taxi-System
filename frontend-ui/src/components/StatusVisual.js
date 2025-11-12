import React from 'react';

export function StatusVisual({ stage }) {
  const getVisualContent = () => {
    switch (stage) {
      case 'search':
        return (
          <>
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-2xl font-bold text-gray-900">Ready to go</p>
            <p className="text-gray-600 mt-2">Enter coordinates to find nearest taxi</p>
          </>
        );
      case 'booked':
        return (
          <>
            <svg className="w-20 h-20 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-2xl font-bold text-gray-900">Taxi Booked</p>
            <p className="text-gray-600 mt-2">Ready when you are</p>
          </>
        );
      case 'completed':
        return (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-4">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">Destination Reached!</p>
            <p className="text-gray-600 mt-2 text-lg">Thanks for riding with us!</p>
            <p className="text-gray-500 mt-4 text-sm">Ready to book another ride?</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="hidden md:block">
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-12 min-h-96 flex items-center justify-center">
        <div className="text-center">
          {getVisualContent()}
        </div>
      </div>
    </div>
  );
}