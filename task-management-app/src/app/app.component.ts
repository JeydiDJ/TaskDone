import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SplashComponent } from './core/splash/splash.component';
import { Meta } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NavbarComponent, SplashComponent, NgIf],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'task-management-app';
  private authService = inject(AuthService);
  meta = inject(Meta);

  showSplash = true;

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'An Angular task management app' },
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'author', content: 'Group10' },
      { name: 'keywords', content: 'task management, angular, nodejs, express, mongodb, task done' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Task Management App' },
      { property: 'og:description', content: 'A simple task management app built using Angular, Node.js, Express, and MongoDB.' },
      { property: 'og:image', content: 'https://task-done-g10.vercel.app/' },
      { property: 'og:url', content: 'https://task-done-g10.vercel.app/' },
    ]);
  }

  ngOnInit() {
    this.authService.autoLogin();

    // Only show splash once per session
    const splashPlayed = sessionStorage.getItem('splashPlayed');
    if (splashPlayed === 'true') {
      this.showSplash = false;
    } else {
      // hide splash after max 3s if video fails or autoplay blocked
      setTimeout(() => this.hideSplash(), 3000);
    }
  }

  hideSplash() {
    if (!this.showSplash) return;
    console.log('Splash finished');
    this.showSplash = false;
    sessionStorage.setItem('splashPlayed', 'true');
  }
}
