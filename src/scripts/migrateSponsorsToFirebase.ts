import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

// Hardcoded sponsors data to migrate
const sponsorsToMigrate = [
  { 
    name: 'DaxGenAI', 
    logoPath: '/sponsors/DAX.png',
    website: 'https://daxgenai.com'
  },
  { 
    name: 'BCom Buddy', 
    logoPath: '/sponsors/bcom-buddy.png',
    website: 'https://bcombuddy.com'
  },
  { 
    name: 'The Siasat Daily', 
    logoPath: '/sponsors/siyasaat.png',
    website: 'https://siasat.com'
  },
  { 
    name: 'Masqati Dairy Milk', 
    logoPath: '/sponsors/masqati.png',
    website: 'https://masqati.com'
  },
  { 
    name: 'Quanco', 
    logoPath: '/sponsors/quanco.jpg',
    website: 'https://quancotechnologies.com/'
  }
];

// Hardcoded ads data to migrate
const adsToMigrate = [
  {
    title: 'Yashoda Hospital',
    imagePath: '/ADS/yashodaAD.png',
    linkUrl: 'https://yashodahospital.com'
  },
  {
    title: 'TechZone',
    imagePath: '/ADS/techzone.png',
    linkUrl: 'https://techzone.com'
  }
];

// Function to upload file to Firebase Storage
async function uploadFileToStorage(filePath: string, storagePath: string): Promise<string> {
  try {
    console.log(`📁 Fetching file: ${filePath}`);
    
    // In a real migration, you would fetch the file from the public directory
    // For now, we'll create a placeholder URL since we can't actually read files from public in this context
    // In a real implementation, you would use fetch() to get the file from the public directory
    
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const storageRef = ref(storage, storagePath);
    
    console.log(`📤 Uploading to: ${storagePath}`);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ Upload successful: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
    throw error;
  }
}

// Function to migrate sponsors
async function migrateSponsors() {
  console.log('🚀 Starting sponsors migration...');
  
  for (const sponsor of sponsorsToMigrate) {
    try {
      console.log(`\n📝 Migrating sponsor: ${sponsor.name}`);
      
      // Upload logo to Firebase Storage
      const logoUrl = await uploadFileToStorage(
        sponsor.logoPath,
        `sponsors/${sponsor.name.toLowerCase().replace(/\s+/g, '_')}/logo_${Date.now()}.${sponsor.logoPath.split('.').pop()}`
      );
      
      // Create sponsor document in Firestore
      const sponsorData = {
        name: sponsor.name,
        website: sponsor.website,
        logo: logoUrl,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'sponsors'), sponsorData);
      console.log(`✅ Sponsor created with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error(`❌ Failed to migrate sponsor ${sponsor.name}:`, error);
    }
  }
  
  console.log('✅ Sponsors migration completed!');
}

// Function to migrate ads
async function migrateAds() {
  console.log('🚀 Starting ads migration...');
  
  for (const ad of adsToMigrate) {
    try {
      console.log(`\n📝 Migrating ad: ${ad.title}`);
      
      // Upload image to Firebase Storage
      const imageUrl = await uploadFileToStorage(
        ad.imagePath,
        `ads/${ad.title.toLowerCase().replace(/\s+/g, '_')}/image_${Date.now()}.${ad.imagePath.split('.').pop()}`
      );
      
      // Create ad document in Firestore
      const adData = {
        title: ad.title,
        linkUrl: ad.linkUrl,
        imageUrl: imageUrl,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'ads'), adData);
      console.log(`✅ Ad created with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error(`❌ Failed to migrate ad ${ad.title}:`, error);
    }
  }
  
  console.log('✅ Ads migration completed!');
}

// Main migration function
async function runMigration() {
  try {
    console.log('🎯 Starting Firebase Migration...');
    console.log('📋 This script will:');
    console.log('   1. Upload existing sponsor logos to Firebase Storage');
    console.log('   2. Upload existing ad images to Firebase Storage');
    console.log('   3. Create sponsor documents in Firestore');
    console.log('   4. Create ad documents in Firestore');
    console.log('\n⚠️  Make sure Firebase Storage is enabled in your Firebase Console!');
    console.log('⚠️  Make sure you have the correct Firebase configuration!');
    
    // Wait a moment for user to read
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Migrate sponsors
    await migrateSponsors();
    
    // Migrate ads
    await migrateAds();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Check your Firebase Console to verify the data');
    console.log('   2. Test the admin panel to ensure everything works');
    console.log('   3. Remove the hardcoded data from your components');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

export { runMigration, migrateSponsors, migrateAds };
