# Google Auth Configuration Fix

## Problem
Google Authentication works in localhost but fails in production with "Error al iniciar sesión con Google"

## Common Causes & Solutions

### 1. Unauthorized Domain Error
**Most Common Issue**: Production domain not authorized in Firebase Console

#### Steps to Fix:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wordcloudlive`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your production domain(s):
   - If using Netlify: `your-app-name.netlify.app`
   - If using custom domain: `your-custom-domain.com`
   - Add both `www` and non-`www` versions if applicable

### 2. OAuth Configuration
1. Go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Verify the configuration:
   - Web SDK configuration should show your domains
   - Public-facing name should be set
   - Support email should be configured

### 3. Google Cloud Console
Sometimes you need to also configure in Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 client ID
5. Add authorized domains in **Authorized JavaScript origins**

## Testing
After configuration changes:
1. Deploy the updated code
2. Test Google Auth in production
3. Check browser console for specific error codes

## Debugging Commands
Use these in production to debug:
```javascript
// In browser console
console.log('Current domain:', window.location.origin)
console.log('Firebase auth domain:', firebase.auth().app.options.authDomain)
```
