/**
 * Taxi Service API Layer
 * Handles all backend communication for taxi operations
 */

const API_BASE_URL = 'http://localhost:8000/api';

export class TaxiService {
  /**
   * Find nearest taxi for given pickup and dropoff coordinates
   */
  static async findNearestTaxi(pickup, dropoff) {
    try {
      const response = await fetch(`${API_BASE_URL}/route`, {
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

      return await response.json();
    } catch (error) {
      console.error('Error finding nearest taxi:', error);
      throw new Error('Failed to connect to backend');
    }
  }

  /**
   * Book a taxi at the specified location
   */
  static async bookTaxi(pickup, taxiLocation) {
    try {
      const response = await fetch(`${API_BASE_URL}/book-taxi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: { x: parseFloat(pickup.x), y: parseFloat(pickup.y) },
          taxi: { x: taxiLocation.x, y: taxiLocation.y }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error booking taxi:', error);
      throw new Error('Failed to book taxi');
    }
  }

  /**
   * Start ride to destination
   */
  static async startRide(dropoff, taxiLocation) {
    try {
      const response = await fetch(`${API_BASE_URL}/start-ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dropoff: { x: parseFloat(dropoff.x), y: parseFloat(dropoff.y) },
          taxi: { x: taxiLocation.x, y: taxiLocation.y }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting ride:', error);
      throw new Error('Failed to start ride');
    }
  }
}