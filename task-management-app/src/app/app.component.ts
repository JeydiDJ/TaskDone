import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { Meta } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'task-management-app';

  private authService = inject(AuthService);
  meta = inject(Meta);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'An Angular task management app' },
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { rel: 'icon', type: 'image/x-icon', href: '' },
      {
        rel: 'canonical',
        href: 'https://task-done-g10.vercel.app/',
      },
      { property: 'og:title', content: 'Task Management App' },
      { name: 'author', content: 'Group10' },
      { name: 'keywords', content: 'task management, task management angular nodejs. express mongodb, task done' },
      { name: 'robots', content: 'index, follow' },
      {
        property: 'og:description',
        content:
          'A simple task management app built using Angular, Node.js, Express, and MongoDB.',
      },
      {
        property: 'og:image',
        content: 'https://task-done-g10.vercel.app/',
      },
      {
        property: 'og:url',
        content: 'https://task-done-g10.vercel.app/',
      },
    ]);
  }

  ngOnInit() {
    this.authService.autoLogin();
  }
}
