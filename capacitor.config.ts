import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proxypress.app',
  appName: 'Proxy-Press',
  webDir: 'out', // Next.js static export dir (though we'll use server URL)
  server: {
    url: 'https://proxy-press-omega.vercel.app',
    cleartext: true
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    captureInput: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
