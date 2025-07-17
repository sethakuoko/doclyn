# Frontend Changes for Database Integration

This document outlines the changes made to the React Native frontend to integrate with the Spring Boot backend.

## New Files Created

### 1. `utils/storage.ts`
Handles AsyncStorage operations for user session management:
- `saveUserSession()` - Saves user data and login status
- `getUserSession()` - Retrieves stored user data
- `clearUserSession()` - Clears user session data
- `checkLoginStatus()` - Checks if user is logged in
- `logout()` - Logs out user and navigates to login screen

### 2. `utils/api.ts`
Handles API communication with the Spring Boot backend:
- `ApiService.loginUser()` - Sends login data to backend
- `ApiService.healthCheck()` - Health check endpoint
- Proper error handling and type definitions

## Modified Files

### 1. `app/_layout.tsx`
- Added startup navigation logic
- Checks login status on app startup
- Automatically navigates to HomeScreen if user is logged in
- Navigates to index screen if user is not logged in

### 2. `app/index.tsx`
- Updated `sendLoginInfoToBackend()` function to:
  - Send actual HTTP requests to Spring Boot backend
  - Save user session to AsyncStorage on successful login
  - Navigate to HomeScreen only after successful backend response
  - Show appropriate success/error messages
- Removed Clerk dependency from login flow (only used for authentication)

## Key Features Implemented

### 1. Persistent Login
- User session is saved locally using AsyncStorage
- App remembers login status across app restarts
- Automatic navigation based on login status

### 2. Backend Integration
- Sends user ID, email, and full name to Spring Boot backend
- Handles backend responses (success/error)
- Proper error handling for network issues

### 3. Session Management
- Stores user data locally (ID, email, full name)
- Boolean flag for login status
- Easy logout functionality

## API Configuration

The backend URL is configured in `utils/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Note:** For production, this should be updated to your actual backend URL.

## Usage

### Login Flow
1. User signs in with Apple/Google/Facebook (via Clerk)
2. User data is sent to Spring Boot backend
3. On successful response, user session is saved locally
4. User is navigated to HomeScreen

### App Startup
1. App checks AsyncStorage for login status
2. If logged in: Navigate to HomeScreen
3. If not logged in: Navigate to index screen

### Logout
```typescript
import { logout } from '../utils/storage';

// In your logout button handler
await logout(router);
```

## Dependencies Used

- `@react-native-async-storage/async-storage` - Local storage
- Built-in `fetch` API - HTTP requests
- `react-native-toast-message` - User notifications

## Testing

1. Start the Spring Boot backend (`mvn spring-boot:run`)
2. Ensure MySQL is running with the correct database
3. Test login flow with any authentication method
4. Restart the app to verify persistent login
5. Test logout functionality 