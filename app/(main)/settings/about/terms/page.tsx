'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import '../../settings.css';

export default function TermsOfServicePage() {
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
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Proxy-Press, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the application.'
    },
    {
      title: '2. Eligibility',
      content: 'You must be a student or faculty member of the associated college to use this platform. You are responsible for ensuring that your account information is accurate.'
    },
    {
      title: '3. Community Guidelines',
      content: 'Proxy-Press is built for positive community interaction. Harassment, hate speech, or the distribution of inappropriate content is strictly prohibited. Users found violating these guidelines may be banned permanently.'
    },
    {
      title: '4. Privacy',
      content: 'Your privacy is important to us. Please refer to our Privacy Policy for information on how we collect, use, and disclose information from our users.'
    },
    {
      title: '5. Content Ownership',
      content: 'You retain all rights to the content you post on Proxy-Press. By posting content, you grant Proxy-Press a non-exclusive, royalty-free license to display and distribute your content within the platform.'
    },
    {
      title: '6. Limitation of Liability',
      content: 'Proxy-Press is provided "as is" without any warranties. We are not responsible for any damages or losses resulting from your use of the platform.'
    },
    {
      title: '7. Prohibited Activities',
      content: 'You may not attempt to scrape, hack, or interfere with the proper functioning of Proxy-Press. Automated accounts or bots are strictly prohibited unless explicitly authorized.'
    },
    {
      title: '8. Termination',
      content: 'We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.'
    },
    {
      title: '9. Changes to Terms',
      content: 'We may update these terms from time to time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.'
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
        <h1 className="settings-title">Terms of Service</h1>
      </div>

      <div className="settings-content">
        <div className="about-intro-section">
          <p className="about-intro-text">
            Last updated: April 24, 2026. Please read these terms carefully before using our platform.
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
          <p className="about-credits">Thank you for being a part of Proxy-Press.</p>
        </div>
      </div>
    </div>
  );
}
