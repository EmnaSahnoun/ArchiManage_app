import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {  Subscription } from 'rxjs';
import { NotificationService } from '../services/notificationService';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Tableau de bord';
  username: string | null = null;
  showNotifications: boolean = false;
  notifications: any[] = [];
   unreadCount: number = 0;
  private userId !:string; 
  private subscriptions = new Subscription();
  activeToasts: any[] = [];
  isSuperAdmin:boolean=false;
  private toastCounter = 0; //
   constructor(
    private notificationService: NotificationService,
    private router: Router ,
    private authService:AuthService
  ) {}
  ngOnInit(): void {
    const id=localStorage.getItem("user_id");
    if (id){
      this.userId=id;
    }
    this.isSuperAdmin=this.authService.isSuperAdmin();
  this.loadUserProfile();
    this.loadNotificationHistory();
    this.setupRealTimeNotifications();
    this.loadUnreadCount();
  }
  loadUserProfile():void{
    const userProfileString = localStorage.getItem("user_profile");

    if (userProfileString) {
      
        const userProfile = JSON.parse(userProfileString);
        this.username = userProfile?.preferred_username || null;
        if(this.username){
        localStorage.setItem("username",this.username);}
       
    } else {
      console.warn("User profile not found in localStorage.");
      this.username = null; 
    }
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) { // Only mark as read if opening and there are unread
      this.markAllVisibleAsRead();
    }
  }

  private loadNotificationHistory(): void {
    this.subscriptions.add(
      this.notificationService.getNotificationHistory(this.userId)
        .subscribe({
          next: notifications => {
              this.notifications = notifications.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
            console.log("les notifications", this.notifications);
        
            this.updateUnreadCount();
          },
          error: err => console.error('Failed to load notifications:', err)
        })
    );
  }

  private loadUnreadCount(): void {
    this.subscriptions.add(
      this.notificationService.getUnreadCount(this.userId)
        .subscribe(count => this.unreadCount = count)
    );
  }

  private setupRealTimeNotifications(): void {
    this.subscriptions.add(
      this.notificationService.connect(this.userId)
        .subscribe({
          next: notification => {
            this.notifications = [notification, ...this.notifications].sort((a, b) => b.timestamp - a.timestamp);

            this.playNotificationSound();
            this.updateUnreadCount();
            this.addToastNotification(notification);
          },
          error: err => console.error('Notification error:', err)
        })
    );
  }
addToastNotification(notification: any): void {
    const toastId = `toast-${this.toastCounter++}`;
    const toast = { ...notification, toastId: toastId };
    this.activeToasts.push(toast);

    // Auto-remove toast from array after a delay (e.g., 5 seconds)
    // The toast component's animation will handle visual disappearance.
    setTimeout(() => {
      this.removeToastFromArray(toastId);
    }, 5000); // Should be slightly longer than or equal to toast animation + display time
  }

  removeToastFromArray(toastId: string): void {
  this.activeToasts = this.activeToasts.filter(t => t.toastId !== toastId);
}

  private markAllVisibleAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;
    unreadNotifications.forEach(notification => {
      if (!notification.read && !notification.markingAsRead) {
        notification.markingAsRead = true; // Temporary flag to prevent multiple calls
        this.subscriptions.add(
          this.notificationService.markAsRead(this.userId, notification.id)
            .subscribe({
              next: () => {
                notification.read = true;
                delete notification.markingAsRead;
                this.updateUnreadCount();
              },
              error: err => {
                console.error('Failed to mark as read:', err);
                delete notification.markingAsRead;
              }
            })
        );
      }

    });
  }
onNotificationClick(notification: any): void {
    if (!notification.read) {
      this.markNotificationAsRead(notification);
    }
   const projectId = notification.notification?.projectId;
    const phaseId = notification.notification?.phaseId;
    const taskId = notification.notification?.taskId;

    if (projectId && phaseId && taskId) {
      this.router.navigate(['/project', projectId, 'phase', phaseId, taskId]);
      this.showNotifications = false; // Optionally close the dropdown after navigation
    } else {
      console.warn('Notification data is missing IDs for navigation. Notification:', notification.notification);
    }
  }

  private markNotificationAsRead(notification: any): void {
    if (notification.read || notification.markingAsRead) return;

    notification.markingAsRead = true;
    this.subscriptions.add(
      this.notificationService.markAsRead(this.userId, notification.id)
        .subscribe({
          next: () => {
            notification.read = true;
            delete notification.markingAsRead;
            this.updateUnreadCount();
          },
          error: err => {
            console.error('Failed to mark notification as read:', err);
            delete notification.markingAsRead;
          }
        })
    );
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  private playNotificationSound(): void {
    const audio = new Audio('assets/sounds/notification.mp3');
    audio.play().catch(e => console.error('Audio play failed:', e));
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'Invalid date';
    const date = new Date(timestamp);
    // More user-friendly format
    return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  clearNotifications(): void {
    this.notifications = [];
    this.unreadCount = 0;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.notificationService.disconnect();
  }
  trackToastById(index: number, toast: any): string {
    return toast.toastId;
  }

}
