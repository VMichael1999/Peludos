import { type EnvironmentProviders, type Provider, inject } from '@angular/core';
import { withComponentInputBinding } from '@angular/router';
import { provideNativeHttpClient } from '@ng-native/platform/http';
import { provideNativeRouter } from '@ng-native/router';
import { LIVE_DATA, MAPS_API_KEY } from './core/config.ts';
import { routes } from './app.routes.ts';
import { AuthRepository } from './data/auth/auth.repository.ts';
import { MockAuthRepository } from './data/auth/mock-auth.repository.ts';
import { AlertsRepository } from './data/alerts/alerts.repository.ts';
import { MockAlertsRepository } from './data/alerts/mock-alerts.repository.ts';
import { HealthRepository } from './data/health/health.repository.ts';
import { MockHealthRepository } from './data/health/mock-health.repository.ts';
import { NotificationsRepository } from './data/notifications/notifications.repository.ts';
import { MockNotificationsRepository } from './data/notifications/mock-notifications.repository.ts';
import { PetsRepository } from './data/pets/pets.repository.ts';
import { MockPetsRepository } from './data/pets/mock-pets.repository.ts';
import { FallbackPlacesRepository } from './data/places/fallback-places.repository.ts';
import { GooglePlacesRepository } from './data/places/google-places.repository.ts';
import { MockPlacesRepository } from './data/places/mock-places.repository.ts';
import { PlacesRepository } from './data/places/places.repository.ts';
import { PostsRepository } from './data/posts/posts.repository.ts';
import { CatApiPhotosRepository } from './data/photos/cat-api-photos.repository.ts';
import { ChainPetPhotosRepository } from './data/photos/chain-pet-photos.repository.ts';
import { DogCeoPhotosRepository } from './data/photos/dog-ceo-photos.repository.ts';
import { MockPetPhotosRepository } from './data/photos/mock-pet-photos.repository.ts';
import { PetPhotosRepository } from './data/photos/pet-photos.repository.ts';
import { MockPostsRepository } from './data/posts/mock-posts.repository.ts';
import { PhotoPostsRepository } from './data/posts/photo-posts.repository.ts';

/**
 * The composition root: where each port gets the adapter behind it. Swapping the mock backend for
 * a real one (Supabase, Firebase, an API) is a change to these lines and nowhere else.
 */
export const appProviders: (Provider | EnvironmentProviders)[] = [
  provideNativeRouter(routes, withComponentInputBinding()),
  { provide: AuthRepository, useClass: MockAuthRepository },
  MockPostsRepository,
  MockPetPhotosRepository,
  DogCeoPhotosRepository,
  CatApiPhotosRepository,
  {
    // Dogs come from Dog CEO and cats from The Cat API in the running app; tests and offline
    // builds get no photos.
    provide: PetPhotosRepository,
    useFactory: () =>
      inject(LIVE_DATA)
        ? new ChainPetPhotosRepository([inject(DogCeoPhotosRepository), inject(CatApiPhotosRepository)])
        : inject(MockPetPhotosRepository),
  },
  {
    provide: PostsRepository,
    useFactory: () => new PhotoPostsRepository(inject(MockPostsRepository), inject(PetPhotosRepository)),
  },
  { provide: AlertsRepository, useClass: MockAlertsRepository },
  provideNativeHttpClient(),
  MockPlacesRepository,
  GooglePlacesRepository,
  {
    // With a Google key: real places, falling back to samples (and saying so) when Google cannot
    // answer. Without one, only samples.
    provide: PlacesRepository,
    useFactory: () =>
      inject(MAPS_API_KEY)
        ? new FallbackPlacesRepository(inject(GooglePlacesRepository), inject(MockPlacesRepository))
        : inject(MockPlacesRepository),
  },
  { provide: HealthRepository, useClass: MockHealthRepository },
  { provide: NotificationsRepository, useClass: MockNotificationsRepository },
  { provide: PetsRepository, useClass: MockPetsRepository },
];
