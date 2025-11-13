# Frontend Core

Business logic and API layer for the taxi booking system.

## Overview

This package contains the core functionality separated from the UI components:

- **API Services**: Communication with the backend taxi system
- **Business Logic**: Taxi booking workflow and state management
- **Utilities**: Validation and formatting helpers
- **Custom Hooks**: React hooks for managing taxi booking state

## Structure

```
src/
├── api/
│   └── taxiService.js      # Backend API communication
├── hooks/
│   └── useTaxiBooking.js   # Main booking state hook
├── utils/
│   └── validation.js       # Validation utilities
└── index.js               # Main exports
```

## Key Features

- Dynamic KD-Tree taxi matching
- Real-time taxi booking and tracking
- Coordinate validation and formatting
- Error handling and state management

## Usage

```javascript
import { useTaxiBooking, TaxiService, ValidationUtils } from 'frontend-core';

// Use in React components
const booking = useTaxiBooking();

// Direct API calls
const result = await TaxiService.findNearestTaxi(pickup, dropoff);

// Validation
const isValid = ValidationUtils.validateCoordinates(pickup, dropoff);
```

## Dependencies

- React 19.2.0
- Minimal dependencies for core functionality