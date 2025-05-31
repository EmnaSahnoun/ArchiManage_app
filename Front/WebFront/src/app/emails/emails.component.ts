import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/googleAuthSerivce';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, map, Observable, of, Subscription, tap } from 'rxjs';
import { GmailService } from '../services/gmailService';

type ActiveEmailTab = 'received' | 'sent' | 'draft';
@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss'
})
export class EmailsComponent implements OnInit  {
 receivedEmails: any[] = [];
  sentEmails: any[] = [];
  draftEmails: any[] = [];
  activeTab: ActiveEmailTab = 'received';
  isLoading = false;
  error: string | null = null;
  currentUserEmail: string = '';

  constructor(
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private gmailService: GmailService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthAndLoadEmails();
  }

  private checkAuthAndLoadEmails(): void {
    const googleToken = this.googleAuthService.getAccessToken();
    const userProfile = this.authService.getDecodedToken();
    console.log("Profil utilisateur:", userProfile);
    console.log("Token Google:", googleToken);

    this.currentUserEmail = userProfile?.email || '';
    console.log("Email utilisateur:", this.currentUserEmail);

    if (!googleToken) {
      const currentUrl = this.router.url;
      this.googleAuthService.initGoogleAuth(currentUrl);
      return;
    }

    this.loadAllEmails();
  }

   loadAllEmails(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin([
      this.loadReceivedEmails(),
      this.loadSentEmails(),
      this.loadDrafts()
    ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des emails';
        console.error('Erreur:', err);
        if (err.status === 401) {
          this.handleTokenExpired();
        }
      }
    });
  }

 private loadReceivedEmails(): Observable<void> {
    // 1. Récupération du token Google
    const googleToken = this.googleAuthService.getAccessToken();
    
    if (!googleToken) {
      console.warn('Aucun token Google disponible');
      return of(void 0);
    }

    // 2. Récupération du profil utilisateur avec sécurité
    try {
      const userProfileString = localStorage.getItem("user_profile");
      
      if (!userProfileString) {
        console.warn('Aucun profil utilisateur trouvé dans le localStorage');
        return of(void 0);
      }

      const userProfile = JSON.parse(userProfileString);
      this.currentUserEmail = userProfile?.email;

      if (!this.currentUserEmail) {
        console.warn('Aucun email utilisateur dans le profil');
        return of(void 0);
      }

      // 3. Appel du service avec gestion d'erreur complète
    return this.gmailService.getInboxEmails(googleToken, 100, this.currentUserEmail).pipe(
       tap((response: any) => {
    console.log("Réponse complète:", response);
    if (response && response.success && Array.isArray(response.data)) {
          this.receivedEmails = response.data;
          console.log('Emails chargés:', this.receivedEmails.length, this.receivedEmails);
        } else {
          console.warn('Structure de réponse inattendue:', response);
          this.receivedEmails = [];
        }
      }),
      map(() => void 0),
      catchError(err => {
        console.error('Erreur lors du chargement des emails:', err);
        this.receivedEmails = [];
        return of(void 0);
      })
    );
  } catch (error) {
    console.error('Erreur lors de la lecture du profil:', error);
    return of(void 0);
  }
  }

  private loadSentEmails(): Observable<void> {
    const token = this.googleAuthService.getAccessToken();
    if (!token) return of(void 0);

    return this.gmailService.getSentEmails(token, this.currentUserEmail).pipe(
      tap(response => {
        console.log("emails dans sent",response)
        if (response && response.success && Array.isArray(response.data)) {
          this.sentEmails = response.data;
          console.log('Emails chargés:', this.sentEmails.length, this.sentEmails);
        } else {
          console.warn('Structure de réponse inattendue:', response);
          this.sentEmails = [];
        }
      }),
      map(() => void 0),
      catchError(err => {
        console.error('Erreur chargement emails envoyés:', err);
        return of(void 0);
      })
    );
  }

  private loadDrafts(): Observable<void> {
    const token = this.googleAuthService.getAccessToken();
    if (!token) return of(void 0);

    return this.gmailService.getDrafts(token, this.currentUserEmail).pipe(
      tap(response => {
       
        console.log("la reponse",response)
        if (response && response.success && Array.isArray(response.data)) {
          this.draftEmails = response.data;
          console.log('Brouillons chargés:', this.draftEmails.length, this.draftEmails);
        } else {
          console.warn('Structure de réponse inattendue:', response);
          this.draftEmails = [];
        }
      }),
      map(() => void 0),
      catchError(err => {
        console.error('Erreur chargement brouillons:', err);
        return of(void 0);
      })
    );
  }

  
extractEmailAddress(fullString: string): string {
  if (!fullString) return '';
  
  // Cherche le pattern <email@domain.com>
  const matches = fullString.match(/<([^>]+)>/);
  
  // Si trouvé, retourne l'email, sinon retourne la string complète
  return matches ? matches[1] : fullString;
}


  private handleTokenExpired(): void {
    const refreshToken = this.googleAuthService.getRefreshToken();
    
    if (refreshToken) {
      this.googleAuthService.refreshToken()
        .then(() => this.loadAllEmails())
        .catch(() => this.router.navigate(['/login']));
    } else {
      this.googleAuthService.initGoogleAuth(this.router.url);
    }
  }

  setActiveTab(tab: ActiveEmailTab): void {
    this.activeTab = tab;
  }

  selectEmail(email: any, tab: ActiveEmailTab): void {
    if (tab === 'received' && !email.isRead) {
      this.markAsRead(email.id);
    }
    // Implémenter la vue détaillée ici
    console.log('Email sélectionné:', email);
  }

  private markAsRead(emailId: string): void {
    const token = this.googleAuthService.getAccessToken();
    if (!token) return;

    this.gmailService.markAsRead(token, emailId, this.currentUserEmail).subscribe({
      next: () => {
        const email = this.receivedEmails.find(e => e.id === emailId);
        if (email) {
          email.isRead = true;
        }
      },
      error: (err) => console.error('Erreur marquage comme lu:', err)
    });
  }

  onDeleteEmail(emailId: string, tab: ActiveEmailTab): void {
    const token = this.googleAuthService.getAccessToken();
    const userProfileString = localStorage.getItem("user_profile");
      
      if (!userProfileString) {
        console.warn('Aucun profil utilisateur trouvé dans le localStorage');
        return ;
      }

      const userProfile = JSON.parse(userProfileString);
      this.currentUserEmail = userProfile?.email;

      if (!this.currentUserEmail) {
        console.warn('Aucun email utilisateur dans le profil');
        return ;
      }

    if (!token) return;

    this.gmailService.deleteEmail(token, emailId, this.currentUserEmail).subscribe({
      next: () => {
        if (tab === 'received') {
          this.receivedEmails = this.receivedEmails.filter(e => e.id !== emailId);
        } else if (tab === 'sent') {
          this.sentEmails = this.sentEmails.filter(e => e.id !== emailId);
        } else if (tab === 'draft') {
          this.draftEmails = this.draftEmails.filter(e => e.id !== emailId);
        }
      },
      error: (err) => console.error('Erreur suppression:', err)
    });
  }
}