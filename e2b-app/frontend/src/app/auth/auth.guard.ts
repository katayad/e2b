import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('AuthGuard checking authentication for route:', state.url);
  const isAuth = authService.isAuthenticated();
  console.log('User authenticated:', isAuth);
  
  if (isAuth) {
    return true;
  } else {
    console.log('Redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
};