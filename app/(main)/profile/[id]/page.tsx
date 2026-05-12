import { getProfileData } from '@/lib/actions';
import ProfileClient from './ProfileClient';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // High-performance server-side fetch
  const initialData = await getProfileData(id);

  if (!initialData) {
    notFound();
  }

  return <ProfileClient id={id} initialData={initialData} />;
}
