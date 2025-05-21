import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http'; // Assuming you might use HttpClient directly or in a service
import { CommercialService } from '../services/commercial.service';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientFormComponent } from '../client-form/client-form.component';
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
  editedClientData: { address?: string; phone?: string } = {}; // Pour l'édition en ligne (adresse et téléphone uniquement)


  // Simulez votre AuthService et ClientService ici ou injectez-les
  constructor(
     private commercialService: CommercialService,
     private authService: AuthService,
     private router: Router,
     private http: HttpClient ,
     private modalService: NgbModal
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
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        
      }
    });
    
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

  

  addClient(): void {
    const modalRef = this.modalService.open(ClientFormComponent, {
          size: 'mg',
          centered: true,
          backdrop: 'static',
          keyboard: false 
        });
    
        modalRef.result.then(
          (result) => {
             console.log('La modale a été fermée avec succès');
            if (result) {
              console.log('Nouveau client ajouté:', result);
              const idCompany=localStorage.getItem('idAgence');
              if(idCompany){
                this.loadClients(idCompany);
              }
            
              
            } else {
              console.log('La modale a été fermée avec succès mais sans résultat.');
            
            }
          },
          (reason) => {
            console.log(`La modale a été annulée/fermée (${reason})`);
          }
        );
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
  startEdit(client: Client, event: MouseEvent): void {
    event.stopPropagation(); // Empêche goToClientDetails d'être appelé
    this.editingClientId = client.id;
    // Copier uniquement les champs modifiables
    this.editedClientData = {
      address: client.address,
      phone: client.phone
    };
  }

  saveEdit(clientId: string, event: Event): void {
    event.stopPropagation();
    if (!this.editedClientData || this.editingClientId !== clientId) return;

    // Préparez les données à envoyer (uniquement les champs modifiés si nécessaire, ou l'objet entier)
    const updatePayload: Partial<Client> = {
      address: this.editedClientData.address,
      phone: this.editedClientData.phone
    };

    // Assurez-vous que votre CommercialService a une méthode updateClient
    // Exemple: this.commercialService.updateClient(clientId, updatePayload).subscribe({
    //   next: (updatedClientFromServer) => {
    //     const index = this.clients.findIndex(c => c.id === clientId);
    //     if (index !== -1) {
    //       // Mettre à jour avec les données du serveur ou les données locales si le serveur ne renvoie pas tout
    //       this.clients[index] = { ...this.clients[index], ...updatePayload }; // Ou ...updatedClientFromServer
    //       this.applyFilter(); // Rafraîchir la liste filtrée
    //     }
    //     this.cancelEdit(); // Sortir du mode édition
    //     console.log('Client mis à jour avec succès', updatedClientFromServer);
    //   },
    //   error: (err) => {
    //     console.error('Erreur lors de la mise à jour du client', err);
    //     // Peut-être afficher un message d'erreur à l'utilisateur
    //   }
    // });

    // Simulation de la sauvegarde
    console.log('Sauvegarde des modifications pour le client:', clientId, this.editedClientData);
    const index = this.clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        this.clients[index] = { ...this.clients[index], ...this.editedClientData };
        this.applyFilter();
    }
    this.cancelEdit(); // Quitte le mode édition après la simulation
  }

  cancelEdit(event?: Event): void {
    if(event) event.stopPropagation();
    this.editingClientId = null;
    this.editedClientData = {};
  }
}
