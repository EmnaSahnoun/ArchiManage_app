import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin.component';
import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard.component';
import { AgencesComponent } from './agences/agences.component';
import { AgencyDetailsComponent } from './agency-details/agency-details.component';
import { ProjectsComponent } from '../shared/projects/projects.component';

const routes: Routes = [
  { 
    path: '', 
    component: SuperAdminComponent,
    children: [
      { path: 'SuperAdmindashboard', component: SuperAdminDashboardComponent },
      { path: '', redirectTo: 'SuperAdmindashboard' , pathMatch: 'full' },
      { path: 'agences', component:AgencesComponent },
      { path: 'agences/:id', component: AgencyDetailsComponent},
      { path: 'projects', component: ProjectsComponent } ,

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }
