import { getProfileData } from '@/lib/actions';
import ProfileClient from './ProfileClient';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // We remove the blocking 'await' here to make the page mount INSTANTLY.
  // ProfileClient handles its own caching and background refreshing.
  return <ProfileClient id={id} initialData={null} />;
}
