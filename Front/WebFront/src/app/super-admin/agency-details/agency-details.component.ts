import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserFormComponent } from '../user-form/user-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agency-details',
  templateUrl: './agency-details.component.html',
  styleUrl: './agency-details.component.scss'
})
export class AgencyDetailsComponent implements OnInit {
  agency: any;
  users: any[] = [];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private router: Router,
    private dialogRef: MatDialogRef<AgencyDetailsComponent>
  ) {
    this.agency = data.agency;
    // Simuler des données utilisateur (en pratique, vous feriez une requête API)
    this.users = [
      { id: 1, name: 'User 1', email: 'user1@example.com', role: 'Admin', agencyId: this.agency._id },
      { id: 2, name: 'User 2', email: 'user2@example.com', role: 'Agent', agencyId: this.agency._id }
    ];
  }

  ngOnInit(): void {}
  viewProjects() {
    this.dialogRef.close(); // Ferme la modal si vous êtes en mode dialog
    this.router.navigate(['/super-admin/projects'], { 
      queryParams: { agencyId: this.agency._id } 
    });
  }
  addUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: { agencyId: this.agency._id }
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result) {
        this.users.push({
          ...result,
          id: Date.now(),
          agencyId: this.agency._id
        });
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }
  showAgencyDetails(agency: any) {
    this.dialog.open(AgencyDetailsComponent, {
      width: '800px',
      data: { agency: agency },
      panelClass: 'agency-details-dialog'
    });
  }
}
