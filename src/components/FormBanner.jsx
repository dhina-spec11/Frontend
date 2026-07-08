import React from 'react';

const bannerGradients = {
  brand: 'from-blue-600 via-indigo-600 to-purple-600',
  sky: 'from-sky-500 via-blue-500 to-indigo-600',
  emerald: 'from-emerald-500 via-teal-500 to-cyan-600',
  violet: 'from-violet-600 via-fuchsia-600 to-pink-600',
  rose: 'from-rose-500 via-pink-500 to-purple-600',
  amber: 'from-amber-500 via-orange-500 to-red-600'
};

export default function FormBanner({ imageUrl, themeConfig, previewDevice = 'desktop', isPreview = false }) {
  const baseHeight = themeConfig?.bannerHeight || 220;
  
  // Custom gradient selector based on accent theme color
  const selectedAccent = themeConfig?.accent || 'brand';
  const gradientClass = bannerGradients[selectedAccent] || bannerGradients.brand;

  const getBannerHeight = () => {
    if (isPreview) {
      if (previewDevice === 'mobile') return `${Math.min(140, Math.round(baseHeight * 0.63))}px`;
      if (previewDevice === 'tablet') return `${Math.min(180, Math.round(baseHeight * 0.81))}px`;
      return `${baseHeight}px`;
    }
    return undefined;
  };

  const styleOverrides = getBannerHeight() ? { height: getBannerHeight() } : {
    '--banner-height-desktop': `${baseHeight}px`,
    '--banner-height-tablet': `${Math.min(180, Math.round(baseHeight * 0.81))}px`,
    '--banner-height-mobile': `${Math.min(140, Math.round(baseHeight * 0.63))}px`
  };

  return (
    <div 
      className="w-full overflow-hidden form-banner-wrapper relative select-none"
      style={styleOverrides}
      role="img"
      aria-label="Form header banner decoration"
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Form header banner decoration" 
          className="w-full h-full object-cover block"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-r ${gradientClass}`} />
      )}
    </div>
  );
}
