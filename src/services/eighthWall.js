// 8th Wall XR8 integration for wedding-themed face effects
let isInitialized = false;
let currentScene = null;
let camera = null;
let canvas = null;

// Wedding-themed filter configurations
const WEDDING_FILTERS = {
  wedding_crown: {
    id: 'wedding_crown',
    name: 'Menyasszonyi korona',
    type: 'face_attachment',
    asset: 'crown',
    position: 'forehead',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  groom_hat: {
    id: 'groom_hat',
    name: 'Vőlegény kalap',
    type: 'face_attachment',
    asset: 'hat',
    position: 'head',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  wedding_frame: {
    id: 'wedding_frame',
    name: 'Esküvői keret',
    type: 'overlay',
    asset: 'frame',
    position: 'screen',
    scale: [1, 1, 1]
  },
  hearts_sparkles: {
    id: 'hearts_sparkles',
    name: 'Szívek és csillogás',
    type: 'particles',
    asset: 'hearts',
    animation: 'floating',
    count: 20
  },
  wedding_veil: {
    id: 'wedding_veil',
    name: 'Menyasszonyi fátyol',
    type: 'face_attachment',
    asset: 'veil',
    position: 'head_back',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  rose_petals: {
    id: 'rose_petals',
    name: 'Rózsaszirom',
    type: 'particles',
    asset: 'petals',
    animation: 'falling',
    count: 15
  }
};

// Initialize 8th Wall XR8
export const initialize8thWall = async (canvasElement) => {
  if (isInitialized) {
    console.log('8th Wall already initialized');
    return true;
  }

  try {
    // Load 8th Wall script dynamically
    await loadXR8Script();
    
    canvas = canvasElement;
    
    // Configure XR8 for face tracking
    XR8.XrController.configure({
      enableVps: false,
      enableWorldTracking: false,
      enableImageTargets: false,
      enableFaceTracking: true,
      enableHandTracking: false,
      disableWorldTracking: true
    });

    // Add face controller pipeline module
    XR8.addCameraPipelineModule(XR8.FaceController.pipelineModule());
    
    // Add custom wedding effects pipeline module
    XR8.addCameraPipelineModule(createWeddingEffectsModule());

    // Initialize camera with canvas
    await XR8.run({ canvas: canvasElement });
    
    isInitialized = true;
    console.log('8th Wall initialized successfully for wedding filters');
    return true;
    
  } catch (error) {
    console.error('Failed to initialize 8th Wall:', error);
    throw error;
  }
};

// Load 8th Wall script dynamically
const loadXR8Script = () => {
  return new Promise((resolve, reject) => {
    if (window.XR8) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.8thwall.com/web/xr/xr-latest.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load 8th Wall script'));
    document.head.appendChild(script);
  });
};

// Create custom wedding effects pipeline module
const createWeddingEffectsModule = () => {
  let activeFilter = null;
  let filterElement = null;

  return {
    name: 'weddingeffects',
    
    onStart: ({ canvas, canvasWidth, canvasHeight }) => {
      console.log('Wedding effects module started');
      
      // Create A-Frame scene for 3D elements
      if (!currentScene) {
        createAFrameScene(canvas);
      }
    },

    onUpdate: ({ processCpuResult }) => {
      if (!processCpuResult.reality || !processCpuResult.reality.faces) {
        return;
      }

      const faces = processCpuResult.reality.faces;
      if (faces.length > 0 && activeFilter) {
        updateFilterPosition(faces[0], activeFilter);
      }
    },

    onException: (error) => {
      console.error('Wedding effects error:', error);
    }
  };
};

// Create A-Frame scene for 3D wedding elements
const createAFrameScene = (canvas) => {
  // Create A-Frame scene container
  const sceneContainer = document.createElement('div');
  sceneContainer.style.position = 'absolute';
  sceneContainer.style.top = '0';
  sceneContainer.style.left = '0';
  sceneContainer.style.width = '100%';
  sceneContainer.style.height = '100%';
  sceneContainer.style.pointerEvents = 'none';
  sceneContainer.style.zIndex = '10';
  
  const scene = document.createElement('a-scene');
  scene.setAttribute('embedded', '');
  scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
  
  // Add assets for wedding elements
  const assets = document.createElement('a-assets');
  assets.innerHTML = `
    <!-- Wedding Crown -->
    <a-box id="crown-asset" color="#FFD700" width="0.3" height="0.1" depth="0.3"></a-box>
    
    <!-- Groom Hat -->
    <a-cylinder id="hat-asset" color="#000000" radius="0.2" height="0.15"></a-cylinder>
    
    <!-- Wedding Frame -->
    <a-ring id="frame-asset" color="#FFD700" radius-inner="0.8" radius-outer="1.0"></a-ring>
    
    <!-- Hearts -->
    <a-sphere id="heart-asset" color="#FF69B4" radius="0.02"></a-sphere>
    
    <!-- Veil -->
    <a-plane id="veil-asset" color="#FFFFFF" opacity="0.7" width="0.4" height="0.6"></a-plane>
    
    <!-- Rose Petals -->
    <a-sphere id="petal-asset" color="#FF1493" radius="0.01"></a-sphere>
  `;
  
  scene.appendChild(assets);
  
  // Add camera
  const cameraEl = document.createElement('a-camera');
  cameraEl.setAttribute('position', '0 0 0');
  scene.appendChild(cameraEl);
  
  sceneContainer.appendChild(scene);
  canvas.parentElement.appendChild(sceneContainer);
  
  currentScene = scene;
};

// Apply wedding filter
export const applyWeddingFilter = async (filterId) => {
  if (!isInitialized) {
    throw new Error('8th Wall not initialized');
  }

  const filter = WEDDING_FILTERS[filterId];
  if (!filter) {
    throw new Error(`Filter ${filterId} not found`);
  }

  try {
    // Remove existing filter
    await removeWeddingFilter();
    
    // Apply new filter based on type
    switch (filter.type) {
      case 'face_attachment':
        await applyFaceAttachment(filter);
        break;
      case 'overlay':
        await applyOverlay(filter);
        break;
      case 'particles':
        await applyParticleEffect(filter);
        break;
    }
    
    console.log(`Applied wedding filter: ${filter.name}`);
    return true;
    
  } catch (error) {
    console.error('Failed to apply wedding filter:', error);
    throw error;
  }
};

// Apply face attachment (crown, hat, veil)
const applyFaceAttachment = (filter) => {
  if (!currentScene) return;

  const entity = document.createElement('a-entity');
  entity.setAttribute('id', `filter-${filter.id}`);
  
  // Create the 3D element based on filter asset
  let element;
  switch (filter.asset) {
    case 'crown':
      element = document.createElement('a-box');
      element.setAttribute('color', '#FFD700');
      element.setAttribute('width', '0.3');
      element.setAttribute('height', '0.1');
      element.setAttribute('depth', '0.3');
      element.setAttribute('position', '0 0.15 0');
      break;
      
    case 'hat':
      element = document.createElement('a-cylinder');
      element.setAttribute('color', '#000000');
      element.setAttribute('radius', '0.2');
      element.setAttribute('height', '0.15');
      element.setAttribute('position', '0 0.1 0');
      break;
      
    case 'veil':
      element = document.createElement('a-plane');
      element.setAttribute('color', '#FFFFFF');
      element.setAttribute('opacity', '0.7');
      element.setAttribute('width', '0.4');
      element.setAttribute('height', '0.6');
      element.setAttribute('position', '0 0 -0.1');
      break;
  }
  
  if (element) {
    entity.appendChild(element);
    currentScene.appendChild(entity);
    filterElement = entity;
  }
};

// Apply overlay effect (wedding frame)
const applyOverlay = (filter) => {
  if (!currentScene) return;

  const entity = document.createElement('a-entity');
  entity.setAttribute('id', `filter-${filter.id}`);
  
  const frame = document.createElement('a-ring');
  frame.setAttribute('color', '#FFD700');
  frame.setAttribute('radius-inner', '0.8');
  frame.setAttribute('radius-outer', '1.0');
  frame.setAttribute('position', '0 0 -2');
  
  entity.appendChild(frame);
  currentScene.appendChild(entity);
  filterElement = entity;
};

// Apply particle effects (hearts, rose petals)
const applyParticleEffect = (filter) => {
  if (!currentScene) return;

  const entity = document.createElement('a-entity');
  entity.setAttribute('id', `filter-${filter.id}`);
  
  // Create multiple particles
  for (let i = 0; i < filter.count; i++) {
    const particle = document.createElement('a-sphere');
    
    if (filter.asset === 'hearts') {
      particle.setAttribute('color', '#FF69B4');
      particle.setAttribute('radius', '0.02');
    } else if (filter.asset === 'petals') {
      particle.setAttribute('color', '#FF1493');
      particle.setAttribute('radius', '0.01');
    }
    
    // Random position around face
    const x = (Math.random() - 0.5) * 2;
    const y = Math.random() * 1.5;
    const z = (Math.random() - 0.5) * 0.5;
    
    particle.setAttribute('position', `${x} ${y} ${z}`);
    
    // Add animation
    if (filter.animation === 'floating') {
      particle.setAttribute('animation', 'property: position; to: ' + x + ' ' + (y + 0.5) + ' ' + z + '; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate');
    } else if (filter.animation === 'falling') {
      particle.setAttribute('animation', 'property: position; to: ' + x + ' ' + (y - 2) + ' ' + z + '; dur: 4000; easing: linear; loop: true');
    }
    
    entity.appendChild(particle);
  }
  
  currentScene.appendChild(entity);
  filterElement = entity;
};

// Update filter position based on face tracking
const updateFilterPosition = (face, filter) => {
  if (!filterElement) return;

  // Get face position and rotation
  const faceTransform = face.transform;
  if (!faceTransform) return;

  // Update filter element position to match face
  const position = `${faceTransform.position.x} ${faceTransform.position.y} ${faceTransform.position.z}`;
  const rotation = `${faceTransform.rotation.x} ${faceTransform.rotation.y} ${faceTransform.rotation.z}`;
  
  filterElement.setAttribute('position', position);
  filterElement.setAttribute('rotation', rotation);
};

// Remove current wedding filter
export const removeWeddingFilter = async () => {
  if (filterElement && currentScene) {
    currentScene.removeChild(filterElement);
    filterElement = null;
  }
};

// Capture photo with applied filter
export const capturePhotoWithFilter = async () => {
  if (!canvas) {
    throw new Error('Canvas not available');
  }

  try {
    // Create a composite canvas with both camera feed and filter
    const compositeCanvas = document.createElement('canvas');
    const ctx = compositeCanvas.getContext('2d');
    
    compositeCanvas.width = canvas.width;
    compositeCanvas.height = canvas.height;
    
    // Draw camera feed
    ctx.drawImage(canvas, 0, 0);
    
    // Convert to blob
    return new Promise((resolve) => {
      compositeCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
    
  } catch (error) {
    console.error('Failed to capture photo with filter:', error);
    throw error;
  }
};

// Get available wedding filters
export const getAvailableWeddingFilters = () => {
  return Object.values(WEDDING_FILTERS);
};

// Cleanup 8th Wall
export const cleanup8thWall = () => {
  if (isInitialized && window.XR8) {
    XR8.stop();
    isInitialized = false;
  }
  
  if (currentScene && currentScene.parentElement) {
    currentScene.parentElement.remove();
    currentScene = null;
  }
  
  filterElement = null;
  canvas = null;
};

// Named export alias for easier importing
export const initializeEighthWall = initialize8thWall;
