import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() titleChange = new EventEmitter<string>();

  changeTitle(title: string): void {
    this.titleChange.emit(title);  // Émettre un événement pour changer le titre
  }
  
  
}
