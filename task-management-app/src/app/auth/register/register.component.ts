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
import { NgClass, CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, CommonModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = signal<string>('');
  successMessage = signal<string>(''); // NEW: store success message
  showPassword = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
  this.registerForm = this.fb.group(
    {
      email: new FormControl('', [Validators.required, Validators.email]),

      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),

      confirmPassword: new FormControl('', [
        Validators.required,
      ]),
    },
    { validators: this.passwordMatchValidator }
  );
}


  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }

  return null;
}

  onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const data = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(data).subscribe({
      next: (res: any) => {
        // Instead of navigating, show success message
        this.successMessage.set(
          'Registration successful! Please check your email to verify your account.'
        );
        this.error.set('');
        this.registerForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
        this.successMessage.set('');
      },
    });
  }
}
