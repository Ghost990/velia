// Legacy Snap Camera Kit service - DEPRECATED
// This file is kept for backward compatibility only
// All functionality has been migrated to 8th Wall WebAR SDK

console.warn('snapKit.js is deprecated. Please use eighthWall.js instead.');

// Placeholder functions to prevent import errors
export const initializeSnapKit = async () => {
  console.warn('initializeSnapKit is deprecated. Use initializeEighthWall instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export const loadLens = async (lensId) => {
  console.warn('loadLens is deprecated. Use applyWeddingFilter instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export const removeLens = async () => {
  console.warn('removeLens is deprecated. Use removeWeddingFilter instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export const capturePhoto = async () => {
  console.warn('capturePhoto is deprecated. Use EighthWallCamera.capturePhoto instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export const startCamera = async () => {
  console.warn('startCamera is deprecated. Use EighthWallCamera component instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export const stopCamera = async () => {
  console.warn('stopCamera is deprecated. Use EighthWallCamera component instead.');
  throw new Error('Snap Camera Kit has been replaced with 8th Wall WebAR SDK');
};

export default {
  initializeSnapKit,
  loadLens,
  removeLens,
  capturePhoto,
  startCamera,
  stopCamera
};