import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { SuperAdminComponent } from './super-admin.component';
import { SharedModule } from '../shared/shared.module';
import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard.component';
import { AgencesComponent } from './agences/agences.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgenceFormComponent } from './agence-form/agence-form.component';
import { AgencyDetailsComponent } from './agency-details/agency-details.component';
import { UserFormComponent } from './user-form/user-form.component';
@NgModule({
  declarations: [
    SuperAdminComponent,
    SuperAdminDashboardComponent,
    AgencesComponent,
    AgenceFormComponent,
    AgencyDetailsComponent,
    UserFormComponent,
   
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    SharedModule, 
    FormsModule, 
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,      
  ]                                   
})
export class SuperAdminModule { }
