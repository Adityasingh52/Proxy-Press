'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { currentUser } from '@/lib/data';
import './edit-profile.css';

export default function EditProfilePage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email || '',
    bio: currentUser.bio,
    contactInfo: currentUser.contactInfo || '',
  });

  // Handle top spacing
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
      return () => main.classList.remove('no-top-padding');
    }
  }, []);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    // In a real app, this would be an API call
    console.log('Saving profile data:', formData);
    
    // Simulate API delay
    setIsSuccess(true);
    
    setTimeout(() => {
      setShowConfirmModal(false);
      // Update global mock state if possible (though currentUser is a const export)
      // Since we can't easily mutate the imported const in Next.js without a state manager, 
      // we just simulate the success and redirect.
      router.push('/profile');
    }, 1500);
  };

  return (
    <div className="edit-profile-container design-ref">
      <div className="ref-header">
        <button onClick={() => router.push('/profile')} className="ref-back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="ref-title">Edit Profile</h1>
        <button className="ref-more-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>

      <div className="ref-content">
        {/* Avatar Section */}
        <div className="ref-avatar-section">
          <div className="ref-avatar-wrapper">
            <div className="ref-avatar-main">
              {currentUser.avatar}
            </div>
            <div className="ref-camera-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="ref-form">
          <h2 className="ref-section-label">Personal</h2>
          
          <div className="ref-input-container">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="ref-input"
              placeholder="Name"
            />
            <div className="ref-input-icon success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <div className="ref-input-row">
            <div className="ref-input-container half">
              <input
                type="text"
                value="College Press"
                readOnly
                className="ref-input"
              />
              <div className="ref-input-icon">🏛️</div>
            </div>
            <div className="ref-input-container half">
              <input
                type="text"
                value="2026"
                readOnly
                className="ref-input"
              />
              <div className="ref-input-icon">🎓</div>
            </div>
          </div>

          <h2 className="ref-section-label">Contact and Bio</h2>

          <div className="ref-input-container">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="ref-input"
              placeholder="Email"
            />
          </div>

          <div className="ref-input-container">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="ref-textarea"
              placeholder="Biography"
              rows={2}
            />
          </div>

          <div className="ref-input-container">
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              className="ref-input"
              placeholder="Contact Information"
            />
          </div>

          <button onClick={handleSaveClick} className="ref-save-btn">
            Save
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {!isSuccess ? (
              <>
                <div className="modal-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <h2 className="modal-title">Confirm Changes</h2>
                <p className="modal-text">Are you sure you want to update your profile information? This action will be reflected across its items. </p>
                <div className="modal-buttons">
                  <button onClick={() => setShowConfirmModal(false)} className="close-btn">
                    Not yet
                  </button>
                  <button onClick={confirmSave} className="confirm-btn">
                    Yes, Update
                  </button>
                </div>
              </>
            ) : (
              <div className="success-state">
                <div className="success-checkmark">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="modal-title">Success!</h2>
                <p className="modal-text">Your profile has been updated successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
