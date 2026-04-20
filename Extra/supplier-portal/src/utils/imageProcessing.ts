const HF_API = 'https://api-inference.huggingface.co/models';

async function base64ToBlob(base64DataUrl: string): Promise<Blob> {
  const res = await fetch(base64DataUrl);
  return res.blob();
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Kunde inte ladda bild'));
    img.src = src;
  });
}

// Canvas-baserad skärpning — snabb, offline, ingen API
export async function sharpenImage(base64DataUrl: string): Promise<string> {
  const img = await loadImage(base64DataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  ctx.drawImage(img, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        out[i] = src[i]; out[i + 1] = src[i + 1];
        out[i + 2] = src[i + 2]; out[i + 3] = src[i + 3];
        continue;
      }
      const top    = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left   = (y * width + (x - 1)) * 4;
      const right  = (y * width + (x + 1)) * 4;
      for (let c = 0; c < 3; c++) {
        out[i + c] = 5 * src[i + c] - src[top + c] - src[bottom + c]
                                     - src[left + c] - src[right + c];
      }
      out[i + 3] = src[i + 3];
    }
  }

  ctx.putImageData(new ImageData(out, width, height), 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

// AI-uppskaling via Real-ESRGAN (Hugging Face)
export async function upscaleImage(base64DataUrl: string, hfToken: string): Promise<string> {
  const blob = await base64ToBlob(base64DataUrl);

  const response = await fetch(`${HF_API}/ai-forever/Real-ESRGAN`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: blob,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    if (response.status === 503) {
      const wait = (err as { estimated_time?: number }).estimated_time ?? 30;
      throw new Error(`Modellen laddas — försök igen om ${Math.ceil(wait)} sekunder`);
    }
    throw new Error((err as { error?: string }).error ?? 'AI-uppskaling misslyckades');
  }

  const resultBlob = await response.blob();
  return blobToBase64(resultBlob);
}

// Ta bort vit/grå studiobakgrund via BFS flood-fill från hörnen
async function removeBackground(base64DataUrl: string, tolerance = 30): Promise<string> {
  const img = await loadImage(base64DataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width, h = canvas.height;

  // Sampla bakgrundsfärg från de fyra hörnen
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const c of corners) { bgR += data[c]; bgG += data[c + 1]; bgB += data[c + 2]; }
  bgR = Math.round(bgR / 4); bgG = Math.round(bgG / 4); bgB = Math.round(bgB / 4);

  // BFS flood-fill
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  for (const startPx of [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1]) {
    if (!visited[startPx]) { visited[startPx] = 1; queue.push(startPx); }
  }

  while (queue.length > 0) {
    const px = queue.pop()!;
    const i = px * 4;
    if (
      Math.abs(data[i]     - bgR) > tolerance ||
      Math.abs(data[i + 1] - bgG) > tolerance ||
      Math.abs(data[i + 2] - bgB) > tolerance
    ) continue;

    data[i + 3] = 0;

    const x = px % w, y = Math.floor(px / w);
    if (x > 0     && !visited[px - 1]) { visited[px - 1] = 1; queue.push(px - 1); }
    if (x < w - 1 && !visited[px + 1]) { visited[px + 1] = 1; queue.push(px + 1); }
    if (y > 0     && !visited[px - w]) { visited[px - w] = 1; queue.push(px - w); }
    if (y < h - 1 && !visited[px + w]) { visited[px + w] = 1; queue.push(px + w); }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

// Hitta den faktiska bottenkanten på produkten (första icke-transparenta raden nerifrån)
// Returnerar en fraktion 0–1 av bildens höjd
function findContentBottomFraction(img: HTMLImageElement): number {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let y = c.height - 1; y >= 0; y--) {
    for (let x = 0; x < c.width; x++) {
      if (data[(y * c.width + x) * 4 + 3] > 15) return y / c.height;
    }
  }
  return 1.0;
}

// ── Preset-rum ────────────────────────────────────────────────────────────────
// Riktiga bakgrundsbilder från /public/rooms/ + exakta placeringsparametrar
// floorY   = var golvet/mattan syns i bilden (fraktion 0–1 av bildens höjd)
// centerX  = horisontellt centrum för produkten (fraktion 0–1)
// maxW/H   = max storlek för produkten relativt rumsbilden

interface RoomPreset {
  imagePath: string;
  floorY: number;
  centerX: number;
  maxW: number;
  maxH: number;
  shadowColor: string;   // RGB
  shadowBlur: number;
  shadowOpacity: number;
}

const ROOM_PRESETS: Record<string, RoomPreset> = {
  jakobsdal: {
    imagePath:     '/rooms/jakobsdal.jpg',
    floorY:        0.82,   // mattan/golvytan i Korrekt.jpg
    centerX:       0.52,
    maxW:          0.50,
    maxH:          0.55,
    shadowColor:   '160, 130, 90',  // varm jutamatta-ton
    shadowBlur:    22,
    shadowOpacity: 0.40,
  },
};

// ── Canvas-ritad rumsbakgrund (fallback) ──────────────────────────────────────
const ROOM_PALETTES: Record<string, { wall: string[]; floor: string[] }> = {
  'modern skandinavisk': { wall: ['#ede8e1', '#d9d2c8'], floor: ['#c8a87a', '#a8845a'] },
  'minimalistisk':       { wall: ['#f0eeeb', '#e2ddd8'], floor: ['#b8a080', '#9a7e60'] },
  'industriell':         { wall: ['#d0cbc4', '#b8b2aa'], floor: ['#8a7060', '#6e5848'] },
  'bohemisk':            { wall: ['#e8ddd0', '#d4c4b0'], floor: ['#c0905c', '#a07040'] },
  'klassisk':            { wall: ['#ece6da', '#d8d0c0'], floor: ['#a88860', '#886840'] },
  'japansk zen':         { wall: ['#e8e4dc', '#d4cfc6'], floor: ['#b8a07a', '#9a8060'] },
};

function drawRoom(width: number, height: number, style: string): string {
  const palette = ROOM_PALETTES[style.toLowerCase()] ?? ROOM_PALETTES['modern skandinavisk'];
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const floorY = height * 0.60;

  const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
  wallGrad.addColorStop(0, palette.wall[0]);
  wallGrad.addColorStop(1, palette.wall[1]);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, floorY);

  const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
  floorGrad.addColorStop(0, palette.floor[0]);
  floorGrad.addColorStop(1, palette.floor[1]);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, width, height - floorY);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, floorY - 5, width, 5);

  const winGrad = ctx.createLinearGradient(0, 0, width * 0.42, 0);
  winGrad.addColorStop(0, 'rgba(255,248,220,0.36)');
  winGrad.addColorStop(1, 'rgba(255,248,220,0)');
  ctx.fillStyle = winGrad;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ── Komposit-hjälpare ─────────────────────────────────────────────────────────

function compositeProduct(
  ctx: CanvasRenderingContext2D,
  roomW: number,
  roomH: number,
  productImg: HTMLImageElement,
  preset: RoomPreset | null,
  style: string,
) {
  // Placeringsparametrar — preset eller generisk
  const floorY   = preset?.floorY        ?? 0.82;
  const centerX  = preset?.centerX       ?? 0.50;
  const maxWr    = preset?.maxW          ?? 0.52;
  const maxHr    = preset?.maxH          ?? 0.58;
  const sColor   = preset?.shadowColor   ?? '0,0,0';
  const sBlur    = preset?.shadowBlur    ?? 18;
  const sOpacity = preset?.shadowOpacity ?? 0.28;

  // Skala produkten
  const maxW = roomW * maxWr;
  const maxH = roomH * maxHr;
  const scale = Math.min(maxW / productImg.naturalWidth, maxH / productImg.naturalHeight);
  const pW = productImg.naturalWidth * scale;
  const pH = productImg.naturalHeight * scale;

  // Hitta var produkten faktiskt slutar nedtill (transparent-padding ignoreras)
  const contentBottom = findContentBottomFraction(productImg); // 0–1
  const visibleH = pH * contentBottom; // faktisk synlig höjd efter skalning

  // Placera så att produktens faktiska botten hamnar på golvet
  const floorPxY = roomH * floorY;
  const pX = roomW * centerX - pW / 2;
  const pY = floorPxY - visibleH;

  // Skugga på golvet/mattan
  ctx.save();
  ctx.filter = `blur(${sBlur}px)`;
  ctx.fillStyle = `rgba(${sColor}, ${sOpacity})`;
  ctx.beginPath();
  ctx.ellipse(
    pX + pW / 2,
    floorPxY + 4,
    pW * 0.36,
    roomH * 0.028,
    0, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Produkten
  ctx.drawImage(productImg, pX, pY, pW, pH);

  // Subtilt varmt ljusöverlägg så produkten smälter in i rummets ljussättning
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = style === 'industriell'
    ? 'rgba(220,210,200,0.10)'
    : 'rgba(255,240,210,0.10)';
  ctx.fillRect(pX, pY, pW, pH);
  ctx.restore();
}

// ── Gemini AI-rumsstaging ─────────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyDdaBylAfq9-UayH46OKEiu0sOkY7cxfAM';
const GEMINI_MODEL   = 'gemini-2.5-flash-image';
const STAGING_PROMPT =
  'You are given a product image and a room image. ' +
  'Composite the product naturally into the room scene. ' +
  'Match lighting, shadows, perspective and scale to the room. ' +
  'The product should stand on the floor. No other furniture should be added. ' +
  'Return only the final composited room image.';

async function imageInputToBase64(
  input: string
): Promise<{ data: string; mimeType: string }> {
  if (input.startsWith('data:')) {
    return {
      data:     input.split(',')[1],
      mimeType: input.split(';')[0].split(':')[1],
    };
  }

  // Ladda via <img crossOrigin> + canvas — fungerar med CORS-redirect (t.ex. picsum → Fastly)
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
      } catch (e) {
        reject(new Error(`Canvas-konvertering misslyckades: ${e}`));
      }
    };
    img.onerror = () => reject(new Error(`Kunde inte ladda bild: ${input}`));
    img.src = input;
  });
}

async function stageWithGemini(productImageInput: string): Promise<string> {
  // Konvertera produkt- och rumsbild till råa base64-strängar
  let product: { data: string; mimeType: string };
  let room:    { data: string; mimeType: string };
  try {
    [product, room] = await Promise.all([
      imageInputToBase64(productImageInput),
      imageInputToBase64('/rooms/jakobsdal.jpg'),
    ]);
  } catch (e) {
    console.error('Fel vid laddning av bilder:', e);
    throw new Error(`Kunde inte ladda bilderna: ${e instanceof Error ? e.message : e}`);
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    console.error('Gemini API-fel:', err);
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ?? `Gemini-anrop misslyckades (HTTP ${res.status})`
    );
  }

  const data = await res.json();
  console.log('Gemini svar:', JSON.stringify(data, null, 2));

  // Gemini REST API returnerar camelCase: inlineData / mimeType
  const parts: Array<{ inlineData?: { mimeType: string; data: string } }> =
    data?.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imgPart?.inlineData) {
    console.error('Parts i svaret:', JSON.stringify(parts, null, 2));
    throw new Error('Gemini returnerade ingen bild');
  }

  return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
}

// ── Rumsstaging (exporterad) ──────────────────────────────────────────────────
export async function stageInRoom(
  productImageBase64: string,
  _category: string,
  _color: string,
  _material: string,
  roomType: string,
  style: string,
  _hfToken: string
): Promise<string> {
  // Jakobsdal-rummet → riktig Gemini AI-generering
  if (roomType.toLowerCase() === 'jakobsdal') {
    return stageWithGemini(productImageBase64);
  }

  // Övriga rum → canvas-compositing (offline-fallback)
  const productNoBg = await removeBackground(productImageBase64);
  const productImg  = await loadImage(productNoBg);

  const roomW = 1024, roomH = 768;
  const roomImg = await loadImage(drawRoom(roomW, roomH, style));

  const canvas = document.createElement('canvas');
  canvas.width = roomW; canvas.height = roomH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(roomImg, 0, 0);
  compositeProduct(ctx, roomW, roomH, productImg, null, style);

  return canvas.toDataURL('image/jpeg', 0.93);
}
