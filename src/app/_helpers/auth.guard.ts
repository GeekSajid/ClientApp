import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from 'src/app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        //private auth: AngularFireAuth,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        debugger;
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
            // authorised so return true
            return true;
        }
        else{
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
   
    }
    // canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean>|boolean {
    //     return this.auth.map((auth) => {
    //         const currentUser = this.authenticationService.currentUserValue;
    //         if (auth) {
    //             console.log('authenticated');
    //             return true;
    //         }
    //         console.log('not authenticated');
    //         this.router.navigateByUrl('/login');
    //         return false;
    //     }).first(); // this might not be necessary - ensure `first` is imported if you use it
    // }
}