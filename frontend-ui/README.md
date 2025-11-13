# Frontend UI

User interface components for the taxi booking system.

## Overview

This package contains all UI components and styling, consuming business logic from `frontend-core`:

- **React Components**: Modular UI components
- **Styling**: Tailwind CSS for responsive design
- **User Experience**: Interactive taxi booking interface
- **Visual Feedback**: Status indicators and animations

## Structure

```
src/
├── components/
│   ├── Header.js           # Navigation header
│   ├── CoordinateInput.js  # Coordinate input fields
│   ├── TaxiResult.js       # Taxi search results
│   ├── BookingResult.js    # Booking confirmation
│   ├── RideResult.js       # Trip completion
│   ├── StatusVisual.js     # Visual status indicators
│   └── ErrorDisplay.js     # Error handling UI
├── App.js                  # Main application component
├── index.js               # React app entry point
└── index.css              # Tailwind CSS imports
```

## Key Features

- Responsive design with Tailwind CSS
- Real-time status updates
- Interactive coordinate input
- Visual feedback for all booking stages
- Error handling and user notifications

## Dependencies

- React 19.2.0
- Tailwind CSS 3.4.18
- Lucide React (icons)
- frontend-core (business logic)

## Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```