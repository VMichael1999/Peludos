import type { EnvironmentProviders, Provider } from '@angular/core';
import { withComponentInputBinding } from '@angular/router';
import { provideNativeRouter } from '@ng-native/router';
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
import { MockPlacesRepository } from './data/places/mock-places.repository.ts';
import { PlacesRepository } from './data/places/places.repository.ts';
import { PostsRepository } from './data/posts/posts.repository.ts';
import { MockPostsRepository } from './data/posts/mock-posts.repository.ts';

/**
 * The composition root: where each port gets the adapter behind it. Swapping the mock backend for
 * a real one (Supabase, Firebase, an API) is a change to these lines and nowhere else.
 */
export const appProviders: (Provider | EnvironmentProviders)[] = [
  provideNativeRouter(routes, withComponentInputBinding()),
  { provide: AuthRepository, useClass: MockAuthRepository },
  { provide: PostsRepository, useClass: MockPostsRepository },
  { provide: AlertsRepository, useClass: MockAlertsRepository },
  { provide: PlacesRepository, useClass: MockPlacesRepository },
  { provide: HealthRepository, useClass: MockHealthRepository },
  { provide: NotificationsRepository, useClass: MockNotificationsRepository },
  { provide: PetsRepository, useClass: MockPetsRepository },
];
