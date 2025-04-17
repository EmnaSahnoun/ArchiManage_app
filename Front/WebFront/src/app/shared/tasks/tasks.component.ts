import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  @Input()phase: any;
  projectId: string = '';
  
  todo: any[] = [];
  inProgress: any[] = [];
  done: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      const phaseId = params['phaseId'];
      this.loadPhase(phaseId);
    });
  }

  loadPhase(phaseId: string): void {
    const mockPhases = [
      {
        _id: "67c85299bae88e131703dd8e",
        name: "Étude de Faisabilité",
        description: "Analyse des contraintes techniques et réglementaires.",
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-02-10T00:00:00.000Z",
        tasks: [
          {
            _id: "67c8556dbae88e131703dda4",
            name: "Analyse des contraintes techniques",
            description: "Étudier les contraintes techniques du projet.",
            status: "PENDING",
            priority: "HIGH",
            startDate: "2025-01-10T00:00:00.000Z",
            endDate: "2025-01-30T00:00:00.000Z",
            subTasks: [
              {
                _id: "67d03bc0497c0e90359d6cb7",
                name: "Identifier les matériaux de construction",
                description: "Rechercher et lister les matériaux adaptés aux contraintes techniques.",
                status: "PENDING",
                priority: "MEDIUM"
              }
            ]
          },
          {
            _id: "67c8556dbae88e131703dda5",
            name: "Analyse des contraintes réglementaires",
            description: "Vérifier les normes et réglementations applicables.",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            startDate: "2025-01-15T00:00:00.000Z",
            endDate: "2025-02-05T00:00:00.000Z",
            subTasks: []
          }
        ]
      },
      {
        _id: "67c852e7bae88e131703dd92",
        name: "Conception Détaillée",
        description: "Élaboration des plans détaillés.",
        startDate: "2025-02-15T00:00:00.000Z",
        endDate: "2025-03-20T00:00:00.000Z",
        tasks: []
      }
    ];

    this.phase = mockPhases.find(p => p._id === phaseId);
    this.organizeTasks();
  }

  organizeTasks(): void {
    this.todo = this.phase.tasks.filter((task: any) => task.status === 'PENDING');
    this.inProgress = this.phase.tasks.filter((task: any) => task.status === 'IN_PROGRESS');
    this.done = this.phase.tasks.filter((task: any) => task.status === 'COMPLETED');
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