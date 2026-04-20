import React from 'react'

export const SUPPLIERS = [
  { id: 'sup1', name: 'Nordic Textiles AB',    country: 'Sweden',  city: 'Borås' },
  { id: 'sup2', name: 'Bangalore Fabrics Ltd', country: 'India',   city: 'Bangalore' },
  { id: 'sup3', name: 'Milano Design House',   country: 'Italy',   city: 'Milan' },
  { id: 'sup4', name: 'Copenhagen Interiors',  country: 'Denmark', city: 'Copenhagen' },
  { id: 'sup5', name: 'Istanbul Textile Co',   country: 'Turkey',  city: 'Istanbul' },
]

// [id, supplierId, supplierName, productName, category, color, material, weight, weightUnit,
//  [w,h,d], collectionName, season, description, status, uploadDate]
const PRODUCT_SEED = [
  ['prod1','sup1','Nordic Textiles AB','Stockholm Linen Sofa','Sofa','Natural Beige','Linen',85,'kg',[220,85,95],'Nordic Essentials','SS 24','Minimalist three-seater with clean lines and sustainable linen upholstery.','Approved','2024-02-15'],
  ['prod2','sup1','Nordic Textiles AB','Göteborg Oak Chair','Chair','Oak Brown','Oak Wood',12,'kg',[55,82,60],'Scandinavian Classics','AW 24','Solid oak dining chair with ergonomic design.','Pending Review','2024-03-20'],
  ['prod3','sup1','Nordic Textiles AB','Aurora Wool Blend','Fabric','Nordic Gray','Wool Blend',450,'g',[150,0,0],'Winter Warmth','AW 24','Soft wool blend, 60% wool / 40% cotton.','Approved','2024-01-10'],
  ['prod4','sup1','Nordic Textiles AB','Malmö Coffee Table','Table','Walnut','Walnut Wood',28,'kg',[120,45,70],'Nordic Essentials','SS 24','Modern coffee table with hidden storage compartment.','Approved','2024-02-28'],
  ['prod5','sup2','Bangalore Fabrics Ltd','Monsoon Silk Collection','Fabric','Deep Emerald','Pure Silk',220,'g',[140,0,0],'Indian Heritage','SS 24','Hand-woven silk with traditional patterns.','Pending Review','2024-03-25'],
  ['prod6','sup2','Bangalore Fabrics Ltd','Jaipur Velvet Sofa','Sofa','Royal Blue','Velvet',92,'kg',[200,90,100],'Palace Dreams','AW 24','Velvet sofa with hand-carved wooden legs.','Approved','2024-02-05'],
  ['prod7','sup2','Bangalore Fabrics Ltd','Delhi Lounge Chair','Chair','Terracotta','Cotton Canvas',15,'kg',[75,85,80],'Urban Comfort','SS 24','Relaxed lounge chair with sustainable cotton upholstery.','Approved','2024-03-01'],
  ['prod8','sup2','Bangalore Fabrics Ltd','Kerala Cotton Blend','Fabric','Ivory White','Cotton Blend',380,'g',[160,0,0],'Coastal Breeze','SS 24','Light, breathable cotton blend.','Archived','2023-12-10'],
  ['prod9','sup3','Milano Design House','Firenze Leather Sofa','Sofa','Cognac Brown','Italian Leather',110,'kg',[240,80,105],'Luxury Living','AW 24','Full-grain Italian leather sectional sofa.','Approved','2024-03-15'],
  ['prod10','sup3','Milano Design House','Venezia Dining Chair','Chair','Charcoal','Velvet',9,'kg',[50,90,58],'Modern Elegance','SS 24','Sleek dining chair with brass accents.','Pending Review','2024-04-01'],
  ['prod11','sup3','Milano Design House','Roma Marble Table','Table','White Carrara','Marble',65,'kg',[180,75,90],'Timeless Classics','Year Round','Dining table with genuine Carrara marble top.','Approved','2024-02-20'],
  ['prod12','sup3','Milano Design House','Tuscany Linen Premium','Fabric','Sage Green','Linen',520,'g',[145,0,0],'Mediterranean','SS 24','Heavy-weight Italian linen with natural texture.','Approved','2024-01-25'],
  ['prod13','sup4','Copenhagen Interiors','Hygge Modular Sofa','Sofa','Warm Gray','Wool Bouclé',78,'kg',[250,75,110],'Danish Comfort','AW 24','Cozy modular sofa system with bouclé upholstery.','Pending Review','2024-04-05'],
  ['prod14','sup4','Copenhagen Interiors','Aarhus Accent Chair','Chair','Mustard Yellow','Velvet',13,'kg',[70,80,75],'Color Pop','SS 24','Statement chair with curved silhouette.','Approved','2024-03-10'],
  ['prod15','sup4','Copenhagen Interiors','Nordic Dining Table','Table','Natural Ash','Ash Wood',45,'kg',[200,74,95],'Simple Living','Year Round','Extendable dining table, minimalist design.','Approved','2024-02-12'],
  ['prod16','sup4','Copenhagen Interiors','Danish Wool Cushions','Other','Multi-color','Merino Wool',800,'g',[50,50,15],'Cozy Accessories','AW 24','Set of 4 handmade wool cushions, geometric patterns.','Approved','2024-03-05'],
  ['prod17','sup5','Istanbul Textile Co','Bosphorus Silk Damask','Fabric','Burgundy Red','Silk',380,'g',[135,0,0],'Ottoman Legacy','AW 24','Damask pattern on pure silk base.','Approved','2024-02-18'],
  ['prod18','sup5','Istanbul Textile Co','Ankara Corner Sofa','Sofa','Slate Blue','Cotton Velvet',105,'kg',[280,85,180],'Contemporary Turkish','SS 24','Spacious L-shaped sofa with deep seating.','Pending Review','2024-04-08'],
  ['prod19','sup5','Istanbul Textile Co','Izmir Armchair','Chair','Copper Orange','Leather',18,'kg',[80,88,85],'Heritage','AW 24','Traditional armchair with hand-tooled leather.','Archived','2023-11-20'],
  ['prod20','sup5','Istanbul Textile Co','Cappadocia Kilim','Fabric','Earth Tones','Wool',650,'g',[120,0,0],'Artisan Textiles','Year Round','Hand-woven kilim fabric, Anatolian patterns.','Approved','2024-01-30'],
]

// Unsplash-bilder per produkt — väljs utifrån kategori och leverantör
const PRODUCT_IMAGES = {
  // Nordic Textiles AB — skandinavisk stil
  prod1:  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=400', // linen sofa
  prod2:  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&h=400', // oak chair
  prod3:  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&h=400', // wool fabric
  prod4:  'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&h=400', // coffee table
  // Bangalore Fabrics Ltd — indisk/färgstark
  prod5:  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&h=400', // silk fabric
  prod6:  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&h=400', // velvet sofa
  prod7:  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=600&h=400', // lounge chair
  prod8:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=400', // cotton fabric
  // Milano Design House — italiensk/lyxig
  prod9:  'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=600&h=400', // leather sofa
  prod10: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&h=400', // dining chair
  prod11: 'https://images.unsplash.com/photo-1549619856-ac562a11cd7a?auto=format&fit=crop&w=600&h=400', // marble table
  prod12: 'https://images.unsplash.com/photo-1614252069372-4f0e32d0dd9a?auto=format&fit=crop&w=600&h=400', // linen fabric
  // Copenhagen Interiors — danskt/design
  prod13: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd3?auto=format&fit=crop&w=600&h=400', // modular sofa
  prod14: 'https://images.unsplash.com/photo-1581467655410-0c2aa927d1a5?auto=format&fit=crop&w=600&h=400', // accent chair
  prod15: 'https://images.unsplash.com/photo-1530018352490-c6eef07fd7e0?auto=format&fit=crop&w=600&h=400', // dining table
  prod16: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&h=400', // cushions
  // Istanbul Textile Co — turkisk/traditionell
  prod17: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&h=400', // silk damask
  prod18: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&h=400', // corner sofa
  prod19: 'https://images.unsplash.com/photo-1586105851489-a4c7c2c2e36d?auto=format&fit=crop&w=600&h=400', // armchair
  prod20: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=600&h=400', // kilim/rug
}

const INITIAL_PRODUCTS = PRODUCT_SEED.map(r => ({
  id: r[0], supplierId: r[1], supplierName: r[2],
  productName: r[3], category: r[4], color: r[5], material: r[6],
  weight: r[7], weightUnit: r[8],
  dimensions: { width: r[9][0], height: r[9][1], depth: r[9][2] },
  collectionName: r[10], season: r[11], description: r[12],
  status: r[13], uploadDate: r[14],
  image: PRODUCT_IMAGES[r[0]] || `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=400`,
  comments: [],
}))

// ── localStorage helpers ──
const STORAGE_KEY = 'hot-portal-data'
const STORAGE_VERSION = '2' // öka när seed-data ändras för att tvinga omstart
const IMAGE_PREFIX = 'hot-img-'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== STORAGE_VERSION) return null // tvinga ny seed-data
    // Återställ base64-bilder som lagrats separat
    return (data.products || []).map(p => {
      let out = { ...p }
      if (typeof p.image === 'string' && p.image.startsWith(IMAGE_PREFIX)) {
        const stored = localStorage.getItem(p.image)
        if (stored) out = { ...out, image: stored }
      }
      if (typeof p.stagedImage === 'string' && p.stagedImage.startsWith(IMAGE_PREFIX)) {
        const stored = localStorage.getItem(p.stagedImage)
        if (stored) out = { ...out, stagedImage: stored }
      }
      return out
    })
  } catch {
    return null
  }
}

function saveToStorage(products) {
  const forStorage = products.map(p => {
    let out = { ...p }
    if (typeof p.image === 'string' && p.image.startsWith('data:')) {
      try { localStorage.setItem(IMAGE_PREFIX + p.id, p.image) } catch { /* kvot full */ }
      out = { ...out, image: IMAGE_PREFIX + p.id }
    }
    if (typeof p.stagedImage === 'string' && p.stagedImage.startsWith('data:')) {
      try { localStorage.setItem(IMAGE_PREFIX + 'staged-' + p.id, p.stagedImage) } catch { /* kvot full */ }
      out = { ...out, stagedImage: IMAGE_PREFIX + 'staged-' + p.id }
    }
    return out
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, products: forStorage }))
  } catch { /* kvot full */ }
}

// ── Context ──
const AppCtx = React.createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('hot-user')) ?? null } catch { return null }
  })
  const [products, setProducts] = React.useState(() => loadFromStorage() ?? INITIAL_PRODUCTS)
  const [route, setRoute] = React.useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('hot-user') ?? 'null')
      return u ? { name: u.role === 'admin' ? 'admin' : 'supplier' } : { name: 'login' }
    } catch { return { name: 'login' } }
  })
  const [toasts, setToasts] = React.useState([])

  React.useEffect(() => { saveToStorage(products) }, [products])
  React.useEffect(() => {
    if (user) localStorage.setItem('hot-user', JSON.stringify(user))
    else localStorage.removeItem('hot-user')
  }, [user])

  const notify = (msg, kind = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const logout = () => { setUser(null); setRoute({ name: 'login' }) }

  const updateProduct = (id, patch) =>
    setProducts(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p))

  const addProduct = (p) => setProducts(ps => [p, ...ps])

  const addComment = (productId, comment) =>
    setProducts(ps => ps.map(p =>
      p.id === productId ? { ...p, comments: [...(p.comments || []), comment] } : p
    ))

  const value = {
    user, setUser, products, suppliers: SUPPLIERS,
    route, setRoute, notify, toasts,
    removeToast: id => setToasts(t => t.filter(x => x.id !== id)),
    logout, updateProduct, addProduct, addComment,
  }
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const useApp = () => React.useContext(AppCtx)
