import { Component, Input, OnInit } from '@angular/core';
import { Invoice, InvoiceStatus } from '../models/invoice';
import { ActivatedRoute, Router } from '@angular/router';
import { CommercialService } from '../services/commercial.service'; 

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {
   invoices: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commercialService: CommercialService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.commercialService.getInvoices().subscribe({
      next: (data) => {
        console.log("les factures",data)
        this.invoices = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        this.errorMessage = 'Failed to load invoices. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  navigateToCreateInvoice(): void {
    this.router.navigate(['/invoices/new']); // Adjust route as needed
  }

  viewInvoice(id: string): void {
    this.router.navigate(['/invoices', id]); // Adjust route as needed
  }

  editInvoice(id: string): void {
    this.router.navigate(['/invoices', id, 'edit']); // Adjust route as needed
  }

  confirmDelete(invoice: Invoice): void {
    // Implement a confirmation dialog (e.g., using MatDialog or a simple confirm)
    const confirmation = confirm(`Are you sure you want to delete invoice ${invoice.documentNumber}?`);
    if (confirmation) {
      this.deleteInvoice(invoice.id);
    }
  }

  deleteInvoice(id: string): void {
    this.commercialService.deleteInvoice(id).subscribe({
      next: () => {
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        // Optionally, show a success message
      },
      error: (err) => {
        console.error('Error deleting invoice:', err);
        this.errorMessage = `Failed to delete invoice. ${err.error?.message || ''}`;
        // Optionally, show an error message to the user
      }
    });
  }

  // Helper for formatting, or use Angular Pipes in the template
  formatDate(timestamp: number): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return 'N/A';
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'TND' }); // Adjust currency as needed
  }

  getStatusClass(status: InvoiceStatus): string {
    return status ? status.toLowerCase() : 'default';
  }
}
