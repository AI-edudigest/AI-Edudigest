# Student App Integration Guide - verifyCollege API

## API Endpoint

**URL:** `https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege`

**Method:** `POST`

**Content-Type:** `application/json`

**Authentication:** Not required (public endpoint)

**CORS:** Enabled for all origins

---

## Request Format

```json
{
  "collegeId": "MS101"
}
```

### Request Parameters

- `collegeId` (string, required): The college ID to verify (e.g., "MS101", "SH201")

---

## Response Format

### Success Response (200 OK)

```json
{
  "valid": true,
  "collegeId": "MS101",
  "collegeName": "MS College"
}
```

### Error Responses (200 OK with valid: false)

**College Not Found:**
```json
{
  "valid": false,
  "reason": "NOT_FOUND"
}
```

**College Inactive:**
```json
{
  "valid": false,
  "reason": "INACTIVE"
}
```

**Plan Expired:**
```json
{
  "valid": false,
  "reason": "PLAN_EXPIRED"
}
```

### Bad Request (400)

```json
{
  "error": "Bad Request",
  "message": "collegeId is required and must be a non-empty string"
}
```

---

## Integration Example (JavaScript/TypeScript)

### Basic Integration

```typescript
// Function to verify college ID
async function verifyCollegeId(collegeId: string): Promise<{
  valid: boolean;
  collegeId?: string;
  collegeName?: string;
  reason?: string;
}> {
  try {
    const response = await fetch(
      'https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: collegeId.trim() }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying college ID:', error);
    return {
      valid: false,
      reason: 'NETWORK_ERROR',
    };
  }
}
```

### Student Signup Flow Integration

```typescript
// Example: Student signup with college ID validation
async function handleStudentSignup(
  email: string,
  password: string,
  collegeId: string,
  studentName: string
) {
  // Step 1: Verify college ID before creating account
  const verification = await verifyCollegeId(collegeId);

  if (!verification.valid) {
    let errorMessage = 'Invalid College ID.';
    
    switch (verification.reason) {
      case 'NOT_FOUND':
        errorMessage = 'College ID not found. Please check and try again.';
        break;
      case 'INACTIVE':
        errorMessage = 'This college is currently inactive. Please contact your college admin.';
        break;
      case 'PLAN_EXPIRED':
        errorMessage = 'This college\'s plan has expired. Please contact your college admin.';
        break;
      default:
        errorMessage = 'Unable to verify college at the moment. Please try again.';
    }
    
    throw new Error(errorMessage);
  }

  // Step 2: College is valid, proceed with student account creation
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create student profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      name: studentName,
      role: 'student',
      collegeId: verification.collegeId,
      collegeName: verification.collegeName,
      createdAt: new Date(),
      active: true,
    });

    return {
      success: true,
      userId: userCredential.user.uid,
    };
  } catch (error: any) {
    console.error('Error creating student account:', error);
    throw new Error('Failed to create account: ' + error.message);
  }
}
```

### React Component Example

```tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const StudentSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    collegeId: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyCollegeId = async (collegeId: string) => {
    const response = await fetch(
      'https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: collegeId.trim() }),
      }
    );

    if (!response.ok) {
      throw new Error('Network error');
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Verify College ID
      const verification = await verifyCollegeId(formData.collegeId);

      if (!verification.valid) {
        let message = 'Invalid College ID.';
        switch (verification.reason) {
          case 'NOT_FOUND':
            message = 'College ID not found. Please check and try again.';
            break;
          case 'INACTIVE':
            message = 'This college is currently inactive.';
            break;
          case 'PLAN_EXPIRED':
            message = 'This college\'s plan has expired.';
            break;
        }
        setError(message);
        setLoading(false);
        return;
      }

      // Step 2: Create student account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        name: formData.name,
        role: 'student',
        collegeId: verification.collegeId,
        collegeName: verification.collegeName,
        createdAt: new Date(),
        active: true,
      });

      // Success - redirect or show success message
      alert('Account created successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>College ID *</label>
        <input
          type="text"
          value={formData.collegeId}
          onChange={(e) =>
            setFormData({ ...formData, collegeId: e.target.value })
          }
          required
          placeholder="e.g., MS101"
        />
      </div>
      <div>
        <label>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>Password *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          minLength={6}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default StudentSignup;
```

---

## Error Handling

### Network Errors

If the API call fails due to network issues:

```typescript
try {
  const verification = await verifyCollegeId(collegeId);
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
  // Show user-friendly message
  alert('Unable to verify college at the moment. Please check your internet connection and try again.');
}
```

### Validation Errors

Always validate the `collegeId` format before calling the API:

```typescript
if (!collegeId || collegeId.trim().length === 0) {
  throw new Error('College ID is required');
}

if (collegeId.length > 10) {
  throw new Error('College ID is too long');
}
```

---

## Security Considerations

1. **Client-Side Validation**: Always validate on the client, but don't rely on it for security
2. **Server-Side Validation**: The API validates all inputs server-side
3. **Rate Limiting**: Consider implementing rate limiting in your Student App
4. **Error Messages**: Don't expose sensitive information in error messages

---

## Testing

### Test with Valid College ID

```bash
curl -X POST https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege \
  -H "Content-Type: application/json" \
  -d '{"collegeId":"MS101"}'
```

### Test with Invalid College ID

```bash
curl -X POST https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege \
  -H "Content-Type: application/json" \
  -d '{"collegeId":"INVALID123"}'
```

### Test with Missing College ID

```bash
curl -X POST https://us-central1-ai-edudigestapp.cloudfunctions.net/verifyCollege \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Student Count Sync Integration

After successfully creating a student account, you **must** notify the College App to update the student count:

```typescript
// After creating student in Project B Firestore
await setDoc(doc(db, 'users', userCredential.user.uid), {
  email: formData.email,
  name: formData.name,
  role: 'student',
  collegeId: verification.collegeId,
  collegeName: verification.collegeName,
  createdAt: new Date(),
  active: true
});

// ✅ REQUIRED: Notify College App to sync student count
try {
  const syncResponse = await fetch(
    'https://us-central1-ai-edudigestapp.cloudfunctions.net/syncStudentCount',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeId: verification.collegeId,
        action: 'created'
      })
    }
  );

  if (!syncResponse.ok) {
    console.warn('Failed to sync student count, but student account was created');
  }
} catch (error) {
  // Don't fail student creation if sync fails
  console.error('Error syncing student count:', error);
}
```

**Important:** This sync call ensures the salesman dashboard in College App shows the correct student count.

### Sync API Details

**Endpoint:** `https://us-central1-ai-edudigestapp.cloudfunctions.net/syncStudentCount`

**Method:** `POST`

**Request Body:**
```json
{
  "collegeId": "MS101",
  "action": "created"  // or "deleted" when student account is removed
}
```

**Response:**
```json
{
  "success": true,
  "studentCount": 5
}
```

---

## Support

For issues or questions:
- Check Firebase Console → Functions → verifyCollege for logs
- Verify the college exists in the College App (Project A)
- Ensure the college has `status: "active"` and valid `planEndDate`

---

## Notes

- The API is public and doesn't require authentication
- CORS is enabled for all origins
- The function queries Firestore by the `collegeId` field (not document ID)
- Only colleges with `status === "active"` and non-expired plans are considered valid
- **Student count sync is required** after creating/deleting student accounts

