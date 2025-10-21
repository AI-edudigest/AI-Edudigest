# Firebase Migration Instructions

## Overview
This migration script will upload existing hardcoded sponsor logos and ad images to Firebase Storage and create corresponding documents in Firestore.

## Prerequisites

1. **Firebase Storage Enabled**: Make sure Firebase Storage is enabled in your Firebase Console
2. **Firebase Configuration**: Verify your Firebase configuration is correct
3. **Node.js**: Ensure you have Node.js installed
4. **TypeScript**: Install ts-node if not already installed: `npm install -g ts-node`

## Running the Migration

### Option 1: Using ts-node (Recommended)
```bash
npx ts-node src/scripts/migrateSponsorsToFirebase.ts
```

### Option 2: Compile and Run
```bash
# Compile TypeScript
npx tsc src/scripts/migrateSponsorsToFirebase.ts --outDir dist/scripts

# Run the compiled JavaScript
node dist/scripts/migrateSponsorsToFirebase.js
```

## What the Migration Does

### Sponsors Migration
- Uploads sponsor logos from `public/sponsors/` to Firebase Storage
- Creates sponsor documents in Firestore with:
  - `name`: Sponsor name
  - `website`: Website URL
  - `logo`: Firebase Storage URL
  - `active`: true
  - `createdAt`: Current timestamp
  - `updatedAt`: Current timestamp

### Ads Migration
- Uploads ad images from `public/ADS/` to Firebase Storage
- Creates ad documents in Firestore with:
  - `title`: Ad title
  - `linkUrl`: Link URL
  - `imageUrl`: Firebase Storage URL
  - `active`: true
  - `createdAt`: Current timestamp
  - `updatedAt`: Current timestamp

## Files Migrated

### Sponsors
- `/sponsors/DAX.png` → `sponsors/daxgenai/logo_[timestamp].png`
- `/sponsors/bcom-buddy.png` → `sponsors/bcom_buddy/logo_[timestamp].png`
- `/sponsors/siyasaat.png` → `sponsors/the_siasat_daily/logo_[timestamp].png`
- `/sponsors/masqati.png` → `sponsors/masqati_dairy_milk/logo_[timestamp].png`
- `/sponsors/quanco.jpg` → `sponsors/quanco/logo_[timestamp].jpg`

### Ads
- `/ADS/yashodaAD.png` → `ads/yashoda_hospital/image_[timestamp].png`
- `/ADS/techzone.png` → `ads/techzone/image_[timestamp].png`

## Verification

After running the migration:

1. **Check Firebase Console**:
   - Go to Storage section and verify files are uploaded
   - Go to Firestore section and verify documents are created

2. **Test Admin Panel**:
   - Navigate to Sponsors section in admin panel
   - Navigate to Ads section in admin panel
   - Verify data is displayed correctly

3. **Test User Interface**:
   - Check HomePage sponsors section
   - Check AdsCarousel component
   - Verify images load correctly

## Troubleshooting

### Common Issues

1. **Firebase Storage not enabled**:
   - Go to Firebase Console → Storage
   - Click "Get started" to enable Storage
   - Set up security rules

2. **Permission denied**:
   - Check Firebase security rules
   - Ensure authentication is working

3. **File not found**:
   - Verify files exist in `public/sponsors/` and `public/ADS/`
   - Check file paths in the script

4. **Network errors**:
   - Check internet connection
   - Verify Firebase configuration

### Rollback
If migration fails, you can:
1. Delete uploaded files from Firebase Storage
2. Delete created documents from Firestore
3. Revert to hardcoded data temporarily

## Post-Migration

After successful migration:
1. Remove hardcoded data from components (already done in this implementation)
2. Test all functionality thoroughly
3. Update any documentation
4. Consider removing the migration script after successful deployment

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify Firebase configuration
3. Ensure all prerequisites are met
4. Check Firebase Console for any errors
