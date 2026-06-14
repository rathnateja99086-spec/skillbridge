import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function ResumeScorer() {
  const { apiCall } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progLabel, setProgLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scoreAnim, setScoreAnim] = useState(0);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(pdf|txt)$/i)) { setError('Please upload a PDF or TXT file.'); return; }
    setFile(f); setError(''); setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true); setError(''); setResult(null);
    const steps = [
      [20, 'Reading your resume…'],
      [50, 'Sending to AI for analysis…'],
      [80, 'Processing feedback…'],
      [100, 'Done!']
    ];
    let si = 0;
    const tick = setInterval(() => {
      if (si < steps.length) { setProgress(steps[si][0]); setProgLabel(steps[si][1]); si++; }
      else clearInterval(tick);
    }, 900);

    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await apiCall('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      clearInterval(tick);
      if (data.error) throw new Error(data.error);
      setResult(data);
      // Animate score
      let cur = 0;
      const step = data.score / 60;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, data.score);
        setScoreAnim(Math.round(cur));
        if (cur >= data.score) clearInterval(timer);
      }, 16);
    } catch (err) {
      clearInterval(tick);
      setError(err.message || 'Analysis failed. Please try again.');
    }
    setAnalyzing(false);
  };

  const scoreColor = (s) => s >= 80 ? '#059669' : s >= 65 ? '#2563EB' : s >= 50 ? '#D97706' : '#DC2626';
  const gradeColor = (g) => {
    if (!g) return '#6B7280';
    if (g.startsWith('A')) return '#059669';
    if (g.startsWith('B')) return '#2563EB';
    if (g.startsWith('C')) return '#D97706';
    return '#DC2626';
  };

  const sectionColors = ['#2563EB','#7C3AED','#059669','#D97706','#DC2626','#0891B2'];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8' }}>
      <Navbar />
      <div className="page-wrap">
        <h1 className="page-title"><i className="ti ti-file-text" style={{ color: '#2563EB', verticalAlign: '-2px', marginRight: 8 }}></i>Resume Scorer</h1>
        <p className="page-sub">Upload your resume and get an instant AI-powered score with detailed feedback</p>

        {!result && (
          <>
            {/* Upload zone */}
            <div
              className="card"
              onClick={() => !analyzing && fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#2563EB'; }}
              onDragLeave={e => e.currentTarget.style.borderColor='#E5E7EB'}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor='#E5E7EB'; handleFile(e.dataTransfer.files[0]); }}
              style={{ textAlign: 'center', padding: '48px 24px', cursor: analyzing ? 'default' : 'pointer', border: '2px dashed #BFDBFE', background: file ? '#EFF6FF' : '#fff', marginBottom: 16, transition: 'all 0.2s' }}
            >
              <i className={`ti ${file ? 'ti-file-check' : 'ti-file-upload'}`} style={{ fontSize: 40, color: '#2563EB', display: 'block', marginBottom: 12 }}></i>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                {file ? file.name : 'Drop your resume here'}
              </h2>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                {file ? `${(file.size / 1024).toFixed(0)} KB · Click to change` : 'Supports PDF and TXT files'}
              </p>
              {!file && (
                <div className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
                  <i className="ti ti-upload"></i> Browse file
                </div>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991B1B', display: 'flex', gap: 8, alignItems: 'center' }}>
                <i className="ti ti-alert-circle"></i> {error}
              </div>
            )}

            {/* Analyze button */}
            {file && !analyzing && (
              <button onClick={analyze} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginBottom: 16 }}>
                <i className="ti ti-scan"></i> Analyze My Resume
              </button>
            )}

            {/* Progress */}
            {analyzing && (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <div className="spinner" style={{ marginBottom: 16 }}></div>
                <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Analyzing your resume…</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>{progLabel}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
              </div>
            )}
          </>
        )}

        {/* RESULTS */}
        {result && (
          <>
            {/* Score Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 18 }}>
              {/* Circle */}
              <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={scoreColor(result.score)} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (scoreAnim / 100) * 314}
                    style={{ transition: 'stroke-dashoffset 0.05s' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{scoreAnim}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>/ 100</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{result.title}</h2>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12 }}>{result.verdict}</p>
                <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: gradeColor(result.grade) + '20', color: gradeColor(result.grade), border: `1px solid ${gradeColor(result.grade)}40` }}>
                  Grade: {result.grade}
                </span>
              </div>
            </div>

            {/* Section Scores */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-list-check" style={{ color: '#2563EB' }}></i> Section Breakdown
              </h3>
              {Object.entries(result.sections || {}).map(([name, val], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#4B5563', width: 130, flexShrink: 0 }}>{name}</span>
                  <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: sectionColors[i % sectionColors.length], borderRadius: 4, transition: 'width 1s ease' }}></div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', width: 32, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#065F46', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <i className="ti ti-thumb-up"></i> Strengths
                </h3>
                {(result.pros || []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                      <i className="ti ti-check"></i>
                    </div>
                    <span style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <i className="ti ti-thumb-down"></i> Areas to Improve
                </h3>
                {(result.cons || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                      <i className="ti ti-x"></i>
                    </div>
                    <span style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-bulb" style={{ color: '#D97706' }}></i> Top Recommendations
              </h3>
              {(result.suggestions || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: i < result.suggestions.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link to="/chatbot" className="btn btn-primary"><i className="ti ti-message-circle"></i> Chat with ResumeBot</Link>
              <Link to="/skill-gap" className="btn btn-secondary" style={{ border: '1px solid #E5E7EB' }}><i className="ti ti-chart-radar"></i> Analyse Skill Gap</Link>
              <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); setScoreAnim(0); }} style={{ border: '1px solid #E5E7EB' }}>
                <i className="ti ti-refresh"></i> Analyse Another
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
