'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImageOff, MessageCircle, ShoppingCart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { CatalogItem } from '../lib/catalog';
import { getProductInquiryMessage, getWhatsAppLink } from '../lib/site';

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

  const openDetail = () => {
    router.push(detailHref);
  };

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

      {item.image ? (
        <Image
          src={item.image}
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
            <small className="price-strike">  {item.originalPrice}</small>
          )}
        </span>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {onAddToCart ? (
            <button
              className={`btn btn-sm ${isAdded ? 'btn-success' : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              onClick={(event) => onAddToCart(event, item)}
              title="Add to Cart"
            >
              <ShoppingCart size={14} />
              {isAdded ? '✓' : ''}
            </button>
          ) : null}

          <a
            href={getWhatsAppLink(getProductInquiryMessage(item.name, item.defaultPrice))}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp btn-mobile-icon"
            style={{ padding: '0.4rem 0.8rem' }}
            aria-label={`Ask about ${item.name} on WhatsApp`}
            onClick={(event) => event.stopPropagation()}
          >
            <MessageCircle size={14} />
            {/* <span className="btn-text" style={{ fontSize: '0.8rem' }}></span> */}
          </a>
        </div>
      </div>
    </div>
  );
}
