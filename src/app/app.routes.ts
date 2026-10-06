import type { Routes } from '@angular/router';
import { EnableBiometricsPage } from './features/auth/enable-biometrics.page.ts';
import { LaunchPage } from './features/auth/launch.page.ts';
import { LoginPage } from './features/auth/login.page.ts';
import { RecoverPage } from './features/auth/recover.page.ts';
import { RegisterPage } from './features/auth/register.page.ts';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LaunchPage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'recover', component: RecoverPage },
  { path: 'enable-biometrics', component: EnableBiometricsPage },
];
