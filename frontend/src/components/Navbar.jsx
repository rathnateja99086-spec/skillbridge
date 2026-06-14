import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { path: '/resume-scorer', label: 'Resume Scorer', icon: 'ti-file-text' },
    { path: '/skill-gap', label: 'Skill Gap', icon: 'ti-chart-radar' },
    { path: '/chatbot', label: 'ResumeBot', icon: 'ti-message-circle' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
        <span style={{ fontSize: 22 }}>🌉</span>
        <span style={{ fontSize: 17, fontWeight: 800, color: '#2563EB' }}>Skill Bridge</span>
      </Link>

      {/* Nav links desktop */}
      <div style={{ display: 'flex', gap: 4, flex: 1 }} className="nav-links-desktop">
        {navLinks.map(link => (
          <Link key={link.path} to={link.path} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
            fontSize: 13, fontWeight: 500,
            color: location.pathname === link.path ? '#2563EB' : '#6B7280',
            background: location.pathname === link.path ? '#EFF6FF' : 'transparent',
            transition: 'all 0.15s'
          }}>
            <i className={`ti ${link.icon}`} style={{ fontSize: 15 }}></i>
            {link.label}
          </Link>
        ))}
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#EFF6FF', border: '2px solid #BFDBFE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#2563EB', overflow: 'hidden'
        }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()
          }
        </div>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.displayName || user?.email?.split('@')[0]}
        </span>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
          background: 'white', color: '#6B7280', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.15s'
        }}>
          <i className="ti ti-logout" style={{ fontSize: 14 }}></i> Logout
        </button>
      </div>
    </nav>
  );
}
