import { Component, OnInit } from '@angular/core';import { ActivatedRoute, Router } from '@angular/router';
import { CommercialService } from '../services/commercial.service';
import { Invoice, InvoiceStatus } from '../models/invoice'; // Assurez-vous que ce chemin est correct
import { ConfirmationDialogComponent } from '../super-admin/confirmation-dialog/confirmation-dialog.component'; // Assurez-vous que ce chemin est correct
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  searchQuery: string = '';
  
  // viewMode: 'list' | 'card' = 'list'; // Si vous prévoyez un mode carte plus tard
  isLoading = true;
  errorMessage: string | null = null;

displayedColumns: string[] = [
    'documentNumber',
    'clientName',
    'createdAt',

    'totalAmount',
    'status',
    'actions'
  ];

  constructor(
    private route: ActivatedRoute, // Peut être utilisé pour lire des paramètres de route si nécessaire
    private router: Router,
    private commercialService: CommercialService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.commercialService.getInvoices().subscribe({
      next: (data) => {
        // Assurez-vous que les données correspondent à l'interface Invoice
        // Des transformations peuvent être nécessaires ici si le backend renvoie un format différent
        this.invoices = data as any[];
        console.log('Factures chargées avec succès :', this.invoices);
        this.filteredInvoices = [...this.invoices];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des factures :', err);
        this.errorMessage = `Erreur de chargement des factures. ${err.message || 'Veuillez réessayer.'}`;
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredInvoices = [...this.invoices];
      console.log("this.filteredInvoices", this.filteredInvoices);
    } else {
      this.filteredInvoices = this.invoices.filter(invoice =>
        invoice.documentNumber.toLowerCase().includes(query) ||
        (invoice.clientName && invoice.clientName.toLowerCase().includes(query)) ||
        invoice.status.toLowerCase().includes(query)
        // Vous pouvez ajouter d'autres champs au filtre si nécessaire
      );
    }
  }

  navigateToCreateInvoice(): void {
    this.router.navigate(['/invoices/new']); // Ajustez la route si nécessaire
  }

  viewInvoice(id: string): void {
    // Naviguer vers la page de détails de la facture
    this.router.navigate(['/invoices', id]); // Ajustez la route si nécessaire
    console.log('Voir détails facture ID:', id);
  }

  editInvoice(id: string): void {
    // Naviguer vers la page d'édition de la facture
    this.router.navigate(['/invoices', id, 'edit']); // Ajustez la route si nécessaire
    console.log('Modifier facture ID:', id);
  }

  confirmDelete(invoice: any): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal' // Assurez-vous que cette classe est stylée
    });
    modalRef.componentInstance.message = `Voulez-vous vraiment supprimer la facture N° ${invoice.documentNumber} ?`;

    modalRef.result.then((confirmed) => {
      if (confirmed) {
        this.deleteInvoice(invoice.id);
      }
    }).catch(() => {
      console.log('Suppression annulée par l\'utilisateur.');
    });
  }

  private deleteInvoice(id: string): void {
    this.isLoading = true; // Optionnel: indiquer un chargement pendant la suppression
    this.commercialService.deleteInvoice(id).subscribe({
      next: () => {
        console.log('Facture supprimée avec succès :', id);
        // Recharger la liste ou filtrer la facture supprimée de la liste actuelle
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        this.applyFilter(); // Mettre à jour filteredInvoices
        this.isLoading = false;
        // Afficher un message de succès (par exemple avec un service de notification/snackbar)
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la facture :', err);
        this.errorMessage = `Erreur lors de la suppression de la facture. ${err.message || 'Veuillez réessayer.'}`;
        this.isLoading = false;
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  getStatusClass(status: any | string): string {
    // Gérer le cas où status pourrait être une chaîne si le backend ne respecte pas strictement l'enum
    const statusString = (status as string)?.toLowerCase() || 'default';
    return `status-${statusString}`;
  }
}