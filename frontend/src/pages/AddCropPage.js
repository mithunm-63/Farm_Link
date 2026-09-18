import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCrop, updateCrop, fetchCrop, clearCurrentCrop } from '../store';
import { uploadsAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['vegetables','fruits','grains','pulses','spices','dairy','poultry','herbs','oilseeds','other'];
const UNITS = ['kg','quintal','ton','dozen','piece','liter','bundle'];
const GRADES = ['standard','A','B','C','premium'];

const CropForm = ({ editMode = false }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { currentCrop, loading } = useSelector((s) => s.crops);

  const [form, setForm] = useState({
    name: '', category: 'vegetables', description: '', pricePerUnit: '', unit: 'kg',
    availableQuantity: '', minimumOrderQuantity: 1, harvestDate: '', expiryDate: '',
    grade: 'standard', isOrganic: false, farmingType: 'conventional',
    shippingAvailable: false, shippingCost: 0, deliveryDays: 3,
    city: user?.location?.city || '', state: user?.location?.state || '', pincode: user?.location?.pincode || '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchCrop(id));
    }
    return () => dispatch(clearCurrentCrop());
  }, [editMode, id, dispatch]);

  useEffect(() => {
    if (editMode && currentCrop) {
      setForm({
        name: currentCrop.name || '',
        category: currentCrop.category || 'vegetables',
        description: currentCrop.description || '',
        pricePerUnit: currentCrop.pricePerUnit || '',
        unit: currentCrop.unit || 'kg',
        availableQuantity: currentCrop.availableQuantity || '',
        minimumOrderQuantity: currentCrop.minimumOrderQuantity || 1,
        harvestDate: currentCrop.harvestDate ? currentCrop.harvestDate.split('T')[0] : '',
        expiryDate: currentCrop.expiryDate ? currentCrop.expiryDate.split('T')[0] : '',
        grade: currentCrop.grade || 'standard',
        isOrganic: currentCrop.isOrganic || false,
        shippingAvailable: currentCrop.shippingAvailable || false,
        shippingCost: currentCrop.shippingCost || 0,
        deliveryDays: currentCrop.deliveryDays || 3,
        city: currentCrop.location?.city || '',
        state: currentCrop.location?.state || '',
        pincode: currentCrop.location?.pincode || '',
        tags: currentCrop.tags?.join(', ') || '',
      });
      setImages(currentCrop.images || []);
    }
  }, [currentCrop, editMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      // For demo: use placeholder images
      const newImages = files.map((f, i) => ({
        public_id: `crop_${Date.now()}_${i}`,
        url: URL.createObjectURL(f),
        isMain: images.length === 0 && i === 0,
      }));
      setImages([...images, ...newImages]);
      toast.success(`${files.length} image(s) selected`);
    } catch {
      toast.error('Image upload failed');
    } finally { setUploading(false); }
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));
  const setMainImage = (idx) => setImages(images.map((img, i) => ({ ...img, isMain: i === idx })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.pricePerUnit || !form.availableQuantity || !form.harvestDate) {
      toast.error('Please fill in all required fields.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerUnit: Number(form.pricePerUnit),
        availableQuantity: Number(form.availableQuantity),
        minimumOrderQuantity: Number(form.minimumOrderQuantity),
        shippingCost: Number(form.shippingCost),
        deliveryDays: Number(form.deliveryDays),
        location: { city: form.city, state: form.state, pincode: form.pincode },
        images: images.map((img) => ({ url: img.url, public_id: img.public_id, isMain: img.isMain })),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editMode) {
        await dispatch(updateCrop({ id, data: payload })).unwrap();
        toast.success('Crop listing updated!');
      } else {
        await dispatch(createCrop(payload)).unwrap();
        toast.success('Crop listing created! 🌾');
      }
      navigate('/farmer/dashboard');
    } catch (err) {
      toast.error(err || 'Failed to save crop');
    } finally { setSaving(false); }
  };

  if (editMode && loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 780 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          {editMode ? '✏️ Edit Crop Listing' : '🌱 Add New Crop Listing'}
        </h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>
          {editMode ? 'Update your crop listing details.' : 'List your fresh harvest on the FarmLink marketplace.'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Basic Information</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Crop Name *</label>
                <input className="form-control" name="name" placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-control" name="grade" value={form.grade} onChange={handleChange}>
                    {GRADES.map((g) => <option key={g} value={g} style={{ textTransform: 'capitalize' }}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" name="description" placeholder="Describe your crop quality, freshness, special characteristics..." value={form.description} onChange={handleChange} rows={4} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-control" name="tags" placeholder="e.g. organic, premium, local, fresh" value={form.tags} onChange={handleChange} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" name="isOrganic" checked={form.isOrganic} onChange={handleChange} />
                🌿 This crop is certified organic
              </label>
            </div>
          </div>

          {/* Pricing & Quantity */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Pricing & Quantity</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price per Unit (₹) *</label>
                  <input className="form-control" type="number" name="pricePerUnit" placeholder="0.00" min="0" step="0.01" value={form.pricePerUnit} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select className="form-control" name="unit" value={form.unit} onChange={handleChange}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Available Quantity *</label>
                  <input className="form-control" type="number" name="availableQuantity" placeholder="e.g. 500" min="0" value={form.availableQuantity} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Order Quantity</label>
                  <input className="form-control" type="number" name="minimumOrderQuantity" placeholder="e.g. 10" min="1" value={form.minimumOrderQuantity} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Harvest & Expiry</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Harvest Date *</label>
                  <input className="form-control" type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry / Best Before</label>
                  <input className="form-control" type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Location & Shipping</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-control" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-control" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} style={{ maxWidth: 200 }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                <input type="checkbox" name="shippingAvailable" checked={form.shippingAvailable} onChange={handleChange} />
                🚚 Shipping available
              </label>
              {form.shippingAvailable && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Shipping Cost (₹)</label>
                    <input className="form-control" type="number" name="shippingCost" min="0" value={form.shippingCost} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Days</label>
                    <input className="form-control" type="number" name="deliveryDays" min="1" max="30" value={form.deliveryDays} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Crop Images</h3></div>
            <div className="card-body">
              <div className="image-upload-zone" onClick={() => document.getElementById('imgInput').click()}>
                {uploading ? <LoadingSpinner /> : (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Click to upload images</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>JPG, PNG up to 5MB each (max 5)</div>
                  </>
                )}
              </div>
              <input id="imgInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${img.isMain ? 'var(--clr-forest)' : 'var(--clr-border)'}`, cursor: 'pointer' }} onClick={() => setMainImage(i)}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.isMain && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(61,107,61,0.85)', color: 'white', fontSize: '0.6rem', textAlign: 'center', padding: '2px' }}>Main</div>}
                      <button onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/farmer/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? '⏳ Saving...' : editMode ? '✅ Update Listing' : '🌱 Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddCropPage = () => <CropForm editMode={false} />;
export const EditCropPage = () => <CropForm editMode={true} />;
export default AddCropPage;
