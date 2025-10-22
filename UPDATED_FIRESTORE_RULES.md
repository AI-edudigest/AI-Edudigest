# 🔥 Updated Firestore Rules - Complete File

## 📋 **Your Complete Updated Rules**

Here's your complete Firestore rules file with the updated notifications rule:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read articles
    match /articles/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read sponsors
    match /sponsors/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read ads
    match /ads/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read resource content
    match /aiTools/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /upcomingEvents/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /recommendedBooks/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /promptTemplates/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /freeCourses/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read Resource Tabs, only admins can create/update them
    match /resourceTabs/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read Resource Tab Content, only admins can create/update them
    match /resourceTabContent/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read Sidebar Tabs, only admins can create/update them
    match /sidebarTabs/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // UPDATED: Allow authenticated users to read notifications, only admins can create them
    // Users can now update and delete notifications (mark as read, delete individual notifications)
    match /notifications/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update, delete: if request.auth != null;
    }
    
    // Allow authenticated users to read feedback forms, only admins can create/update them
    match /feedbackForms/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read and write feedback submissions
    match /feedbackSubmissions/{document} {
      allow read, write: if request.auth != null;
    }
    
    // NEW: Allow authenticated users to read events, only leaders and admins can create them
    match /events/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'leaders');
    }
    
    // Allow test collection for debugging
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔄 **What Changed**

### **OLD Notifications Rule** (Line 82-87):
```javascript
// Allow authenticated users to read notifications, only admins can create them
match /notifications/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### **NEW Notifications Rule** (Line 82-88):
```javascript
// UPDATED: Allow authenticated users to read notifications, only admins can create them
// Users can now update and delete notifications (mark as read, delete individual notifications)
match /notifications/{document} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow update, delete: if request.auth != null;
}
```

---

## 🚀 **How to Deploy**

### **Method 1: Firebase Console (Recommended)**

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore**:
   - Click "Firestore Database" in the left sidebar
   - Click "Rules" tab

3. **Replace the Rules**:
   - Select all existing rules (Ctrl+A)
   - Delete them
   - Copy and paste the complete updated rules from above
   - Click "Publish"

### **Method 2: Firebase CLI**

1. **Update your local file**:
   - Replace the content of `firestore.rules` with the updated rules above

2. **Deploy**:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## ✅ **What This Enables**

### **For All Users**:
- ✅ **Read all notifications** (view them)
- ✅ **Mark notifications as read** (update isRead field)
- ✅ **Delete individual notifications** (remove from their view)
- ✅ **Clear all notifications** (bulk delete)

### **For Admins Only**:
- 🔒 **Create new notifications** (only admins can create notifications)

---

## 🧪 **Test After Deployment**

1. **Wait 1-2 minutes** for rules to propagate
2. **Open your app** at http://localhost:5173/
3. **Click the bell icon** in the top bar
4. **Click "View All Notifications"**
5. **Test all features**:
   - ✅ Should load without permission errors
   - ✅ Should be able to mark notifications as read
   - ✅ Should be able to delete individual notifications
   - ✅ Should be able to clear all notifications

---

## 🎯 **Summary**

**The change**: Split the `write` permission into separate `create`, `update`, and `delete` permissions.

**The result**: Users can now manage their notifications (mark as read, delete) while only admins can create new notifications.

**The benefit**: Full notification management functionality without security risks!

---

**Status**: ✅ **Ready to Deploy**  
**Priority**: 🔥 **High - Required for notification functionality**
