import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const { targetUserId, event, ...data } = await req.json();

    if (!targetUserId || !event) {
      return NextResponse.json({ error: 'Missing targetUserId or event' }, { status: 400 });
    }

    // Trigger the dynamic event on the target user's private channel
    await pusherServer.trigger(`private-user-${targetUserId}`, event, data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Pusher Signaling Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
