/* global React, useApp, Btn, Field, Input, Select, Swatch */
const { useState: useLS } = React;

function LoginPage() {
  const { suppliers, setUser, setRoute } = useApp();
  const [selected, setSelected] = useLS(null);

  const doLogin = (kind, supplier) => {
    setUser({ role: kind, supplier });
    setRoute({ name: kind === 'admin' ? 'admin' : 'supplier' });
  };

  return (
    <div style={{minHeight:'100vh', display:'grid', gridTemplateColumns:'1.05fr 1fr'}}>
      {/* LEFT — editorial cover */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(165deg, oklch(45% 0.05 60) 0%, oklch(30% 0.03 55) 100%)',
        color:'var(--paper)', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        {/* textile-book pattern */}
        <div style={{position:'absolute', inset:0, opacity:.18, pointerEvents:'none',
          backgroundImage:`repeating-linear-gradient(45deg, rgba(255,255,255,.5) 0 1px, transparent 1px 14px),
                           repeating-linear-gradient(-45deg, rgba(255,255,255,.4) 0 1px, transparent 1px 22px)`}}/>
        <div style={{position:'relative', display:'flex', alignItems:'baseline', gap:10}}>
          <span style={{fontFamily:'var(--serif)', fontSize:22, letterSpacing:'-0.02em'}}>
            Home of Textile<span style={{display:'inline-block', width:6, height:6, borderRadius:2, background:'var(--accent)', margin:'0 4px', transform:'translateY(-1px)'}}/>
          </span>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', opacity:.7}}>EST. JAKOBSDAL</span>
        </div>

        <div style={{position:'relative'}}>
          <div className="eyebrow" style={{color:'rgba(255,255,255,.6)'}}>Supplier portal · Vol. IV · 2026</div>
          <h1 className="display" style={{color:'var(--paper)', marginTop:18, fontSize:72, lineHeight:'.98'}}>
            The atelier,<br/><em style={{color:'oklch(75% 0.11 38)'}}>in one place.</em>
          </h1>
          <p style={{maxWidth:460, marginTop:24, fontSize:15, lineHeight:1.6, color:'rgba(255,255,255,.78)'}}>
            Upload collections, track review status, and collaborate with Home of Textile's
            curators — without the Excel, the WeTransfer, the guesswork.
          </p>
        </div>

        <div style={{position:'relative', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2, marginRight:-20}}>
          {['sup1','sup2','sup3','sup4'].map(s => (
            <div key={s} style={{height:88, opacity:.9}}>
              <Swatch seed={s} label="" h={88}/>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — login */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 56px'}}>
        <div style={{width:'100%', maxWidth:420}}>
          <div className="eyebrow" style={{marginBottom:8}}>Sign in</div>
          <h2 className="h1" style={{marginBottom:8}}>Who are you today?</h2>
          <p style={{color:'var(--ink-3)', marginBottom:28, fontSize:13.5}}>
            Choose a role to continue. No password needed for the prototype.
          </p>

          <div className="card" style={{padding:20, marginBottom:14}}
               onClick={() => doLogin('admin')}
               role="button" tabIndex={0}
               style-x={{}} >
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}
                 onClick={() => doLogin('admin')}>
              <div>
                <div className="eyebrow" style={{color:'var(--accent-ink)'}}>Home of Textile</div>
                <div className="h2" style={{marginTop:6}}>Administrator</div>
                <div style={{color:'var(--ink-3)', fontSize:12.5, marginTop:4}}>Review, edit and approve supplier uploads.</div>
              </div>
              <Btn variant="primary" size="sm">Enter →</Btn>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:12, margin:'22px 0 14px'}}>
            <div className="divider grow"/>
            <span className="eyebrow">Or as a supplier</span>
            <div className="divider grow"/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {suppliers.map(s => (
              <button key={s.id} className="card"
                onClick={() => doLogin('supplier', s)}
                onMouseEnter={() => setSelected(s.id)}
                onMouseLeave={() => setSelected(null)}
                style={{
                  textAlign:'left', padding:14, cursor:'pointer', background:'transparent',
                  borderColor: selected === s.id ? 'var(--ink)' : 'var(--rule)',
                  transition:'border-color .15s',
                  fontFamily:'inherit',
                }}>
                <div style={{fontSize:13.5, fontWeight:500, color:'var(--ink)'}}>{s.name}</div>
                <div className="meta" style={{marginTop:4}}>{s.city} · {s.country}</div>
              </button>
            ))}
          </div>

          <div className="meta" style={{marginTop:32}}>
            v4.0.0-atelier · Prototype for thesis evaluation
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
