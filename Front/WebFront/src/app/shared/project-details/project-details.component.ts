import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import * as bootstrap from 'bootstrap';
import { AddMemberComponent } from '../../add-member/add-member.component';
@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent {
  projectId: string | null = null;
  selectedTab: string = 'details';
  selectedPhase: any = null;
  project = {
    name: 'Projet Exemple',
    description: 'Description du projet',
    createdAt: '01/01/2025',
    progress: 60, 
    members: [
      { id: 1, name: "Alice", image: "assets/images/alice.jpg" },
      { id: 2, name: "Bob", image: "assets/images/bob.jpg" },
      { id: 3,name: "Charlie", image: "assets/images/charlie.jpg" }
    ],
    
    phases: [
      {
        name: 'Phase 1',
        description: 'Description de la phase 1',
        startDate: '01/01/2025',
        endDate: '01/03/2025',
        tasks: ['Tâche 1', 'Tâche 2'],
        members: [
          { id: 1,name: "Alice", image: "assets/images/alice.jpg" }
        ]
      },
      {
        name: 'Phase 2',
        description: 'Description de la phase 2',
        startDate: '02/03/2025',
        endDate: '01/06/2025',
        tasks: ['Tâche 3', 'Tâche 4'],
        members: [
          { name: "Bob", image: "assets/images/bob.jpg" }
        ]
      }
    ]
  };
  availableMembers: any[] = [];
  progressOffset: string = '';
  selectedMember: any = null;
  constructor(private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.calculateProgress();
  }
  

  // Fonction pour ajouter un membre à la phase
  
  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  calculateProgress() {
    const circumference = 2 * Math.PI * 40; // 40 = rayon du cercle
    this.progressOffset = ((100 - this.project.progress) / 100 * circumference).toString();
  }
  
  editPhase(phase: any) {
    console.log("Modifier la phase:", phase);
    // Ici, on peut ouvrir un modal pour modifier les détails
  }
  deletePhase(phase: any) {
    this.project.phases = this.project.phases.filter(p => p !== phase);
  }

  // ProjectDetailsComponent

// ProjectDetailsComponent

openMemberModal(phase: any): void {
  this.selectedPhase = phase;  // Sélectionner la phase
  this.availableMembers = this.project.members.filter(member => 
    !phase.members.some((phaseMember:any) => phaseMember.id === member.id)
  ); // Filtrer les membres déjà assignés à la phase

  // Ouvrir le modal avec les membres disponibles et la phase sélectionnée
  const dialogRef = this.dialog.open(AddMemberComponent, {
    data: { availableMembers: this.availableMembers, selectedPhase: this.selectedPhase }
  });

  // Quand un membre est ajouté dans le modal
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Mettre à jour la phase dans le projet avec le membre ajouté
      this.selectedPhase.members.push(result);
    }
  });
}

 
  
}