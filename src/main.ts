// Expo's runtime: its fetch, whose response streams a body, and URL, TextDecoderStream and
// structuredClone. Metro runs it before this file only when something imports it, and nothing
// else does in a release build, which would then get React Native's fetch, with no body.
import 'expo';
import Constants from 'expo-constants';
import { AppRegistry, Image, Platform, processColor } from 'react-native';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { getFabricUIManager, registerPlatformComponents, styleSheetOf } from '@ng-native/fabric';
import { loadFonts } from '@ng-native/expo/fonts';
import { appProviders } from './app/app.providers.ts';
import { MAPS_API_KEY } from './app/core/config.ts';
import { App } from './app/app.ts';

registerPlatformComponents(Platform.OS);

AppRegistry.registerRunnable('main', async ({ rootTag }: { rootTag: number | string }) => {
  // The brand font must be registered with the platform before the first layout, or the first
  // paint is in the system font and reflows. If it fails the app still starts, in the fallback.
  await loadFonts(styleSheetOf(App)).catch((error: unknown) => console.error(error));

  const app = mount(Number(rootTag), App, getFabricUIManager(), {
    // The Google key comes from .env through app.config.js. It is read here, not in the token, so
    // that the tests, which never load this file, run without React Native and without a key.
    providers: [...appProviders, { provide: MAPS_API_KEY, useValue: String(Constants.expoConfig?.extra?.['googleMapsApiKey'] ?? '') }],
    // Colours, as the integers the platform wants.
    processColor,
    // What `@media` resolves against. Without it every media query is false and a responsive
    // layout renders as its smallest case.
    conditions: currentConditions(),
    // Values only the device knows - the hairline width, which is a third of a point on a 3x
    // screen. Without it `1px` is what you get, and that is a visibly fat divider.
    tokens: deviceTokens(),
    // Turns a `require('./x.png')` into something native can load. Without it images are blank.
    resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
  });

  // Re-resolves the conditions when the device rotates or the theme changes. A rotation dirties
  // no component and no binding, so without this nothing re-renders and `dark:` stops following
  // the system switch.
  watchConditions(app.engine);
});
