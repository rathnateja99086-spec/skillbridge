import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlgrp_sPf_Y6AMd-Mtu-DonSBGxOt_MnM",
  authDomain: "skillbuild-45db0.firebaseapp.com",
  projectId: "skillbuild-45db0",
  storageBucket: "skillbuild-45db0.firebasestorage.app",
  messagingSenderId: "761900676828",
  appId: "1:761900676828:web:e5267d4a16fb453f9b2619",
  measurementId: "G-50TL9DZQ9J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);
export default app;
