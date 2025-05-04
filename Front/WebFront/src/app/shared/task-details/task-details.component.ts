import { Component, Inject, Input, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'; // Importé pour contrôler le modal Ngb
import { ProjectService } from '../../services/ProjectService';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent implements OnInit {
  @Input() task: any;
  subtasks: any[] = [];
  isLoadingSubtasks = false;

  constructor(
    public activeModal: NgbActiveModal,
    private projectService:ProjectService
  ) {
    
  }

  ngOnInit(): void {
    console.log('Task details:', this.task);
    if (this.task?.subTaskIds?.length > 0) {
      this.getSubtasks(this.task.subTaskIds);
    }
    this.getSampleTask();
    if (!this.task.subtasks) {
      this.task.subtasks = [];
    }
    
    // If no attachments, initialize empty array
    if (!this.task.attachments) {
      this.task.attachments = [];
    }
    
    // If no activities, initialize empty array
    if (!this.task.activities) {
      this.task.activities = [];
    }
  }

  closeModal(): void {
    this.activeModal.close();
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
      ]
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
}
