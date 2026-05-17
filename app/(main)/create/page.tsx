import { Suspense } from 'react';
import CreatePostClient from './CreatePostClient';

export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="feed-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    }>
      <CreatePostClient />
    </Suspense>
  );
}
