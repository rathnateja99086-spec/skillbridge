import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MODES = [
  { key: 'coach', label: 'Resume Coach', icon: 'ti-target', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'skills', label: 'Skill Gap', icon: 'ti-chart-radar', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'projects', label: 'Project Ideas', icon: 'ti-bulb', color: '#059669', bg: '#ECFDF5' },
];

const CHIPS = {
  coach: ['How do I improve my resume summary?', 'Fix my work experience section', 'ATS best practices', 'How to quantify achievements?'],
  skills: ['Skills for a Software Engineer', 'What should a Data Scientist know?', 'Skills for Product Manager', 'What certifications should I get?'],
  projects: ['Suggest 3 projects for ML Engineer', 'Project ideas for web developer', 'Portfolio projects for data science', 'Beginner-friendly projects'],
};

export default function Chatbot() {
  const { apiCall } = useAuth();
  const [mode, setMode] = useState('coach');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await apiCall('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          conversationId
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  const switchMode = (m) => {
    setMode(m);
    setMessages([]);
    setConversationId(null);
  };

  const fmt = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      if (line.match(/^[-•]\s/)) return <li key={i} style={{ marginLeft: 16, marginBottom: 3 }} dangerouslySetInnerHTML={{ __html: line.replace(/^[-•]\s/, '') }} />;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentMode = MODES.find(m => m.key === mode);

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: 800, width: '100%', margin: '24px auto', padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Mode tabs */}
        <div className="card" style={{ padding: '16px', marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginRight: 4 }}>Mode:</span>
          {MODES.map(m => (
            <button key={m.key} onClick={() => switchMode(m.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              borderRadius: 20, border: mode === m.key ? `1.5px solid ${m.color}` : '1.5px solid #E5E7EB',
              background: mode === m.key ? m.bg : '#fff', color: mode === m.key ? m.color : '#6B7280',
              cursor: 'pointer', fontSize: 13, fontWeight: mode === m.key ? 700 : 500,
              fontFamily: 'Inter,sans-serif', transition: 'all 0.15s'
            }}>
              <i className={`ti ${m.icon}`} style={{ fontSize: 14 }}></i> {m.label}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 500 }}>

          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10, background: currentMode.bg }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>ResumeBot — {currentMode.label}</div>
              <div style={{ fontSize: 11, color: currentMode.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: loading ? '#D97706' : '#059669', display: 'inline-block' }}></span>
                {loading ? 'Thinking…' : 'Ready to help'}
              </div>
            </div>
          </div>

          {/* Quick chips */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
            {CHIPS[mode].map(chip => (
              <button key={chip} onClick={() => sendMessage(chip)} style={{
                fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1px solid #E5E7EB',
                background: '#F9FAFB', color: '#4B5563', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Inter,sans-serif', transition: 'all 0.15s', flexShrink: 0
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = currentMode.color; e.currentTarget.style.color = currentMode.color; e.currentTarget.style.background = currentMode.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = '#F9FAFB'; }}
              >{chip}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Hi! I'm ResumeBot in {currentMode.label} mode.</div>
                <div style={{ fontSize: 13 }}>Ask me anything or tap a quick topic above!</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: msg.role === 'user' ? '#EFF6FF' : currentMode.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.role === 'user' ? 11 : 14, fontWeight: 700, color: msg.role === 'user' ? '#2563EB' : currentMode.color, flexShrink: 0, marginTop: 2 }}>
                  {msg.role === 'user' ? 'YOU' : '🤖'}
                </div>
                <div style={{ maxWidth: '82%' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.6,
                    background: msg.role === 'user' ? '#EFF6FF' : '#F9FAFB',
                    border: msg.role === 'user' ? `1px solid ${currentMode.color}40` : '1px solid #E5E7EB',
                    borderTopRightRadius: msg.role === 'user' ? 4 : 14,
                    borderTopLeftRadius: msg.role === 'user' ? 14 : 4,
                    color: '#111827'
                  }}>
                    {fmt(msg.content)}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{getTime()}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: currentMode.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                <div style={{ padding: '10px 14px', borderRadius: 14, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', gap: 4, alignItems: 'center', borderTopLeftRadius: 4 }}>
                  {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#BFDBFE', display: 'inline-block', animation: `bounce 1.2s ease ${d}s infinite` }}></span>)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, alignItems: 'flex-end', background: '#fff' }}>
            <textarea ref={inputRef} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about your resume, skills, or projects…"
              style={{ flex: 1, resize: 'none', border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: '#111827', background: '#F9FAFB', minHeight: 42, maxHeight: 120, lineHeight: 1.5, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = currentMode.color} onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              rows={1}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() && !loading ? currentMode.color : '#E5E7EB', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.15s', flexShrink: 0 }}>
              <i className="ti ti-send" style={{ fontSize: 17 }}></i>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes bounce { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }
        `}</style>
      </div>
    </div>
  );
}
