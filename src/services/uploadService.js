import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from './firebase';
import ImageOptimizer from './imageOptimizer';

class UploadService {
  constructor(config) {
    this.config = config;
    this.imageOptimizer = new ImageOptimizer(config);
  }

  /**
   * Upload multiple files with progress tracking
   * @param {File[]} files - Array of files to upload
   * @param {Function} onProgress - Progress callback function
   * @param {Function} onFileComplete - Individual file completion callback
   * @returns {Promise<Object[]>} Array of upload results
   */
  async uploadFiles(files, onProgress = null, onFileComplete = null) {
    const results = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
      try {
        const result = await this.uploadSingleFile(file);
        results.push({ success: true, file, result });
        
        if (onFileComplete) {
          onFileComplete(file, result, null);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.push({ success: false, file, error });
        
        if (onFileComplete) {
          onFileComplete(file, null, error);
        }
      }

      completedFiles++;
      if (onProgress) {
        onProgress((completedFiles / totalFiles) * 100, completedFiles, totalFiles);
      }
    }

    return results;
  }

  /**
   * Upload a single file
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Upload result with URLs and metadata
   */
  async uploadSingleFile(file) {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomId}_${file.name}`;

    try {
      // Upload original file
      const originalRef = ref(storage, `${this.config.storage?.folders?.originals || 'originals/'}${fileName}`);
      const originalUpload = await uploadBytes(originalRef, file);
      const originalUrl = await getDownloadURL(originalUpload.ref);

      let optimizedUrl = originalUrl;
      let thumbnailUrl = originalUrl;
      let optimization = null;

      // Process image files
      if (file.type.startsWith('image/') && this.config.features?.imageOptimization) {
        try {
          const optimizedResult = await this.imageOptimizer.optimizeImage(file);
          
          // Upload optimized version
          if (optimizedResult.optimized) {
            const optimizedRef = ref(storage, `${this.config.storage?.folders?.optimized || 'optimized/'}${fileName}`);
            const optimizedUpload = await uploadBytes(optimizedRef, optimizedResult.optimized);
            optimizedUrl = await getDownloadURL(optimizedUpload.ref);
          }

          // Upload thumbnail if available
          if (optimizedResult.variants?.thumbnail) {
            const thumbnailRef = ref(storage, `${this.config.storage?.folders?.thumbnails || 'thumbnails/'}${fileName}`);
            const thumbnailUpload = await uploadBytes(thumbnailRef, optimizedResult.variants.thumbnail);
            thumbnailUrl = await getDownloadURL(thumbnailUpload.ref);
          }

          optimization = optimizedResult.metadata;
        } catch (optimizeError) {
          console.warn('Image optimization failed, using original:', optimizeError);
        }
      }

      // Save to Firestore
      const mediaDoc = {
        originalFileName: file.name,
        fileName: fileName,
        originalUrl: originalUrl,
        optimizedUrl: optimizedUrl,
        thumbnailUrl: thumbnailUrl,
        fileType: file.type.split('/')[0],
        mimeType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        approved: !this.config.features?.requireApproval, // Auto-approve if not required
        showInGallery: true,
        filterUsed: null,
        likes: 0,
        tags: [],
        optimization: optimization,
        uploadedVia: 'web',
        metadata: {
          width: optimization?.dimensions?.width || null,
          height: optimization?.dimensions?.height || null,
          aspectRatio: optimization?.dimensions ? 
            (optimization.dimensions.width / optimization.dimensions.height).toFixed(2) : null
        }
      };

      const docRef = await addDoc(collection(db, 'media_uploads'), mediaDoc);

      return {
        id: docRef.id,
        originalUrl,
        optimizedUrl,
        thumbnailUrl,
        fileName,
        optimization,
        metadata: mediaDoc.metadata
      };

    } catch (error) {
      // Enhanced error handling for CORS and Firebase issues
      if (error.message?.includes('CORS') || error.code === 'storage/unknown') {
        throw new Error(`Firebase Storage CORS Error: Upload blocked by CORS policy. 
        
This is a common development issue. To fix:
1. Configure CORS for your Firebase Storage bucket
2. Run: gsutil cors set cors.json gs://krisztidani-7d45c.firebasestorage.app
3. See FIREBASE_SETUP.md for detailed instructions

Original error: ${error.message}`);
      }

      if (error.code === 'permission-denied') {
        throw new Error(`Permission denied: Check Firebase Storage rules and authentication. Original error: ${error.message}`);
      }

      if (error.code === 'unauthenticated') {
        throw new Error(`Authentication required: User must be signed in to upload files. Original error: ${error.message}`);
      }

      // Re-throw with enhanced context
      throw new Error(`Upload failed: ${error.message}. Check Firebase configuration and network connectivity.`);
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @throws {Error} If file is invalid
   */
  validateFile(file) {
    // Check file size
    const maxSize = this.parseFileSize(this.config.upload?.maxFileSize || '50MB');
    if (file.size > maxSize) {
      throw new Error(`File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.config.upload?.maxFileSize || '50MB'}`);
    }

    // Check file type
    const allowedFormats = this.config.upload?.allowedFormats || ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedFormats.includes(fileExtension)) {
      throw new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedFormats.join(', ')}`);
    }

    // Additional MIME type check
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/mov'
    ];
    
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(`MIME type ${file.type} is not allowed`);
    }
  }

  /**
   * Parse file size string to bytes
   * @param {string} sizeStr - Size string like "50MB"
   * @returns {number} Size in bytes
   */
  parseFileSize(sizeStr) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    
    if (!match) {
      throw new Error(`Invalid file size format: ${sizeStr}`);
    }

    const [, size, unit] = match;
    return parseFloat(size) * units[unit.toUpperCase()];
  }

  /**
   * Format file size in bytes to human readable string
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Create a test upload to verify functionality
   * @returns {Promise<Object>} Test result
   */
  async testUpload() {
    try {
      // Create a small test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      // Draw a simple test pattern
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 50, 50);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(50, 0, 50, 50);
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, 50, 50, 50);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(50, 50, 50, 50);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const testFile = new File([blob], 'test_upload.png', { type: 'image/png' });

      const result = await this.uploadSingleFile(testFile);
      
      return {
        success: true,
        message: 'Test upload completed successfully',
        result
      };
    } catch (error) {
      return {
        success: false,
        message: `Test upload failed: ${error.message}`,
        error
      };
    }
  }
}

export default UploadService;
