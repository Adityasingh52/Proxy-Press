'use client';

import { useState, useEffect, useRef } from 'react';
import { Author } from '@/lib/data';

interface EditProfileModalProps {
  user: Author;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<Author>) => void;
}

export default function EditProfileModal({ user, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    college: user.college,
    avatar: user.avatar,
  });
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update form data when user prop changes (e.g. if we get real data later)
  useEffect(() => {
    setFormData({
      name: user.name,
      bio: user.bio,
      college: user.college,
      avatar: user.avatar,
    });
  }, [user]);

  // Assign stream to video element when webcam view is opened
  useEffect(() => {
    if (showWebcam && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showWebcam]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  }

  // Clean up stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      streamRef.current = stream;
      setShowWebcam(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, avatar: imageData }));
        stopCamera();
      }
    }
  };

  const isImage = formData.avatar.startsWith('data:') || formData.avatar.startsWith('http') || formData.avatar.startsWith('/');
  const isEmoji = !isImage;

  return (
    <div className="modal-overlay" onClick={() => { stopCamera(); onClose(); }}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="btn-icon" onClick={() => { stopCamera(); onClose(); }} aria-label="Close">
            ✖️
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isEmoji ? '48px' : '0', boxShadow: 'var(--shadow-lg)',
                  border: '4px solid var(--surface)', overflow: 'hidden',
                  position: 'relative'
                }}>
                  {isEmoji ? formData.avatar : (
                    <img 
                      src={formData.avatar} 
                      alt="Avatar Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  
                  {showWebcam && (
                    <div style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 10 }}>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                      />
                    </div>
                  )}
                </div>

                {cameraError && (
                  <p style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 500 }}>{cameraError}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                  {!showWebcam ? (
                    <>
                      <button
                        type="button"
                        onClick={triggerGallery}
                        className="btn btn-ghost"
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        🖼️ Gallery
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="btn btn-ghost"
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        📸 Camera
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="btn btn-primary"
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px' }}
                      >
                        🎯 Take Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="btn btn-ghost"
                        style={{ fontSize: '13px', padding: '6px 16px' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                  {['👤', '👩', '🧑', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🎨'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { stopCamera(); setFormData(prev => ({ ...prev, avatar: emoji })); }}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        border: formData.avatar === emoji ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: 'var(--surface)', cursor: 'pointer', fontSize: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  College / Affiliation
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="College Name"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="textarea-field"
                  placeholder="Tell us about yourself..."
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => { stopCamera(); onClose(); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" onClick={stopCamera}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
