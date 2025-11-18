import React, { useState, useEffect, useRef } from "react";
import watermarkLogo from "../../assets/logo/Pedlar_logo_white.png";
import Swal from "sweetalert2";

const WatermarkedImage = ({ src, alt = "Image", className = "", opacity = 0.3, onError }) => {
  const [watermarkedSrc, setWatermarkedSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const addWatermark = async () => {
      try {
        setIsLoading(true);

        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d');

        // Load main image
        const mainImg = new Image();
        mainImg.crossOrigin = 'anonymous';
        
        const imageLoadPromise = new Promise((resolve, reject) => {
          mainImg.onload = resolve;
          mainImg.onerror = reject;
          setTimeout(() => reject(new Error('Image load timeout')), 10000);
        });

        mainImg.src = src;

        try {
          await imageLoadPromise;
        } catch (err) {
          console.warn("CORS issue detected, trying without crossOrigin");
          mainImg.crossOrigin = null;
          mainImg.src = src;
          await new Promise((resolve, reject) => {
            mainImg.onload = resolve;
            mainImg.onerror = reject;
          });
        }

        // Set canvas size
        canvas.width = mainImg.width;
        canvas.height = mainImg.height;

        // Draw main image
        ctx.drawImage(mainImg, 0, 0);

        // Load and draw watermark
        const logoImg = new Image();
        
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = watermarkLogo;
        });

        // Calculate watermark dimensions
        const watermarkWidth = canvas.width * 0.15;
        const watermarkHeight = (logoImg.height / logoImg.width) * watermarkWidth;

        // Position at bottom right
        const padding = 15;
        const x = canvas.width - watermarkWidth - padding;
        const y = canvas.height - watermarkHeight - padding;

        // Draw semi-transparent background for watermark
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.3})`;
        ctx.fillRect(x - 5, y - 5, watermarkWidth + 10, watermarkHeight + 10);

        // Draw watermark with opacity
        ctx.globalAlpha = opacity;
        ctx.drawImage(logoImg, x, y, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;

        // Try to convert to data URL
        try {
          const watermarkedImage = canvas.toDataURL('image/jpeg', 0.9);
          
          if (watermarkedImage && watermarkedImage.length > 1000) {
            setWatermarkedSrc(watermarkedImage);
            setUseFallback(false);
          } else {
            throw new Error('Generated image is blank');
          }
        } catch (canvasError) {
          console.error("Canvas toDataURL failed (CORS):", canvasError);
          setUseFallback(true);
          setWatermarkedSrc(src);
        }

        setIsLoading(false);

      } catch (err) {
        console.error("Watermark error:", err);
        setUseFallback(true);
        setWatermarkedSrc(src);
        setIsLoading(false);
      }
    };

    if (src) {
      addWatermark();
    }
  }, [src, opacity]);

  // Handle right-click to force download with watermark
  const handleContextMenu = (e) => {
  if (useFallback) {
    e.preventDefault();
    
    // Create a temporary canvas with watermark
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!img) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    ctx.drawImage(img, 0, 0);

    const logoImg = new Image();
    logoImg.src = watermarkLogo;

    logoImg.onload = () => {
      const watermarkWidth = canvas.width * 0.15;
      const watermarkHeight = (logoImg.height / logoImg.width) * watermarkWidth;
      const padding = 15;
      const x = canvas.width - watermarkWidth - padding;
      const y = canvas.height - watermarkHeight - padding;

      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.3})`;
      ctx.fillRect(x - 5, y - 5, watermarkWidth + 10, watermarkHeight + 10);

      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImg, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0;

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `watermarked_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.9);
    };

    // SweetAlert2 notification instead of alert
    Swal.fire({
      icon: 'info',
      title: 'Right-click Disabled',
      text: 'Right-click save is protected. Use the download button if available, or screenshot the image.',
      confirmButtonText: 'OK'
    });
  }
};


  const handleImageError = (e) => {
    if (onError) {
      onError(e);
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  // Fallback with CSS overlay + right-click protection
  if (useFallback) {
    return (
      <div 
        className={`relative ${className}`} 
        style={{ display: 'inline-block' }}
        onContextMenu={handleContextMenu}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover select-none"
          onError={handleImageError}
          draggable="false"
        />
        <div 
          className="absolute bottom-4 right-4 pointer-events-none select-none"
          style={{ opacity: opacity }}
        >
          <img 
            src={watermarkLogo} 
            alt="Watermark" 
            className="w-128 h-auto"
            style={{ 
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable="false"
          />
        </div>
      </div>
    );
  }

  // Successfully watermarked image
  return (
    <img
      ref={imageRef}
      src={watermarkedSrc || src}
      alt={alt}
      className={`${className} select-none`}
      onError={handleImageError}
      onContextMenu={(e) => {
        // Optional: prevent right-click even on successfully watermarked images
        // e.preventDefault();
      }}
      draggable="false"
    />
  );
};

export default WatermarkedImage;