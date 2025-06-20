import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from './firebase';
import ImageOptimizer from './imageOptimizer';

/**
 * Modern Firebase Storage Upload Service
 * Handles image uploads, optimization, and metadata storage
 */
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
   * Upload a single file with resumable upload
   * @param {File} file - File to upload
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise<Object>} Upload result with URLs and metadata
   */
  async uploadSingleFile(file, onProgress = null) {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomId}_${file.name}`;

    try {
      // Process image files for optimization if enabled
      let optimizedBlob = null;
      let thumbnailBlob = null;
      let optimization = null;

      if (file.type.startsWith('image/') && this.config.features?.imageOptimization) {
        try {
          const optimizedResult = await this.imageOptimizer.optimizeImage(file);
          optimizedBlob = optimizedResult.optimized;
          thumbnailBlob = optimizedResult.variants?.thumbnail;
          optimization = optimizedResult.metadata;
        } catch (optimizeError) {
          console.warn('Image optimization failed, using original:', optimizeError);
        }
      }

      // Upload original file using resumable upload
      const originalRef = ref(storage, `${this.config.storage?.folders?.originals || 'originals/'}${fileName}`);
      
      // Use resumable upload if progress tracking is needed
      let originalUpload;
      if (onProgress) {
        const uploadTask = uploadBytesResumable(originalRef, file);
        
        // Set up progress monitoring
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        );
        
        // Wait for upload to complete
        originalUpload = await uploadTask;
      } else {
        // Use simple upload if no progress tracking needed
        originalUpload = await uploadBytes(originalRef, file);
      }
      
      const originalUrl = await getDownloadURL(originalUpload.ref);

      // Default to original URL for optimized and thumbnail
      let optimizedUrl = originalUrl;
      let thumbnailUrl = originalUrl;

      // Upload optimized version if available
      if (optimizedBlob) {
        const optimizedRef = ref(storage, `${this.config.storage?.folders?.optimized || 'optimized/'}${fileName}`);
        const optimizedUpload = await uploadBytes(optimizedRef, optimizedBlob);
        optimizedUrl = await getDownloadURL(optimizedUpload.ref);
      }

      // Upload thumbnail if available
      if (thumbnailBlob) {
        const thumbnailRef = ref(storage, `${this.config.storage?.folders?.thumbnails || 'thumbnails/'}${fileName}`);
        const thumbnailUpload = await uploadBytes(thumbnailRef, thumbnailBlob);
        thumbnailUrl = await getDownloadURL(thumbnailUpload.ref);
      }

      // Save metadata to Firestore
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
      // Enhanced error handling
      if (error.message?.includes('CORS') || error.code === 'storage/unknown') {
        throw new Error(`Firebase Storage CORS Error: Upload blocked by CORS policy. 
        
This is a common development issue. To fix:
1. Configure CORS for your Firebase Storage bucket
2. Run: gsutil cors set cors.json gs://YOUR-BUCKET-NAME.appspot.com
3. See Firebase documentation for detailed instructions

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
