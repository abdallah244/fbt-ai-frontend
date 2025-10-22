import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent) },
  { path: 'intro', loadComponent: () => import('./pages/intro/intro').then(m => m.IntroComponent), canActivate: [authGuard] },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat').then(m => m.ChatComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
