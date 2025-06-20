import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * Debug helper to fix media items in Firestore
 * This will fetch all media items and add a function to window to fix them
 */
export const setupDebugHelpers = async () => {
  try {
    console.log('Setting up debugging helpers for Gallery...');
    
    // Fetch all media items regardless of approved status
    const allMediaQuery = query(
      collection(db, 'media_uploads'),
      orderBy('uploadDate', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(allMediaQuery);
    console.log('Debug: Found', snapshot.docs.length, 'total media documents');
    
    const allMediaData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        uploadDate: data.uploadDate?.toDate()
      };
    });
    
    // Log the data for inspection
    console.log('Debug: All media data:', allMediaData);
    
    // Add helper functions to window for debugging in console
    window.allMediaData = allMediaData;
    
    // Function to fix all media items (set approved and showInGallery to true)
    window.fixMediaItems = async () => {
      console.log('Fixing media items...');
      let fixedCount = 0;
      
      for (const item of allMediaData) {
        try {
          const docRef = doc(db, 'media_uploads', item.id);
          await updateDoc(docRef, {
            approved: true,
            showInGallery: true
          });
          console.log(`✅ Fixed item ${item.id}`);
          fixedCount++;
        } catch (err) {
          console.error(`❌ Failed to fix item ${item.id}:`, err);
        }
      }
      
      console.log(`Done fixing ${fixedCount}/${allMediaData.length} media items.`);
      console.log('Please refresh the page to see the changes.');
    };
    
    console.log('Debug helpers added to window. Run window.fixMediaItems() in the console to fix all media items.');
    
  } catch (error) {
    console.error('Error setting up debug helpers:', error);
  }
};
