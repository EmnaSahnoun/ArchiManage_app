import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isUser:boolean=false;
  isAdmin:boolean=false;

  isSuperAdmin:boolean=false;
  constructor(private authService:AuthService,
    private router:Router
  ){}
  @Output() titleChange = new EventEmitter<string>();
ngOnInit(): void {
  this.isUser=this.authService.isUser();
  this.isSuperAdmin=this.authService.isSuperAdmin();
  this.isAdmin=this.authService.isAdmin();
}
  changeTitle(title: string): void {
    this.titleChange.emit(title);  // Émettre un événement pour changer le titre
  }
  
  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
