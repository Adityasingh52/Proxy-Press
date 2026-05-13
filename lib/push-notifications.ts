import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const PushNotificationManager = {
  async register() {
    if (Capacitor.getPlatform() === 'web') {
      console.warn('Push notifications not supported on web');
      return;
    }

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied push permissions');
      return;
    }

    await PushNotifications.register();

    // Listeners
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // Save token to database
      try {
        const { updateFcmToken } = await import('@/lib/actions');
        await updateFcmToken(token.value);
      } catch (err) {
        console.error('Failed to save FCM token', err);
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // You could trigger a local UI update here
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      // Navigate to the relevant page (e.g. /messages or /notifications)
    });
  }
};
