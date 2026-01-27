declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    runtimeCaching?: any[];
    publicExcludes?: string[];
    sw?: string;
    swSrc?: string;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}
