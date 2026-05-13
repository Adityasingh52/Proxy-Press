import { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="msg-page-skeleton" />}>
      <MessagesClient />
    </Suspense>
  );
}
