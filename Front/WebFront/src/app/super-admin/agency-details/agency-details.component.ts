import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserFormComponent } from '../user-form/user-form.component';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/UserService';
import { mergeMap, map, catchError, toArray, timeout } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-agency-details',
  templateUrl: './agency-details.component.html',
  styleUrl: './agency-details.component.scss'
})
export class AgencyDetailsComponent implements OnInit {
  @Input() agency: any; 
  users: any[] = [];
 
  constructor(
    public activeModal: NgbActiveModal, // Injectez NgbActiveModal
    private modalService: NgbModal, 
    private router: Router,
    private userService:UserService
    
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }
  
  viewProjects() {
    this.activeModal.close();
    this.router.navigate(['/super-admin/projects'], { 
      queryParams: { agencyId: this.agency._id } 
    });
  }
  addUser() {
    const modalRef = this.modalService.open(UserFormComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.agencyId = this.agency._id;

    modalRef.result.then((result) => {
      if (result) {
        this.users.push({
          ...result,
          id: Date.now(),
          agencyId: this.agency._id
        });
      }
    }, () => {
      // Gestion de l'annulation
    });
  }


  deleteUser(user:any) {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal'
    });    
    // Passez les données à la modal
    modalRef.componentInstance.username = user.username;
  
    modalRef.result.then((result) => {
      if (result) {
        // Si l'utilisateur confirme
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            console.log('Utilisateur supprimé avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
          }
        });
      }
    }, () => {
      // Si l'utilisateur annule
      console.log('Suppression annulée');
    });
  }
  closeModal(): void {
    this.activeModal.dismiss('Cross click');
  }
  loadUsers(): void {
    const ROLE_HIERARCHY = ['SUPER-ADMIN', 'ADMIN', 'USER'];
    this.userService.getUsers().pipe(   
      mergeMap(users => from(users)),
      mergeMap(user => {
        return this.userService.getUserRoles(user.id).pipe(
          map(roles => {
            // Trouve le rôle le plus élevé selon la hiérarchie
            const userRoles = roles.map(r => r.name);
            const highestRole = ROLE_HIERARCHY.find(role => 
              userRoles.includes(role)
            ) || 'Aucun rôle';
  
            return {
              ...user,
              role: highestRole
            };
          }),
          catchError(() => of({
            ...user,
            role: 'Erreur chargement rôles'
          })),
          timeout(5000)
        );
      }, 5), 
      toArray()
    ).subscribe({
      next: (usersWithRoles) => {
        this.users = usersWithRoles;
        console.log("Users avec rôles:", this.users);
      },
      error: (err) => console.error('Failed to load users with roles', err)
    });
  }
}
