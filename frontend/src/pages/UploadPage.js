import React, { useState, useRef, useEffect } from 'react';
import { resumeAPI } from '../utils/api';

const UploadPage = ({ token, user, onAnalysisComplete, onLogout }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusIdx, setStatusIdx] = useState(0);
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  const statuses = ['Reading PDF structure...', 'Extracting text content...', 'Running AI analysis...', 'Detecting skills & scoring...', 'Generating insights...'];

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => setStatusIdx(i => (i + 1) % statuses.length), 1800);
    } else {
      clearInterval(intervalRef.current); setStatusIdx(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleFile = f => {
    if (f?.type === 'application/pdf') { setFile(f); setError(''); }
    else setError('Only PDF files are accepted.');
  };

  const handleDrop = e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await resumeAPI.upload(fd);
      onAnalysisComplete(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally { setLoading(false); }
  };

  const fmt = b => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes pulse2 { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        @keyframes borderPulse { 0%,100%{border-color:rgba(139,92,246,0.5);}50%{border-color:rgba(139,92,246,1);} }
        @keyframes floatIcon { 0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;} }
        @keyframes scanline { 0%{top:-10%;}100%{top:110%;} }

        .up-page { min-height:100vh;
          background:radial-gradient(ellipse 70% 50% at 10% 20%, #130824 0%, #040411 60%);
          font-family:'DM Sans',sans-serif; }

        .up-nav { display:flex; justify-content:space-between; align-items:center;
          padding:20px 40px; border-bottom:1px solid rgba(255,255,255,0.05);
          backdrop-filter:blur(20px); position:sticky; top:0; z-index:100;
          background:rgba(4,4,17,0.8); }

        .up-brand { display:flex; align-items:center; gap:10px; }
        .up-brand-icon { width:36px; height:36px; border-radius:10px;
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:flex; align-items:center; justify-content:center; font-size:18px; }
        .up-brand-name { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:#fff; }

        .up-user { display:flex; align-items:center; gap:12px; }
        .up-avatar { width:34px; height:34px; border-radius:10px;
          background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.3));
          border:1px solid rgba(139,92,246,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:600; color:#c4b5fd; }
        .up-username { font-size:13px; color:rgba(255,255,255,0.45); }
        .up-logout { padding:7px 14px; background:transparent; border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; color:rgba(255,255,255,0.35); font-size:12px; cursor:pointer;
          transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .up-logout:hover { border-color:rgba(239,68,68,0.4); color:#fca5a5; }

        .up-main { max-width:680px; margin:0 auto; padding:64px 24px 40px;
          animation:fadeIn 0.6s ease forwards; }

        .up-headline { font-family:'Sora',sans-serif; font-size:42px; font-weight:800;
          color:#fff; letter-spacing:-1px; line-height:1.1; margin-bottom:12px; }
        .up-headline span { background:linear-gradient(135deg,#a78bfa,#818cf8);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .up-sub { font-size:15px; color:rgba(255,255,255,0.35); margin-bottom:48px; font-weight:300; }

        .up-zone { border:2px dashed rgba(139,92,246,0.3); border-radius:24px;
          padding:64px 40px; cursor:pointer; transition:all 0.3s; text-align:center;
          background:rgba(139,92,246,0.03); position:relative; overflow:hidden;
          margin-bottom:20px; }
        .up-zone:hover, .up-zone.drag { border-color:rgba(139,92,246,0.8);
          background:rgba(139,92,246,0.06); animation:borderPulse 1.5s ease-in-out infinite; }
        .up-zone-icon { font-size:52px; margin-bottom:16px;
          animation:floatIcon 3s ease-in-out infinite; display:block; }
        .up-zone-title { font-family:'Sora',sans-serif; font-size:18px; font-weight:600;
          color:#fff; margin-bottom:8px; }
        .up-zone-sub { font-size:13px; color:rgba(255,255,255,0.3); }
        .up-zone-badge { display:inline-block; margin-top:14px; padding:4px 12px;
          background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25);
          border-radius:20px; font-size:11px; color:#c4b5fd; }

        .up-file-card { display:flex; align-items:center; gap:14px;
          background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25);
          border-radius:16px; padding:16px 20px; margin-bottom:20px;
          animation:fadeIn 0.3s ease forwards; }
        .up-file-icon { width:44px; height:44px; border-radius:12px;
          background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.2);
          display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .up-file-name { font-size:14px; font-weight:500; color:#fff; }
        .up-file-size { font-size:12px; color:rgba(255,255,255,0.3); margin-top:2px; }
        .up-file-remove { margin-left:auto; width:28px; height:28px; border-radius:8px;
          background:transparent; border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.3); cursor:pointer; font-size:14px;
          display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
        .up-file-remove:hover { border-color:rgba(239,68,68,0.4); color:#fca5a5; background:rgba(239,68,68,0.08); }

        .up-btn { width:100%; padding:16px; border:none; border-radius:14px;
          font-size:16px; font-weight:600; font-family:'Sora',sans-serif;
          cursor:pointer; color:#fff; letter-spacing:0.2px; transition:all 0.25s;
          background:linear-gradient(135deg,#7c3aed,#6d28d9,#4f46e5);
          background-size:200% 200%; animation:gradShift 4s ease infinite;
          box-shadow:0 4px 32px rgba(124,58,237,0.5); }
        .up-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 44px rgba(124,58,237,0.7); }
        .up-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .up-error { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);
          border-radius:12px; padding:12px 16px; color:#fca5a5; font-size:13px; margin-bottom:16px; }

        .up-loading { text-align:center; padding:60px 20px; }
        .up-loader { width:72px; height:72px; border-radius:22px; margin:0 auto 24px;
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:flex; align-items:center; justify-content:center; font-size:30px;
          box-shadow:0 8px 40px rgba(124,58,237,0.5); animation:floatIcon 2s ease-in-out infinite; }
        .up-load-text { font-family:'Sora',sans-serif; font-size:16px; font-weight:600; color:#fff; margin-bottom:6px; }
        .up-load-sub { font-size:13px; color:rgba(255,255,255,0.3); animation:pulse2 2s ease-in-out infinite; }
        .up-progress { height:3px; background:rgba(255,255,255,0.06); border-radius:2px; margin:20px auto; max-width:280px; overflow:hidden; }
        .up-progress-bar { height:100%; background:linear-gradient(90deg,#7c3aed,#818cf8); border-radius:2px;
          animation:scanProgress 2s ease-in-out infinite; width:60%; }
        @keyframes scanProgress { 0%{transform:translateX(-100%);}100%{transform:translateX(250%);} }

        .up-features { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:32px; }
        .up-feat { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:16px; text-align:center; }
        .up-feat-icon { font-size:22px; margin-bottom:8px; }
        .up-feat-title { font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:2px; }
        .up-feat-sub { font-size:11px; color:rgba(255,255,255,0.25); }
      `}</style>

      <div className="up-page">
        <nav className="up-nav">
          <div className="up-brand">
            <div className="up-brand-icon">🤖</div>
            <span className="up-brand-name">AI Resume Analyzer</span>
          </div>
          <div className="up-user">
            <div className="up-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="up-username">{user?.name}</span>
            <button className="up-logout" onClick={onLogout}>Sign Out</button>
          </div>
        </nav>

        <div className="up-main">
          {!loading ? (
            <>
              <h1 className="up-headline">Analyze Your<br /><span>Resume with AI</span></h1>
              <p className="up-sub">Upload your PDF and get an instant score, skill breakdown, and personalized tips</p>

              {error && <div className="up-error">⚠ {error}</div>}

              <div className={`up-zone ${dragging ? 'drag' : ''}`}
                onClick={() => inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}>
                <span className="up-zone-icon">{file ? '📄' : '☁'}</span>
                <div className="up-zone-title">{file ? 'File ready for analysis' : 'Drop your PDF resume here'}</div>
                <div className="up-zone-sub">{file ? 'Click to choose a different file' : 'or click anywhere to browse your computer'}</div>
                <span className="up-zone-badge">PDF only · Max 5MB</span>
                <input ref={inputRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              {file && (
                <div className="up-file-card">
                  <div className="up-file-icon">📄</div>
                  <div>
                    <div className="up-file-name">{file.name}</div>
                    <div className="up-file-size">{fmt(file.size)}</div>
                  </div>
                  <button className="up-file-remove" onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
                </div>
              )}

              <button className="up-btn" onClick={handleAnalyze} disabled={!file}>
                {file ? 'Analyze Resume →' : 'Select a PDF file first'}
              </button>

              <div className="up-features">
                <div className="up-feat"><div className="up-feat-icon">🎯</div><div className="up-feat-title">Skill Detection</div><div className="up-feat-sub">70+ technologies</div></div>
                <div className="up-feat"><div className="up-feat-icon">📊</div><div className="up-feat-title">Score 0–100</div><div className="up-feat-sub">Weighted algorithm</div></div>
                <div className="up-feat"><div className="up-feat-icon">💡</div><div className="up-feat-title">Suggestions</div><div className="up-feat-sub">Personalized tips</div></div>
              </div>
            </>
          ) : (
            <div className="up-loading">
              <div className="up-loader">🤖</div>
              <div className="up-load-text">Analyzing your resume...</div>
              <div className="up-progress"><div className="up-progress-bar" /></div>
              <div className="up-load-sub">{statuses[statusIdx]}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadPage;
