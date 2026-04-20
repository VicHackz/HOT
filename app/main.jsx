import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider, useApp } from './state.jsx'
import { Toasts } from './components.jsx'
import { LoginPage } from './pages/Login.jsx'
import { SupplierPage, AppShell } from './pages/Supplier.jsx'
import { AdminPage, DetailPage } from './pages/Admin.jsx'

const TWEAKS = {
  accentHue: 45,
  serifDisplay: true,
  statusStyle: 'bar',
  density: 'airy',
}

function applyTweaks(t) {
  const r = document.documentElement.style
  r.setProperty('--accent',     `oklch(55% 0.11 ${t.accentHue})`)
  r.setProperty('--accent-2',   `oklch(62% 0.09 ${t.accentHue})`)
  r.setProperty('--accent-ink', `oklch(35% 0.09 ${t.accentHue})`)
  document.body.dataset.density = t.density
  document.body.dataset.statusStyle = t.statusStyle
}

function TweakPanelInline({ values, onChange, onClose }) {
  const update = (k, v) => {
    const next = { ...values, [k]: v }
    onChange(next)
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*')
  }
  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, width: 300,
      background: 'var(--paper)', border: '1px solid var(--rule)',
      borderRadius: 8, boxShadow: 'var(--shadow-2)', padding: 18, zIndex: 300,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>Tweaks</div>
        <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}>×</button>
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Accent hue · {values.accentHue}°</label>
        <input type="range" min="0" max="360" value={values.accentHue} onChange={e => update('accentHue', +e.target.value)} />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[38, 18, 85, 145, 220, 300].map(h => (
            <button key={h} onClick={() => update('accentHue', h)}
              style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--rule)', cursor: 'pointer', background: `oklch(55% 0.11 ${h})` }} />
          ))}
        </div>
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Density</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['airy', 'compact'].map(v => (
            <button key={v} onClick={() => update('density', v)}
              className={`btn ${values.density === v ? 'primary' : 'ghost'} sm`}>{v}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Status style</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['bar', 'badge'].map(v => (
            <button key={v} onClick={() => update('statusStyle', v)}
              className={`btn ${values.statusStyle === v ? 'primary' : 'ghost'} sm`}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Router() {
  const { user, route } = useApp()
  if (!user || route.name === 'login') return <LoginPage />
  if (route.name === 'detail') return <DetailPage />
  if (user.role === 'admin') return <AdminPage />
  return <SupplierPage />
}

function Root() {
  const [tweaks, setTweaks] = React.useState(TWEAKS)
  const [editMode, setEditMode] = React.useState(false)
  React.useEffect(() => { applyTweaks(tweaks) }, [tweaks])
  React.useEffect(() => {
    const h = (e) => {
      if (!e.data) return
      if (e.data.type === '__activate_edit_mode') setEditMode(true)
      if (e.data.type === '__deactivate_edit_mode') setEditMode(false)
    }
    window.addEventListener('message', h)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')
    return () => window.removeEventListener('message', h)
  }, [])
  return (
    <AppProvider>
      <Router />
      <Toasts />
      {editMode && <TweakPanelInline values={tweaks} onChange={setTweaks} onClose={() => setEditMode(false)} />}
    </AppProvider>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(<Root />)
