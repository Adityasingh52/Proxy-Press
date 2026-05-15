'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import '../settings.css';

interface CustomColors {
  primary: string;
  bg: string;
  surface: string;
  accent: string;
  border: string;
  'text-primary': string;
}

const DEFAULT_LIGHT: CustomColors = {
  primary: '#2563EB',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  accent: '#EF4444',
  border: '#E2E8F0',
  'text-primary': '#0F172A',
};

const DEFAULT_DARK: CustomColors = {
  primary: '#3B82F6',
  bg: '#0F172A',
  surface: '#1E293B',
  accent: '#F87171',
  border: '#334155',
  'text-primary': '#F1F5F9',
};

const OLED_DARK: CustomColors = {
  primary: '#3B82F6',
  bg: '#000000',
  surface: '#121212',
  accent: '#F87171',
  border: '#262626',
  'text-primary': '#FFFFFF',
};

const MIDNIGHT_DARK: CustomColors = {
  primary: '#818CF8',
  bg: '#020617',
  surface: '#0F172A',
  accent: '#C084FC',
  border: '#1E293B',
  'text-primary': '#F1F5F9',
};

export default function ThemeSettingsPage() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_LIGHT);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('proxy-press-theme') as 'light' | 'dark' | null;
    if (storedTheme) setThemeMode(storedTheme);
    else setThemeMode('system');

    const storedCustom = localStorage.getItem('proxy-press-custom-theme');
    if (storedCustom) {
      setCustomColors(JSON.parse(storedCustom));
      setIsCustom(true);
    } else {
      setCustomColors(storedTheme === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT);
    }

    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
      return () => main.classList.remove('no-top-padding');
    }
  }, []);

  const applyColors = (colors: CustomColors) => {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty('--' + key, value);
      if (key === 'primary') {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      }
    });
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (mode === 'system') {
      localStorage.removeItem('proxy-press-theme');
      import('@capacitor/preferences').then(({ Preferences }) => {
        Preferences.remove({ key: 'proxy-press-theme' });
      });
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      localStorage.setItem('proxy-press-theme', mode);
      import('@capacitor/preferences').then(({ Preferences }) => {
        Preferences.set({ key: 'proxy-press-theme', value: mode });
      });
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }
  };

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    setIsCustom(true);
    applyColors(newColors);
    localStorage.setItem('proxy-press-custom-theme', JSON.stringify(newColors));
    import('@capacitor/preferences').then(({ Preferences }) => {
      Preferences.set({ key: 'proxy-press-custom-theme', value: JSON.stringify(newColors) });
    });
  };

  const applyPreset = (colors: CustomColors, isDarkMode: boolean) => {
    setCustomColors(colors);
    setIsCustom(true);
    applyColors(colors);
    const colorsJson = JSON.stringify(colors);
    localStorage.setItem('proxy-press-custom-theme', colorsJson);
    import('@capacitor/preferences').then(({ Preferences }) => {
      Preferences.set({ key: 'proxy-press-custom-theme', value: colorsJson });
    });
    handleModeChange(isDarkMode ? 'dark' : 'light');
  };

  const resetTheme = () => {
    localStorage.removeItem('proxy-press-custom-theme');
    import('@capacitor/preferences').then(({ Preferences }) => {
      Preferences.remove({ key: 'proxy-press-custom-theme' });
    });
    setIsCustom(false);
    // Remove inline styles to fall back to CSS defaults
    const keys: (keyof CustomColors)[] = ['primary', 'bg', 'surface', 'accent', 'border', 'text-primary'];
    keys.forEach(key => document.documentElement.style.removeProperty('--' + key));
    document.documentElement.style.removeProperty('--primary-rgb');
    
    // Set colors state back to defaults based on mode
    setCustomColors(themeMode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/settings" className="settings-back-btn" aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">Theme Customization</h1>
      </div>

      <div className="settings-content">
        {/* Appearance Mode */}
        <div className="settings-group">
          <h2 className="settings-group-title">Appearance Mode</h2>
          <div className="settings-list">
            {(['light', 'dark', 'system'] as const).map(mode => (
              <div key={mode} className="settings-item" onClick={() => handleModeChange(mode)} style={{ cursor: 'pointer' }}>
                <div className="settings-item-content">
                  <div className="settings-item-text">
                    <span className="settings-item-label" style={{ textTransform: 'capitalize' }}>{mode} Mode</span>
                  </div>
                </div>
                {themeMode === mode && (
                  <div className="settings-check">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Presets */}
        <div className="settings-group">
          <h2 className="settings-group-title">Premium Presets</h2>
          <div className="theme-presets-grid">
             <button className="preset-card" onClick={() => applyPreset(DEFAULT_LIGHT, false)}>
                <div className="preset-preview" style={{ background: DEFAULT_LIGHT.bg }}>
                   <div className="preset-dot" style={{ background: DEFAULT_LIGHT.primary }}></div>
                </div>
                <span>Default Light</span>
             </button>
             <button className="preset-card" onClick={() => applyPreset(DEFAULT_DARK, true)}>
                <div className="preset-preview" style={{ background: DEFAULT_DARK.bg }}>
                   <div className="preset-dot" style={{ background: DEFAULT_DARK.primary }}></div>
                </div>
                <span>Default Dark</span>
             </button>
             <button className="preset-card" onClick={() => applyPreset(OLED_DARK, true)}>
                <div className="preset-preview" style={{ background: OLED_DARK.bg }}>
                   <div className="preset-dot" style={{ background: OLED_DARK.primary }}></div>
                </div>
                <span>OLED Black</span>
             </button>
             <button className="preset-card" onClick={() => applyPreset(MIDNIGHT_DARK, true)}>
                <div className="preset-preview" style={{ background: MIDNIGHT_DARK.bg }}>
                   <div className="preset-dot" style={{ background: MIDNIGHT_DARK.primary }}></div>
                </div>
                <span>Midnight</span>
             </button>
          </div>
        </div>

        {/* Full Customization */}
        <div className="settings-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 className="settings-group-title" style={{ marginBottom: 0 }}>Custom Colors</h2>
            {isCustom && (
              <button 
                onClick={resetTheme}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Reset Default
              </button>
            )}
          </div>
          <div className="settings-list">
            <ColorPickerItem label="Primary Color" value={customColors.primary} onChange={(v) => handleColorChange('primary', v)} />
            <ColorPickerItem label="Background" value={customColors.bg} onChange={(v) => handleColorChange('bg', v)} />
            <ColorPickerItem label="Surface" value={customColors.surface} onChange={(v) => handleColorChange('surface', v)} />
            <ColorPickerItem label="Text Color" value={customColors['text-primary']} onChange={(v) => handleColorChange('text-primary', v)} />
            <ColorPickerItem label="Accent Color" value={customColors.accent} onChange={(v) => handleColorChange('accent', v)} />
            <ColorPickerItem label="Border Color" value={customColors.border} onChange={(v) => handleColorChange('border', v)} />
          </div>
        </div>

        <div style={{ padding: '20px 0', textAlign: 'center' }}>
           <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Customizations are saved locally to your device.
           </p>
        </div>
      </div>

      <style jsx>{`
        .theme-presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 8px 16px;
        }
        .preset-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .preset-preview {
          width: 50px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preset-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .preset-card span {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

function ColorPickerItem({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="settings-item">
      <div className="settings-item-content">
        <div className="settings-item-text">
          <span className="settings-item-label">{label}</span>
          <span className="settings-item-sub">{value.toUpperCase()}</span>
        </div>
      </div>
      <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border)' }}>
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          style={{ 
            position: 'absolute', 
            top: '-5px', 
            left: '-5px', 
            width: '150%', 
            height: '150%', 
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            background: 'none'
          }} 
        />
      </div>
    </div>
  );
}
