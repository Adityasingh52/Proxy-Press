'use client';

import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

/* ─────────── TYPES ─────────── */
export interface PendingMessage {
  tempId: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: string;
  attachment?: string;
  replyTo?: string;
  queuedAt: string;
  retryCount: number;
}

const QUEUE_KEY = 'pp_offline_message_queue';
const MAX_RETRIES = 5;

/* ─────────── OFFLINE MANAGER ─────────── */
/**
 * Capacitor-native offline message queue manager.
 * 
 * Messages are stored in Capacitor Preferences (survives app restarts)
 * and automatically flushed when the device regains connectivity.
 */
export const OfflineManager = {
  _initialized: false,
  _flushCallbacks: [] as Array<(msg: PendingMessage, result: { success: boolean; id?: string; conversationId?: string }) => void>,
  _statusCallbacks: [] as Array<(online: boolean) => void>,

  /**
   * Initialize the offline manager. Should be called once at app startup.
   * Sets up network change listener for automatic background sync.
   */
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    // Listen for network status changes
    Network.addListener('networkStatusChange', (status) => {
      console.log('[OfflineManager] Network status changed:', status.connected ? 'ONLINE' : 'OFFLINE');
      
      // Notify status listeners
      this._statusCallbacks.forEach(cb => cb(status.connected));

      if (status.connected) {
        // Small delay to let the connection stabilize
        setTimeout(() => this.flushQueue(), 1500);
      }
    });

    // Check for pending messages on startup
    const status = await Network.getStatus();
    if (status.connected) {
      this.flushQueue();
    }

    console.log('[OfflineManager] Initialized. Online:', (await Network.getStatus()).connected);
  },

  /**
   * Subscribe to network status changes.
   * Returns an unsubscribe function.
   */
  onStatusChange(callback: (online: boolean) => void): () => void {
    this._statusCallbacks.push(callback);
    return () => {
      this._statusCallbacks = this._statusCallbacks.filter(cb => cb !== callback);
    };
  },

  /**
   * Subscribe to flush results (when queued messages are successfully sent).
   * Returns an unsubscribe function.
   */
  onFlush(callback: (msg: PendingMessage, result: { success: boolean; id?: string; conversationId?: string }) => void): () => void {
    this._flushCallbacks.push(callback);
    return () => {
      this._flushCallbacks = this._flushCallbacks.filter(cb => cb !== callback);
    };
  },

  /**
   * Check if the device is currently online.
   */
  async isOnline(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch {
      // Fallback to navigator.onLine for web
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
  },

  /**
   * Add a message to the offline queue.
   * The message will be sent automatically when the device is back online.
   */
  async queueMessage(messageData: Omit<PendingMessage, 'tempId' | 'queuedAt' | 'retryCount'>): Promise<string> {
    const queue = await this._getQueue();
    const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const pendingMsg: PendingMessage = {
      ...messageData,
      tempId,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };

    queue.push(pendingMsg);
    await this._saveQueue(queue);
    
    console.log(`[OfflineManager] Queued message: ${tempId} (${queue.length} in queue)`);
    return tempId;
  },

  /**
   * Attempt to send all pending messages in the queue.
   * Called automatically on network reconnection and on app startup.
   */
  async flushQueue() {
    const online = await this.isOnline();
    if (!online) {
      console.log('[OfflineManager] Still offline, skipping flush.');
      return;
    }

    const queue = await this._getQueue();
    if (queue.length === 0) return;

    console.log(`[OfflineManager] Flushing ${queue.length} pending messages...`);

    const remainingQueue: PendingMessage[] = [];
    
    // Import dynamically to avoid server/client boundary issues
    const { sendMessage: dbSendMessage } = await import('./actions');

    for (const msg of queue) {
      try {
        const result = await dbSendMessage({
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          text: msg.text,
          type: msg.type,
          attachment: msg.attachment,
          replyTo: msg.replyTo,
        });

        console.log(`[OfflineManager] ✓ Sent queued message: ${msg.tempId}`);
        
        // Notify subscribers that a queued message was sent
        this._flushCallbacks.forEach(cb => cb(msg, result));

      } catch (err) {
        console.error(`[OfflineManager] ✗ Failed to send: ${msg.tempId}`, err);
        msg.retryCount += 1;

        if (msg.retryCount < MAX_RETRIES) {
          remainingQueue.push(msg);
        } else {
          console.warn(`[OfflineManager] Dropped message after ${MAX_RETRIES} retries: ${msg.tempId}`);
          // Notify with failure
          this._flushCallbacks.forEach(cb => cb(msg, { success: false }));
        }
      }
    }

    await this._saveQueue(remainingQueue);

    if (remainingQueue.length > 0) {
      console.log(`[OfflineManager] ${remainingQueue.length} messages still pending.`);
    } else {
      console.log('[OfflineManager] Queue fully flushed! ✓');
    }
  },

  /**
   * Get the count of pending messages in the queue.
   */
  async getPendingCount(): Promise<number> {
    const queue = await this._getQueue();
    return queue.length;
  },

  /**
   * Clear the entire queue (for debugging/reset purposes).
   */
  async clearQueue() {
    await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify([]) });
    console.log('[OfflineManager] Queue cleared.');
  },

  /* ─── Internal Helpers ─── */
  async _getQueue(): Promise<PendingMessage[]> {
    try {
      const { value } = await Preferences.get({ key: QUEUE_KEY });
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  },

  async _saveQueue(queue: PendingMessage[]) {
    await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(queue) });
  },
};
