import React from 'react';

export function TaxiGraph({ result, pickup, dropoff }) {
  if (!result || result.error || !result.nearestTaxis) {
    return (
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-12 min-h-96 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-2xl font-bold text-gray-900">Ready to go</p>
          <p className="text-gray-600 mt-2">Enter coordinates to see taxi locations</p>
        </div>
      </div>
    );
  }

  // Calculate bounds for the graph including road network
  const allPoints = [
    { x: parseFloat(pickup.x), y: parseFloat(pickup.y), type: 'pickup' },
    { x: parseFloat(dropoff.x), y: parseFloat(dropoff.y), type: 'dropoff' },
    ...result.nearestTaxis.map(taxi => ({ 
      x: taxi.location.x, 
      y: taxi.location.y, 
      type: 'taxi',
      rank: taxi.rank,
      distance: taxi.euclideanDistance
    }))
  ];

  // Add road network points to bounds if available
  if (result.roadNetwork) {
    result.roadNetwork.forEach(edge => {
      allPoints.push({ x: edge.from.x, y: edge.from.y, type: 'road' });
      allPoints.push({ x: edge.to.x, y: edge.to.y, type: 'road' });
    });
  }

  const xValues = allPoints.map(p => p.x);
  const yValues = allPoints.map(p => p.y);
  const minX = Math.min(...xValues) - 5;
  const maxX = Math.max(...xValues) + 5;
  const minY = Math.min(...yValues) - 5;
  const maxY = Math.max(...yValues) + 5;

  console.log('Road network edges:', result.roadNetwork ? result.roadNetwork.length : 0);
  console.log('Sample road edge:', result.roadNetwork ? result.roadNetwork[0] : 'none');
  console.log('Bounds:', { minX, maxX, minY, maxY });

  const graphWidth = 600;
  const graphHeight = 600;
  const padding = 50;

  // Convert coordinates to SVG coordinates
  const toSVG = (x, y) => {
    const svgX = padding + ((x - minX) / (maxX - minX)) * (graphWidth - 2 * padding);
    const svgY = graphHeight - padding - ((y - minY) / (maxY - minY)) * (graphHeight - 2 * padding);
    return { x: svgX, y: svgY };
  };

  const pickupSVG = toSVG(parseFloat(pickup.x), parseFloat(pickup.y));
  const dropoffSVG = toSVG(parseFloat(dropoff.x), parseFloat(dropoff.y));

  // Colors for different taxi ranks
  const taxiColors = [
    '#10B981', // Green for rank 1 (shortest)
    '#3B82F6', // Blue for rank 2
    '#8B5CF6', // Purple for rank 3
    '#F59E0B', // Orange for rank 4
    '#EF4444'  // Red for rank 5
  ];

  return (
    <div className="bg-white rounded-3xl p-6 min-h-96 border-2 border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Road Network & Shortest Paths</h3>
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Gray: Road Network ({result.roadNetwork ? result.roadNetwork.length : 0} edges)</span>
          {' • '}
          <span className="text-green-600 font-medium">Colored: Shortest Paths</span>
        </p>
      </div>

      <div className="flex justify-center">
        <svg width={graphWidth} height={graphHeight} className="border border-gray-300 rounded-lg bg-gray-50 transition-all duration-500">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Road Network - Complete random graph */}
          {result.roadNetwork && result.roadNetwork.length > 0 && (
            <g id="road-network">
              {result.roadNetwork.map((edge, index) => {
                const fromPoint = toSVG(edge.from.x, edge.from.y);
                const toPoint = toSVG(edge.to.x, edge.to.y);
                
                return (
                  <line
                    key={`road-${index}`}
                    x1={fromPoint.x}
                    y1={fromPoint.y}
                    x2={toPoint.x}
                    y2={toPoint.y}
                    stroke="#D1D5DB"
                    strokeWidth="1"
                    opacity="0.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          )}

          {/* Shortest paths from taxis to pickup - drawn on top of road network */}
          {result.nearestTaxis.map((taxi, index) => {
            const color = taxiColors[index];
            const strokeWidth = index === 0 ? 4 : 2.5; // Thicker line for shortest path
            const opacity = index === 0 ? 1 : 0.8;

            // Convert path coordinates to SVG coordinates
            const pathSVG = taxi.path ? taxi.path.map(point => toSVG(point.x, point.y)) : [];
            
            if (pathSVG.length < 2) return null;

            // Create path string for SVG
            let pathString = `M ${pathSVG[0].x} ${pathSVG[0].y}`;
            for (let i = 1; i < pathSVG.length; i++) {
              pathString += ` L ${pathSVG[i].x} ${pathSVG[i].y}`;
            }

            return (
              <g key={`path-${index}`}>
                {/* White outline for better visibility */}
                <path
                  d={pathString}
                  stroke="white"
                  strokeWidth={strokeWidth + 2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
                
                {/* Shortest path */}
                <path
                  d={pathString}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={index === 0 ? "none" : "5,5"}
                  opacity={opacity}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {index !== 0 && (
                    <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" repeatCount="indefinite" />
                  )}
                </path>
                
                {/* Path nodes (small dots) for shortest path */}
                {index === 0 && pathSVG.map((point, i) => (
                  <circle
                    key={`node-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill={color}
                    opacity="0.7"
                    stroke="white"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Distance label at midpoint with background */}
                <g>
                  <rect
                    x={pathSVG[Math.floor(pathSVG.length / 2)].x - 20}
                    y={pathSVG[Math.floor(pathSVG.length / 2)].y - 18}
                    width="40"
                    height="16"
                    fill="white"
                    opacity="0.9"
                    rx="3"
                  />
                  <text
                    x={pathSVG[Math.floor(pathSVG.length / 2)].x}
                    y={pathSVG[Math.floor(pathSVG.length / 2)].y - 8}
                    fill={color}
                    fontSize="10"
                    fontWeight={index === 0 ? "bold" : "normal"}
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {taxi.graphDistance}u
                  </text>
                </g>
              </g>
            );
          })}

          {/* Pickup location */}
          <g>
            <circle
              cx={pickupSVG.x}
              cy={pickupSVG.y}
              r="8"
              fill="#10B981"
              stroke="#065F46"
              strokeWidth="2"
            />
            <text
              x={pickupSVG.x}
              y={pickupSVG.y - 15}
              fill="#065F46"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              Pickup
            </text>
            <text
              x={pickupSVG.x}
              y={pickupSVG.y + 25}
              fill="#065F46"
              fontSize="10"
              textAnchor="middle"
            >
              ({pickup.x}, {pickup.y})
            </text>
          </g>

          {/* Dropoff location */}
          <g>
            <rect
              x={dropoffSVG.x - 8}
              y={dropoffSVG.y - 8}
              width="16"
              height="16"
              fill="#DC2626"
              stroke="#7F1D1D"
              strokeWidth="2"
              rx="2"
            />
            <text
              x={dropoffSVG.x}
              y={dropoffSVG.y - 15}
              fill="#7F1D1D"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              Dropoff
            </text>
            <text
              x={dropoffSVG.x}
              y={dropoffSVG.y + 25}
              fill="#7F1D1D"
              fontSize="10"
              textAnchor="middle"
            >
              ({dropoff.x}, {dropoff.y})
            </text>
          </g>

          {/* Taxis */}
          {result.nearestTaxis.map((taxi, index) => {
            const taxiSVG = toSVG(taxi.location.x, taxi.location.y);
            const color = taxiColors[index];
            const size = index === 0 ? 10 : 8; // Larger for shortest path

            return (
              <g key={`taxi-${index}`}>
                {/* Taxi icon */}
                <circle
                  cx={taxiSVG.x}
                  cy={taxiSVG.y}
                  r={size}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                >
                  {index === 0 && (
                    <animate attributeName="r" values={`${size};${size + 3};${size}`} dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>
                {/* Rank number */}
                <text
                  x={taxiSVG.x}
                  y={taxiSVG.y + 3}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {taxi.rank}
                </text>
                {/* Coordinates */}
                <text
                  x={taxiSVG.x}
                  y={taxiSVG.y - size - 5}
                  fill={color}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ({taxi.location.x}, {taxi.location.y})
                </text>
                {/* ETA */}
                <text
                  x={taxiSVG.x}
                  y={taxiSVG.y + size + 15}
                  fill={color}
                  fontSize="8"
                  textAnchor="middle"
                >
                  {taxi.estimatedTime.toFixed(1)}min
                </text>
              </g>
            );
          })}

          {/* Axes labels */}
          <text x={graphWidth / 2} y={graphHeight - 10} textAnchor="middle" fontSize="12" fill="#6B7280">
            X Coordinate
          </text>
          <text x={15} y={graphHeight / 2} textAnchor="middle" fontSize="12" fill="#6B7280" transform={`rotate(-90, 15, ${graphHeight / 2})`}>
            Y Coordinate
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-gray-300"></div>
            <span className="text-gray-600">Road Network</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-green-600 rounded"></div>
            <span className="text-gray-600">Shortest Path</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-blue-600" style={{borderTop: '2px dashed'}}></div>
            <span className="text-gray-600">Other Paths</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {result.nearestTaxis.map((taxi, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: taxiColors[index] }}
              ></div>
              <span className={`${index === 0 ? 'font-bold' : ''}`}>
                #{taxi.rank} {index === 0 ? '★' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-gray-700">Shortest Distance:</span>
            <span className="ml-1 text-green-600 font-bold">
              {result.nearestTaxis[0]?.euclideanDistance.toFixed(2)} units
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Fastest ETA:</span>
            <span className="ml-1 text-green-600 font-bold">
              {result.nearestTaxis[0]?.estimatedTime.toFixed(2)} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}