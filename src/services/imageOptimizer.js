class ImageOptimizer {
  constructor(config) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async optimizeImage(file, options = {}) {
    const settings = { ...this.config.image, ...options };
    
    try {
      const startTime = performance.now();
      
      // Step 1: Load image
      const img = await this.loadImage(file);
      
      // Step 2: Calculate optimal dimensions
      const dimensions = this.calculateDimensions(img, settings.maxDimensions);
      
      // Step 3: Resize image
      const resizedCanvas = await this.resizeImage(img, dimensions, settings);
      
      // Step 4: Apply compression and format conversion
      const optimizedBlob = await this.compressImage(resizedCanvas, settings);
      
      // Step 5: Generate thumbnails and previews
      const variants = await this.generateVariants(img, settings);
      
      const processingTime = (performance.now() - startTime) / 1000;
      
      return {
        original: file,
        optimized: optimizedBlob,
        variants,
        metadata: {
          originalSize: file.size,
          optimizedSize: optimizedBlob.size,
          compression: ((file.size - optimizedBlob.size) / file.size * 100).toFixed(1),
          dimensions: dimensions,
          format: optimizedBlob.type,
          quality: settings.quality[settings.quality.default],
          processingTime: processingTime.toFixed(2)
        }
      };
    } catch (error) {
      throw new Error(`Optimalizálási hiba: ${error.message}`);
    }
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Kép betöltési hiba'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  calculateDimensions(img, maxDimensions) {
    const { width: maxWidth, height: maxHeight } = maxDimensions.gallery;
    const aspectRatio = img.width / img.height;
    
    let newWidth = img.width;
    let newHeight = img.height;
    
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

  async resizeImage(img, dimensions, settings) {
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    
    // Apply image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
    
    return canvas;
  }

  async compressImage(canvas, settings) {
    const quality = settings.quality[settings.quality.default];
    const format = settings.formats.preferredOutput === 'webp' ? 'image/webp' : 'image/jpeg';
    
    try {
      const blob = await this.canvasToBlob(canvas, format, quality);
      
      if (!blob || blob.size === 0) {
        return await this.canvasToBlob(canvas, 'image/jpeg', quality);
      }
      
      return blob;
    } catch (error) {
      return await this.canvasToBlob(canvas, 'image/jpeg', quality);
    }
  }

  canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
  }

  async generateVariants(img, settings) {
    const variants = {};
    
    // Generate thumbnail
    const thumbnailCanvas = await this.resizeImage(
      img, 
      settings.maxDimensions.thumbnail, 
      settings
    );
    variants.thumbnail = await this.compressImage(thumbnailCanvas, {
      ...settings,
      quality: { default: 'medium' }
    });
    
    // Generate preview
    const previewCanvas = await this.resizeImage(
      img,
      settings.maxDimensions.preview,
      settings
    );
    variants.preview = await this.compressImage(previewCanvas, {
      ...settings,
      quality: { default: 'high' }
    });
    
    return variants;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default ImageOptimizer;