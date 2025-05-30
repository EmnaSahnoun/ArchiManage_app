import { Component, OnInit } from '@angular/core';
interface Email {
  id: number;
  from?: string;
  to?: string;
  subject: string;
  bodySnippet: string;
  date: Date;
  read?: boolean; // Pour les emails reçus
}
type ActiveEmailTab = 'received' | 'sent' | 'draft';
@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss'
})
export class EmailsComponent implements OnInit { // Nom de classe mis à jour
  receivedEmails: Email[] = [];
  sentEmails: Email[] = [];
  draftEmails: Email[] = [];

  activeTab: ActiveEmailTab = 'received'; // Onglet actif par défaut

  constructor() { }

  ngOnInit(): void {
    this.loadMockEmails();
  }

  loadMockEmails(): void {
    this.receivedEmails = [
      { id: 1, from: 'alice@example.com', subject: 'Invitation à la réunion de projet', bodySnippet: 'Bonjour, vous êtes cordialement invité à notre réunion...', date: new Date(Date.now() - 86400000), read: false },
      { id: 2, from: 'newsletter@info.com', subject: 'Votre résumé hebdomadaire ArchiManage', bodySnippet: 'Découvrez les dernières fonctionnalités et actualités...', date: new Date(Date.now() - 172800000), read: true },
      { id: 3, from: 'bob-construct@example.com', subject: 'Question concernant le plan B-102', bodySnippet: 'J\'aurais une question sur les spécifications du plan...', date: new Date(Date.now() - 259200000), read: false },
    ];

    this.sentEmails = [
      { id: 4, to: 'client.final@example.com', subject: 'RE: Validation des plans finaux', bodySnippet: 'Merci pour votre retour. Les modifications ont été apportées.', date: new Date(Date.now() - 345600000) },
      { id: 5, to: 'team@archimanage.com', subject: 'Compte rendu de la réunion client du 15/03', bodySnippet: 'Ci-joint le compte rendu de notre dernière réunion...', date: new Date(Date.now() - 432000000) },
    ];

    this.draftEmails = [
      { id: 6, to: 'fournisseur-materiaux@example.com', subject: 'Demande de devis pour projet Alpha', bodySnippet: 'Bonjour, pourriez-vous nous fournir un devis pour les matériaux listés...', date: new Date() },
    ];
  }

  setActiveTab(tab: ActiveEmailTab): void {
    this.activeTab = tab;
    console.log('Onglet changé vers:', this.activeTab);
    // Vous pouvez charger des données spécifiques à l'onglet ici si nécessaire
  }

  selectEmail(email: Email, tabName: ActiveEmailTab): void {
    console.log(`Email sélectionné depuis l'onglet ${tabName}:`, email);
    // Ici, vous pourriez implémenter la logique pour afficher l'email complet,
    // par exemple dans un modal ou une vue de détail.
    if (tabName === 'received' && email.read === false) {
      email.read = true; // Marquer comme lu
    }
  }
}
