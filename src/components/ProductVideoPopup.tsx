'use client';

import { PlayCircle, X } from 'lucide-react';
import { useState } from 'react';

type ProductVideoPopupProps = {
  video?: string;
  videoId?: string;
  productName: string;
  buttonClassName?: string;
};

export default function ProductVideoPopup({ video, videoId, productName, buttonClassName = 'btn btn-outline btn-sm product-video-trigger' }: ProductVideoPopupProps) {
  const [open, setOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState(video || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!video && !videoId) return null;

  const openVideo = async () => {
    setOpen(true);
    setError('');

    if (videoSrc || !videoId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      const result = await response.json();

      if (!response.ok || !result.data?.video) {
        throw new Error(result.error || 'Unable to load video.');
      }

      setVideoSrc(result.data.video);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={buttonClassName}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void openVideo();
        }}
        aria-label={`Play ${productName} video`}
      >
        <PlayCircle size={16} />
        <span className="btn-text">Video</span>
      </button>

      {open ? (
        <div
          className="product-video-overlay"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(false);
          }}
        >
          <div className="product-video-popup" onClick={(event) => event.stopPropagation()}>
            <div className="product-video-header">
              <strong>{productName}</strong>
              <button className="product-video-close" type="button" onClick={() => setOpen(false)} aria-label="Close video">
                <X size={18} />
              </button>
            </div>
            {loading ? (
              <div className="product-video-status">Loading video...</div>
            ) : error ? (
              <div className="product-video-status status-error">{error}</div>
            ) : (
              <video className="product-video-player" src={videoSrc} controls autoPlay playsInline />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
