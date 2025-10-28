import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q",
  authDomain: "ai-edudigestapp.firebaseapp.com",
  projectId: "ai-edudigestapp",
  storageBucket: "ai-edudigestapp.firebasestorage.app",
  messagingSenderId: "55946910635",
  appId: "1:55946910635:web:8555fe63f46e286c6cd0ee",
  measurementId: "G-5LH8CR2XQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test reading from ads collection
    console.log('📊 Testing ads collection...');
    const adsRef = collection(db, 'ads');
    const adsSnapshot = await getDocs(adsRef);
    
    console.log('📝 Ads collection size:', adsSnapshot.size);
    
    if (adsSnapshot.size > 0) {
      console.log('✅ Found ads:');
      adsSnapshot.docs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.id}:`, doc.data());
      });
    } else {
      console.log('❌ No ads found in collection');
    }
    
    // Test reading from sponsors collection
    console.log('📊 Testing sponsors collection...');
    const sponsorsRef = collection(db, 'sponsors');
    const sponsorsSnapshot = await getDocs(sponsorsRef);
    
    console.log('📝 Sponsors collection size:', sponsorsSnapshot.size);
    
    if (sponsorsSnapshot.size > 0) {
      console.log('✅ Found sponsors:');
      sponsorsSnapshot.docs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.id}:`, doc.data());
      });
    } else {
      console.log('❌ No sponsors found in collection');
    }
    
  } catch (error) {
    console.error('💥 Firebase connection test failed:', error);
  }
}

// Run the test
testFirebaseConnection();
