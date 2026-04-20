// ── Gemini ────────────────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash-image'

export function getGeminiKey() {
  return localStorage.getItem('hot-gemini-key') || ''
}
export function setGeminiKey(key) {
  localStorage.setItem('hot-gemini-key', key)
}
const STAGING_PROMPT =
  'You are given a product image and a room image. ' +
  'You MUST composite the product naturally and realistically into the room scene. ' +
  'If there is a rug or carpet visible in the room, you MUST place the product directly on top of the rug — the product legs or base must rest on the rug surface, not float above it or sit beside it. ' +
  'Match lighting, shadows, perspective and scale precisely to the room. ' +
  'Cast a realistic shadow beneath the product that matches the room lighting direction and surface. ' +
  'The result must look like a professional interior photograph — indistinguishable from a real photo. ' +
  'Do not add any other furniture or objects. ' +
  'Return only the final composited room image.'

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Kunde inte ladda bild: ${src}`))
    img.src = src
  })
}

async function imageInputToBase64(input) {
  if (input.startsWith('data:')) {
    return { data: input.split(',')[1], mimeType: input.split(';')[0].split(':')[1] }
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        resolve({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
      } catch (e) {
        reject(new Error(`Canvas-konvertering misslyckades: ${e}`))
      }
    }
    img.onerror = () => reject(new Error(`Kunde inte ladda bild: ${input}`))
    img.src = input
  })
}

// ── Canvas-skärpning (offline) ────────────────────────────────────────────────
export async function sharpenImage(base64DataUrl) {
  const img = await loadImage(base64DataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const src = imageData.data
  const out = new Uint8ClampedArray(src.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        out[i] = src[i]; out[i+1] = src[i+1]; out[i+2] = src[i+2]; out[i+3] = src[i+3]
        continue
      }
      const top    = ((y-1) * width + x) * 4
      const bottom = ((y+1) * width + x) * 4
      const left   = (y * width + (x-1)) * 4
      const right  = (y * width + (x+1)) * 4
      for (let c = 0; c < 3; c++) {
        out[i+c] = Math.min(255, Math.max(0,
          5 * src[i+c] - src[top+c] - src[bottom+c] - src[left+c] - src[right+c]
        ))
      }
      out[i+3] = src[i+3]
    }
  }
  ctx.putImageData(new ImageData(out, width, height), 0, 0)
  return canvas.toDataURL('image/jpeg', 0.92)
}

// ── Bakgrundsborttagning via BFS flood-fill ───────────────────────────────────
async function removeBackground(base64DataUrl, tolerance = 30) {
  const img = await loadImage(base64DataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const w = canvas.width, h = canvas.height

  const corners = [0, (w-1)*4, (h-1)*w*4, ((h-1)*w+w-1)*4]
  let bgR = 0, bgG = 0, bgB = 0
  for (const c of corners) { bgR += data[c]; bgG += data[c+1]; bgB += data[c+2] }
  bgR = Math.round(bgR/4); bgG = Math.round(bgG/4); bgB = Math.round(bgB/4)

  const visited = new Uint8Array(w * h)
  const queue = []
  for (const startPx of [0, w-1, (h-1)*w, (h-1)*w+w-1]) {
    if (!visited[startPx]) { visited[startPx] = 1; queue.push(startPx) }
  }

  while (queue.length > 0) {
    const px = queue.pop()
    const i = px * 4
    if (Math.abs(data[i]-bgR) > tolerance || Math.abs(data[i+1]-bgG) > tolerance || Math.abs(data[i+2]-bgB) > tolerance) continue
    data[i+3] = 0
    const x = px % w, y = Math.floor(px / w)
    if (x > 0     && !visited[px-1]) { visited[px-1] = 1; queue.push(px-1) }
    if (x < w-1   && !visited[px+1]) { visited[px+1] = 1; queue.push(px+1) }
    if (y > 0     && !visited[px-w]) { visited[px-w] = 1; queue.push(px-w) }
    if (y < h-1   && !visited[px+w]) { visited[px+w] = 1; queue.push(px+w) }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function findContentBottomFraction(img) {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth; c.height = img.naturalHeight
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, c.width, c.height).data
  for (let y = c.height-1; y >= 0; y--) {
    for (let x = 0; x < c.width; x++) {
      if (data[(y*c.width+x)*4+3] > 15) return y / c.height
    }
  }
  return 1.0
}

// ── Canvas-genererade rum (fallback) ─────────────────────────────────────────
const ROOM_PALETTES = {
  'modern skandinavisk': { wall: ['#ede8e1','#d9d2c8'], floor: ['#c8a87a','#a8845a'] },
  'minimalistisk':       { wall: ['#f0eeeb','#e2ddd8'], floor: ['#b8a080','#9a7e60'] },
  'industriell':         { wall: ['#d0cbc4','#b8b2aa'], floor: ['#8a7060','#6e5848'] },
  'bohemisk':            { wall: ['#e8ddd0','#d4c4b0'], floor: ['#c0905c','#a07040'] },
  'klassisk':            { wall: ['#ece6da','#d8d0c0'], floor: ['#a88860','#886840'] },
  'japansk zen':         { wall: ['#e8e4dc','#d4cfc6'], floor: ['#b8a07a','#9a8060'] },
}

function drawRoom(width, height, style) {
  const palette = ROOM_PALETTES[style.toLowerCase()] ?? ROOM_PALETTES['modern skandinavisk']
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')
  const floorY = height * 0.60

  const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY)
  wallGrad.addColorStop(0, palette.wall[0]); wallGrad.addColorStop(1, palette.wall[1])
  ctx.fillStyle = wallGrad; ctx.fillRect(0, 0, width, floorY)

  const floorGrad = ctx.createLinearGradient(0, floorY, 0, height)
  floorGrad.addColorStop(0, palette.floor[0]); floorGrad.addColorStop(1, palette.floor[1])
  ctx.fillStyle = floorGrad; ctx.fillRect(0, floorY, width, height - floorY)

  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, floorY-5, width, 5)

  const winGrad = ctx.createLinearGradient(0, 0, width*0.42, 0)
  winGrad.addColorStop(0, 'rgba(255,248,220,0.36)'); winGrad.addColorStop(1, 'rgba(255,248,220,0)')
  ctx.fillStyle = winGrad; ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.95)
}

function compositeProduct(ctx, roomW, roomH, productImg, floorY = 0.82, centerX = 0.52) {
  const maxW = roomW * 0.52, maxH = roomH * 0.58
  const scale = Math.min(maxW / productImg.naturalWidth, maxH / productImg.naturalHeight)
  const pW = productImg.naturalWidth * scale
  const pH = productImg.naturalHeight * scale
  const visibleH = pH * findContentBottomFraction(productImg)
  const floorPxY = roomH * floorY
  const pX = roomW * centerX - pW / 2
  const pY = floorPxY - visibleH

  ctx.save()
  ctx.filter = 'blur(18px)'
  ctx.fillStyle = 'rgba(160,130,90,0.35)'
  ctx.beginPath()
  ctx.ellipse(pX + pW/2, floorPxY + 4, pW*0.36, roomH*0.028, 0, 0, Math.PI*2)
  ctx.fill()
  ctx.restore()

  ctx.drawImage(productImg, pX, pY, pW, pH)

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(255,240,210,0.10)'
  ctx.fillRect(pX, pY, pW, pH)
  ctx.restore()
}

// ── Gemini AI-rumsstaging ─────────────────────────────────────────────────────
async function stageWithGemini(productImageInput) {
  let product, room
  try {
    ;[product, room] = await Promise.all([
      imageInputToBase64(productImageInput),
      imageInputToBase64('/rooms/jakobsdal.jpg'),
    ])
  } catch (e) {
    throw new Error(`Kunde inte ladda bilderna: ${e instanceof Error ? e.message : e}`)
  }

  const apiKey = getGeminiKey()
  if (!apiKey) throw new Error('Gemini API-nyckel saknas — ange den i staging-panelen')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: STAGING_PROMPT },
            { inlineData: { mimeType: product.mimeType, data: product.data } },
            { inlineData: { mimeType: room.mimeType,    data: room.data    } },
          ],
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err?.error?.message ?? `Gemini-anrop misslyckades (HTTP ${res.status})`)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
  if (!imgPart?.inlineData) throw new Error('Gemini returnerade ingen bild')
  return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`
}

// ── Komprimera bild för localStorage (max 900px, 0.75 kvalitet) ──────────────
export async function compressForStorage(dataUrl, maxSize = 900, quality = 0.75) {
  const img = await loadImage(dataUrl)
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

// ── Exporterad: stageInRoom ───────────────────────────────────────────────────
export async function stageInRoom(productImage, roomType, style) {
  if (roomType === 'jakobsdal') {
    return stageWithGemini(productImage)
  }

  // Canvas-compositing för övriga rum
  const productNoBg = await removeBackground(productImage)
  const productImg  = await loadImage(productNoBg)
  const roomW = 1024, roomH = 768
  const roomDataUrl = drawRoom(roomW, roomH, style)
  const roomImg = await loadImage(roomDataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = roomW; canvas.height = roomH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(roomImg, 0, 0)
  compositeProduct(ctx, roomW, roomH, productImg)

  return canvas.toDataURL('image/jpeg', 0.93)
}
