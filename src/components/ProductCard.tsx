'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImageOff, ShoppingCart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { CatalogItem, getPrimaryProductImage } from '../lib/catalog';
import { cartStore } from '../lib/cart';
import ProductVideoPopup from './ProductVideoPopup';

type ProductCardProps = {
  item: CatalogItem;
  isAdded?: boolean;
  isNew?: boolean;
  titleFontSize?: string;
  animationDuration?: string;
  onAddToCart?: (event: MouseEvent, item: CatalogItem) => void;
};

export default function ProductCard({
  item,
  isAdded = false,
  isNew = false,
  titleFontSize,
  animationDuration = '0.4s',
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();
  const id = String(item._id || item.id);
  const detailHref = `/items/${id}`;
  const [localAdded, setLocalAdded] = useState(false);
  const [stockMessage, setStockMessage] = useState('');
  const primaryImage = getPrimaryProductImage(item);
  const isOutOfStock = item.stock === 'Out of Stock';

  const openDetail = () => {
    router.push(detailHref);
  };

  const addToCart = (event: MouseEvent) => {
    event.stopPropagation();

    if (isOutOfStock) {
      setStockMessage('This product is out of stock. Please check again after 2 days.');
      setTimeout(() => setStockMessage(''), 3000);
      return;
    }

    if (onAddToCart) {
      onAddToCart(event, item);
    } else {
      const addedToCart = cartStore.addItem({
        _id: id,
        name: item.name,
        brand: item.brand,
        defaultPrice: item.defaultPrice,
        image: primaryImage,
      });
      if (!addedToCart) return;
      setLocalAdded(true);
      setTimeout(() => setLocalAdded(false), 1500);
    }
  };

  const added = isAdded || localAdded;
  const ribbonText = isNew ? 'New' : item.featured ? 'Featured' : '';

  return (
    <div
      className={`card product-card-link${isNew ? ' new-arrival-card' : ''}`}
      style={{ animation: `fade-in ${animationDuration} ease-out` }}
      onClick={openDetail}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          openDetail();
        }
      }}
    >
      {ribbonText ? <div className="new-arrival-ribbon">{ribbonText}</div> : null}
      <div className="card-tag">{item.stock}</div>

      {primaryImage ? (
        <Image
          src={primaryImage}
          alt={item.name}
          width={640}
          height={640}
          unoptimized
          className={`product-card-image product-card-image-${item.imageFit ?? 'fit'}`}
        />
      ) : (
        <div className="product-card-image product-card-fallback">
          <ImageOff size={36} />
          <span>No image</span>
        </div>
      )}

      <ProductVideoPopup video={item.video} videoId={item.videoId} productName={item.name} />

      <div>
        <span className={`badge ${item.brand === 'Samsung' ? 'badge-samsung' : item.brand === 'Apple' ? 'badge-apple' : ''}`}>
          {item.brand}
        </span>
        <span className="badge" style={{ background: 'var(--badge-bg)' }}>
          {item.subCategory}
        </span>
      </div>

      <h3 className="card-title" style={{ marginTop: '0.75rem', ...(titleFontSize ? { fontSize: titleFontSize } : {}) }}>
        {item.name}
      </h3>

      <div className="card-footer">
        <span className="price">
          {item.defaultPrice}
          {item.originalPrice && item.originalPrice !== item.defaultPrice && (
            <small className="price-strike"> {item.originalPrice}</small>
          )}
        </span>

        <button
          className={`btn btn-sm ${added ? 'btn-success' : isOutOfStock ? 'btn-outline product-out-stock-btn' : 'btn-outline'}`}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          onClick={addToCart}
          title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
        >
          <ShoppingCart size={14} />
          <span className="btn-text">{added ? 'Added' : isOutOfStock ? 'Unavailable' : 'Add'}</span>
        </button>
      </div>
      {stockMessage ? <p className="product-stock-message">{stockMessage}</p> : null}
    </div>
  );
}
