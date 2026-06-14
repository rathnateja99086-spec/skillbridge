import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, apiCall } = useAuth();
  const [resumeHistory, setResumeHistory] = useState([]);
  const [skillHistory, setSkillHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [r, s, c] = await Promise.all([
          apiCall('/api/analyze/history').then(res => res.json()),
          apiCall('/api/skillgap/history').then(res => res.json()),
          apiCall('/api/chat/history').then(res => res.json()),
        ]);
        setResumeHistory(Array.isArray(r) ? r : []);
        setSkillHistory(Array.isArray(s) ? s : []);
        setChatHistory(Array.isArray(c) ? c : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const gradeColor = (g) => {
    if (!g) return '#6B7280';
    if (g.startsWith('A')) return '#059669';
    if (g.startsWith('B')) return '#2563EB';
    if (g.startsWith('C')) return '#D97706';
    return '#DC2626';
  };

  const features = [
    { path: '/resume-scorer', icon: 'ti-file-text', label: 'Resume Scorer', desc: 'Upload your resume and get an AI-powered score with pros & cons', color: '#2563EB', bg: '#EFF6FF' },
    { path: '/skill-gap', icon: 'ti-chart-radar', label: 'Skill Gap Analyser', desc: 'Find exactly what skills you need for your target role', color: '#7C3AED', bg: '#F5F3FF' },
    { path: '/chatbot', icon: 'ti-message-circle', label: 'ResumeBot', desc: 'Chat with an AI career coach to fix your resume weaknesses', color: '#059669', bg: '#ECFDF5' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8' }}>
      <Navbar />
      <div className="page-wrap">

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="page-sub">Here's your career progress overview</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Resume Analyses', value: resumeHistory.length, icon: 'ti-file-text', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Skill Gap Reports', value: skillHistory.length, icon: 'ti-chart-radar', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Chat Sessions', value: chatHistory.length, icon: 'ti-message-circle', color: '#059669', bg: '#ECFDF5' },
            { label: 'Latest Score', value: resumeHistory[0]?.score ? `${resumeHistory[0].score}/100` : '—', icon: 'ti-star', color: '#D97706', bg: '#FFFBEB' },
          ].map(s => (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{loading ? '—' : s.value}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Quick access</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {features.map(f => (
              <Link key={f.path} to={f.path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.15s', borderLeft: `4px solid ${f.color}` }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <i className={`ti ${f.icon}`} style={{ fontSize: 18, color: f.color }}></i>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* History sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

          {/* Resume history */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-file-text" style={{ color: '#2563EB' }}></i> Resume Score History
            </h3>
            {loading ? <div className="spinner" style={{ width: 28, height: 28, margin: '12px auto' }}></div>
              : resumeHistory.length === 0
              ? <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>No analyses yet. <Link to="/resume-scorer" style={{ color: '#2563EB' }}>Score your resume →</Link></p>
              : resumeHistory.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: gradeColor(r.grade), flexShrink: 0 }}>{r.grade}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fileName || 'Resume'}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: gradeColor(r.grade) }}>{r.score}/100</div>
                </div>
              ))
            }
          </div>

          {/* Skill gap history */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-chart-radar" style={{ color: '#7C3AED' }}></i> Skill Gap History
            </h3>
            {loading ? <div className="spinner" style={{ width: 28, height: 28, margin: '12px auto' }}></div>
              : skillHistory.length === 0
              ? <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>No analyses yet. <Link to="/skill-gap" style={{ color: '#7C3AED' }}>Analyse skill gap →</Link></p>
              : skillHistory.slice(0, 5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7C3AED', flexShrink: 0 }}>{s.readiness_pct || 0}%</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.role}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(s.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Chat history */}
        {chatHistory.length > 0 && (
          <div className="card" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-message-circle" style={{ color: '#059669' }}></i> Recent Chat Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatHistory.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {c.mode === 'coach' ? '🎯' : c.mode === 'skills' ? '📊' : '💡'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', textTransform: 'capitalize' }}>{c.mode || 'coach'} session</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.messages?.length || 0} messages · {new Date(c.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <Link to="/chatbot" style={{ fontSize: 12, color: '#059669', textDecoration: 'none', fontWeight: 500 }}>Continue →</Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
