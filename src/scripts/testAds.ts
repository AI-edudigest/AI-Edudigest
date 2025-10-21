import { getAds, createAd } from '../utils/firebase.js';

// Test script to verify ads functionality
async function testAds() {
  console.log('🧪 Testing ads functionality...');
  
  try {
    // Test fetching ads
    console.log('📊 Fetching existing ads...');
    const result = await getAds();
    console.log('📝 Ads result:', result);
    
    if (result.ads && result.ads.length > 0) {
      console.log('✅ Found', result.ads.length, 'ads');
      result.ads.forEach((ad, index) => {
        console.log(`  ${index + 1}. ${ad.title} (Active: ${ad.active})`);
      });
    } else {
      console.log('❌ No ads found');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testAds();
