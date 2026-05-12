'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { completeOnboarding, checkUsernameAvailability, uploadMedia, getCurrentUser } from '@/lib/actions';
import { compressImage } from '@/lib/image-utils';
import './onboarding.css';

// ─── TYPES ───
type Step = 1 | 2 | 3 | 4;

interface CropState {
  image: string;
  zoom: number;
  offset: { x: number; y: number };
}

type PhotoFilter = 'none' | 'vivid' | 'bw' | 'warm' | 'cool' | 'cinematic' | 'retro' | 'dramatic' | 'mono' | 'bloom';

const FILTERS: { id: PhotoFilter; label: string; filter: string }[] = [
  { id: 'none', label: 'Original', filter: 'none' },
  { id: 'vivid', label: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { id: 'bw', label: 'B&W', filter: 'grayscale(1)' },
  { id: 'warm', label: 'Warm', filter: 'sepia(0.3) saturate(1.3) brightness(1.05)' },
  { id: 'cool', label: 'Cool', filter: 'hue-rotate(180deg) brightness(1.1) saturate(1.1)' },
  { id: 'cinematic', label: 'Cinematic', filter: 'sepia(0.2) contrast(1.2) brightness(0.9) hue-rotate(-10deg)' },
  { id: 'retro', label: 'Retro', filter: 'sepia(0.5) contrast(0.9) brightness(1.1) saturate(1.2)' },
  { id: 'dramatic', label: 'Dramatic', filter: 'contrast(1.5) brightness(0.8) saturate(0.8)' },
  { id: 'mono', label: 'Mono', filter: 'grayscale(1) contrast(1.3)' },
  { id: 'bloom', label: 'Bloom', filter: 'brightness(1.1) saturate(1.2) contrast(0.9)' },
];

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91', country: 'India' },
  { code: '+1', label: '🇺🇸 +1', country: 'US' },
  { code: '+44', label: '🇬🇧 +44', country: 'UK' },
  { code: '+61', label: '🇦🇺 +61', country: 'AU' },
  { code: '+86', label: '🇨🇳 +86', country: 'CN' },
  { code: '+81', label: '🇯🇵 +81', country: 'JP' },
  { code: '+49', label: '🇩🇪 +49', country: 'DE' },
  { code: '+33', label: '🇫🇷 +33', country: 'FR' },
  { code: '+971', label: '🇦🇪 +971', country: 'UAE' },
  { code: '+65', label: '🇸🇬 +65', country: 'SG' },
  { code: '+82', label: '🇰🇷 +82', country: 'KR' },
  { code: '+55', label: '🇧🇷 +55', country: 'BR' },
  { code: '+7', label: '🇷🇺 +7', country: 'RU' },
  { code: '+39', label: '🇮🇹 +39', country: 'IT' },
  { code: '+34', label: '🇪🇸 +34', country: 'ES' },
];



export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');

  // Step 2 — Contact Information
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 3 — Optional Information
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [links, setLinks] = useState<string[]>(['']);

  // Cropper State
  const [isCropping, setIsCropping] = useState(false);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>('none');
  const [activeLegalDoc, setActiveLegalDoc] = useState<'none' | 'terms' | 'privacy'>('none');

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load current user data
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user) {
        setEmail(user.email || '');
        if (user.name && user.name !== 'New User') setName(user.name);
      }
    }
    loadUser();
  }, []);

  // Debounced username check
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleUsernameChange = useCallback((value: string) => {
    // Sanitize: lowercase, no spaces, alphanumeric + underscore only
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);

    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);

    if (sanitized.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    usernameCheckTimeout.current = setTimeout(async () => {
      const result = await checkUsernameAvailability(sanitized);
      setUsernameStatus(result.available ? 'available' : 'taken');
    }, 500);
  }, []);

  // Validation
  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) newErrors.name = 'Full name is required';
      if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      if (usernameStatus === 'taken') newErrors.username = 'This username is already taken';
      if (!phoneNumber.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!college.trim()) newErrors.college = 'College name is required';
      if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    setErrors({});
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropState({
        image: url,
        zoom: 1,
        offset: { x: 0, y: 0 }
      });
      setIsCropping(true);
    }
  };

  const handleConfirmCrop = async () => {
    if (!cropState || !cropperContainerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = cropState.image;
    
    await new Promise((resolve) => { img.onload = resolve; });

    // Target size for profile pic
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Get the container size
    const container = cropperContainerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Calculate how the image is scaled in the UI (object-fit: contain simulation)
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const aspect = nw / nh;
    
    let baseWidth, baseHeight;
    if (aspect > 1) {
      // Landscape: height matches container
      baseHeight = ch;
      baseWidth = ch * aspect;
    } else {
      // Portrait or square: width matches container
      baseWidth = cw;
      baseHeight = cw / aspect;
    }

    // Now reproduce exactly what we see in the UI
    // Image is centered in flex container + offset + zoom
    const zoom = cropState.zoom;
    const drawWidth = baseWidth * zoom * (targetSize / cw);
    const drawHeight = baseHeight * zoom * (targetSize / cw);
    
    const x = (targetSize - drawWidth) / 2 + (cropState.offset.x * (targetSize / cw));
    const y = (targetSize - drawHeight) / 2 + (cropState.offset.y * (targetSize / cw));

    // Fill background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, targetSize, targetSize);
    
    // Apply filter
    const filterObj = FILTERS.find(f => f.id === activeFilter);
    if (filterObj) {
      ctx.filter = filterObj.filter;
    }
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        setProfilePictureFile(file);
        setProfilePicture(URL.createObjectURL(blob));
        setIsCropping(false);
        setCropState(null);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCropDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cropState) return;

    if ('touches' in e && e.touches.length === 2) {
      e.preventDefault();
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (initialTouchDistance === null) {
        setInitialTouchDistance(distance);
        setInitialZoom(cropState.zoom);
      } else {
        const scale = distance / initialTouchDistance;
        const newZoom = Math.max(0.5, Math.min(5, initialZoom * scale));
        setCropState(prev => prev ? { ...prev, zoom: newZoom } : null);
      }
      return;
    }

    if (!isDragging) return;
    if ('touches' in e) e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    
    setCropState({
      ...cropState,
      offset: {
        x: cropState.offset.x + dx,
        y: cropState.offset.y + dy
      }
    });
    
    setDragStart({ x: clientX, y: clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsDragging(false); // Stop dragging when starting a pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setInitialTouchDistance(distance);
      setInitialZoom(cropState?.zoom || 1);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialTouchDistance(null);
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, '']);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // Upload profile picture if selected
      let pictureUrl: string | undefined;
      if (profilePictureFile) {
        // Compress before upload to stay under server limits and save bandwidth
        const compressedFile = await compressImage(profilePictureFile);
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('category', 'images');
        const uploadResult = await uploadMedia(formData);
        pictureUrl = uploadResult.url;
      }

      const filteredLinks = links.filter((l) => l.trim().length > 0);

      const result = await completeOnboarding({
        name,
        username,
        dateOfBirth,
        college,
        branch: branch || undefined,
        department: department || undefined,
        phone: `${countryCode} ${phoneNumber}`,
        bio: bio || undefined,
        gender: gender || undefined,
        links: filteredLinks.length > 0 ? filteredLinks : undefined,
        profilePicture: pictureUrl,
      });

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      } else {
        setErrors({ submit: result.error || 'Something went wrong' });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Also allow finishing/skipping step 3 without filling optional fields


  // ─── Success Screen ───
  if (showSuccess) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div className="onboarding-success">
              <div className="success-check">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="success-title">Welcome to Proxy-Press!</h2>
              <p className="success-message">
                Your profile is all set, <span className="success-handle">@{username}</span>. Redirecting you to your feed...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-bg-glow">
        <div className="glow-blob blob-1" />
        <div className="glow-blob blob-2" />
        <div className="glow-blob blob-3" />
      </div>

      <div className="onboarding-container">
        {/* Progress Indicator */}
        <div className="onboarding-progress">
          <div className="progress-steps">
            {[1, 2, 3, 4].map((step, i) => (
              <div key={step} className="progress-step">
                <div className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                  {currentStep > step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {i < 3 && (
                  <div className={`step-connector ${currentStep > step + 1 ? 'filled' : ''} ${currentStep === step + 1 ? 'filling' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="onboarding-card">
          {errors.submit && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              {errors.submit}
            </div>
          )}

          {/* ─── STEP 1: Essentials ─── */}
          {currentStep === 1 && (
            <div className="step-content" key="step-1">
              <div className="step-header">
                <div className="step-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h2 className="step-title">Essentials</h2>
                <p className="step-subtitle">Let's start with the basics</p>
              </div>

              <div className="onboarding-form">
                {/* Full Name */}
                <div className="ob-form-group">
                  <label className="ob-label" htmlFor="ob-name">Full Name</label>
                  <div className="ob-input-wrapper">
                    <span className="ob-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="ob-name"
                      type="text"
                      className={`ob-input ${errors.name ? 'error' : ''}`}
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <span className="ob-field-error">{errors.name}</span>}
                </div>

                {/* Username / Handle */}
                <div className="ob-form-group">
                  <label className="ob-label" htmlFor="ob-username">Username</label>
                  <div className="ob-input-wrapper">
                    <span className="ob-input-icon" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-subtle)' }}>@</span>
                    <input
                      id="ob-username"
                      type="text"
                      className={`ob-input ${errors.username ? 'error' : usernameStatus === 'available' ? 'success' : ''}`}
                      value={username}
                      onChange={(e) => { handleUsernameChange(e.target.value); setErrors((p) => ({ ...p, username: '' })); }}
                      placeholder="username"
                    />
                    {usernameStatus !== 'idle' && (
                      <span className={`ob-input-status ${usernameStatus}`}>
                        {usernameStatus === 'checking' && '⏳'}
                        {usernameStatus === 'available' && '✓'}
                        {usernameStatus === 'taken' && '✗'}
                      </span>
                    )}
                  </div>
                  {errors.username && <span className="ob-field-error">{errors.username}</span>}
                </div>

                {/* Phone Number */}
                <div className="ob-form-group">
                  <label className="ob-label" htmlFor="ob-phone">Phone Number</label>
                  <div className={`phone-input-group ${errors.phone ? 'error' : ''}`}>
                    <select
                      className="country-code-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.label}
                        </option>
                      ))}
                    </select>
                    <div className="phone-divider" />
                    <input
                      id="ob-phone"
                      type="tel"
                      className="phone-number-input"
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, '')); setErrors((p) => ({ ...p, phone: '' })); }}
                      placeholder="98765 43210"
                    />
                  </div>
                  {errors.phone && <span className="ob-field-error">{errors.phone}</span>}
                </div>

                <div className="onboarding-actions">
                  <button type="button" className="ob-btn-next" onClick={handleNext}>
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Academy ─── */}
          {currentStep === 2 && (
            <div className="step-content" key="step-2">
              <div className="step-header">
                <div className="step-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10L12 5L2 10l10 5l10-5z" /><path d="M6 12v5c3.33 3 9.33 3 12 0v-5" />
                  </svg>
                </div>
                <h2 className="step-title">Academy</h2>
                <p className="step-subtitle">Your campus and identification</p>
              </div>

              <div className="onboarding-form">
                {/* College */}
                <div className="ob-form-group">
                  <label className="ob-label" htmlFor="ob-college">College / University</label>
                  <div className="ob-input-wrapper">
                    <span className="ob-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10L12 5L2 10l10 5l10-5z" /><path d="M6 12v5c3.33 3 9.33 3 12 0v-5" />
                      </svg>
                    </span>
                    <input
                      id="ob-college"
                      type="text"
                      className={`ob-input ${errors.college ? 'error' : ''}`}
                      value={college}
                      onChange={(e) => { setCollege(e.target.value); setErrors((p) => ({ ...p, college: '' })); }}
                      placeholder="e.g. MIT"
                    />
                  </div>
                  {errors.college && <span className="ob-field-error">{errors.college}</span>}
                </div>

                <div className="ob-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="ob-form-group" style={{ flex: 1 }}>
                    <label className="ob-label">Branch</label>
                    <input
                      type="text"
                      className="ob-input no-icon"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. CSE"
                    />
                  </div>
                  <div className="ob-form-group" style={{ flex: 1 }}>
                    <label className="ob-label">Dept.</label>
                    <input
                      type="text"
                      className="ob-input no-icon"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. B.Tech"
                    />
                  </div>
                </div>

                <div className="ob-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="ob-form-group" style={{ flex: '1.2' }}>
                    <label className="ob-label">Birth Date</label>
                    <input
                      type="date"
                      className={`ob-input no-icon ${errors.dateOfBirth ? 'error' : ''}`}
                      value={dateOfBirth}
                      onChange={(e) => { setDateOfBirth(e.target.value); setErrors((p) => ({ ...p, dateOfBirth: '' })); }}
                    />
                    {errors.dateOfBirth && <span className="ob-field-error">{errors.dateOfBirth}</span>}
                  </div>
                  <div className="ob-form-group" style={{ flex: '1', minWidth: '100px' }}>
                    <label className="ob-label">Gender</label>
                    <select 
                      className="ob-input no-icon"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="onboarding-actions">
                  <button type="button" className="ob-btn-back" onClick={handleBack}>←</button>
                  <button type="button" className="ob-btn-next" onClick={handleNext}>Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: The Look (Photo) ─── */}
          {currentStep === 3 && (
            <div className="step-content" key="step-3">
              <div className="step-header">
                <div className="step-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <h2 className="step-title" style={{ fontSize: '28px', background: 'linear-gradient(135deg, var(--text-primary), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pick your Look</h2>
                <p className="step-subtitle">Pick a photo that represents you best</p>
              </div>

              <div className="onboarding-form">
                <div className="photo-selection-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div 
                    className={`profile-pic-preview-large ${profilePicture ? 'has-image' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ margin: '0 auto' }}
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile preview" />
                    ) : (
                      <div className="photo-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Choose Photo</span>
                      </div>
                    )}
                    <div className="photo-edit-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="onboarding-actions" style={{ marginTop: '12px' }}>
                  <button type="button" className="ob-btn-back" onClick={handleBack}>←</button>
                  <button type="button" className="ob-btn-next" onClick={handleNext}>Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Presence (Bio/Socials) ─── */}
          {currentStep === 4 && (
            <div className="step-content" key="step-4">
              <div className="step-header">
                <div className="step-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h2 className="step-title">Personality</h2>
                <p className="step-subtitle">Share a bit about yourself</p>
              </div>

              <div className="onboarding-form">
                {/* Bio */}
                <div className="ob-form-group">
                  <label className="ob-label">Tell us about yourself</label>
                  <textarea
                    className="ob-textarea"
                    placeholder="Wanderlust. Foodie. Code enthusiast."
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Social Links */}
                <div className="ob-form-group">
                  <label className="ob-label">Social Links (Optional)</label>
                  {links.map((link, i) => (
                    <div key={i} className="ob-link-row" style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        className="ob-link-input"
                        placeholder="https://instagram.com/..."
                        value={link}
                        onChange={(e) => handleLinkChange(i, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {links.length > 1 && (
                        <button type="button" className="ob-link-remove" onClick={() => handleRemoveLink(i)} style={{ padding: '0 8px' }}>✕</button>
                      )}
                    </div>
                  ))}
                  {links.length < 5 && (
                    <button type="button" className="ob-add-link-btn" onClick={handleAddLink}>
                      + Add social link
                    </button>
                  )}
                </div>

                <div className="onboarding-actions">
                  <button type="button" className="ob-btn-back" onClick={handleBack}>←</button>
                  <button type="button" className="ob-btn-finish" onClick={handleFinish} disabled={isSubmitting}>
                    {isSubmitting ? 'Finalizing...' : 'Finish ✓'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="onboarding-footer-text external">
          By using our platform, you agree to our{' '}
          <button onClick={() => setActiveLegalDoc('terms')} className="ob-link-btn">Terms of Service</button> and{' '}
          <button onClick={() => setActiveLegalDoc('privacy')} className="ob-link-btn">Privacy Policy</button>.
        </p>
      </div>

      {/* ─── LEGAL MODAL ─── */}
      {activeLegalDoc !== 'none' && (
        <div className="crop-modal-overlay legal-modal-overlay">
          <div className="crop-modal legal-modal">
            <div className="legal-modal-header">
              <h3 className="crop-modal-title">
                {activeLegalDoc === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
            </div>
            
            <div className="legal-modal-content">
              {activeLegalDoc === 'terms' ? (
                <div className="legal-text-body">
                  <h4>1. Acceptance of Terms</h4>
                  <p>By using Proxy-Press, you agree to be bound by these Terms. If you do not agree, please do not use the app.</p>
                  <h4>2. Eligibility</h4>
                  <p>You must be a student or faculty member of the associated college to use this platform.</p>
                  <h4>3. Community Guidelines</h4>
                  <p>Harassment, hate speech, or inappropriate content is strictly prohibited.</p>
                  <h4>4. Content Ownership</h4>
                  <p>You retain rights to your content but grant us a license to display it.</p>
                  <h4>5. Termination</h4>
                  <p>We reserves the right to terminate accounts that violate our community standards.</p>
                </div>
              ) : (
                <div className="legal-text-body">
                  <h4>1. Information Collection</h4>
                  <p>We collect your name, email, and campus information to provide our services.</p>
                  <h4>2. Data Usage</h4>
                  <p>Your data is used solely to maintain your account and improve your experience.</p>
                  <h4>3. Data Protection</h4>
                  <p>We use industry-standard encryption to protect your personal information.</p>
                  <h4>4. No Third-Party Sales</h4>
                  <p>We do not sell your personal information to third parties or advertisers.</p>
                  <h4>5. Your Rights</h4>
                  <p>You can update or delete your data anytime through your account settings.</p>
                </div>
              )}
            </div>
            
            <div className="legal-modal-footer">
              <button className="crop-btn-save" onClick={() => setActiveLegalDoc('none')}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CROP MODAL ─── */}
      {isCropping && cropState && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <h3 className="crop-modal-title">Adjust Photo</h3>
            <div 
              className="crop-container"
              ref={cropperContainerRef}
              onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
              onMouseMove={handleCropDrag}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleCropDrag}
              onTouchEnd={handleTouchEnd}
            >
              <div className="crop-mask">
                <div className="crop-circle" />
              </div>
              <img 
                src={cropState.image} 
                alt="To crop" 
                style={{
                  transform: `translate(calc(-50% + ${cropState.offset.x}px), calc(-50% + ${cropState.offset.y}px)) scale(${cropState.zoom})`,
                  filter: FILTERS.find(f => f.id === activeFilter)?.filter,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                draggable={false}
              />
            </div>

            <div className="filter-selection">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  <div className="filter-preview" style={{ filter: f.filter, backgroundImage: `url(${cropState.image})` }} />
                  <span className="filter-label">{f.label}</span>
                </button>
              ))}
            </div>

            <div className="crop-footer">
              <button className="crop-btn-cancel" onClick={() => setIsCropping(false)}>Cancel</button>
              <button className="crop-btn-save" onClick={handleConfirmCrop}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
