import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../utils/useToast';
import { Input, Textarea, Select } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ToastContainer } from '../components/common/Toast';
import { sharpenImage, upscaleImage, stageInRoom } from '../utils/imageProcessing';
import type { ProductStatus, ProductCategory } from '../types';
import './ProductDetailPage.css';

const HF_TOKEN_KEY = 'hot-hf-token';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct } = useApp();
  const { toasts, showToast, removeToast } = useToast();

  const product = products.find(p => p.id === id);

  // API-nycklar
  const [hfToken, setHfToken] = useState(() => localStorage.getItem(HF_TOKEN_KEY) ?? '');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Bildförbättring (Fix)
  const [isSharpening, setIsSharpening] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [enhanceLabel, setEnhanceLabel] = useState('');

  // Rumsstaging
  const [roomType, setRoomType] = useState('jakobsdal');
  const [roomStyle, setRoomStyle] = useState('modern skandinavisk');
  const [isStaging, setIsStaging] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productName: '',
    category: 'Sofa' as ProductCategory,
    color: '',
    material: '',
    weight: '',
    weightUnit: 'kg' as 'kg' | 'g',
    width: '',
    height: '',
    depth: '',
    collectionName: '',
    season: '',
    description: '',
    status: 'Pending Review' as ProductStatus,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        category: product.category,
        color: product.color,
        material: product.material,
        weight: product.weight.toString(),
        weightUnit: product.weightUnit,
        width: product.dimensions.width.toString(),
        height: product.dimensions.height.toString(),
        depth: product.dimensions.depth.toString(),
        collectionName: product.collectionName,
        season: product.season,
        description: product.description,
        status: product.status,
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="not-found">
            <h1>Product Not Found</h1>
            <Button onClick={() => navigate('/admin')}>Back to Admin</Button>
          </div>
        </div>
      </div>
    );
  }

  const saveToken = (token: string) => {
    setHfToken(token);
    localStorage.setItem(HF_TOKEN_KEY, token);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProduct(product.id, {
      productName: formData.productName,
      category: formData.category,
      color: formData.color,
      material: formData.material,
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      dimensions: {
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        depth: parseFloat(formData.depth),
      },
      collectionName: formData.collectionName,
      season: formData.season,
      description: formData.description,
      status: formData.status,
    });
    showToast('Product updated successfully!', 'success');
  };

  // Snabb Canvas-skärpning (offline, ingen API)
  const handleQuickFix = async () => {
    setIsSharpening(true);
    try {
      const result = await sharpenImage(product.image);
      setEnhancedImage(result);
      setShowEnhanced(true);
      setEnhanceLabel('Canvas-skärpt');
      showToast('Bild skärpt — granska och spara', 'info');
    } catch {
      showToast('Misslyckades med att skärpa bilden', 'error');
    } finally {
      setIsSharpening(false);
    }
  };

  // AI-uppskaling via Real-ESRGAN (kräver HF-token)
  const handleAIUpscale = async () => {
    if (!hfToken) { setShowTokenInput(true); showToast('Ange din Hugging Face API-token först', 'error'); return; }
    setIsUpscaling(true);
    try {
      const result = await upscaleImage(product.image, hfToken);
      setEnhancedImage(result);
      setShowEnhanced(true);
      setEnhanceLabel('AI-uppskalt');
      showToast('AI-uppskaling klar — granska och spara', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI-uppskaling misslyckades', 'error');
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleSaveEnhanced = () => {
    if (!enhancedImage) return;
    updateProduct(product.id, { image: enhancedImage });
    setEnhancedImage(null);
    setShowEnhanced(false);
    showToast('Förbättrad bild sparad!', 'success');
  };

  // Rumsstaging via Pollinations.ai — ingen nyckel krävs
  const handleStageInRoom = async () => {
    setIsStaging(true);
    try {
      const result = await stageInRoom(
        product.image,
        product.category,
        product.color,
        product.material,
        roomType,
        roomStyle,
        hfToken
      );
      setStagedImage(result);
      showToast('Rumsbild genererad!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Rumsstaging misslyckades', 'error');
    } finally {
      setIsStaging(false);
    }
  };

  const handleSaveStaged = () => {
    if (!stagedImage) return;
    updateProduct(product.id, { image: stagedImage });
    setStagedImage(null);
    showToast('Rumsbild sparad som produktbild!', 'success');
  };

  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this product?')) {
      updateProduct(product.id, { status: 'Archived' });
      showToast('Product archived', 'info');
      navigate('/admin');
    }
  };

  const displayImage = showEnhanced && enhancedImage ? enhancedImage : product.image;

  return (
    <div className="product-detail-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className="detail-header">
        <div className="container">
          <div className="header-content">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              ← Back to Products
            </Button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="detail-container">
          <div className="detail-sidebar">

            {/* ── Produktbild ── */}
            <div className="product-image-section">
              <img src={displayImage} alt={product.productName} className="product-detail-image" />
              {enhancedImage && (
                <div className="enhance-badge">{enhanceLabel}</div>
              )}
            </div>

            {/* ── API-nycklar ── */}
            <div className="ai-token-section">
              <button
                className="token-toggle"
                onClick={() => setShowTokenInput(p => !p)}
              >
                API-nyckel (HuggingFace)
                <span className={`token-indicator ${hfToken ? 'active' : ''}`} />
              </button>
              {showTokenInput && (
                <div className="token-input-group">
                  <label className="token-label">HF-token (AI-uppskala &amp; Rumsstaging)</label>
                  <input
                    type="password"
                    className="token-input"
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                    value={hfToken}
                    onChange={e => saveToken(e.target.value)}
                  />
                  <p className="token-hint">
                    huggingface.co → Settings → Access Tokens → New token (Read)
                  </p>
                </div>
              )}
            </div>

            {/* ── Funktion 1: Bildförbättring ── */}
            <div className="ai-panel">
              <h3 className="ai-panel-title">Bildförbättring</h3>

              <div className="image-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickFix}
                  disabled={isSharpening || isUpscaling}
                >
                  {isSharpening ? 'Bearbetar...' : 'Snabbskärpning'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAIUpscale}
                  disabled={isSharpening || isUpscaling}
                >
                  {isUpscaling ? 'AI arbetar...' : 'AI-uppskala'}
                </Button>
              </div>

              {enhancedImage && (
                <div className="image-actions">
                  <Button variant="ghost" size="sm" onClick={() => setShowEnhanced(p => !p)}>
                    {showEnhanced ? 'Visa original' : 'Visa förbättrad'}
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveEnhanced}>
                    Spara bild
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEnhancedImage(null); setShowEnhanced(false); }}>
                    Avbryt
                  </Button>
                </div>
              )}

              <p className="ai-panel-hint">
                Snabbskärpning: offline, omedelbar.<br />
                AI-uppskala: Real-ESRGAN 4×, kräver token.
              </p>
            </div>

            {/* ── Funktion 2: Rumsstaging ── */}
            <div className="ai-panel">
              <h3 className="ai-panel-title">Rumsstaging</h3>

              <div className="staging-controls">
                <label className="staging-label">Rumstyp</label>
                <select
                  className="staging-select"
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                >
                    <optgroup label="HoT-miljöer">
                    <option value="jakobsdal">Jakobsdal</option>
                  </optgroup>
                  <optgroup label="Genererade rum">
                    <option value="vardagsrum">Vardagsrum</option>
                    <option value="sovrum">Sovrum</option>
                    <option value="matsal">Matsal</option>
                    <option value="kontor">Kontor</option>
                    <option value="hall">Hall</option>
                  </optgroup>
                </select>

                <label className="staging-label">Stil</label>
                <select
                  className="staging-select"
                  value={roomStyle}
                  onChange={e => setRoomStyle(e.target.value)}
                >
                  <option value="modern skandinavisk">Modern Skandinavisk</option>
                  <option value="minimalistisk">Minimalistisk</option>
                  <option value="industriell">Industriell</option>
                  <option value="bohemisk">Bohemisk</option>
                  <option value="klassisk">Klassisk</option>
                  <option value="japansk zen">Japansk Zen</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleStageInRoom}
                disabled={isStaging}
              >
                {isStaging ? 'Genererar rumsbild...' : 'Generera rumsbild'}
              </Button>

              {stagedImage && (
                <div className="staged-result">
                  <img src={stagedImage} alt="Genererad rumsbild" className="staged-image" />
                  <div className="image-actions">
                    <Button variant="primary" size="sm" onClick={handleSaveStaged}>
                      Använd som produktbild
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setStagedImage(null)}>
                      Kasta
                    </Button>
                  </div>
                </div>
              )}

              <p className="ai-panel-hint">
                Jakobsdal: AI-genererad via Gemini — korrekt ljus, skuggor och perspektiv.<br />
                Övriga rum: offline canvas-compositing.
              </p>
            </div>

            {/* ── Metadata ── */}
            <div className="product-meta-section">
              <div className="meta-item">
                <span className="meta-label">Supplier:</span>
                <span className="meta-value">{product.supplierName}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Upload Date:</span>
                <span className="meta-value">{new Date(product.uploadDate).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Current Status:</span>
                <StatusBadge status={product.status} />
              </div>
            </div>
          </div>

          <div className="detail-main">
            <h1 className="detail-title">Edit Product Details</h1>

            <div className="detail-form">
              <div className="form-grid">
                <Input
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                />

                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Sofa">Sofa</option>
                  <option value="Chair">Chair</option>
                  <option value="Table">Table</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Other">Other</option>
                </Select>

                <Input
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />

                <Input
                  label="Material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                />

                <div className="weight-group">
                  <Input
                    label="Weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                  <Select
                    label="Unit"
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleInputChange}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </Select>
                </div>

                <Input
                  label="Width (cm)"
                  name="width"
                  type="number"
                  value={formData.width}
                  onChange={handleInputChange}
                />

                <Input
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                />

                <Input
                  label="Depth (cm)"
                  name="depth"
                  type="number"
                  value={formData.depth}
                  onChange={handleInputChange}
                />

                <Input
                  label="Collection Name"
                  name="collectionName"
                  value={formData.collectionName}
                  onChange={handleInputChange}
                />

                <Input
                  label="Season / Year"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                />

                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </Select>
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />

              <div className="form-actions">
                <Button variant="danger" onClick={handleArchive}>
                  Archive Product
                </Button>
                <div className="form-actions-right">
                  <Button variant="secondary" onClick={() => navigate('/admin')}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
