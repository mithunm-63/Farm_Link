import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarRating } from './LoadingSpinner';

const categoryEmoji = {
  vegetables: '🥬', fruits: '🍎', grains: '🌾', pulses: '🫘',
  spices: '🌶️', dairy: '🥛', poultry: '🐓', herbs: '🌿',
  oilseeds: '🌻', other: '🌱',
};

const CropCard = ({ crop, onAddToCart }) => {
  const navigate = useNavigate();
  const mainImg = crop.images?.[0]?.url || crop.mainImage?.url;
  const emoji = categoryEmoji[crop.category] || '🌱';

  return (
    <div className="card crop-card" onClick={() => navigate(`/crops/${crop._id}`)}>
      {/* Image */}
      <div className="crop-card-img-wrapper">
        {mainImg ? (
          <img src={mainImg} alt={crop.name} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
            background: 'linear-gradient(135deg, var(--clr-foam), var(--clr-wheat))'
          }}>{emoji}</div>
        )}
        {crop.isOrganic && (
          <div className="crop-card-badge-organic">
            <span className="badge badge-organic">🌿 Organic</span>
          </div>
        )}
        {crop.isFeatured && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="badge badge-amber">⭐ Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-body">
        <div className="crop-card-meta">
          <span className="badge badge-neutral">{emoji} {crop.category}</span>
          <StarRating rating={crop.rating?.average} count={crop.rating?.count} />
        </div>

        <div className="crop-card-title">{crop.name}</div>

        <div className="crop-card-farmer">
          <span>🧑‍🌾</span>
          <span>{crop.farmer?.farmName || crop.farmer?.name}</span>
          <span>·</span>
          <span>{crop.location?.city}</span>
        </div>

        <div className="crop-card-footer">
          <div>
            <div className="crop-card-price">₹{crop.pricePerUnit?.toLocaleString()}</div>
            <div className="crop-card-unit">per {crop.unit}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
              Available
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text)' }}>
              {(crop.availableQuantity - (crop.reservedQuantity || 0))?.toLocaleString()} {crop.unit}
            </div>
          </div>
        </div>

        {/* Grade */}
        {crop.grade && crop.grade !== 'standard' && (
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Grade {crop.grade?.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropCard;
