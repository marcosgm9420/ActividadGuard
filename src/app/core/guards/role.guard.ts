import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factoría de guards (función de orden superior):
 * recibe el rol permitido y DEVUELVE un guard (CanActivateFn).
 */
export const roleGuard = (allowedRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Si no ha iniciado sesión → al login (guardando a dónde quería ir)
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // 2. Si tiene el rol correcto → puede pasar
    if (authService.hasRole(allowedRole)) {
      return true;
    }

    // 3. Si tiene sesión pero NO el rol → a su página de inicio
    //    (un operador que intente entrar en /admin acaba en /user-dashboard)
    return router.createUrlTree([authService.getHomeRoute()]);
  };
};