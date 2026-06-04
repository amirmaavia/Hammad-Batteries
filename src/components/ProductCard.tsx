'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImageOff, ShoppingCart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { CatalogItem, getPrimaryProductImage } from '../lib/catalog';
import { cartStore } from '../lib/cart';

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
  const primaryImage = getPrimaryProductImage(item);

  const openDetail = () => {
    router.push(detailHref);
  };

  const addToCart = (event: MouseEvent) => {
    event.stopPropagation();

    if (onAddToCart) {
      onAddToCart(event, item);
    } else {
      cartStore.addItem({
        _id: id,
        name: item.name,
        brand: item.brand,
        defaultPrice: item.defaultPrice,
        image: primaryImage,
      });
      setLocalAdded(true);
      setTimeout(() => setLocalAdded(false), 1500);
    }
  };

  const added = isAdded || localAdded;

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
      {isNew ? <div className="new-arrival-ribbon">New</div> : null}
      <div className="card-tag">{item.stock}</div>

      {primaryImage ? (
        <Image
          src={primaryImage}
          alt={item.name}
          width={640}
          height={480}
          unoptimized
          className={`product-card-image product-card-image-${item.imageFit ?? 'fit'}`}
        />
      ) : (
        <div className="product-card-image product-card-fallback">
          <ImageOff size={36} />
          <span>No image</span>
        </div>
      )}

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
          className={`btn btn-sm ${added ? 'btn-success' : 'btn-outline'}`}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          onClick={addToCart}
          title="Add to Cart"
        >
          <ShoppingCart size={14} />
          <span className="btn-text">{added ? 'Added' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}
