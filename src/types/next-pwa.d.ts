declare module 'next-pwa' {
    import { NextConfig } from 'next';
    function withPWA(config: NextConfig): NextConfig;
    export default function withPWAInit(options: any): typeof withPWA;
}
