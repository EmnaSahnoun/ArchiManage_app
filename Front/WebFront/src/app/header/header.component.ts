import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Tableau de bord';
  username: string | null = null;

  showNotifications: boolean = false; // Controls the visibility of the notification dropdown
  // Placeholder for notifications - in a real app, you'd fetch these
  notifications: { id: number, message: string, read: boolean }[] = [
    { id: 1, message: 'You have a new message.', read: false },
    { id: 2, message: 'Your task is due soon.', read: true },
    { id: 3, message: 'A new update is available.', read: false },
  ];
  ngOnInit(): void {
    this.loadUserProfile();
   
    
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
  }
}
