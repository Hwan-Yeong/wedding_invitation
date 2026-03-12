// Firebase Configuration
// To enable real-time data persistence across devices:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Add a Web App to your project.
// 3. Create a Cloud Firestore database (start in test mode).
// 4. Copy the "firebaseConfig" object from your project settings and replace the placeholders below.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db = null;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("Firebase config is missing. Using LocalStorage fallback mode.");
    }
} catch (error) {
    console.error("Firebase initialization failed:", error);
}
