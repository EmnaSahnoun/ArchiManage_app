import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../projects/projects.component';
import { ProjectService } from '../../services/ProjectService';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  
  projectId: string = '';
  tasks:any[]=[];
  todo: any[] = [];
  inProgress: any[] = [];
  done: any[] = [];
  phase:any;
  projet:any;
  constructor(private router: Router, private route: ActivatedRoute, 
    private projectService:ProjectService
  ) {}

  ngOnInit(): void {
    this.phase = history.state.phaseData;
    this.projet = history.state.projectData;
    console.log("phase dans task",this.phase)
    this.loadTasks(this.phase.id);
   
  }

  loadTasks(phaseId: string): void {

    this.projectService.getTaskByPhase(phaseId).subscribe({
      next: (task) => {
        this.tasks = task;
        
        // Appliquer le filtre une fois les projets chargés
        console.log("les tasks",this.tasks);
        // Pour chaque projet, récupérer les détails des phases
      
        
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des projets:', err);
        
      }
    });

    
    this.organizeTasks();
  }

  organizeTasks(): void {
    this.todo = this.tasks.filter((task: any) => task.status === 'PENDING');
    this.inProgress = this.tasks.filter((task: any) => task.status === 'IN_PROGRESS');
    this.done = this.tasks.filter((task: any) => task.status === 'COMPLETED');
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
    const taskName = prompt('Entrez le nom de la nouvelle tâche:');
    if (taskName) {
      const newTask = {
        _id: Math.random().toString(36).substring(2, 9),
        name: taskName,
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subTasks: []
      };

      this.todo.push(newTask);
      this.phase.tasks.push(newTask);
    }
  }

  editTask(task: any): void {
    const newName = prompt('Modifier le nom de la tâche:', task.name);
    if (newName && newName !== task.name) {
      task.name = newName;
      // Ici, vous feriez un appel API pour sauvegarder
    }
  }

  deleteTask(task: any, list: string): void {
      if (list === 'todo') {
        this.todo = this.todo.filter(t => t._id !== task._id);
      } else if (list === 'inProgress') {
        this.inProgress = this.inProgress.filter(t => t._id !== task._id);
      } else if (list === 'done') {
        this.done = this.done.filter(t => t._id !== task._id);
      }
      // Supprimer de la liste principale
      this.phase.tasks = this.phase.tasks.filter((t: any) => t._id !== task._id);
      
  }

  
}