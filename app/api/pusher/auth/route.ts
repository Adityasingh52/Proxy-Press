import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const socketId = body.get('socket_id') as string;
    const channelName = body.get('channel_name') as string;

    // In a real app, you should verify the user's session here
    // For now, we allow the subscription if the socketId and channelName are present
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (err) {
    console.error('Pusher Auth Error:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
