import {
  Component,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';

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
    const video = this.videoRef.nativeElement;

    //force muted via JS 
    video.muted = true;

    video.load();

    video.play()
      .then(() => {
        console.log('Video playing');
      })
      .catch((err) => {
        console.warn('Autoplay blocked:', err);

        // manually start after short delay
        setTimeout(() => {
          video.play().catch(() => {
            // final fallback
            setTimeout(() => this.finishSplash(), 3000);
          });
        }, 200);
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
