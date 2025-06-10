import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('closing', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => closing', animate('300ms ease-in')),
    ])
  ]
})
export class NotificationToastComponent implements OnInit {
  @Input() notification: any;
  @Output() closeToast = new EventEmitter<string>(); // Emits toastId

  @HostBinding('@toastAnimation') animationState: 'visible' | 'closing' = 'visible';

  private closeTimer: any;

  constructor() { }

  ngOnInit(): void {
    // Start timer to auto-close, can be overridden by HeaderComponent's main timer
    this.closeTimer = setTimeout(() => this.startClose(), 4700); // Slightly less than HeaderComponent's timer for animation
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  manualClose(): void {
    clearTimeout(this.closeTimer); // Clear auto-close timer
    this.startClose();
  }

  startClose(): void {
    this.animationState = 'closing';
  }

  @HostListener('@toastAnimation.done', ['$event'])
  onAnimationDone(event: any): void {
    if (event.toState === 'closing') {
      this.closeToast.emit(this.notification.toastId);
    }
  }

  onToastClick(): void {
    console.log('Toast clicked:', this.notification);
    // Potentially navigate or perform an action
    // For now, clicking the toast will also close it.
    this.manualClose();
  }

}
