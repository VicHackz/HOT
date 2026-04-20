/* global React */
const { useState: useS1, useEffect: useE1, useMemo: useM1 } = React;

// ────────────────── Primitives ──────────────────
function Btn({ variant='primary', size='md', full, children, ...rest }) {
  const cls = ['btn', variant, size!=='md'?size:'', full?'full':''].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{children}</button>;
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="field">
      <label>{label}{required && <span className="req">*</span>}</label>
      {children}
      {error && <div className="hint" style={{color:'var(--crimson)'}}>{error}</div>}
      {!error && hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Input({ ...rest }) { return <input className="control" {...rest} />; }
function Textarea({ rows=3, ...rest }) { return <textarea className="control" rows={rows} {...rest} />; }
function Select({ children, ...rest }) { return <select className="control" {...rest}>{children}</select>; }

function Status({ status }) {
  const key = status === 'Pending Review' ? 'pending' : status === 'Approved' ? 'approved' : 'archived';
  return <span className={`status ${key}`}>{status}</span>;
}

// Pipeline: shows transparency of the automated flow — anti "black box"
function Pipeline({ status }) {
  const steps = ['Uploaded','AI review','Human review','Approved'];
  const idx = status === 'Approved' ? 3 : status === 'Archived' ? 3 : status === 'Pending Review' ? 2 : 0;
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      {steps.map((s,i) => (
        <React.Fragment key={s}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{
              width: 8, height: 8, borderRadius: 2,
              background: i < idx ? 'var(--sage)' : i === idx ? 'var(--ochre)' : 'var(--rule)',
              boxShadow: i === idx ? '0 0 0 3px oklch(72% 0.12 75 / .2)' : 'none',
            }}/>
            <span style={{fontSize:11, letterSpacing:'.08em', color: i <= idx ? 'var(--ink-2)' : 'var(--ink-3)'}}>{s}</span>
          </div>
          {i < steps.length-1 && <div style={{flex:'0 0 18px', height:1, background:'var(--rule)'}}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Deterministic hash → hue, for placeholder "textile swatches"
function hashHue(str) {
  let h = 0; for (let i=0; i<str.length; i++) h = (h*31 + str.charCodeAt(i)) % 360;
  return h;
}
function Swatch({ seed, label, h=160 }) {
  const hue = hashHue(seed);
  const bg = `oklch(68% 0.08 ${hue})`;
  const bg2 = `oklch(55% 0.09 ${hue})`;
  return (
    <div style={{
      position:'relative', height: h, overflow:'hidden',
      background: `linear-gradient(135deg, ${bg} 0%, ${bg2} 100%)`,
      borderRadius: 4,
    }}>
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: `repeating-linear-gradient(${(hue+15)%360}deg, rgba(255,255,255,.08) 0 2px, transparent 2px 7px),
                          repeating-linear-gradient(${(hue+105)%360}deg, rgba(0,0,0,.06) 0 3px, transparent 3px 9px)`,
        mixBlendMode:'overlay',
      }}/>
      <div style={{
        position:'absolute', left:10, bottom:10, right:10,
        display:'flex', justifyContent:'space-between', alignItems:'flex-end',
        color:'rgba(255,255,255,.94)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase'
      }}>
        <span>{label}</span>
        <span style={{fontFamily:'var(--serif)', fontSize:13, letterSpacing:0, textTransform:'none'}}>#{seed.slice(-3)}</span>
      </div>
    </div>
  );
}

// Toast
function Toasts() {
  const { toasts, removeToast } = useApp();
  return (
    <div style={{position:'fixed', right:24, top:24, display:'flex', flexDirection:'column', gap:8, zIndex:200}}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => removeToast(t.id)}
          style={{
            background: 'var(--ink)', color:'var(--paper)',
            padding:'10px 14px', borderRadius:6,
            fontSize:13, cursor:'pointer', boxShadow:'var(--shadow-2)',
            display:'flex', alignItems:'center', gap:10,
          }}>
          <div style={{width:6, height:6, borderRadius:'50%',
            background: t.kind==='success'?'var(--sage)':t.kind==='error'?'var(--crimson)':'var(--ochre)'}}/>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Btn, Field, Input, Textarea, Select, Status, Pipeline, Swatch, Toasts, hashHue });
