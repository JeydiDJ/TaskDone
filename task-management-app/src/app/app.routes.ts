import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  {
    path: 'verify-email/:token',
    loadComponent: () =>
      import('./verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },

  
  {
    path: 'tasks',
    loadComponent: () =>
      import('./components/tasks/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./components/tasks/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./components/tasks/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () =>
      import('./components/tasks/task-edit/task-edit.component').then(
        (m) => m.TaskEditComponent
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./components/progress/progress.component').then(m => m.ProgressComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
