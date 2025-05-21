import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http'; // Assuming you might use HttpClient directly or in a service
import { CommercialService } from '../services/commercial.service';
import { AuthService } from '../services/auth.service';
// import { ClientService } from './client.service'; // Supposons que vous ayez un service pour les clients
// import { AuthService } from '../auth/auth.service'; // Supposons que vous ayez un service d'authentification

// Définition de l'interface Client (vous pouvez la placer dans un fichier séparé, ex: client.model.ts)
export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  createdAt: number; // Ou Date, selon comment vous le gérez
  idCompany?: string; // Optionnel si non utilisé directement dans le template
  companyName?: string; // Optionnel si non utilisé directement dans le template
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchQuery: string = '';
  viewMode: 'list' | 'card' = 'list'; // Default view mode

  editingClientId: string | null = null;
  editedClientData: Partial<Client> = {}; // Pour l'édition en ligne

  // Simulez votre AuthService et ClientService ici ou injectez-les
  constructor(
     private commercialService: CommercialService,
     private authService: AuthService,
     private router: Router,
     private http: HttpClient 
  ) {}

  ngOnInit(): void {
    const idCompany=localStorage.getItem('idAgence');
    if(idCompany){
      this.loadClients(idCompany);
    }
}



  loadClients(idCompany: string): void {
    this.commercialService.getClients(idCompany).subscribe({
      next: (data) => {
        console.log("les clients",data)
        this.clients=data;
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        
      }
    });
    this.applyFilter();
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.address && client.address.toLowerCase().includes(query)) ||
        (client.phone && client.phone.toLowerCase().includes(query))
      );
    }
  }

  toggleViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  addClient(): void {
    console.log('Ouvrir le formulaire/modal pour ajouter un nouveau client');
    // Exemple: this.router.navigate(['/clients/nouveau']);
    // Ou ouvrir un dialogue modal
  }

  goToClientDetails(client: Client): void {
    // Si l'édition est active sur cette ligne, ne pas naviguer
    if (this.editingClientId === client.id) {
      return;
    }
    console.log('Naviguer vers les détails du client:', client.id);
    // Exemple: this.router.navigate(['/clients', client.id]);
  }


  deleteClient(clientId: string, event: MouseEvent): void {
    event.stopPropagation(); // Empêche le clic de se propager à la ligne (goToClientDetails)

  
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
   
      this.clients = this.clients.filter(c => c.id !== clientId);
      this.applyFilter();
      console.log('Client supprimé (simulation):', clientId);
    }
  }
}
