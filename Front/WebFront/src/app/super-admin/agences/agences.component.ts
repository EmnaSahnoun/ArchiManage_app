import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgenceFormComponent } from '../agence-form/agence-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgencyDetailsComponent } from '../agency-details/agency-details.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-agences',
  templateUrl: './agences.component.html',
  styleUrl: './agences.component.scss'
})
export class AgencesComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  agencies: any[] = [
    {
      _id: '1',
      name: 'Agence Principale',
      address: '123 Rue Principale, Ville',
      email: 'contact@agence1.com',
      phone: '0123456789',
      createdAt: new Date('2023-01-15')
    },
    {
      _id: '2',
      name: 'Agence Secondaire',
      address: '456 Avenue Centrale, Ville',
      email: 'contact@agence2.com',
      phone: '0987654321',
      createdAt: new Date('2023-03-20')
    },
    {
      _id: '3',
      name: 'Agence Régionale',
      address: '789 Boulevard Régional, Ville',
      email: 'contact@agence3.com',
      phone: '0567891234',
      createdAt: new Date('2023-05-10')
    }
  ];
  filteredAgencies: any[] = [];

  constructor(
    public dialog: MatDialog,
    private modalService: NgbModal,
    private router: Router
  ) { 
    this.currentDate = new Date().toLocaleDateString();
   
  }

  ngOnInit(): void {
    this.filteredAgencies = [...this.agencies];
  }

  filterAgencies(): void {
    if (!this.searchQuery) {
      this.filteredAgencies = [...this.agencies];
      return;
    }
    this.filteredAgencies = this.agencies.filter(agency =>
      agency.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addAgency() {
    const dialogRef = this.dialog.open(AgenceFormComponent, {
      width: '500px',
      data: { isEditMode: false }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.agencies.push({
          ...result,
          _id: Date.now().toString(),
          createdAt: new Date()
        });
      }
    });
  }
  
  
  editAgency(agency: any) {
    const dialogRef = this.dialog.open(AgenceFormComponent, {
      width: '500px',
      data: {
        isEditMode: true,
        agencyData: agency
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.agencies.findIndex(a => a._id === agency._id);
        if (index !== -1) {
          this.agencies[index] = { ...this.agencies[index], ...result };
        }
      }
    });
  }
  
  
  deleteAgency(agency: any, event?: MouseEvent) {
    // Empêche la propagation de l'événement si le paramètre est présent
    if (event) {
      event.stopPropagation();
    }
  
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer l'agence ${agency.name} ?`);
    
    if (confirmation) {
      // Supprime l'agence du tableau principal
      this.agencies = this.agencies.filter(a => a._id !== agency._id);
      
      // Met à jour la liste filtrée
      this.filterAgencies();
      
      // Optionnel : Afficher un message de succès
      console.log(`Agence ${agency.name} supprimée avec succès`);
      // Vous pourriez aussi utiliser un service de notification ici
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
