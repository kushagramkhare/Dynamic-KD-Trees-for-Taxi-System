import React from 'react';

export function CoordinateInput({ 
  label, 
  icon, 
  coordinates, 
  onChange, 
  xPlaceholder = "X coordinate", 
  yPlaceholder = "Y coordinate" 
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        {icon}
      </div>
      <div className="flex gap-2 bg-gray-100 rounded-lg p-4 pl-12">
        <input
          type="number"
          step="any"
          placeholder={xPlaceholder}
          value={coordinates.x}
          onChange={(e) => onChange({ ...coordinates, x: e.target.value })}
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
        />
        <span className="text-gray-400">,</span>
        <input
          type="number"
          step="any"
          placeholder={yPlaceholder}
          value={coordinates.y}
          onChange={(e) => onChange({ ...coordinates, y: e.target.value })}
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
        />
      </div>
    </div>
  );
}