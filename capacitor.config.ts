import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexora.shilpadresses',
  appName: 'Shilpa Dresses',
  webDir: 'dist',
  backgroundColor: '#4A0E17',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#4A0E17',
    buildOptions: {
      keystorePath: 'release-key.jks',
      keystoreAlias: 'shilpadresses',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      backgroundColor: '#4A0E17',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#4A0E17',
      overlaysWebView: false
    }
  }
};

export default config;
