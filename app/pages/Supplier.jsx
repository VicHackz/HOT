/* global React, useApp, Btn, Field, Input, Textarea, Select, Status, Pipeline, Swatch, hashHue */
const { useState: useSP, useMemo: useMP } = React;

// ────────── AppShell: sidebar + top bar layout used by all logged-in pages ──────────
function AppShell({ nav, children, crumbs, actions }) {
  const { user, logout, setRoute } = useApp();
  const label = user?.role === 'admin' ? 'HoT Admin' : user?.supplier?.name || 'Supplier';
  const initial = user?.role === 'admin' ? 'H' : (user?.supplier?.name?.[0] || 'S');
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brandmark">
          <span className="logo">HoT<span className="dot"/></span>
          <span className="mono">PORTAL</span>
        </div>
        {nav}
        <div className="bottom">
          <div className="user-card">
            <div className="avatar">{initial}</div>
            <div style={{minWidth:0, flex:1}}>
              <div className="name" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button className="btn ghost sm" onClick={logout} title="Log out" style={{padding:'6px 8px'}}>↗</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="crumbs">
            <span style={{fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'.18em'}}>PORTAL</span>
            {crumbs?.map((c, i) => (
              <React.Fragment key={i}>
                <span className="sep">/</span>
                <span className={i === crumbs.length-1 ? 'here' : ''}>{c}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="right">{actions}</div>
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

// ────────── Supplier page (upload + history) ──────────
function SupplierPage() {
  const { user, products, addProduct, notify } = useApp();
  const [tab, setTab] = useSP('upload');
  const mine = products.filter(p => p.supplierId === user.supplier.id)
                       .sort((a,b) => +new Date(b.uploadDate) - +new Date(a.uploadDate));

  const nav = (
    <nav className="nav">
      <div className="group">Workspace</div>
      <button className={tab==='upload'?'active':''} onClick={()=>setTab('upload')}>
        <span>Upload product</span>
      </button>
      <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>
        <span>Upload history</span>
        <span className="count">{mine.length}</span>
      </button>
      <div className="group">Account</div>
      <button><span>Supplier profile</span></button>
      <button><span>Review comments</span><span className="count">3</span></button>
    </nav>
  );

  const stats = {
    total: mine.length,
    pending: mine.filter(p=>p.status==='Pending Review').length,
    approved: mine.filter(p=>p.status==='Approved').length,
  };

  return (
    <AppShell nav={nav}
      crumbs={[user.supplier.name, tab==='upload'?'Upload':'History']}
      actions={<>
        <span className="meta">{user.supplier.city}, {user.supplier.country}</span>
        <Btn variant="ghost" size="sm">Docs ↗</Btn>
      </>}
    >
      {/* Page header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:34}}>
        <div>
          <div className="eyebrow">Supplier workspace</div>
          <h1 className="h1" style={{marginTop:8}}>Good morning, <em style={{fontStyle:'italic', color:'var(--accent-ink)'}}>{user.supplier.name.split(' ')[0]}</em>.</h1>
          <p style={{color:'var(--ink-3)', maxWidth:520, marginTop:8, fontSize:13.5}}>
            {stats.pending > 0
              ? `You have ${stats.pending} product${stats.pending>1?'s':''} awaiting review by the HoT team.`
              : 'All your recent uploads have been reviewed.'}
          </p>
        </div>
        <div style={{display:'flex', gap:34}}>
          <Stat label="Total" value={stats.total}/>
          <Stat label="Pending" value={stats.pending} tone="ochre"/>
          <Stat label="Approved" value={stats.approved} tone="sage"/>
        </div>
      </div>

      {tab === 'upload' ? <UploadForm onSubmit={p => { addProduct(p); notify('Product uploaded — now in review','success'); setTab('history'); }}/>
                        : <HistoryList products={mine}/>}
    </AppShell>
  );
}

function Stat({ label, value, tone }) {
  const col = tone==='ochre' ? 'var(--ochre)' : tone==='sage' ? 'var(--sage)' : 'var(--ink)';
  return (
    <div style={{textAlign:'right'}}>
      <div style={{fontFamily:'var(--serif)', fontSize:34, lineHeight:1, color: col}}>{String(value).padStart(2,'0')}</div>
      <div className="eyebrow" style={{marginTop:6}}>{label}</div>
    </div>
  );
}

// ────────── Upload form ──────────
function UploadForm({ onSubmit }) {
  const { user, notify } = useApp();
  const [data, setData] = useSP({
    productName:'', category:'Sofa', color:'', material:'', weight:'', weightUnit:'kg',
    width:'', height:'', depth:'', collectionName:'', season:'', description:'',
  });
  const [errors, setErrors] = useSP({});
  const [preview, setPreview] = useSP(null);

  const set = (k,v) => { setData(d => ({...d,[k]:v})); setErrors(e => ({...e,[k]:''})); };

  const handleImage = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!data.productName.trim()) er.productName = 'Required';
    if (!data.color.trim()) er.color = 'Required';
    if (!data.material.trim()) er.material = 'Required';
    if (!data.weight || +data.weight <= 0) er.weight = 'Required';
    if (!data.width || +data.width <= 0) er.width = 'Required';
    if (!data.collectionName.trim()) er.collectionName = 'Required';
    if (!data.season.trim()) er.season = 'Required';
    setErrors(er);
    if (Object.keys(er).length) { notify('Please fill required fields', 'error'); return; }

    onSubmit({
      id: 'prod-'+Date.now(),
      supplierId: user.supplier.id, supplierName: user.supplier.name,
      productName: data.productName, category: data.category, color: data.color, material: data.material,
      weight: +data.weight, weightUnit: data.weightUnit,
      dimensions: { width:+data.width, height:+data.height||0, depth:+data.depth||0 },
      collectionName: data.collectionName, season: data.season, description: data.description,
      status: 'Pending Review', uploadDate: new Date().toISOString(),
      imageSeed: 'prod-'+Date.now(),
    });
  };

  return (
    <form onSubmit={submit} className="card" style={{padding:0, overflow:'hidden', background:'transparent', border:'1px solid var(--rule)'}}>
      <div style={{display:'grid', gridTemplateColumns:'380px 1fr', minHeight:480}}>
        {/* Image side */}
        <div style={{padding:28, borderRight:'1px solid var(--rule)', background:'var(--paper)'}}>
          <div className="eyebrow" style={{marginBottom:12}}>Product image</div>
          <label style={{display:'block', cursor:'pointer'}}>
            <input type="file" accept="image/*" onChange={handleImage} style={{display:'none'}}/>
            {preview ? (
              <div style={{position:'relative', borderRadius:4, overflow:'hidden'}}>
                <img src={preview} alt="" style={{width:'100%', display:'block'}}/>
                <div style={{position:'absolute', top:10, right:10, display:'flex', gap:6}}>
                  <button type="button" className="btn subtle sm" onClick={(e)=>{e.preventDefault(); setPreview(null);}}>Replace</button>
                </div>
              </div>
            ) : (
              <div style={{
                border:'1.5px dashed var(--rule)', borderRadius:4,
                padding:'60px 20px', textAlign:'center',
                background:'repeating-linear-gradient(135deg, oklch(95% 0.012 80) 0 8px, oklch(93% 0.014 80) 8px 16px)',
              }}>
                <div style={{fontFamily:'var(--serif)', fontSize:28, color:'var(--ink-2)'}}>⟵ Drop image ⟶</div>
                <div className="meta" style={{marginTop:8}}>OR CLICK TO BROWSE · PNG · JPG · UP TO 10MB</div>
                <div style={{marginTop:22, display:'flex', justifyContent:'center'}}>
                  <span className="btn subtle sm">Choose file</span>
                </div>
              </div>
            )}
          </label>

          <div className="mt-lg" style={{padding:'14px 0', borderTop:'1px solid var(--rule)'}}>
            <div className="eyebrow" style={{marginBottom:10}}>What happens next</div>
            <ol style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10}}>
              {[
                ['01','Your upload is saved and timestamped.'],
                ['02','Automated check: image quality, metadata completeness.'],
                ['03','HoT curator reviews and approves.'],
                ['04','Product visible in the Jakobsdal catalog.'],
              ].map(([n,t]) => (
                <li key={n} style={{display:'flex', gap:12, fontSize:12.5, color:'var(--ink-2)'}}>
                  <span className="meta" style={{color:'var(--accent-ink)'}}>{n}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Fields side */}
        <div style={{padding:32}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div style={{gridColumn:'span 2'}}>
              <Field label="Product name" required error={errors.productName}>
                <Input placeholder="e.g. Stockholm Linen Sofa" value={data.productName} onChange={e=>set('productName',e.target.value)}/>
              </Field>
            </div>

            <Field label="Category" required>
              <Select value={data.category} onChange={e=>set('category',e.target.value)}>
                {['Sofa','Chair','Table','Fabric','Other'].map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Collection" required error={errors.collectionName}>
              <Input placeholder="e.g. Nordic Essentials" value={data.collectionName} onChange={e=>set('collectionName',e.target.value)}/>
            </Field>

            <Field label="Color" required error={errors.color}>
              <Input placeholder="e.g. Natural Beige" value={data.color} onChange={e=>set('color',e.target.value)}/>
            </Field>
            <Field label="Material" required error={errors.material}>
              <Input placeholder="e.g. Linen, Velvet" value={data.material} onChange={e=>set('material',e.target.value)}/>
            </Field>

            <Field label="Weight" required error={errors.weight}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 70px', gap:6}}>
                <Input type="number" step="0.01" placeholder="0.00" value={data.weight} onChange={e=>set('weight',e.target.value)}/>
                <Select value={data.weightUnit} onChange={e=>set('weightUnit',e.target.value)}>
                  <option value="kg">kg</option><option value="g">g</option>
                </Select>
              </div>
            </Field>
            <Field label="Season / Year" required error={errors.season}>
              <Input placeholder="e.g. SS 2024" value={data.season} onChange={e=>set('season',e.target.value)}/>
            </Field>

            <Field label="Width (cm)" required error={errors.width}>
              <Input type="number" placeholder="0" value={data.width} onChange={e=>set('width',e.target.value)}/>
            </Field>
            <Field label="Height (cm)">
              <Input type="number" placeholder="0" value={data.height} onChange={e=>set('height',e.target.value)}/>
            </Field>
            <Field label="Depth (cm)">
              <Input type="number" placeholder="0" value={data.depth} onChange={e=>set('depth',e.target.value)}/>
            </Field>
            <div/>

            <div style={{gridColumn:'span 2'}}>
              <Field label="Description" hint="Short copy for HoT curators — materials, story, details.">
                <Textarea rows={4} placeholder="Describe the product…" value={data.description} onChange={e=>set('description',e.target.value)}/>
              </Field>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:28, paddingTop:20, borderTop:'1px solid var(--rule)'}}>
            <div className="meta">Saves as: Pending Review</div>
            <div style={{display:'flex', gap:10}}>
              <Btn variant="ghost" size="md" type="button">Save draft</Btn>
              <Btn variant="primary" size="md" type="submit">Submit for review →</Btn>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// ────────── History list ──────────
function HistoryList({ products }) {
  if (!products.length) {
    return (
      <div className="card" style={{padding:60, textAlign:'center'}}>
        <div className="h2" style={{color:'var(--ink-2)'}}>No uploads yet</div>
        <div className="meta" style={{marginTop:10}}>HEAD OVER TO THE UPLOAD TAB TO BEGIN</div>
      </div>
    );
  }
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:'60px 2fr 1fr 1fr 1.4fr 1.4fr', gap:0, padding:'14px 22px', borderBottom:'1px solid var(--rule)'}}>
        {['','Product','Category','Color','Pipeline','Uploaded'].map((h,i) => (
          <div key={i} className="eyebrow">{h}</div>
        ))}
      </div>
      {products.map(p => (
        <div key={p.id} style={{
          display:'grid', gridTemplateColumns:'60px 2fr 1fr 1fr 1.4fr 1.4fr', gap:0,
          padding:'16px 22px', borderBottom:'1px solid var(--rule)', alignItems:'center',
          cursor:'pointer', transition:'background .12s',
        }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--paper-2)'}
        onMouseLeave={e=>e.currentTarget.style.background=''}>
          <div style={{width:40, height:40, borderRadius:4, overflow:'hidden'}}>
            <Swatch seed={p.imageSeed} label="" h={40}/>
          </div>
          <div>
            <div style={{fontSize:13.5, fontWeight:500}}>{p.productName}</div>
            <div className="meta" style={{marginTop:2}}>{p.collectionName} · {p.season}</div>
          </div>
          <div style={{fontSize:13, color:'var(--ink-2)'}}>{p.category}</div>
          <div style={{fontSize:13, color:'var(--ink-2)'}}>{p.color}</div>
          <Pipeline status={p.status}/>
          <div className="meta">{new Date(p.uploadDate).toLocaleDateString('sv-SE')}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { SupplierPage, AppShell, Stat });
