'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '../../settings.css';
import { getFollowRequests, respondToFollowRequest } from '@/lib/actions';

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('no-top-padding');
    }

    async function loadRequests() {
      try {
        const data = await getFollowRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to load follow requests:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRequests();

    return () => {
      if (main) main.classList.remove('no-top-padding');
    };
  }, []);

  const handleAction = async (requestId: string, accept: boolean) => {
    try {
      await respondToFollowRequest(requestId, accept);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to handle follow request:', err);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <Link href="/settings/privacy" className="settings-back-btn" aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="settings-title">Follow Requests</h1>
      </div>

      <div className="settings-content">
        {requests.length > 0 ? (
          <div className="settings-list" style={{ gap: '4px' }}>
            {requests.map(req => (
              <div key={req.id} className="settings-item" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-2)', overflow: 'hidden' }}>
                    {req.follower?.profilePicture ? (
                      <img src={req.follower.profilePicture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={req.follower.name} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.follower?.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{req.follower?.username}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleAction(req.id, true)}
                    style={{ 
                      padding: '8px 16px', borderRadius: '12px', border: 'none', 
                      background: 'var(--primary)', color: '#fff', 
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer' 
                    }}
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, false)}
                    style={{ 
                      padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', 
                      background: 'var(--surface-2)', color: 'var(--text-primary)', 
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer' 
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-circle">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
               </svg>
            </div>
            <h2 className="empty-title">No Follow Requests</h2>
            <p className="empty-desc">When people ask to follow you, their requests will appear here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 24px;
          text-align: center;
        }
        .empty-icon-circle {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }
        .empty-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .empty-desc {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 280px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
