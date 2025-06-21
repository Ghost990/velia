import React, { useEffect, useRef, useState } from 'react';

const SDK_KEY_ON_WINDOW = '__SNAP_CAMERA_KIT_GLOBAL_SDK_INSTANCE__';

// Ensures SDK import and bootstrap happen only once per application lifecycle.
async function getOrBootstrapSnapSDK() {
  if (window[SDK_KEY_ON_WINDOW] && window[SDK_KEY_ON_WINDOW].sdkImports && window[SDK_KEY_ON_WINDOW].cameraKitSDKInstance) {
    console.log('SnapCameraKitPOC: Re-using SDK from global window object.');
    return window[SDK_KEY_ON_WINDOW];
  }

  let tempSdkImports;
  if (window[SDK_KEY_ON_WINDOW] && window[SDK_KEY_ON_WINDOW].sdkImports) {
    console.log('SnapCameraKitPOC: Re-using sdkImports from global window object, bootstrapping instance...');
    tempSdkImports = window[SDK_KEY_ON_WINDOW].sdkImports;
  } else {
    console.log('SnapCameraKitPOC: Dynamically importing @snap/camera-kit (global setup)...');
    tempSdkImports = await import('@snap/camera-kit');
    console.log('SnapCameraKitPOC: SDK dynamically imported successfully (global setup).');
    window[SDK_KEY_ON_WINDOW] = { ...window[SDK_KEY_ON_WINDOW], sdkImports: tempSdkImports }; 
  }

  const { bootstrapCameraKit } = tempSdkImports;
  console.log('SnapCameraKitPOC: Bootstrapping CameraKit SDK (global setup)...');
  const apiToken = import.meta.env.VITE_SNAP_API_TOKEN;
  if (!apiToken || apiToken === 'YOUR_API_TOKEN_HERE' || apiToken === 'YOUR_API_TOKEN') {
    throw new Error('Snap API Token is not configured or is using a placeholder (global setup).');
  }
  const tempCameraKitSDKInstance = await bootstrapCameraKit({ apiToken });
  console.log('SnapCameraKitPOC: CameraKit SDK bootstrapped and instance stored on window (global setup).');

  window[SDK_KEY_ON_WINDOW] = { sdkImports: tempSdkImports, cameraKitSDKInstance: tempCameraKitSDKInstance };
  return window[SDK_KEY_ON_WINDOW];
}

const LENS_GROUP_ID = import.meta.env.VITE_SNAP_LENS_GROUP_ID;

const availableLenses = [
  { id: '43276710876', name: 'CamKit Cutout' },
  { id: '44049520876', name: 'Face Mesh' },
  { id: '50502090875', name: 'Hand Gestures' },
  { id: '50507980875', name: 'Face Expressions' },
];

const SnapCameraKitPOC = () => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLensName, setCurrentLensName] = useState('None');
  const [canvasKey, setCanvasKey] = useState(Date.now());

  const [cameraKit, setCameraKit] = useState(null);
  const [session, setSession] = useState(null);
  const mediaStreamRef = useRef(null);

  const setupEventListeners = (activeSession) => {
    if (!activeSession || !activeSession.events) return [];
    const eventListeners = [];
    const eventTypes = [
      'error', 'lens:applied', 'lens:idlestate', 'lens:started', 'lens:stopped',
      'render:started', 'render:stopped', 'render:completed', 'render:failed',
      'playback:started', 'playback:stopped', 'playback:paused', 'playback:resumed',
      'face:found', 'face:lost', 'hand:found', 'hand:lost',
    ];
    eventTypes.forEach(eventType => {
      const handler = (event) => {
        console.log(`SnapCameraKitPOC: Session Event - ${eventType}:`, event.detail || event);
        if (eventType === 'error' && event.detail?.error) {
          setError(`Session Event Error (${eventType}): ${event.detail.error.message || JSON.stringify(event.detail.error)}`);
        } else if (eventType === 'error') {
          setError(`Session Event Error (${eventType}): ${JSON.stringify(event)}`);
        }
        if (eventType === 'lens:applied' && event.detail?.lens) {
          setCurrentLensName(event.detail.lens.name || 'Unknown Lens');
          console.log('SnapCameraKitPOC: session.appliedLens after lens:applied event:', activeSession.appliedLens);
        }
        if (eventType === 'lens:started' && event.detail?.lens) {
            console.log('SnapCameraKitPOC: session.appliedLens on lens:started event:', activeSession.appliedLens);
        }
      };
      activeSession.events.addEventListener(eventType, handler);
      eventListeners.push({ type: eventType, handler });
    });
    console.log('SnapCameraKitPOC: All speculative event listeners attached.');
    return eventListeners;
  };

  useEffect(() => {
    console.log(`SnapCameraKitPOC: useEffect triggered. Canvas key: ${canvasKey}`);
    let isMounted = true;
    let currentSessionForCleanup = null;
    let currentEventListeners = [];

    const initCameraKitAndSession = async () => {
      if (!canvasRef.current) {
        console.warn('SnapCameraKitPOC: init - Canvas ref not available yet.');
        if (isMounted) setIsLoading(false);
        return;
      }
      if (isMounted) {
        setIsLoading(true);
        setError(null);
        setCurrentLensName('None');
      }
      try {
        const { sdkImports, cameraKitSDKInstance } = await getOrBootstrapSnapSDK();
        if (!isMounted) return;
        setCameraKit(cameraKitSDKInstance);
        const { createMediaStreamSource, Transform2D } = sdkImports;
        const newSession = await cameraKitSDKInstance.createSession({ liveRenderTarget: canvasRef.current });
        if (!isMounted) {
          newSession?.dispose();
          return;
        }
        setSession(newSession);
        currentSessionForCleanup = newSession;
        currentEventListeners = setupEventListeners(newSession);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        mediaStreamRef.current = stream;
        const source = createMediaStreamSource(stream, { transform: Transform2D.MirrorX, cameraType: 'user' });
        await newSession.setSource(source);
        await newSession.play();
        console.log('SnapCameraKitPOC: Session playback started (no lens initially).');
      } catch (err) {
        console.error('SnapCameraKitPOC: Initialization failed:', err);
        if (isMounted) setError(err.message || 'Unknown error during init.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initCameraKitAndSession();
    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (currentSessionForCleanup && currentEventListeners.length > 0) {
        currentEventListeners.forEach(listener => {
          currentSessionForCleanup.events.removeEventListener(listener.type, listener.handler);
        });
      }
      currentSessionForCleanup?.pause();
      currentSessionForCleanup?.dispose();
      setSession(null);
      setCameraKit(null);
      setIsLoading(true);
    };
  }, [canvasKey]);

  const applyLensById = async (lensIdToApply, lensName) => {
    if (!cameraKit || !session) {
      setError('Camera Kit not ready.');
      return;
    }
    if (!LENS_GROUP_ID) {
      setError('Lens Group ID missing.');
      return;
    }
    console.log(`SnapCameraKitPOC: Applying lens: ID ${lensIdToApply}, Name: ${lensName}`);
    setIsLoading(true);
    setError(null);
    setCurrentLensName('Loading...');
    try {
      const lens = await cameraKit.lensRepository.loadLens(lensIdToApply, LENS_GROUP_ID);
      if (lens) {
        await session.applyLens(lens);
        console.log(`SnapCameraKitPOC: session.applyLens(${lens.name}) call completed.`);
        console.log('SnapCameraKitPOC: session.appliedLens after applyLens call:', session.appliedLens);
        // setCurrentLensName(lens.name); // 'lens:applied' event should handle this
      } else {
        setError(`Failed to load lens: ${lensName}`);
        setCurrentLensName('None');
      }
    } catch (err) {
      console.error(`SnapCameraKitPOC: Error applying lens ${lensName}:`, err);
      setError(`Error applying lens ${lensName}: ${err.message}`);
      setCurrentLensName('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearLens = async () => {
    if (!session) {
      setError('Camera Kit not ready.');
      return;
    }
    console.log('SnapCameraKitPOC: Attempting to clear lens (UI only).');
    // True SDK clearLens method is unknown for v1.6.1.
    // This will just reset UI state. Visual effect may persist.
    // One might try applying a 'null' lens if supported: await session.applyLens(null);
    setCurrentLensName('None');
    console.log('SnapCameraKitPOC: session.appliedLens after UI clear:', session.appliedLens);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Snap Camera Kit POC - Dynamic Lens Selector</h3>
      <div style={{ marginBottom: '10px' }}><strong>Current Lens:</strong> {currentLensName}</div>
      {error && <p style={{ color: 'red', maxWidth: '600px', wordBreak: 'break-word' }}>Error: {error}</p>}
      
      <div style={{ position: 'relative', width: '640px', height: '480px', marginBottom: '20px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
        <canvas
          key={canvasKey}
          ref={canvasRef}
          width="640"
          height="480"
          style={{ display: isLoading && !error ? 'none' : 'block', width: '100%', height: '100%' }}
        />
        {isLoading && !error && <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Initializing Camera...</div>}
      </div>

      {isLoading && <p>Loading/Processing...</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
        {availableLenses.map(lens => (
          <button key={lens.id} onClick={() => applyLensById(lens.id, lens.name)} disabled={isLoading || !session}>
            Apply {lens.name}
          </button>
        ))}
        <button onClick={clearLens} disabled={isLoading || !session}>Clear Lens (UI Only)</button>
      </div>
      <button onClick={() => setCanvasKey(Date.now())} disabled={isLoading}>
        Force Re-initialize Camera & Session
      </button>
      <p style={{fontSize: '0.8em', color: '#777', marginTop: '10px'}}>Note: 'Clear Lens' currently only resets UI. True visual clearing might require SDK support or session reset.</p>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>Snap Camera Kit POC</p>
    </div>
  );
};

export default SnapCameraKitPOC;
