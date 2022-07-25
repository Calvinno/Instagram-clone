// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyDjiMs9lY_7p6PnkiuGSJU7Is6gtWoAju0",
    authDomain: "instagram-dev-9856f.firebaseapp.com",
    projectId: "instagram-dev-9856f",
    storageBucket: "instagram-dev-9856f.appspot.com",
    messagingSenderId: "229104294981",
    appId: "1:229104294981:web:7963b161017b3861bd572c",
  }; 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth(app);

export {auth, db, storage}
