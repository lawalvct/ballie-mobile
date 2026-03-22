# Profile Mobile API Guide

> Complete REST API reference for the **User Profile** module. Designed for React Native / mobile developers integrating with the Ballie multi-tenant SaaS platform.

---

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Response Format](#response-format)
3. [Endpoints Overview](#endpoints-overview)
4. [Endpoint Details](#endpoint-details)
   - [Get Profile](#1-get-profile)
   - [Update Profile](#2-update-profile)
   - [Change Password](#3-change-password)
   - [Remove Avatar](#4-remove-avatar)
   - [Resend Verification Code](#5-resend-verification-code)
   - [Verify Email](#6-verify-email)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [Recommended Mobile Screens](#recommended-mobile-screens)
7. [Error Handling](#error-handling)
8. [Implementation Notes](#implementation-notes)

---

## Base URL & Authentication

```
Base URL: {APP_URL}/api/v1/tenant/{tenant_slug}
```

All profile endpoints require authentication via **Bearer Token** (Laravel Sanctum):

```
Authorization: Bearer {token}
```

---

## Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

---

## Endpoints Overview

| # | Method   | Endpoint                       | Description                     |
|---|----------|--------------------------------|---------------------------------|
| 1 | `GET`    | `/profile`                     | Get authenticated user profile  |
| 2 | `PUT`    | `/profile`                     | Update profile information      |
| 3 | `POST`   | `/profile/change-password`     | Change password                 |
| 4 | `DELETE` | `/profile/avatar`              | Remove avatar                   |
| 5 | `POST`   | `/profile/verification/resend` | Resend email verification code  |
| 6 | `POST`   | `/profile/verification/verify` | Verify email with 4-digit code  |

---

## Endpoint Details

### 1. Get Profile

Retrieve the authenticated user's profile along with tenant information.

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/profile
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "avatar": "http://localhost:8000/storage/avatars/abc123.jpg",
      "avatar_url": "http://localhost:8000/storage/avatars/abc123.jpg",
      "role": "admin",
      "is_active": true,
      "email_verified": true,
      "onboarding_completed": true,
      "tour_completed": false,
      "last_login_at": "2025-01-15T10:30:00+00:00",
      "created_at": "2024-12-01T08:00:00+00:00",
      "updated_at": "2025-01-15T10:30:00+00:00"
    },
    "tenant": {
      "id": 1,
      "name": "Acme Corp",
      "slug": "acme-corp",
      "logo": "logos/acme.png",
      "subscription_status": "active"
    }
  }
}
```

> **Note:** When the user has no avatar, the `avatar` field returns `null` and `avatar_url` returns a generated placeholder (ui-avatars.com fallback).

---

### 2. Update Profile

Update the authenticated user's profile. Supports partial updates — only send the fields you want to change.

**Request:**
```
PUT /api/v1/tenant/{tenant_slug}/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

> **Important:** Use `multipart/form-data` when uploading an avatar. For text-only updates, `application/json` also works (with `_method: PUT` or the `X-HTTP-Method-Override: PUT` header if using POST).

**Parameters:**

| Field    | Type   | Rules                                | Description                |
|----------|--------|--------------------------------------|----------------------------|
| `name`   | string | optional, max 255                    | User's full name           |
| `email`  | string | optional, valid email, unique        | User's email address       |
| `phone`  | string | optional, max 20                     | User's phone number        |
| `avatar` | file   | optional, image (jpeg,png,jpg,gif), max 2MB | Profile photo     |

**Sample Payload (JSON):**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+2348098765432"
}
```

**Sample Payload (FormData for avatar upload):**
```javascript
const formData = new FormData();
formData.append('name', 'John Smith');
formData.append('avatar', {
  uri: 'file:///path/to/photo.jpg',
  type: 'image/jpeg',
  name: 'avatar.jpg',
});
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+2348098765432",
      "avatar": "http://localhost:8000/storage/avatars/new_abc456.jpg",
      "avatar_url": "http://localhost:8000/storage/avatars/new_abc456.jpg",
      "role": "admin",
      "is_active": true,
      "email_verified": false,
      "onboarding_completed": true,
      "tour_completed": false,
      "last_login_at": "2025-01-15T10:30:00+00:00",
      "created_at": "2024-12-01T08:00:00+00:00",
      "updated_at": "2025-01-15T14:00:00+00:00"
    }
  }
}
```

> **Important:** When the email is changed, `email_verified` resets to `false` and the user must re-verify using the verification endpoints below.

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "email": ["The email has already been taken."],
    "avatar": ["The avatar must be an image.", "The avatar must not be greater than 2048 kilobytes."]
  }
}
```

---

### 3. Change Password

Change the authenticated user's password.

**Request:**
```
POST /api/v1/tenant/{tenant_slug}/profile/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field                  | Type   | Rules                                           | Description            |
|------------------------|--------|-------------------------------------------------|------------------------|
| `current_password`     | string | required                                        | Current password       |
| `password`             | string | required, min 8, mixed case, numbers, confirmed | New password           |
| `password_confirmation`| string | required (implied by `confirmed` rule)           | Must match `password`  |

**Sample Payload:**
```json
{
  "current_password": "OldPassword1",
  "password": "NewPassword2",
  "password_confirmation": "NewPassword2"
}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Error — Wrong Current Password (422):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "errors": {}
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "password": [
      "The password must be at least 8 characters.",
      "The password must contain at least one uppercase and one lowercase letter.",
      "The password must contain at least one number.",
      "The password confirmation does not match."
    ]
  }
}
```

---

### 4. Remove Avatar

Delete the authenticated user's profile photo.

**Request:**
```
DELETE /api/v1/tenant/{tenant_slug}/profile/avatar
Authorization: Bearer {token}
```

**No body required.**

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Avatar removed successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "avatar": null,
      "avatar_url": "https://ui-avatars.com/api/?name=John+Smith&color=7F9CF5&background=EBF4FF",
      "role": "admin",
      "is_active": true,
      "email_verified": true,
      "onboarding_completed": true,
      "tour_completed": false,
      "last_login_at": "2025-01-15T10:30:00+00:00",
      "created_at": "2024-12-01T08:00:00+00:00",
      "updated_at": "2025-01-15T14:05:00+00:00"
    }
  }
}
```

---

### 5. Resend Verification Code

Request a new 4-digit email verification code. The code expires after 60 minutes.

**Request:**
```
POST /api/v1/tenant/{tenant_slug}/profile/verification/resend
Authorization: Bearer {token}
```

**No body required.**

**Sample Response (200) — Code Sent:**
```json
{
  "success": true,
  "message": "Verification code sent to john@example.com. Please check your inbox or spam folder.",
  "data": null
}
```

**Sample Response (200) — Already Verified:**
```json
{
  "success": true,
  "message": "Your email is already verified.",
  "data": null
}
```

---

### 6. Verify Email

Submit the 4-digit verification code received via email.

**Request:**
```
POST /api/v1/tenant/{tenant_slug}/profile/verification/verify
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field  | Type   | Rules              | Description                   |
|--------|--------|--------------------|-------------------------------|
| `code` | string | required, 4 digits | 4-digit verification code     |

**Sample Payload:**
```json
{
  "code": "4821"
}
```

**Sample Response (200) — Success:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "avatar": "http://localhost:8000/storage/avatars/abc123.jpg",
      "avatar_url": "http://localhost:8000/storage/avatars/abc123.jpg",
      "role": "admin",
      "is_active": true,
      "email_verified": true,
      "onboarding_completed": true,
      "tour_completed": false,
      "last_login_at": "2025-01-15T10:30:00+00:00",
      "created_at": "2024-12-01T08:00:00+00:00",
      "updated_at": "2025-01-15T14:10:00+00:00"
    }
  }
}
```

**Sample Response (200) — Already Verified:**
```json
{
  "success": true,
  "message": "Your email is already verified.",
  "data": null
}
```

**Error — Invalid/Expired Code (422):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code.",
  "errors": {}
}
```

---

## TypeScript Interfaces

```typescript
// ─── API Response Wrapper ────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

// ─── User ────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;        // Full URL to stored image, or null
  avatar_url: string;           // Always present: stored image URL or ui-avatars fallback
  role: string;
  is_active: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  tour_completed: boolean;
  last_login_at: string | null; // ISO 8601
  created_at: string;           // ISO 8601
  updated_at: string;           // ISO 8601
}

// ─── Tenant (from profile endpoint) ─────────────────────────
interface Tenant {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  subscription_status: string;
}

// ─── Response Types ──────────────────────────────────────────
type GetProfileResponse = ApiResponse<{
  user: User;
  tenant: Tenant;
}>;

type UpdateProfileResponse = ApiResponse<{
  user: User;
}>;

type ChangePasswordResponse = ApiResponse<null>;

type RemoveAvatarResponse = ApiResponse<{
  user: User;
}>;

type ResendVerificationResponse = ApiResponse<null>;

type VerifyEmailResponse = ApiResponse<{
  user: User;
} | null>;

// ─── Request Payloads ────────────────────────────────────────
interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: File;  // React Native: { uri, type, name }
}

interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface VerifyEmailPayload {
  code: string;  // 4-digit code
}
```

---

## Recommended Mobile Screens

### 1. Profile Screen
- **Endpoint:** `GET /profile`
- **Features:**
  - Display avatar (use `avatar_url` for guaranteed image)
  - Show name, email, phone, role
  - Email verification badge/warning if `email_verified === false`
  - Edit button → navigates to Edit Profile screen
  - Change Password button → navigates to Change Password screen

### 2. Edit Profile Screen
- **Endpoints:** `PUT /profile`, `DELETE /profile/avatar`
- **Features:**
  - Avatar picker (camera / gallery) with upload via FormData
  - Remove avatar button (visible only when `avatar !== null`)
  - Name, email, phone text fields
  - Warning: "Changing your email will require re-verification"
  - Save button → calls `PUT /profile`

### 3. Change Password Screen
- **Endpoint:** `POST /profile/change-password`
- **Features:**
  - Current password field (with visibility toggle)
  - New password field (with strength indicator)
  - Confirm password field
  - Password requirements hint: "Min 8 chars, uppercase, lowercase, number"
  - Submit button

### 4. Email Verification Screen
- **Endpoints:** `POST /profile/verification/resend`, `POST /profile/verification/verify`
- **Features:**
  - Show this screen if `email_verified === false` after email change
  - 4-digit OTP input field
  - "Resend Code" button with 60-second cooldown timer
  - "Code sent to {email}" message
  - Auto-submit when all 4 digits are entered
  - On success, navigate back to Profile screen with updated data

---

## Error Handling

| HTTP Code | Meaning              | When                                          |
|-----------|----------------------|-----------------------------------------------|
| 200       | Success              | Operation completed successfully               |
| 401       | Unauthorized         | Missing or invalid Bearer token                |
| 404       | Not Found            | Tenant not found                               |
| 422       | Validation Error     | Invalid input, wrong password, expired code    |
| 500       | Server Error         | Unexpected server error                        |

### React Native Error Handling Example

```typescript
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: `${APP_URL}/api/v1/tenant/${tenantSlug}`,
  headers: { 'Accept': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired → redirect to login
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileApi = {
  getProfile: () =>
    api.get<GetProfileResponse>('/profile'),

  updateProfile: (data: UpdateProfilePayload) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.avatar) formData.append('avatar', data.avatar as any);
    formData.append('_method', 'PUT');
    return api.post<UpdateProfileResponse>('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data: ChangePasswordPayload) =>
    api.post<ChangePasswordResponse>('/profile/change-password', data),

  removeAvatar: () =>
    api.delete<RemoveAvatarResponse>('/profile/avatar'),

  resendVerification: () =>
    api.post<ResendVerificationResponse>('/profile/verification/resend'),

  verifyEmail: (code: string) =>
    api.post<VerifyEmailResponse>('/profile/verification/verify', { code }),
};
```

---

## Implementation Notes

1. **Avatar Display Priority:** Always use `avatar_url` for display — it returns the stored image URL when available, or a generated placeholder (ui-avatars.com) when no avatar is set.

2. **Email Change Flow:**
   - User updates email via `PUT /profile`
   - `email_verified` resets to `false`
   - App should detect this and prompt for verification
   - Call `POST /profile/verification/resend` to send code
   - User enters 4-digit code → `POST /profile/verification/verify`

3. **Avatar Upload via React Native:**
   - Use `multipart/form-data` with `_method: PUT` (POST method override)
   - Avatar object format: `{ uri: 'file://...', type: 'image/jpeg', name: 'avatar.jpg' }`
   - Max file size: 2MB
   - Accepted formats: JPEG, PNG, JPG, GIF

4. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - Must be confirmed (password + password_confirmation)

5. **Verification Code:**
   - 4-digit numeric code
   - Expires after 60 minutes
   - Previous codes are invalidated when a new one is requested
   - Sent via email using `WelcomeNotification`

6. **Old Avatar Cleanup:** When uploading a new avatar, the old file is automatically deleted from storage. Same applies when removing avatar via `DELETE /profile/avatar`.
