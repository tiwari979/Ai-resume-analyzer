import React, { useEffect, useState } from 'react';

const CAT_COLORS = {
  languages: { bg:'rgba(139,92,246,0.15)', border:'rgba(139,92,246,0.4)', text:'#c4b5fd', dot:'#8b5cf6' },
  frontend:  { bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.35)', text:'#6ee7b7', dot:'#10b981' },
  backend:   { bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.35)', text:'#93c5fd', dot:'#3b82f6' },
  databases: { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.35)', text:'#fcd34d', dot:'#f59e0b' },
  devops:    { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.35)',  text:'#fca5a5', dot:'#ef4444' },
  ml_ai:     { bg:'rgba(236,72,153,0.12)', border:'rgba(236,72,153,0.35)', text:'#f9a8d4', dot:'#ec4899' },
  tools:     { bg:'rgba(20,184,166,0.12)', border:'rgba(20,184,166,0.35)', text:'#5eead4', dot:'#14b8a6' },
};

const scoreColor = s => s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';
const scoreLabel = s => s >= 85 ? 'Outstanding' : s >= 70 ? 'Strong' : s >= 55 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Work';

const BreakdownBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
      <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color }}>{value}<span style={{ color:'rgba(255,255,255,0.2)' }}>/{max}</span></span>
    </div>
    <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${(value/max)*100}%`, background:color, borderRadius:3, transition:'width 1.2s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:`0 0 8px ${color}` }} />
    </div>
  </div>
);

const ResultPage = ({ result, onReset, onLogout, user }) => {
  const [animScore, setAnimScore] = useState(0);
  const analysis = result?.analysis;

  useEffect(() => {
    if (!analysis?.score) return;
    let n = 0;
    const step = analysis.score / 60;
    const t = setInterval(() => {
      n += step;
      if (n >= analysis.score) { setAnimScore(analysis.score); clearInterval(t); }
      else setAnimScore(Math.floor(n));
    }, 16);
    return () => clearInterval(t);
  }, [analysis]);

  if (!result || !analysis) return null;

  const sc = scoreColor(analysis.score);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (animScore / 100) * circumference;
  const isAI = analysis.engine === 'claude-ai';

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .rp-in{opacity:0;animation:fadeUp 0.5s ease forwards}
        .rp-in-1{animation-delay:0.05s}.rp-in-2{animation-delay:0.12s}
        .rp-in-3{animation-delay:0.2s}.rp-in-4{animation-delay:0.28s}
        .rp-in-5{animation-delay:0.36s}.rp-in-6{animation-delay:0.44s}

        .rp-page{min-height:100vh;background:radial-gradient(ellipse 60% 40% at 80% 20%,#12041e 0%,#040411 60%);font-family:'DM Sans',sans-serif;}
        .rp-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;
          border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(4,4,17,0.85);
          backdrop-filter:blur(20px);position:sticky;top:0;z-index:100;}
        .rp-brand{display:flex;align-items:center;gap:10px;}
        .rp-brand-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:18px;}
        .rp-brand-name{font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#fff;}
        .rp-nav-right{display:flex;gap:10px;align-items:center;}
        .rp-btn-p{padding:8px 18px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;border-radius:9px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 2px 12px rgba(124,58,237,0.4);transition:all 0.2s;}
        .rp-btn-p:hover{box-shadow:0 4px 20px rgba(124,58,237,0.6);transform:translateY(-1px);}
        .rp-btn-o{padding:8px 16px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .rp-btn-o:hover{border-color:rgba(239,68,68,0.4);color:#fca5a5;}

        .rp-main{max-width:980px;margin:0 auto;padding:36px 24px 60px;}

        .rp-hero{display:grid;grid-template-columns:160px 1fr;gap:36px;align-items:center;
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
          border-radius:24px;padding:36px 40px;margin-bottom:20px;position:relative;overflow:hidden;}
        .rp-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 80% at 0% 50%,rgba(124,58,237,0.06) 0%,transparent 70%);}

        .rp-score-ring{position:relative;width:140px;height:140px;}
        .rp-score-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .rp-score-num{font-family:'Sora',sans-serif;font-size:40px;font-weight:800;line-height:1;}
        .rp-score-denom{font-size:11px;color:rgba(255,255,255,0.25);margin-top:1px;}
        .rp-score-tag{font-size:10px;font-weight:700;letter-spacing:0.8px;margin-top:5px;padding:2px 8px;border-radius:10px;}

        .rp-hero-title{font-family:'Sora',sans-serif;font-size:24px;font-weight:700;color:#fff;margin-bottom:6px;}
        .rp-hero-sub{font-size:13px;color:rgba(255,255,255,0.38);margin-bottom:20px;line-height:1.65;}
        .rp-stats{display:flex;gap:28px;flex-wrap:wrap;}
        .rp-stat-val{font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:#fff;}
        .rp-stat-lbl{font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px;letter-spacing:0.3px;text-transform:uppercase;}

        .rp-engine-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
          border-radius:20px;font-size:11px;font-weight:600;margin-bottom:16px;
          background:${isAI ? 'rgba(124,58,237,0.15)' : 'rgba(100,100,100,0.15)'};
          border:1px solid ${isAI ? 'rgba(139,92,246,0.35)' : 'rgba(150,150,150,0.25)'};
          color:${isAI ? '#c4b5fd' : 'rgba(255,255,255,0.4)'};}

        .rp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;}
        .rp-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:20px;}
        .rp-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:26px;}
        .rp-card-full{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:26px;margin-bottom:20px;}
        .rp-card-title{font-family:'Sora',sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:18px;display:flex;align-items:center;gap:7px;}

        .rp-skill-cat{margin-bottom:16px;}
        .rp-cat-lbl{font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px;display:flex;align-items:center;gap:5px;}
        .rp-cat-dot{width:6px;height:6px;border-radius:50%;}
        .rp-tags{display:flex;flex-wrap:wrap;gap:5px;}
        .rp-tag{padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;border:1px solid;}

        .rp-section-tag{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;
          background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);
          border-radius:20px;font-size:11px;color:#6ee7b7;margin:3px;font-weight:500;}
        .rp-missing-tag{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;
          background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
          border-radius:20px;font-size:11px;color:#fca5a5;margin:3px;font-weight:500;}

        .rp-strength{display:flex;gap:10px;padding:12px 14px;background:rgba(16,185,129,0.06);
          border:1px solid rgba(16,185,129,0.15);border-radius:10px;margin-bottom:8px;align-items:flex-start;}
        .rp-strength-icon{color:#10b981;font-size:14px;margin-top:1px;}
        .rp-strength-text{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.55;}

        .rp-sug{display:flex;gap:10px;padding:12px 14px;background:rgba(245,158,11,0.06);
          border:1px solid rgba(245,158,11,0.15);border-radius:10px;margin-bottom:8px;align-items:flex-start;}
        .rp-sug-icon{color:#f59e0b;font-size:14px;margin-top:1px;}
        .rp-sug-text{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.55;}

        .rp-summary-card{background:linear-gradient(135deg,rgba(124,58,237,0.07),rgba(79,70,229,0.05));
          border:1px solid rgba(139,92,246,0.18);border-radius:20px;padding:24px 28px;margin-bottom:20px;}
        .rp-summary-text{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.75;}

        .rp-insight{background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.18);border-radius:14px;padding:16px 18px;margin-top:12px;}
        .rp-insight-label{font-size:11px;font-weight:600;color:#93c5fd;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px;}
        .rp-insight-text{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;}

        .rp-top-tag{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;
          border-radius:20px;font-size:12px;font-weight:500;margin:4px;
          background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:#c4b5fd;transition:all 0.2s;}
        .rp-top-tag:hover{background:rgba(139,92,246,0.2);border-color:rgba(139,92,246,0.5);}
        .rp-rank{width:17px;height:17px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;}

        .rp-ats{display:flex;align-items:center;gap:16px;padding:16px 20px;
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;margin-bottom:12px;}
        .rp-ats-score{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;}
        .rp-ats-info{}
        .rp-ats-label{font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);}
        .rp-ats-sub{font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px;}
      `}</style>

      <div className="rp-page">
        <nav className="rp-nav">
          <div className="rp-brand">
            <div className="rp-brand-icon">🤖</div>
            <span className="rp-brand-name">AI Resume Analyzer</span>
          </div>
          <div className="rp-nav-right">
            <button className="rp-btn-p" onClick={onReset}>+ New Analysis</button>
            <button className="rp-btn-o" onClick={onLogout}>Sign Out</button>
          </div>
        </nav>

        <div className="rp-main">

          {/* Hero */}
          <div className="rp-hero rp-in rp-in-1">
            <div className="rp-score-ring">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <circle cx="70" cy="70" r="54" fill="none" stroke={sc} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                  style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter:`drop-shadow(0 0 10px ${sc})` }}/>
              </svg>
              <div className="rp-score-inner">
                <span className="rp-score-num" style={{ color: sc }}>{animScore}</span>
                <span className="rp-score-denom">/ 100</span>
                <span className="rp-score-tag" style={{ background:`${sc}18`, color:sc }}>{scoreLabel(analysis.score)}</span>
              </div>
            </div>

            <div style={{ position:'relative' }}>
              <div className="rp-engine-badge">
                {isAI ? '✦ Analyzed by Claude AI' : '⚙ Rule-Based Analysis'}
              </div>
              <div className="rp-hero-title">Resume Analysis Complete</div>
              <div className="rp-hero-sub">{analysis.filename}</div>
              <div className="rp-stats">
                {[
                  { val: analysis.totalSkillsDetected, lbl: 'Skills Found' },
                  { val: Object.keys(analysis.skills).length, lbl: 'Categories' },
                  { val: analysis.detectedSections.length, lbl: 'Sections' },
                  { val: analysis.experienceLevel, lbl: 'Level', color: '#c4b5fd' },
                  ...(analysis.yearsOfExperience ? [{ val: `${analysis.yearsOfExperience}yr`, lbl: 'Experience' }] : []),
                ].map(s => (
                  <div key={s.lbl} style={{ textAlign:'center' }}>
                    <div className="rp-stat-val" style={s.color ? { color: s.color } : {}}>{s.val}</div>
                    <div className="rp-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rp-summary-card rp-in rp-in-2">
            <div className="rp-card-title">✦ AI Summary</div>
            <div className="rp-summary-text">{analysis.summary}</div>
            {analysis.careerInsight && (
              <div className="rp-insight">
                <div className="rp-insight-label">Career Insight</div>
                <div className="rp-insight-text">{analysis.careerInsight}</div>
              </div>
            )}
          </div>

          {/* Score Breakdown + ATS */}
          {(analysis.scoreBreakdown || analysis.atsScore) && (
            <div className="rp-grid2 rp-in rp-in-2">
              {analysis.scoreBreakdown && (
                <div className="rp-card">
                  <div className="rp-card-title">📊 Score Breakdown</div>
                  <BreakdownBar label="Skills & Technologies" value={analysis.scoreBreakdown.skillsScore} max={40} color="#8b5cf6" />
                  <BreakdownBar label="Experience & Impact" value={analysis.scoreBreakdown.experienceScore} max={30} color="#3b82f6" />
                  <BreakdownBar label="Formatting & Clarity" value={analysis.scoreBreakdown.formattingScore} max={15} color="#10b981" />
                  <BreakdownBar label="ATS Compatibility" value={analysis.scoreBreakdown.atsScore} max={15} color="#f59e0b" />
                </div>
              )}
              {analysis.atsScore && (
                <div className="rp-card">
                  <div className="rp-card-title">🤖 ATS Compatibility</div>
                  <div className="rp-ats">
                    <div className="rp-ats-score" style={{ color: scoreColor(analysis.atsScore) }}>{analysis.atsScore}</div>
                    <div className="rp-ats-info">
                      <div className="rp-ats-label">ATS Score</div>
                      <div className="rp-ats-sub">Applicant Tracking System compatibility</div>
                    </div>
                  </div>
                  <div className="rp-insight">
                    <div className="rp-insight-label">What is ATS?</div>
                    <div className="rp-insight-text">Most companies use software to filter resumes before a human sees them. A higher ATS score means your resume is more likely to pass automated screening.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strengths + Suggestions */}
          <div className="rp-grid2 rp-in rp-in-3">
            {analysis.strengths?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card-title">💪 Strengths</div>
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="rp-strength">
                    <span className="rp-strength-icon">✓</span>
                    <span className="rp-strength-text">{s}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="rp-card">
              <div className="rp-card-title">💡 Improvements</div>
              {analysis.suggestions.length === 0
                ? <div style={{ color:'#6ee7b7', fontSize:13 }}>🎉 No major improvements needed!</div>
                : analysis.suggestions.map((s, i) => (
                    <div key={i} className="rp-sug">
                      <span className="rp-sug-icon">→</span>
                      <span className="rp-sug-text">{s}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Skills + Sections + Missing */}
          <div className="rp-grid2 rp-in rp-in-4">
            <div className="rp-card">
              <div className="rp-card-title">🛠 Skills Detected</div>
              {Object.keys(analysis.skills).length === 0
                ? <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>No skills detected.</div>
                : Object.entries(analysis.skills).map(([cat, skills]) => {
                    const c = CAT_COLORS[cat] || { bg:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.15)', text:'rgba(255,255,255,0.6)', dot:'#888' };
                    return (
                      <div className="rp-skill-cat" key={cat}>
                        <div className="rp-cat-lbl"><span className="rp-cat-dot" style={{ background:c.dot }}/>{cat.replace('_',' & ')}</div>
                        <div className="rp-tags">
                          {skills.map(s => <span key={s} className="rp-tag" style={{ background:c.bg, borderColor:c.border, color:c.text }}>{s}</span>)}
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="rp-card">
                <div className="rp-card-title">📑 Sections Present</div>
                {analysis.detectedSections.map(s => <span key={s} className="rp-section-tag">✓ {s}</span>)}
              </div>

              {analysis.missingSkills?.length > 0 && (
                <div className="rp-card">
                  <div className="rp-card-title">⚠ Skills to Add</div>
                  {analysis.missingSkills.map(s => <span key={s} className="rp-missing-tag">+ {s}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Top Skills */}
          <div className="rp-card-full rp-in rp-in-5">
            <div className="rp-card-title">⭐ Top Skills Ranking</div>
            {analysis.topSkills.map((skill, i) => (
              <span key={skill} className="rp-top-tag">
                <span className="rp-rank">{i + 1}</span>{skill}
              </span>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default ResultPage;
