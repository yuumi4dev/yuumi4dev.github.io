// Firebase configuration
// Replace these values with your own Firebase project config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Configure Firestore
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable offline persistence when supported
if (navigator.onLine) {
    db.enablePersistence({synchronizeTabs: true})
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time
                console.warn('Firestore persistence failed to enable: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
                // The current browser does not support all of the features required to enable persistence
                console.warn('Firestore persistence not supported in this browser');
            }
        });
}

// Set language for Firebase Auth
auth.languageCode = 'en';

// Enable Firestore logging in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    db.settings({
        ignoreUndefinedProperties: true,
    });
    
    console.log('Firebase initialized in development mode');
}