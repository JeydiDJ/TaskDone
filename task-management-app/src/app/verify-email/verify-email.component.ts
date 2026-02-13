import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // needed for *ngIf and [ngClass]
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
})
export class VerifyEmailComponent implements OnInit {
  message = signal('Verifying your email...');
  success = signal(false);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

 ngOnInit(): void {
  const token = this.route.snapshot.paramMap.get('token');

  if (!token) {
    this.message.set('Invalid verification link.');
    this.success.set(false);
    this.loading.set(false);
    return;
  }

  // Use environment.apiUrl like the rest of the app
  const backendUrl = `${environment.apiUrl}/auth/verify-email/${token}`;

  this.http.get<{ message: string }>(backendUrl)
    .subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.success.set(true);
        this.loading.set(false);

        // Redirect to login after 5 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Email verification failed.');
        this.success.set(false);
        this.loading.set(false);
      }
    });
}


  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
