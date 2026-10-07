import { InjectionToken } from '@angular/core';

/**
 * The Google Maps key, provided by `main.ts` from `.env` through `app.config.js`. Empty when there
 * is none, and the app then uses sample places. It is a client key: it travels inside the app, so
 * it must be restricted in the Google Cloud console to the APIs and the app that use it.
 */
export const MAPS_API_KEY = new InjectionToken<string>('MAPS_API_KEY', { factory: () => '' });

/**
 * True only in the running app, which turns on what needs the internet and is only decoration: real
 * photos. `main.ts` sets it; tests and anything else that builds the app leave it off, so they never
 * reach out to a network.
 */
export const LIVE_DATA = new InjectionToken<boolean>('LIVE_DATA', { factory: () => false });
