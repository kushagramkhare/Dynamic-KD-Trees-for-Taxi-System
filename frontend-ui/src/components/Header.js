import React from 'react';

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">KDRide</h1>
        <a
          href="https://github.com/kushagramkhare/Dynamic-KD-Trees-for-Taxi-System"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors text-lg"
        >
          <img src="/image.png" alt="GitHub" className="w-6 h-6" />
          <span className="font-medium">Project Github</span>
        </a>
      </div>
    </header>
  );
}