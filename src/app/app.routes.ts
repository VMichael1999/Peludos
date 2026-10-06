import type { Routes } from '@angular/router';
import { AlertDetailPage } from './features/alerts/alert-detail.page.ts';
import { ReportAlertPage } from './features/alerts/report-alert.page.ts';
import { EnableBiometricsPage } from './features/auth/enable-biometrics.page.ts';
import { CreatePostPage } from './features/create/create-post.page.ts';
import { HealthPage } from './features/health/health.page.ts';
import { LaunchPage } from './features/auth/launch.page.ts';
import { LoginPage } from './features/auth/login.page.ts';
import { RecoverPage } from './features/auth/recover.page.ts';
import { RegisterPage } from './features/auth/register.page.ts';
import { NotificationsPage } from './features/notifications/notifications.page.ts';
import { DirectoryPage } from './features/places/directory.page.ts';
import { StoreDetailPage } from './features/places/store-detail.page.ts';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LaunchPage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'recover', component: RecoverPage },
  { path: 'enable-biometrics', component: EnableBiometricsPage },
  { path: 'report', component: ReportAlertPage },
  { path: 'alert/:id', component: AlertDetailPage },
  { path: 'stores', component: DirectoryPage },
  { path: 'store/:id', component: StoreDetailPage },
  { path: 'health/:id', component: HealthPage },
  { path: 'notifications', component: NotificationsPage },
  { path: 'create', component: CreatePostPage },
];
