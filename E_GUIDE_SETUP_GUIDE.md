# E-Guide Feature Setup Guide

## Overview
This guide will help you set up the new E-Guide feature that allows admins to upload PDFs and users to view them in a clip book style interface.

## What's Been Created

### 1. Admin Components
- **`EguideContentManager.tsx`** - Admin panel for managing E-Guide PDFs
- **`uploadPdf.js`** - Utility for uploading PDFs to Firebase Storage
- **Updated `AdminLayout.tsx`** - Routes to E-Guide content manager

### 2. User Components  
- **`EguideViewer.tsx`** - User-facing PDF viewer with clip book style
- **Updated `SidebarTabContent.tsx`** - Routes E-Guide tabs to the viewer

### 3. Database Structure
- **Collection**: `eguideContent`
- **Fields**: `name`, `pdfUrl`, `pdfFileName`, `pdfSize`, `pdfStoragePath`, `active`, `createdAt`, `updatedAt`

## Setup Steps

### Step 1: Update Firebase Storage Rules
Go to **Firebase Console** → **Storage** → **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Sponsors logo uploads - only authenticated users can upload
    match /sponsors/{sponsorId}/{allPaths=**} {
      allow read: if true; // Anyone can read sponsor logos
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // Events images - only authenticated users can upload
    match /events/{eventId}/{allPaths=**} {
      allow read: if true; // Anyone can read event images
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // Ads images - only authenticated users can upload
    match /ads/{adId}/{allPaths=**} {
      allow read: if true; // Anyone can read ad images
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // User profile images - users can only upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read: if true; // Anyone can read profile images
      allow write: if request.auth != null && request.auth.uid == userId; // Users can only upload to their own folder
    }
    
    // Admin uploads - only admin users can upload
    match /admin/{allPaths=**} {
      allow read: if true; // Anyone can read admin uploads
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // E-Guide PDFs - only authenticated users can upload, anyone can read
    match /eguides/{allPaths=**} {
      allow read: if true; // Anyone can read E-Guide PDFs
      allow write, delete: if request.auth != null; // Only authenticated users can upload/delete
    }
  }
}
```

### Step 2: Create E-Guide Resource Tab
1. Go to **Admin Panel** → **Resource Tabs**
2. Click **"+ Add Resource Tab"**
3. Fill in:
   - **Name**: "E-Guide"
   - **Icon**: "📚" (or any book icon)
   - **Active**: ✅ Checked
4. Click **"Create Tab"**

### Step 3: Add E-Guide Content
1. In **Resource Tabs**, find your "E-Guide" tab
2. Click the **Settings** icon (⚙️) next to it
3. This will open the **E-Guide Content Manager**
4. Click **"+ Add E-Guide Content"**
5. Fill in:
   - **Title Name**: "Sample E-Guide" (or any name)
   - **PDF Upload**: Choose a PDF file (max 20MB)
   - **Active**: ✅ Checked
6. Click **"Create Content"**

### Step 4: Add E-Guide to Sidebar
1. Go to **Admin Panel** → **Sidebar Tabs**
2. Click **"+ Add Sidebar Tab"**
3. Fill in:
   - **Name**: "E-Guide"
   - **Icon**: "📚"
   - **Active**: ✅ Checked
4. Click **"Create Tab"**

## How It Works

### For Admins:
1. **Upload PDFs**: Go to Resource Tabs → E-Guide → Manage Content
2. **Edit/Delete**: Use the action buttons in the content list
3. **View PDFs**: Click the eye icon to preview
4. **Download**: Click the download icon

### For Users:
1. **Access**: Click "E-Guide" in the left sidebar
2. **Browse**: See all available E-Guides in a clip book style
3. **Read**: Click on any E-Guide to view the PDF
4. **Download**: Use the download button in the viewer

## Features

### Admin Features:
- ✅ Upload PDF files (max 20MB)
- ✅ Edit E-Guide titles
- ✅ Delete E-Guides
- ✅ Toggle active/inactive status
- ✅ View PDF previews
- ✅ Progress tracking during upload

### User Features:
- ✅ Clip book style interface
- ✅ PDF viewer with iframe
- ✅ Download functionality
- ✅ Responsive design
- ✅ Dark mode support

## File Structure
```
src/
├── components/
│   ├── admin/
│   │   └── EguideContentManager.tsx
│   └── pages/
│       └── EguideViewer.tsx
└── utils/
    └── storage/
        └── uploadPdf.js
```

## Testing Checklist
- [ ] Firebase Storage rules updated
- [ ] E-Guide Resource Tab created
- [ ] PDF upload works in admin panel
- [ ] E-Guide appears in sidebar
- [ ] Users can view E-Guides
- [ ] PDF viewer works correctly
- [ ] Download functionality works
- [ ] Edit/Delete works in admin panel

## Troubleshooting

### Upload Fails:
- Check Firebase Storage rules
- Verify user is authenticated
- Check file size (max 20MB)
- Ensure file is PDF format

### PDF Not Displaying:
- Check if PDF URL is valid
- Verify Firebase Storage permissions
- Check browser console for errors

### Admin Panel Not Showing:
- Verify E-Guide tab is created in Resource Tabs
- Check if tab name matches "E-Guide" (case-insensitive)
- Ensure user has admin permissions

## Support
If you encounter any issues, check:
1. Firebase Console for errors
2. Browser Developer Tools console
3. Network tab for failed requests
4. Firebase Storage rules are correctly applied
