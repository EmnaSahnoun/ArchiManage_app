import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  viewMode: 'list' | 'card' = 'list'; // Default view mode is list
  projects: any[] = [];
  filteredProjects: any[] = [];
 
  constructor(private router: Router) { 
    this.currentDate = new Date().toLocaleDateString(); 
    this.projects = [
      {
        _id: '1',
        name: 'Projet 1',
        createdAt:'01/01/2025',
        startDate: '01/01/2025',
        endDate: '31/12/2025',
        progress: 50,
        status: 'En cours',
        members: [
          { name: 'John Doe', image: 'assets/member1.jpg' },
          { name: 'Jane Smith', image: 'assets/member2.jpg' }
        ],
        phases: ['Phase 1', 'Phase 2']
      },
      {
        _id: '2',
        name: 'Projet 2',
        createdAt:'01/01/2025',
        startDate: '01/02/2025',
        endDate: '30/06/2025',
        progress: 30,
        status: 'A venir',
        members: [
          { name: 'Alice Johnson', image: 'assets/member3.jpg' },
          { name: 'Bob Brown', image: 'assets/member4.jpg' }
        ],
        phases: ['Phase 1']
      },
      // Add more project objects here...
    ];
  }

  ngOnInit(): void {
    this.filteredProjects = this.projects; // Initially display all projects
  }

  // Toggle view mode
  toggleViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  // Filter projects based on search query
  getfilteredProjects(): any[] {
    if (!this.searchQuery) {
      return this.projects;
    }
    return this.projects.filter(project =>
      project.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  goToProjectDetails(project: any): void {
    this.router.navigate(['/project', project._id]);
  }
  // Add project action
  addProject(): void {
    alert('Ajouter un nouveau projet');
  }
}
