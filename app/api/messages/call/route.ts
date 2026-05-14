import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const { targetUserId, channelName, type, caller } = await req.json();

    if (!targetUserId || !channelName || !caller) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Trigger the incoming-call event on the target user's private channel
    await pusherServer.trigger(`private-user-${targetUserId}`, 'incoming-call', {
      channelName,
      type,
      caller
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Pusher Signaling Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
