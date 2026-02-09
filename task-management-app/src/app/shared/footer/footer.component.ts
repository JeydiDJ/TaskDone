import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
})
export class FooterComponent {
  authService = inject(AuthService);

  currentYear = new Date().getFullYear();

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }


}
