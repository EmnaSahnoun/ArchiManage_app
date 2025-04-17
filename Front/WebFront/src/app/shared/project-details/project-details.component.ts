import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

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
    _id: '67c8306029b4bfa9328a19b4',
    name: 'Projet Exemple',
    description: 'Description du projet',
    createdAt: '2025-01-01T00:00:00.000Z',
    progress: 60,
    members: [
      { _id: '1', name: "Alice", image: "assets/images/alice.jpg" },
      { _id: '2', name: "Bob", image: "assets/images/bob.jpg" },
      { _id: '3', name: "Charlie", image: "assets/images/charlie.jpg" }
    ],
    phases: [
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
            status: "PENDING"
          }
        ],
        members: [{ _id: '1', name: "Alice", image: "assets/images/alice.jpg" }]
      },
      {
        _id: "67c852e7bae88e131703dd92",
        name: "Conception Détaillée",
        description: "Élaboration des plans détaillés.",
        startDate: "2025-02-15T00:00:00.000Z",
        endDate: "2025-03-20T00:00:00.000Z",
        tasks: [],
        members: [{ _id: '2', name: "Bob", image: "assets/images/bob.jpg" }]
      }
    ]
  };
  availableMembers: any[] = [];
  progressOffset: string = '';
  selectedMember: any = null;
  constructor(private route: ActivatedRoute, private dialog: MatDialog, private router:Router) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('_id');
    this.calculateProgress();
    this.formatDates();
  }
  private formatDates() {
    this.project.phases.forEach(phase => {
      phase.startDate = this.formatDate(phase.startDate);
      phase.endDate = this.formatDate(phase.endDate);
    });
    this.project.createdAt = this.formatDate(this.project.createdAt);
  }
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
 
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

openMemberModal(phase: any): void {
  this.selectedPhase = phase;  // Sélectionner la phase
  this.availableMembers = this.project.members.filter(member => 
    !phase.members.some((phaseMember:any) => phaseMember._id === member._id)
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

openTasks(phase: any): void {
  this.router.navigate(['project', this.project._id, 'phase', phase._id]);
}
}