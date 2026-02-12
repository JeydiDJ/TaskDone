import { Component, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements AfterViewInit {
  @Output() finished = new EventEmitter<void>();
  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    // Force video to play in case autoplay is blocked
    const video = this.videoRef.nativeElement;
    video.play().catch(err => {
      console.warn('Video autoplay blocked, fallback to timeout', err);
      // fallback: hide splash after max 3s
      setTimeout(() => this.finishSplash(), 3000);
    });
  }

  onVideoEnd() {
    this.finishSplash();
  }

  onVideoError() {
    console.warn('Video failed to load');
    this.finishSplash();
  }

  private finishSplash() {
    this.finished.emit();
  }
}
