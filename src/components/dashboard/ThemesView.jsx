import React, { useState, useEffect } from 'react';
import { 
  Palette, Sun, Moon, Check, Sparkles, Layout, 
  Type, RefreshCw, Save
} from 'lucide-react';

const PRESETS = [
  { id: 'classic-blue', name: 'Classic Blue', primary: '#3B82F6', accent: '#60A5FA', themeClass: 'light' },
  { id: 'forest-green', name: 'Forest Green', primary: '#10B981', accent: '#34D399', themeClass: 'light' },
  { id: 'sunset-orange', name: 'Sunset Orange', primary: '#F97316', accent: '#FB923C', themeClass: 'light' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#8B5CF6', accent: '#A78BFA', themeClass: 'light' },
  { id: 'midnight', name: 'Midnight Minimal', primary: '#3B82F6', accent: '#60A5FA', themeClass: 'dark' },
];

const FONTS = [
  { id: 'Outfit', name: 'Outfit (Modern)' },
  { id: 'Inter', name: 'Inter (Classic)' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Tech)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta (Clean)' }
];

export default function ThemesView({ theme, setTheme }) {
  const [activePreset, setActivePreset] = useState(() => localStorage.getItem('formstudio_theme_preset') || 'classic-blue');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('formstudio_primary_color') || '#3B82F6');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('formstudio_accent_color') || '#60A5FA');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('formstudio_font_family') || 'Outfit');
  const [isSaved, setIsSaved] = useState(false);

  // Apply changes to document class/variables
  const applyThemeConfig = (pCol, aCol, font, mode) => {
    // Save to document styles
    document.documentElement.style.setProperty('--primary', pCol);
    document.documentElement.style.setProperty('--primary-hover', aCol);
    document.documentElement.style.setProperty('--font-family', font);
    
    // Apply dark/light
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    applyThemeConfig(preset.primary, preset.accent, fontFamily, preset.themeClass);
  };

  const handleCustomColorChange = (type, val) => {
    setActivePreset('custom');
    if (type === 'primary') {
      setPrimaryColor(val);
      applyThemeConfig(val, accentColor, fontFamily, theme);
    } else {
      setAccentColor(val);
      applyThemeConfig(primaryColor, val, fontFamily, theme);
    }
  };

  const handleFontChange = (fontId) => {
    setFontFamily(fontId);
    applyThemeConfig(primaryColor, accentColor, fontId, theme);
  };

  const handleSaveTheme = () => {
    localStorage.setItem('formstudio_theme_preset', activePreset);
    localStorage.setItem('formstudio_primary_color', primaryColor);
    localStorage.setItem('formstudio_accent_color', accentColor);
    localStorage.setItem('formstudio_font_family', fontFamily);
    localStorage.setItem('formstudio_theme', theme);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ fontFamily: fontFamily }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">Theme Customizer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Customize the look, colors, and typography of your FormStudio workspace and forms.
          </p>
        </div>
        <button
          onClick={handleSaveTheme}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {isSaved ? <Check size={13} /> : <Save size={13} />}
          <span>{isSaved ? 'Preferences Saved!' : 'Save Theme'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left customization panel (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Light/Dark toggle */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layout size={13} className="text-brand dark:text-sky-400" />
              <span>Base Theme Mode</span>
            </h3>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
              <button
                onClick={() => applyThemeConfig(primaryColor, accentColor, fontFamily, 'light')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white dark:bg-brand-dark-elevated text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Sun size={13} />
                <span>Light Mode</span>
              </button>
              <button
                onClick={() => applyThemeConfig(primaryColor, accentColor, fontFamily, 'dark')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-brand-dark-elevated text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Moon size={13} />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Preset Theme Selection */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette size={13} className="text-brand dark:text-sky-400" />
              <span>Color Presets</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition text-center cursor-pointer relative overflow-hidden group ${
                    activePreset === preset.id
                      ? 'border-brand dark:border-sky-400 bg-brand/5 dark:bg-sky-400/5'
                      : 'border-slate-200 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex gap-1.5">
                    <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: preset.primary }} />
                    <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 leading-none">{preset.name}</span>
                  {activePreset === preset.id && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-brand dark:bg-sky-400 text-white rounded-full flex items-center justify-center p-0.5">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={13} className="text-brand dark:text-sky-400" />
              <span>Custom Brand Colors</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                    className="border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 w-24 uppercase focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                    className="border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 w-24 uppercase focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Customization */}
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type size={13} className="text-brand dark:text-sky-400" />
              <span>Typography / Fonts</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {FONTS.map(font => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange(font.id)}
                  style={{ fontFamily: font.id }}
                  className={`p-3.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                    fontFamily === font.id
                      ? 'border-brand dark:border-sky-400 bg-brand/5 dark:bg-sky-400/5 text-slate-800 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Card (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Preview</h3>
          <div 
            className="w-full rounded-2xl p-6 shadow-xl border flex flex-col gap-4 select-none relative overflow-hidden transition-all duration-300 bg-white dark:bg-brand-dark" 
            style={{ 
              borderColor: `${primaryColor}20`,
              fontFamily: fontFamily
            }}
          >
            {/* Mock layout inside preview */}
            <div className="h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }} />
            
            <div className="flex flex-col gap-1.5">
              <div 
                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md self-start border"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  borderColor: `${primaryColor}30`,
                  color: primaryColor 
                }}
              >
                Intake Live Preview
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mt-1">
                Untitled Web Form
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">Please enter your candidate credentials.</span>
            </div>

            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Candidate Name</span>
                <div className="w-full h-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-lg px-2 flex items-center text-[10px] text-slate-450">
                  e.g. Jane Doe
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Desired Position</span>
                <div className="w-full h-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-lg px-2 flex items-center justify-between text-[10px] text-slate-450">
                  <span>Select position...</span>
                  <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: primaryColor }} />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2 text-[10px] font-black rounded-lg text-white transition mt-3 flex items-center justify-center gap-1.5 shadow-sm"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})`
              }}
            >
              <span>Submit Form Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
