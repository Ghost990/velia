import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/services/firebase.js';

// List all media documents in Firestore
async function listMediaDocuments() {
  try {
    console.log('Fetching all media documents from Firestore...');
    
    const mediaCollection = collection(db, 'media_uploads');
    const snapshot = await getDocs(mediaCollection);
    
    console.log(`Found ${snapshot.docs.length} documents in media_uploads collection`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nDocument ${index + 1} (ID: ${doc.id}):`);
      console.log(`  - originalFileName: ${data.originalFileName || 'N/A'}`);
      console.log(`  - uploadDate: ${data.uploadDate?.toDate?.() || data.uploadDate || 'N/A'}`);
      console.log(`  - approved: ${data.approved}`);
      console.log(`  - showInGallery: ${data.showInGallery}`);
      console.log(`  - originalUrl: ${data.originalUrl || 'N/A'}`);
      console.log(`  - optimizedUrl: ${data.optimizedUrl || 'N/A'}`);
      
      // Check for optimization variants
      if (data.optimization?.variants?.preview) {
        console.log(`  - optimization.variants.preview: ${data.optimization.variants.preview}`);
      } else {
        console.log(`  - optimization.variants.preview: N/A`);
      }
    });
    
  } catch (error) {
    console.error('Error listing media documents:', error);
  }
}

// Run the function
listMediaDocuments();
