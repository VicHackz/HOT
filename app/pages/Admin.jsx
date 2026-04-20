/* global React, useApp, Btn, Field, Input, Textarea, Select, Status, Pipeline, Swatch, AppShell, Stat */
const { useState: useAd, useMemo: useAdM } = React;

function AdminPage() {
  const { products, suppliers, setRoute } = useApp();
  const [q, setQ] = useAd('');
  const [supp, setSupp] = useAd('All');
  const [cat, setCat] = useAd('All');
  const [st, setSt] = useAd('All');
  const [view, setView] = useAd('grid');

  const filtered = useAdM(() => products.filter(p => {
    if (supp !== 'All' && p.supplierId !== supp) return false;
    if (cat !== 'All' && p.category !== cat) return false;
    if (st !== 'All' && p.status !== st) return false;
    if (q && !p.productName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a,b) => +new Date(b.uploadDate) - +new Date(a.uploadDate)), [products, supp, cat, st, q]);

  const counts = useAdM(() => ({
    all: products.length,
    pending: products.filter(p=>p.status==='Pending Review').length,
    approved: products.filter(p=>p.status==='Approved').length,
    archived: products.filter(p=>p.status==='Archived').length,
  }), [products]);

  const nav = (
    <nav className="nav">
      <div className="group">Catalog</div>
      <button className={st==='All'?'active':''} onClick={()=>setSt('All')}>
        <span>All products</span><span className="count">{counts.all}</span>
      </button>
      <button className={st==='Pending Review'?'active':''} onClick={()=>setSt('Pending Review')}>
        <span>Pending review</span><span className="count">{counts.pending}</span>
      </button>
      <button className={st==='Approved'?'active':''} onClick={()=>setSt('Approved')}>
        <span>Approved</span><span className="count">{counts.approved}</span>
      </button>
      <button className={st==='Archived'?'active':''} onClick={()=>setSt('Archived')}>
        <span>Archived</span><span className="count">{counts.archived}</span>
      </button>
      <div className="group">Suppliers</div>
      <button className={supp==='All'?'active':''} onClick={()=>setSupp('All')}>
        <span>All suppliers</span><span className="count">{suppliers.length}</span>
      </button>
      {suppliers.map(s => (
        <button key={s.id} className={supp===s.id?'active':''} onClick={()=>setSupp(s.id)}>
          <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:150}}>{s.name.split(' ')[0]}</span>
          <span className="count">{products.filter(p=>p.supplierId===s.id).length}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <AppShell nav={nav}
      crumbs={['Catalog', st==='All'?'All products':st]}
      actions={<>
        <input className="control" placeholder="Search products…" value={q} onChange={e=>setQ(e.target.value)}
          style={{width:280, padding:'7px 12px', fontSize:13}}/>
        <Btn variant="ghost" size="sm">Export CSV</Btn>
      </>}
    >
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28}}>
        <div>
          <div className="eyebrow">Administrator</div>
          <h1 className="h1" style={{marginTop:8}}>
            {filtered.length} product{filtered.length!==1?'s':''} <em style={{color:'var(--accent-ink)'}}>in view</em>
          </h1>
          <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
            {supp!=='All' && <Chip onRemove={()=>setSupp('All')}>{suppliers.find(s=>s.id===supp)?.name}</Chip>}
            {cat!=='All' && <Chip onRemove={()=>setCat('All')}>{cat}</Chip>}
            {st!=='All' && <Chip onRemove={()=>setSt('All')}>{st}</Chip>}
            {q && <Chip onRemove={()=>setQ('')}>"{q}"</Chip>}
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <Select value={cat} onChange={e=>setCat(e.target.value)} style={{width:150, padding:'7px 12px', fontSize:13}}>
            <option value="All">All categories</option>
            {['Sofa','Chair','Table','Fabric','Other'].map(c=><option key={c} value={c}>{c}</option>)}
          </Select>
          <div style={{display:'flex', border:'1px solid var(--rule)', borderRadius:6, overflow:'hidden'}}>
            <button className="btn" onClick={()=>setView('grid')}
              style={{borderRadius:0, background: view==='grid'?'var(--ink)':'transparent', color: view==='grid'?'var(--paper)':'var(--ink-2)'}}>Grid</button>
            <button className="btn" onClick={()=>setView('list')}
              style={{borderRadius:0, background: view==='list'?'var(--ink)':'transparent', color: view==='list'?'var(--paper)':'var(--ink-2)'}}>List</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{padding:80, textAlign:'center'}}>
          <div className="h2" style={{color:'var(--ink-2)'}}>No matches</div>
          <div className="meta" style={{marginTop:10}}>TRY ADJUSTING THE FILTERS</div>
        </div>
      ) : view === 'grid' ? <ProductGrid products={filtered}/>
                          : <ProductList products={filtered}/>}
    </AppShell>
  );
}

function Chip({ children, onRemove }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 8px 4px 10px', borderRadius:20, fontSize:12,
      background:'var(--paper-2)', border:'1px solid var(--rule)', color:'var(--ink-2)',
    }}>
      {children}
      <button onClick={onRemove} style={{all:'unset', cursor:'pointer', color:'var(--ink-3)', padding:'0 4px'}}>×</button>
    </div>
  );
}

function ProductGrid({ products }) {
  const { setRoute } = useApp();
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:22}}>
      {products.map(p => {
        const key = p.status==='Pending Review'?'pending':p.status==='Approved'?'approved':'archived';
        return (
          <article key={p.id}
            onClick={()=>setRoute({name:'detail', id:p.id})}
            style={{
              background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:6, overflow:'hidden',
              cursor:'pointer', transition:'transform .18s, box-shadow .18s, border-color .18s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-2)'; e.currentTarget.style.borderColor='var(--ink-3)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='var(--rule)';}}
          >
            <div className={`status-bar ${key}`}/>
            <Swatch seed={p.imageSeed} label={p.category} h={180}/>
            <div style={{padding:16}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10}}>
                <div className="eyebrow">{p.collectionName}</div>
                <div className="meta" style={{fontSize:10.5}}>{new Date(p.uploadDate).toLocaleDateString('sv-SE')}</div>
              </div>
              <h3 style={{fontFamily:'var(--serif)', fontSize:18, fontWeight:420, letterSpacing:'-.01em', margin:'6px 0 8px', lineHeight:1.2}}>
                {p.productName}
              </h3>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
                <div style={{fontSize:12, color:'var(--ink-3)'}}>
                  {p.supplierName.split(' ').slice(0,2).join(' ')}
                </div>
                <Status status={p.status}/>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProductList({ products }) {
  const { setRoute } = useApp();
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:'52px 2fr 1.3fr 1fr 1fr 1.4fr 120px', gap:0, padding:'12px 20px', borderBottom:'1px solid var(--rule)'}}>
        {['','Product','Supplier','Category','Color','Pipeline','Uploaded'].map((h,i)=><div key={i} className="eyebrow">{h}</div>)}
      </div>
      {products.map(p => (
        <div key={p.id} onClick={()=>setRoute({name:'detail', id:p.id})}
          style={{
            display:'grid', gridTemplateColumns:'52px 2fr 1.3fr 1fr 1fr 1.4fr 120px', gap:0,
            padding:'14px 20px', borderBottom:'1px solid var(--rule)', alignItems:'center', cursor:'pointer',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--paper-2)'}
          onMouseLeave={e=>e.currentTarget.style.background=''}>
          <div style={{width:36, height:36, borderRadius:4, overflow:'hidden'}}>
            <Swatch seed={p.imageSeed} label="" h={36}/>
          </div>
          <div>
            <div style={{fontSize:13.5, fontWeight:500}}>{p.productName}</div>
            <div className="meta" style={{marginTop:2}}>{p.collectionName} · {p.season}</div>
          </div>
          <div style={{fontSize:13, color:'var(--ink-2)'}}>{p.supplierName}</div>
          <div style={{fontSize:13, color:'var(--ink-2)'}}>{p.category}</div>
          <div style={{fontSize:13, color:'var(--ink-2)'}}>{p.color}</div>
          <Pipeline status={p.status}/>
          <div className="meta" style={{textAlign:'right'}}>{new Date(p.uploadDate).toLocaleDateString('sv-SE')}</div>
        </div>
      ))}
    </div>
  );
}

// ────────── Product detail ──────────
function DetailPage() {
  const { route, products, setRoute, updateProduct, notify } = useApp();
  const p = products.find(x => x.id === route.id);
  const [data, setData] = useAd(null);
  const [enhancing, setEnhancing] = useAd(false);
  const [enhanced, setEnhanced] = useAd(false);

  React.useEffect(() => {
    if (p) setData({
      productName:p.productName, category:p.category, color:p.color, material:p.material,
      weight:p.weight, weightUnit:p.weightUnit,
      width:p.dimensions.width, height:p.dimensions.height, depth:p.dimensions.depth,
      collectionName:p.collectionName, season:p.season, description:p.description,
      status:p.status,
    });
  }, [p?.id]);

  if (!p || !data) {
    return <AppShell nav={null}><div style={{padding:60, textAlign:'center'}}>Not found</div></AppShell>;
  }
  const set = (k,v) => setData(d => ({...d,[k]:v}));

  const save = () => {
    updateProduct(p.id, {
      ...data,
      weight: +data.weight,
      dimensions: { width:+data.width, height:+data.height, depth:+data.depth },
    });
    notify('Changes saved','success');
  };

  const runEnhance = () => {
    setEnhancing(true);
    setTimeout(() => { setEnhancing(false); setEnhanced(true); notify('Image enhanced — preview ready','success'); }, 1400);
  };

  const nav = (
    <nav className="nav">
      <div className="group">Catalog</div>
      <button onClick={()=>setRoute({name:'admin'})}>
        <span>← Back to catalog</span>
      </button>
      <div className="group">This product</div>
      <button className="active"><span>Edit details</span></button>
      <button><span>Activity log</span></button>
      <button><span>Comments</span><span className="count">2</span></button>
      <div className="group">Automated tools</div>
      <button><span>Image enhancement</span></button>
      <button><span>Room staging</span></button>
    </nav>
  );

  const hue = ((id)=>{let h=0;for(const c of id) h=(h*31+c.charCodeAt(0))%360; return h;})(p.imageSeed);

  return (
    <AppShell nav={nav}
      crumbs={['Catalog', p.supplierName, p.productName]}
      actions={<>
        <Btn variant="ghost" size="sm" onClick={()=>setRoute({name:'admin'})}>Cancel</Btn>
        <Btn variant="primary" size="sm" onClick={save}>Save changes</Btn>
      </>}
    >
      <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:40, alignItems:'start'}}>
        {/* LEFT — hero + tools */}
        <div>
          <div className="eyebrow">{p.collectionName} · {p.season}</div>
          <h1 className="h1" style={{marginTop:8}}>{p.productName}</h1>
          <div style={{display:'flex', alignItems:'center', gap:12, marginTop:10, flexWrap:'wrap'}}>
            <Status status={p.status}/>
            <span className="meta">· ID {p.id}</span>
            <span className="meta">· {p.supplierName}</span>
          </div>

          <div className="mt-lg" style={{position:'relative', borderRadius:6, overflow:'hidden', border:'1px solid var(--rule)'}}>
            <Swatch seed={p.imageSeed} label={p.category.toUpperCase()} h={440}/>
            {enhanced && <div style={{
              position:'absolute', top:14, left:14, background:'var(--ink)', color:'var(--paper)',
              padding:'5px 10px', borderRadius:4, fontSize:10.5, letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600,
            }}>AI Enhanced · v2</div>}
          </div>

          {/* Pipeline */}
          <div className="card mt-lg" style={{padding:22}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <div className="eyebrow">Review pipeline</div>
              <span className="meta">Last update {new Date(p.uploadDate).toLocaleDateString('sv-SE')}</span>
            </div>
            <Pipeline status={p.status}/>
            <div className="mt-md" style={{fontSize:12.5, color:'var(--ink-2)', lineHeight:1.55}}>
              Every automated step is logged and visible to both parties. No black box — the supplier
              sees what HoT sees, and the decision is always human-signed.
            </div>
          </div>

          {/* AI tools */}
          <div className="card mt-md" style={{padding:22}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <div className="eyebrow">Automated tools</div>
              <span className="meta" style={{color: enhanced?'var(--sage)':'var(--ink-3)'}}>{enhanced?'● READY':'● IDLE'}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div style={{padding:16, border:'1px solid var(--rule)', borderRadius:4}}>
                <div style={{fontSize:13.5, fontWeight:500}}>Image enhancement</div>
                <div className="meta" style={{marginTop:6, lineHeight:1.5, textTransform:'none', letterSpacing:0, fontSize:11.5}}>
                  Local sharpen or AI 4× upscale.
                </div>
                <div style={{display:'flex', gap:8, marginTop:12}}>
                  <Btn variant="ghost" size="sm" onClick={runEnhance} disabled={enhancing}>{enhancing?'Working…':'Quick sharpen'}</Btn>
                  <Btn variant="accent" size="sm" onClick={runEnhance} disabled={enhancing}>AI upscale</Btn>
                </div>
              </div>
              <div style={{padding:16, border:'1px solid var(--rule)', borderRadius:4}}>
                <div style={{fontSize:13.5, fontWeight:500}}>Room staging</div>
                <div className="meta" style={{marginTop:6, lineHeight:1.5, textTransform:'none', letterSpacing:0, fontSize:11.5}}>
                  Place this product in a Jakobsdal room.
                </div>
                <Select style={{marginTop:10, padding:'7px 10px', fontSize:12.5}} defaultValue="jakobsdal">
                  <option value="jakobsdal">Jakobsdal showroom</option>
                  <option value="vardagsrum">Living room</option>
                  <option value="matsal">Dining room</option>
                </Select>
                <Btn variant="ghost" size="sm" full style={{marginTop:8}}>Generate preview</Btn>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — data sheet */}
        <div style={{position:'sticky', top:90}}>
          <div className="card" style={{padding:28}}>
            <div className="eyebrow">Data sheet</div>
            <h2 className="h2" style={{marginTop:8, marginBottom:20}}>Edit details</h2>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div style={{gridColumn:'span 2'}}>
                <Field label="Product name" required>
                  <Input value={data.productName} onChange={e=>set('productName',e.target.value)}/>
                </Field>
              </div>
              <Field label="Category">
                <Select value={data.category} onChange={e=>set('category',e.target.value)}>
                  {['Sofa','Chair','Table','Fabric','Other'].map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={data.status} onChange={e=>set('status',e.target.value)}>
                  {['Pending Review','Approved','Archived'].map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Color"><Input value={data.color} onChange={e=>set('color',e.target.value)}/></Field>
              <Field label="Material"><Input value={data.material} onChange={e=>set('material',e.target.value)}/></Field>
              <Field label="Collection"><Input value={data.collectionName} onChange={e=>set('collectionName',e.target.value)}/></Field>
              <Field label="Season"><Input value={data.season} onChange={e=>set('season',e.target.value)}/></Field>
              <Field label="Weight">
                <div style={{display:'grid', gridTemplateColumns:'1fr 60px', gap:6}}>
                  <Input type="number" value={data.weight} onChange={e=>set('weight',e.target.value)}/>
                  <Select value={data.weightUnit} onChange={e=>set('weightUnit',e.target.value)}>
                    <option>kg</option><option>g</option>
                  </Select>
                </div>
              </Field>
              <div/>
              <Field label="Width (cm)"><Input type="number" value={data.width} onChange={e=>set('width',e.target.value)}/></Field>
              <Field label="Height (cm)"><Input type="number" value={data.height} onChange={e=>set('height',e.target.value)}/></Field>
              <Field label="Depth (cm)"><Input type="number" value={data.depth} onChange={e=>set('depth',e.target.value)}/></Field>
              <div/>
              <div style={{gridColumn:'span 2'}}>
                <Field label="Description">
                  <Textarea rows={4} value={data.description} onChange={e=>set('description',e.target.value)}/>
                </Field>
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:24, paddingTop:20, borderTop:'1px solid var(--rule)'}}>
              <Btn variant="danger" size="sm" onClick={()=>{ updateProduct(p.id,{status:'Archived'}); notify('Product archived','info'); setRoute({name:'admin'}); }}>Archive product</Btn>
              <div style={{display:'flex', gap:8}}>
                <Btn variant="ghost" size="sm" onClick={()=>setRoute({name:'admin'})}>Cancel</Btn>
                <Btn variant="primary" size="sm" onClick={save}>Save changes</Btn>
              </div>
            </div>
          </div>

          <div className="meta mt-md" style={{padding:'0 4px'}}>
            CHANGES ARE LOGGED · LAST EDIT {new Date(p.uploadDate).toLocaleString('sv-SE')}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { AdminPage, DetailPage });
