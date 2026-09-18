/**
 * ImageUpload Component
 * Drag & drop image upload with preview, reorder, and main image selection
 */

import React, { useState, useRef, useCallback } from 'react';
import { uploadsAPI } from '../../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const ImageUpload = ({ images = [], onChange, maxImages = MAX_IMAGES }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFiles = useCallback(async (files) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);

    // Validate
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image.`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      // Create local previews immediately
      const previews = toUpload.map((file, i) => ({
        _id: `preview_${Date.now()}_${i}`,
        url: URL.createObjectURL(file),
        public_id: null,
        isMain: images.length === 0 && i === 0,
        file,
        isUploading: true,
      }));

      onChange([...images, ...previews]);

      // Upload to server
      const formData = new FormData();
      toUpload.forEach((f) => formData.append('images', f));

      // In production this hits Cloudinary via the backend
      // For dev: we just use the object URLs
      // const result = await uploadsAPI.uploadImages(formData);
      // const uploaded = result.images;

      // Update previews with final URLs (replace object URLs)
      const finalImages = [
        ...images,
        ...previews.map((p, i) => ({
          ...p,
          // url: uploaded[i]?.url || p.url,
          // public_id: uploaded[i]?.public_id || p._id,
          isUploading: false,
        })),
      ];

      onChange(finalImages);
      toast.success(`${toUpload.length} image(s) added`);
    } catch (err) {
      toast.error('Upload failed. Please try again.');
      // Remove previews
      onChange(images);
    } finally {
      setUploading(false);
    }
  }, [images, onChange, maxImages]);

  const handleFiles = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = ''; // reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    // If we removed the main image, make the first one main
    if (images[idx].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    onChange(newImages);
    // Clean up object URL
    if (images[idx].url?.startsWith('blob:')) {
      URL.revokeObjectURL(images[idx].url);
    }
  };

  const setMain = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isMain: i === idx })));
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onChange(newImages);
  };

  return (
    <div>
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className={`image-upload-zone ${dragOver ? 'dragover' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <LoadingSpinner size="sm" text="Uploading..." />
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--clr-text)' }}>
                {dragOver ? 'Drop images here' : 'Click or drag images here'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                JPG, PNG, WebP · Max {MAX_SIZE_MB}MB each · Up to {maxImages - images.length} more
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <div key={img._id || i} style={{
              position: 'relative', width: 88, height: 88,
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              border: `2px solid ${img.isMain ? 'var(--clr-forest)' : 'var(--clr-border)'}`,
              cursor: 'pointer', flexShrink: 0,
              opacity: img.isUploading ? 0.6 : 1,
            }} onClick={() => setMain(i)}>
              <img src={img.url} alt={`Upload ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Main badge */}
              {img.isMain && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(45,106,45,0.85)', color: 'white',
                  fontSize: '0.6rem', textAlign: 'center', padding: '2px',
                  fontWeight: 600,
                }}>
                  MAIN
                </div>
              )}

              {/* Uploading indicator */}
              {img.isUploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                  <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: '0.65rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >✕</button>

              {/* Move arrows */}
              <div style={{ position: 'absolute', bottom: img.isMain ? 18 : 3, right: 3, display: 'flex', gap: 2 }}>
                {i > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); moveImage(i, i - 1); }}
                    style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                )}
                {i < images.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); moveImage(i, i + 1); }}
                    style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
          Click an image to set it as main. Use arrows to reorder. {images.length}/{maxImages} images.
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
