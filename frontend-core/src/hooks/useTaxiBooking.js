import { useState } from 'react';
import { TaxiService } from '../api/taxiService.js';

/**
 * Custom hook for managing taxi booking state and operations
 */
export function useTaxiBooking() {
  const [pickup, setPickup] = useState({ x: '', y: '' });
  const [dropoff, setDropoff] = useState({ x: '', y: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookResult, setBookResult] = useState(null);
  const [riding, setRiding] = useState(false);
  const [rideResult, setRideResult] = useState(null);
  const [stage, setStage] = useState('search'); // search, booked, riding, completed

  const isFormValid = pickup.x && pickup.y && dropoff.x && dropoff.y;

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setBookResult(null);
    setRideResult(null);
    setStage('search');

    try {
      const data = await TaxiService.findNearestTaxi(pickup, dropoff);
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBookTaxi = async () => {
    if (!result?.nearestTaxi) return;

    setBooking(true);
    setBookResult(null);

    try {
      const data = await TaxiService.bookTaxi(pickup, result.nearestTaxi.location);
      setBookResult(data);
      if (data.success) {
        setStage('booked');
      }
    } catch (error) {
      setBookResult({ error: error.message });
    } finally {
      setBooking(false);
    }
  };

  const handleStartRide = async () => {
    if (!bookResult?.movedTo) return;

    setRiding(true);
    setRideResult(null);

    try {
      const data = await TaxiService.startRide(dropoff, bookResult.movedTo);
      setRideResult(data);
      if (data.success) {
        setStage('completed');
      }
    } catch (error) {
      setRideResult({ error: error.message });
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
    // State
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
    
    // Actions
    setPickup,
    setDropoff,
    handleSubmit,
    handleBookTaxi,
    handleStartRide,
    handleBookAnother
  };
}