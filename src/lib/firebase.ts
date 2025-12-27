// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCNguBRII73BrwxMJrr6kzpSzKIP0Blj5I",
    authDomain: "campusshare-4e1a4.firebaseapp.com",
    projectId: "campusshare-4e1a4",
    storageBucket: "campusshare-4e1a4.firebasestorage.app",
    messagingSenderId: "730313288228",
    appId: "1:730313288228:web:20dcb15342bab2a18c06b1"
};

// Initialize Firebase
import { getStorage } from "firebase/storage";

// ... existing code ...

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
