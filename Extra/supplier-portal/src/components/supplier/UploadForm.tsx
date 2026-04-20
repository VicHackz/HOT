import React, { useState } from 'react';
import type { Product, ProductCategory } from '../../types';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import './UploadForm.css';

interface UploadFormProps {
  supplierId: string;
  supplierName: string;
  onSubmit: (product: Product) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ supplierId, supplierName, onSubmit }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!imageFile && !imagePreview) {
      newErrors.image = 'Product image is required';
    }
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    if (!formData.material.trim()) {
      newErrors.material = 'Material is required';
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Valid weight is required';
    }
    if (!formData.width || parseFloat(formData.width) <= 0) {
      newErrors.width = 'Valid width is required';
    }
    if (!formData.collectionName.trim()) {
      newErrors.collectionName = 'Collection name is required';
    }
    if (!formData.season.trim()) {
      newErrors.season = 'Season/Year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      supplierId,
      supplierName,
      image: imagePreview || 'https://picsum.photos/400/300',
      productName: formData.productName,
      category: formData.category,
      color: formData.color,
      material: formData.material,
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      dimensions: {
        width: parseFloat(formData.width),
        height: parseFloat(formData.height) || 0,
        depth: parseFloat(formData.depth) || 0,
      },
      collectionName: formData.collectionName,
      season: formData.season,
      description: formData.description,
      status: 'Pending Review',
      uploadDate: new Date().toISOString(),
    };

    onSubmit(product);

    // Reset form
    setFormData({
      productName: '',
      category: 'Sofa',
      color: '',
      material: '',
      weight: '',
      weightUnit: 'kg',
      width: '',
      height: '',
      depth: '',
      collectionName: '',
      season: '',
      description: '',
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Product Image</h3>
        <div className="image-upload-area">
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="image-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
              />
              <div className="image-upload-placeholder">
                <span className="upload-icon">📷</span>
                <span>Click to upload image</span>
                <span className="upload-hint">PNG, JPG up to 10MB</span>
              </div>
            </label>
          )}
        </div>
        {errors.image && <span className="input-error-text">{errors.image}</span>}
      </div>

      <div className="form-grid">
        <Input
          label="Product Name *"
          name="productName"
          value={formData.productName}
          onChange={handleInputChange}
          error={errors.productName}
          placeholder="e.g., Stockholm Linen Sofa"
        />

        <Select
          label="Category *"
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
          label="Color *"
          name="color"
          value={formData.color}
          onChange={handleInputChange}
          error={errors.color}
          placeholder="e.g., Natural Beige"
        />

        <Input
          label="Material *"
          name="material"
          value={formData.material}
          onChange={handleInputChange}
          error={errors.material}
          placeholder="e.g., Linen, Velvet, Cotton"
        />

        <div className="weight-group">
          <Input
            label="Weight *"
            name="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={handleInputChange}
            error={errors.weight}
            placeholder="0.00"
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
          label="Width (cm) *"
          name="width"
          type="number"
          value={formData.width}
          onChange={handleInputChange}
          error={errors.width}
          placeholder="0"
        />

        <Input
          label="Height (cm)"
          name="height"
          type="number"
          value={formData.height}
          onChange={handleInputChange}
          placeholder="0"
        />

        <Input
          label="Depth (cm)"
          name="depth"
          type="number"
          value={formData.depth}
          onChange={handleInputChange}
          placeholder="0"
        />

        <Input
          label="Collection Name *"
          name="collectionName"
          value={formData.collectionName}
          onChange={handleInputChange}
          error={errors.collectionName}
          placeholder="e.g., Nordic Essentials"
        />

        <Input
          label="Season / Year *"
          name="season"
          value={formData.season}
          onChange={handleInputChange}
          error={errors.season}
          placeholder="e.g., Spring/Summer 2024"
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Describe your product..."
        rows={4}
      />

      <div className="form-actions">
        <Button type="submit" variant="primary" size="lg">
          Upload Product
        </Button>
      </div>
    </form>
  );
};
