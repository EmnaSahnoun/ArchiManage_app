import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommercialService } from '../services/commercial.service';
import { AgenceService } from '../services/agenceService';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  constructor(private router: Router,
    private commercialService: CommercialService,
    private agenceService:AgenceService
  ) { }

 invoice = {
    number: 1,
    documentType: 'INVOICE',
    selectedClientId: null as string | null,
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    shippingAddress: '',
    date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
  
    paymentTerms: '',
    dueDate: '',
    purchaseOrder: '',
    items: [
            { description: 'Exemple d\'article', quantity: 1, unitPrice: 50 }
 


    ],
    notes: '',
    terms: '',
    taxRate: 20,
    discount: 0,
    shipping: 0,
    paid: 0
  };
  documentTypes: string[] = ['INVOICE', 'QUOTE', 'FeeNote'];


clients: any[] = [];
company:any={};
  subtotal = 0;
  total = 0;
  balance = 0;

  addItem() {
      this.invoice.items.push({ description: '', quantity: 1, unitPrice: 0 });
  
    this.calculateTotals();
    }
  removeItem(index: number) {
    if (this.invoice.items.length > 1) {
      this.invoice.items.splice(index, 1);
      this.calculateTotals();
    } else {
      // Optionnel: Afficher un message à l'utilisateur
      console.warn("Vous ne pouvez pas supprimer la dernière ligne. Au moins une ligne est requise.");
      // Vous pourriez utiliser un service de notification pour une meilleure expérience utilisateur.
    }
  }

  calculateTotals() {
    this.subtotal = this.invoice.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);

    }, 0);

    const taxRate = Number(this.invoice.taxRate) || 0;
    const discount = Number(this.invoice.discount) || 0;
    const shipping = Number(this.invoice.shipping) || 0;
    const paid = Number(this.invoice.paid) || 0;

    const taxAmount = this.subtotal * (taxRate / 100);
    this.total = this.subtotal + taxAmount - discount + shipping;
    this.balance = this.total - paid;
  }

  ngOnInit(): void {
    this.calculateTotals(); 
    this.getClients();
    this.getCompany();
  }
getDocumentTitle(): string {
  switch (this.invoice.documentType) {
    case 'INVOICE': return 'FACTURE';
    case 'QUOTE': return 'DEVIS';
    case 'FeeNote': return 'NOTE D\'HONORAIRES'; 
    default: return this.invoice.documentType || 'DOCUMENT';
  }
}
  onClientSelected(): void {
    if (this.invoice.selectedClientId !== null) {
       const client = this.clients.find(c => c.id === this.invoice.selectedClientId);
    
      if (client) {
        this.invoice.clientName = client.name;
        this.invoice.clientAddress = client.address;
        this.invoice.clientPhone = client.phone;
        this.invoice.clientEmail = client.email;
        this.invoice.shippingAddress = client.address; // Pré-remplir l'adresse de livraison
      }
    } else {
      // Réinitialiser les champs si aucun client n'est sélectionné
      this.invoice.clientName = '';
      this.invoice.clientAddress = '';
      this.invoice.clientPhone = '';
      this.invoice.clientEmail = '';
      this.invoice.shippingAddress = '';
    }
}
getClients(){
  const idCompany=localStorage.getItem('idAgence');

  if (idCompany){
      this.commercialService.getClients(idCompany).subscribe({
        next: (data) => {
          this.clients  = data;
          console.log("les clients",this.clients);
     
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
}
getCompany(){
  const CompanyName=localStorage.getItem('AgencyName');

  if (CompanyName){
      
       this.agenceService.getAgenceByName(CompanyName).subscribe({
        next: (data) => {
          this.company  = data;
          console.log("company",this.company);
     
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
  }
}
saveInvoice() {
  const companyIdForPayload = this.company.id;

  if (!companyIdForPayload) {
    console.error('Erreur: ID de la compagnie (agence) manquant.');
    
    return;
  }
  if (!this.invoice.selectedClientId) {
    console.error('Erreur: Veuillez sélectionner un client.');
    
    return;
  }

  const payload = {
    companyId: companyIdForPayload,
    clientId: this.invoice.selectedClientId,
    documentType: this.invoice.documentType,
    discount: Number(this.invoice.discount) || 0,
    notes: this.invoice.notes,
    lines: this.invoice.items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0
    }))
  };

  console.log('Payload à envoyer au backend:', payload);
this.commercialService.createInvoice(payload).subscribe({
          next: (backendResponse) => {
               console.log("invocie created")
            },
            error: (err) => {
                console.error('Error adding comment:', err);
            }
        });

 
}
}