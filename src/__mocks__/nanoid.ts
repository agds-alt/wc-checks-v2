/**
 * Mock for nanoid package
 * Used to avoid ES module import issues in Jest
 */

export const nanoid = (length: number = 21): string => {
  return 'x'.repeat(length);
};

export default nanoid;
