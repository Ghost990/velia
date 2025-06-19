// Snap Camera Kit integration
let cameraKit;
let session;

export const initializeSnapKit = async () => {
  try {
    // Initialize Camera Kit
    const { CameraKit } = await import('@snap/camera-kit');
    
    cameraKit = await CameraKit.createSession({
      apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzUwMzM2ODg5LCJzdWIiOiIzYWE0MWNhNi0zY2RiLTRkOTktYWY0Zi03YWIwMzBjZjg2MTN-U1RBR0lOR34zOGFhODEwNS02ZjQ3LTRiNDEtOGFjZC1jNmUwZjFmNjljMDcifQ.d5cYqaHIBB4G4PgVIJTW-ST6E5KDEmJ5dA2Fwe2UOFk', // Replace with actual token
      liveRenderTarget: document.getElementById('camera-canvas')
    });
    
    session = cameraKit;
    return session;
  } catch (error) {
    console.error('Snap Kit initialization failed:', error);
    throw error;
  }
};

export const loadLens = async (lensId) => {
  if (!session) {
    throw new Error('Snap Kit not initialized');
  }
  
  try {
    const lens = await session.lenses.repository.loadLens(lensId, '');
    await session.lenses.processor.apply(lens);
    return lens;
  } catch (error) {
    console.error('Failed to load lens:', error);
    throw error;
  }
};

export const removeLens = async () => {
  if (!session) return;
  
  try {
    await session.lenses.processor.clear();
  } catch (error) {
    console.error('Failed to remove lens:', error);
  }
};

export const capturePhoto = async () => {
  if (!session) {
    throw new Error('Snap Kit not initialized');
  }
  
  try {
    const imageData = await session.output.takePhoto();
    return imageData;
  } catch (error) {
    console.error('Failed to capture photo:', error);
    throw error;
  }
};

export const startCamera = async () => {
  if (!session) {
    await initializeSnapKit();
  }
  
  try {
    await session.start();
  } catch (error) {
    console.error('Failed to start camera:', error);
    throw error;
  }
};

export const stopCamera = async () => {
  if (!session) return;
  
  try {
    await session.pause();
  } catch (error) {
    console.error('Failed to stop camera:', error);
  }
};

export default {
  initializeSnapKit,
  loadLens,
  removeLens,
  capturePhoto,
  startCamera,
  stopCamera
};