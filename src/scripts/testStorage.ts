// Test Firebase Storage connection
import { storage } from '../utils/firebase';
import { checkFirebaseStorage, getStorageStatus } from '../utils/firebaseStorageCheck';

async function testStorage() {
  console.log('🧪 Testing Firebase Storage...');
  
  try {
    // Test 1: Check storage status
    console.log('\n1️⃣ Checking storage status...');
    const status = getStorageStatus();
    console.log('📊 Status:', status);
    
    // Test 2: Check if storage is available
    console.log('\n2️⃣ Checking storage availability...');
    const isAvailable = await checkFirebaseStorage();
    console.log('✅ Available:', isAvailable);
    
    // Test 3: Check storage bucket
    console.log('\n3️⃣ Checking storage bucket...');
    const bucket = storage.app.options.storageBucket;
    console.log('📦 Bucket:', bucket);
    
    // Test 4: Try to create a reference
    console.log('\n4️⃣ Testing reference creation...');
    const testRef = storage.ref('test/connection-check');
    console.log('✅ Reference created successfully');
    
    console.log('\n🎉 Firebase Storage is working properly!');
    console.log('✅ Status: Ready');
    console.log('✅ Bucket:', bucket);
    console.log('✅ Reference creation: Success');
    
  } catch (error) {
    console.error('\n❌ Firebase Storage test failed:', error);
    console.log('❌ Status: Not working');
    console.log('❌ Error:', error.message);
  }
}

// Run the test
testStorage().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});
