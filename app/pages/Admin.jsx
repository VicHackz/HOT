import React from 'react'
import { useApp } from '../state.jsx'
import { Btn, Field, Input, Textarea, Select, Status, Pipeline } from '../components.jsx'
import { AppShell } from './Supplier.jsx'
import { sharpenImage, stageInRoom, getGeminiKey, setGeminiKey, compressForStorage } from '../imageProcessing.js'

// ── Admin page ────────────────────────────────────────────────────────────────
export function AdminPage() {
  const { products, suppliers, setRoute } = useApp()
  const [q, setQ] = React.useState('')
  const [supp, setSupp] = React.useState('All')
  const [cat, setCat] = React.useState('All')
  const [st, setSt] = React.useState('All')
  const [view, setView] = React.useState('grid')

  const filtered = React.useMemo(() => products.filter(p => {
    if (supp !== 'All' && p.supplierId !== supp) return false
    if (cat !== 'All' && p.category !== cat) return false
    if (st !== 'All' && p.status !== st) return false
    if (q && !p.productName.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }).sort((a, b) => +new Date(b.uploadDate) - +new Date(a.uploadDate)), [products, supp, cat, st, q])

  const counts = React.useMemo(() => ({
    all: products.length,
    pending: products.filter(p => p.status === 'Pending Review').length,
    approved: products.filter(p => p.status === 'Approved').length,
    archived: products.filter(p => p.status === 'Archived').length,
  }), [products])

  const nav = (
    <nav className="nav">
      <div className="group">Catalog</div>
      <button className={st === 'All' ? 'active' : ''} onClick={() => setSt('All')}>
        <span>All products</span><span className="count">{counts.all}</span>
      </button>
      <button className={st === 'Pending Review' ? 'active' : ''} onClick={() => setSt('Pending Review')}>
        <span>Pending review</span><span className="count">{counts.pending}</span>
      </button>
      <button className={st === 'Approved' ? 'active' : ''} onClick={() => setSt('Approved')}>
        <span>Approved</span><span className="count">{counts.approved}</span>
      </button>
      <button className={st === 'Archived' ? 'active' : ''} onClick={() => setSt('Archived')}>
        <span>Archived</span><span className="count">{counts.archived}</span>
      </button>
      <div className="group">Suppliers</div>
      <button className={supp === 'All' ? 'active' : ''} onClick={() => setSupp('All')}>
        <span>All suppliers</span><span className="count">{suppliers.length}</span>
      </button>
      {suppliers.map(s => (
        <button key={s.id} className={supp === s.id ? 'active' : ''} onClick={() => setSupp(s.id)}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{s.name.split(' ')[0]}</span>
          <span className="count">{products.filter(p => p.supplierId === s.id).length}</span>
        </button>
      ))}
    </nav>
  )

  return (
    <AppShell nav={nav}
      crumbs={['Catalog', st === 'All' ? 'All products' : st]}
      actions={<>
        <input className="control" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)}
          style={{ width: 280, padding: '7px 12px', fontSize: 13 }} />
        <Btn variant="ghost" size="sm">Export CSV</Btn>
      </>}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div className="eyebrow">Administrator</div>
          <h1 className="h1" style={{ marginTop: 8 }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} <em style={{ color: 'var(--accent-ink)' }}>in view</em>
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {supp !== 'All' && <Chip onRemove={() => setSupp('All')}>{suppliers.find(s => s.id === supp)?.name}</Chip>}
            {cat !== 'All' && <Chip onRemove={() => setCat('All')}>{cat}</Chip>}
            {st !== 'All' && <Chip onRemove={() => setSt('All')}>{st}</Chip>}
            {q && <Chip onRemove={() => setQ('')}>"{q}"</Chip>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Select value={cat} onChange={e => setCat(e.target.value)} style={{ width: 150, padding: '7px 12px', fontSize: 13 }}>
            <option value="All">All categories</option>
            {['Sofa', 'Chair', 'Table', 'Fabric', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div style={{ display: 'flex', border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden' }}>
            <button className="btn" onClick={() => setView('grid')}
              style={{ borderRadius: 0, background: view === 'grid' ? 'var(--ink)' : 'transparent', color: view === 'grid' ? 'var(--paper)' : 'var(--ink-2)' }}>Grid</button>
            <button className="btn" onClick={() => setView('list')}
              style={{ borderRadius: 0, background: view === 'list' ? 'var(--ink)' : 'transparent', color: view === 'list' ? 'var(--paper)' : 'var(--ink-2)' }}>List</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 80, textAlign: 'center' }}>
          <div className="h2" style={{ color: 'var(--ink-2)' }}>No matches</div>
          <div className="meta" style={{ marginTop: 10 }}>TRY ADJUSTING THE FILTERS</div>
        </div>
      ) : view === 'grid' ? <ProductGrid products={filtered} /> : <ProductList products={filtered} />}
    </AppShell>
  )
}

function Chip({ children, onRemove }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px 4px 10px', borderRadius: 20, fontSize: 12, background: 'var(--paper-2)', border: '1px solid var(--rule)', color: 'var(--ink-2)' }}>
      {children}
      <button onClick={onRemove} style={{ all: 'unset', cursor: 'pointer', color: 'var(--ink-3)', padding: '0 4px' }}>×</button>
    </div>
  )
}

function ProductGrid({ products }) {
  const { setRoute } = useApp()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 22 }}>
      {products.map(p => {
        const key = p.status === 'Pending Review' ? 'pending' : p.status === 'Approved' ? 'approved' : 'archived'
        return (
          <article key={p.id}
            onClick={() => setRoute({ name: 'detail', id: p.id })}
            style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', transition: 'transform .18s, box-shadow .18s, border-color .18s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-2)'; e.currentTarget.style.borderColor = 'var(--ink-3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--rule)' }}
          >
            <div className={`status-bar ${key}`} />
            <div style={{ height: 180, overflow: 'hidden' }}>
              <img src={p.image} alt={p.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <div className="eyebrow">{p.collectionName}</div>
                <div className="meta" style={{ fontSize: 10.5 }}>{new Date(p.uploadDate).toLocaleDateString('en-GB')}</div>
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 420, letterSpacing: '-.01em', margin: '6px 0 8px', lineHeight: 1.2 }}>
                {p.productName}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.supplierName.split(' ').slice(0, 2).join(' ')}</div>
                <Status status={p.status} />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ProductList({ products }) {
  const { setRoute } = useApp()
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '52px 2fr 1.3fr 1fr 1fr 1.4fr 120px', gap: 0, padding: '12px 20px', borderBottom: '1px solid var(--rule)' }}>
        {['', 'Product', 'Supplier', 'Category', 'Color', 'Pipeline', 'Uploaded'].map((h, i) => <div key={i} className="eyebrow">{h}</div>)}
      </div>
      {products.map(p => (
        <div key={p.id} onClick={() => setRoute({ name: 'detail', id: p.id })}
          style={{ display: 'grid', gridTemplateColumns: '52px 2fr 1.3fr 1fr 1fr 1.4fr 120px', gap: 0, padding: '14px 20px', borderBottom: '1px solid var(--rule)', alignItems: 'center', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <div style={{ width: 36, height: 36, borderRadius: 4, overflow: 'hidden' }}>
            <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.productName}</div>
            <div className="meta" style={{ marginTop: 2 }}>{p.collectionName} · {p.season}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{p.supplierName}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{p.category}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{p.color}</div>
          <Pipeline status={p.status} />
          <div className="meta" style={{ textAlign: 'right' }}>{new Date(p.uploadDate).toLocaleDateString('en-GB')}</div>
        </div>
      ))}
    </div>
  )
}

// ── Detail page ───────────────────────────────────────────────────────────────
export function DetailPage() {
  const { route, products, setRoute, updateProduct, addComment, notify, user } = useApp()
  const p = products.find(x => x.id === route.id)

  const [data, setData] = React.useState(null)
  // Bildförbättring
  const [isSharpening, setIsSharpening] = React.useState(false)
  const [enhancedImage, setEnhancedImage] = React.useState(null)
  const [showEnhanced, setShowEnhanced] = React.useState(false)
  // Rumsstaging
  const [roomType, setRoomType] = React.useState('jakobsdal')
  const [roomStyle, setRoomStyle] = React.useState('modern skandinavisk')
  const [isStaging, setIsStaging] = React.useState(false)
  const [stagedImage, setStagedImage] = React.useState(null)
  // Bildvy: 'original' | 'staged'
  const [imageView, setImageView] = React.useState('original')

  // Ladda sparad miljöbild när produkten öppnas
  React.useEffect(() => {
    if (p?.stagedImage) {
      setStagedImage(p.stagedImage)
      setImageView('staged')
    } else {
      setStagedImage(null)
      setImageView('original')
    }
  }, [p?.id])
  // Kommentarer
  const [commentText, setCommentText] = React.useState('')
  // Gemini API-nyckel
  const [geminiKey, setGeminiKeyState] = React.useState(() => getGeminiKey())
  const [showKeyInput, setShowKeyInput] = React.useState(!getGeminiKey())

  React.useEffect(() => {
    if (p) setData({
      productName: p.productName, category: p.category, color: p.color, material: p.material,
      weight: p.weight, weightUnit: p.weightUnit,
      width: p.dimensions.width, height: p.dimensions.height, depth: p.dimensions.depth,
      collectionName: p.collectionName, season: p.season, description: p.description,
      status: p.status,
    })
  }, [p?.id])

  if (!p || !data) {
    return <AppShell nav={null}><div style={{ padding: 60, textAlign: 'center' }}>Not found</div></AppShell>
  }

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const save = () => {
    updateProduct(p.id, {
      ...data,
      weight: +data.weight,
      dimensions: { width: +data.width, height: +data.height, depth: +data.depth },
    })
    notify('Changes saved', 'success')
  }

  const handleQuickSharpen = async () => {
    setIsSharpening(true)
    try {
      const result = await sharpenImage(p.image)
      setEnhancedImage(result)
      setShowEnhanced(true)
      notify('Image sharpened — review and save', 'info')
    } catch (err) {
      notify(err.message || 'Sharpening failed', 'error')
    } finally {
      setIsSharpening(false)
    }
  }

  const handleSaveEnhanced = () => {
    if (!enhancedImage) return
    updateProduct(p.id, { image: enhancedImage })
    setEnhancedImage(null)
    setShowEnhanced(false)
    notify('Enhanced image saved!', 'success')
  }

  const handleStageInRoom = async () => {
    setIsStaging(true)
    setStagedImage(null)
    try {
      const result = await stageInRoom(p.image, roomType, roomStyle)
      setStagedImage(result)
      setImageView('staged')
      const compressed = await compressForStorage(result)
      updateProduct(p.id, { stagedImage: compressed })
      notify('Room image generated!', 'success')
    } catch (err) {
      notify(err.message || 'Room staging failed', 'error')
    } finally {
      setIsStaging(false)
    }
  }

  const handleSaveStaged = () => {
    if (!stagedImage) return
    updateProduct(p.id, { image: stagedImage })
    setStagedImage(null)
    notify('Room image saved as product image!', 'success')
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    addComment(p.id, {
      id: Math.random().toString(36).slice(2),
      author: user.role === 'admin' ? 'HoT Admin' : user.supplier?.name || 'Supplier',
      role: user.role,
      text: commentText.trim(),
      date: new Date().toISOString(),
    })
    setCommentText('')
    notify('Comment added', 'success')
  }

  const displayImage = imageView === 'staged' && stagedImage ? stagedImage
    : showEnhanced && enhancedImage ? enhancedImage
    : p.image

  const nav = (
    <nav className="nav">
      <div className="group">Catalog</div>
      <button onClick={() => setRoute({ name: 'admin' })}><span>← Back to catalog</span></button>
      <div className="group">This product</div>
      <button className="active"><span>Edit details</span></button>
      <button onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}><span>Activity log</span></button>
      <button onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}><span>Comments</span><span className="count">{(p.comments || []).length}</span></button>
      <div className="group">Automated tools</div>
      <button onClick={() => document.getElementById('enhancement-section')?.scrollIntoView({ behavior: 'smooth' })}><span>Image enhancement</span></button>
      <button onClick={() => document.getElementById('staging-section')?.scrollIntoView({ behavior: 'smooth' })}><span>Room staging</span></button>
    </nav>
  )

  return (
    <AppShell nav={nav}
      crumbs={['Catalog', p.supplierName, p.productName]}
      actions={<>
        <Btn variant="ghost" size="sm" onClick={() => setRoute({ name: 'admin' })}>Cancel</Btn>
        <Btn variant="primary" size="sm" onClick={save}>Save changes</Btn>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          <div className="eyebrow">{p.collectionName} · {p.season}</div>
          <h1 className="h1" style={{ marginTop: 8 }}>{p.productName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Status status={p.status} />
              <span className="meta">· ID {p.id}</span>
              <span className="meta">· {p.supplierName}</span>
            </div>
            <div style={{ display: 'flex', border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden' }}>
              <button className="btn" onClick={() => setImageView('original')}
                style={{ borderRadius: 0, padding: '6px 14px', fontSize: 12.5, background: imageView === 'original' ? 'var(--ink)' : 'transparent', color: imageView === 'original' ? 'var(--paper)' : 'var(--ink-2)' }}>
                Original
              </button>
              <button className="btn" onClick={() => stagedImage && setImageView('staged')}
                style={{ borderRadius: 0, padding: '6px 14px', fontSize: 12.5, background: imageView === 'staged' ? 'var(--ink)' : 'transparent', color: stagedImage ? (imageView === 'staged' ? 'var(--paper)' : 'var(--ink-2)') : 'var(--ink-4, var(--rule))', cursor: stagedImage ? 'pointer' : 'not-allowed' }}
                title={stagedImage ? 'Show generated room image' : 'Generate a room image first'}>
                Room view {stagedImage ? '' : '–'}
              </button>
            </div>
          </div>

          {/* Produktbild */}
          <div className="mt-lg" style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <img src={displayImage} alt={p.productName} style={{ width: '100%', display: 'block', maxHeight: 440, objectFit: 'cover' }} />
            {showEnhanced && enhancedImage && (
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'var(--ink)', color: 'var(--paper)', padding: '5px 10px', borderRadius: 4, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Sharpened · preview
              </div>
            )}
          </div>

          {/* Pipeline */}
          <div className="card mt-lg" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="eyebrow">Review pipeline</div>
              <span className="meta">Last update {new Date(p.uploadDate).toLocaleDateString('en-GB')}</span>
            </div>
            <Pipeline status={p.status} />
          </div>

          {/* Image enhancement */}
          <div id="enhancement-section" className="card mt-md" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Image enhancement</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn variant="ghost" size="sm" onClick={handleQuickSharpen} disabled={isSharpening}>
                {isSharpening ? 'Processing…' : 'Quick sharpen'}
              </Btn>
            </div>
            {enhancedImage && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Btn variant="ghost" size="sm" onClick={() => setShowEnhanced(v => !v)}>
                  {showEnhanced ? 'Show original' : 'Show sharpened'}
                </Btn>
                <Btn variant="primary" size="sm" onClick={handleSaveEnhanced}>Save image</Btn>
                <Btn variant="ghost" size="sm" onClick={() => { setEnhancedImage(null); setShowEnhanced(false) }}>Cancel</Btn>
              </div>
            )}
            <div className="meta" style={{ marginTop: 10, textTransform: 'none', letterSpacing: 0, fontSize: 11.5, lineHeight: 1.5 }}>
              Quick sharpen: offline, instant — no API required.
            </div>
          </div>

          {/* Room staging */}
          <div id="staging-section" className="card mt-md" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="eyebrow">Room staging</div>
              <button onClick={() => setShowKeyInput(v => !v)}
                style={{ all: 'unset', cursor: 'pointer', fontSize: 11.5, color: geminiKey ? 'var(--sage)' : 'var(--ochre)', letterSpacing: '.08em' }}>
                {geminiKey ? '● API key saved' : '● Add API key'}
              </button>
            </div>
            {showKeyInput && (
              <div style={{ marginBottom: 14 }}>
                <Field label="Gemini API key">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="password"
                      className="control"
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={e => setGeminiKeyState(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                    />
                    <Btn variant="primary" size="sm" onClick={() => { setGeminiKey(geminiKey); setShowKeyInput(false); notify('API key saved', 'success') }}>Save</Btn>
                  </div>
                </Field>
                <div className="meta" style={{ marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>
                  Stored locally in your browser — never sent anywhere else.
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field label="Room type">
                <Select value={roomType} onChange={e => setRoomType(e.target.value)}>
                  <optgroup label="HoT environments">
                    <option value="jakobsdal">Jakobsdal (AI)</option>
                  </optgroup>
                  <optgroup label="Generated rooms">
                    <option value="vardagsrum">Living room</option>
                    <option value="sovrum">Bedroom</option>
                    <option value="matsal">Dining room</option>
                    <option value="kontor">Office</option>
                  </optgroup>
                </Select>
              </Field>
              <Field label="Style">
                <Select value={roomStyle} onChange={e => setRoomStyle(e.target.value)}>
                  <option value="modern skandinavisk">Modern Scandinavian</option>
                  <option value="minimalistisk">Minimalist</option>
                  <option value="industriell">Industrial</option>
                  <option value="bohemisk">Bohemian</option>
                  <option value="klassisk">Classic</option>
                  <option value="japansk zen">Japanese Zen</option>
                </Select>
              </Field>
            </div>
            <Btn variant="primary" size="sm" full onClick={handleStageInRoom} disabled={isStaging}>
              {isStaging ? 'Gemini is generating…' : 'Generate room image'}
            </Btn>
            {isStaging && (
              <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>
                Jakobsdal: AI generation takes 10–30 seconds…
              </div>
            )}
            {stagedImage && (
              <div style={{ marginTop: 16 }}>
                <img src={stagedImage} alt="Generated room image" style={{ width: '100%', borderRadius: 4, border: '1px solid var(--rule)' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn variant="primary" size="sm" onClick={handleSaveStaged}>Use as product image</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => { setStagedImage(null); setImageView('original'); updateProduct(p.id, { stagedImage: null }) }}>Discard</Btn>
                </div>
              </div>
            )}
            <div className="meta" style={{ marginTop: 10, textTransform: 'none', letterSpacing: 0, fontSize: 11.5, lineHeight: 1.5 }}>
              Jakobsdal: Gemini AI — correct lighting, shadows and perspective.<br />
              Other rooms: offline canvas compositing.
            </div>
          </div>

          {/* Comments */}
          <div id="comments-section" className="card mt-md" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Comments</div>
            {(p.comments || []).length === 0 && (
              <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 14 }}>No comments yet.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {(p.comments || []).map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.role === 'admin' ? 'var(--ink)' : 'var(--accent)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {c.author[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.author}</span>
                      <span className="meta">{new Date(c.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="control"
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              />
              <Btn variant="primary" size="sm" onClick={handleAddComment}>Send</Btn>
            </div>
          </div>
        </div>

        {/* RIGHT — data sheet */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className="eyebrow">Data sheet</div>
            <h2 className="h2" style={{ marginTop: 8, marginBottom: 20 }}>Edit details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Product name" required>
                  <Input value={data.productName} onChange={e => set('productName', e.target.value)} />
                </Field>
              </div>
              <Field label="Category">
                <Select value={data.category} onChange={e => set('category', e.target.value)}>
                  {['Sofa', 'Chair', 'Table', 'Fabric', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={data.status} onChange={e => set('status', e.target.value)}>
                  {['Pending Review', 'Approved', 'Archived'].map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Color"><Input value={data.color} onChange={e => set('color', e.target.value)} /></Field>
              <Field label="Material"><Input value={data.material} onChange={e => set('material', e.target.value)} /></Field>
              <Field label="Collection"><Input value={data.collectionName} onChange={e => set('collectionName', e.target.value)} /></Field>
              <Field label="Season"><Input value={data.season} onChange={e => set('season', e.target.value)} /></Field>
              <Field label="Weight">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 6 }}>
                  <Input type="number" value={data.weight} onChange={e => set('weight', e.target.value)} />
                  <Select value={data.weightUnit} onChange={e => set('weightUnit', e.target.value)}>
                    <option>kg</option><option>g</option>
                  </Select>
                </div>
              </Field>
              <div />
              <Field label="Width (cm)"><Input type="number" value={data.width} onChange={e => set('width', e.target.value)} /></Field>
              <Field label="Height (cm)"><Input type="number" value={data.height} onChange={e => set('height', e.target.value)} /></Field>
              <Field label="Depth (cm)"><Input type="number" value={data.depth} onChange={e => set('depth', e.target.value)} /></Field>
              <div />
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Description">
                  <Textarea rows={4} value={data.description} onChange={e => set('description', e.target.value)} />
                </Field>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
              <Btn variant="danger" size="sm" onClick={() => { updateProduct(p.id, { status: 'Archived' }); notify('Product archived', 'info'); setRoute({ name: 'admin' }) }}>Archive product</Btn>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onClick={() => setRoute({ name: 'admin' })}>Cancel</Btn>
                <Btn variant="primary" size="sm" onClick={save}>Save changes</Btn>
              </div>
            </div>
          </div>
          <div className="meta mt-md" style={{ padding: '0 4px' }}>
            CHANGES ARE LOGGED · LAST EDIT {new Date(p.uploadDate).toLocaleString('en-GB')}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
