import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../projects/projects.component';
import { ProjectService } from '../../services/ProjectService';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmationDialogComponent } from '../../super-admin/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  
  projectId: string = '';
  tasks:any[]=[];
  subtasks:any[]=[];
  todo: any[] = [];
  inProgress: any[] = [];
  done: any[] = [];
  phase:any;
  projet:any;
  constructor(private router: Router, private route: ActivatedRoute, 
    private projectService:ProjectService,
     public dialog: MatDialog ,
     private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.phase = history.state.phaseData;
    this.projet = history.state.projectData;
    console.log("phase dans task",this.phase)
     // Assurez-vous que this.phase et this.phase.id existent avant de charger
     if (this.phase?.id) {
      this.loadTasks();
    }
   
  }

  loadTasks(): void {
    this.phase = history.state.phaseData;
    this.projectService.getTaskByPhase(this.phase.id).subscribe({
      next: (task) => {
        this.tasks = task;
        this.tasks=task.filter((task: any) => task.parentTaskId=== null);

        // Appliquer le filtre une fois les projets chargés
        console.log("les tasks",this.tasks);
        // Pour chaque projet, récupérer les détails des phases
      this.organizeTasks(this.tasks);        
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des projets:', err);      
      }
    });

  }

  organizeTasks(tasks:any): void {
    console.log("les tasks ",tasks)
    this.todo = tasks.filter((task: any) => task.status === 'TODO');
    this.inProgress = tasks.filter((task: any) => task.status === 'IN_PROGRESS');
    this.done = tasks.filter((task: any) => task.status === 'COMPLETED');
    console.log("les tasks to do",this.todo)
    console.log("les tasks in progress",this.inProgress)
    console.log("les tasks done",this.done)
  }
  switchPhase(newPhase: any) {
    if (newPhase._id !== this.phase?._id) {
      this.router.navigate(['phase', newPhase._id], {
        relativeTo: this.route,
        state: { phase: newPhase }
      });
    }
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Mettre à jour le statut des tâches
      this.updateTaskStatus(event);
    }
  }

  updateTaskStatus(event: CdkDragDrop<any[]>): void {
    const task = event.container.data[event.currentIndex];
    
    // Déterminer le nouveau statut
    if (event.container.id === 'todo-list') {
      task.status = 'PENDING';
    } else if (event.container.id === 'inProgress-list') {
      task.status = 'IN_PROGRESS';
    } else if (event.container.id === 'done-list') {
      task.status = 'COMPLETED';
    }
    
    // Ici, normalement vous feriez un appel API pour sauvegarder le changement
    console.log('Task status updated:', task);
  }

 
  addTask(): void {
    
    if (!this.phase?.id) {
      console.error("Impossible d'ajouter une tâche sans ID de phase.");
      // Afficher une notification à l'utilisateur si nécessaire
      return;
    }
    const modalRef = this.modalService.open(TaskFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    // Passer l'ID de la phase au composant modal
    modalRef.componentInstance.phaseId = this.phase.id;

    // Gérer le résultat de la fermeture du modal
    modalRef.result.then(
      (newTask) => {
        // Succès : la tâche a été créée et renvoyée
        console.log('Nouvelle tâche ajoutée:', newTask);
        // Recharger les tâches pour afficher la nouvelle ou l'ajouter manuellement à la bonne liste
        this.loadTasks();
      },
      (reason) => {
        // Échec ou annulation
        console.log(`Modal fermé: ${reason}`);
      }
    );
  }

  editTask(task: any): void {
    const newName = prompt('Modifier le nom de la tâche:', task.name);
    if (newName && newName !== task.name) {
      task.name = newName;
      // Ici, vous feriez un appel API pour sauvegarder
    }
  }

  deleteTask(task: any): void {
      
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
            centered: true,
            windowClass: 'confirmation-modal'
        });
    
        modalRef.componentInstance.message = `Voulez-vous vraiment supprimer cette tache ${task.name}  ?`;
        modalRef.componentInstance.username = task.name; // Pass username for confirmation if needed
    
        modalRef.result.then((confirm) => {
            if (confirm) {
              this.projectService.deleteTask(task.id).subscribe({
                next: () => {
                    
                    this.loadTasks(); 
                    
                    
                },
                error: (err) => {
                   
                    console.error('Erreur lors de la suppression:', err);
                   
                }
            });
                
                
            }
        }).catch(() => {
            console.log('Suppression annulée');
        });  
  }

  openTaskDetails(task: any): void {
    // Ouvre le modal en utilisant le service NgbModal
    const modalRef = this.modalService.open(TaskDetailsComponent, {
      size: 'lg',           // Grande taille
      centered: true,        // Centré verticalement
      backdrop: 'static',    // Ne se ferme pas en cliquant à l'extérieur
      keyboard: false        // Ne se ferme pas avec la touche Echap
    });

    // !!! IMPORTANT : Passer les données de la tâche au composant modal !!!
    // NgbModal utilise componentInstance pour passer des données
    modalRef.componentInstance.task = task;
   
  }
  
}