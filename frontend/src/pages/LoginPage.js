import React, { useState, useEffect, useRef } from 'react';
import { authAPI, setAuthToken } from '../utils/api';

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.2,
      dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.6 + 0.1,
      hue: Math.random() > 0.5 ? 265 : 245,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.opacity})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleKey = e => { if (e.key === 'Enter') handleSubmit(); };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register({ name: form.name, email: form.email, password: form.password });
      setAuthToken(res.data.token);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(20px,-30px) scale(1.05);} 66%{transform:translate(-15px,15px) scale(0.97);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.4);} 50%{box-shadow:0 0 0 12px rgba(124,58,237,0);} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }

        .lp-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center;
          background:radial-gradient(ellipse 80% 60% at 20% 40%, #130824 0%, #040411 50%, #050315 100%);
          position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }

        .lp-card { width:100%; max-width:440px; position:relative; z-index:10;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; padding: 0 16px; }

        .lp-glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(60px);
          -webkit-backdrop-filter:blur(60px);
          border:1px solid rgba(139,92,246,0.18);
          border-radius:28px; padding:44px 40px 40px;
          box-shadow:0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset,
            0 1px 0 rgba(255,255,255,0.1) inset; }

        .lp-logo-ring { width:72px; height:72px; border-radius:22px; margin:0 auto 16px;
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:flex; align-items:center; justify-content:center; font-size:32px;
          box-shadow:0 8px 40px rgba(124,58,237,0.6), 0 0 0 8px rgba(124,58,237,0.08);
          animation:pulse 3s ease-in-out infinite; }

        .lp-title { font-family:'Sora',sans-serif; font-size:22px; font-weight:700;
          color:#fff; letter-spacing:-0.4px; text-align:center; }

        .lp-sub { font-size:13px; color:rgba(255,255,255,0.35); text-align:center;
          margin-top:5px; font-weight:300; }

        .lp-tabs { display:flex; background:rgba(0,0,0,0.35); border-radius:12px;
          padding:4px; margin:24px 0; border:1px solid rgba(255,255,255,0.05); }

        .lp-tab { flex:1; padding:10px; border:none; border-radius:9px; cursor:pointer;
          font-family:'Sora',sans-serif; font-weight:600; font-size:13px; transition:all 0.3s; }

        .lp-tab.active { background:linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff;
          box-shadow:0 2px 16px rgba(124,58,237,0.5); }
        .lp-tab.inactive { background:transparent; color:rgba(255,255,255,0.3); }

        .lp-field { position:relative; margin-bottom:12px; }
        .lp-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:15px; opacity:0.35; pointer-events:none; }

        .lp-input { width:100%; padding:13px 14px 13px 44px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(139,92,246,0.18);
          border-radius:12px; color:#fff; font-size:14px; font-family:'DM Sans',sans-serif;
          outline:none; transition:all 0.25s; }
        .lp-input:focus { border-color:rgba(139,92,246,0.65); background:rgba(124,58,237,0.07);
          box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
        .lp-input::placeholder { color:rgba(255,255,255,0.2); }

        .lp-error { background:rgba(239,68,68,0.09); border:1px solid rgba(239,68,68,0.22);
          border-radius:10px; padding:11px 14px; color:#fca5a5; font-size:13px;
          margin-bottom:14px; display:flex; align-items:center; gap:8px; }

        .lp-btn { width:100%; padding:14px; border:none; border-radius:12px;
          font-size:15px; font-weight:600; font-family:'Sora',sans-serif;
          cursor:pointer; margin-top:6px; color:#fff; letter-spacing:0.2px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9,#4f46e5);
          background-size:200% 200%; animation:gradShift 4s ease infinite;
          box-shadow:0 4px 28px rgba(124,58,237,0.55);
          transition:transform 0.2s, box-shadow 0.2s; }
        .lp-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 40px rgba(124,58,237,0.7); }
        .lp-btn:active { transform:translateY(0); }
        .lp-btn:disabled { opacity:0.65; cursor:not-allowed; }

        .lp-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.25);
          border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite;
          display:inline-block; }

        .lp-divider { text-align:center; margin-top:18px;
          font-size:11px; color:rgba(255,255,255,0.15); letter-spacing:0.5px; }

        .lp-orb { position:fixed; border-radius:50%; filter:blur(100px);
          pointer-events:none; animation:floatOrb 12s ease-in-out infinite; }
      `}</style>

      <div className="lp-wrap">
        <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }} />

        <div className="lp-orb" style={{ width:600, height:600, background:'rgba(124,58,237,0.1)', top:'-20%', left:'-15%', animationDelay:'0s' }} />
        <div className="lp-orb" style={{ width:500, height:500, background:'rgba(79,70,229,0.08)', bottom:'-15%', right:'-10%', animationDelay:'-6s' }} />
        <div className="lp-orb" style={{ width:300, height:300, background:'rgba(139,92,246,0.06)', top:'40%', right:'20%', animationDelay:'-3s' }} />

        <div className="lp-card">
          <div className="lp-glass">
            <div className="lp-logo-ring">🤖</div>
            <div className="lp-title">AI Resume Analyzer</div>
            <div className="lp-sub">{mode === 'login' ? 'Sign in to analyze your resume' : 'Create an account to get started'}</div>

            <div className="lp-tabs">
              <button className={`lp-tab ${mode === 'login' ? 'active' : 'inactive'}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
              <button className={`lp-tab ${mode === 'register' ? 'active' : 'inactive'}`} onClick={() => { setMode('register'); setError(''); }}>Sign Up</button>
            </div>

            {error && <div className="lp-error"><span>⚠</span>{error}</div>}

            {mode === 'register' && (
              <div className="lp-field">
                <span className="lp-icon">👤</span>
                <input className="lp-input" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} onKeyDown={handleKey} />
              </div>
            )}
            <div className="lp-field">
              <span className="lp-icon">✉</span>
              <input className="lp-input" name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} onKeyDown={handleKey} />
            </div>
            <div className="lp-field">
              <span className="lp-icon">🔒</span>
              <input className="lp-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} onKeyDown={handleKey} />
            </div>

            <button className="lp-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><span className="lp-spinner" /> Authenticating...</span>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>

            <div className="lp-divider">Microservices · Docker · Kubernetes · Node.js</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
