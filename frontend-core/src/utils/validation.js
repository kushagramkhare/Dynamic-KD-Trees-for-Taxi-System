/**
 * Validation utilities for taxi booking system
 */

export class ValidationUtils {
  /**
   * Validate coordinate input
   */
  static isValidCoordinate(value) {
    if (!value && value !== 0) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  /**
   * Validate pickup and dropoff coordinates
   */
  static validateCoordinates(pickup, dropoff) {
    const errors = [];

    if (!this.isValidCoordinate(pickup.x)) {
      errors.push('Pickup X coordinate is invalid');
    }
    if (!this.isValidCoordinate(pickup.y)) {
      errors.push('Pickup Y coordinate is invalid');
    }
    if (!this.isValidCoordinate(dropoff.x)) {
      errors.push('Dropoff X coordinate is invalid');
    }
    if (!this.isValidCoordinate(dropoff.y)) {
      errors.push('Dropoff Y coordinate is invalid');
    }

    // Check if pickup and dropoff are the same
    if (pickup.x === dropoff.x && pickup.y === dropoff.y) {
      errors.push('Pickup and dropoff locations cannot be the same');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format coordinate for display
   */
  static formatCoordinate(x, y, precision = 2) {
    return `(${parseFloat(x).toFixed(precision)}, ${parseFloat(y).toFixed(precision)})`;
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance, unit = 'units') {
    return `${parseFloat(distance).toFixed(2)} ${unit}`;
  }

  /**
   * Format time for display
   */
  static formatTime(minutes) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    
    if (mins === 0) {
      return `${secs} seconds`;
    } else if (secs === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    } else {
      return `${mins}m ${secs}s`;
    }
  }
}