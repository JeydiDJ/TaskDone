import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);
  isAdmin = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
    });
  }

  ngOnInit(): void {
    // Initialize the form based on the default role
    this.updateRoleSelection();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  updateRoleSelection() {
    const roleControl = this.registerForm.get('role');

    // Update signals for template
    this.isAdmin.set(roleControl?.value === 'admin');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const data = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      organization: this.registerForm.value.organization,
      role: this.registerForm.value.role
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
      },
    });
  }
}
