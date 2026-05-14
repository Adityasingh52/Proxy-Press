import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const ImageCache = {
  /**
   * Downloads an image from a URL and saves it to the native filesystem.
   * Returns a local URL that works offline.
   */
  async getCachedImage(url: string, subfolder: string = 'cache'): Promise<string> {
    if (!url || !Capacitor.isNativePlatform()) return url;
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('content:')) return url;

    try {
      // 1. Create a unique filename from the URL
      const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${btoa(url).substring(0, 32)}.${extension}`;
      const path = `${subfolder}/${fileName}`;

      // 2. Check if file already exists
      try {
        const result = await Filesystem.getUri({
          directory: Directory.Data,
          path: path
        });
        return Capacitor.convertFileSrc(result.uri);
      } catch {
        // File doesn't exist, proceed to download
      }

      // 3. Download the file
      console.log(`[ImageCache] Downloading: ${url}`);
      const download = await Filesystem.downloadFile({
        url: url,
        directory: Directory.Data,
        path: path,
        recursive: true
      });

      if (download.path) {
        const result = await Filesystem.getUri({
          directory: Directory.Data,
          path: path
        });
        return Capacitor.convertFileSrc(result.uri);
      }

      return url;
    } catch (err) {
      console.error('[ImageCache] Error caching image:', err);
      return url;
    }
  },

  /**
   * Helper to clear the entire image cache folder
   */
  async clearCache(subfolder: string = 'cache') {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Filesystem.rmdir({
        directory: Directory.Data,
        path: subfolder,
        recursive: true
      });
      console.log('[ImageCache] Cache cleared.');
    } catch (err) {
      console.error('[ImageCache] Failed to clear cache:', err);
    }
  }
};
