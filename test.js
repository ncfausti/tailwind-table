export const assertEqual = (actual, expected) => {
  if (actual !== expected) {
    console.error(`Assertion failed: expected ${expected}, but got ${actual}`);
  }
};
