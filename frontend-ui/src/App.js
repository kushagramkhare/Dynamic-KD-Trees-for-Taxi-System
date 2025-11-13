import React from 'react';
import { Header } from './components/Header';
import { CoordinateInput } from './components/CoordinateInput';
import { TaxiResult } from './components/TaxiResult';
import { BookingResult } from './components/BookingResult';
import { RideResult } from './components/RideResult';
import { TaxiGraph } from './components/TaxiGraph';
import { ErrorDisplay } from './components/ErrorDisplay';

// Temporary inline hook for testing
import { useState } from 'react';

function useTaxiBooking() {
  const [pickup, setPickup] = useState({ x: '', y: '' });
  const [dropoff, setDropoff] = useState({ x: '', y: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookResult, setBookResult] = useState(null);
  const [riding, setRiding] = useState(false);
  const [rideResult, setRideResult] = useState(null);
  const [stage, setStage] = useState('search');

  const isFormValid = pickup.x && pickup.y && dropoff.x && dropoff.y;

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setBookResult(null);
    setRideResult(null);
    setStage('search');

    try {
      const response = await fetch('http://localhost:8002/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: { x: parseFloat(pickup.x), y: parseFloat(pickup.y) },
          dropoff: { x: parseFloat(dropoff.x), y: parseFloat(dropoff.y) }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data); // Debug log
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: `Failed to connect to backend: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBookTaxi = async () => {
    if (!result?.nearestTaxi) return;

    setBooking(true);
    setBookResult(null);

    try {
      const response = await fetch('http://localhost:8002/api/book-taxi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: { x: parseFloat(pickup.x), y: parseFloat(pickup.y) },
          taxi: { x: result.nearestTaxi.location.x, y: result.nearestTaxi.location.y }
        })
      });

      const data = await response.json();
      setBookResult(data);
      if (data.success) {
        setStage('booked');
      }
    } catch (error) {
      console.error('Error:', error);
      setBookResult({ error: 'Failed to book taxi' });
    } finally {
      setBooking(false);
    }
  };

  const handleStartRide = async () => {
    if (!bookResult?.movedTo) return;

    setRiding(true);
    setRideResult(null);

    try {
      const response = await fetch('http://localhost:8002/api/start-ride', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dropoff: { x: parseFloat(dropoff.x), y: parseFloat(dropoff.y) },
          taxi: { x: bookResult.movedTo.x, y: bookResult.movedTo.y }
        })
      });

      const data = await response.json();
      setRideResult(data);
      if (data.success) {
        setStage('completed');
      }
    } catch (error) {
      console.error('Error:', error);
      setRideResult({ error: 'Failed to start ride' });
    } finally {
      setRiding(false);
    }
  };

  const handleBookAnother = () => {
    setPickup({ x: '', y: '' });
    setDropoff({ x: '', y: '' });
    setResult(null);
    setBookResult(null);
    setRideResult(null);
    setStage('search');
  };

  return {
    pickup,
    dropoff,
    loading,
    result,
    booking,
    bookResult,
    riding,
    rideResult,
    stage,
    isFormValid,
    setPickup,
    setDropoff,
    handleSubmit,
    handleBookTaxi,
    handleStartRide,
    handleBookAnother
  };
}

export default function KDRideCoordinateApp() {
  // React Hooks must be called at the top level
  const {
    pickup,
    dropoff,
    loading,
    result,
    booking,
    bookResult,
    riding,
    rideResult,
    stage,
    isFormValid,
    setPickup,
    setDropoff,
    handleSubmit,
    handleBookTaxi,
    handleStartRide,
    handleBookAnother
  } = useTaxiBooking();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Request a ride now
            </h2>

            <div className="mb-6 flex items-start gap-2">
              <span className="text-green-600 text-xl"></span>
              <div>
                <p className="text-gray-900 font-medium">Dynamic KD-Tree powered taxi matching</p>
                <p className="text-gray-600 text-sm">Efficient spatial search with real-time updates</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <CoordinateInput
                label="Pickup"
                icon={<div className="w-3 h-3 bg-gray-900 rounded-full"></div>}
                coordinates={pickup}
                onChange={setPickup}
                xPlaceholder="Pickup X"
                yPlaceholder="Pickup Y"
              />

              <CoordinateInput
                label="Dropoff"
                icon={<div className="w-3 h-3 bg-gray-900 rounded-sm"></div>}
                coordinates={dropoff}
                onChange={setDropoff}
                xPlaceholder="Dropoff X"
                yPlaceholder="Dropoff Y"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                isFormValid && !loading
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Finding nearest taxi...' : 'Find Taxi'}
            </button>

            <TaxiResult
              result={result}
              stage={stage}
              onBookTaxi={handleBookTaxi}
              booking={booking}
            />

            <BookingResult
              bookResult={bookResult}
              stage={stage}
              onStartRide={handleStartRide}
              riding={riding}
            />

            <RideResult
              rideResult={rideResult}
              onBookAnother={handleBookAnother}
            />

            <ErrorDisplay
              result={result}
              bookResult={bookResult}
              rideResult={rideResult}
            />
          </div>

          {/* Right Side - Taxi Graph */}
          <TaxiGraph result={result} pickup={pickup} dropoff={dropoff} />
        </div>
      </div>
    </div>
  );
}