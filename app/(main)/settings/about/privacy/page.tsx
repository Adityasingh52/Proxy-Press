'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import '../../settings.css';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }
    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us when you create an account, such as your name, email address, and profile information. We also collect the content you post and your interactions with other users.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information to provide, maintain, and improve our services, to communicate with you about updates, and to protect the security of our community.'
    },
    {
      title: '3. Data Sharing',
      content: 'We do not sell your personal data. We may share information with service providers who perform services for us, or when required by law.'
    },
    {
      title: '4. Security',
      content: 'We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever completely secure.'
    },
    {
      title: '5. Your Choices',
      content: 'You can update your account information at any time through the settings page. You may also request to delete your account, which will remove your personal information from our active databases.'
    },
    {
      title: '6. Cookies and Tracking',
      content: 'We use cookies and similar technologies to remember your preferences, keep you logged in, and understand how you use our app. You can control these through your browser settings.'
    },
    {
      title: '7. Data Retention',
      content: 'We retain your personal information for as long as your account is active or as needed to provide you with services. If you delete your account, we will purge your personal data within 30 days.'
    },
    {
      title: '8. Children\'s Privacy',
      content: 'Proxy-Press is intended for college-aged users. We do not knowingly collect personal information from children under the age of 13. If we discover such data, we will delete it immediately.'
    }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Link href="/settings/about" className="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">Privacy Policy</h1>
      </div>

      <div className="settings-content">
        <div className="about-intro-section">
          <p className="about-intro-text">
            Your privacy matters to us. This policy explains how Proxy-Press handles your personal information.
          </p>
        </div>

        <div className="legal-content">
          {sections.map((section, index) => (
            <div key={index} className="about-story-section">
              <h3 className="about-story-title">{section.title}</h3>
              <div className="about-story-text">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="about-footer">
          <p className="about-credits">Last updated: April 24, 2026</p>
        </div>
      </div>
    </div>
  );
}
