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
            <span key={f} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 500 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Auth Card */}
      <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', padding: '0 16px 48px' }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(37,99,235,0.08)', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            {[['login','Login'],['signup','Sign Up'],['phone','Phone']].map(([key, label]) => (
              <button key={key} onClick={() => { setTab(key); clearError(); }} style={{
                flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif',
                background: tab === key ? '#fff' : '#F9FAFB',
                color: tab === key ? '#2563EB' : '#6B7280',
                borderBottom: tab === key ? '2px solid #2563EB' : '2px solid transparent',
                transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-alert-circle"></i> {error}
              </div>
            )}

            {/* Email/Password */}
            {(tab === 'login' || tab === 'signup') && (
              <form onSubmit={handleEmailAuth}>
                {tab === 'signup' && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Full Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
                      onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                    />
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
                    onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
                    onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15 }}>
                  {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> : (tab === 'login' ? 'Login' : 'Create Account')}
                </button>
              </form>
            )}

            {/* Phone Auth */}
            {tab === 'phone' && (
              <div>
                {!otpSent ? (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Phone Number</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }}
                        onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                      />
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Include country code e.g. +91 for India</p>
                    </div>
                    <div id="recaptcha-container"></div>
                    <button onClick={sendOTP} disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                      {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> : 'Send OTP'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>OTP sent to <strong>{phone}</strong></p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Enter OTP</label>
                      <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 20, letterSpacing: 8, outline: 'none', fontFamily: 'monospace', textAlign: 'center' }}
                        onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                      />
                    </div>
                    <button onClick={verifyOTP} disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                      {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }}></span> : 'Verify OTP'}
                    </button>
                    <button onClick={() => setOtpSent(false)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#2563EB', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      ← Change number
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Divider */}
            {tab !== 'phone' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}></div>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}></div>
                </div>
                <button onClick={handleGoogle} disabled={loading} style={{
                  width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 500,
                  fontFamily: 'Inter,sans-serif', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
