import imageCompression from 'browser-image-compression';

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
      
      // Step 1: Use browser-image-compression for main optimization
      const imageCompressionOptions = {
        maxSizeMB: settings.maxSizeMB || 1.5, // Target 1.5MB max
        maxWidthOrHeight: settings.maxDimensions?.gallery?.width || 1920, // Target width or 1920px
        useWebWorker: true,
        initialQuality: settings.quality?.[settings.quality?.default] || 0.75, // Get quality from settings or default to 0.75
        fileType: settings.formats?.preferredOutput === 'webp' ? 'image/webp' : 'image/jpeg',
        // exifOrientation: true, // Let browser-image-compression handle orientation
      };

      // Load the original file into an Image object for variant generation before compressing the main file.
      const originalImageForVariants = await this.loadImage(file);

      console.log('Using browser-image-compression with options:', imageCompressionOptions);
      const optimizedFile = await imageCompression(file, imageCompressionOptions);
      // browser-image-compression returns a File object, which is a Blob
      const optimizedBlob = optimizedFile;

      // For metadata, we need the dimensions of the new optimizedBlob
      // We can load it into an image to get dimensions, or assume browser-image-compression handled it well.
      // For now, let's get dimensions from the optimized blob for accuracy in metadata.
      const img = await this.loadImage(optimizedBlob); // Load the *optimized* blob to get its dimensions
      const dimensions = { width: img.width, height: img.height };

      
      // Step 5: Generate thumbnails and previews using the original, uncompressed image data
      const variants = await this.generateVariants(originalImageForVariants, settings);
      
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