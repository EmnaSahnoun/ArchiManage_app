import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../services/notificationService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Tableau de bord';
  username: string | null = null;
  showNotifications: boolean = false;
  notifications: any[] = [];
  private userId !:string; // À remplacer par l'ID réel
  private subscriptions = new Subscription();
   constructor(private notificationService: NotificationService) {}
  ngOnInit(): void {
    const id=localStorage.getItem("user_id");
    if (id){
      this.userId=id;
    }

    this.loadUserProfile();   
     this.loadPendingNotifications();
    this.setupRealTimeNotifications();
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
    if (this.showNotifications && this.notifications.length > 0) {
      // Marquer les notifications comme lues si nécessaire
    }
  }
private loadPendingNotifications(): void {
    this.subscriptions.add(
      this.notificationService.getPendingNotifications(this.userId)
        .subscribe(notifications => {
          this.notifications = notifications;
          console.log("les notifications",this.notifications)
        })
    );
  }

  private setupRealTimeNotifications(): void {
    this.subscriptions.add(
      this.notificationService.connect(this.userId)
        .subscribe(notification => {
          this.notifications.unshift(notification); // Ajoute en tête de liste
          // Optionnel: Jouer un son ou afficher un toast
          this.playNotificationSound();
        })
    );
  }

  private playNotificationSound(): void {
    const audio = new Audio('assets/sounds/notification.mp3');
    audio.play().catch(e => console.error('Audio play failed:', e));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
