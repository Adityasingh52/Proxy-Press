import { redirect } from 'next/navigation';

export default function StoryRedirect() {
  // Stories are typically viewed on the home page or messages page via query params.
  // Redirecting to home as a fallback.
  redirect('/');
}
