import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './shared/projects/projects.component';
import { ProjectDetailsComponent } from './shared/project-details/project-details.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { TasksComponent } from './shared/tasks/tasks.component';
import { UserFormComponent } from './super-admin/user-form/user-form.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  { path: 'dashboard',
    component: DashboardComponent , 
    canActivate:[AuthGuard],
    children: [
      {
        path: 'users/new',
        component: UserFormComponent,
        canActivate: [AuthGuard]
      }
      // Add other child routes if needed (e.g., 'users/:id/edit')
    ]
  
  },
  { path: 'projects', component: ProjectsComponent , canActivate:[AuthGuard]},
  { path: 'invitations', component: InvitationsComponent , canActivate:[AuthGuard]},
  { 
    path: 'project/:id', 
    component: ProjectDetailsComponent,
    canActivate:[AuthGuard]
  },
  { 
    path: 'project/:id/phase/:phaseId', 
    component: TasksComponent 
    , canActivate:[AuthGuard]
  },
  { 
    path: 'super-admin', 
    loadChildren: () => import('./super-admin/super-admin.module').then(m => m.SuperAdminModule),
    canActivate: [AuthGuard]
  },
  { path: 'invoices', component: InvoiceListComponent },
 // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  //{ path: '**', redirectTo: '/dashboard' } 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
