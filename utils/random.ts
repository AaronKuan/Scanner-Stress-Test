/**
 * Generates a random integer between min and max (inclusive)
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * pads a number with leading zeros to ensure 4 digits
 */
export const formatPickupNumber = (num: number): string => {
  return num.toString().padStart(4, '0');
};

/**
 * Calculates a delay based on the simulation rules.
 * Standard: 30s - 50s
 * Exception (3% chance): 120s
 */
export const calculateProcessDelay = (): number => {
  const isException = Math.random() < 0.03;
  if (isException) {
    return 120 * 1000; // 120 seconds
  }
  return getRandomInt(30, 50) * 1000; // 30s to 50s in ms
};