import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.redirectToTasks();
    }
  }
}
