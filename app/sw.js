import { installSerwist } from '@serwist/sw';

const defaultManifest = [];

installSerwist({
  precacheEntries: self.__SW_MANIFEST || defaultManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});
