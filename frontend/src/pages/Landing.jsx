import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Landing() {
  const [tab, setTab] = useState('login'); // login | signup | phone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      if (tab === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); clearError();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
    setLoading(false);
  };

  const sendOTP = async () => {
    if (!phone.startsWith('+')) { setError('Enter phone with country code e.g. +91XXXXXXXXXX'); return; }
    setLoading(true); clearError();
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmResult(result);
      setOtpSent(true);
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true); clearError();
    try {
      await confirmResult.confirm(otp);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const getFriendlyError = (code) => {
    const map = {
      'auth/email-already-in-use': 'This email is already registered. Try logging in.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)', display: 'flex', flexDirection: 'column' }}>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '48px 16px 32px' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🌉</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1E3A8A', marginBottom: 10 }}>Skill Bridge</h1>
        <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto 20px' }}>
          AI-powered resume analysis, skill gap detection, and career coaching — all in one place for students.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {['📄 Resume Scoring', '📊 Skill Gap Analysis', '🤖 AI Career Coach', '📈 Track Progress'].map(f => (
            <span key={f} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 20, padding: 