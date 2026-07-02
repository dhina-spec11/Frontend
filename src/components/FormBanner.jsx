import React from 'react';

export default function FormBanner({ imageUrl, themeConfig }) {
  if (!imageUrl) return null;

  // Adapt rounding based on selected visual theme config
  const getBannerRoundness = () => {
    switch (themeConfig?.theme) {
      case 'minimalist':
        return 'rounded-none';
      case 'cyberpunk':
        return 'rounded-lg';
      default:
        return 'rounded-2xl'; // default premium rounded-2xl (16px)
    }
  };

  // Adapt border outline styles to blend with visual theme
  const getBannerBorder = () => {
    switch (themeConfig?.theme) {
      case 'elegant-dark':
        return 'border border-slate-800/80 bg-[#111a2e]/90 shadow-2xl';
      case 'cyberpunk':
        return 'border-2 border-cyan-400 dark:border-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.1)]';
      case 'warm-sunset':
        return 'border border-amber-200/50 dark:border-rose-950/50 bg-white/95 dark:bg-[#20171a]/95 shadow-md';
      case 'glassmorphism':
        return 'backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-800/40 shadow-xl';
      default:
        return 'border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-brand-dark shadow-sm';
    }
  };

  const baseHeight = themeConfig?.bannerHeight || 220;

  return (
    <div 
      className={`w-full overflow-hidden ${getBannerRoundness()} ${getBannerBorder()} form-banner-wrapper`}
      style={{
        '--banner-height-desktop': `${baseHeight}px`,
        '--banner-height-tablet': `${Math.min(180, Math.round(baseHeight * 0.81))}px`,
        '--banner-height-mobile': `${Math.min(140, Math.round(baseHeight * 0.63))}px`
      }}
      role="img"
      aria-label="Form header banner image decoration"
    >
      <img 
        src={imageUrl} 
        alt="Form header banner decoration" 
        className="w-full h-full object-cover block"
      />
    </div>
  );
}
