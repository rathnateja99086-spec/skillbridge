import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PLATFORM_COLORS = {
  YouTube: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  freeCodeCamp: { bg: '#ECFDF5', color: '#059669', border: '#6EE7B7' },
  Coursera: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  Udemy: { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  Google: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  AWS: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
  Microsoft: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
};

const DIFF_COLORS = { Beginner: 'badge-green', Intermediate: 'badge-blue', Advanced: 'badge-red' };
const PRI_COLORS = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-blue' };

export default function SkillGap() {
  const { apiCall } = useAuth();
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progLabel, setProgLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(pdf|txt)$/i)) { setError('Please upload a PDF or TXT file.'); return; }
    setFile(f); setError('');
  };

  const canAnalyze = file && role.trim().length > 1 && !analyzing;

  const analyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true); setError(''); setResult(null);
    const steps = [[20,'Reading resume…'],[50,'Analysing skill gap with AI…'],[80,'Building your learning path…'],[100,'Done!']];
    let si = 0;
    const tick = setInterval(() => {
      if (si < steps.length) { setProgress(steps[si][0]); setProgLabel(steps[si][1]); si++; }
      else clearInterval(tick);
    }, 1000);

    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('role', role);
      const res = await apiCall('/api/skillgap', { method: 'POST', body: fd });
      const data = await res.json();
      clearInterval(tick);
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      clearInterval(tick);
      setError(err.message || 'Analysis failed. Please try again.');
    }
    setAnalyzing(false);
  };

  const radarData = result ? {
    labels: result.radar_categories?.map(c => c.category) || [],
    datasets: [
      {
        label: 'Your level',
        data: result.radar_categories?.map(c => c.current) || [],
        backgroundColor: 'rgba(37,99,235,0.15)',
        borderColor: '#2563EB',
        borderWidth: 2,
        pointBackgroundColor: '#2563EB',
        pointRadius: 4,
      },
      {
        label: 'Required',
        data: result.radar_categories?.map(c => c.required) || [],
        backgroundColor: 'rgba(124,58,237,0.10)',
        borderColor: '#7C3AED',
        borderWidth: 2,
        borderDash: [5, 3],
        pointBackgroundColor: '#7C3AED',
        pointRadius: 4,
      }
    ]
  } : null;

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 10,
        ticks: { stepSize: 2, font: { size: 11 }, color: '#9CA3AF', backdropColor: 'transparent' },
        pointLabels: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#4B5563' },
        grid: { color: '#E5E7EB' },
        angleLines: { color: '#E5E7EB' }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8' }}>
      <Navbar />
      <div className="page-wrap">
        <h1 className="page-title"><i className="ti ti-chart-radar" style={{ color: '#7C3AED', verticalAlign: '-2px', marginRight: 8 }}></i>Skill Gap Analyser</h1>
        <p className="page-sub">Upload your resume and enter a target role — see what skills you have, what's missing, and exactly what to learn next.</p>

        {!result && (
          <>
            {/* Upload */}
            <div className="card" onClick={() => !analyzing && fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#7C3AED'; }}
              onDragLeave={e => e.currentTarget.style.borderColor='#E5E7EB'}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor='#E5E7EB'; handleFile(e.dataTransfer.files[0]); }}
              style={{ textAlign: 'center', padding: '40px 24px', cursor: 'pointer', border: '2px dashed #DDD6FE', background: file ? '#F5F3FF' : '#fff', marginBottom: 14, transition: 'all 0.2s' }}>
              <i className={`ti ${file ? 'ti-file-check' : 'ti-file-upload'}`} style={{ fontSize: 38, color: '#7C3AED', display: 'block', marginBottom: 10 }}></i>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{file ? file.name : 'Drop your resume here'}</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>{file ? `${(file.size/1024).toFixed(0)} KB · Click to change` : 'Supports PDF and TXT'}</p>
              {!file && <div className="btn" style={{ display: 'inline-flex', marginTop: 12, background: '#7C3AED', color: '#fff' }}><i className="ti ti-upload"></i> Browse file</div>}
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>

            {/* Role input */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="Target job role — e.g. Frontend Developer, Data Scientist, ML Engineer…"
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif', color: '#111827' }}
                onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
                onKeyDown={e => e.key === 'Enter' && canAnalyze && analyze()}
              />
              <button onClick={analyze} disabled={!canAnalyze} className="btn" style={{ background: '#7C3AED', color: '#fff', whiteSpace: 'nowrap' }}>
                <i className="ti ti-scan"></i> Analyse gap
              </button>
            </div>

            {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#991B1B', display: 'flex', gap: 8 }}><i className="ti ti-alert-circle"></i>{error}</div>}

            {analyzing && (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <div className="spinner" style={{ borderTopColor: '#7C3AED', marginBottom: 16 }}></div>
                <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Analysing your skill gap…</h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>{progLabel}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, background: '#7C3AED' }}></div></div>
              </div>
            )}
          </>
        )}

        {result && (
          <>
            {/* Summary */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5 }}>Skill gap for <span style={{ color: '#7C3AED' }}>{result.role}</span></h2>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{result.verdict}</p>
              </div>
              {[
                { label: 'Skills you have', val: (result.skills_have||[]).length, color: '#059669', bg: '#ECFDF5' },
                { label: 'Skills missing', val: (result.skills_missing||[]).length, color: '#DC2626', bg: '#FEF2F2' },
                { label: 'Readiness', val: `${result.readiness_pct||0}%`, color: '#2563EB', bg: '#EFF6FF' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 16px', background: s.bg, borderRadius: 12, minWidth: 80 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Radar */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-chart-radar" style={{ color: '#7C3AED' }}></i> Skill Coverage by Category
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
                <div style={{ height: 280 }}>
                  <Radar data={radarData} options={radarOptions} />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563EB' }}></div> Your level
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7C3AED' }}></div> Required
                    </div>
                  </div>
                  {(result.radar_categories||[]).map(c => {
                    const pct = Math.round((c.current / Math.max(c.required, 1)) * 100);
                    const gap = c.required - c.current;
                    const col = gap <= 0 ? '#059669' : gap <= 2 ? '#D97706' : '#DC2626';
                    return (
                      <div key={c.category} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                          <span style={{ color: '#4B5563', fontWeight: 500 }}>{c.category}</span>
                          <span style={{ color: col, fontWeight: 700 }}>{c.current}/{c.required}</span>
                        </div>
                        <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${Math.min(100,(c.current/10)*100)}%`, background: col, borderRadius: 3, transition: 'width 1s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Skills 3-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
              {[
                { id: 'skills_have', label: 'Skills You Have', icon: 'ti-circle-check', color: '#059669', bg: '#ECFDF5', pillBg: '#D1FAE5', pillColor: '#065F46' },
                { id: 'skills_missing', label: 'Missing Skills', icon: 'ti-circle-x', color: '#DC2626', bg: '#FEF2F2', pillBg: '#FEE2E2', pillColor: '#991B1B' },
                { id: 'skills_to_learn', label: 'Recommended to Learn', icon: 'ti-book', color: '#2563EB', bg: '#EFF6FF', pillBg: '#DBEAFE', pillColor: '#1E40AF' },
              ].map(col => (
                <div key={col.id} className="card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: col.color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`ti ${col.icon}`}></i> {col.label}
                  </div>
                  <div>
                    {(result[col.id] || []).map(s => (
                      <span key={s} style={{ display: 'inline-block', background: col.pillBg, color: col.pillColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, margin: '2px 3px 2px 0' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Path with courses */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-map-2" style={{ color: '#059669' }}></i> Priority Learning Path
              </h3>
              {(result.learning_path || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: i < result.learning_path.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.skill}</span>
                      <span className={`badge badge-${item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'blue'}`}>{item.priority} priority</span>
                      {item.time_to_learn && <span style={{ fontSize: 11, color: '#9CA3AF' }}>⏱ {item.time_to_learn}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 1.5 }}>{item.why}</p>
                    {/* Courses */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(item.courses || []).map((course, j) => {
                        const pc = PLATFORM_COLORS[course.platform] || { bg: '#F9FAFB', color: '#374151', border: '#E5E7EB' };
                        return (
                          <a key={j} href={course.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: pc.bg, border: `1px solid ${pc.border}`, textDecoration: 'none', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity='1'}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700, color: pc.color }}>{course.platform}</span>
                            <span style={{ fontSize: 11, color: '#6B7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.name}</span>
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: course.type === 'Free' ? '#ECFDF5' : course.type === 'Certification' ? '#F5F3FF' : '#FFF7ED', color: course.type === 'Free' ? '#059669' : course.type === 'Certification' ? '#7C3AED' : '#C2410C', fontWeight: 600 }}>{course.type}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-tools" style={{ color: '#7C3AED' }}></i> Project Ideas to Bridge the Gap
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {(result.projects || []).map((p, i) => (
                  <div key={i} style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <i className="ti ti-code" style={{ color: '#7C3AED', fontSize: 17, flexShrink: 0, marginTop: 1 }}></i>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{p.title}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${DIFF_COLORS[p.difficulty] || 'badge-blue'}`}>{p.difficulty}</span>
                          {p.time_estimate && <span style={{ fontSize: 11, color: '#9CA3AF' }}>⏱ {p.time_estimate}</span>}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, marginBottom: 8 }}>{p.description}</p>
                    {p.why_impressive && <p style={{ fontSize: 12, color: '#7C3AED', fontWeight: 500, marginBottom: 10 }}>💡 {p.why_impressive}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {(p.skills_used || []).map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#EDE9FE', color: '#5B21B6' }}>{s}</span>
                      ))}
                    </div>
                    {p.github_template && (
                      <a href={`https://github.com/search?q=${encodeURIComponent(p.github_template)}&type=repositories`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="ti ti-brand-github"></i> Find starter on GitHub →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link to="/chatbot" className="btn btn-primary"><i className="ti ti-message-circle"></i> Chat with ResumeBot</Link>
              <Link to="/resume-scorer" className="btn btn-secondary" style={{ border: '1px solid #E5E7EB' }}><i className="ti ti-file-text"></i> Score My Resume</Link>
              <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); setRole(''); }} style={{ border: '1px solid #E5E7EB' }}>
                <i className="ti ti-refresh"></i> Analyse Another
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
