import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgenceFormComponent } from '../agence-form/agence-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgencyDetailsComponent } from '../agency-details/agency-details.component';
import { Router } from '@angular/router';
import { AgenceService } from '../../services/agenceService';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-agences',
  templateUrl: './agences.component.html',
  styleUrl: './agences.component.scss'
})
export class AgencesComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  agencies: any[] = [];
  filteredAgencies: any[] = [];
  errorMessage: string | null = null;
  isLoading!:boolean;
  constructor(
    
    private modalService: NgbModal,
    private router: Router,
    private agenceService:AgenceService,
    private toastr: ToastrService
  ) { 
    this.currentDate = new Date().toLocaleDateString();
   
  }

  ngOnInit(): void {
    this.loadAgencies();
  }
  loadAgencies(): void {
    this.isLoading = true;
    this.agenceService.getAllAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.filteredAgencies = [...this.agencies];
        console.log('Agences chargées:', this.agencies);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        // Affichez un message d'erreur à l'utilisateur
        this.isLoading = false;
      }
    });
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

  addAgency(): void {
    const modalRef = this.modalService.open(AgenceFormComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.isEditMode = false;

    modalRef.result.then((result) => {
      if (result) {
        this.agencies.unshift(result);
        this.filterAgencies();
        this.toastr.success('Nouvelle agence ajoutée');
      }
    }).catch(() => {});
  }

  editAgency(agency: any): void {
    const modalRef = this.modalService.open(AgenceFormComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.agencyData = agency;

    modalRef.result.then((result) => {
      if (result) {
        const index = this.agencies.findIndex(a => a._id === agency._id);
        if (index !== -1) {
          this.agencies[index] = result;
          this.filterAgencies();
          this.toastr.success('Agence mise à jour');
        }
      }
    }).catch(() => {});
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
    const modalRef = this.modalService.open(AgencyDetailsComponent, { 
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.agency = agency;
  }
}
