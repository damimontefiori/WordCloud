// Diagnostic script for Google Auth issues
// Run this in browser console on production site

console.log('=== Google Auth Diagnostic ===');
console.log('Current URL:', window.location.href);
console.log('Current Origin:', window.location.origin);
console.log('Current Domain:', window.location.hostname);

// Check if Firebase is loaded
if (typeof firebase !== 'undefined') {
  console.log('Firebase SDK loaded: ✅');
  
  if (firebase.auth) {
    console.log('Firebase Auth loaded: ✅');
    const auth = firebase.auth();
    console.log('Auth Domain:', auth.app.options.authDomain);
    console.log('Project ID:', auth.app.options.projectId);
  } else {
    console.log('Firebase Auth NOT loaded: ❌');
  }
} else {
  console.log('Firebase SDK NOT loaded: ❌');
}

// Check if Google Auth Provider is available
try {
  const provider = new firebase.auth.GoogleAuthProvider();
  console.log('Google Auth Provider created: ✅');
} catch (error) {
  console.log('Google Auth Provider creation failed: ❌', error);
}

// Environment check
console.log('Environment variables:');
console.log('- API Key available:', !!import.meta?.env?.VITE_FIREBASE_API_KEY || 'Unknown');
console.log('- Auth Domain:', import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || 'Unknown');
console.log('- Project ID:', import.meta?.env?.VITE_FIREBASE_PROJECT_ID || 'Unknown');

console.log('=== End Diagnostic ===');
