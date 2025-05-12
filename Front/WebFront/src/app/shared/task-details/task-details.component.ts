import { Component, Inject, Input, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Importé pour contrôler le modal Ngb
import { ProjectService } from '../../services/ProjectService';
import { forkJoin } from 'rxjs';
import { ActivityService } from '../../services/activityService';
import { AgenceService } from '../../services/agenceService';
import { CommentResponse, TaskHistory } from '../../models/activity.interfaces';
import { ConfirmationDialogComponent } from '../../super-admin/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
  standalone: false
})
export class TaskDetailsComponent implements OnInit {
  @Input() task: any;
  subtasks: any[] = [];
 isLoadingSubtasks = false;
  newCommentText: string = '';
  isLoadingComments = false;
  isLoadingActivities = false;
// Pour l'édition des commentaires
  editingCommentId: string | null = null;
  editedCommentContent: string = '';
// Pour l'édition des sous-tâches
  editingSubtaskId: string | null = null;
  editedSubtaskData: any = {};
  // Options pour les select des sous-tâches
  taskStatusOptions = ['TODO', 'IN_PROGRESS', 'COMPLETED']; // Adaptez selon vos statuts
  taskPriorityOptions = ['LOW', 'MEDIUM', 'HIGH']; // Adaptez selon vos priorités


  constructor(
    public activeModal: NgbActiveModal,
    public agenceService: AgenceService,
    private activityService:ActivityService,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {
    
  }

  ngOnInit(): void {
    console.log('Task details:', this.task);
    // Initialiser les tableaux pour éviter les erreurs dans le template
    if (!this.task.attachments) {
      this.task.attachments = [];
    }
    if (!this.task.activities) {
      this.task.activities = [];
    }
    

    if (this.task?.id) {
      console.log("bonjour")
      this.loadComments();
      this.loadActivities(); // Charger l'historique (activités)
    } 
    if (this.task?.subTaskIds?.length > 0) {
      this.getSubtasks(this.task.subTaskIds);
    }
    //this.getSampleTask();
    /* if (!this.task.subtasks) {
      this.task.subtasks = [];
    } */
    
    
  }
loadComments(): void {
    this.isLoadingComments = true;
    this.activityService.getCommentsByTaskId(this.task.id).subscribe({
      next: (comments) => {
        this.task.comments = comments;
        this.isLoadingComments = false;
        console.log('Comments loaded:', this.task.comments);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.task.comments = []; // Assurer que c'est un tableau en cas d'erreur
        this.isLoadingComments = false;
      }
    });
  }
  

  // Sample data structure for reference
  getSampleTask() {
    this.task= {
      id: '1',
      name: 'Innovate Ltd. Corporate Website Design',
      description: 'The goal of this project is to design a comprehensive and modern UI kit for Innovate Ltd\'s corporate website...',
      priority: 'HIGH', // Assuming 'HIGH' is a valid TaskPriority
      startDate: new Date('2028-06-01'),
      endDate: new Date('2028-09-30'),
      progress: 85,
      subtasks: [
        { name: 'Develop Initial Wireframes', assignee: 'Eric Green' },
        { name: 'Homepage UI', assignee: 'Brian Adams' },
        { name: 'Design Inner Pages UI', assignee: 'Brian Adams' },
        { name: 'Client Feedback Integration', assignee: 'Eric Green' }
      ],
      attachments: [
        { name: 'Innovate.Ltd_Homepage_UI.fig', description: 'Final homepage UI in Figma' },
        { name: 'Innovate.Ltd_InnerPages.pdf', description: 'Approved layouts for inner pages' },
        { name: 'Innovate.Ltd_Design_Guidelines.pdf', description: 'Design guidelines for the project' }
      ],
      requirements: [
        'Brand Consistency: Ensure the UI elements align with Innovate Ltd\'s branding',
        'Responsive Design: The UI kit must be designed for optimal performance on all devices',
        'User Experience: Focus on creating an intuitive and engaging user experience',
        'Design Variations: Provide multiple design variations for key pages'
      ],
      guidelines: [
        'Adhere to the wireframes and initial design concepts approved by the client',
        'Implement feedback from the client and stakeholders in a timely manner',
        'Ensure all design elements are scalable and adaptable to future updates'
      ],
      activities: [
        { user: 'Eric Green', timestamp: new Date(), content: 'Initial wireframes are completed and ready for review.', hasReply: true },
        { user: 'Brian Adams', timestamp: new Date(), content: 'Homepage UI design has been finalized and uploaded. Awaiting feedback.', hasReply: false },
        { user: 'Eric Green', timestamp: new Date(), content: 'Client feedback has been integrated. Please review the changes.', hasReply: true }
      ],
      comments: [
        { user: 'Alice Wonderland', timestamp: new Date(Date.now() - 86400000), content: 'Great progress on the homepage UI!' },
        { user: 'Bob The Builder', timestamp: new Date(), content: 'Can we get an update on the inner pages?' }
      ] // Added sample comments
    };
  }
  getSubtasks(subTaskIds: string[]): void {
    this.isLoadingSubtasks = true;
    
    // Créer un tableau de requêtes pour toutes les sous-tâches
    const requests = subTaskIds.map(id => 
      this.projectService.getTaskByid(id)
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(requests).subscribe({
      next: (results) => {
        this.subtasks = results.flat(); // Fusionner les résultats
        this.isLoadingSubtasks = false;
        console.log('Subtasks loaded:', this.subtasks);
      },
      error: (err) => {
        console.error('Error loading subtasks:', err);
        this.isLoadingSubtasks = false;
      }
    });
  }
 addComment(): void {
    const currentUserId = localStorage.getItem("user_id");
    const currentUsername = localStorage.getItem("username");
    console.log("currentusername",currentUsername)
    if (this.newCommentText.trim() && this.task?.id) {
        if (!currentUserId || !currentUsername) {
            console.error('User not authenticated');
            return;
        }

        const commentData = {
            taskId: this.task.id,
            idUser: currentUserId,
            username: currentUsername,
            content: this.newCommentText.trim()
        };
        console.log('Adding comment:', commentData);

        this.activityService.addComment(commentData).subscribe({
          next: (backendResponse: CommentResponse) => {
                if (!this.task.comments) {
                    this.task.comments = [];
                }
               const newCommentForUI: CommentResponse = {
                    ...backendResponse, // Contient généralement id, createdAt générés par le backend
                    taskId: this.task.id, // Connu
                    idUser: currentUserId, // Connu
                    username: currentUsername, // Connu et crucial ici
                    content: this.newCommentText.trim() // Connu
                };

                this.task.comments.unshift(newCommentForUI);
                this.newCommentText = '';
                this.loadActivities(); // Recharger les activités pour refléter le nouveau commentaire si nécessaire
                this.loadComments();
            },
            error: (err) => {
                console.error('Error adding comment:', err);
            }
        });
    }
}

loadActivities(): void {
  this.isLoadingActivities = true;
  
  this.activityService.getHistoryByTaskId(this.task.id).subscribe({
    next: (activities) => {
      this.task.activities = activities; // Assigner directement les activités brutes
      this.isLoadingActivities = false;
      console.log('Activities (history) loaded:', this.task.activities);
   
    
    },
    error: (err) => {
      console.error('Error loading activities:', err);
      this.task.activities = [];
      this.isLoadingActivities = false;
    }
  });
}

generateActivityDescription(activity: TaskHistory): string {
  switch(activity.action) {
    case 'COMMENT':
      return `a ajouté un commentaire.`;
    case 'DELETE':
      if (activity.fieldChanged === 'comments') {
        return `a supprimé un commentaire.`;
      }
      else{
      return activity.subTaskId ? `a supprimé la sous-tâche.` : `a supprimé la tâche.`;}
    case 'UPDATE':
      if (activity.fieldChanged === 'comments') {
        return `a modifié un commentaire.`;
      }
      if (activity.fieldChanged && activity.oldValue && activity.newValue) {
        return `a mis à jour le champ "${activity.fieldChanged}" de "${activity.oldValue}" à "${activity.newValue}".`;
    
      }
     if (activity.fieldChanged) {
         return `a mis à jour le champ "${activity.fieldChanged}".`;
      }
      return `a effectué une mise à jour.`;
    case 'CREATE': // Assurez-vous que cette action est envoyée par le backend
        return `a créé la tâche.`;
    default:
       return `a effectué l'action : ${activity.action}.`;
  }
}
 // --- Méthodes pour les actions sur les commentaires ---
  isCurrentUserComment(comment: CommentResponse): boolean {
    const currentUserId = localStorage.getItem("user_id");
    return comment.idUser === currentUserId;
  }

  startEditComment(comment: CommentResponse): void {
    this.editingCommentId = comment.id;
    this.editedCommentContent = comment.content;
  }

  saveEditComment(comment: CommentResponse): void {
    if (!this.editingCommentId || this.editedCommentContent.trim() === '') {
      this.cancelEditComment();
      return;
    }
    const updatedContent = this.editedCommentContent.trim();
  
    const currentUserId = localStorage.getItem("user_id");
    const currentUsername = localStorage.getItem("username");

    if (!this.task?.id || !currentUserId || !currentUsername) {
      console.error('Missing required information for updating comment (taskId, userId, username)');
      alert('Could not update comment. User or task information is missing.');
      this.cancelEditComment();
      return;
    }

    const commentUpdatePayload = {
      taskId: this.task.id,
      idUser: currentUserId,
      username: currentUsername,
      content: updatedContent
    };
    this.activityService.updateComment(this.editingCommentId, commentUpdatePayload).subscribe({
      next: (updatedComment) => {
        // Mettre à jour le commentaire dans la liste this.task.comments
        const index = this.task.comments.findIndex((c: CommentResponse) => c.id === this.editingCommentId);
        if (index > -1) {
          this.task.comments[index] = { ...this.task.comments[index], ...updatedComment, content: updatedContent }; // Assurez-vous que updatedComment contient toutes les infos
        }
        this.cancelEditComment();
        this.loadActivities(); // Recharger l'historique si la modification de commentaire y est tracée
      },
      error: (err) => {
        console.error('Error updating comment:', err);
        // Rollback optimistic update si implémenté
        // comment.content = originalContent;
        alert('Failed to update comment.');
        this.cancelEditComment();
      }
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
  }

  deleteComment(commentId: string): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
                centered: true,
                windowClass: 'confirmation-modal'
            });
        
            modalRef.componentInstance.message = `Voulez-vous vraiment supprimer ce Commentaire  ?`;
            
        
            modalRef.result.then((confirm) => {
                if (confirm) {
                  const currentUserId = localStorage.getItem("user_id");
      const currentUsername = localStorage.getItem("username");
      if (!this.task?.id || !currentUserId||!currentUsername) {
    console.error('Missing required information');
    return;
  }
      this.activityService.deleteComment(commentId, this.task.id, currentUserId).subscribe({
        next: () => {
          this.task.comments = this.task.comments.filter((c: CommentResponse) => c.id !== commentId);
          this.loadActivities(); // Recharger l'historique
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          alert('Failed to delete comment.');
        }
      });
                    
                    
                }
            }).catch(() => {
                console.log('Suppression annulée');
            });  
   
  }

  // --- Méthodes pour la modification des sous-tâches ---
  startEditSubtask(subtask: any): void {
    this.editingSubtaskId = subtask.id;
    this.editedSubtaskData = {
      ...subtask,
      // Assurez-vous que les dates sont au format YYYY-MM-DD pour les inputs de type "date"
      startDate: this.formatDateForInput(subtask.startDate),
      endDate: this.formatDateForInput(subtask.endDate)
    };
    console.log('Editing subtask:', this.editedSubtaskData);
  }

  saveSubtaskEdit(): void {
    if (!this.editingSubtaskId) return;

    // Préparer le payload avec les données formatées pour l'API
    const updatePayload = {
      ...this.editedSubtaskData,
      startDate: this.formatDateForApi(this.editedSubtaskData.startDate),
      endDate: this.formatDateForApi(this.editedSubtaskData.endDate)
    };
    // Supprimer l'id du payload si l'API ne l'attend pas dans le corps de la requête PUT/PATCH
    delete updatePayload.id; 
    // Conserver d'autres champs non modifiables si nécessaire ou les exclure
    // delete updatePayload.subTaskIds; // Exemple si ce champ ne doit pas être envoyé

    this.projectService.updateTask(this.editingSubtaskId, updatePayload).subscribe({
      next: (updatedTask) => {
        const index = this.subtasks.findIndex(st => st.id === this.editingSubtaskId);
        if (index > -1) {
          // Mettre à jour la sous-tâche dans la liste locale avec les données retournées par l'API
          // et s'assurer que les dates sont correctement formatées pour l'affichage si nécessaire
          this.subtasks[index] = { ...this.subtasks[index], ...updatedTask };
        }
        console.log(`Subtask ${this.editingSubtaskId} updated successfully.`, updatedTask);
        this.loadActivities(); // Recharger l'historique si les modifications de sous-tâches y sont tracées
        this.cancelSubtaskEdit();

      },
      error: (err) => {
        console.error(`Error updating subtask ${this.editingSubtaskId}:`, err);
        // Optionnel: Afficher un message d'erreur à l'utilisateur
        alert('Failed to update subtask.');
        // Peut-être ne pas annuler l'édition pour permettre à l'utilisateur de réessayer
      }
    });
  }

  cancelSubtaskEdit(): void {
    this.editingSubtaskId = null;
    this.editedSubtaskData = {};
  }
deleteSubtask(subtaskId: string, subtaskName: string): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal'
    });

    modalRef.componentInstance.message = `Voulez-vous vraiment supprimer la sous-tâche "${subtaskName}" ?`;

    modalRef.result.then((confirm) => {
      if (confirm) {
        // Assurez-vous que votre projectService a une méthode pour supprimer une tâche/sous-tâche
        // et qu'elle gère la mise à jour de l'historique si nécessaire.
        this.projectService.deleteTask(subtaskId).subscribe({ // Ou une méthode deleteSubtask dédiée
          next: () => {
            this.subtasks = this.subtasks.filter(st => st.id !== subtaskId);
            console.log(`Subtask ${subtaskId} deleted successfully.`);
            this.loadActivities(); // Recharger l'historique
            // Optionnel: Afficher une notification de succès
            // this.snackBar.open('Sous-tâche supprimée avec succès!', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            console.error(`Error deleting subtask ${subtaskId}:`, err);
            alert('Failed to delete subtask.');
          }
        });
      }
    }).catch(() => {
      console.log('Subtask deletion cancelled');
    });
  }
  private formatDateForInput(dateSource: string | Date | null): string {
    if (!dateSource) return '';
    try {
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date for input:", dateSource, e);
      return '';
    }
  }


  private formatDateForApi(dateString: string): string | null {
    if (!dateString) return null; // Ou retourner une date par défaut / gérer l'erreur
    return new Date(dateString).toISOString(); // Ou le format attendu par votre API
  }

  closeModal(): void {
    this.activeModal.close();
  }
}
