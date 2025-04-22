import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './shared/projects/projects.component';
import { ProjectDetailsComponent } from './shared/project-details/project-details.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { TasksComponent } from './shared/tasks/tasks.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  { path: 'dashboard', component: DashboardComponent , canActivate:[AuthGuard]},
  { path: 'projects', component: ProjectsComponent , canActivate:[AuthGuard]},
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
    loadChildren: () => import('./super-admin/super-admin.module').then(m => m.SuperAdminModule)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
