'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  logoSrc?: string;
  watermarkText?: string;
  alt: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
}

export function WatermarkedImage({
  src,
  logoSrc,
  watermarkText = 'mayvanphongxanh.com',
  alt,
  position = 'bottom-right',
  opacity = 0.3,
  className = '',
  onError,
  ...props
}: WatermarkedImageProps) {
  let siteLogo = '/logo.png';
  try {
    const settingsContext = useSettings();
    if (settingsContext?.getSetting) {
      siteLogo = settingsContext.getSetting('site_logo', settingsContext.getSetting('company_logo', '/logo.png'));
    }
  } catch (e) {
    // SettingsProvider not in tree fallback
  }

  const effectiveLogoSrc = logoSrc || siteLogo || '/logo.png';
  const [watermarkedSrc, setWatermarkedSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!src || src.startsWith('data:')) {
      setWatermarkedSrc(src);
      return;
    }

    let isMounted = true;
    let createdObjectUrls: string[] = [];

    const generateWatermark = async () => {
      try {
        // Safe loader using fetch + Blob URL to prevent CORS/tainted canvas errors
        const loadElement = async (url: string): Promise<HTMLImageElement> => {
          let imageUri = url;
          try {
            const response = await fetch(url);
            if (response.ok) {
              const blob = await response.blob();
              imageUri = URL.createObjectURL(blob);
              createdObjectUrls.push(imageUri);
            }
          } catch (fetchErr) {
            // Fallback to direct url if fetch fails
          }

          const image = new Image();
          image.src = imageUri;
          await new Promise((resolve, reject) => {
            if (image.complete) resolve(true);
            image.onload = () => resolve(true);
            image.onerror = (e) => reject(e);
          });
          return image;
        };

        // 1. Load main product image
        const img = await loadElement(src);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill background with white to avoid black area artifacts
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw original product image
        ctx.drawImage(img, 0, 0);

        // 2. Load and overlay watermark logo if present
        if (effectiveLogoSrc) {
          try {
            const logo = await loadElement(effectiveLogoSrc);

            const logoWidth = Math.max(60, Math.min(canvas.width * 0.25, 260));
            const logoHeight = (logo.naturalHeight / logo.naturalWidth) * logoWidth;
            const padding = Math.max(12, canvas.width * 0.02);

            let x = canvas.width - logoWidth - padding;
            let y = canvas.height - logoHeight - padding;

            if (position === 'bottom-left') {
              x = padding;
              y = canvas.height - logoHeight - padding;
            } else if (position === 'top-right') {
              x = canvas.width - logoWidth - padding;
              y = padding;
            } else if (position === 'top-left') {
              x = padding;
              y = padding;
            } else if (position === 'center') {
              x = (canvas.width - logoWidth) / 2;
              y = (canvas.height - logoHeight) / 2;
            }

            ctx.save();
            ctx.globalAlpha = opacity; // 30% transparent watermark
            ctx.drawImage(logo, x, y, logoWidth, logoHeight);
            ctx.restore();
          } catch (logoErr) {
            console.warn('Watermark logo load warning:', logoErr);
          }
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (isMounted) {
          setWatermarkedSrc(dataUrl);
        }
      } catch (err) {
        console.error('Watermark generation error:', err);
        if (isMounted) {
          setWatermarkedSrc(src);
        }
      } finally {
        createdObjectUrls.forEach((uri) => URL.revokeObjectURL(uri));
      }
    };

    generateWatermark();

    return () => {
      isMounted = false;
      createdObjectUrls.forEach((uri) => URL.revokeObjectURL(uri));
    };
  }, [src, effectiveLogoSrc, position, opacity]);

  return (
    <img
      src={hasError ? src : watermarkedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}
